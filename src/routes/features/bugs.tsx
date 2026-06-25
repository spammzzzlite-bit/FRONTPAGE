import { createFileRoute, Link } from "@tanstack/react-router";
import { Bug, AlertTriangle, GitBranch, History, BarChart3 } from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/features/bugs")({
  component: BugsPage,
});

const STEPS = [
  {
    num: "01",
    tag: "Source",
    title: "One click from a failed test",
    body: "When a test case fails in a run, a 'Send to Bugs' button appears next to it. One click creates a tracked bug — pre-populated with the test case ID, run ID, and full error output. No copy-paste.",
    note: "→ Bug creation requires a deliberate click — nothing auto-files",
  },
  {
    num: "02",
    tag: "Triage",
    title: "Assign severity and ownership",
    body: "Each bug has a severity level: Blocker, Critical, Major, Minor, or Trivial. Assign a developer, add reproduction notes, and link to an external tracker if needed.",
    note: "→ Severity levels: Blocker · Critical · Major · Minor · Trivial",
  },
  {
    num: "03",
    tag: "Traceability",
    title: "Always linked to its origin",
    body: "Every bug retains its link to the test case that caught it and the run it came from. Navigate from bug to case to requirement to run — the full chain is one click deep.",
    note: "→ Requirement → test case → run → bug",
  },
  {
    num: "04",
    tag: "Export",
    title: "Export to your tracker",
    body: "Export bugs as Jira-ready, Qase, Xray, or Zephyr format files — ready to import without reformatting. Or use the .xlsx export with the full bug report sheet.",
    note: "→ Jira · Qase · Xray · Zephyr · .xlsx",
  },
];

const FACTS = [
  { label: "Bug creation", value: "Manual — one click from any failed test case in a run" },
  { label: "Severity levels", value: "Blocker · Critical · Major · Minor · Trivial" },
  { label: "Linkage", value: "Linked to test case ID, run ID, and full error output" },
  { label: "Developer notes", value: "Free-text notes field per bug. Assignee field per bug." },
  { label: "Export formats", value: "Jira · Qase · Xray · Zephyr import files · .xlsx" },
  { label: "Traceability", value: "Requirement → test case → run → bug — navigable in one workspace" },
];

const RELATED = [
  {
    icon: <History size={15} strokeWidth={1.75} />,
    name: "Run History",
    desc: "Failed runs are where bugs originate. Full error context is stored per run.",
    href: "/features/runs",
  },
  {
    icon: <GitBranch size={15} strokeWidth={1.75} />,
    name: "Traceability",
    desc: "See which requirements have open bugs and which test cases caught them.",
    href: "/features/traceability",
  },
  {
    icon: <BarChart3 size={15} strokeWidth={1.75} />,
    name: "Analytics",
    desc: "Open bug count, resolution rate, and severity distribution — updated after every run.",
    href: "/features/analytics",
  },
];

function MockBugs() {
  const bugs = [
    { id: "BUG-021", title: "Reset link not expiring at 30 min boundary", severity: "Critical", status: "Open", case: "TC-042" },
    { id: "BUG-020", title: "Checkout total rounds incorrectly on .5 quantities", severity: "Major", status: "In Review", case: "TC-031" },
    { id: "BUG-019", title: "Avatar upload silently fails on PNG > 2MB", severity: "Minor", status: "Closed", case: "TC-028" },
  ];

  const severityColor = (s: string) => {
    if (s === "Blocker" || s === "Critical") return { color: "#e57373", borderColor: "rgba(229,115,115,0.3)" };
    if (s === "Major") return { color: "#d9b06a", borderColor: "rgba(217,176,106,0.3)" };
    return { color: "#7d6e62", borderColor: "#2e2520" };
  };

  return (
    <div className="feat-mock-window">
      <div className="feat-mock-chrome">
        <div className="feat-mock-dots">
          <span className="feat-mock-dot feat-mock-dot-r" />
          <span className="feat-mock-dot feat-mock-dot-y" />
          <span className="feat-mock-dot feat-mock-dot-g" />
        </div>
        <span className="feat-mock-path">qamind.ai / bugs</span>
        <span className="feat-mock-badge-tag">BUG TRACKER</span>
      </div>
      <div className="feat-mock-body">
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>3 bugs · 2 open · 1 closed</p>
          <div style={{ display: "flex", gap: 6 }}>
            {["All", "Open", "Closed"].map((f, i) => (
              <span key={f} style={{ fontFamily: "var(--font-mono)", fontSize: 9, padding: "0.15rem 0.45rem", borderRadius: 999, border: "1px solid #2e2520", color: i === 0 ? "var(--c-accent)" : "#7d6e62", background: i === 0 ? "var(--c-accent-soft)" : "transparent" }}>{f}</span>
            ))}
          </div>
        </div>
        {bugs.map((bug) => {
          const sc = severityColor(bug.severity);
          return (
            <div key={bug.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #2a2018" }}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>{bug.id}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, padding: "0.1rem 0.4rem", borderRadius: 4, border: `1px solid ${sc.borderColor}`, color: sc.color }}>{bug.severity}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#7d6e62" }}>via {bug.case}</span>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#c8bfb2" }}>{bug.title}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: bug.status === "Closed" ? "#6ec47a" : "#d9b06a", marginTop: 2 }}>{bug.status}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BugsPage() {
  return (
    <FeaturePageShell
      title="Bug Tracker"
      description="File bugs from failed test runs in one click. Linked to the exact test case and run. Severity triage, developer assignment, and export to Jira, Qase, Xray, and Zephyr."
    >
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> BUG TRACKER</p>
          <h1 className="feat-headline fade-up fade-up-d1">
            Failure to tracked bug.<br />One click.
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            When a test fails, QAMind already has the context — the test case, the run, the error output. Filing a bug means one click, not filling out a form. The bug stays linked to where it came from.
          </p>
          <div className="feat-hero-chips fade-up fade-up-d3">
            <span className="feat-chip"><span className="feat-chip-dot" />One click from any failure</span>
            <span className="feat-chip"><span className="feat-chip-dot" />5 severity levels</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Linked to test case + run</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Export to Jira · Qase · Xray</span>
          </div>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d4">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started</Link>
            <Link to="/features/runs" className="fn-nav-action">Run history →</Link>
          </div>
        </div>
      </section>

      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <div className="fade-up"><MockBugs /></div>
        </div>
      </section>

      <section data-section-theme="light">
        <div className="feat-steps-section">
          <div className="feat-steps-inner">
            <div className="feat-steps-header fade-up">
              <p className="feat-eyebrow"><span style={{ color: "var(--c-accent)" }}>&sect;</span> HOW IT WORKS</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mt-2 max-w-[500px]">
                Context preserved. No triage form.
              </h2>
            </div>
            <div className="feat-steps-grid">
              {STEPS.map((step, i) => (
                <div key={step.num} className={`feat-step fade-up fade-up-d${i + 1}`}>
                  <span className="feat-step-num">{step.num}</span>
                  <div>
                    <p className="feat-step-tag">{step.tag}</p>
                    <h3 className="feat-step-title">{step.title}</h3>
                    <p className="feat-step-body">{step.body}</p>
                    <p className="feat-step-note">{step.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-section-theme="light">
        <div className="mx-auto max-w-3xl px-6 pb-20">
          <p className="feat-eyebrow mb-4 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> DETAILS</p>
          <div className="feat-fact-box fade-up fade-up-d1">
            <div className="feat-fact-heading">Bug tracker specs</div>
            {FACTS.map((f) => (
              <div key={f.label} className="feat-fact-row">
                <span className="feat-fact-label">{f.label}</span>
                <span className="feat-fact-value">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="feat-demo-placeholder fade-up">
            <div className="feat-demo-icon"><Bug size={22} /></div>
            <p className="feat-demo-label">Video demo</p>
            <p className="feat-demo-title">From failed test to tracked bug</p>
            <p className="feat-demo-sub">Watch a run complete, a failure appear, a bug filed in one click, and the traceability chain from requirement all the way to the bug report.</p>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--c-text-dim)", border: "1px solid var(--c-border)", borderRadius: 6, padding: "0.25rem 0.6rem", position: "relative", zIndex: 1 }}>Coming soon</span>
          </div>
        </div>
      </section>

      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-20">
          <p className="feat-eyebrow mb-4 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> RELATED</p>
          <div className="feat-related-grid">
            {RELATED.map((r, i) => (
              <Link key={r.href} to={r.href as any} className={`feat-related-card fade-up fade-up-d${i + 1}`}>
                <div className="feat-related-icon">{r.icon}</div>
                <p className="feat-related-name">{r.name}</p>
                <p className="feat-related-desc">{r.desc}</p>
                <span className="feat-related-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-section-theme="light">
        <div className="feat-cta-section fade-up">
          <h2 className="feat-cta-headline">Failures mean something. Track them properly.</h2>
          <p className="feat-cta-sub">Sign up and file your first bug from a failed test in under a minute. Context already included — no form to fill.</p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/features/traceability" className="fn-nav-action">Traceability →</Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
