import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingDown, BarChart3, Bug, History, AlertTriangle } from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/features/regression")({
  component: RegressionPage,
});

const STEPS = [
  {
    num: "01",
    tag: "Baseline",
    title: "Every run is a snapshot",
    body: "Each suite run stores a complete snapshot: which cases passed, which failed, which were skipped. QAMind compares consecutive run snapshots to identify tests that changed state.",
    note: "→ Run snapshots stored indefinitely",
  },
  {
    num: "02",
    tag: "Detection",
    title: "Previously passing tests that now fail",
    body: "The regression view filters to tests that passed in a previous run but failed in the most recent one. These are regressions — code that was working and now isn't.",
    note: "→ Previous pass + current fail = regression",
  },
  {
    num: "03",
    tag: "Triage",
    title: "Investigate with full context",
    body: "Each regression row shows the test case, the two runs being compared, and the full error output from the failing run. No context switching — everything is in one view.",
    note: "→ Comparison: run N-1 vs. run N",
  },
  {
    num: "04",
    tag: "Action",
    title: "File a bug or re-run the case",
    body: "From a regression row, file a tracked bug with one click (full context pre-populated) or re-run the specific test case to verify if the failure is consistent.",
    note: "→ Bug filed linked to both runs in the comparison",
  },
];

const FACTS = [
  { label: "Definition", value: "Case that passed in run N-1 and failed in run N" },
  { label: "Comparison", value: "Consecutive runs within the same suite" },
  { label: "Context", value: "Full error output from the failing run, visible inline" },
  { label: "Bug filing", value: "One click from any regression row — pre-populated with both run IDs" },
  { label: "Flaky distinction", value: "Flaky = inconsistent across 10 runs. Regression = newly broken." },
  { label: "Export", value: "Regression list included in the AI Test Report .xlsx export" },
];

const RELATED = [
  {
    icon: <History size={15} strokeWidth={1.75} />,
    name: "Run History",
    desc: "Regression analysis is built from run snapshots. Every run is stored indefinitely.",
    href: "/features/runs",
  },
  {
    icon: <Bug size={15} strokeWidth={1.75} />,
    name: "Bug Tracker",
    desc: "File tracked bugs directly from any regression row — context pre-populated.",
    href: "/features/bugs",
  },
  {
    icon: <BarChart3 size={15} strokeWidth={1.75} />,
    name: "Analytics",
    desc: "Regression count appears on the analytics dashboard alongside pass rate and flaky count.",
    href: "/features/analytics",
  },
];

function MockRegression() {
  const regressions = [
    { id: "TC-042", title: "Reset link expiry at 30 min", suite: "Auth Regression", prev: "RUN-088 ✓", curr: "RUN-089 ✗", error: "Expected expiry redirect — got 200 OK" },
    { id: "TC-031", title: "Checkout total on .5 quantities", suite: "Checkout Smoke", prev: "RUN-086 ✓", curr: "RUN-087 ✗", error: "AssertionError: expected 14.50 but got 14.00" },
  ];

  return (
    <div className="feat-mock-window">
      <div className="feat-mock-chrome">
        <div className="feat-mock-dots">
          <span className="feat-mock-dot feat-mock-dot-r" />
          <span className="feat-mock-dot feat-mock-dot-y" />
          <span className="feat-mock-dot feat-mock-dot-g" />
        </div>
        <span className="feat-mock-path">qamind.ai / regression</span>
        <span className="feat-mock-badge-tag">REGRESSION VIEW</span>
      </div>
      <div className="feat-mock-body">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>Comparing:</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, padding: "0.15rem 0.4rem", border: "1px solid #2e2520", borderRadius: 4, color: "#c8bfb2" }}>Last run vs. previous</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#e57373", marginLeft: "auto" }}>2 regressions found</span>
        </div>
        {regressions.map((r) => (
          <div key={r.id} style={{ padding: "0.75rem 0.625rem", marginBottom: 8, background: "#1e1914", border: "1px solid rgba(229,115,115,0.2)", borderRadius: 7 }}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>{r.id}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, padding: "0.1rem 0.35rem", borderRadius: 4, border: "1px solid rgba(229,115,115,0.3)", color: "#e57373" }}>REGRESSION</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#7d6e62", marginLeft: "auto" }}>{r.suite}</span>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#c8bfb2", marginBottom: 6 }}>{r.title}</p>
            <div className="flex gap-3 mb-2">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6ec47a" }}>{r.prev}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>→</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#e57373" }}>{r.curr}</span>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62", lineHeight: 1.5 }}>{r.error}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegressionPage() {
  return (
    <FeaturePageShell
      title="Regression Analysis"
      description="See which tests passed last run and failed this one. Regression view surfaces newly broken tests with full error context so you can act immediately."
    >
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> REGRESSION ANALYSIS</p>
          <h1 className="feat-headline fade-up fade-up-d1">
            What was passing<br />that now isn't?
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            The regression view compares your most recent run against the previous one and surfaces every test that flipped from pass to fail. Full error context is visible inline — no digging through logs.
          </p>
          <div className="feat-hero-chips fade-up fade-up-d3">
            <span className="feat-chip"><span className="feat-chip-dot" />Consecutive run comparison</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Pass → Fail detection</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Full error context inline</span>
            <span className="feat-chip"><span className="feat-chip-dot" />One-click bug filing</span>
          </div>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d4">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started</Link>
            <Link to="/features/runs" className="fn-nav-action">Run history →</Link>
          </div>
        </div>
      </section>

      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <div className="fade-up"><MockRegression /></div>
        </div>
      </section>

      <section data-section-theme="light">
        <div className="feat-steps-section">
          <div className="feat-steps-inner">
            <div className="feat-steps-header fade-up">
              <p className="feat-eyebrow"><span style={{ color: "var(--c-accent)" }}>&sect;</span> HOW IT WORKS</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mt-2 max-w-[500px]">
                Find what broke. Act on it immediately.
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
            <div className="feat-fact-heading">Regression detection specs</div>
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
            <div className="feat-demo-icon"><TrendingDown size={22} /></div>
            <p className="feat-demo-label">Video demo</p>
            <p className="feat-demo-title">Spot regressions before the sprint review</p>
            <p className="feat-demo-sub">See two consecutive runs compared, regressions surfaced with error context, and a bug filed in one click — all in under three minutes.</p>
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
          <h2 className="feat-cta-headline">Find regressions the run they appear.</h2>
          <p className="feat-cta-sub">Sign up, run your suite twice, and the regression view populates automatically from the comparison.</p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/features/analytics" className="fn-nav-action">Analytics →</Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
