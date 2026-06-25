import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — QAMind AI" },
      { name: "description", content: "What shipped. No roadmap theatre." },
    ],
  }),
  component: ChangelogPage,
});

function ChangelogPage() {
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
              <span className="text-[var(--c-accent)]">&sect;</span> CHANGELOG
            </p>
            <h1 className="font-display text-4xl leading-[1.04] tracking-[-0.02em] md:text-6xl mb-5 max-w-[600px]">
              What shipped.
            </h1>
            <p className="text-[16px] text-[var(--c-text-muted)] leading-relaxed max-w-[440px]">
              No roadmap theatre. No "coming soon" slides. Just what's actually in the product, in plain language.
            </p>
          </div>
        </section>

        <section data-section-theme="light">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <p className="font-mono text-[12px] text-[var(--c-text-dim)] text-center tracking-[0.12em] uppercase">
              § Entries coming soon — this page is being written.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
