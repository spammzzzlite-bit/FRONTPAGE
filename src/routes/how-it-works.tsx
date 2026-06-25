import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — QAMind AI" },
      {
        name: "description",
        content:
          "See the full QAMind AI workflow — from spec to tested feature in six steps.",
      },
    ],
  }),
  component: HowItWorksPage,
});

// ─── Window chrome ────────────────────────────────────────────────────────────

function WindowChrome({ path }: { path: string }) {
  return (
    <div className="hiw-window-chrome">
      <div className="hiw-window-dots">
        <span className="hiw-dot hiw-dot-red" />
        <span className="hiw-dot hiw-dot-yellow" />
        <span className="hiw-dot hiw-dot-green" />
      </div>
      <span className="hiw-window-path">{path}</span>
      <span className="hiw-mock-badge">MOCK</span>
    </div>
  );
}

// ─── Step 1: Workspace ────────────────────────────────────────────────────────

function MockWorkspace() {
  return (
    <div className="hiw-app-window">
      <WindowChrome path="qamind.app / projects" />
      <div className="hiw-window-body">
        <div className="hiw-mock-toolbar">
          <span className="hiw-mock-label">Projects</span>
          <button className="hiw-mock-btn-primary" tabIndex={-1}>+ New project</button>
        </div>
        <div className="hiw-mock-card">
          <div className="hiw-mock-card-head">
            <span className="hiw-mock-card-name">Checkout Flow v2</span>
            <span className="hiw-mock-chip hiw-chip-neutral">Active</span>
          </div>
          <p className="hiw-mock-card-desc">
            End-to-end coverage for the new Stripe checkout, guest flow, and order confirmation.
          </p>
          <div className="hiw-mock-card-meta">
            <span>Sprint 4</span>
            <span>·</span>
            <span>47 test cases</span>
            <span>·</span>
            <span className="hiw-mock-pass-text">93.5% pass</span>
          </div>
        </div>
        <div className="hiw-mock-card hiw-card-dim">
          <div className="hiw-mock-card-head">
            <span className="hiw-mock-card-name">Auth &amp; Permissions</span>
            <span className="hiw-mock-chip hiw-chip-muted">Idle</span>
          </div>
          <p className="hiw-mock-card-desc">
            Login, OAuth, role-based access, and session timeout flows.
          </p>
          <div className="hiw-mock-card-meta">
            <span>Sprint 3</span>
            <span>·</span>
            <span>31 test cases</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Generate ─────────────────────────────────────────────────────────

function MockGenerate() {
  return (
    <div className="hiw-app-window">
      <WindowChrome path="qamind.app / generate" />
      <div className="hiw-window-body hiw-two-col">
        <div className="hiw-gen-input-col">
          <p className="hiw-mock-label">Requirement</p>
          <div className="hiw-gen-spec-box">
            <p className="hiw-gen-spec-text">
              User can add item to cart, update quantity, and proceed to checkout. Guest users are prompted to sign in or continue as guest.
            </p>
            <div className="hiw-gen-cursor" aria-hidden="true" />
          </div>
          <button className="hiw-mock-btn-primary hiw-gen-btn" tabIndex={-1}>
            Generate cases
          </button>
        </div>
        <div className="hiw-gen-output-col">
          <p className="hiw-mock-label">Generated — 4 cases</p>
          {["Add item to cart", "Update item quantity", "Guest checkout prompt", "Proceed to checkout"].map((name, i) => (
            <div key={i} className="hiw-gen-case-row">
              <span className="hiw-mock-chip hiw-chip-draft">Draft</span>
              <span className="hiw-gen-case-name">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Suites ───────────────────────────────────────────────────────────

function MockSuites() {
  const cases = [
    { name: "Add item to cart", status: "passed" },
    { name: "Update item quantity", status: "passed" },
    { name: "Guest checkout prompt", status: "failed" },
    { name: "Proceed to checkout", status: "passed" },
    { name: "Order confirmation email", status: "draft" },
  ];
  return (
    <div className="hiw-app-window">
      <WindowChrome path="qamind.app / suites / checkout-flow" />
      <div className="hiw-window-body">
        <div className="hiw-mock-toolbar">
          <span className="hiw-mock-label">Checkout Flow v2</span>
          <button className="hiw-mock-btn-ghost" tabIndex={-1}>Run suite →</button>
        </div>
        <div className="hiw-suite-table">
          {cases.map((c, i) => (
            <div key={i} className="hiw-suite-row">
              <span className="hiw-suite-checkbox" aria-hidden="true" />
              <span className="hiw-suite-name">{c.name}</span>
              <span className={`hiw-mock-chip ${c.status === "passed" ? "hiw-chip-pass"
                  : c.status === "failed" ? "hiw-chip-fail"
                    : "hiw-chip-draft"
                }`}>
                {c.status === "passed" ? "Passed" : c.status === "failed" ? "Failed" : "Draft"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Run ──────────────────────────────────────────────────────────────

function MockRun() {
  const rows = [
    { name: "Add item to cart", time: "1.2s", status: "passed" },
    { name: "Update item quantity", time: "0.9s", status: "passed" },
    { name: "Guest checkout prompt", time: "2.1s", status: "failed" },
    { name: "Proceed to checkout", time: "1.8s", status: "passed" },
    { name: "Order confirmation email", time: "1.4s", status: "passed" },
  ];
  return (
    <div className="hiw-app-window">
      <WindowChrome path="qamind.app / runs / run-89" />
      <div className="hiw-window-body">
        <div className="hiw-run-header">
          <span className="hiw-run-title">Run #89</span>
          <span className="hiw-mock-chip hiw-chip-neutral">7.4s · 2 min ago</span>
          <div className="hiw-run-bar">
            <div className="hiw-run-bar-pass" style={{ width: "80%" }} />
            <div className="hiw-run-bar-fail" style={{ width: "20%" }} />
          </div>
        </div>
        <div className="hiw-suite-table">
          {rows.map((r, i) => (
            <div key={i} className="hiw-suite-row">
              <span className={`hiw-run-dot ${r.status === "passed" ? "hiw-dot-pass" : "hiw-dot-fail"}`} aria-hidden="true" />
              <span className="hiw-suite-name">{r.name}</span>
              <span className="hiw-run-time">{r.time}</span>
              <span className={`hiw-mock-chip ${r.status === "passed" ? "hiw-chip-pass" : "hiw-chip-fail"}`}>
                {r.status === "passed" ? "Passed" : "Failed"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Bugs ─────────────────────────────────────────────────────────────

function MockBug() {
  return (
    <div className="hiw-app-window">
      <WindowChrome path="qamind.app / bugs / BUG-014" />
      <div className="hiw-window-body">
        <div className="hiw-bug-card">
          <div className="hiw-bug-header">
            <span className="hiw-mono-id">BUG-014</span>
            <span className="hiw-mock-chip hiw-chip-fail">Open</span>
          </div>
          <h4 className="hiw-bug-title">
            Guest checkout prompt not displayed for unauthenticated user
          </h4>
          <div className="hiw-bug-meta-row">
            <div className="hiw-bug-meta-item">
              <span className="hiw-bug-meta-label">Linked test</span>
              <span className="hiw-link-text">Guest checkout prompt</span>
            </div>
            <div className="hiw-bug-meta-item">
              <span className="hiw-bug-meta-label">Run</span>
              <span className="hiw-link-text">Run #89</span>
            </div>
            <div className="hiw-bug-meta-item">
              <span className="hiw-bug-meta-label">Severity</span>
              <span className="hiw-mock-chip hiw-chip-fail-soft">High</span>
            </div>
          </div>
          <div className="hiw-bug-trace">
            <span className="hiw-mono-dim">Expected: </span>Guest modal visible at /checkout<br />
            <span className="hiw-mono-dim">Got: </span>Redirected to /auth without modal
          </div>
          <p className="hiw-bug-auto-note">Auto-filed from Run #89 · 2 min ago</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 6: Analytics ────────────────────────────────────────────────────────

function MockAnalytics() {
  const bars = [68, 74, 71, 88, 93];
  const labels = ["W1", "W2", "W3", "W4", "W5"];
  return (
    <div className="hiw-app-window">
      <WindowChrome path="qamind.app / analytics" />
      <div className="hiw-window-body">
        <div className="hiw-stat-row">
          <div className="hiw-stat-chip hiw-stat-pass">
            <span className="hiw-stat-val">93.5%</span>
            <span className="hiw-stat-lbl">Pass rate</span>
          </div>
          <div className="hiw-stat-chip">
            <span className="hiw-stat-val">16</span>
            <span className="hiw-stat-lbl">Failed</span>
          </div>
          <div className="hiw-stat-chip hiw-stat-flaky">
            <span className="hiw-stat-val">3</span>
            <span className="hiw-stat-lbl">Flaky</span>
          </div>
        </div>
        <div className="hiw-chart-area">
          <p className="hiw-mock-label hiw-chart-label">Pass rate — last 5 weeks</p>
          <div className="hiw-bar-chart">
            {bars.map((h, i) => (
              <div key={i} className="hiw-bar-col">
                <div className="hiw-bar" style={{ height: `${h}%` }} />
                <span className="hiw-bar-lbl">{labels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Steps data ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: "01", tag: "WORKSPACE", theme: "light" as const,
    title: "Create a project.",
    body: "One workspace holds everything — test cases, runs, bugs, reports. Name it, describe what it covers, open it. No setup wizard, no onboarding flow.",
    note: "Projects stay focused. One feature set, one workspace.",
    mock: <MockWorkspace />,
    flip: false,
  },
  {
    n: "02", tag: "GENERATE", theme: "dark" as const,
    title: "Paste a requirement. Get test cases.",
    body: "Paste your spec document, user story, or OpenAPI definition. QAMind drafts structured Playwright cases as plain editable rows — no prompt engineering.",
    note: "QAMind caught 4 edge cases missed in the original spec review.",
    mock: <MockGenerate />,
    flip: true,
  },
  {
    n: "03", tag: "SUITES", theme: "light" as const,
    title: "Review and organise into suites.",
    body: "Review generated cases, delete what doesn't fit, and move the rest into a suite. A suite is a named group — smoke, regression, sprint. Run everything or just part.",
    note: "Coverage is at 73% on this suite. Here's the gap.",
    mock: <MockSuites />,
    flip: false,
  },
  {
    n: "04", tag: "RUN", theme: "dark" as const,
    title: "One click. CI, or on-demand.",
    body: "Trigger a run from inside QAMind or connect your CI pipeline. Every test executes in Playwright. Results come back as a pass/fail log — not a notification banner.",
    note: "Run #89 finished in 7.4s. 4 passed, 1 failed.",
    mock: <MockRun />,
    flip: true,
  },
  {
    n: "05", tag: "BUGS", theme: "light" as const,
    title: "Failed tests file bugs. You don't.",
    body: "Any test that fails creates a tracked bug automatically — linked to the exact test case, the run, and the stack trace. You investigate. You don't transcribe.",
    note: "BUG-014 auto-filed 2 minutes after Run #89 completed.",
    mock: <MockBug />,
    flip: false,
  },
  {
    n: "06", tag: "ANALYSE", theme: "dark" as const,
    title: "Pass rate, coverage, flaky count.",
    body: "The analytics page shows pass rate trend, total runs, open bugs, and flaky test count. One chart per question — not a stadium scoreboard.",
    note: "3 flaky tests flagged this sprint. Here's why, and the fix.",
    mock: <MockAnalytics />,
    flip: true,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function HowItWorksPage() {
  return (
    <div data-section-theme="dark" className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
      <header className="field-nav w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]"
            aria-label="QAMind AI home"
          >
            <img
              src="/brand/appicon-primary.png"
              alt=""
              aria-hidden="true"
              className="h-[30px] w-[30px] flex-shrink-0 rounded-[7px]"
            />
            <span className="font-display text-[16px] font-semibold leading-none tracking-[-0.025em] text-[var(--c-text)]">
              QAMind <span className="text-[var(--c-accent)]">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="fn-nav-action">← Home</Link>
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section data-section-theme="dark">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <p className="hiw-eyebrow mb-5">
              <span className="text-[var(--c-accent)]">&sect;</span> HOW IT WORKS
            </p>
            <h1 className="font-display text-4xl leading-[1.04] tracking-[-0.02em] md:text-6xl mb-5 max-w-[680px]">
              From idea to tested feature.
            </h1>
            <p className="text-[16px] text-[var(--c-text-muted)] leading-relaxed max-w-[500px] mb-10">
              Six steps. Spec in, Playwright results out, bugs filed, nothing missing.
            </p>
            <div className="hiw-hero-steps">
              {STEPS.map((s) => (
                <div key={s.n} className="hiw-hero-step-pill">
                  <span className="hiw-hero-step-n">§{s.n}</span>
                  <span className="hiw-hero-step-tag">{s.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        {STEPS.map((step) => (
          <section key={step.n} data-section-theme={step.theme}>
            <div className={`mx-auto max-w-7xl px-6 py-16 md:py-24 hiw-step-grid${step.flip ? " hiw-step-flip" : ""}`}>
              <div className="hiw-step-copy">
                <p className="hiw-step-eyebrow">
                  <span className="text-[var(--c-accent)]">&sect;{step.n}</span>
                  <span className="hiw-step-tag-label">{step.tag}</span>
                </p>
                <h2 className="hiw-step-title">{step.title}</h2>
                <p className="hiw-step-body">{step.body}</p>
                <p className="hiw-step-note">
                  <span className="text-[var(--c-accent)] mr-1.5">→</span>
                  {step.note}
                </p>
              </div>
              <div className="hiw-step-visual">
                {step.mock}
              </div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section data-section-theme="light">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 text-center">
            <p className="hiw-eyebrow mb-5">
              <span className="text-[var(--c-accent)]">&sect;</span> GET STARTED
            </p>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.04] tracking-[-0.02em] mb-6 max-w-[520px] mx-auto">
              Ready to run your first test suite?
            </h2>
            <p className="text-[15px] text-[var(--c-text-muted)] leading-relaxed max-w-[400px] mx-auto mb-10">
              10,000+ test cases generated. Playwright native. No seat fees.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">
                Get started free
              </Link>
              <Link to="/" className="fn-nav-action">← Back to home</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
