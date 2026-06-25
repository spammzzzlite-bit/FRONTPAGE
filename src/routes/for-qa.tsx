import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Zap, Video, FileText, Layers, Bug, GitBranch, Play, Download, Lock
} from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/for-qa")({
  component: ForQAPage,
});

const PAINS = [
  {
    icon: <FileText size={16} strokeWidth={1.75} />,
    label: "Writing from scratch, every time",
    body: "A spec lands in Jira. You read it twice, open a spreadsheet, and start writing test steps. Half a sprint later you're still on the first feature area.",
    note: "→ QAMind drafts the cases. You review.",
  },
  {
    icon: <Layers size={16} strokeWidth={1.75} />,
    label: "Approval chaos",
    body: "Some cases are ready to run, others need a second look. There's no authoritative list of what's approved and what isn't — just a spreadsheet with a color-coded column.",
    note: "→ Draft → Ready → Approved per case. Always.",
  },
  {
    icon: <Bug size={16} strokeWidth={1.75} />,
    label: "Switching tabs to file a bug",
    body: "A test fails. You copy the error into Jira, paste the test case ID, add the run number, attach a screenshot. Ten minutes later you're doing the next one.",
    note: "→ One click from failure to tracked bug.",
  },
  {
    icon: <GitBranch size={16} strokeWidth={1.75} />,
    label: "Coverage gaps nobody notices",
    body: "New requirements ship. Nobody updates the test suite. Three sprints later a QA manager asks which requirements are covered and the honest answer is 'we're not sure.'",
    note: "→ Traceability matrix auto-assembles from IDs.",
  },
  {
    icon: <Play size={16} strokeWidth={1.75} />,
    label: "Flaky test investigation loops",
    body: "A test flip-flops between pass and fail. It gets escalated. Two hours later someone confirms it's flaky. Meanwhile three real failures went uninvestigated.",
    note: "→ Flaky flag after 10-run consistency check.",
  },
  {
    icon: <Lock size={16} strokeWidth={1.75} />,
    label: "Specs sent to cloud AI",
    body: "The AI generation tool your team trialled was fast — but it sent your requirement documents to a third-party API. Legal said no.",
    note: "→ Qwen runs on your workstation. Nothing leaves.",
  },
];

const FEATURES = [
  { icon: <Zap size={14} strokeWidth={1.75} />, name: "AI Test Generation", href: "/features/generate" },
  { icon: <Video size={14} strokeWidth={1.75} />, name: "QA Recorder", href: "/features/recorder" },
  { icon: <Layers size={14} strokeWidth={1.75} />, name: "Test Suites", href: "/features/suites" },
  { icon: <FileText size={14} strokeWidth={1.75} />, name: "Script Generator", href: "/features/scripts" },
  { icon: <Bug size={14} strokeWidth={1.75} />, name: "Bug Tracker", href: "/features/bugs" },
  { icon: <GitBranch size={14} strokeWidth={1.75} />, name: "Traceability Matrix", href: "/features/traceability" },
  { icon: <Play size={14} strokeWidth={1.75} />, name: "Run History", href: "/features/runs" },
  { icon: <Download size={14} strokeWidth={1.75} />, name: "Reports & Exports", href: "/features/reports" },
];

function ForQAPage() {
  return (
    <FeaturePageShell
      title="For QA Engineers — QAMind AI"
      description="Built for QA engineers who prefer precision over noise. Test generation, suite management, bug tracking, and Playwright scripts — in one workspace. AI runs locally."
    >
      {/* Hero */}
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> FOR QA ENGINEERS</p>
          <h1 className="feat-headline fade-up fade-up-d1">
            Built for people<br />who test things properly.
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            QAMind covers the full QA cycle in one workspace — AI test generation, browser recording, suite management, Playwright scripts, bug tracking, and traceability. The AI runs on your workstation: your specs never leave.
          </p>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d3">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started free</Link>
            <Link to="/features" className="fn-nav-action">All features →</Link>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section data-section-theme="light">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="feat-eyebrow mb-3 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> THE PROBLEM</p>
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mb-10 max-w-[500px] fade-up fade-up-d1">
            Six things that slow every QA team down.
          </h2>
          <div className="sol-pain-grid">
            {PAINS.map((pain, i) => (
              <div key={pain.label} className={`sol-pain-card fade-up fade-up-d${(i % 3) + 1}`}>
                <div className="sol-pain-icon">{pain.icon}</div>
                <p className="sol-pain-label">{pain.label}</p>
                <p className="sol-pain-body">{pain.body}</p>
                <p className="sol-pain-note">{pain.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scenario */}
      <section data-section-theme="light">
        <div className="mx-auto max-w-3xl px-6 pb-20">
          <p className="feat-eyebrow mb-4 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> A DAY IN THE LIFE</p>
          <div className="sol-scenario fade-up fade-up-d1">
            The checkout spec landed this morning. I pasted it into QAMind, got 12 test cases back in six minutes, deleted two that didn't apply, and approved the rest. By the time the dev had finished the branch, the suite was ready to run. The run caught a failure in the discount calculation. I filed the bug from the results page — it came pre-linked to the exact test case and run ID. The developer had it fixed the same afternoon. No ticket-hunting, no copy-paste, no spreadsheet.
          </div>
        </div>
      </section>

      {/* Feature links */}
      <section data-section-theme="dark">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="feat-eyebrow mb-4 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> WHAT'S IN YOUR WORKSPACE</p>
          <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mb-8 max-w-[500px] fade-up fade-up-d1">
            Eight tools. One workspace. No seat fee.
          </h2>
          <div className="sol-features-grid">
            {FEATURES.map((feat, i) => (
              <Link key={feat.href} to={feat.href as any} className={`sol-feature-link fade-up fade-up-d${(i % 4) + 1}`}>
                <span className="sol-feature-link-icon">{feat.icon}</span>
                <span className="sol-feature-link-name">{feat.name}</span>
                <span className="sol-feature-link-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy callout */}
      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-10">
          <div className="fade-up" style={{ background: "rgba(194,85,46,0.06)", border: "1px solid rgba(194,85,46,0.2)", borderRadius: 12, padding: "1.5rem 2rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <Lock size={18} style={{ color: "var(--c-accent)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--c-text)", marginBottom: "0.35rem" }}>Your specs stay on your machine.</p>
              <p style={{ fontSize: 13, color: "var(--c-text-muted)", lineHeight: 1.65 }}>
                The AI model (Qwen 3 Coder 30B) runs via Ollama on your own workstation. Requirement documents, recordings, and test case content are never sent to OpenAI, Anthropic, or any external AI API. Generation takes 3–8 minutes — the tradeoff for keeping everything private.
              </p>
              <Link to="/local-ai" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--c-accent)", textDecoration: "none" }}>
                How local AI works →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo placeholder */}
      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-20">
          <div className="feat-demo-placeholder fade-up">
            <div className="feat-demo-icon"><Play size={22} /></div>
            <p className="feat-demo-label">Product walkthrough</p>
            <p className="feat-demo-title">QAMind for QA Engineers</p>
            <p className="feat-demo-sub">See test case generation, suite approval, a Playwright run, bug filing, and the traceability matrix — end to end, under ten minutes.</p>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--c-text-dim)", border: "1px solid var(--c-border)", borderRadius: 6, padding: "0.25rem 0.6rem", position: "relative", zIndex: 1 }}>Coming soon</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section data-section-theme="light">
        <div className="feat-cta-section fade-up">
          <h2 className="feat-cta-headline">Test more. Write less boilerplate.</h2>
          <p className="feat-cta-sub">Sign up and run your first test suite in under thirty minutes — no agent setup, no prompt engineering, no external AI account required.</p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/features/generate" className="fn-nav-action">See AI generation →</Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
