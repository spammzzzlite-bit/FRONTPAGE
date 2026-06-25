import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Zap, FileText, Layers, History, Bug, BarChart3,
  GitBranch, ClipboardList, TrendingDown, Download, MessageSquare, Video
} from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/features/")({
  component: FeaturesIndexPage,
});

const FEATURE_GROUPS = [
  {
    group: "Test Creation",
    features: [
      {
        icon: <Zap size={17} strokeWidth={1.75} />,
        name: "AI Test Generation",
        desc: "Paste a requirement — get structured test cases in minutes. Local AI, no cloud API.",
        href: "/features/generate",
      },
      {
        icon: <Video size={17} strokeWidth={1.75} />,
        name: "QA Recorder",
        desc: "Record a browser session. QAMind converts clicks and navigations to test cases.",
        href: "/features/recorder",
      },
      {
        icon: <FileText size={17} strokeWidth={1.75} />,
        name: "Script Generator",
        desc: "Generate Playwright .spec.ts files from approved cases via the local MCP server.",
        href: "/features/scripts",
      },
    ],
  },
  {
    group: "Test Management",
    features: [
      {
        icon: <Layers size={17} strokeWidth={1.75} />,
        name: "Test Suites",
        desc: "Organise cases by feature or sprint. Draft → Ready → Approved controls what runs.",
        href: "/features/suites",
      },
      {
        icon: <History size={17} strokeWidth={1.75} />,
        name: "Run History",
        desc: "Every run stored — per-case pass/fail/skip, full error output, flaky detection.",
        href: "/features/runs",
      },
      {
        icon: <TrendingDown size={17} strokeWidth={1.75} />,
        name: "Regression Analysis",
        desc: "Spot tests that passed last run and failed this one. Full error context inline.",
        href: "/features/regression",
      },
    ],
  },
  {
    group: "Quality Intelligence",
    features: [
      {
        icon: <Bug size={17} strokeWidth={1.75} />,
        name: "Bug Tracker",
        desc: "One click files a tracked bug from any failed test case. Linked to run and case.",
        href: "/features/bugs",
      },
      {
        icon: <BarChart3 size={17} strokeWidth={1.75} />,
        name: "Analytics",
        desc: "Pass rate trends, flaky count, coverage, open bugs — six cards, real numbers.",
        href: "/features/analytics",
      },
      {
        icon: <GitBranch size={17} strokeWidth={1.75} />,
        name: "Traceability Matrix",
        desc: "Requirements ↔ test cases ↔ run results in one matrix. Coverage gaps surface first.",
        href: "/features/traceability",
      },
    ],
  },
  {
    group: "Planning & Reporting",
    features: [
      {
        icon: <ClipboardList size={17} strokeWidth={1.75} />,
        name: "Sprint Planner",
        desc: "Auto-scaffold 14-day sprints. Assign testers. Track planned vs. executed coverage.",
        href: "/features/planner",
      },
      {
        icon: <Download size={17} strokeWidth={1.75} />,
        name: "Reports & Exports",
        desc: "Export test cases, runs, bugs, and traceability as .xlsx · Jira · Qase · Xray · Zephyr.",
        href: "/features/reports",
      },
      {
        icon: <MessageSquare size={17} strokeWidth={1.75} />,
        name: "GPT Console",
        desc: "Private AI chat at gpt.qamind.ai. Local Qwen model. PDF upload for document context.",
        href: "/features/gpt",
      },
    ],
  },
];

function FeaturesIndexPage() {
  return (
    <FeaturePageShell
      title="All Features — QAMind AI"
      description="Every QAMind feature in one place — AI test generation, suite management, run history, bug tracking, analytics, traceability, sprint planning, reports, and the GPT console."
    >
      {/* Hero */}
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> ALL FEATURES</p>
          <h1 className="feat-headline fade-up fade-up-d1">
            Every tool your<br />QA team needs.
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            From generating test cases and recording sessions to sprint planning and exporting reports — QAMind covers the full quality cycle in one workspace. No tool sprawl.
          </p>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d3">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/how-it-works" className="fn-nav-action">How it works →</Link>
          </div>
        </div>
      </section>

      {/* Feature groups */}
      {FEATURE_GROUPS.map((group, gi) => (
        <section key={group.group} data-section-theme={gi % 2 === 0 ? "light" : "dark"}>
          <div className="mx-auto max-w-7xl px-6 py-14">
            <p className={`feat-eyebrow mb-5 fade-up`}>
              <span style={{ color: "var(--c-accent)" }}>&sect;</span> {group.group.toUpperCase()}
            </p>
            <div className="features-grid">
              {group.features.map((feat, i) => (
                <Link
                  key={feat.href}
                  to={feat.href as any}
                  className={`features-grid-card fade-up fade-up-d${i + 1}`}
                >
                  <div className="features-grid-icon">{feat.icon}</div>
                  <p className="features-grid-name">{feat.name}</p>
                  <p className="features-grid-desc">{feat.desc}</p>
                  <span className="features-grid-arrow">View details →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section data-section-theme="light">
        <div className="feat-cta-section fade-up">
          <p className="feat-eyebrow justify-center"><span style={{ color: "var(--c-accent)" }}>&sect;</span> GET STARTED</p>
          <h2 className="feat-cta-headline">One workspace. The full cycle.</h2>
          <p className="feat-cta-sub">
            Sign up and get access to all features — test generation, suites, runs, bugs, analytics, traceability, sprint planning, and the GPT console.
          </p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/pricing" className="fn-nav-action">See pricing →</Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
