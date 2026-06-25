import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

interface FeaturePageShellProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function FeaturePageShell({ children, title, description }: FeaturePageShellProps) {
  useEffect(() => {
    document.title = `${title} — QAMind AI`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const els = document.querySelectorAll(".fade-up");
    els.forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, [title, description]);

  return (
    <div data-section-theme="dark" className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
      <header className="feat-nav">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]"
            aria-label="QAMind AI home"
          >
            <img
              src="/brand/appicon-primary.png"
              alt=""
              aria-hidden="true"
              className="h-[30px] w-[30px] flex-shrink-0 rounded-[7px]"
            />
            <span className="font-display text-[16px] font-semibold leading-none tracking-[-0.025em] text-[var(--c-text)]">
              QAMind <span className="text-[var(--c-accent)]">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/features" className="fn-nav-action text-[13px]">Features</Link>
            <Link to="/how-it-works" className="fn-nav-action text-[13px]">How it works</Link>
            <Link to="/pricing" className="fn-nav-action text-[13px]">Pricing</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/auth" search={{ mode: "signin" }} className="fn-nav-action text-[13px]">Sign in</Link>
            <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary text-[13px]">Get started</Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer data-section-theme="dark" className="border-t border-[var(--c-border)]">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/brand/appicon-primary.png" alt="" aria-hidden="true" className="h-[24px] w-[24px] rounded-[6px]" />
            <span className="font-display text-[14px] font-semibold tracking-[-0.02em] text-[var(--c-text-muted)]">
              QAMind <span className="text-[var(--c-accent)]">AI</span>
            </span>
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              { to: "/features", label: "Features" },
              { to: "/pricing", label: "Pricing" },
              { to: "/for-qa", label: "For QA" },
              { to: "/for-devs", label: "For Devs" },
              { to: "/changelog", label: "Changelog" },
              { to: "/security", label: "Security" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to as any}
                className="text-[12px] text-[var(--c-text-dim)] hover:text-[var(--c-text-muted)] transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
          <p className="font-mono text-[10px] tracking-[0.06em] text-[var(--c-text-dim)]">
            © 2026 QAMind AI
          </p>
        </div>
      </footer>
    </div>
  );
}
