import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, TrendingUp, AlertTriangle, Bug, ClipboardList, GitBranch } from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/features/analytics")({
  component: AnalyticsPage,
});

const STEPS = [
  {
    num: "01",
    tag: "Pass rate",
    title: "Track quality over time",
    body: "The pass rate chart shows the percentage of test cases passing across consecutive runs. Spot a drop the day it happens — not after the sprint review.",
    note: "→ Per suite, per project, or workspace-wide",
  },
  {
    num: "02",
    tag: "Flaky tests",
    title: "Identify instability before it wastes time",
    body: "Flaky test count shows how many cases have flipped between pass and fail across their last 10 runs. Flaky tests are not bugs — they're tracked separately so real failures stay visible.",
    note: "→ Flaky count ≠ open bug count",
  },
  {
    num: "03",
    tag: "Coverage",
    title: "Know what's been tested",
    body: "Coverage is calculated from test case execution — the percentage of approved test cases that have at least one run result. Not code line coverage. Real execution coverage.",
    note: "→ Coverage = executed cases / approved cases",
  },
  {
    num: "04",
    tag: "Bug metrics",
    title: "Open bugs and resolution rate",
    body: "See how many bugs are open, how many were filed this sprint, and how quickly they're being closed. Severity breakdown shows where the risk is concentrated.",
    note: "→ Open count · filed this sprint · resolution rate",
  },
];

const FACTS = [
  { label: "Pass rate", value: "% of approved cases that passed in last run — per suite or total" },
  { label: "Flaky count", value: "Cases that flipped pass/fail in their last 10 runs" },
  { label: "Coverage definition", value: "Executed cases / approved cases (not code line coverage)" },
  { label: "Execution time", value: "Average run duration per suite over time" },
  { label: "Bug metrics", value: "Open count · filed this sprint · severity breakdown · resolution rate" },
  { label: "Dashboard cards", value: "Total cases · Passed · Failed · Last run · Coverage · Flaky" },
];

const RELATED = [
  {
    icon: <ClipboardList size={15} strokeWidth={1.75} />,
    name: "Planner",
    desc: "Sprint coverage targets drive your analytics. Track planned vs. executed per sprint.",
    href: "/features/planner",
  },
  {
    icon: <Bug size={15} strokeWidth={1.75} />,
    name: "Bug Tracker",
    desc: "Bug count and severity feed directly into the analytics dashboard.",
    href: "/features/bugs",
  },
  {
    icon: <GitBranch size={15} strokeWidth={1.75} />,
    name: "Traceability",
    desc: "See coverage gaps — which requirements have test cases and which don't.",
    href: "/features/traceability",
  },
];

function MockAnalytics() {
  return (
    <div className="feat-mock-window">
      <div className="feat-mock-chrome">
        <div className="feat-mock-dots">
          <span className="feat-mock-dot feat-mock-dot-r" />
          <span className="feat-mock-dot feat-mock-dot-y" />
          <span className="feat-mock-dot feat-mock-dot-g" />
        </div>
        <span className="feat-mock-path">qamind.ai / analytics</span>
        <span className="feat-mock-badge-tag">ANALYTICS</span>
      </div>
      <div className="feat-mock-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
          {[
            { label: "Pass Rate", value: "93.5%", trend: "+2.1%" },
            { label: "Flaky Tests", value: "3", trend: "flagged" },
            { label: "Coverage", value: "73%", trend: "of approved" },
          ].map((stat) => (
            <div key={stat.label} className="feat-mock-stat-card">
              <p className="feat-mock-stat-value">{stat.value}</p>
              <p className="feat-mock-stat-label">{stat.label}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--c-accent)", marginTop: 2 }}>{stat.trend}</p>
            </div>
          ))}
        </div>
        <p className="feat-mock-label-sm mb-2">Pass rate — last 7 runs</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60, padding: "0 0 4px" }}>
          {[78, 85, 82, 90, 88, 93, 93.5].map((val, i) => (
            <div key={i} style={{ flex: 1, background: i === 6 ? "var(--c-accent)" : "#2e2520", borderRadius: "3px 3px 0 0", height: `${val}%`, opacity: i === 6 ? 1 : 0.6 + i * 0.05 }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
          {["R83", "R84", "R85", "R86", "R87", "R88", "R89"].map((r) => (
            <span key={r} style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#7d6e62" }}>{r}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  return (
    <FeaturePageShell
      title="Analytics Dashboard"
      description="Pass rate trends, flaky test counts, execution coverage, and bug metrics — six cards, real numbers, no noise."
    >
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> ANALYTICS DASHBOARD</p>
          <h1 className="feat-headline fade-up fade-up-d1">
            Six cards.<br />Real numbers.
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            Pass rate, flaky test count, coverage, open bugs, last run status. QAMind's analytics dashboard gives you the state of your test suite at a glance — not a stadium scoreboard, not a BI tool. Just what matters.
          </p>
          <div className="feat-hero-chips fade-up fade-up-d3">
            <span className="feat-chip"><span className="feat-chip-dot" />Pass rate over time</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Flaky detection</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Execution coverage</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Bug metrics</span>
          </div>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d4">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started</Link>
            <Link to="/features/reports" className="fn-nav-action">Reports →</Link>
          </div>
        </div>
      </section>

      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <div className="fade-up"><MockAnalytics /></div>
        </div>
      </section>

      <section data-section-theme="light">
        <div className="feat-steps-section">
          <div className="feat-steps-inner">
            <div className="feat-steps-header fade-up">
              <p className="feat-eyebrow"><span style={{ color: "var(--c-accent)" }}>&sect;</span> WHAT YOU SEE</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mt-2 max-w-[500px]">
                One answer per question. No noise.
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
          <p className="feat-eyebrow mb-4 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> METRICS DEFINED</p>
          <div className="feat-fact-box fade-up fade-up-d1">
            <div className="feat-fact-heading">Analytics metrics</div>
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
            <div className="feat-demo-icon"><TrendingUp size={22} /></div>
            <p className="feat-demo-label">Video demo</p>
            <p className="feat-demo-title">Analytics dashboard walkthrough</p>
            <p className="feat-demo-sub">See how pass rate, flaky count, and coverage update after a run — and how to interpret each metric without opening a second tool.</p>
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
          <h2 className="feat-cta-headline">Know your quality state in one look.</h2>
          <p className="feat-cta-sub">Sign up, run your first suite, and the analytics dashboard populates automatically from the results.</p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/features/reports" className="fn-nav-action">Export reports →</Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
