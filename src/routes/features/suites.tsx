import { createFileRoute, Link } from "@tanstack/react-router";
import { Layers, Play, CheckCircle, Filter, FileText, BarChart3 } from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/features/suites")({
  component: SuitesPage,
});

const STEPS = [
  {
    num: "01",
    tag: "Organisation",
    title: "Group cases into suites",
    body: "Create suites by feature, sprint, or risk tier — smoke, regression, full. Each suite holds an ordered list of test cases. Cases can live in multiple suites.",
    note: "→ Drag to reorder. Bulk-move between suites.",
  },
  {
    num: "02",
    tag: "Approval workflow",
    title: "Control what runs",
    body: "Every test case has an independent status: Draft, Ready, or Approved. Only Approved cases are included in a run. You decide what's ready to execute.",
    note: "→ Bulk status change from the suite view",
  },
  {
    num: "03",
    tag: "Filter and find",
    title: "Filter by author status or run result",
    body: "See only Draft cases that need review, or only cases that failed last run. Author status and execution status are independent — a passing test can still be in Draft.",
    note: "→ Author status ≠ run status",
  },
  {
    num: "04",
    tag: "Execution",
    title: "Run the suite",
    body: "Trigger a run from the suite view. Results come back per case: Passed, Failed, Skipped. Failed cases can file a bug in one click — linked to the exact case and run.",
    note: "→ Full run history kept indefinitely",
  },
];

const FACTS = [
  { label: "Case status", value: "Draft · Ready · Approved (approval controls what runs)" },
  { label: "Run result", value: "Passed · Failed · Skipped (tracked independently of approval status)" },
  { label: "Filters", value: "Filter by author status, last run result, or assignee" },
  { label: "Reordering", value: "Drag-to-reorder cases within a suite" },
  { label: "Inline editing", value: "Edit steps without opening the full panel" },
  { label: "Bulk actions", value: "Bulk approve, bulk move, bulk delete from list view" },
];

const RELATED = [
  {
    icon: <FileText size={15} strokeWidth={1.75} />,
    name: "Script Generator",
    desc: "Generate Playwright .spec.ts files from all Approved cases in a suite.",
    href: "/features/scripts",
  },
  {
    icon: <Play size={15} strokeWidth={1.75} />,
    name: "Run History",
    desc: "Every suite run stored with full pass/fail/skip detail per case.",
    href: "/features/runs",
  },
  {
    icon: <BarChart3 size={15} strokeWidth={1.75} />,
    name: "Analytics",
    desc: "Suite pass rate trends over time. Spot degradation before it becomes an incident.",
    href: "/features/analytics",
  },
];

function MockSuites() {
  const cases = [
    { id: "TC-041", title: "Valid reset — password updated", status: "Approved", result: "Passed" },
    { id: "TC-042", title: "Reset link expires after 30 min", status: "Approved", result: "Failed" },
    { id: "TC-043", title: "Invalid token shows error message", status: "Ready", result: "—" },
    { id: "TC-044", title: "Email not found returns generic message", status: "Draft", result: "—" },
  ];

  return (
    <div className="feat-mock-window">
      <div className="feat-mock-chrome">
        <div className="feat-mock-dots">
          <span className="feat-mock-dot feat-mock-dot-r" />
          <span className="feat-mock-dot feat-mock-dot-y" />
          <span className="feat-mock-dot feat-mock-dot-g" />
        </div>
        <span className="feat-mock-path">qamind.ai / suites / auth-regression</span>
        <span className="feat-mock-badge-tag">SUITE</span>
      </div>
      <div className="feat-mock-body">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "#ece3d6" }}>Auth — Regression</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62", marginTop: 2 }}>4 cases · 2 approved · Last run: 2 failed</p>
          </div>
          <button className="feat-mock-btn-primary-sm"><Play size={10} /> Run suite</button>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {["All", "Draft", "Ready", "Approved"].map((f, i) => (
            <span key={f} style={{ fontFamily: "var(--font-mono)", fontSize: 9, padding: "0.15rem 0.45rem", borderRadius: 999, border: "1px solid #2e2520", color: i === 0 ? "var(--c-accent)" : "#7d6e62", background: i === 0 ? "var(--c-accent-soft)" : "transparent" }}>{f}</span>
          ))}
        </div>
        {cases.map((c) => (
          <div key={c.id} className="feat-mock-case-row">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62", minWidth: 44 }}>{c.id}</span>
            <span style={{ flex: 1, color: "#c8bfb2", fontSize: 10.5 }}>{c.title}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, padding: "0.1rem 0.4rem", borderRadius: 4, border: "1px solid", borderColor: c.status === "Approved" ? "rgba(74,163,84,0.3)" : c.status === "Ready" ? "rgba(217,176,106,0.3)" : "#2e2520", color: c.status === "Approved" ? "#6ec47a" : c.status === "Ready" ? "#d9b06a" : "#7d6e62", background: "transparent", marginRight: 4 }}>{c.status}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: c.result === "Passed" ? "#6ec47a" : c.result === "Failed" ? "#e57373" : "#4a4038" }}>{c.result}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuitesPage() {
  return (
    <FeaturePageShell
      title="Test Suite Management"
      description="Organise test cases into suites by feature or sprint. Control what runs with a Draft → Ready → Approved approval workflow. Filter by status or last result."
    >
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> TEST SUITE MANAGEMENT</p>
          <h1 className="feat-headline fade-up fade-up-d1">
            Organised suites.<br />Controlled runs.
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            Group test cases by feature, sprint, or risk tier. An approval workflow — Draft → Ready → Approved — means only the cases you're confident in get executed. Nothing runs blindly.
          </p>
          <div className="feat-hero-chips fade-up fade-up-d3">
            <span className="feat-chip"><span className="feat-chip-dot" />Draft → Ready → Approved</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Drag-to-reorder</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Bulk status changes</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Inline step editing</span>
          </div>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d4">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started</Link>
            <Link to="/features/generate" className="fn-nav-action">Generate cases first →</Link>
          </div>
        </div>
      </section>

      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <div className="fade-up"><MockSuites /></div>
        </div>
      </section>

      <section data-section-theme="light">
        <div className="feat-steps-section">
          <div className="feat-steps-inner">
            <div className="feat-steps-header fade-up">
              <p className="feat-eyebrow"><span style={{ color: "var(--c-accent)" }}>&sect;</span> HOW IT WORKS</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mt-2 max-w-[500px]">
                From draft to run — nothing slips through.
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
          <p className="feat-eyebrow mb-4 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> CAPABILITIES</p>
          <div className="feat-fact-box fade-up fade-up-d1">
            <div className="feat-fact-heading">Suite management details</div>
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
            <div className="feat-demo-icon"><Filter size={22} /></div>
            <p className="feat-demo-label">Video demo</p>
            <p className="feat-demo-title">Suite management walkthrough</p>
            <p className="feat-demo-sub">Organise cases, set approval status, run a suite, and review per-case results in under five minutes.</p>
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
          <h2 className="feat-cta-headline">Control what gets tested. Every sprint.</h2>
          <p className="feat-cta-sub">Sign up and organise your first suite in minutes — no template, no configuration file, just add cases and set statuses.</p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/features" className="fn-nav-action">All features →</Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
