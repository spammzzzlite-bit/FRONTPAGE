import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3, ClipboardList, Users, Download, GitBranch, TrendingDown, Play, Bug
} from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/for-managers")({
  component: ForManagersPage,
});

const PAINS = [
  {
    icon: <BarChart3 size={16} strokeWidth={1.75} />,
    label: "Quality state scattered across tools",
    body: "Pass rate is in the test runner, bugs are in Jira, sprint progress is in a spreadsheet. Getting a single view of where quality stands before a release means opening four tabs and stitching numbers together.",
    note: "→ One dashboard. All of it. Updated after every run.",
  },
  {
    icon: <ClipboardList size={16} strokeWidth={1.75} />,
    label: "Sprint planning in spreadsheets",
    body: "Sprint planning happens in a spreadsheet that gets out of date the day after it's shared. Assigning testers, tracking coverage, and knowing if the plan was executed — all manual.",
    note: "→ 14-day sprints scaffolded in QAMind. Live progress.",
  },
  {
    icon: <Users size={16} strokeWidth={1.75} />,
    label: "No visibility into team workload",
    body: "Who is working on which test suite? How much of the sprint's test coverage has been executed? The honest answer is usually 'check Slack' or 'ask the team lead.'",
    note: "→ Assigned roles and coverage progress per sprint.",
  },
  {
    icon: <Download size={16} strokeWidth={1.75} />,
    label: "Manual reporting before every stakeholder call",
    body: "Friday afternoon: someone asks for a test coverage report. You spend an hour pulling data from three tools, formatting it into a slide deck, and hoping the numbers are current.",
    note: "→ One-click export: test cases · runs · bugs · traceability.",
  },
  {
    icon: <TrendingDown size={16} strokeWidth={1.75} />,
    label: "Regressions discovered at release time",
    body: "A test that passed last sprint fails this sprint. Nobody notices until the release candidate is already cut. The sprint is behind before anyone says so.",
    note: "→ Regression view surfaces these the run they appear.",
  },
  {
    icon: <GitBranch size={16} strokeWidth={1.75} />,
    label: "Coverage gaps nobody can quantify",
    body: "At the sprint review someone asks which requirements have test coverage. The answer requires cross-referencing the spec document with the test suite manually. Nobody has time.",
    note: "→ Traceability matrix auto-assembles. Gaps visible first.",
  },
];

const FEATURES = [
  { icon: <BarChart3 size={14} strokeWidth={1.75} />, name: "Analytics", href: "/features/analytics" },
  { icon: <ClipboardList size={14} strokeWidth={1.75} />, name: "Sprint Planner", href: "/features/planner" },
  { icon: <GitBranch size={14} strokeWidth={1.75} />, name: "Traceability Matrix", href: "/features/traceability" },
  { icon: <TrendingDown size={14} strokeWidth={1.75} />, name: "Regression Analysis", href: "/features/regression" },
  { icon: <Download size={14} strokeWidth={1.75} />, name: "Reports & Exports", href: "/features/reports" },
  { icon: <Bug size={14} strokeWidth={1.75} />, name: "Bug Tracker", href: "/features/bugs" },
  { icon: <Users size={14} strokeWidth={1.75} />, name: "Team Roles", href: "/security" },
  { icon: <Play size={14} strokeWidth={1.75} />, name: "Run History", href: "/features/runs" },
];

const STATS = [
  { value: "93.5%", label: "Pass rate visible after every run" },
  { value: "73%", label: "Execution coverage — tested vs. approved cases" },
  { value: "3", label: "Flaky tests flagged — not filed as bugs" },
  { value: "14 days", label: "Default sprint length — auto-scaffolded" },
];

function ForManagersPage() {
  return (
    <FeaturePageShell
      title="For Engineering Managers — QAMind AI"
      description="Pass rate, coverage, sprint progress, and open bugs — one workspace. Auto-scaffold 14-day sprints, assign teams, and export reports in one click."
    >
      {/* Hero */}
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> FOR ENGINEERING MANAGERS</p>
          <h1 className="feat-headline fade-up fade-up-d1">
            Quality state.<br />One workspace.
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            Pass rate, coverage, open bugs, sprint progress — everything a manager needs to answer "how is quality?" is in QAMind. No Jira dashboard, no spreadsheet, no pulling data together the night before a release.
          </p>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d3">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started free</Link>
            <Link to="/features/analytics" className="fn-nav-action">Analytics →</Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section data-section-theme="dark">
        <div className="mx-auto max-w-7xl px-6 pb-16">
          <div className="numbers-strip fade-up">
            {STATS.map((stat) => (
              <div key={stat.label} className="numbers-strip-cell">
                <div className="numbers-strip-value">{stat.value}</div>
                <div className="numbers-strip-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section data-section-theme="light">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="feat-eyebrow mb-3 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> THE PROBLEM</p>
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mb-10 max-w-[540px] fade-up fade-up-d1">
            Six things that make QA reporting harder than it needs to be.
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
          <p className="feat-eyebrow mb-4 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> SPRINT REVIEW, SIMPLIFIED</p>
          <div className="sol-scenario fade-up fade-up-d1">
            The sprint review was yesterday. I opened QAMind, looked at the analytics dashboard — 93.5% pass rate, 3 flaky tests flagged, 2 regressions from the last run. The traceability matrix showed two requirements still had no test cases. I exported the AI Test Report as an .xlsx, shared it with the product team before the meeting started. The whole thing took four minutes. No Jira dashboard, no spreadsheet, no "let me check with QA" delay.
          </div>
        </div>
      </section>

      {/* Feature links */}
      <section data-section-theme="dark">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="feat-eyebrow mb-4 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> MANAGEMENT FEATURES</p>
          <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mb-8 max-w-[500px] fade-up fade-up-d1">
            Everything you need to answer "how is quality?"
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

      {/* Demo placeholder */}
      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-20">
          <div className="feat-demo-placeholder fade-up">
            <div className="feat-demo-icon"><BarChart3 size={22} /></div>
            <p className="feat-demo-label">Product walkthrough</p>
            <p className="feat-demo-title">QAMind for Engineering Managers</p>
            <p className="feat-demo-sub">See the analytics dashboard, sprint planner, traceability matrix, and AI Test Report export — everything a manager uses before a release review.</p>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--c-text-dim)", border: "1px solid var(--c-border)", borderRadius: 6, padding: "0.25rem 0.6rem", position: "relative", zIndex: 1 }}>Coming soon</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section data-section-theme="light">
        <div className="feat-cta-section fade-up">
          <h2 className="feat-cta-headline">Answer "how is quality?" in one look.</h2>
          <p className="feat-cta-sub">Sign up and run your first suite. The analytics dashboard, sprint tracker, and export are available immediately — no setup required.</p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/features/planner" className="fn-nav-action">Sprint planner →</Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
