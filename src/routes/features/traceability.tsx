import { createFileRoute, Link } from "@tanstack/react-router";
import { GitBranch, Bug, BarChart3, Layers } from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/features/traceability")({
  component: TraceabilityPage,
});

const STEPS = [
  {
    num: "01",
    tag: "Requirement IDs",
    title: "Tag test cases with requirement IDs",
    body: "Each test case has an optional Requirement ID field. Fill it in when you generate or write the case — the traceability matrix assembles automatically from those IDs.",
    note: "→ No separate import step. Tag while you work.",
  },
  {
    num: "02",
    tag: "Matrix view",
    title: "Requirements with no coverage surface immediately",
    body: "The matrix shows every requirement in a column and its linked test cases. Requirements with zero test cases appear in red. Coverage gaps are visible before a run, not after.",
    note: "→ Gaps surface before execution, not after",
  },
  {
    num: "03",
    tag: "Run status",
    title: "See coverage and execution state together",
    body: "Each requirement cell shows how many of its linked tests passed, failed, or were skipped in the last run. One view connects specs to results — without stitching together four tools.",
    note: "→ Requirement → test cases → last run results",
  },
  {
    num: "04",
    tag: "Bug linkage",
    title: "Follow the chain to the bug",
    body: "If a test case linked to a requirement has open bugs, the matrix shows it. One click navigates from the requirement cell to the test case to the bug — the full chain in one workspace.",
    note: "→ Requirement → test case → bug — all linked",
  },
];

const FACTS = [
  { label: "Requirement ID", value: "Free-text field on each test case — any format (REQ-001, US-42, etc.)" },
  { label: "Matrix assembly", value: "Automatic from requirement ID tags — no import or mapping step" },
  { label: "Coverage gap detection", value: "Requirements with no linked test cases shown as uncovered" },
  { label: "Execution state", value: "Last run pass/fail/skip per requirement shown inline" },
  { label: "Bug linkage", value: "Open bugs on linked test cases surface on the requirement row" },
  { label: "Export", value: "Traceability matrix included in .xlsx AI Test Report export" },
];

const RELATED = [
  {
    icon: <Bug size={15} strokeWidth={1.75} />,
    name: "Bug Tracker",
    desc: "Bugs link back to the test cases that caught them — visible in the traceability matrix.",
    href: "/features/bugs",
  },
  {
    icon: <Layers size={15} strokeWidth={1.75} />,
    name: "Test Suites",
    desc: "Test cases in suites carry their requirement IDs into the traceability matrix.",
    href: "/features/suites",
  },
  {
    icon: <BarChart3 size={15} strokeWidth={1.75} />,
    name: "Analytics",
    desc: "Coverage metric in analytics is derived from the traceability matrix.",
    href: "/features/analytics",
  },
];

function MockTraceability() {
  const rows = [
    { req: "REQ-001", label: "User authentication", cases: 5, passed: 4, failed: 1, status: "Partial" },
    { req: "REQ-002", label: "Password reset flow", cases: 4, passed: 3, failed: 1, status: "Partial" },
    { req: "REQ-003", label: "Session management", cases: 3, passed: 3, failed: 0, status: "Covered" },
    { req: "REQ-004", label: "Profile update", cases: 0, passed: 0, failed: 0, status: "Uncovered" },
  ];

  return (
    <div className="feat-mock-window">
      <div className="feat-mock-chrome">
        <div className="feat-mock-dots">
          <span className="feat-mock-dot feat-mock-dot-r" />
          <span className="feat-mock-dot feat-mock-dot-y" />
          <span className="feat-mock-dot feat-mock-dot-g" />
        </div>
        <span className="feat-mock-path">qamind.ai / traceability</span>
        <span className="feat-mock-badge-tag">MATRIX</span>
      </div>
      <div className="feat-mock-body">
        <p className="feat-mock-label-sm mb-2">Requirement coverage — Auth module</p>
        <div style={{ display: "grid", gridTemplateColumns: "4rem 1fr auto auto auto", gap: "0 0.5rem", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#7d6e62" }}>REQ ID</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#7d6e62" }}>Requirement</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#7d6e62" }}>Cases</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#7d6e62" }}>Last run</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#7d6e62" }}>Status</span>
        </div>
        {rows.map((row) => (
          <div key={row.req} style={{ display: "grid", gridTemplateColumns: "4rem 1fr auto auto auto", gap: "0 0.5rem", alignItems: "center", padding: "0.45rem 0", borderTop: "1px solid #2a2018" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>{row.req}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#c8bfb2" }}>{row.label}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9b8b7a", textAlign: "center" }}>{row.cases}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, textAlign: "center" }}>
              {row.cases > 0 ? (
                <span style={{ color: row.failed > 0 ? "#e57373" : "#6ec47a" }}>
                  {row.passed}✓ {row.failed > 0 && `${row.failed}✗`}
                </span>
              ) : <span style={{ color: "#4a4038" }}>—</span>}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, padding: "0.1rem 0.4rem", borderRadius: 4, border: "1px solid", borderColor: row.status === "Covered" ? "rgba(74,163,84,0.3)" : row.status === "Uncovered" ? "rgba(229,115,115,0.3)" : "rgba(217,176,106,0.3)", color: row.status === "Covered" ? "#6ec47a" : row.status === "Uncovered" ? "#e57373" : "#d9b06a" }}>{row.status}</span>
          </div>
        ))}
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#e57373", marginTop: 8 }}>
          ⚠ REQ-004 has no test cases — coverage gap
        </p>
      </div>
    </div>
  );
}

function TraceabilityPage() {
  return (
    <FeaturePageShell
      title="Traceability Matrix"
      description="Link every test case to its requirement. The traceability matrix shows which requirements are covered, which aren't, and where failures occurred — in one view."
    >
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> TRACEABILITY MATRIX</p>
          <h1 className="feat-headline fade-up fade-up-d1">
            Requirement to test<br />to result. One view.
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            Tag test cases with requirement IDs and QAMind assembles the traceability matrix automatically. Coverage gaps surface before execution. Failed cases trace back to the requirement they were meant to verify.
          </p>
          <div className="feat-hero-chips fade-up fade-up-d3">
            <span className="feat-chip"><span className="feat-chip-dot" />Requirement ID tagging</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Automatic matrix assembly</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Coverage gap detection</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Bug linkage per requirement</span>
          </div>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d4">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started</Link>
            <Link to="/features/bugs" className="fn-nav-action">Bug tracker →</Link>
          </div>
        </div>
      </section>

      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <div className="fade-up"><MockTraceability /></div>
        </div>
      </section>

      <section data-section-theme="light">
        <div className="feat-steps-section">
          <div className="feat-steps-inner">
            <div className="feat-steps-header fade-up">
              <p className="feat-eyebrow"><span style={{ color: "var(--c-accent)" }}>&sect;</span> HOW IT WORKS</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mt-2 max-w-[500px]">
                Tag once. Matrix builds itself.
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
            <div className="feat-fact-heading">Traceability specs</div>
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
            <div className="feat-demo-icon"><GitBranch size={22} /></div>
            <p className="feat-demo-label">Video demo</p>
            <p className="feat-demo-title">Requirements to results — one view</p>
            <p className="feat-demo-sub">See the traceability matrix built from real test cases, a gap surfacing before a run, and the full requirement → test → bug chain navigated in under two minutes.</p>
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
          <h2 className="feat-cta-headline">Know what's covered. Know what isn't.</h2>
          <p className="feat-cta-sub">Sign up and tag your first test cases with requirement IDs — the matrix assembles itself from there.</p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/features" className="fn-nav-action">All features →</Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
