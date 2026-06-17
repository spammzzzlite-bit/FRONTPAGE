import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { CheckCircle2, XCircle, MinusCircle, ShieldCheck, ArrowRight, Bug as BugIcon, ExternalLink } from "lucide-react";
import { useProjects, useTestCases, useRuns, useBugs, type TestCase } from "@/frontend/store/store";
import { PageHeader } from "./_app.projects";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/traceability")({
  component: TraceabilityPage,
});

function TraceabilityPage() {
  const [projects] = useProjects();
  const [testCases] = useTestCases();
  const [runs] = useRuns();
  const [bugs] = useBugs();

  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");
  const activeProject = projects.find((p) => p.id === selectedProjectId);

  // Group test cases by requirementId
  const matrix = useMemo(() => {
    if (!activeProject) return [];
    
    const projectCases = testCases.filter(tc => tc.projectId === activeProject.id);
    const grouped = projectCases.reduce((acc, tc) => {
      const reqId = tc.requirementId || "Unlinked";
      if (!acc[reqId]) {
        acc[reqId] = { requirementId: reqId, testCases: [] };
      }
      acc[reqId].testCases.push(tc);
      return acc;
    }, {} as Record<string, { requirementId: string, testCases: TestCase[] }>);

    return Object.values(grouped).sort((a, b) => {
      if (a.requirementId === "Unlinked") return 1;
      if (b.requirementId === "Unlinked") return -1;
      return a.requirementId.localeCompare(b.requirementId);
    });
  }, [activeProject, testCases]);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        section="§ Insights"
        title="Requirements Traceability Matrix"
        subtitle="End-to-end visibility: Requirements → Test Cases → Test Runs → Bugs"
        action={
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-64 rounded-md border border-[var(--c-border)] bg-[var(--c-bg-input)] px-3 py-2 text-sm outline-none focus:border-[var(--c-accent)]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        }
      />

      <div className="mt-8 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg-card)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--c-bg-hover)] border-b border-[var(--c-border)]">
              <tr>
                <th className="p-4 font-mono text-[10px] uppercase tracking-wider text-[var(--c-text-muted)] w-[20%]">
                  Requirement
                </th>
                <th className="p-4 font-mono text-[10px] uppercase tracking-wider text-[var(--c-text-muted)] w-[30%]">
                  Test Case
                </th>
                <th className="p-4 font-mono text-[10px] uppercase tracking-wider text-[var(--c-text-muted)] w-[25%]">
                  Latest Run
                </th>
                <th className="p-4 font-mono text-[10px] uppercase tracking-wider text-[var(--c-text-muted)] w-[25%]">
                  Linked Bugs
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--c-border)]">
              {matrix.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No test cases found for this project.
                  </td>
                </tr>
              ) : (
                matrix.map((group) => (
                  <tr key={group.requirementId} className="group hover:bg-[var(--c-bg-hover)]/50 transition-colors">
                    {/* Requirement Column */}
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[var(--c-accent)]" />
                        <span className="font-semibold text-[var(--c-text)]">
                          {group.requirementId}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--c-text-muted)]">
                        {group.testCases.length} mapped test{group.testCases.length !== 1 ? 's' : ''}
                      </p>
                    </td>

                    {/* Content Columns (Test Case, Run, Bugs) */}
                    <td colSpan={3} className="p-0">
                      <div className="divide-y divide-[var(--c-border)]">
                        {group.testCases.map((tc) => {
                          const linkedBugs = bugs.filter(b => b.testCaseId === tc.id);
                          const hasPassed = tc.lastRunStatus === "passed";
                          const hasFailed = tc.lastRunStatus === "failed";
                          
                          return (
                            <div key={tc.id} className="flex h-full">
                              {/* Test Case */}
                              <div className="w-[30%] p-4 border-r border-[var(--c-border)] min-w-[200px]">
                                <Link to="/suites" search={{ projectId: tc.projectId }} className="font-medium text-[var(--c-text)] hover:underline hover:text-[var(--c-accent)] flex items-center gap-2">
                                  {tc.title}
                                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <div className="mt-1.5 flex gap-2">
                                  <span className={`rounded-sm px-1.5 py-0.5 font-mono text-[9px] badge-${tc.priority}`}>
                                    {tc.priority}
                                  </span>
                                  <span className={`rounded-sm px-1.5 py-0.5 font-mono text-[9px] status-${tc.authorStatus}`}>
                                    {tc.authorStatus}
                                  </span>
                                </div>
                              </div>

                              {/* Latest Run */}
                              <div className="w-[33%] p-4 border-r border-[var(--c-border)] min-w-[200px]">
                                {tc.lastRunStatus ? (
                                  <div className="flex items-center gap-2">
                                    {hasPassed && <CheckCircle2 className="h-4 w-4 text-sage" />}
                                    {hasFailed && <XCircle className="h-4 w-4 text-rust" />}
                                    {tc.lastRunStatus === "skipped" && <MinusCircle className="h-4 w-4 text-muted-foreground" />}
                                    <span className="font-medium capitalize">{tc.lastRunStatus}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-[var(--c-text-muted)] italic">Not run yet</span>
                                )}
                              </div>

                              {/* Linked Bugs */}
                              <div className="w-[33%] p-4 min-w-[200px]">
                                {linkedBugs.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {linkedBugs.map(bug => (
                                      <Link
                                        key={bug.id}
                                        to="/bugs"
                                        className="flex items-center gap-2 group/bug"
                                      >
                                        <BugIcon className="h-3.5 w-3.5 text-rust" />
                                        <span className="font-mono text-xs text-rust hover:underline">
                                          {bug.id}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground capitalize">
                                          ({bug.status})
                                        </span>
                                      </Link>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-[var(--c-text-muted)]">No bugs reported</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
