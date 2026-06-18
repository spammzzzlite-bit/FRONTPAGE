import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bug,
  Plus,
  ArrowRight,
  Trash2,
  ChevronsUpDown,
  Check,
  Search,
  Download,
  Sparkles,
  X,
  Edit3,
  Save,
  CheckCircle,
} from "lucide-react";
import {
  useBugs,
  useProjects,
  createBug,
  updateBugNotes,
  resolveBug,
  restoreBug,
  deleteBug,
  type BugReport,
} from "@/frontend/store/store";
import { usePanel } from "@/frontend/components/PanelContext";
import { PageHeader } from "./_app.projects";
import { toast } from "./_app";
import { exportToExcel } from "@/frontend/store/export";

export const Route = createFileRoute("/_app/bugs")({
  head: () => ({ meta: [{ title: "Bugs — QA Mind" }] }),
  component: BugsPage,
});

// Custom syntax highlighter for Playwright/JS/TS code snippets
function HighlightedCode({ code }: { code: string }) {
  const parts = code.split(
    /(\/\/[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[\s\S]*?`|\b(?:test|async|await|expect|const|let|function|import|from|assert|to|be|toBe|have|toHave|click|fill|goto)\b)/g,
  );

  return (
    <pre className="font-mono text-xs leading-relaxed overflow-x-auto p-4 rounded-lg bg-[#181412] text-[#D4D4D4] border border-border select-text">
      <code>
        {parts.map((part, i) => {
          if (part.startsWith("//")) {
            return (
              <span key={i} className="text-muted-foreground italic">
                {part}
              </span>
            );
          }
          if (part.startsWith('"') || part.startsWith("'") || part.startsWith("`")) {
            return (
              <span key={i} className="text-emerald-400">
                {part}
              </span>
            );
          }
          if (/^(?:test|async|await|expect|const|let|function|import|from)$/.test(part)) {
            return (
              <span key={i} className="text-amber-500 font-semibold">
                {part}
              </span>
            );
          }
          if (/^(?:toBe|toHave|click|fill|goto|assert|to|be)$/.test(part)) {
            return (
              <span key={i} className="text-sky-400 font-semibold">
                {part}
              </span>
            );
          }
          return part;
        })}
      </code>
    </pre>
  );
}

// Custom Searchable Dropdown Selector for Ongoing Projects
function ProjectSelector({
  projects,
  selectedProjectId,
  onSelectProject,
}: {
  projects: any[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/60 backdrop-blur-md px-4 py-2.5 text-sm font-medium hover:border-foreground transition-all shadow-sm w-full md:w-[320px]"
      >
        <span className="truncate">{selectedProject?.name || "Select Project workspace..."}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-full md:w-[320px] rounded-xl border border-border bg-card/95 backdrop-blur-lg p-3 shadow-lg z-20 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ongoing projects..."
                className="w-full rounded-lg border border-border bg-[var(--c-bg-input)] pl-8 pr-3 py-2 text-xs outline-none focus:border-[var(--c-accent)]"
              />
            </div>
            <div className="max-h-[220px] overflow-y-auto space-y-1">
              {filteredProjects.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  No ongoing projects found.
                </div>
              ) : (
                filteredProjects.map((p) => {
                  const isSelected = p.id === selectedProjectId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p.id);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-[var(--c-accent-soft)] text-[var(--c-accent)] font-semibold"
                          : "hover:bg-[var(--c-bg-hover)] text-foreground"
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[var(--c-accent)]" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Wide Bug Row Card component
function BugCard({
  bug,
  onResolve,
  onDelete,
}: {
  bug: BugReport;
  onResolve: (bug: BugReport) => void;
  onDelete: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(bug.developer_notes || "");
  const [isSaved, setIsSaved] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounced note saving
  useEffect(() => {
    if (notes === bug.developer_notes) return;
    setIsSaved(false);
    const timer = setTimeout(() => {
      updateBugNotes(bug.id, notes);
      setIsSaved(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [notes, bug.id, bug.developer_notes]);

  const handleManualSave = () => {
    updateBugNotes(bug.id, notes);
    setIsSaved(true);
    textareaRef.current?.blur();
    toast.success(`Notes saved for ${bug.id}`);
  };

  const handleBlur = () => {
    if (notes !== bug.developer_notes) {
      updateBugNotes(bug.id, notes);
      setIsSaved(true);
    }
  };

  const handleResolveClick = () => {
    setIsResolving(true);
    setTimeout(() => {
      onResolve(bug);
    }, 300); // 300ms matches css duration
  };

  return (
    <div
      style={
        isResolving
          ? {
              maxHeight: 0,
              paddingTop: 0,
              paddingBottom: 0,
              marginTop: 0,
              marginBottom: 0,
              opacity: 0,
              transform: "translateX(30px) scale(0.95)",
              overflow: "hidden",
            }
          : { maxHeight: "2000px" }
      }
      className="relative w-full rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:border-foreground/15 flex flex-col md:flex-row gap-5 items-start"
    >
      {/* Left Column: Metadata badges */}
      <div className="flex flex-col gap-2 shrink-0 w-full md:w-[200px]">
        <div className="flex items-center gap-2 justify-between md:justify-start">
          <span className="font-mono text-[11px] font-semibold text-muted-foreground px-2 py-0.5 rounded bg-muted/80">
            {bug.id}
          </span>
          <button
            onClick={() => onDelete(bug.id)}
            title="Delete permanently"
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors md:hidden"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="text-[13px] font-semibold tracking-wide text-foreground uppercase border-l-2 border-[var(--c-accent)] pl-2.5 py-0.5 leading-relaxed bg-[var(--c-accent-soft)]/20 rounded-r pr-2.5">
          {bug.test_case_title}
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">
          {bug.created_at ? new Date(bug.created_at).toLocaleString() : new Date().toLocaleString()}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <span
            className={`rounded-sm px-[6px] py-[2px] font-mono text-[9px] uppercase tracking-wider ${bug.severity === "blocker" || bug.severity === "critical" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}`}
          >
            {bug.severity || "major"}
          </span>
          {bug.environment && (
            <span className="rounded-sm bg-[var(--c-bg-hover)] px-[6px] py-[2px] font-mono text-[9px] uppercase tracking-wider text-[var(--c-text-muted)]">
              {bug.environment}
            </span>
          )}
        </div>
        {(bug.testCaseId || bug.runId) && (
          <div className="mt-1 flex flex-col gap-1">
            {bug.testCaseId && (
              <span className="text-[10px] text-[var(--c-accent)] hover:underline cursor-pointer">
                View Source Test
              </span>
            )}
            {bug.runId && (
              <span className="text-[10px] text-[var(--c-accent)] hover:underline cursor-pointer">
                View Source Run
              </span>
            )}
          </div>
        )}
      </div>

      {/* Center Area: Collapsible Error logs and Code Snippet */}
      <div className="flex-1 w-full space-y-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-semibold text-[var(--c-accent)] hover:underline outline-none"
        >
          {isExpanded ? "▼ Hide Execution Logs" : "▶ Show Logs & Failing Script"}
        </button>

        {isExpanded && (
          <div className="space-y-3 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {bug.error_message && (
              <div className="space-y-1.5">
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  Error Message / Log
                </div>
                <pre className="font-mono text-xs leading-relaxed p-4 rounded-lg bg-[var(--c-bg-input)] border border-border overflow-x-auto max-h-[180px] text-red-500/90 select-text whitespace-pre-wrap">
                  {bug.error_message}
                </pre>
              </div>
            )}
            {bug.code_snippet && (
              <div className="space-y-1.5">
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  Failing Script Layout
                </div>
                <HighlightedCode code={bug.code_snippet} />
              </div>
            )}
          </div>
        )}

        {/* Interactive notes field */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="block font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
              Developer Notes
            </label>
            <span className="text-[10px] font-mono">
              {isSaved ? (
                <span className="text-emerald-500 font-medium">✓ Saved</span>
              ) : (
                <span className="text-amber-500 animate-pulse font-medium">Saving...</span>
              )}
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleBlur}
            placeholder="Document notes regarding resolution. (saves on focus loss or debounced typing)"
            rows={3}
            className="w-full rounded-lg border border-border bg-[var(--c-bg-input)] p-3 text-[13px] outline-none focus:border-[var(--c-accent)] transition-colors resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Rightmost stacked action buttons */}
      <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-end w-full md:w-auto pt-2 md:pt-0 self-stretch md:self-auto border-t md:border-t-0 border-border">
        {notes !== bug.developer_notes ? (
          <button
            onClick={handleManualSave}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--c-accent)] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-[var(--c-accent-dark)] transition-all shadow-sm"
          >
            <Save className="h-3.5 w-3.5" /> Save Notes
          </button>
        ) : (
          <button
            onClick={() => textareaRef.current?.focus()}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-[12px] font-medium text-foreground hover:bg-[var(--c-bg-hover)] transition-all"
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit Notes
          </button>
        )}
        <button
          onClick={handleResolveClick}
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-[12px] font-semibold text-white transition-all shadow-sm"
        >
          <CheckCircle className="h-3.5 w-3.5" /> Resolve Bug
        </button>
        <button
          onClick={() => onDelete(bug.id)}
          title="Delete permanently"
          className="hidden md:inline-flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mt-auto border border-transparent hover:border-destructive/20"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function BugsPage() {
  const [bugs] = useBugs();
  const [projects] = useProjects();
  const { openPanel, closePanel } = usePanel();

  // Pull all ongoing projects
  const ongoingProjects = projects.filter((p) => p.status.toLowerCase() !== "completed");

  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return ongoingProjects[0]?.id || "";
  });

  const [resolvedStack, setResolvedStack] = useState<BugReport[]>([]);

  // Update selected project if ongoing projects list changes
  useEffect(() => {
    if (ongoingProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(ongoingProjects[0].id);
    }
  }, [projects]);

  // Filtering: active (unresolved) bugs for the selected project
  const activeBugs = bugs.filter((b) => b.project_id === selectedProjectId && !b.is_resolved);

  const handleResolveBug = (bug: BugReport) => {
    resolveBug(bug.id);
    setResolvedStack((prev) => [...prev, bug]);
    toast.success(`Bug "${bug.test_case_title}" marked as resolved.`, {
      action: {
        label: "Undo (Ctrl+Z)",
        onClick: () => handleUndoLast(),
      },
    });
  };

  const handleUndoLast = useCallback(() => {
    if (resolvedStack.length === 0) return;
    const last = resolvedStack[resolvedStack.length - 1];
    restoreBug(last.id);
    setResolvedStack((prev) => prev.slice(0, -1));
    toast.success(`Restored active state of: ${last.id}`);
  }, [resolvedStack]);

  const handleDeleteBug = (id: string) => {
    if (confirm(`Are you sure you want to permanently delete bug ${id}?`)) {
      deleteBug(id);
      toast.success(`Bug ${id} deleted.`);
    }
  };

  // Keyboard shortcut listener (Ctrl + Z / Cmd + Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        const activeEl = document.activeElement;
        const isInput =
          activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");
        if (!isInput && resolvedStack.length > 0) {
          e.preventDefault();
          handleUndoLast();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndoLast, resolvedStack]);

  const handleExport = () => {
    const proj = projects.find((p) => p.id === selectedProjectId);
    if (!proj) {
      toast.error("No active project context for export.");
      return;
    }
    const projBugs = bugs.filter((b) => b.project_id === selectedProjectId);
    exportToExcel({
      projectName: proj.name,
      cases: [],
      runs: [],
      bugs: projBugs,
      inputInfo: { type: "Manual Export", summary: `Defects for workspace ${proj.name}` },
    });
    toast.success("Bug report exported to Excel");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[2px] border-[var(--c-text)] pb-6 mt-[20px]">
        <div>
          <p className="label-eyebrow text-accent">§ Defect Ledger</p>
          <h1 className="mt-2 font-display text-[42px] leading-tight md:text-5xl">Bug tracker</h1>
          <p className="mt-2 text-[15px] text-[var(--c-text-muted)]">
            Analyze, track, and resolve system anomalies per workspace context.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {projects.length > 0 && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:border-foreground transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" /> Export Ledger
            </button>
          )}
          <button
            onClick={() =>
              openPanel(
                <NewBugDrawer onClose={closePanel} defaultProjectId={selectedProjectId} />,
                [{ label: "Bugs" }, { label: "Create Ticket" }],
              )
            }
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#C25838] transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> File Bug Ticket
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm max-w-md mx-auto">
          <Bug className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
          <h3 className="mt-4 font-display text-xl text-foreground">No projects found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an active project first in the "My Projects" tab to start tracking defect
            context.
          </p>
          <div className="mt-6">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-accent transition-colors"
            >
              Go to Projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Header Filter Area */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--c-bg-sidebar)]/30 border border-border/80 backdrop-blur-sm p-4 rounded-xl shadow-inner">
            <div className="flex flex-col gap-1.5 w-full md:w-auto">
              <label className="block font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                Active Project Workspace Context:
              </label>
              {ongoingProjects.length === 0 ? (
                <span className="text-sm text-muted-foreground font-semibold">
                  No active workspaces available
                </span>
              ) : (
                <ProjectSelector
                  projects={ongoingProjects}
                  selectedProjectId={selectedProjectId}
                  onSelectProject={setSelectedProjectId}
                />
              )}
            </div>

            {ongoingProjects.length > 0 && (
              <div className="font-mono text-xs text-muted-foreground self-end bg-card px-3 py-1.5 rounded-lg border border-border/50">
                Total bugs:{" "}
                <span className="text-foreground font-semibold">
                  {
                    bugs.filter(
                      (b) => !b.is_resolved && projects.some((p) => p.id === b.project_id),
                    ).length
                  }
                </span>
              </div>
            )}
          </div>

          {/* Bug Ledger Content */}
          {ongoingProjects.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm max-w-xl mx-auto my-10">
              <CheckCircle className="mx-auto h-10 w-10 text-emerald-500" />
              <h3 className="mt-4 font-display text-xl text-foreground">Workspaces Completed</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                All projects are marked as Completed. Create a new project workspace to file bugs.
              </p>
            </div>
          ) : activeBugs.length === 0 ? (
            /* Premium glassmorphic empty state graphic */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-16 text-center shadow-lg max-w-2xl mx-auto my-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-6 border border-emerald-500/20 shadow-inner">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl text-foreground">
                No bugs recorded for this workspace.
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                This project is completely clear of unresolved issues. All test runs are passing!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBugs.map((bug) => (
                <BugCard
                  key={bug.id}
                  bug={bug}
                  onResolve={handleResolveBug}
                  onDelete={handleDeleteBug}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── New Bug Drawer (Panel) ─────────────────────────────── */

function NewBugDrawer({
  onClose,
  defaultProjectId,
}: {
  onClose: () => void;
  defaultProjectId?: string;
}) {
  const [projects] = useProjects();
  const [form, setForm] = useState({
    projectId: defaultProjectId || projects[0]?.id || "",
    title: "",
    errorMessage: "",
    codeSnippet: "",
  });

  const isValid = form.title.trim() !== "" && form.projectId !== "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    createBug({
      project_id: form.projectId,
      test_case_title: form.title.trim(),
      error_message: form.errorMessage.trim(),
      code_snippet: form.codeSnippet.trim() || "// Manually reported workspace bug",
      developer_notes: null,
    });
    toast.success(`Bug ticket filed`);
    onClose();
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="label-eyebrow text-accent">§ Ticket Creator</p>
        <h2 className="mt-1 font-display text-2xl">Create New Bug</h2>
        <p className="mt-1 text-xs text-muted-foreground font-mono">
          Fill in details below to manually report a workspace defect.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Project Context
          </label>
          <select
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            className="w-full rounded-[8px] border border-border bg-[var(--c-bg-input)] p-[10px] text-[13px] outline-none focus:border-[var(--c-accent)] text-foreground"
          >
            <option value="" disabled>
              Select project...
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Test Case Name / Title <span className="text-destructive">*</span>
          </label>
          <input
            autoFocus
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Short title representing the failed scenario"
            className="w-full rounded-[8px] border border-border bg-[var(--c-bg-input)] px-[14px] py-[10px] text-[13px] outline-none focus:border-[var(--c-accent)] text-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Error Message / Log
          </label>
          <textarea
            value={form.errorMessage}
            onChange={(e) => setForm({ ...form, errorMessage: e.target.value })}
            placeholder="Paste console error logs or trace description..."
            rows={4}
            className="w-full rounded-[8px] border border-border bg-[var(--c-bg-input)] p-3 text-[13px] outline-none focus:border-[var(--c-accent)] resize-none transition-colors text-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Code Snippet / Failing Script
          </label>
          <textarea
            value={form.codeSnippet}
            onChange={(e) => setForm({ ...form, codeSnippet: e.target.value })}
            placeholder="e.g. // Failing spec block"
            rows={4}
            className="w-full rounded-[8px] border border-border bg-[var(--c-bg-input)] p-3 font-mono text-[12px] outline-none focus:border-[var(--c-accent)] resize-none transition-colors text-foreground"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[8px] border-[1.5px] border-border bg-transparent px-[16px] py-[8px] text-[13px] font-medium transition-all hover:bg-[var(--c-bg-hover)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="rounded-[8px] bg-[var(--c-text)] px-[16px] py-[8px] text-[13px] font-medium text-[var(--c-bg)] transition-all hover:opacity-90 disabled:opacity-40"
          >
            Report Bug
          </button>
        </div>
      </form>
    </div>
  );
}
