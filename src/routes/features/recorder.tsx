import { createFileRoute, Link } from "@tanstack/react-router";
import { Video, Play, FileText, Zap } from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/features/recorder")({
  component: RecorderFeaturePage,
});

const STEPS = [
  {
    num: "01",
    tag: "Recording",
    title: "Install the QA Recorder extension",
    body: "The QA Recorder Chrome extension captures clicks, keyboard input, page navigations, network requests, and assertion points from a live browser session as you use your app.",
    note: "→ Chrome extension — captures events in real time",
  },
  {
    num: "02",
    tag: "Import",
    title: "Sessions appear in your recordings inbox",
    body: "After recording, your session is pushed to QAMind automatically. The inbox shows session name, site URL, event count, duration, and status: Pending → Processing → Complete.",
    note: "→ Inbox shows event timeline: click, input, navigate, assert",
  },
  {
    num: "03",
    tag: "AI conversion",
    title: "QAMind converts events to test cases",
    body: "The local Qwen model reads the event sequence and converts it to structured test cases — same format as requirement-based generation. Steps, expected results, and selectors included.",
    note: "→ Same output format as AI test generation",
  },
  {
    num: "04",
    tag: "Output",
    title: "Review, approve, and generate scripts",
    body: "Converted test cases appear as editable rows — same workflow as generated cases. Review and approve them, then generate Playwright .spec.ts scripts from the session.",
    note: "→ Same approval workflow and script generation path",
  },
];

const FACTS = [
  { label: "Extension", value: "QA Recorder — Chrome (availability: request access)" },
  { label: "Captures", value: "Clicks · Keyboard input · Page navigations · Assertions" },
  { label: "Inbox metadata", value: "Session name · Site URL · Event count · Duration · Status" },
  { label: "AI processing", value: "Local Qwen model — same privacy guarantee as test generation" },
  { label: "Output format", value: "Structured test cases — identical to requirement-generated cases" },
  { label: "Next step", value: "Approve cases → generate Playwright scripts via MCP server" },
];

const RELATED = [
  {
    icon: <Zap size={15} strokeWidth={1.75} />,
    name: "AI Test Generation",
    desc: "Alternative input path — paste a spec instead of recording a session.",
    href: "/features/generate",
  },
  {
    icon: <FileText size={15} strokeWidth={1.75} />,
    name: "Script Generator",
    desc: "Convert approved test cases from recordings into Playwright .spec.ts files.",
    href: "/features/scripts",
  },
  {
    icon: <Play size={15} strokeWidth={1.75} />,
    name: "Run History",
    desc: "Run your recording-derived test cases and track results alongside all other runs.",
    href: "/features/runs",
  },
];

function MockRecorder() {
  const events = [
    { type: "navigate", icon: "→", detail: "/login" },
    { type: "input", icon: "⌨", detail: 'type "user@example.com" in #email' },
    { type: "input", icon: "⌨", detail: 'type "••••••••" in #password' },
    { type: "click", icon: "●", detail: "click #login-btn" },
    { type: "navigate", icon: "→", detail: "/dashboard" },
    { type: "assert", icon: "✓", detail: "assert .welcome-msg visible" },
  ];

  return (
    <div className="feat-mock-window">
      <div className="feat-mock-chrome">
        <div className="feat-mock-dots">
          <span className="feat-mock-dot feat-mock-dot-r" />
          <span className="feat-mock-dot feat-mock-dot-y" />
          <span className="feat-mock-dot feat-mock-dot-g" />
        </div>
        <span className="feat-mock-path">qamind.ai / recorder / session-14</span>
        <span className="feat-mock-badge-tag">RECORDING</span>
      </div>
      <div className="feat-mock-body">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "#ece3d6" }}>Login flow — happy path</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>app.example.com · 6 events · 42s</p>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, padding: "0.15rem 0.5rem", borderRadius: 999, border: "1px solid rgba(74,163,84,0.3)", color: "#6ec47a", marginLeft: "auto" }}>Complete</span>
        </div>
        <p className="feat-mock-label-sm mb-2">Event timeline</p>
        {events.map((ev, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.35rem 0", borderBottom: "1px solid #1e1914" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62", width: 16 }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: ev.type === "assert" ? "#6ec47a" : ev.type === "navigate" ? "var(--c-accent)" : "#9b8b7a", width: 12 }}>{ev.icon}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#c8bfb2" }}>{ev.detail}</span>
          </div>
        ))}
        <button className="feat-mock-btn-primary-sm mt-3"><Zap size={10} /> Convert to test cases</button>
      </div>
    </div>
  );
}

function RecorderFeaturePage() {
  return (
    <FeaturePageShell
      title="QA Recorder"
      description="Record a browser session with the QA Recorder Chrome extension. QAMind converts the event sequence into structured test cases — same as requirement-generated cases."
    >
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> QA RECORDER</p>
          <h1 className="feat-headline fade-up fade-up-d1">
            Record once.<br />Test cases follow.
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            Install the QA Recorder Chrome extension. Click through your app as a user would. QAMind converts the session — clicks, inputs, navigations, assertions — into structured test cases ready for review and execution.
          </p>
          <div className="feat-hero-chips fade-up fade-up-d3">
            <span className="feat-chip"><span className="feat-chip-dot" />Chrome extension</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Clicks · inputs · assertions</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Local AI conversion</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Same output as AI generation</span>
          </div>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d4">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started</Link>
            <Link to="/recorder" className="fn-nav-action">Recorder details →</Link>
          </div>
        </div>
      </section>

      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <div className="fade-up"><MockRecorder /></div>
        </div>
      </section>

      <section data-section-theme="light">
        <div className="feat-steps-section">
          <div className="feat-steps-inner">
            <div className="feat-steps-header fade-up">
              <p className="feat-eyebrow"><span style={{ color: "var(--c-accent)" }}>&sect;</span> HOW IT WORKS</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mt-2 max-w-[500px]">
                Record. Import. Convert. Run.
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
            <div className="feat-fact-heading">Recorder specs</div>
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
            <div className="feat-demo-icon"><Video size={22} /></div>
            <p className="feat-demo-label">Video demo</p>
            <p className="feat-demo-title">Record a session. Get test cases.</p>
            <p className="feat-demo-sub">See a login flow recorded with the QA Recorder, the session imported into QAMind, and structured test cases generated from the event sequence — in under five minutes.</p>
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
          <h2 className="feat-cta-headline">The shortest path from using to testing.</h2>
          <p className="feat-cta-sub">Sign up, install the recorder extension, and convert your first browser session into test cases — no spec required, no boilerplate to write.</p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/features/generate" className="fn-nav-action">Generate from spec instead →</Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
