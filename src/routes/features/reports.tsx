import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Download, BarChart3, Bug, ClipboardList } from "lucide-react";
import { FeaturePageShell } from "@/components/landing/FeaturePageShell";

export const Route = createFileRoute("/features/reports")({
  component: ReportsPage,
});

const REPORT_TYPES = [
  {
    name: "AI Test Report",
    desc: "Full workspace summary: test case list, run results, bug report, and traceability matrix — in a single .xlsx file with four sheets.",
    format: ".xlsx",
    sheets: ["Test Cases", "Run Results", "Bug Report", "Traceability Matrix"],
  },
  {
    name: "Test Case Report",
    desc: "All test cases for a suite or project — title, steps, expected results, priority, author status, and last run status.",
    format: ".xlsx",
    sheets: ["Test Cases"],
  },
  {
    name: "Run History Report",
    desc: "Every run result for a date range — case ID, suite, run ID, pass/fail/skip, error output on failures.",
    format: ".xlsx",
    sheets: ["Run History"],
  },
  {
    name: "Bug Report",
    desc: "All bugs filed — title, severity, linked test case, linked run, status, assignee, and developer notes.",
    format: ".xlsx",
    sheets: ["Bug List"],
  },
];

const EXPORT_FORMATS = [
  { name: "Jira-ready", desc: "Import file formatted for Jira's test case importer" },
  { name: "Qase", desc: "Export formatted for Qase test management import" },
  { name: "Xray", desc: "Xray for Jira compatible import file" },
  { name: "Zephyr Scale", desc: "Zephyr Scale test case import format" },
];

const FACTS = [
  { label: "Report formats", value: ".xlsx (4 report types) · Jira · Qase · Xray · Zephyr Scale" },
  { label: "AI Test Report sheets", value: "Test Cases · Run Results · Bug Report · Traceability Matrix" },
  { label: "Scope", value: "Per suite · Per project · Workspace-wide" },
  { label: "Data freshness", value: "Generated on demand — reflects current workspace state at export time" },
  { label: "Access", value: "All workspace members with Viewer access and above can export" },
  { label: "PDF", value: "Executive summary view available for select report types" },
];

const RELATED = [
  {
    icon: <BarChart3 size={15} strokeWidth={1.75} />,
    name: "Analytics",
    desc: "The analytics dashboard shows the same data as reports — in live chart form.",
    href: "/features/analytics",
  },
  {
    icon: <Bug size={15} strokeWidth={1.75} />,
    name: "Bug Tracker",
    desc: "Bug report sheet sources from the bug tracker. All bugs, all context.",
    href: "/features/bugs",
  },
  {
    icon: <ClipboardList size={15} strokeWidth={1.75} />,
    name: "Planner",
    desc: "Sprint coverage appears in the AI Test Report alongside run results.",
    href: "/features/planner",
  },
];

function MockReports() {
  return (
    <div className="feat-mock-window">
      <div className="feat-mock-chrome">
        <div className="feat-mock-dots">
          <span className="feat-mock-dot feat-mock-dot-r" />
          <span className="feat-mock-dot feat-mock-dot-y" />
          <span className="feat-mock-dot feat-mock-dot-g" />
        </div>
        <span className="feat-mock-path">qamind.ai / reports</span>
        <span className="feat-mock-badge-tag">REPORTS</span>
      </div>
      <div className="feat-mock-body">
        <p className="feat-mock-label-sm mb-3">Export reports</p>
        {[
          { label: "AI Test Report", sub: "4 sheets — all data", badge: "Full export" },
          { label: "Test Case Report", sub: "Cases with steps + expected results", badge: ".xlsx" },
          { label: "Run History Report", sub: "All runs for date range", badge: ".xlsx" },
          { label: "Bug Report", sub: "All bugs with severity + links", badge: ".xlsx" },
        ].map((r) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0", borderBottom: "1px solid #2a2018" }}>
            <FileText size={12} style={{ color: "#7d6e62", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#c8bfb2" }}>{r.label}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>{r.sub}</p>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, padding: "0.1rem 0.4rem", borderRadius: 4, border: "1px solid #2e2520", color: "#9b8b7a" }}>{r.badge}</span>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "0.2rem 0.5rem", background: "transparent", border: "1px solid #2e2520", borderRadius: 4, fontFamily: "var(--font-mono)", fontSize: 9, color: "#9b8b7a", cursor: "default" }}><Download size={9} /> Export</button>
          </div>
        ))}
        <p className="feat-mock-label-sm mt-4 mb-2">Third-party export formats</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Jira", "Qase", "Xray", "Zephyr Scale"].map((f) => (
            <span key={f} style={{ fontFamily: "var(--font-mono)", fontSize: 9, padding: "0.2rem 0.5rem", border: "1px solid #2e2520", borderRadius: 4, color: "#7d6e62" }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportsPage() {
  return (
    <FeaturePageShell
      title="Reports & Exports"
      description="Export test cases, run results, bug reports, and traceability matrices as .xlsx files or import-ready formats for Jira, Qase, Xray, and Zephyr Scale."
    >
      <section data-section-theme="dark">
        <div className="feat-hero">
          <p className="feat-eyebrow fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> REPORTS & EXPORTS</p>
          <h1 className="feat-headline fade-up fade-up-d1">
            Your data, your format.<br />No reformatting.
          </h1>
          <p className="feat-subtext fade-up fade-up-d2">
            Export test cases, run results, bug data, and traceability matrices as .xlsx files — or as import-ready files for Jira, Qase, Xray, and Zephyr Scale. Generated on demand from current workspace state.
          </p>
          <div className="feat-hero-chips fade-up fade-up-d3">
            <span className="feat-chip"><span className="feat-chip-dot" />4 .xlsx report types</span>
            <span className="feat-chip"><span className="feat-chip-dot" />Jira · Qase · Xray · Zephyr</span>
            <span className="feat-chip"><span className="feat-chip-dot" />On-demand generation</span>
            <span className="feat-chip"><span className="feat-chip-dot" />No reformatting required</span>
          </div>
          <div className="flex flex-wrap gap-3 fade-up fade-up-d4">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started</Link>
            <Link to="/features/analytics" className="fn-nav-action">Analytics →</Link>
          </div>
        </div>
      </section>

      <section data-section-theme="dark">
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <div className="fade-up"><MockReports /></div>
        </div>
      </section>

      <section data-section-theme="light">
        <div className="feat-steps-section">
          <div className="feat-steps-inner">
            <div className="feat-steps-header fade-up">
              <p className="feat-eyebrow"><span style={{ color: "var(--c-accent)" }}>&sect;</span> WHAT'S INCLUDED</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mt-2 max-w-[500px]">
                Four report types. Four export formats.
              </h2>
            </div>

            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr" }} className="fade-up fade-up-d1">
              {REPORT_TYPES.map((rt, i) => (
                <div key={rt.name} className={`feat-step fade-up fade-up-d${i + 1}`}>
                  <span className="feat-step-num" style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "0.2rem 0.5rem", borderRadius: 4, border: "1px solid var(--c-border)", background: "var(--c-bg-card)", color: "var(--c-text-dim)", width: "auto", minWidth: 40, textAlign: "center" }}>{rt.format}</span>
                  <div>
                    <h3 className="feat-step-title">{rt.name}</h3>
                    <p className="feat-step-body">{rt.desc}</p>
                    <p className="feat-step-note">→ Sheets: {rt.sheets.join(" · ")}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "3rem" }} className="fade-up">
              <h3 className="font-display text-[18px] font-semibold text-[var(--c-text)] mb-4 tracking-[-0.01em]">Third-party export formats</h3>
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(2, 1fr)" }}>
                {EXPORT_FORMATS.map((ef) => (
                  <div key={ef.name} style={{ padding: "1rem", border: "1px solid var(--c-border)", borderRadius: 8, background: "var(--c-bg-card)" }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--c-accent)", marginBottom: 4 }}>{ef.name}</p>
                    <p style={{ fontSize: 13, color: "var(--c-text-muted)", lineHeight: 1.5 }}>{ef.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-section-theme="light">
        <div className="mx-auto max-w-3xl px-6 pb-20">
          <p className="feat-eyebrow mb-4 fade-up"><span style={{ color: "var(--c-accent)" }}>&sect;</span> DETAILS</p>
          <div className="feat-fact-box fade-up fade-up-d1">
            <div className="feat-fact-heading">Export specs</div>
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
            <div className="feat-demo-icon"><Download size={22} /></div>
            <p className="feat-demo-label">Video demo</p>
            <p className="feat-demo-title">Export the AI Test Report</p>
            <p className="feat-demo-sub">See the full AI Test Report generated and opened — four sheets, real data, ready to share with stakeholders or import into Jira.</p>
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
          <h2 className="feat-cta-headline">Stakeholders want numbers. Here they are.</h2>
          <p className="feat-cta-sub">Sign up and export your first AI Test Report — test cases, run results, bugs, and traceability in one .xlsx file, generated on demand.</p>
          <div className="feat-cta-actions">
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Start free</Link>
            <Link to="/features/analytics" className="fn-nav-action">Analytics →</Link>
          </div>
        </div>
      </section>
    </FeaturePageShell>
  );
}
