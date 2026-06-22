import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import process from "node:process";

import { getSupabaseAdmin } from "../supabase-admin.server";

const generateInputSchema = z.object({
  accessToken: z.string().min(1),
  projectId: z.string().min(1),
  moduleName: z.string().optional(),
  featureDescription: z.string().optional(),
  prd: z.string().optional(),
  testPlan: z.string().optional(),
  journeyJson: z.any().optional(),
  sourceRecordingId: z.string().optional(),
});

function getWorkerConfig() {
  const workerUrl =
    process.env.QAMIND_AI_WORKER_URL ||
    process.env.VITE_QAMIND_AI_WORKER_URL ||
    "http://100.118.124.47:8000";

  const workerKey =
    process.env.QAMIND_AI_WORKER_KEY ||
    process.env.VITE_QAMIND_AI_WORKER_KEY ||
    "qamind-secret-123";

  return {
    endpoint: `${workerUrl.replace(/\/$/, "")}/generate-testcases`,
    workerKey,
  };
}

async function verifyUser(accessToken: string) {
  const adminClient = getSupabaseAdmin();
  const {
    data: { user },
    error,
  } = await adminClient.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return user;
}

function normalizePriority(value: unknown): "critical" | "high" | "medium" | "low" {
  const priority = String(value || "").toLowerCase();
  if (priority === "critical") return "critical";
  if (priority === "high") return "high";
  if (priority === "low") return "low";
  return "medium";
}

function normalizeSteps(steps: unknown): string {
  if (Array.isArray(steps)) {
    return steps
      .map((step, index) => {
        if (typeof step === "string") return `${index + 1}. ${step}`;
        if (step && typeof step === "object") {
          const item = step as Record<string, unknown>;
          const label = item.step || item.action || item.description || item.text || "";
          const value = item.value ? ` (${String(item.value)})` : "";
          return `${index + 1}. ${String(label || "Perform step")}${value}`;
        }
        return `${index + 1}. Perform step`;
      })
      .join("\n");
  }

  if (typeof steps === "string") return steps;
  return "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function extractRawCases(payload: Record<string, unknown>): unknown[] {
  const result = asRecord(payload.result);
  const candidates: unknown[] = [
    result?.testCases,
    result?.test_cases,
    result?.cases,
    result?.manual_test_cases,
    result?.manualTestCases,
    payload.testCases,
    payload.test_cases,
    payload.cases,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate;
    }
  }

  const scenarios = result?.scenarios ?? payload.scenarios;
  if (Array.isArray(scenarios)) {
    const nested = scenarios.flatMap((scenario) => {
      const item = asRecord(scenario);
      if (!item) return [];
      const cases = item.testCases ?? item.test_cases ?? item.cases;
      return Array.isArray(cases) ? cases : [scenario];
    });
    if (nested.length > 0) return nested;
  }

  if (typeof payload.raw_output === "string" && payload.raw_output.trim()) {
    try {
      const parsed = JSON.parse(payload.raw_output);
      if (Array.isArray(parsed)) return parsed;
      const parsedRecord = asRecord(parsed);
      if (parsedRecord) return extractRawCases(parsedRecord);
    } catch {
      // raw_output may be plain text from the model
    }
  }

  return [];
}

function normalizeWorkerCases(rawCases: unknown[], projectId: string, moduleName: string) {
  return rawCases
    .map((rawCase, index) => {
      const item = asRecord(rawCase);
      if (!item) return null;

      const title = String(
        item.title ||
          item.testCaseTitle ||
          item.test_case_title ||
          item.name ||
          item.summary ||
          `Generated test case ${index + 1}`,
      );
      const steps = item.steps ?? item.test_steps ?? item.testSteps ?? item.actions ?? item.procedure;
      const expected = String(
        item.expectedResult ??
          item.expected_result ??
          item.expected ??
          item.expectedOutcome ??
          item.expected_outcome ??
          "",
      );

      return {
        id: index,
        title,
        steps: normalizeSteps(steps),
        expected,
        priority: normalizePriority(item.priority ?? item.severity),
        status: "passed" as const,
        module_name: moduleName,
        project_id: projectId,
        sourceType: String(item.sourceType || item.source_type || "recording_observed"),
        automationCandidate: Boolean(item.automationCandidate ?? item.automation_candidate),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function workerSucceeded(payload: Record<string, unknown>): boolean {
  const status = String(payload.status || "").toLowerCase();
  if (status === "success" || status === "ok" || status === "completed") return true;
  if (payload.success === true) return true;
  return extractRawCases(payload).length > 0;
}

export const generateTestCasesWithAi = createServerFn({ method: "POST" })
  .inputValidator(generateInputSchema)
  .handler(async ({ data }) => {
    await verifyUser(data.accessToken);

    const { endpoint, workerKey } = getWorkerConfig();
    const moduleName = data.moduleName || "Recorded Journey";
    const journeyJson =
      data.journeyJson && typeof data.journeyJson === "object"
        ? data.journeyJson
        : {
            projectId: data.projectId,
            moduleName,
            featureDescription: data.featureDescription || "",
          };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-QAMIND-Internal-Key": workerKey,
      },
      body: JSON.stringify({
        prd: data.prd || data.featureDescription || "",
        test_plan: data.testPlan || "",
        journey_json: journeyJson,
      }),
      signal: AbortSignal.timeout(900_000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`AI worker failed (${response.status}): ${body || response.statusText}`);
    }

    const payload = (await response.json()) as Record<string, unknown>;

    if (!workerSucceeded(payload)) {
      const hint =
        typeof payload.raw_output === "string"
          ? payload.raw_output.slice(0, 280)
          : JSON.stringify(payload).slice(0, 280);
      return {
        success: false,
        status: String(payload.status || "error"),
        error:
          String(payload.detail || payload.error || "") ||
          "AI worker returned no test cases. Check Qwen output format.",
        cases: [],
        debug: hint,
      };
    }

    const rawCases = extractRawCases(payload);
    const cases = normalizeWorkerCases(rawCases, data.projectId, moduleName);

    if (cases.length === 0) {
      return {
        success: false,
        status: "empty",
        error:
          "AI worker responded OK but returned 0 parseable test cases. The response format may not match the app parser.",
        cases: [],
        debug: JSON.stringify(payload).slice(0, 500),
      };
    }

    return {
      success: true,
      status: "success",
      cases,
      raw: payload.result ?? payload,
      sourceRecordingId: data.sourceRecordingId || "",
    };
  });
