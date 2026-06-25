import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Chrome, MousePointer2, Import, TestTube2, Zap, Shield } from "lucide-react";
import { RecorderDownloadModal } from "@/components/landing/RecorderDownloadModal";

export const Route = createFileRoute("/recorder")({
  head: () => ({
    meta: [
      { title: "QA Recorder — QAMind AI" },
      { name: "description", content: "Record browser sessions. QAMind converts them to runnable Playwright tests. No selectors, no boilerplate." },
    ],
  }),
  component: RecorderPage,
});

// ─── Mocks ───────────────────────────────────────────────────────────────────

function MockChromeStore() {
  return (
    <div className="rec-page-window">
      <div className="hiw-window-chrome">
        <div className="hiw-window-dots">
          <span className="hiw-dot hiw-dot-red" /><span className="hiw-dot hiw-dot-yellow" /><span className="hiw-dot hiw-dot-green" />
        </div>
        <span className="hiw-window-path">chromewebstore.google.com / QA Recorder</span>
        <span className="hiw-mock-badge">MOCK</span>
      </div>
      <div className="hiw-window-body">
        <div className="rec-store-card">
          <div className="rec-store-icon" aria-hidden="true">
            <div className="rec-store-dot" />
          </div>
          <div className="rec-store-info">
            <h4 className="rec-store-name">QA Recorder</h4>
            <p className="rec-store-meta">by QAMind AI · ⭐ 4.9 · 2.3k users</p>
            <p className="rec-store-desc">Record browser sessions and import as Playwright test cases into QAMind.</p>
          </div>
          <button className="rec-store-btn" tabIndex={-1}>Add to Chrome</button>
        </div>
        <div className="rec-store-perms">
          <p className="hiw-mock-label">Permissions</p>
          <div className="rec-perm-row"><span className="rec-perm-dot" />Read and change your data on the websites you visit</div>
          <div className="rec-perm-row"><span className="rec-perm-dot" />Display notifications</div>
        </div>
      </div>
    </div>
  );
}

function MockExtensionPopup() {
  const events = [
    "click #login-btn",
    'type "user@example.com"',
    "navigate /dashboard",
    "assert .welcome-msg visible",
  ];
  return (
    <div className="rec-page-window rec-window-centered">
      <div className="hiw-window-chrome">
        <div className="hiw-window-dots">
          <span className="hiw-dot hiw-dot-red" /><span className="hiw-dot hiw-dot-yellow" /><span className="hiw-dot hiw-dot-green" />
        </div>
        <span className="hiw-window-path">Chrome extension popup</span>
        <span className="hiw-mock-badge">MOCK</span>
      </div>
      <div className="hiw-window-body">
        <div className="rec-ext-full">
          <div className="rec-ext-header">
            <div className="rec-ext-title-row">
              <span className="rec-ext-title-text">QA Recorder</span>
              <div className="rec-ext-status">
                <span className="rec-recording-dot" aria-hidden="true" />
                <span className="rec-ext-status-label">RECORDING</span>
              </div>
            </div>
            <div className="rec-ext-timer">00:14</div>
          </div>
          <div className="rec-ext-events">
            {events.map((ev, i) => (
              <div key={i} className={`rec-ext-event-row rec-page-ev-${i}`}>
                <span className="rec-ext-check">✓</span>
                <span className="rec-ext-ev-text">{ev}</span>
              </div>
            ))}
          </div>
          <button className="rec-ext-stop-btn" tabIndex={-1}>Stop &amp; Import →</button>
        </div>
      </div>
    </div>
  );
}

function MockImport() {
  return (
    <div className="rec-page-window">
      <div className="hiw-window-chrome">
        <div className="hiw-window-dots">
          <span className="hiw-dot hiw-dot-red" /><span className="hiw-dot hiw-dot-yellow" /><span className="hiw-dot hiw-dot-green" />
        </div>
        <span className="hiw-window-path">qamind.app / import</span>
        <span className="hiw-mock-badge">MOCK</span>
      </div>
      <div className="hiw-window-body">
        <div className="rec-import-drop">
          <div className="rec-import-icon" aria-hidden="true">↓</div>
          <p className="rec-import-label">Drop recording here</p>
          <p className="rec-import-sub">or click to browse · .qrec files</p>
        </div>
        <div className="rec-import-preview">
          <p className="hiw-mock-label">Detected — 4 actions</p>
          {["click #login-btn", 'type "user@example.com"', "navigate /dashboard", "assert .welcome-msg"].map((ev, i) => (
            <div key={i} className="hiw-gen-case-row">
              <span className="hiw-mock-chip hiw-chip-draft">Draft</span>
              <span className="hiw-gen-case-name">{ev}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockTestOutput() {
  const cases = [
    { name: "Login button click", status: "passed" },
    { name: "Email field input", status: "passed" },
    { name: "Dashboard navigation", status: "passed" },
    { name: "Welcome message assertion", status: "passed" },
  ];
  return (
    <div className="rec-page-window">
      <div className="hiw-window-chrome">
        <div className="hiw-window-dots">
          <span className="hiw-dot hiw-dot-red" /><span className="hiw-dot hiw-dot-yellow" /><span className="hiw-dot hiw-dot-green" />
        </div>
        <span className="hiw-window-path">qamind.app / suites / login-flow</span>
        <span className="hiw-mock-badge">MOCK</span>
      </div>
      <div className="hiw-window-body">
        <div className="hiw-mock-toolbar">
          <span className="hiw-mock-label">Login Flow — 4 cases</span>
          <button className="hiw-mock-btn-primary" tabIndex={-1}>Run suite →</button>
        </div>
        <div className="hiw-suite-table">
          {cases.map((c, i) => (
            <div key={i} className="hiw-suite-row">
              <span className="hiw-suite-checkbox" aria-hidden="true" />
              <span className="hiw-suite-name">{c.name}</span>
              <span className="hiw-mock-chip hiw-chip-pass">Ready</span>
            </div>
          ))}
        </div>
        <p className="rec-output-note">Converted from recording · ready to run</p>
      </div>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: "01", tag: "INSTALL", theme: "light" as const,
    title: "One click from the Chrome Web Store.",
    body: "Find QA Recorder in the Chrome Web Store and click Add to Chrome. No account required for installation. The extension adds a record button to your Chrome toolbar.",
    note: "Free to install. No credit card.",
    mock: <MockChromeStore />, flip: false,
  },
  {
    n: "02", tag: "RECORD", theme: "dark" as const,
    title: "Click through your app. We capture everything.",
    body: "Open any web app and hit record. QA Recorder captures every click, keyboard input, navigation, and assertion point as you interact — exactly as a user would.",
    note: "No selectors written by hand. No script setup.",
    mock: <MockExtensionPopup />, flip: true,
  },
  {
    n: "03", tag: "IMPORT", theme: "light" as const,
    title: "Drag the recording into QAMind.",
    body: "Hit 'Stop & Import'. QAMind receives the session, reads each captured action, and converts them into structured test case steps. Review and rename — nothing runs until you say so.",
    note: "4 actions in this session → 4 test cases, ready to review.",
    mock: <MockImport />, flip: false,
  },
  {
    n: "04", tag: "RUN", theme: "dark" as const,
    title: "Tests are ready. Run when you are.",
    body: "Approved cases move into a suite. Run on-demand or connect your CI pipeline. Results come back as pass/fail. Failed cases file bugs automatically.",
    note: "Login Flow suite passed in 3.2s.",
    mock: <MockTestOutput />, flip: true,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function RecorderPage() {
  const [downloadOpen, setDownloadOpen] = useState(false);

  return (
    <div data-section-theme="dark" className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
      <RecorderDownloadModal open={downloadOpen} onClose={() => setDownloadOpen(false)} />

      <header className="field-nav w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]" aria-label="QAMind AI home">
            <img src="/brand/appicon-primary.png" alt="" aria-hidden="true" className="h-[30px] w-[30px] flex-shrink-0 rounded-[7px]" />
            <span className="font-display text-[16px] font-semibold leading-none tracking-[-0.025em] text-[var(--c-text)]">
              QAMind <span className="text-[var(--c-accent)]">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="fn-nav-action">← Home</Link>
            <button onClick={() => setDownloadOpen(true)} className="fn-nav-action is-primary flex items-center gap-1.5">
              <Download size={13} strokeWidth={2} /> Download
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section data-section-theme="dark">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <p className="hiw-eyebrow mb-5"><span className="text-[var(--c-accent)]">&sect;</span> CHROME EXTENSION</p>
            <h1 className="font-display text-4xl leading-[1.04] tracking-[-0.02em] md:text-6xl mb-5 max-w-[680px]">
              Record once.<br />Tests follow.
            </h1>
            <p className="text-[16px] text-[var(--c-text-muted)] leading-relaxed max-w-[500px] mb-8">
              Install QA Recorder. Click through your app as a user would. QAMind converts the session — clicks, inputs, navigations, assertions — into runnable Playwright tests.
            </p>
            <div className="rec-hero-pills mb-10">
              <span className="rec-hero-pill"><Zap size={11} /> No code required</span>
              <span className="rec-hero-pill"><Shield size={11} /> Works with any web app</span>
              <span className="rec-hero-pill">Free to install</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={() => setDownloadOpen(true)} className="fn-nav-action is-primary flex items-center gap-2">
                <Download size={14} strokeWidth={2} /> Download for Chrome
              </button>
              <Link to="/how-it-works" className="fn-nav-action">See full workflow →</Link>
            </div>
          </div>
        </section>

        {/* Steps */}
        {STEPS.map((step) => (
          <section key={step.n} id={`step-${step.n}`} data-section-theme={step.theme}>
            <div className={`mx-auto max-w-7xl px-6 py-16 md:py-24 hiw-step-grid${step.flip ? " hiw-step-flip" : ""}`}>
              <div className="hiw-step-copy">
                <p className="hiw-step-eyebrow">
                  <span className="text-[var(--c-accent)]">&sect;{step.n}</span>
                  <span className="hiw-step-tag-label">{step.tag}</span>
                </p>
                <h2 className="hiw-step-title">{step.title}</h2>
                <p className="hiw-step-body">{step.body}</p>
                <p className="hiw-step-note"><span className="text-[var(--c-accent)] mr-1.5">→</span>{step.note}</p>
              </div>
              <div className="hiw-step-visual">{step.mock}</div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section id="setup" data-section-theme="light">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 text-center">
            <p className="hiw-eyebrow mb-5 justify-center"><span className="text-[var(--c-accent)]">&sect;</span> GET STARTED</p>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.04] tracking-[-0.02em] mb-6 max-w-[480px] mx-auto">
              Your first recorded test in under 5 minutes.
            </h2>
            <p className="text-[15px] text-[var(--c-text-muted)] leading-relaxed max-w-[380px] mx-auto mb-10">
              Free to install. No sign-up required for the extension. Import recordings into any QAMind workspace.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button onClick={() => setDownloadOpen(true)} className="fn-nav-action is-primary flex items-center gap-2">
                <Download size={14} strokeWidth={2} /> Download for Chrome
              </button>
              <Link to="/" className="fn-nav-action">← Back to home</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
