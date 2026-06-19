import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import {
  History,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  Play,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import {
  useRuns,
  useProjects,
  useTestCases,
  useSuites,
  createMockRun,
  deductTokenAction,
  createBug,
  useBugs,
  type TestRun,
  type TestRunResult,
} from "@/frontend/store/store";
import { usePanel } from "@/frontend/components/PanelContext";
import { EmptyState } from "@/frontend/components/EmptyState";
import { PageHeader, Modal } from "./_app.projects";
import { toast } from "./_app";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/frontend/components/ui/tooltip";
import { supabase } from "@/backend/supabase";
import { useAssertPermission, TokenCostLabel } from "@/lib/permissions";

const searchSchema = z.object({
  projectId: z.string().optional(),
});

export const Route = createFileRoute("/_app/runs")({
  head: () => ({ meta: [{ title: "Test Runs — QAMind AI" }] }),
  validateSearch: searchSchema,
  component: RunsPage,
});

const FILTERS = ["All", "Passed", "Failed", "Running"] as const;

/* ─── Helpers ──────────────────────────────────────────────── */

function getMockLogsAndOutputs(
  tcTitle: string,
  status: "passed" | "failed" | "skipped",
  expected: string,
) {
  const timestamp = new Date().toISOString();

  if (status === "passed") {
    return {
      expected: expected || "Condition matches expected UI state.",
      actual: expected || "Condition matches expected UI state.",
      logs: `
[INFO] [${timestamp}] Starting Playwright browser context...
[INFO] [${timestamp}] Navigating to test page...
[DEBUG] [${timestamp}] Waiting for selector: text="${tcTitle}"
[INFO] [${timestamp}] Element found. Performing action sequence...
[DEBUG] [${timestamp}] Asserting expectation: ${expected || "Successful validation"}
[INFO] [${timestamp}] Assertion passed successfully.
[INFO] [${timestamp}] Closing browser context. Test execution completed.
      `.trim(),
    };
  } else if (status === "failed") {
    return {
      expected: expected || "Condition matches expected UI state.",
      actual: "Timeout Error: Target element not found or assertion mismatch.",
      logs: `
[INFO] [${timestamp}] Starting Playwright browser context...
[INFO] [${timestamp}] Navigating to test page...
[DEBUG] [${timestamp}] Waiting for selector: text="${tcTitle}"
[WARNING] [${timestamp}] Slow network response detected. Retrying selector query...
[ERROR] [${timestamp}] playwright-runner failed to find locator or DOM node for element matching expected criteria
[ERROR] [${timestamp}] Expectation failed: expected "${expected || "Success"}" but received null

[STACK TRACE]
Error: expect(received).toBe(expected) // Object.is equality
Expected: "${expected || "Success"}"
Received: null
    at PlaywrightRunner.runTestCase (playwright-runner.ts:42:24)
    at async TestSandbox.evaluate (test-sandbox.ts:18:9)
    at async startExecution (sandbox-api.ts:114:7)
      `.trim(),
    };
  } else {
    return {
      expected: expected || "Condition matches expected UI state.",
      actual: "Execution skipped.",
      logs: `
[INFO] [${timestamp}] Test execution skipped.
      `.trim(),
    };
  }
}

/* ─── RunsPage Component ───────────────────────────────────── */

function RunsPage() {
  const assertPerm = useAssertPermission();
  const { projectId } = Route.useSearch();
  const [runs] = useRuns();
  const [projects] = useProjects();
  const [testCases] = useTestCases();
  const [suites] = useSuites();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const { openPanel } = usePanel();
  const [showNewRunModal, setShowNewRunModal] = useState(false);

  // Selector and dashboard states
  const [selectedProjId, setSelectedProjId] = useState(projectId || projects[0]?.id || "");
  const [scopeType, setScopeType] = useState<"all" | "suites" | "testcases">("all");
  const [selectedSuiteIds, setSelectedSuiteIds] = useState<string[]>([]);
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<string[]>([]);
  const [latestRun, setLatestRun] = useState<TestRun | null>(null);

  // Expanded accordion keys
  const [expandedCaseIds, setExpandedCaseIds] = useState<Set<string>>(new Set());

  // Record as bug states
  const [bugStates, setBugStates] = useState<Record<string, "idle" | "recording" | "recorded">>({});

  // Sync route search params to state
  useEffect(() => {
    if (projectId) {
      setSelectedProjId(projectId);
    }
  }, [projectId]);

  // Reset checkboxes when project changes
  useEffect(() => {
    setSelectedSuiteIds([]);
    setSelectedTestCaseIds([]);
  }, [selectedProjId]);

  const activeProject = projects.find((p) => p.id === selectedProjId) || projects[0];
  const projectRuns = runs.filter((r) => (activeProject ? r.projectId === activeProject.id : true));

  const filteredRuns =
    filter === "All" ? projectRuns : projectRuns.filter((r) => r.status === filter.toLowerCase());

  const projectSuites = suites.filter((s) => s.projectId === selectedProjId);
  const suiteIdsSet = new Set(projectSuites.map((s) => s.id));
  const projectTestCases = testCases.filter((tc) => suiteIdsSet.has(tc.suiteId));

  // Count helper functions
  const getSuiteCaseCount = (suiteId: string) => {
    return testCases.filter((tc) => tc.suiteId === suiteId).length;
  };

  let testsToRunCount = 0;
  if (scopeType === "all") {
    testsToRunCount = projectTestCases.length;
  } else if (scopeType === "suites") {
    testsToRunCount = projectTestCases.filter((tc) => selectedSuiteIds.includes(tc.suiteId)).length;
  } else if (scopeType === "testcases") {
    testsToRunCount = selectedTestCaseIds.length;
  }

  const handleInlineStartRun = () => {
    if (!selectedProjId) return;
    if (!assertPerm("tests:run")) return;
    if (!deductTokenAction(`Execute test run`)) return;

    let run;
    if (scopeType === "all") {
      run = createMockRun(selectedProjId);
    } else if (scopeType === "suites") {
      run = createMockRun(selectedProjId, { suiteIds: selectedSuiteIds });
    } else {
      run = createMockRun(selectedProjId, { testCaseIds: selectedTestCaseIds });
    }

    setLatestRun(run);
    setExpandedCaseIds(new Set());
    setBugStates({});
    toast.success(`Execution completed: ${run.id} finished successfully!`);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          section="§ Runs"
          title="Test runs"
          subtitle={
            activeProject
              ? `A ledger of every execution for ${activeProject.name}.`
              : "A ledger of every execution."
          }
          action={
            <button
              onClick={() => setShowNewRunModal(true)}
              className="rounded-sm bg-foreground px-4 py-2 text-sm text-background hover:bg-accent transition-colors"
            >
              <Play className="mr-1.5 inline h-3.5 w-3.5" /> New run
            </button>
          }
        />

        {/* Hierarchical Execution Selector Card */}
        <div className="rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-5 space-y-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between border-b border-[var(--c-border)] pb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--c-accent)]">
              ⚡ Hierarchical Execution Selector
            </span>
            <span className="text-[10px] text-[var(--c-text-muted)] font-mono">
              Ready to configure execution
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Project Selection */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                Project
              </label>
              <select
                value={selectedProjId}
                onChange={(e) => setSelectedProjId(e.target.value)}
                className="w-full rounded-[8px] border border-[var(--c-border)] bg-[var(--c-bg-input)] p-3 text-[13.5px] outline-none transition-all duration-[var(--t-fast)] focus:border-[var(--c-accent)] focus:shadow-[0_0_0_3px_var(--c-accent-soft)] bg-background text-[var(--c-text)]"
              >
                <option value="" disabled>
                  Select a project...
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Scope Selection */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                Scope of Execution
              </label>
              <div className="flex gap-2">
                {(["all", "suites", "testcases"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setScopeType(type)}
                    className={`flex-1 rounded-[6px] border py-2 text-xs font-mono capitalize transition-all ${
                      scopeType === type
                        ? "border-[var(--c-accent)] bg-[var(--c-accent-soft)]/10 text-[var(--c-accent)] font-semibold"
                        : "border-[var(--c-border)] hover:bg-[var(--c-bg-hover)] bg-background text-[var(--c-text)]"
                    }`}
                  >
                    {type === "all"
                      ? "Entire Project"
                      : type === "suites"
                        ? "Test Suites"
                        : "Individual Cases"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scope selection details */}
          {selectedProjId && (
            <div className="border-t border-[var(--c-border)] pt-4">
              {scopeType === "all" && (
                <p className="text-[13px] text-[var(--c-text-muted)] font-mono">
                  ✓ Configured to run all {projectTestCases.length} test cases in this project.
                </p>
              )}

              {scopeType === "suites" && (
                <div className="space-y-2">
                  <p className="text-[11px] font-mono text-[var(--c-text-muted)] uppercase tracking-wider">
                    Select Suites:
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {projectSuites.map((s) => {
                      const count = getSuiteCaseCount(s.id);
                      const isChecked = selectedSuiteIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className={`flex items-center justify-between rounded-[6px] border p-2.5 cursor-pointer text-xs transition-all ${
                            isChecked
                              ? "border-[var(--c-accent)] bg-[var(--c-accent-soft)]/10 text-[var(--c-accent)]"
                              : "border-[var(--c-border)] hover:bg-[var(--c-bg-hover)] bg-background"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSuiteIds([...selectedSuiteIds, s.id]);
                                } else {
                                  setSelectedSuiteIds(selectedSuiteIds.filter((id) => id !== s.id));
                                }
                              }}
                              className="accent-[var(--c-accent)]"
                            />
                            <span className="font-semibold">{s.name}</span>
                          </div>
                          <span className="font-mono text-[var(--c-text-muted)]">
                            {count} cases
                          </span>
                        </label>
                      );
                    })}
                    {projectSuites.length === 0 && (
                      <p className="text-xs text-[var(--c-text-muted)] col-span-2 py-2 text-center">
                        No suites found in this project.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {scopeType === "testcases" && (
                <div className="space-y-2">
                  <p className="text-[11px] font-mono text-[var(--c-text-muted)] uppercase tracking-wider">
                    Select Individual Cases:
                  </p>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {projectSuites.map((suite) => {
                      const suiteTests = projectTestCases.filter((tc) => tc.suiteId === suite.id);
                      if (suiteTests.length === 0) return null;
                      return (
                        <div
                          key={suite.id}
                          className="space-y-1 bg-[var(--c-bg-hover)]/30 border border-[var(--c-border)] rounded-[8px] p-3"
                        >
                          <p className="font-mono text-[10px] text-[var(--c-accent)] uppercase tracking-wide border-b border-[var(--c-border)] pb-1.5 mb-2">
                            {suite.name}
                          </p>
                          <div className="grid md:grid-cols-2 gap-2">
                            {suiteTests.map((tc) => {
                              const isChecked = selectedTestCaseIds.includes(tc.id);
                              return (
                                <label
                                  key={tc.id}
                                  className={`flex items-center justify-between rounded-[6px] border p-2 cursor-pointer text-[12px] transition-all ${
                                    isChecked
                                      ? "border-[var(--c-accent)] bg-[var(--c-accent-soft)]/5 text-[var(--c-accent)]"
                                      : "border-[var(--c-border)] hover:bg-[var(--c-bg-hover)] bg-[var(--c-bg-card)] text-[var(--c-text)]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedTestCaseIds([...selectedTestCaseIds, tc.id]);
                                        } else {
                                          setSelectedTestCaseIds(
                                            selectedTestCaseIds.filter((id) => id !== tc.id),
                                          );
                                        }
                                      }}
                                      className="accent-[var(--c-accent)]"
                                    />
                                    <span className="truncate">{tc.title}</span>
                                  </div>
                                  <span
                                    className={`rounded-sm px-1.5 py-0.2 font-mono text-[9px] badge-${tc.priority} shrink-0`}
                                  >
                                    {tc.priority}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {projectTestCases.length === 0 && (
                      <p className="text-xs text-[var(--c-text-muted)] py-2 text-center">
                        No test cases found in this project.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trigger execution */}
          <div className="flex items-center justify-between border-t border-[var(--c-border)] pt-4">
            <span className="font-mono text-xs text-[var(--c-text-muted)]">
              Tests selected: <strong className="text-[var(--c-text)]">{testsToRunCount}</strong>
            </span>
            <button
              onClick={handleInlineStartRun}
              disabled={testsToRunCount === 0 || !selectedProjId}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[var(--c-accent)] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[var(--c-accent-dark)] disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--c-accent)]"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <TokenCostLabel baseText="Execute Test Run" />
            </button>
          </div>
        </div>

        {/* Execution Results Dashboard */}
        {latestRun && (
          <div className="rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-5 space-y-4 shadow-[var(--shadow-md)] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-[var(--c-border)] pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[var(--c-accent)] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse-slow">
                  <span className="h-2 w-2 rounded-full bg-[var(--c-accent)] animate-ping" />⚡
                  Execution Results Dashboard
                </span>
                <span className="text-xs text-[var(--c-text-muted)]">—</span>
                <span className="font-mono text-xs font-semibold">{latestRun.id}</span>
              </div>
              <span
                className={`inline-flex rounded-sm px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white ${
                  latestRun.status === "passed" ? "bg-[var(--c-pass)]" : "bg-[var(--c-fail)]"
                }`}
              >
                {latestRun.status === "passed" ? "✓ PASSED" : "✕ FAILED"}
              </span>
            </div>

            {/* Quick Stats Panel */}
            <div className="grid grid-cols-4 gap-3 border-b border-[var(--c-border)] pb-4">
              <MiniStat label="TOTAL CASES" value={String(latestRun.results.length)} />
              <MiniStat
                label="PASSED"
                value={String(latestRun.results.filter((r) => r.status === "passed").length)}
                className="text-sage"
              />
              <MiniStat
                label="FAILED"
                value={String(latestRun.results.filter((r) => r.status === "failed").length)}
                className="text-rust"
              />
              <MiniStat label="DURATION" value={`${(latestRun.duration / 1000).toFixed(1)}s`} />
            </div>

            {/* Executed test cases accordion list */}
            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--c-text-muted)]">
                Executed Test Cases
              </p>

              <div className="space-y-3">
                {latestRun.results.map((result, idx) => {
                  const tc = testCases.find((c) => c.id === result.testCaseId);
                  if (!tc) return null;

                  const isExpanded = expandedCaseIds.has(tc.id);
                  const bugState = bugStates[tc.id] || "idle";
                  const mockData = getMockLogsAndOutputs(tc.title, result.status, tc.expected);

                  const toggleExpand = () => {
                    setExpandedCaseIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(tc.id)) {
                        next.delete(tc.id);
                      } else {
                        next.add(tc.id);
                      }
                      return next;
                    });
                  };

                  const handleRecordAsBug = async () => {
                    setBugStates((prev) => ({ ...prev, [tc.id]: "recording" }));

                    const generatedSnippet = `test('${tc.title}', async ({ page }) => {\n  ${tc.steps
                      .split("\n")
                      .map((s) => `// ${s}`)
                      .join("\n  ")}\n  // Expected: ${tc.expected}\n});`;

                    createBug({
                      project_id: selectedProjId,
                      test_case_title: tc.title,
                      error_message: mockData.logs,
                      code_snippet: generatedSnippet,
                    });

                    try {
                      const { error } = await supabase.from("bugs").insert({
                        project_id: selectedProjId,
                        test_case_title: tc.title,
                        error_message: mockData.logs,
                        code_snippet: generatedSnippet,
                        is_resolved: false,
                      });

                      if (error) {
                        console.warn("Supabase insert bug error:", error);
                      }
                    } catch (err) {
                      console.warn("Supabase insert bug exception:", err);
                    }

                    setBugStates((prev) => ({ ...prev, [tc.id]: "recorded" }));
                    toast.success(`Bug recorded successfully for test: "${tc.title}"`);
                  };

                  return (
                    <div
                      key={tc.id}
                      className={`rounded-[12px] border bg-[var(--c-bg-card)] overflow-hidden transition-all duration-[var(--t-normal)] ${
                        result.status === "passed"
                          ? "border-l-[3px] border-l-[var(--c-pass)]"
                          : result.status === "failed"
                            ? "border-l-[3px] border-l-[var(--c-fail)]"
                            : "border-l-[3px] border-l-[var(--c-text-muted)]"
                      }`}
                    >
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={toggleExpand}
                        className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-[var(--c-bg-hover)] transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`inline-flex rounded-sm px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white ${
                              result.status === "passed"
                                ? "bg-[var(--c-pass)]"
                                : result.status === "failed"
                                  ? "bg-[var(--c-fail)]"
                                  : "bg-[var(--c-text-muted)]"
                            }`}
                          >
                            {result.status}
                          </span>
                          <h4 className="text-[13.5px] font-semibold truncate text-[var(--c-text)]">
                            {tc.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono text-[10px] text-[var(--c-text-muted)]">
                            ⏱ {(result.duration / 1000).toFixed(2)}s
                          </span>
                          <span className="font-mono text-[10px] text-[var(--c-text-muted)]">
                            •
                          </span>
                          <span className="font-mono text-[10px] text-[var(--c-text-muted)]">
                            {new Date(latestRun.startedAt).toLocaleTimeString()}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-[var(--c-text-muted)]" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-[var(--c-text-muted)]" />
                          )}
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="border-t border-[var(--c-border)] p-4 space-y-4 bg-[var(--c-bg-hover)]/20 animate-in fade-in duration-300">
                          {/* Expected vs Actual */}
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-[8px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-3 space-y-1">
                              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                                Expected Output
                              </span>
                              <p className="text-[13px] leading-relaxed text-[var(--c-text)]">
                                {mockData.expected}
                              </p>
                            </div>
                            <div
                              className={`rounded-[8px] border p-3 space-y-1 ${
                                result.status === "passed"
                                  ? "border-[var(--c-pass-soft)] bg-[var(--c-pass-soft)]/5"
                                  : result.status === "failed"
                                    ? "border-[var(--c-fail-soft)] bg-[var(--c-fail-soft)]/5"
                                    : "border-[var(--c-border)] bg-[var(--c-bg-card)]"
                              }`}
                            >
                              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                                Actual Output
                              </span>
                              <p
                                className={`text-[13px] leading-relaxed ${
                                  result.status === "passed"
                                    ? "text-[var(--c-pass)]"
                                    : result.status === "failed"
                                      ? "text-[var(--c-fail)]"
                                      : "text-[var(--c-text)]"
                                }`}
                              >
                                {mockData.actual}
                              </p>
                            </div>
                          </div>

                          {/* Raw Console Logs */}
                          <div className="space-y-1.5">
                            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--c-text-muted)]">
                              Raw Execution Logs
                            </span>
                            <div className="bg-black border border-[#2C2825] font-mono text-[11px] p-3 text-green-400 max-h-[160px] overflow-y-auto rounded-md whitespace-pre-wrap leading-relaxed shadow-inner">
                              {mockData.logs}
                            </div>
                          </div>

                          {/* Bug Reporting Action */}
                          {result.status === "failed" && (
                            <div className="flex justify-end pt-2">
                              {bugState === "idle" ? (
                                <button
                                  type="button"
                                  onClick={handleRecordAsBug}
                                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--c-fail)] bg-[var(--c-fail)]/10 px-4 py-2 text-xs font-semibold text-[var(--c-fail)] hover:bg-[var(--c-fail)] hover:text-white transition-all transform active:scale-95 duration-200 cursor-pointer"
                                >
                                  ⚠️ Record as Bug
                                </button>
                              ) : bugState === "recording" ? (
                                <button
                                  disabled
                                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--c-border)] bg-[var(--c-bg-hover)] px-4 py-2 text-xs font-semibold text-[var(--c-text-muted)] cursor-not-allowed"
                                >
                                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--c-text-muted)] border-t-transparent" />
                                  Recording Bug...
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--c-pass-soft)] bg-[var(--c-pass-soft)]/20 px-4 py-2 text-xs font-semibold text-[var(--c-pass)] cursor-not-allowed"
                                >
                                  <Check className="h-3.5 w-3.5 text-[var(--c-pass)]" />
                                  Bug Recorded
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Ledger Filter Tabs */}
        <div className="space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--c-text-muted)]">
            Historical Executions Ledger
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${filter === f ? "border-foreground bg-foreground text-background font-semibold" : "border-border hover:border-foreground bg-[var(--c-bg-card)] text-[var(--c-text-muted)]"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredRuns.length === 0 ? (
          <div className="border border-border bg-card">
            <div className="grid grid-cols-[80px_1fr_100px_120px_100px_120px] gap-4 border-b border-border bg-muted/40 px-5 py-3 label-eyebrow">
              <span>Run ID</span>
              <span>Project</span>
              <span>Status</span>
              <span>Started</span>
              <span>Duration</span>
              <span>Results</span>
            </div>
            <EmptyState
              icon={History}
              title="No test runs yet"
              body="When you run a suite, it'll appear here as a row in the ledger."
              cta={{ label: "Run now", onClick: () => setShowNewRunModal(true) }}
            />
          </div>
        ) : (
          <div className="border border-border bg-card">
            {/* Table header */}
            <div className="grid grid-cols-[80px_1fr_100px_120px_100px_120px] gap-4 border-b border-border bg-muted/40 px-5 py-3 label-eyebrow">
              <span>Run ID</span>
              <span>Project</span>
              <span>Status</span>
              <span>Started</span>
              <span>Duration</span>
              <span>Results</span>
            </div>
            {/* Rows */}
            {filteredRuns.map((run, i) => {
              const passed = run.results.filter((r) => r.status === "passed").length;
              const failed = run.results.filter((r) => r.status === "failed").length;
              const skipped = run.results.filter((r) => r.status === "skipped").length;

              return (
                <button
                  key={run.id}
                  onClick={() =>
                    openPanel(<RunDetail run={run} />, [{ label: "Test Runs" }, { label: run.id }])
                  }
                  className={`stagger-item grid w-full grid-cols-[80px_1fr_100px_120px_100px_120px] gap-4 px-5 py-3.5 text-left text-sm hover:bg-muted/40 transition-colors ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <span className="font-mono text-xs">{run.id}</span>
                  <span className="truncate">{run.projectName || "—"}</span>
                  <span
                    className={`inline-flex w-fit rounded-sm px-2 py-0.5 font-mono text-[10px] status-${run.status}`}
                  >
                    {run.status}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(run.startedAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {(run.duration / 1000).toFixed(1)}s
                  </span>
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1 font-mono text-xs cursor-help hover:opacity-80 transition-opacity">
                          <span className="text-sage">{passed}</span>/
                          <span className="text-rust">{failed}</span>/
                          <span className="text-muted-foreground">{skipped}</span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[var(--c-bg-card)] border border-[var(--c-border-strong)] text-[var(--c-text)] px-3 py-2 shadow-md rounded-[6px] font-sans">
                        <div className="flex flex-col gap-1.5 text-[11px] font-mono leading-none">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px]">✅</span>
                            <span className="text-[var(--c-text)] font-semibold">
                              {passed} passed
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px]">❌</span>
                            <span className="text-[var(--c-text)] font-semibold">
                              {failed} failed
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px]">⏭</span>
                            <span className="text-[var(--c-text)] font-semibold">
                              {skipped} skipped
                            </span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <NewRunSelectionModal
          open={showNewRunModal}
          onClose={() => setShowNewRunModal(false)}
          onRunComplete={(run) => {
            setLatestRun(run);
            setExpandedCaseIds(new Set());
            setBugStates({});
          }}
        />
      </div>
    </TooltipProvider>
  );
}

/* ─── Run Detail (panel) ────────────────────────────────── */

function RunDetail({ run }: { run: TestRun }) {
  const assertPerm = useAssertPermission();
  const [testCases] = useTestCases();
  const passed = run.results.filter((r) => r.status === "passed").length;
  const failed = run.results.filter((r) => r.status === "failed").length;
  const skipped = run.results.filter((r) => r.status === "skipped").length;

  return (
    <div className="space-y-5">
      <div>
        <p className="label-eyebrow text-accent">§ Test Run</p>
        <h2 className="mt-1 font-display text-3xl">{run.id}</h2>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          {run.projectName} {run.suiteName ? `· ${run.suiteName}` : ""} ·{" "}
          {new Date(run.startedAt).toLocaleString()}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        <MiniStat label="Total" value={String(run.results.length)} />
        <MiniStat label="Passed" value={String(passed)} className="text-sage" />
        <MiniStat label="Failed" value={String(failed)} className="text-rust" />
        <MiniStat label="Skipped" value={String(skipped)} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-sm px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider status-${run.status}`}
          >
            {run.status}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            Duration: {(run.duration / 1000).toFixed(1)}s
          </span>
          {run.environment && (
            <span className="rounded-sm bg-[var(--c-bg-hover)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--c-text-muted)]">
              {run.environment}
            </span>
          )}
        </div>
        {failed > 0 && (
          <button
            onClick={() => {
              if (!assertPerm("tests:run")) return;
              const failedIds = run.results
                .filter((r) => r.status === "failed")
                .map((r) => r.testCaseId);
              if (!deductTokenAction(`Re-run ${failedIds.length} failed tests`)) return;
              const newRun = createMockRun(run.projectId, {
                testCaseIds: failedIds,
                environment: run.environment,
              });
              toast.success(
                `Re-run complete: ${newRun.results.filter((r) => r.status === "passed").length}/${failedIds.length} passed`,
              );
            }}
            className="flex items-center gap-2 rounded-md bg-[var(--c-bg-hover)] px-3 py-1.5 text-xs font-medium text-[var(--c-text)] transition-all hover:bg-[var(--c-border)]"
          >
            <RefreshCw className="h-3.5 w-3.5" /> <TokenCostLabel baseText="Re-run Failed" />
          </button>
        )}
      </div>

      {/* Per-test results */}
      <div>
        <p className="label-eyebrow mb-3">Test Results</p>
        <div className="border border-border bg-background">
          {run.results.map((result, i) => {
            const tc = testCases.find((c) => c.id === result.testCaseId);
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}
              >
                {result.status === "passed" ? (
                  <CheckCircle2 className="h-4 w-4 text-sage shrink-0" />
                ) : result.status === "failed" ? (
                  <XCircle className="h-4 w-4 text-rust shrink-0" />
                ) : (
                  <MinusCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{tc?.title || `Test ${i + 1}`}</p>
                  {result.error && (
                    <p className="mt-0.5 font-mono text-[10px] text-rust">{result.error}</p>
                  )}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                  {(result.duration / 1000).toFixed(1)}s
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="border border-border bg-muted/20 p-3 text-center">
      <p className={`font-display text-2xl ${className}`}>{value}</p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function NewRunSelectionModal({
  open,
  onClose,
  onRunComplete,
}: {
  open: boolean;
  onClose: () => void;
  onRunComplete?: (run: TestRun) => void;
}) {
  const assertPerm = useAssertPermission();
  const [projects] = useProjects();
  const [suites] = useSuites();
  const [testCases] = useTestCases();

  const [step, setStep] = useState(1);
  const [selectedProjId, setSelectedProjId] = useState("");
  const [scopeType, setScopeType] = useState<"all" | "suites" | "testcases">("all");
  const [selectedSuiteIds, setSelectedSuiteIds] = useState<string[]>([]);
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<string[]>([]);
  const [environment, setEnvironment] = useState<string>("localhost");

  // Reset state when modal closes/opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedProjId(projects[0]?.id || "");
      setScopeType("all");
      setSelectedSuiteIds([]);
      setSelectedTestCaseIds([]);
    }
  }, [open, projects]);

  if (!open) return null;

  const activeProject = projects.find((p) => p.id === selectedProjId);
  const projectSuites = suites.filter((s) => s.projectId === selectedProjId);
  const suiteIdsSet = new Set(projectSuites.map((s) => s.id));
  const projectTestCases = testCases.filter((tc) => suiteIdsSet.has(tc.suiteId));

  // Count tests in a project
  const getProjectCaseCount = (projId: string) => {
    const sIds = new Set(suites.filter((s) => s.projectId === projId).map((s) => s.id));
    return testCases.filter((tc) => sIds.has(tc.suiteId)).length;
  };

  // Count tests in a suite
  const getSuiteCaseCount = (suiteId: string) => {
    return testCases.filter((tc) => tc.suiteId === suiteId).length;
  };

  // Step validation
  const isStep1Valid = selectedProjId !== "";
  const isStep2Valid =
    scopeType === "all" ||
    (scopeType === "suites" && selectedSuiteIds.length > 0) ||
    (scopeType === "testcases" && selectedTestCaseIds.length > 0);

  // Calculate total tests to run based on current scope selection
  let testsToRunCount = 0;
  if (scopeType === "all") {
    testsToRunCount = projectTestCases.length;
  } else if (scopeType === "suites") {
    testsToRunCount = projectTestCases.filter((tc) => selectedSuiteIds.includes(tc.suiteId)).length;
  } else if (scopeType === "testcases") {
    testsToRunCount = selectedTestCaseIds.length;
  }

  const handleStartRun = () => {
    if (!selectedProjId) return;
    if (!assertPerm("tests:run")) return;
    if (!deductTokenAction(`Start test run for project`)) return;

    let run;
    if (scopeType === "all") {
      run = createMockRun(selectedProjId, { environment });
    } else if (scopeType === "suites") {
      run = createMockRun(selectedProjId, { suiteIds: selectedSuiteIds, environment });
    } else {
      run = createMockRun(selectedProjId, { testCaseIds: selectedTestCaseIds, environment });
    }

    toast.success(
      `Run ${run.id} completed — ${run.results.filter((r) => r.status === "passed").length}/${run.results.length} passed`,
    );
    if (onRunComplete) {
      onRunComplete(run);
    }
    onClose();
  };

  return (
    <Modal title="Configure new run" onClose={onClose}>
      <div className="space-y-6">
        {/* Step Indicators */}
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${step >= 1 ? "bg-[var(--c-accent)] text-white" : "bg-[var(--c-bg-hover)] text-[var(--c-text-muted)]"}`}
            >
              1
            </span>
            <span
              className={`text-xs font-medium ${step === 1 ? "text-[var(--c-text)]" : "text-[var(--c-text-muted)]"}`}
            >
              Project
            </span>
          </div>
          <div className="h-px flex-1 bg-[var(--c-border)] mx-3" />
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${step >= 2 ? "bg-[var(--c-accent)] text-white" : "bg-[var(--c-bg-hover)] text-[var(--c-text-muted)]"}`}
            >
              2
            </span>
            <span
              className={`text-xs font-medium ${step === 2 ? "text-[var(--c-text)]" : "text-[var(--c-text-muted)]"}`}
            >
              Scope
            </span>
          </div>
          <div className="h-px flex-1 bg-[var(--c-border)] mx-3" />
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${step >= 3 ? "bg-[var(--c-accent)] text-white" : "bg-[var(--c-bg-hover)] text-[var(--c-text-muted)]"}`}
            >
              3
            </span>
            <span
              className={`text-xs font-medium ${step === 3 ? "text-[var(--c-text)]" : "text-[var(--c-text-muted)]"}`}
            >
              Summary
            </span>
          </div>
        </div>

        {/* Wizard Content */}
        <div className="min-h-[220px] max-h-[40vh] overflow-y-auto pr-1">
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-[13px] text-[var(--c-text-muted)]">
                Select a project to run test cases from:
              </p>
              <div className="space-y-2">
                {projects.map((p) => {
                  const count = getProjectCaseCount(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProjId(p.id)}
                      className={`flex w-full items-center justify-between rounded-[8px] border p-4 text-left transition-all hover:bg-[var(--c-bg-hover)] ${selectedProjId === p.id ? "border-[var(--c-accent)] bg-[var(--c-accent-soft)]/10" : "border-[var(--c-border)]"}`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--c-text)]">{p.name}</p>
                        <p className="text-xs text-[var(--c-text-muted)] mt-0.5">{p.description}</p>
                      </div>
                      <span className="font-mono text-xs text-[var(--c-text-muted)] bg-[var(--c-bg-hover)] px-2 py-0.5 rounded-[4px]">
                        {count} cases
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-[13px] text-[var(--c-text-muted)]">
                Choose the scope of execution for <strong>{activeProject?.name}</strong>:
              </p>
              <div className="space-y-3">
                {/* Option A: Entire Project */}
                <label
                  className={`flex items-start gap-3 rounded-[8px] border p-4 cursor-pointer transition-all hover:bg-[var(--c-bg-hover)] ${scopeType === "all" ? "border-[var(--c-accent)] bg-[var(--c-accent-soft)]/10" : "border-[var(--c-border)]"}`}
                >
                  <input
                    type="radio"
                    name="scopeType"
                    checked={scopeType === "all"}
                    onChange={() => setScopeType("all")}
                    className="mt-1 accent-[var(--c-accent)]"
                  />
                  <div>
                    <span className="text-sm font-semibold">Run entire project</span>
                    <p className="text-xs text-[var(--c-text-muted)] mt-0.5">
                      Executes all {projectTestCases.length} test cases across all suites.
                    </p>
                  </div>
                </label>

                {/* Option B: Specific Suites */}
                <div
                  className={`rounded-[8px] border transition-all ${scopeType === "suites" ? "border-[var(--c-accent)] bg-[var(--c-accent-soft)]/10" : "border-[var(--c-border)]"}`}
                >
                  <label className="flex items-start gap-3 p-4 cursor-pointer hover:bg-[var(--c-bg-hover)]">
                    <input
                      type="radio"
                      name="scopeType"
                      checked={scopeType === "suites"}
                      onChange={() => setScopeType("suites")}
                      className="mt-1 accent-[var(--c-accent)]"
                    />
                    <div>
                      <span className="text-sm font-semibold">Select specific suites</span>
                      <p className="text-xs text-[var(--c-text-muted)] mt-0.5">
                        Choose one or more test suites to run.
                      </p>
                    </div>
                  </label>

                  {scopeType === "suites" && (
                    <div className="border-t border-[var(--c-border)] p-4 space-y-2 max-h-[150px] overflow-y-auto bg-[var(--c-bg)] rounded-b-[8px]">
                      {projectSuites.map((s) => {
                        const count = getSuiteCaseCount(s.id);
                        return (
                          <label
                            key={s.id}
                            className="flex items-center justify-between text-xs py-1.5 cursor-pointer hover:text-[var(--c-accent)]"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedSuiteIds.includes(s.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSuiteIds([...selectedSuiteIds, s.id]);
                                  } else {
                                    setSelectedSuiteIds(
                                      selectedSuiteIds.filter((id) => id !== s.id),
                                    );
                                  }
                                }}
                                className="accent-[var(--c-accent)]"
                              />
                              <span className="font-medium">{s.name}</span>
                            </div>
                            <span className="font-mono text-[var(--c-text-muted)]">
                              {count} cases
                            </span>
                          </label>
                        );
                      })}
                      {projectSuites.length === 0 && (
                        <p className="text-center text-xs text-[var(--c-text-muted)]">
                          No suites found in this project.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Option C: Specific Test Cases */}
                <div
                  className={`rounded-[8px] border transition-all ${scopeType === "testcases" ? "border-[var(--c-accent)] bg-[var(--c-accent-soft)]/10" : "border-[var(--c-border)]"}`}
                >
                  <label className="flex items-start gap-3 p-4 cursor-pointer hover:bg-[var(--c-bg-hover)]">
                    <input
                      type="radio"
                      name="scopeType"
                      checked={scopeType === "testcases"}
                      onChange={() => setScopeType("testcases")}
                      className="mt-1 accent-[var(--c-accent)]"
                    />
                    <div>
                      <span className="text-sm font-semibold">Select specific test cases</span>
                      <p className="text-xs text-[var(--c-text-muted)] mt-0.5">
                        Select individual tests to execute.
                      </p>
                    </div>
                  </label>

                  {scopeType === "testcases" && (
                    <div className="border-t border-[var(--c-border)] p-4 space-y-3 max-h-[200px] overflow-y-auto bg-[var(--c-bg)] rounded-b-[8px]">
                      {projectSuites.map((suite) => {
                        const suiteTests = projectTestCases.filter((tc) => tc.suiteId === suite.id);
                        if (suiteTests.length === 0) return null;
                        return (
                          <div key={suite.id} className="space-y-1.5">
                            <p className="font-semibold text-xs text-[var(--c-accent)] border-b border-[var(--c-border)] pb-1">
                              {suite.name}
                            </p>
                            <div className="pl-1 space-y-1">
                              {suiteTests.map((tc) => (
                                <label
                                  key={tc.id}
                                  className="flex items-center justify-between text-xs py-1 cursor-pointer hover:text-[var(--c-accent)]"
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedTestCaseIds.includes(tc.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedTestCaseIds([...selectedTestCaseIds, tc.id]);
                                        } else {
                                          setSelectedTestCaseIds(
                                            selectedTestCaseIds.filter((id) => id !== tc.id),
                                          );
                                        }
                                      }}
                                      className="accent-[var(--c-accent)]"
                                    />
                                    <span className="truncate max-w-[200px]">{tc.title}</span>
                                  </div>
                                  <span
                                    className={`rounded-sm px-1.5 py-0.2 font-mono text-[9px] badge-${tc.priority}`}
                                  >
                                    {tc.priority}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {projectTestCases.length === 0 && (
                        <p className="text-center text-xs text-[var(--c-text-muted)]">
                          No test cases found in this project.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-[13px] text-[var(--c-text-muted)]">
                Please review the details of your mock execution:
              </p>

              <div>
                <label className="block text-xs font-medium text-[var(--c-text-muted)] mb-1.5 uppercase tracking-wider">
                  Target Environment
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full rounded-[8px] border border-[var(--c-border)] bg-[var(--c-bg-input)] px-3 py-2 text-sm outline-none focus:border-[var(--c-accent)]"
                >
                  <option value="localhost">localhost</option>
                  <option value="dev">dev</option>
                  <option value="staging">staging</option>
                  <option value="production">production</option>
                </select>
              </div>

              <div className="rounded-[8px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-5 space-y-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--c-text-muted)]">
                    Target Project
                  </p>
                  <p className="text-sm font-semibold text-[var(--c-text)] mt-1">
                    {activeProject?.name}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--c-text-muted)]">
                    Execution Scope
                  </p>
                  <p className="text-sm font-semibold text-[var(--c-text)] mt-1 capitalize">
                    {scopeType === "all" && "Entire Project"}
                    {scopeType === "suites" &&
                      `Selected Suites (${selectedSuiteIds.length} suite${selectedSuiteIds.length !== 1 ? "s" : ""})`}
                    {scopeType === "testcases" &&
                      `Selected Test Cases (${selectedTestCaseIds.length} test${selectedTestCaseIds.length !== 1 ? "s" : ""})`}
                  </p>

                  {scopeType === "suites" && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {projectSuites
                        .filter((s) => selectedSuiteIds.includes(s.id))
                        .map((s) => (
                          <span
                            key={s.id}
                            className="text-[10px] bg-[var(--c-bg-hover)] px-2 py-0.5 rounded-[4px] border border-[var(--c-border)] text-[var(--c-text-muted)]"
                          >
                            {s.name}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-[var(--c-border)] pt-4 flex justify-between items-center">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--c-text-muted)]">
                      Total Tests to Run
                    </p>
                    <p className="text-2xl font-display font-semibold text-[var(--c-text)] mt-0.5">
                      {testsToRunCount}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-[4px] px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${testsToRunCount > 0 ? "bg-[var(--c-pass-soft)] text-[var(--c-pass)]" : "bg-[var(--c-fail-soft)] text-[var(--c-fail)]"}`}
                  >
                    {testsToRunCount > 0 ? "Ready" : "No Tests"}
                  </span>
                </div>
              </div>

              {testsToRunCount === 0 && (
                <p className="text-xs text-[var(--c-fail)] font-semibold text-center">
                  Cannot run tests. The selection resolves to 0 test cases.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Wizard Footer */}
        <div className="mt-6 flex justify-between pt-4 border-t border-[var(--c-border)]">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-[8px] border-[1.5px] border-[var(--c-border)] bg-transparent px-[16px] py-[8px] text-[13px] font-medium transition-all hover:bg-[var(--c-bg-hover)]"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="rounded-[8px] border-[1.5px] border-[var(--c-border)] bg-transparent px-[16px] py-[8px] text-[13px] font-medium transition-all hover:bg-[var(--c-bg-hover)]"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              onClick={() => setStep(step + 1)}
              className="rounded-[8px] bg-[var(--c-text)] px-[16px] py-[8px] text-[13px] font-medium text-[var(--c-bg)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          ) : (
            <button
              disabled={testsToRunCount === 0}
              onClick={handleStartRun}
              className="rounded-[8px] bg-[var(--c-accent)] px-[16px] py-[8px] text-[13px] font-medium text-white hover:bg-[var(--c-accent-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <TokenCostLabel baseText="Start Run" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
