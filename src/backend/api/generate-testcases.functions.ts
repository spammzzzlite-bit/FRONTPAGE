import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import process from "node:process";

import { getSupabaseAdmin } from "../supabase-admin.server";

const workerCaseSchema = z.object({
  title: z.string().optional(),
  priority: z.string().optional(),
  sourceType: z.string().optional(),
  steps: z.any().optional(),
  expectedResult: z.string().optional(),
  expected: z.string().optional(),
  automationCandidate: z.boolean().optional(),
});

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

function normalizeWorkerCases(rawCases: unknown, projectId: string, moduleName: string) {
  const parsed = z.array(workerCaseSchema).safeParse(rawCases);
  const cases = parsed.success ? parsed.data : [];

  return cases.map((testCase, index) => ({
    id: index,
    title: testCase.title || `Generated test case ${index + 1}`,
    steps: normalizeSteps(testCase.steps),
    expected: testCase.expectedResult || testCase.expected || "",
    priority: normalizePriority(testCase.priority),
    status: "passed" as const,
    module_name: moduleName,
    project_id: projectId,
    sourceType: testCase.sourceType || "recording_observed",
    automationCandidate: Boolean(testCase.automationCandidate),
  }));
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

    const payload = await response.json();

    if (payload.status !== "success") {
      return {
        success: false,
        status: payload.status || "error",
        error: payload.raw_output || payload.detail || "AI worker did not return valid test cases.",
        cases: [],
      };
    }

    const rawCases = payload.result?.testCases || payload.result?.test_cases || [];
    const cases = normalizeWorkerCases(rawCases, data.projectId, moduleName);

    return {
      success: true,
      status: "success",
      cases,
      raw: payload.result,
      sourceRecordingId: data.sourceRecordingId || "",
    };
  });
