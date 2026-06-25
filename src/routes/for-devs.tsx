import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Zap, FileText, Bug, GitBranch, Play, Download, Lock, Code
} from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/for-devs")({
  component: ForDevsPage,
});

const PAINS = [
  {
    icon: <Code size={16} strokeWidth={1.75} />,
    label: "Writing test boilerplate you didn't design for",
    body: "You built the feature. Now someone also wants you to write the test cases. You have no context on what edge cases QA cares about, and no time to learn the test management tool.",
    note: "→ Paste the spec. Cases are generated. You review.",
  },
  {
    icon: <Bug size={16} strokeWidth={1.75} />,
    label: "Bug reports with no context",
    body: "A bug comes in referencing a test case number. The test case is in one tool, the run result is in another, the error output is in a Slack thread. Finding the actual failure takes longer than fixing it.",
    note: "→ Bug links to exact test case, run, and error.",
  },
  {
    icon: <GitBranch size={16} strokeWidth={1.75} />,
    label: "Merging without knowing coverage state",
    body: "You merge the PR. QA runs the suite two days later. Three tests fail. The context for those failures is gone — you've moved on to the next feature.",
    note: "→ Know coverage state before the merge.",
  },
  {
    icon: <FileText size={16} strokeWidth={1.75} />,
    label: "Playwright tests that duplicate test case intent",
    body: "QA has 50 test cases in a spreadsheet. You have 50 Playwright tests in the repo. They cover similar ground but there's no link between them — duplication and drift guaranteed.",
    note: "→ Generate .spec.ts directly from test cases.",
  },
];

const FEATURES = [
  { icon: <Zap size={14} strokeWidth={1.75} />, name: "AI Test Generation", href: "/features/generate" },
  { icon: <FileText size={14} strokeWidth={1.75} />, name: "Script Generator", href: "/features/scripts" },
  { icon: <Bug size={14} strokeWidth={1.75} />, name: "Bug Tracker", href: "/features/bugs" },
  { icon: <GitBranch size={14} strokeWidth={1.75} />, name: "Traceability Matrix", href: "/features/traceability" },
  { icon: <Play size={14} strokeWidth={1.75} />, name: "Run History", href: "/features/runs" },
  { icon: <Download size={14} strokeWidth={1.75} />, name: "Reports & Exports", href: "/features/reports" },
];

function ForDevsPage() {
  return (
    <FeaturePageShell
      title="For Dev Teams — QAMind AI"
      description="Merge with confidence. Generate test cases from specs, get Playwright scripts from test cases, and track bugs with full run context — without switching tools."
    >
      {/* Hero */}
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> FOR DEVELOPERS</p>
          <h1 className="feat-headline fade-up fade-up-d1">
            Know coverage state<br />before you merge.
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            QAMind lets developers generate test cases from specs, produce Playwright scripts from those cases, and track bugs with full run context — all linked to the same requirements. No separate QA tool tab required.
          </p>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d3">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started free</Link>
            <Link to="/features/generate" className="fn-nav-action">AI generation →</Link>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section data-section-theme="light">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="feat-eyebrow mb-3 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> THE PROBLEM</p>
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mb-10 max-w-[500px] fade-up fade-up-d1">
            Four friction points between shipping and quality.
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
          <p className="feat-eyebrow mb-4 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> WHAT IT LOOKS LIKE</p>
          <div className="sol-scenario fade-up fade-up-d1">
            I pasted the OpenAPI definition for the new auth endpoints into QAMind on Monday. By lunch I had 18 test cases — I approved 14, deleted 4 that were duplicates. By Wednesday they were linked to the right requirements in the traceability matrix. When the branch merged and QA ran the suite, two tests failed. The bug that came in was already linked to the test case ID and the exact error from the run. I fixed both in the same afternoon. No Jira spelunking, no "can you reproduce it?" thread.
          </div>
        </div>
      </section>

      {/* Feature links */}
      <section data-section-theme="dark">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="feat-eyebrow mb-4 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> WHAT'S IN YOUR WORKSPACE</p>
          <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mb-8 max-w-[500px] fade-up fade-up-d1">
            From spec to Playwright script, tracked end to end.
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
              <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--c-text)", marginBottom: "0.35rem" }}>Your codebase and specs stay private.</p>
              <p style={{ fontSize: 13, color: "var(--c-text-muted)", lineHeight: 1.65 }}>
                QAMind's AI runs on your own workstation via Ollama — not a third-party API. API specs, requirement documents, and test case content are never transmitted externally. If your team has data residency requirements, this matters.
              </p>
              <Link to="/local-ai" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--c-accent)", textDecoration: "none" }}>Local AI details →</Link>
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
            <p className="feat-demo-title">QAMind for Developers</p>
            <p className="feat-demo-sub">See an OpenAPI spec pasted, test cases generated, scripts produced, a run triggered, and a bug filed with full context — in under ten minutes.</p>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--c-text-dim)", border: "1px solid var(--c-border)", borderRadius: 6, padding: "0.25rem 0.6rem", position: "relative", zIndex: 1 }}>Coming soon</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section data-section-theme="light">
        <div className="feat-cta-section fade-up">
          <h2 className="feat-cta-headline">Ship features. Know they're tested.</h2>
          <p className="feat-cta-sub">Sign up and generate test cases from your next spec. The Playwright scripts come from the cases — no duplicate effort.</p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/features/scripts" className="fn-nav-action">Playwright scripts →</Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
