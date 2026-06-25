import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, Lock, FileText, Zap, BarChart3 } from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/features/gpt")({
  component: GptPage,
});

const STEPS = [
  {
    num: "01",
    tag: "Private AI",
    title: "Powered by the same local model",
    body: "The GPT console runs on the same Qwen 3 Coder 30B model that generates your test cases — hosted on your workstation, not a third-party API. Your questions and documents never leave your infrastructure.",
    note: "→ Same model, same privacy guarantee as test generation",
  },
  {
    num: "02",
    tag: "Document context",
    title: "Upload PDFs or DOCX for context",
    body: "Attach a requirement document, design spec, or PRD as a PDF or DOCX file. The GPT console extracts the content and uses it as context for your conversation.",
    note: "→ Supports PDF and DOCX uploads",
  },
  {
    num: "03",
    tag: "Organisation",
    title: "Conversations organised by project",
    body: "Chats are grouped under your workspace projects. Ask about the checkout module, switch to the auth project, pick up where you left off. History is persisted — not ephemeral.",
    note: "→ Conversations persisted to your workspace",
  },
  {
    num: "04",
    tag: "Access",
    title: "Separate URL, same login",
    body: "The GPT console is available at gpt.qamind.ai — same sign-in as your QAMind workspace. No separate account. All workspace members can access it.",
    note: "→ gpt.qamind.ai · same auth as your workspace",
  },
];

const FACTS = [
  { label: "AI model", value: "Qwen 3 Coder 30B — same as test generation, runs locally via Ollama" },
  { label: "Data handling", value: "Questions and documents never sent to external AI APIs" },
  { label: "Document upload", value: "PDF and DOCX files — content extracted and used as conversation context" },
  { label: "Conversation history", value: "Persisted to your workspace — grouped by project" },
  { label: "Access URL", value: "gpt.qamind.ai — same auth as your QAMind workspace" },
  { label: "Availability", value: "All signed-in workspace members" },
];

const RELATED = [
  {
    icon: <Zap size={15} strokeWidth={1.75} />,
    name: "AI Test Generation",
    desc: "The same local Qwen model that powers GPT Chat also generates your test cases.",
    href: "/features/generate",
  },
  {
    icon: <Lock size={15} strokeWidth={1.75} />,
    name: "Local AI details",
    desc: "How Qwen 3 Coder runs on your workstation — and why your data stays private.",
    href: "/local-ai",
  },
  {
    icon: <BarChart3 size={15} strokeWidth={1.75} />,
    name: "Analytics",
    desc: "After generating test ideas in GPT Chat, use analytics to measure what gets executed.",
    href: "/features/analytics",
  },
];

function MockGptChat() {
  const messages = [
    { role: "user", text: "What are the edge cases I should test for the password reset flow?" },
    { role: "ai", text: "Based on your PRD (uploaded), here are the cases worth verifying:\n1. Reset link expiry at exactly 30 min boundary\n2. Link used twice — should fail on second use\n3. Email not in system — response should be generic (no user enumeration)\n4. Invalid token format — should show an error, not a 500" },
    { role: "user", text: "Can you write a Playwright test for case #3?" },
  ];

  return (
    <div className="feat-mock-window">
      <div className="feat-mock-chrome">
        <div className="feat-mock-dots">
          <span className="feat-mock-dot feat-mock-dot-r" />
          <span className="feat-mock-dot feat-mock-dot-y" />
          <span className="feat-mock-dot feat-mock-dot-g" />
        </div>
        <span className="feat-mock-path">gpt.qamind.ai / auth-project</span>
        <span className="feat-mock-badge-tag">LOCAL AI</span>
      </div>
      <div className="feat-mock-body" style={{ padding: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, padding: "0.4rem 0.6rem", background: "#1e1914", borderRadius: 6, border: "1px solid #2e2520" }}>
          <FileText size={11} style={{ color: "#7d6e62" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9b8b7a" }}>password-reset-PRD.pdf</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#6ec47a", marginLeft: "auto" }}>Context loaded</span>
        </div>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "flex-start" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: msg.role === "user" ? "var(--c-accent-soft)" : "#2e2520", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 7, fontWeight: 700, color: msg.role === "user" ? "var(--c-accent)" : "#b5a898", marginTop: 2 }}>
              {msg.role === "user" ? "U" : "AI"}
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, lineHeight: 1.55, color: msg.role === "user" ? "#c8bfb2" : "#9e8e7e", flex: 1, whiteSpace: "pre-wrap" }}>{msg.text}</p>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, padding: "0.4rem 0.6rem", background: "#1e1914", borderRadius: 6, border: "1px solid #2e2520" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#4a4038", flex: 1 }}>Ask anything about your QA work...</span>
          <button className="feat-mock-btn-primary-sm" style={{ margin: 0, padding: "0.2rem 0.5rem" }}><MessageSquare size={9} /></button>
        </div>
      </div>
    </div>
  );
}

function GptPage() {
  return (
    <FeaturePageShell
      title="GPT Console"
      description="A private AI chat interface for QA work — powered by the same local Qwen model. Ask questions, upload requirement docs, and get answers without sending your data to any external API."
    >
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> GPT CONSOLE</p>
          <h1 className="feat-headline fade-up fade-up-d1">
            A private AI chat<br />for your QA work.
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            The GPT console at gpt.qamind.ai runs the same Qwen 3 Coder 30B model as test generation — on your workstation. Ask about test strategies, upload your PRD for context, draft Playwright assertions. Your questions stay private.
          </p>
          <div className="feat-hero-chips fade-up fade-up-d3">
            <span className="feat-chip"><span className="feat-chip-dot" />Local Qwen model</span>
            <span className="feat-chip"><span className="feat-chip-dot" />PDF + DOCX upload</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Conversations by project</span>
            <span className="feat-chip"><span className="feat-chip-dot" />No external API calls</span>
          </div>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d4">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started</Link>
            <Link to="/local-ai" className="fn-nav-action">Local AI details →</Link>
          </div>
        </div>
      </section>

      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <div className="fade-up"><MockGptChat /></div>
        </div>
      </section>

      {/* Privacy callout */}
      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-10">
          <div className="fade-up" style={{ background: "rgba(194,85,46,0.06)", border: "1px solid rgba(194,85,46,0.2)", borderRadius: 12, padding: "1.5rem 2rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <Lock size={18} style={{ color: "var(--c-accent)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--c-text)", marginBottom: "0.35rem" }}>Your documents don't leave your workstation.</p>
              <p style={{ fontSize: 13, color: "var(--c-text-muted)", lineHeight: 1.65 }}>
                Unlike ChatGPT or Claude, the GPT console processes everything on your own machine. Requirement documents, PRDs, and your questions are processed locally by Qwen 3 Coder 30B via Ollama — and never transmitted to any external AI API.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section data-section-theme="light">
        <div className="feat-steps-section">
          <div className="feat-steps-inner">
            <div className="feat-steps-header fade-up">
              <p className="feat-eyebrow"><span style={{ color: "var(--c-accent)" }}>&sect;</span> HOW IT WORKS</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mt-2 max-w-[500px]">
                AI chat. Private infrastructure. Persistent history.
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
            <div className="feat-fact-heading">GPT console specs</div>
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
            <div className="feat-demo-icon"><MessageSquare size={22} /></div>
            <p className="feat-demo-label">Video demo</p>
            <p className="feat-demo-title">Upload a PRD. Ask about edge cases. Get answers.</p>
            <p className="feat-demo-sub">See a requirement document uploaded, a conversation about test coverage started, and the answers used to generate test cases — all in one session.</p>
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
          <h2 className="feat-cta-headline">AI that knows your project. Privately.</h2>
          <p className="feat-cta-sub">Sign up for QAMind and the GPT console is included — same workspace, same auth, same local model. No separate account, no data leaving your infrastructure.</p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/local-ai" className="fn-nav-action">Local AI details →</Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
