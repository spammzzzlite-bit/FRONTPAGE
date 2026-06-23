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

function stripMarkdownJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  return text.trim();
}

function tryParseJsonLoose(text: string): unknown | null {
  const cleaned = stripMarkdownJson(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // continue
      }
    }
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        // continue
      }
    }
    return null;
  }
}

function isCaseLike(record: Record<string, unknown>): boolean {
  const hasTitle = Boolean(
    record.title ||
      record.testCaseTitle ||
      record.test_case_title ||
      record.test_case_name ||
      record.name ||
      record.summary ||
      record.scenario_name ||
      record.scenarioName,
  );
  const hasBody = Boolean(
    record.steps ||
      record.test_steps ||
      record.testSteps ||
      record.actions ||
      record.procedure ||
      record.expected ||
      record.expectedResult ||
      record.expected_result,
  );
  return hasTitle || hasBody;
}

const CASE_ARRAY_KEYS = [
  "testCases",
  "test_cases",
  "cases",
  "manual_test_cases",
  "manualTestCases",
  "testcases",
  "generated_test_cases",
  "generatedTestCases",
  "qa_test_cases",
  "qaTestCases",
] as const;

const NESTED_TEXT_KEYS = [
  "raw_output",
  "rawOutput",
  "output",
  "content",
  "response",
  "text",
  "message",
  "answer",
] as const;

function collectRawCases(value: unknown, depth = 0): unknown[] {
  if (depth > 8) return [];

  if (typeof value === "string" && value.trim()) {
    const parsed = tryParseJsonLoose(value);
    return parsed ? collectRawCases(parsed, depth + 1) : [];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    if (value.some((item) => isCaseLike(asRecord(item) || {}))) return value;
    return value.flatMap((item) => collectRawCases(item, depth + 1));
  }

  const record = asRecord(value);
  if (!record) return [];

  for (const key of CASE_ARRAY_KEYS) {
    const candidate = record[key];
    if (Array.isArray(candidate) && candidate.length > 0) return candidate;
  }

  const scenarios = record.scenarios;
  if (Array.isArray(scenarios) && scenarios.length > 0) {
    const nested = scenarios.flatMap((scenario) => {
      const item = asRecord(scenario);
      if (!item) return [];
      for (const key of CASE_ARRAY_KEYS) {
        const cases = item[key];
        if (Array.isArray(cases) && cases.length > 0) return cases;
      }
      return isCaseLike(item) ? [item] : collectRawCases(item, depth + 1);
    });
    if (nested.length > 0) return nested;
  }

  for (const key of NESTED_TEXT_KEYS) {
    const nested = record[key];
    if (typeof nested === "string" && nested.trim()) {
      const cases = collectRawCases(nested, depth + 1);
      if (cases.length > 0) return cases;
    }
  }

  if (record.result) {
    const nested = collectRawCases(record.result, depth + 1);
    if (nested.length > 0) return nested;
  }

  if (record.data) {
    const nested = collectRawCases(record.data, depth + 1);
    if (nested.length > 0) return nested;
  }

  if (isCaseLike(record)) return [record];

  return [];
}

function extractRawCases(payload: Record<string, unknown>): unknown[] {
  return collectRawCases(payload);
}

function normalizeWorkerCases(rawCases: unknown[], projectId: string, moduleName: string) {
  return rawCases
    .flatMap((rawCase, index) => {
      if (typeof rawCase === "string" && rawCase.trim()) {
        const parsed = tryParseJsonLoose(rawCase);
        if (parsed) return normalizeWorkerCases([parsed], projectId, moduleName);
        return [
          {
            id: index,
            title: rawCase.slice(0, 120),
            steps: rawCase,
            expected: "",
            priority: "medium" as const,
            status: "passed" as const,
            module_name: moduleName,
            project_id: projectId,
            sourceType: "recording_observed",
            automationCandidate: false,
          },
        ];
      }

      const item = asRecord(rawCase);
      if (!item) return [];

      const title = String(
        item.title ||
          item.testCaseTitle ||
          item.test_case_title ||
          item.test_case_name ||
          item.scenario_name ||
          item.scenarioName ||
          item.name ||
          item.summary ||
          `Generated test case ${index + 1}`,
      );
      const steps =
        item.steps ??
        item.test_steps ??
        item.testSteps ??
        item.actions ??
        item.procedure ??
        item.description;
      const expected = String(
        item.expectedResult ??
          item.expected_result ??
          item.expected ??
          item.expectedOutcome ??
          item.expected_outcome ??
          item.expectedResults ??
          "",
      );

      if (!title && !steps && !expected) return [];

      return [
        {
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
        },
      ];
    })
    .filter((item) => item.title || item.steps || item.expected);
}

function workerSucceeded(payload: Record<string, unknown>): boolean {
  const status = String(payload.status || "").toLowerCase();
  if (status === "success" || status === "ok" || status === "completed") return true;
  if (payload.success === true) return true;
  return extractRawCases(payload).length > 0;
}

const TRACKING_HOST_FRAGMENTS = [
  "doubleclick",
  "google-analytics",
  "googletagmanager",
  "facebook",
  "hotjar",
  "creativecdn",
  "snapads",
  "clarity.ms",
  "newrelic",
  "segment",
  "sentry",
];

function isImportantNetworkObservation(item: Record<string, unknown>): boolean {
  const api = String(item.api || "").toLowerCase();
  const url = String(item.url || item.path || "").toLowerCase();
  if (TRACKING_HOST_FRAGMENTS.some((fragment) => url.includes(fragment))) return false;
  if (
    api.includes("api") ||
    api.includes("auth") ||
    api.includes("login") ||
    api.includes("registration") ||
    api.includes("verification") ||
    api.includes("password")
  ) {
    return true;
  }
  const method = String(item.method || "").toUpperCase();
  if (method && method !== "GET") return true;
  return /login|signin|signup|register|otp|verify|checkout|cart|payment|search|api/.test(url);
}

function sliceArray<T>(value: unknown, limit: number): T[] {
  return Array.isArray(value) ? (value as T[]).slice(0, limit) : [];
}

/**
 * Heavy sites (Flipkart, Snapdeal, portals) produce large recordings.
 * Shrink the payload before sending to the local Qwen worker so it stays
 * within context limits and returns structured testCases.
 */
function compactJourneyForWorker(journeyJson: unknown): Record<string, unknown> {
  const root = asRecord(journeyJson);
  if (!root) {
    return { moduleName: "Recorded Journey" };
  }

  const qwen = asRecord(root.qwenPayload) || root;
  const journey = sliceArray<Record<string, unknown>>(qwen.processedUserJourney, 80);
  const network = sliceArray<Record<string, unknown>>(qwen.networkObservations, 80)
    .filter((item) => isImportantNetworkObservation(item))
    .slice(0, 20);

  const stats = asRecord(qwen.recordingMetadata)?.stats || asRecord(root.stats);
  const totalEvents =
    typeof stats?.totalEvents === "number" ? stats.totalEvents : journey.length + network.length;

  return {
    instruction: qwen.instruction,
    productContext: qwen.productContext || {
      projectId: root.projectId,
      module: root.moduleName,
      userGoal: root.featureDescription,
    },
    recordingMetadata: {
      ...(asRecord(qwen.recordingMetadata) || {}),
      stats: {
        ...(asRecord(stats) || {}),
        totalEvents,
        compacted: true,
        sentToWorker: {
          journeySteps: journey.length,
          networkObservations: network.length,
        },
      },
    },
    processedUserJourney: journey,
    pageContextSummary: sliceArray(qwen.pageContextSummary, 10),
    observedUiElements: sliceArray(qwen.observedUiElements, 50),
    navigationFlow: sliceArray(qwen.navigationFlow, 30),
    networkObservations: network,
    validationMessages: sliceArray(qwen.validationMessages, 20),
    missingInformation: sliceArray(qwen.missingInformation, 8),
    compactedForWorker: true,
  };
}

export const generateTestCasesWithAi = createServerFn({ method: "POST" })
  .inputValidator(generateInputSchema)
  .handler(async ({ data }) => {
    await verifyUser(data.accessToken);

    const { endpoint, workerKey } = getWorkerConfig();
    const moduleName = data.moduleName || "Recorded Journey";
    const rawJourney =
      data.journeyJson && typeof data.journeyJson === "object"
        ? data.journeyJson
        : {
            projectId: data.projectId,
            moduleName,
            featureDescription: data.featureDescription || "",
          };
    const journeyJson = compactJourneyForWorker(rawJourney);

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
