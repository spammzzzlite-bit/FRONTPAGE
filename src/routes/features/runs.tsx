import { createFileRoute, Link } from "@tanstack/react-router";
import { History, Bug, BarChart3, Layers, Play, AlertTriangle } from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/features/runs")({
  component: RunsPage,
});

const STEPS = [
  {
    num: "01",
    tag: "Trigger",
    title: "Run from any suite",
    body: "Trigger a run from the suite view or from the generate-scripts page. Each run executes every Approved case in the suite and collects results in real time.",
    note: "→ Requires the local Playwright runner (MCP server port 3100)",
  },
  {
    num: "02",
    tag: "Results",
    title: "Per-case pass / fail / skip",
    body: "Results come back as a log per test case. Each case shows its status, the full error output on failure, and the selector or assertion that caused it.",
    note: "→ Full error detail — no truncation",
  },
  {
    num: "03",
    tag: "Flaky detection",
    title: "Identify instability automatically",
    body: "QAMind tracks results across the last 10 runs per test case. A case that flips between pass and fail is flagged as flaky — not filed as a new bug. Your team chases real failures.",
    note: "→ Flaky flag: test flipped in last 10 runs",
  },
  {
    num: "04",
    tag: "Bug filing",
    title: "One click from failure to tracked bug",
    body: "On any failed case, one click creates a bug in the Bug Tracker — pre-linked to the test case, the run, and the error output. No copy-pasting between tabs.",
    note: "→ Bug linked to exact run and test case",
  },
];

const FACTS = [
  { label: "Run types", value: "Full suite · Smoke · Selected cases (multi-select)" },
  { label: "Results", value: "Passed · Failed · Skipped — per test case, per run" },
  { label: "Flaky threshold", value: "Case flagged flaky if results flip across last 10 runs" },
  { label: "Retention", value: "Full run history kept indefinitely" },
  { label: "Error detail", value: "Full Playwright error output, stack trace, and selector info" },
  { label: "Bug creation", value: "One click from a failed case — pre-populated, linked to run" },
];

const RELATED = [
  {
    icon: <Bug size={15} strokeWidth={1.75} />,
    name: "Bug Tracker",
    desc: "File bugs from failed runs. Linked to the exact test case, run, and error output.",
    href: "/features/bugs",
  },
  {
    icon: <BarChart3 size={15} strokeWidth={1.75} />,
    name: "Analytics",
    desc: "Pass rate over time, flaky test counts, and regression trends — all derived from runs.",
    href: "/features/analytics",
  },
  {
    icon: <Layers size={15} strokeWidth={1.75} />,
    name: "Test Suites",
    desc: "Runs are triggered per suite. Manage which cases are Approved before running.",
    href: "/features/suites",
  },
];

function MockRuns() {
  const runs = [
    { id: "RUN-089", suite: "Auth — Regression", date: "2 min ago", passed: 4, failed: 1, skipped: 0, status: "Failed" },
    { id: "RUN-088", suite: "Auth — Regression", date: "1 day ago", passed: 5, failed: 0, skipped: 0, status: "Passed" },
    { id: "RUN-087", suite: "Checkout — Smoke", date: "2 days ago", passed: 8, failed: 2, skipped: 1, status: "Failed" },
  ];

  return (
    <div className="feat-mock-window">
      <div className="feat-mock-chrome">
        <div className="feat-mock-dots">
          <span className="feat-mock-dot feat-mock-dot-r" />
          <span className="feat-mock-dot feat-mock-dot-y" />
          <span className="feat-mock-dot feat-mock-dot-g" />
        </div>
        <span className="feat-mock-path">qamind.ai / runs</span>
        <span className="feat-mock-badge-tag">RUN HISTORY</span>
      </div>
      <div className="feat-mock-body">
        <p className="feat-mock-label-sm mb-2">Recent runs</p>
        {runs.map((run) => (
          <div key={run.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #2a2018", display: "grid", gridTemplateColumns: "3rem 1fr auto auto", gap: "0 0.75rem", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>{run.id}</span>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#c8bfb2" }}>{run.suite}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>{run.date}</p>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>
              <span style={{ color: "#6ec47a" }}>{run.passed}✓</span>{" "}
              {run.failed > 0 && <span style={{ color: "#e57373" }}>{run.failed}✗</span>}{" "}
              {run.skipped > 0 && <span style={{ color: "#9b8b7a" }}>{run.skipped}—</span>}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, padding: "0.15rem 0.4rem", borderRadius: 4, border: "1px solid", borderColor: run.status === "Passed" ? "rgba(74,163,84,0.3)" : "rgba(229,115,115,0.3)", color: run.status === "Passed" ? "#6ec47a" : "#e57373" }}>{run.status}</span>
          </div>
        ))}
        <div style={{ marginTop: 12, padding: "0.75rem", background: "#1e1914", borderRadius: 6, border: "1px solid #2e2520" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#d9744a", marginBottom: 4 }}>⚠ TC-042 — FLAKY</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "#b5a898" }}>Reset link expiry — flipped pass/fail across last 4 runs. Not filed as a bug.</p>
        </div>
      </div>
    </div>
  );
}

function RunsPage() {
  return (
    <FeaturePageShell
      title="Run History"
      description="Every test run tracked — per-case pass/fail/skip, full error detail, flaky detection across 10 runs, and one-click bug filing from any failure."
    >
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> RUN HISTORY</p>
          <h1 className="feat-headline fade-up fade-up-d1">
            Every run.<br />Full context.
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            QAMind stores every test run indefinitely — per-case results, full error output, and flaky detection across the last 10 runs. When something fails, you have everything you need to act on it.
          </p>
          <div className="feat-hero-chips fade-up fade-up-d3">
            <span className="feat-chip"><span className="feat-chip-dot" />Pass / fail / skip per case</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Flaky detection — last 10 runs</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Full error output</span>
            <span className="feat-chip"><span className="feat-chip-dot" />One-click bug filing</span>
          </div>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d4">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started</Link>
            <Link to="/features/bugs" className="fn-nav-action">Bug tracker →</Link>
          </div>
        </div>
      </section>

      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <div className="fade-up"><MockRuns /></div>
        </div>
      </section>

      <section data-section-theme="light">
        <div className="feat-steps-section">
          <div className="feat-steps-inner">
            <div className="feat-steps-header fade-up">
              <p className="feat-eyebrow"><span style={{ color: "var(--c-accent)" }}>&sect;</span> HOW IT WORKS</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mt-2 max-w-[500px]">
                Run. Track. Act. Don't guess.
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
            <div className="feat-fact-heading">Run history specs</div>
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
            <div className="feat-demo-icon"><AlertTriangle size={22} /></div>
            <p className="feat-demo-label">Video demo</p>
            <p className="feat-demo-title">Run, fail, file — in one flow</p>
            <p className="feat-demo-sub">Watch a full suite run, drill into a failed case, see the error detail, and file a tracked bug — all without leaving QAMind.</p>
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
          <h2 className="feat-cta-headline">Stop guessing. Start tracking.</h2>
          <p className="feat-cta-sub">Every run stores full context — no log retention config, no external storage. Sign up and run your first suite in minutes.</p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/features" className="fn-nav-action">All features →</Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
