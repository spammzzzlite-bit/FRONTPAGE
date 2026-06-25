import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Calendar, Users, BarChart3, GitBranch } from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/features/planner")({
  component: PlannerPage,
});

const STEPS = [
  {
    num: "01",
    tag: "Sprint creation",
    title: "Auto-scaffold a 14-day sprint",
    body: "Create a sprint with start and end dates. QAMind scaffolds the sprint structure — name, goals, assignees. You fill in the details or let the AI draft them from your project context.",
    note: "→ Default sprint length: 14 days. Adjustable.",
  },
  {
    num: "02",
    tag: "Assignment",
    title: "Assign testers, leads, and developers",
    body: "Each sprint has slots for sprint lead, testers, and developers. Workspace members can be assigned by role. The sprint panel shows who owns what.",
    note: "→ Roles: Sprint lead · Tester · Developer",
  },
  {
    num: "03",
    tag: "Coverage tracking",
    title: "Track planned vs. executed test cases",
    body: "Add test cases to the sprint plan. The progress bar shows how many planned cases have been run, how many passed, and how many remain. No spreadsheet required.",
    note: "→ Planned cases vs. executed — live progress bar",
  },
  {
    num: "04",
    tag: "Sprint notes",
    title: "Editable sprint notes in the panel",
    body: "The sprint detail panel has an editable notes field for retrospective notes, blockers, or context for the next sprint. Notes are persisted and visible to all sprint members.",
    note: "→ Notes editable from the sprint detail panel",
  },
];

const FACTS = [
  { label: "Sprint length", value: "14 days default — adjustable per sprint" },
  { label: "Roles", value: "Sprint lead · Testers · Developers — assigned per sprint" },
  { label: "Coverage", value: "Planned test cases vs. executed — tracked with a progress bar" },
  { label: "Sprint notes", value: "Free-text editable notes in the sprint detail panel" },
  { label: "Team visibility", value: "All workspace members with access can view sprint state" },
  { label: "Link to suites", value: "Test cases in a sprint are linked to their source suite" },
];

const RELATED = [
  {
    icon: <BarChart3 size={15} strokeWidth={1.75} />,
    name: "Analytics",
    desc: "Sprint coverage targets show up in analytics — planned vs. executed vs. passed.",
    href: "/features/analytics",
  },
  {
    icon: <GitBranch size={15} strokeWidth={1.75} />,
    name: "Traceability",
    desc: "Sprint test cases link back to requirements in the traceability matrix.",
    href: "/features/traceability",
  },
  {
    icon: <Users size={15} strokeWidth={1.75} />,
    name: "For Managers",
    desc: "Sprint planning is built for QA managers who need visibility without spreadsheets.",
    href: "/for-managers",
  },
];

function MockPlanner() {
  return (
    <div className="feat-mock-window">
      <div className="feat-mock-chrome">
        <div className="feat-mock-dots">
          <span className="feat-mock-dot feat-mock-dot-r" />
          <span className="feat-mock-dot feat-mock-dot-y" />
          <span className="feat-mock-dot feat-mock-dot-g" />
        </div>
        <span className="feat-mock-path">qamind.ai / planner</span>
        <span className="feat-mock-badge-tag">SPRINT PLANNER</span>
      </div>
      <div className="feat-mock-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "start", gap: "0.5rem", marginBottom: 12 }}>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "#ece3d6" }}>Sprint 08 — Auth & Checkout</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62", marginTop: 2 }}>Jun 16 – Jun 30, 2026 · 14 days</p>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, padding: "0.15rem 0.5rem", borderRadius: 999, border: "1px solid rgba(74,163,84,0.3)", color: "#6ec47a" }}>Active</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
          {[
            { role: "Sprint Lead", name: "Arjun P." },
            { role: "Tester", name: "Meera S." },
            { role: "Developer", name: "Jay K." },
          ].map((m) => (
            <div key={m.role} style={{ background: "#1e1914", borderRadius: 6, padding: "0.5rem", border: "1px solid #2e2520" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#7d6e62", marginBottom: 2 }}>{m.role}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#c8bfb2" }}>{m.name}</p>
            </div>
          ))}
        </div>

        <p className="feat-mock-label-sm mb-1">Coverage progress</p>
        <div style={{ background: "#1e1914", borderRadius: 6, padding: "0.625rem", border: "1px solid #2e2520", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>Planned: 18 cases</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>Executed: 12 · Passed: 10</span>
          </div>
          <div style={{ background: "#2e2520", borderRadius: 999, height: 6, overflow: "hidden" }}>
            <div style={{ background: "var(--c-accent)", width: "67%", height: "100%", borderRadius: 999 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>67% executed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlannerPage() {
  return (
    <FeaturePageShell
      title="Sprint Planner"
      description="Auto-scaffold 14-day sprints. Assign testers and leads. Track planned vs. executed test coverage without a spreadsheet."
    >
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> SPRINT PLANNER</p>
          <h1 className="feat-headline fade-up fade-up-d1">
            14-day sprints.<br />No spreadsheet.
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            QAMind scaffolds sprint structure automatically — start date, end date, assignees, coverage targets. A progress bar shows planned vs. executed test cases in real time. No manual tracking required.
          </p>
          <div className="feat-hero-chips fade-up fade-up-d3">
            <span className="feat-chip"><span className="feat-chip-dot" />14-day auto-scaffold</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Role assignment</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Coverage progress bar</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Editable sprint notes</span>
          </div>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d4">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started</Link>
            <Link to="/for-managers" className="fn-nav-action">For managers →</Link>
          </div>
        </div>
      </section>

      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <div className="fade-up"><MockPlanner /></div>
        </div>
      </section>

      <section data-section-theme="light">
        <div className="feat-steps-section">
          <div className="feat-steps-inner">
            <div className="feat-steps-header fade-up">
              <p className="feat-eyebrow"><span style={{ color: "var(--c-accent)" }}>&sect;</span> HOW IT WORKS</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mt-2 max-w-[500px]">
                Planned sprint. Real coverage data.
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
            <div className="feat-fact-heading">Sprint planner specs</div>
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
            <div className="feat-demo-icon"><Calendar size={22} /></div>
            <p className="feat-demo-label">Video demo</p>
            <p className="feat-demo-title">Scaffold a sprint, assign the team, track coverage</p>
            <p className="feat-demo-sub">See a sprint created, team members assigned, test cases added, and the coverage progress bar update live after a run — under five minutes.</p>
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
          <h2 className="feat-cta-headline">Plan your next sprint in five minutes.</h2>
          <p className="feat-cta-sub">Sign up and scaffold your first sprint — set the dates, assign the team, add test cases. Coverage tracking is immediate.</p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/for-managers" className="fn-nav-action">For managers →</Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
