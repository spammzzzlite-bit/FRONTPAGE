import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  FolderPlus,
  FolderClosed,
  Trash2,
  ShieldAlert,
  Zap,
  Sparkles,
  ClipboardList,
  BookOpen,
  ArrowRight,
  Plus,
  RefreshCw,
  X,
  Calendar,
  Layers,
  Save,
} from "lucide-react";
import {
  useProjects,
  useTestCases,
  useRuns,
  useSuites,
  createProject,
  deleteProject,
  useAuth,
  useSettings,
  useActiveProjectId,
  useSprints,
  useProfiles,
  scaffoldSprintsForProject,
  bulkUpsertSprintsToSupabase,
  fetchSprintsFromSupabase,
  updateLocalSprints,
  deductTokenAction,
  type Sprint,
} from "@/frontend/store/store";
import { Modal, DetailedNewProjectModal, ProjectDetail } from "./_app.projects";
import { toast } from "./_app";
import { usePanel } from "@/frontend/components/PanelContext";

const searchSchema = z.object({
  projectId: z.string().optional(),
});

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [{ title: "Dashboard — QA Mind" }],
  }),
  validateSearch: searchSchema,
  component: Dashboard,
});

/* ─── Count-up animation hook ──────────────────────────────── */
function useCountUp(target: number, duration = 300): number {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    const start = prevTarget.current;
    const diff = target - start;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    prevTarget.current = target;
  }, [target, duration]);

  return value;
}

function BarSparkline({
  data,
  color,
}: {
  data: { value: number | null; label: string }[] | null;
  color: string;
}) {
  const isSkeleton = data === null;
  const renderData = isSkeleton
    ? Array.from({ length: 7 }, () => ({ value: null as number | null, label: "" }))
    : data;

  const max = isSkeleton ? 1 : Math.max(1, ...renderData.map((d) => d.value || 0));

  return (
    <div className="relative mt-6 w-full h-[40px] sparklinewrapper" aria-hidden="true">
      <style>{`
        .sparklinewrapper:has(.bar-0:hover) .tt-0 { opacity: 1 !important; }
        .sparklinewrapper:has(.bar-1:hover) .tt-1 { opacity: 1 !important; }
        .sparklinewrapper:has(.bar-2:hover) .tt-2 { opacity: 1 !important; }
        .sparklinewrapper:has(.bar-3:hover) .tt-3 { opacity: 1 !important; }
        .sparklinewrapper:has(.bar-4:hover) .tt-4 { opacity: 1 !important; }
        .sparklinewrapper:has(.bar-5:hover) .tt-5 { opacity: 1 !important; }
        .sparklinewrapper:has(.bar-6:hover) .tt-6 { opacity: 1 !important; }
      `}</style>

      {!isSkeleton &&
        renderData.map((d, i) => {
          if (d.value === null) return null;
          const leftPct = `${((i * 2 + 1) / 14) * 100}%`;
          return (
            <div
              key={`tt-${i}`}
              className={`tt-${i} absolute bottom-[100%] mb-1 -translate-x-1/2 z-10 pointer-events-none opacity-0 transition-opacity duration-200`}
              style={{ left: leftPct }}
            >
              <div className="whitespace-nowrap rounded-[4px] bg-[var(--c-text)] px-1.5 py-0.5 text-[9px] font-mono text-[var(--c-bg)] shadow-md">
                {d.label}: {d.value}
              </div>
            </div>
          );
        })}

      <svg viewBox="0 0 132 40" className="absolute inset-0 w-full h-full overflow-visible">
        {renderData.map((d, i) => {
          const isPlaceholder = d.value === null || d.value === 0;
          let barHeight = 2;
          let opacity = 0.3;
          let barColor = "var(--c-text-muted)";

          if (isSkeleton) {
            barHeight = 15;
            opacity = 0.1;
            barColor = color;
          } else if (isPlaceholder) {
            barHeight = 2;
            opacity = 0.3;
            barColor = "var(--c-text-muted)";
          } else {
            barHeight = Math.max(2, (d.value! / max) * 40);
            const isLast = i === renderData.length - 1;
            opacity = isLast ? 1 : 0.6;
            barColor = color;
          }

          const y = 40 - barHeight;
          const x = i * 20;

          return (
            <g key={i} className={`bar-${i} cursor-default`}>
              <rect x={x - 4} y={0} width={20} height={40} fill="transparent" />
              <rect
                x={x}
                y={y}
                width={12}
                height={barHeight}
                fill={barColor}
                opacity={opacity}
                rx={1.5}
                className={isSkeleton ? "" : "transition-opacity duration-200 hover:opacity-100"}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Dashboard() {
  const { projectId } = Route.useSearch();
  const [projects] = useProjects();
  const [testCases] = useTestCases();
  const [runs] = useRuns();
  const [suites] = useSuites();
  const [settings] = useSettings();
  const [showNewProject, setShowNewProject] = useState(false);
  const { openPanel } = usePanel();
  const navigate = useNavigate();
  const [activeProjectId, setActiveProjectId] = useActiveProjectId();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (projects.length === 0) return;

    if (projectId) {
      if (projects.some((p) => p.id === projectId)) {
        if (projectId !== activeProjectId) {
          setActiveProjectId(projectId);
        }
      } else {
        const fallbackId = projects[0].id;
        setActiveProjectId(fallbackId);
        navigate({ to: "/", search: { projectId: fallbackId }, replace: true });
      }
    } else {
      const savedId = activeProjectId;
      if (savedId && projects.some((p) => p.id === savedId)) {
        navigate({ to: "/", search: { projectId: savedId }, replace: true });
      } else {
        const fallbackId = projects[0].id;
        setActiveProjectId(fallbackId);
        navigate({ to: "/", search: { projectId: fallbackId }, replace: true });
      }
    }
  }, [projectId, projects, activeProjectId, setActiveProjectId, navigate]);

  const activeProject =
    projects.find((p) => p.id === projectId) ||
    projects.find((p) => p.id === activeProjectId) ||
    projects[0];

  // Switching skeleton state for Bug 5
  const [isSwitching, setIsSwitching] = useState(false);
  useEffect(() => {
    if (activeProject?.id) {
      setIsSwitching(true);
      const timer = setTimeout(() => setIsSwitching(false), 200);
      return () => clearTimeout(timer);
    }
  }, [activeProject?.id]);

  // ─── Scope Data to Active Project ───
  const projectSuites = activeProject ? suites.filter((s) => s.projectId === activeProject.id) : [];
  const suiteIds = new Set(projectSuites.map((s) => s.id));
  const projectTestCases = testCases.filter((tc) => suiteIds.has(tc.suiteId));
  const projectRuns = activeProject
    ? runs.filter((r) => r.projectId === activeProject.id).sort((a, b) => b.startedAt - a.startedAt)
    : [];

  // ─── 1 & 2. ALIGN PASSED/FAILED/TOTAL TO LATEST RUN ───
  const lastRun = projectRuns[0];
  const globalTotalCases = projectTestCases.length;

  const projectTestCaseIds = new Set(projectTestCases.map((tc) => tc.id));
  const lastRunResults = lastRun
    ? lastRun.results.filter((r) => projectTestCaseIds.has(r.testCaseId))
    : [];
  const passedCases = lastRun ? lastRunResults.filter((r) => r.status === "passed").length : 0;
  const failedCases = lastRun ? lastRunResults.filter((r) => r.status === "failed").length : 0;
  const skippedCases = lastRun ? lastRunResults.filter((r) => r.status === "skipped").length : 0;
  const totalRunCases = lastRunResults.length;

  // ─── Dev mode assertion: Bug 2 ───
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && globalTotalCases < passedCases + failedCases) {
      console.error(
        `Dev Assertion Failed: Total Test Cases (${globalTotalCases}) is less than Passed (${passedCases}) + Failed (${failedCases})`,
      );
    }
  }, [globalTotalCases, passedCases, failedCases]);

  // ─── Empty state: user has no projects (onboarding CTA) ───
  if (!activeProject) {
    return (
      <div className="mx-auto max-w-7xl space-y-10">
        <Masthead projects={projects} activeProject={activeProject} />
        <div className="flex items-center justify-center py-16">
          <div className="w-full max-w-md border-2 border-dashed border-[var(--c-border)] bg-[var(--c-bg-card)] p-10 text-center">
            <FolderPlus className="mx-auto h-10 w-10 text-[var(--c-text-muted)]" />
            <h2 className="mt-6 font-display text-3xl">Start your first project.</h2>
            <p className="mt-2 text-sm text-[var(--c-text-muted)]">
              Create a project to unlock test generation, test runs, and reports.
            </p>
            <button
              onClick={() => setShowNewProject(true)}
              className="mt-8 w-full rounded-sm bg-[var(--c-accent)] px-5 py-3 text-sm font-medium text-white hover:opacity-90 transition-colors"
            >
              + Create Project
            </button>
          </div>
        </div>
        <DetailedNewProjectModal open={showNewProject} onClose={() => setShowNewProject(false)} />
      </div>
    );
  }

  // ─── 3. DYNAMIC LAST RUN STATUS ───
  const lastRunStatus = lastRun
    ? lastRunResults.some((r) => r.status === "failed")
      ? "failed"
      : "passed"
    : null;

  // ─── 5. FLAKY TESTS (COUNT DISTINCT test_id over last 10 runs) ───
  const flakyTestIds = new Set<string>();
  const testStatusHistory = new Map<string, Set<string>>();

  projectRuns.slice(0, 10).forEach((run) => {
    run.results.forEach((r) => {
      if (projectTestCaseIds.has(r.testCaseId)) {
        if (!testStatusHistory.has(r.testCaseId)) {
          testStatusHistory.set(r.testCaseId, new Set());
        }
        testStatusHistory.get(r.testCaseId)!.add(r.status);
      }
    });
  });

  testStatusHistory.forEach((statuses, testId) => {
    if (statuses.has("passed") && statuses.has("failed")) {
      flakyTestIds.add(testId);
    }
  });
  const flakyCases = Math.min(flakyTestIds.size, globalTotalCases);

  // ─── 6. SPARKLINE GENERATORS ───
  const last7Runs = [...projectRuns].slice(0, 7).reverse();
  const paddedRuns = Array.from({ length: 7 }, (_, i) => last7Runs[i - (7 - last7Runs.length)]);

  const makeGenerator = (getValue: (run: any) => number | null) => () => {
    return paddedRuns.map((r, i) => {
      if (!r) return { value: null, label: `Run -${7 - i}` };
      return { value: getValue(r), label: `#${r.id.replace("RUN-", "")}` };
    });
  };

  const genTotalCases = makeGenerator(
    (r) => r.results.filter((x: any) => projectTestCaseIds.has(x.testCaseId)).length,
  );
  const genPassed = makeGenerator(
    (r) =>
      r.results.filter((x: any) => projectTestCaseIds.has(x.testCaseId) && x.status === "passed")
        .length,
  );
  const genFailed = makeGenerator(
    (r) =>
      r.results.filter((x: any) => projectTestCaseIds.has(x.testCaseId) && x.status === "failed")
        .length,
  );
  const genLastRun = makeGenerator((r) =>
    Math.round(r.results.reduce((s: any, x: any) => s + x.duration, 0) / 1000),
  );
  const genCoverage = makeGenerator((r) => r.coverage || null);
  const genFlaky = makeGenerator(
    (r) =>
      r.results.filter(
        (x: any) => projectTestCaseIds.has(x.testCaseId) && flakyTestIds.has(x.testCaseId),
      ).length,
  );

  // Show "Generate your first test" CTA only when suites, tests, and run history are all exactly 0 (Bug 9)
  const showGenerateCta =
    globalTotalCases === 0 && projectSuites.length === 0 && projectRuns.length === 0;

  // Ensure rates sum to 100%
  const totalCasesInRun = passedCases + failedCases + skippedCases;
  const passRate = totalCasesInRun ? Math.round((passedCases / totalCasesInRun) * 100) : 0;
  const failRate = totalCasesInRun ? Math.round((failedCases / totalCasesInRun) * 100) : 0;
  const skipRate = totalCasesInRun ? 100 - passRate - failRate : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <Masthead projects={projects} activeProject={activeProject} />

      <style>{`
        @keyframes pulse-ring-border {
          0% { box-shadow: 0 0 0 0 var(--c-border); }
          100% { box-shadow: 0 0 0 6px transparent; }
        }
      `}</style>

      {/* Quick Actions Row */}
      <div className="flex flex-wrap gap-3 mt-6">
        <Link
          to="/generate"
          className={`inline-flex items-center gap-2 rounded-[8px] border-[1.5px] border-[var(--c-border)] bg-transparent px-[16px] py-[8px] text-[13px] font-medium transition-all duration-[var(--t-normal)] hover:-translate-y-[1px] hover:border-[var(--c-accent)] hover:bg-[var(--c-accent-soft)] hover:text-[var(--c-accent)] ${
            isMounted && showGenerateCta ? "animate-[pulse-ring-border_2.2s_infinite]" : ""
          }`}
        >
          <Sparkles className="h-[14px] w-[14px]" /> Generate Tests
        </Link>
        <Link
          to="/planner"
          className="inline-flex items-center gap-2 rounded-[8px] border-[1.5px] border-[var(--c-border)] bg-transparent px-[16px] py-[8px] text-[13px] font-medium transition-all duration-[var(--t-normal)] hover:-translate-y-[1px] hover:border-[var(--c-accent)] hover:bg-[var(--c-accent-soft)] hover:text-[var(--c-accent)]"
        >
          <ClipboardList className="h-[14px] w-[14px]" /> New Test Plan
        </Link>
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 rounded-[8px] border-[1.5px] border-[var(--c-border)] bg-transparent px-[16px] py-[8px] text-[13px] font-medium transition-all duration-[var(--t-normal)] hover:-translate-y-[1px] hover:border-[var(--c-accent)] hover:bg-[var(--c-accent-soft)] hover:text-[var(--c-accent)]"
        >
          <BookOpen className="h-[14px] w-[14px]" /> View Reports
        </Link>
      </div>

      {/* Stats — 6 columns */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mt-6">
        <StatCard
          label="Total test cases"
          value={globalTotalCases}
          sub={`${projectSuites.length} suite${projectSuites.length !== 1 ? "s" : ""}`}
          icon={FileText}
          sparklineGenerator={genTotalCases}
          sparkColor="var(--c-text-muted)"
          isLoading={isSwitching}
          nudge={
            isMounted && showGenerateCta ? (
              <button
                onClick={() => navigate({ to: "/generate" })}
                className="mt-[6px] block text-[12px] text-[var(--c-text-muted)] text-left hover:underline"
              >
                → Generate your first test
              </button>
            ) : null
          }
        />
        <StatCard
          label="Tests passed"
          value={passedCases}
          displayValue={lastRun ? undefined : "0"}
          sub={
            lastRun
              ? `${passRate}% pass rate${skippedCases > 0 ? ` · ${skippedCases} skipped` : ""}`
              : "—"
          }
          icon={CheckCircle2}
          sparklineGenerator={genPassed}
          sparkColor="var(--c-accent)"
          isLoading={isSwitching}
        />
        <StatCard
          label="Tests failed"
          value={failedCases}
          displayValue={lastRun ? undefined : "0"}
          sub={
            lastRun
              ? `${failRate}% fail rate${skippedCases > 0 ? ` · ${skippedCases} skipped` : ""}`
              : "—"
          }
          icon={XCircle}
          alert={failedCases > 0}
          sparklineGenerator={genFailed}
          sparkColor="var(--c-fail)"
          isLoading={isSwitching}
        />
        <StatCard
          label="Last run"
          value={0}
          displayValue={lastRun ? `#${lastRun.id.replace("RUN-", "")}` : "—"}
          sub={
            lastRun
              ? `Status: ${lastRunStatus} · ${formatRelativeTime(lastRun.startedAt)}`
              : "No runs yet"
          }
          icon={Clock}
          sparklineGenerator={genLastRun}
          sparkColor="var(--c-text-muted)"
          isLoading={isSwitching}
        />
        <StatCard
          label="Coverage"
          value={0}
          displayValue={
            settings.coverageEnabled && lastRun && lastRun.coverage !== undefined
              ? `${lastRun.coverage}%`
              : "—"
          }
          sub={
            !settings.coverageEnabled
              ? "Coverage not enabled"
              : lastRun && lastRun.coverage !== undefined
                ? "Unified line/branch coverage"
                : "No coverage data"
          }
          icon={ShieldAlert}
          sparklineGenerator={genCoverage}
          sparkColor="var(--c-accent)"
          isLoading={isSwitching}
          nudge={
            !settings.coverageEnabled ? (
              <button
                onClick={() => navigate({ to: "/settings" })}
                className="mt-[6px] block text-[12px] text-[var(--c-text-muted)] text-left hover:underline"
              >
                → Enable in settings
              </button>
            ) : null
          }
        />
        <StatCard
          label="Flaky tests"
          value={flakyCases}
          displayValue={lastRun ? undefined : "0"}
          sub={lastRun ? "Over last 10 runs" : "—"}
          icon={Zap}
          alert={flakyCases > 0}
          sparklineGenerator={genFlaky}
          sparkColor="var(--c-warn)"
          isLoading={isSwitching}
        />
      </section>

      {/* My Projects */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--c-border)] pb-4">
          <div>
            <p className="label-eyebrow text-[var(--c-accent)]"></p>
            <h2 className="mt-1 font-display text-2xl md:text-3xl">My Projects</h2>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--c-accent)] px-[14px] py-[6px] text-[13px] font-medium text-white transition-all duration-[var(--t-normal)] hover:-translate-y-[1px] hover:bg-[var(--c-accent-dark)] hover:shadow-[var(--shadow-md)]"
          >
            <Plus className="h-3 w-3" /> New Project
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const pSuites = suites.filter((s) => s.projectId === p.id);
            const pCases = testCases.filter((tc) => pSuites.some((s) => s.id === tc.suiteId));
            const pRuns = runs.filter((r) => r.projectId === p.id);
            const lastProjectRun = pRuns[0];
            const passCount = pCases.filter((tc) => tc.lastRunStatus === "passed").length;
            const coveragePct =
              pCases.length > 0 ? Math.round((passCount / pCases.length) * 100) : 0;
            const statusColor = !lastProjectRun
              ? "bg-muted-foreground/40"
              : lastProjectRun.status === "passed"
                ? "bg-sage"
                : "bg-rust";

            return (
              <div
                key={p.id}
                className="group stagger-item relative flex flex-col rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] transition-all duration-[var(--t-normal)] hover:-translate-y-[2px] hover:border-[var(--c-border-strong)] hover:shadow-[var(--shadow-sm)]"
                style={{
                  animationDelay: `${i * 40}ms`,
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (
                      confirm(
                        `Delete project "${p.name}"? This will remove all its suites and test cases.`,
                      )
                    ) {
                      if (!deductTokenAction(`Delete project "${p.name}"`)) return;
                      deleteProject(p.id);
                      toast.success(`Project deleted`);
                    }
                  }}
                  className="absolute right-2 top-2 z-10 p-2 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  title="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <Link
                  to="/projects"
                  search={{ projectId: p.id }}
                  className="flex h-full w-full flex-col p-5 text-left bg-transparent border-0 outline-none cursor-pointer text-current no-underline hover:no-underline"
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-2">
                      <FolderClosed className="h-4 w-4 text-[var(--c-accent)]" />
                      <p className="font-medium text-[15px] pr-8 text-[var(--c-text)]">{p.name}</p>
                    </div>
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${statusColor}`}
                      title={lastProjectRun ? lastProjectRun.status : "Never run"}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    Created {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="rounded-sm bg-muted px-2 py-0.5 font-mono text-[10px] group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                      {pCases.length} cases
                    </span>
                  </div>
                  {/* Coverage bar */}
                  <div className="mt-3 w-full">
                    <div className="h-1 w-full rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sage transition-all"
                        style={{ width: `${coveragePct}%` }}
                      />
                    </div>
                    <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                      {coveragePct}% coverage
                    </p>
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between w-full">
                    <p className="font-mono text-[10px] text-[var(--c-text-muted)]">
                      {lastProjectRun
                        ? `${lastProjectRun.id} · ${formatRelativeTime(lastProjectRun.startedAt)}`
                        : "Never run"}
                    </p>
                    <span className="text-[12px] font-medium text-[var(--c-accent)] opacity-0 transition-opacity duration-[var(--t-normal)] group-hover:opacity-100">
                      Open <ArrowRight className="inline h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <DetailedNewProjectModal open={showNewProject} onClose={() => setShowNewProject(false)} />
    </div>
  );
}

/* ─── Helper: relative time ─────────────────────────────── */
function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ─── Sub-components ────────────────────────────────────── */

function guessLocationFromTimezone(tz: string): { city: string; region: string } {
  const tzMap: Record<string, { city: string; region: string }> = {
    "America/New_York": { city: "New York", region: "NY" },
    "America/Los_Angeles": { city: "Los Angeles", region: "CA" },
    "America/Chicago": { city: "Chicago", region: "IL" },
    "America/Denver": { city: "Denver", region: "CO" },
    "America/Phoenix": { city: "Phoenix", region: "AZ" },
    "America/Anchorage": { city: "Anchorage", region: "AK" },
    "America/Honolulu": { city: "Honolulu", region: "HI" },
    "Europe/London": { city: "London", region: "UK" },
    "Europe/Paris": { city: "Paris", region: "FR" },
    "Europe/Berlin": { city: "Berlin", region: "DE" },
    "Asia/Kolkata": { city: "Kolkata", region: "India" },
    "Asia/Calcutta": { city: "Kolkata", region: "India" },
    "Asia/Tokyo": { city: "Tokyo", region: "JP" },
    "Asia/Shanghai": { city: "Shanghai", region: "CN" },
    "Asia/Singapore": { city: "Singapore", region: "SG" },
    "Australia/Sydney": { city: "Sydney", region: "NSW" },
  };

  if (tzMap[tz]) return tzMap[tz];

  const parts = tz.split("/");
  if (parts.length > 1) {
    const city = parts[parts.length - 1].replace(/_/g, " ");
    return { city, region: parts[0] };
  }
  return { city: "Brooklyn", region: "NY" };
}

function GoogleUserLocationHeader() {
  const [loc, setLoc] = useState<{ city: string; region: string; timezone: string } | null>(null);
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const defaultTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fallbackLoc = guessLocationFromTimezone(defaultTz);

    // Fetch from ipwho.is (fast, CORS-enabled, reliable)
    fetch("https://ipwho.is/")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setLoc({
            city: data.city || fallbackLoc.city,
            region: data.region || data.region_code || fallbackLoc.region,
            timezone: data.timezone?.id || defaultTz,
          });
        } else {
          throw new Error("ipwho.is failed");
        }
      })
      .catch(() => {
        // Fallback 1: ipapi.co
        fetch("https://ipapi.co/json/")
          .then((res) => res.json())
          .then((data) => {
            if (data && data.city) {
              setLoc({
                city: data.city,
                region: data.region_code || data.region || fallbackLoc.region,
                timezone: data.timezone || defaultTz,
              });
            } else {
              throw new Error("ipapi.co failed");
            }
          })
          .catch(() => {
            // Fallback 2: ipinfo.io
            fetch("https://ipinfo.io/json")
              .then((res) => res.json())
              .then((data) => {
                if (data && data.city) {
                  setLoc({
                    city: data.city,
                    region: data.region || fallbackLoc.region,
                    timezone: data.timezone || defaultTz,
                  });
                } else {
                  throw new Error("ipinfo.io failed");
                }
              })
              .catch(() => {
                // Fallback 3: local timezone guess
                setLoc({
                  city: fallbackLoc.city,
                  region: fallbackLoc.region,
                  timezone: defaultTz,
                });
              });
          });
      });
  }, []);

  useEffect(() => {
    if (!loc) return;

    const updateTime = () => {
      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: loc.timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        setTimeStr(formatter.format(new Date()));
      } catch (e) {
        setTimeStr(new Date().toLocaleTimeString());
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [loc]);

  if (!loc) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-3.5 w-32 rounded bg-[var(--c-border)] ml-auto" />
        <div className="h-3.5 w-24 rounded bg-[var(--c-border)] ml-auto" />
      </div>
    );
  }

  return (
    <div className="text-right font-mono text-[11px] text-[var(--c-text-muted)]">
      <p>
        {loc.city}, {loc.region}
      </p>
      <p className="mt-1">{timeStr}</p>
    </div>
  );
}

function Masthead({ projects, activeProject }: { projects: any[]; activeProject?: any }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [, setActiveProjectId] = useActiveProjectId();
  const isGoogleUser =
    auth.user?.app_metadata?.provider === "google" ||
    auth.user?.identities?.some((id) => id.provider === "google") ||
    auth.user?.email === "google.user@email.com" ||
    auth.user?.email === "google.user@example.com";

  return (
    <header className="border-b-[2px] border-[var(--c-text)] pb-6 mt-[20px]">
      <div className="flex items-end justify-between gap-4">
        <div>
          {projects.length > 0 && activeProject ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3">
                <h1 className="mt-3 font-display text-[48px] leading-[1.1] md:text-6xl text-[var(--c-text)]">
                  {activeProject.name}
                </h1>
                <div className="relative mt-3">
                  <select
                    value={activeProject.id}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setActiveProjectId(nextId);
                      navigate({ to: "/", search: { projectId: nextId } });
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  >
                    {projects.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--c-bg-hover)] transition-colors border border-[var(--c-border)] pointer-events-none">
                    <ArrowRight className="h-4 w-4 rotate-90 text-[var(--c-text-muted)]" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <h1 className="mt-3 font-display text-[48px] leading-[1.1] md:text-6xl text-[var(--c-text)]">
              The workspace.
            </h1>
          )}
          <p className="mt-3 max-w-2xl text-[15px] text-[var(--c-text-muted)]">
            {activeProject
              ? "Project dashboard. View your stats, runs, and flaky tests."
              : "A fresh page. Add a project, drop a spec, and start drafting."}
          </p>
        </div>
        <div className="hidden md:block">{isGoogleUser && <GoogleUserLocationHeader />}</div>
      </div>
    </header>
  );
}

function StatCard({
  label,
  value,
  displayValue,
  suffix = "",
  sub,
  icon: Icon,
  alert,
  sparklineGenerator,
  sparkColor,
  nudge,
  isLoading,
  error,
  onRetry,
}: {
  label: string;
  value: number;
  displayValue?: string;
  suffix?: string;
  sub: string;
  icon: any;
  alert?: boolean;
  sparklineGenerator?: () => { value: number | null; label: string }[];
  sparkColor?: string;
  nudge?: React.ReactNode;
  isLoading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  const animatedValue = useCountUp(value);
  const [sparklineData, setSparklineData] = useState<
    { value: number | null; label: string }[] | null
  >(null);

  const isPassed = label.toLowerCase() === "tests passed";
  const isFailed = label.toLowerCase() === "tests failed";
  const isFlaky = label.toLowerCase() === "flaky tests";

  useEffect(() => {
    if (sparklineGenerator) {
      setSparklineData(null);
      const timer = setTimeout(() => {
        setSparklineData(sparklineGenerator());
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [sparklineGenerator]);

  if (isLoading) {
    return (
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-5 animate-pulse">
        <div>
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-20 rounded bg-[var(--c-border)]" />
            <div className="h-4 w-4 rounded-full bg-[var(--c-border)]" />
          </div>
          <div className="mt-4 h-8 w-16 rounded bg-[var(--c-border)]" />
        </div>
        <div className="mt-4 h-3.5 w-28 rounded bg-[var(--c-border)]" />
        {sparklineGenerator && (
          <div className="mt-6 h-[40px] w-full rounded bg-[var(--c-border)] opacity-20" />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-[12px] border border-[var(--c-fail)] bg-[var(--c-bg-card)] p-5">
        <div>
          <div className="flex items-center justify-between">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--c-fail)]">
              {label}
            </p>
            <ShieldAlert className="h-3.5 w-3.5 text-[var(--c-fail)]" />
          </div>
          <p className="mt-4 text-[13px] font-medium text-[var(--c-text)]">Failed to load stats</p>
        </div>
        <button
          onClick={onRetry}
          className="mt-4 w-fit rounded bg-[var(--c-fail)] px-3 py-1 text-[11px] text-white hover:opacity-90 font-medium cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[12px] border p-5 stagger-item transition-all duration-[var(--t-normal)] hover:-translate-y-[3px] hover:shadow-[var(--shadow-md)] ${
        isPassed
          ? "stat-card-passed"
          : isFailed
            ? "stat-card-failed"
            : isFlaky
              ? "stat-card-flaky"
              : "stat-card-neutral border-[var(--c-border)] bg-[var(--c-bg-card)] hover:border-[var(--c-border-strong)]"
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--c-text-muted)]">
            {label}
          </p>
          <Icon
            className={`h-3.5 w-3.5 ${alert ? "text-[var(--c-fail)] animate-pulse" : "text-[var(--c-text-muted)]"}`}
          />
        </div>
        <div className="mt-2.5 flex items-baseline justify-between gap-2">
          <p className="font-display text-[30px] font-medium leading-none text-[var(--c-text)]">
            {displayValue ?? `${animatedValue}${suffix}`}
          </p>
        </div>
      </div>
      <p className="mt-3 font-mono text-[10.5px] text-[var(--c-text-muted)]">{sub}</p>
      {nudge}

      {sparklineData && sparkColor && (
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[220ms] ease-in-out group-hover:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <BarSparkline data={sparklineData} color={sparkColor} />
          </div>
        </div>
      )}
    </div>
  );
}
