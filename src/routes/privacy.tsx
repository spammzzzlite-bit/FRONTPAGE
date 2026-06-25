import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — QAMind AI" },
      { name: "description", content: "How QAMind AI collects, uses, and protects your data." },
    ],
  }),
  component: PrivacyPage,
});

const LAST_UPDATED = "June 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-display text-xl font-semibold text-[var(--c-text)] mb-3 tracking-[-0.01em]">{title}</h2>
      <div className="text-[14px] text-[var(--c-text-muted)] leading-[1.75] space-y-3">{children}</div>
    </div>
  );
}

function PrivacyPage() {
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
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
            <p className="hiw-eyebrow mb-5"><span className="text-[var(--c-accent)]">&sect;</span> LEGAL</p>
            <h1 className="font-display text-4xl leading-[1.04] tracking-[-0.02em] mb-4">Privacy Policy</h1>
            <p className="font-mono text-[11px] text-[var(--c-text-dim)] tracking-[0.04em]">Last updated: {LAST_UPDATED}</p>
          </div>
        </section>

        <section data-section-theme="light">
          <div className="mx-auto max-w-3xl px-6 py-14">

            <Section title="1. What we collect">
              <p>
                When you create a QAMind AI account, we collect your email address and a hashed password. If you sign in via a third-party provider (e.g. Google), we receive only your email and public profile name — no password is stored.
              </p>
              <p>
                When you use the product, we store the data you create: test cases, test suites, run results, bug reports, and recordings. This data is stored on your behalf and is not read by QAMind staff except to diagnose a support request you have explicitly opened.
              </p>
              <p>
                We collect standard server logs: IP address, browser user-agent, timestamp, and the URL requested. These are retained for 30 days for security and debugging purposes.
              </p>
            </Section>

            <Section title="2. How we use your data">
              <p>Your data is used to provide and improve QAMind AI. Specifically:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>To authenticate your account and maintain your session.</li>
                <li>To run the AI test generation features you invoke.</li>
                <li>To send transactional emails (password reset, email verification).</li>
                <li>To send the product update newsletter, if you have opted in.</li>
                <li>To diagnose errors and improve reliability.</li>
              </ul>
              <p>We do not sell your data. We do not use your test cases or bug reports to train AI models without your explicit written consent.</p>
            </Section>

            <Section title="3. Cookies and tracking">
              <p>
                QAMind AI uses a single session cookie to keep you logged in. We do not use third-party advertising trackers, pixel tags, or cross-site tracking cookies.
              </p>
              <p>
                We use a privacy-respecting analytics tool (no personal identifiers, no fingerprinting) to understand aggregate usage patterns — for example, which features are used most. This data is anonymised and cannot be tied back to your account.
              </p>
            </Section>

            <Section title="4. Data sharing">
              <p>We share your data with the following categories of sub-processors only as necessary to operate the service:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong className="text-[var(--c-text)]">Cloud infrastructure</strong> — hosting, database, and object storage.</li>
                <li><strong className="text-[var(--c-text)]">Email delivery</strong> — transactional email only.</li>
                <li><strong className="text-[var(--c-text)]">AI inference</strong> — test generation requests are processed by an LLM API. Requests are not retained by the provider for training purposes under our data processing agreement.</li>
              </ul>
              <p>We do not share data with marketing platforms, data brokers, or analytics resellers.</p>
            </Section>

            <Section title="5. Data retention">
              <p>
                Your account data is retained for as long as your account is active. If you delete your account, all associated test cases, runs, bugs, and recordings are permanently deleted within 30 days. Server logs are deleted after 30 days on a rolling basis.
              </p>
            </Section>

            <Section title="6. Your rights">
              <p>You have the right to access, correct, export, or delete your personal data at any time. To exercise any of these rights, email us at <a href="mailto:hello@qamind.ai" className="text-[var(--c-accent)] hover:underline">hello@qamind.ai</a>. We will respond within 14 days.</p>
              <p>If you are in the EU or UK, you have additional rights under GDPR / UK GDPR including the right to lodge a complaint with your local supervisory authority.</p>
            </Section>

            <Section title="7. Security">
              <p>
                Passwords are hashed using bcrypt. Data in transit is encrypted with TLS 1.2+. Data at rest is encrypted at the storage layer. We conduct periodic security reviews and patch known vulnerabilities promptly.
              </p>
              <p>
                Despite these measures, no system is fully immune to breach. If a breach affects your personal data, we will notify you within 72 hours of becoming aware of it.
              </p>
            </Section>

            <Section title="8. Changes to this policy">
              <p>
                We will update this policy as the product evolves. Material changes will be communicated via email to registered users at least 14 days before taking effect. The current version is always available at this URL.
              </p>
            </Section>

            <Section title="9. Contact">
              <p>
                Questions or requests: <a href="mailto:hello@qamind.ai" className="text-[var(--c-accent)] hover:underline">hello@qamind.ai</a>
              </p>
            </Section>

          </div>
        </section>
      </main>
    </div>
  );
}
