import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/for-devs")({
  head: () => ({
    meta: [
      { title: "For Dev Teams — QAMind AI" },
      { name: "description", content: "Merge with confidence. Know what's covered before the PR lands." },
    ],
  }),
  component: ForDevsPage,
});

function ForDevsPage() {
  return (
    <div data-section-theme="dark" className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
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
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started</Link>
          </div>
        </div>
      </header>

      <main>
        <section data-section-theme="dark">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <p className="hiw-eyebrow mb-5">
              <span className="text-[var(--c-accent)]">&sect;</span> FOR DEV TEAMS
            </p>
            <h1 className="font-display text-4xl leading-[1.04] tracking-[-0.02em] md:text-6xl mb-5 max-w-[680px]">
              Merge with confidence.<br />Know what's covered.
            </h1>
            <p className="text-[16px] text-[var(--c-text-muted)] leading-relaxed max-w-[500px] mb-10">
              QAMind plugs into your PR workflow. Before a branch lands, you know exactly what's tested, what failed, and what's newly untouched.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary">Get started free</Link>
              <Link to="/how-it-works" className="fn-nav-action">See how it works →</Link>
            </div>
          </div>
        </section>

        <section data-section-theme="light">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 grid gap-8 md:grid-cols-3">
            {[
              { label: "No QA bottleneck", body: "Developers can generate test cases directly from specs. QA reviews, not rewrites." },
              { label: "Coverage on every PR", body: "Know which requirements have tests and which don't — before the PR merges, not after." },
              { label: "Bugs filed automatically", body: "When a test fails in CI, QAMind files a structured bug with context. No triage backlog." },
            ].map(({ label, body }) => (
              <div key={label} className="border border-[var(--c-border)] rounded-xl p-6 bg-[var(--c-bg-card)]">
                <p className="font-mono text-[10px] tracking-[0.1em] text-[var(--c-accent)] uppercase mb-3">{label}</p>
                <p className="text-[14px] text-[var(--c-text-muted)] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
