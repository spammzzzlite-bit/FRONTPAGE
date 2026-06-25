import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap, FileText, Play, CheckCircle, ArrowRight, Clock, Lock, Layers, Bug } from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/features/generate")({
  component: GeneratePage,
});

const STEPS = [
  {
    num: "01",
    tag: "Input",
    title: "Paste your requirement",
    body: "Drop in a PRD, user story, OpenAPI definition, or any plain-English description of what the feature should do. No special formatting required.",
    note: "→ Supports Markdown, raw text, OpenAPI JSON/YAML",
  },
  {
    num: "02",
    tag: "AI worker",
    title: "Qwen generates structured cases",
    body: "The local Qwen 3 Coder 30B model reads your input and drafts test cases as structured rows: title, precondition, numbered steps, expected result, and priority.",
    note: "→ Runs on your workstation. Your spec never leaves.",
  },
  {
    num: "03",
    tag: "Review",
    title: "You edit and approve",
    body: "Cases come back as editable rows. Reorder them, delete ones that don't apply, add edge cases by hand. Set status per case: Draft → Ready → Approved.",
    note: "→ Nothing runs until you approve it.",
  },
  {
    num: "04",
    tag: "Output",
    title: "Assign to a suite and run",
    body: "Approved cases go into a test suite. From there you can run them with the local Playwright runner, or generate a .spec.ts file and run it in your existing CI setup.",
    note: "→ Pass / fail / skip tracked per test case per run",
  },
];

const FACTS = [
  { label: "AI model", value: "Qwen 3 Coder 30B — runs locally via Ollama" },
  { label: "Generation time", value: "3–8 minutes depending on spec length and local GPU" },
  { label: "Data handling", value: "Input never sent to any cloud AI API. Processed on your workstation." },
  { label: "Output format", value: "Structured rows: title · steps · expected result · priority" },
  { label: "Approval flow", value: "Draft → Ready → Approved. Nothing auto-executes." },
  { label: "Inputs accepted", value: "Plain text, Markdown, OpenAPI JSON/YAML, browser recordings" },
];

const RELATED = [
  {
    icon: <FileText size={15} strokeWidth={1.75} />,
    name: "Script Generator",
    desc: "Turn approved test cases into runnable Playwright .spec.ts files via the MCP server.",
    href: "/features/scripts",
  },
  {
    icon: <Layers size={15} strokeWidth={1.75} />,
    name: "Test Suites",
    desc: "Organise generated cases into suites. Approve before running. Filter by status.",
    href: "/features/suites",
  },
  {
    icon: <Bug size={15} strokeWidth={1.75} />,
    name: "Bug Tracker",
    desc: "One click files a tracked bug from any failed test case — linked to the exact run.",
    href: "/features/bugs",
  },
];

function MockGenerate() {
  return (
    <div className="feat-mock-window">
      <div className="feat-mock-chrome">
        <div className="feat-mock-dots">
          <span className="feat-mock-dot feat-mock-dot-r" />
          <span className="feat-mock-dot feat-mock-dot-y" />
          <span className="feat-mock-dot feat-mock-dot-g" />
        </div>
        <span className="feat-mock-path">qamind.ai / generate</span>
        <span className="feat-mock-badge-tag">AI GENERATION</span>
      </div>
      <div className="feat-mock-body">
        <div className="feat-mock-col-2 mb-3">
          <div>
            <p className="feat-mock-label-sm">Requirement input</p>
            <div className="feat-mock-input-box">
              Users should be able to reset their password via email. The reset link expires after 30 minutes. Invalid tokens show an error.
            </div>
          </div>
          <div>
            <p className="feat-mock-label-sm">Test type</p>
            <div className="feat-mock-input-box" style={{ minHeight: 0, paddingBottom: "0.4rem" }}>
              <div className="feat-mock-case-row" style={{ borderBottom: "1px solid #2e2520" }}>
                <span style={{ color: "var(--c-accent)", fontSize: 9 }}>●</span>
                <span style={{ color: "#c8bfb2" }}>Functional — happy path</span>
              </div>
              <div className="feat-mock-case-row">
                <span style={{ color: "#4a4038", fontSize: 9 }}>○</span>
                <span>Edge cases &amp; error states</span>
              </div>
            </div>
            <button className="feat-mock-btn-primary-sm">
              <Zap size={10} /> Generate cases
            </button>
          </div>
        </div>

        <p className="feat-mock-label-sm mb-1">Generated — 4 cases</p>
        {[
          { id: "TC-041", title: "Valid reset link — password updated", status: "Approved", pass: true },
          { id: "TC-042", title: "Reset link expires after 30 min", status: "Ready", pass: null },
          { id: "TC-043", title: "Invalid token shows error message", status: "Draft", pass: null },
          { id: "TC-044", title: "Email not found returns generic message", status: "Draft", pass: null },
        ].map((tc) => (
          <div key={tc.id} className="feat-mock-case-row">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62", minWidth: 44 }}>{tc.id}</span>
            <span style={{ flex: 1, color: "#c8bfb2" }}>{tc.title}</span>
            <span
              className="hiw-mock-chip"
              style={{
                fontSize: 8,
                padding: "0.1rem 0.4rem",
                background: tc.status === "Approved" ? "rgba(74,163,84,0.12)" : "rgba(194,85,46,0.08)",
                color: tc.status === "Approved" ? "#6ec47a" : tc.status === "Ready" ? "#d9b06a" : "#7d6e62",
                border: `1px solid ${tc.status === "Approved" ? "rgba(74,163,84,0.25)" : "rgba(194,85,46,0.15)"}`,
              }}
            >
              {tc.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GeneratePage() {
  return (
    <FeaturePageShell
      title="AI Test Generation"
      description="Paste a spec or requirement doc — QAMind's local AI drafts structured test cases in minutes. Your data never leaves your workstation."
    >
      {/* Hero */}
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up">
            <span style={{ color: "var(--c-accent)" }}>&sect;</span> AI TEST GENERATION
          </p>
          <h1 className="feat-headline fade-up fade-up-d1">
            Paste a spec.<br />Get test cases.
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            QAMind reads your requirement document — PRD, user story, OpenAPI definition — and drafts structured test cases as editable rows. The AI runs on your own workstation. Your specs stay on your machine.
          </p>
          <div className="feat-hero-chips fade-up fade-up-d3">
            <span className="feat-chip"><span className="feat-chip-dot" />Local AI — Qwen 3 Coder 30B</span>
            <span className="feat-chip"><span className="feat-chip-dot" />3–8 min generation</span>
            <span className="feat-chip"><span className="feat-chip-dot" />No cloud AI API</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Human review before any run</span>
          </div>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d4">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">
              Try it free
            </Link>
            <Link to="/features" className="fn-nav-action">
              All features →
            </Link>
          </div>
        </div>
      </section>

      {/* Mock UI */}
      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <div className="fade-up">
            <MockGenerate />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section data-section-theme="light">
        <div className="feat-steps-section">
          <div className="feat-steps-inner">
            <div className="feat-steps-header fade-up">
              <p className="feat-eyebrow"><span style={{ color: "var(--c-accent)" }}>&sect;</span> HOW IT WORKS</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mt-2 max-w-[500px]">
                From requirement to runnable test — four steps.
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

      {/* Key facts */}
      <section data-section-theme="light">
        <div className="mx-auto max-w-3xl px-6 pb-20">
          <p className="feat-eyebrow mb-4 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> KEY FACTS</p>
          <div className="feat-fact-box fade-up fade-up-d1">
            <div className="feat-fact-heading">Technical details</div>
            {FACTS.map((f) => (
              <div key={f.label} className="feat-fact-row">
                <span className="feat-fact-label">{f.label}</span>
                <span className="feat-fact-value">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo placeholder */}
      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="feat-eyebrow mb-6 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> WALKTHROUGH</p>
          <div className="feat-demo-placeholder fade-up fade-up-d1">
            <div className="feat-demo-icon"><Play size={22} /></div>
            <p className="feat-demo-label">Video demo</p>
            <p className="feat-demo-title">Watch the generation flow</p>
            <p className="feat-demo-sub">
              A short walkthrough showing a requirement pasted, cases generated, reviewed, approved, and run — start to finish in under 10 minutes.
            </p>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--c-text-dim)",
                border: "1px solid var(--c-border)",
                borderRadius: 6,
                padding: "0.25rem 0.6rem",
                position: "relative",
                zIndex: 1,
              }}
            >
              Coming soon
            </span>
          </div>
        </div>
      </section>

      {/* Related */}
      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-20">
          <p className="feat-eyebrow mb-4 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> CONTINUE WITH</p>
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

      {/* CTA */}
      <section data-section-theme="light">
        <div className="feat-cta-section fade-up">
          <p className="feat-eyebrow justify-center"><span style={{ color: "var(--c-accent)" }}>&sect;</span> GET STARTED</p>
          <h2 className="feat-cta-headline">
            Your first test cases in under ten minutes.
          </h2>
          <p className="feat-cta-sub">
            Sign up, create a workspace, paste a requirement. QAMind generates the cases and you review them — no prompt engineering, no templates.
          </p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">
              Start free
            </Link>
            <Link to="/how-it-works" className="fn-nav-action">
              How it works →
            </Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
