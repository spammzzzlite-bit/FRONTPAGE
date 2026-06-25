import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — QAMind AI" },
      { name: "description", content: "The terms governing your use of QAMind AI." },
    ],
  }),
  component: TermsPage,
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

function TermsPage() {
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
            <h1 className="font-display text-4xl leading-[1.04] tracking-[-0.02em] mb-4">Terms of Service</h1>
            <p className="font-mono text-[11px] text-[var(--c-text-dim)] tracking-[0.04em]">Last updated: {LAST_UPDATED}</p>
          </div>
        </section>

        <section data-section-theme="light">
          <div className="mx-auto max-w-3xl px-6 py-14">

            <Section title="1. Acceptance">
              <p>
                By creating an account or using QAMind AI ("the Service"), you agree to these Terms of Service. If you are using the Service on behalf of an organisation, you represent that you have authority to bind that organisation to these terms.
              </p>
            </Section>

            <Section title="2. The Service">
              <p>
                QAMind AI provides a software-as-a-service platform for AI-assisted test case generation, test suite management, test run execution, bug tracking, analytics, and related functionality. We reserve the right to modify or discontinue features with reasonable notice.
              </p>
            </Section>

            <Section title="3. Acceptable use">
              <p>You may use QAMind AI for lawful purposes only. You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Attempt to reverse-engineer, decompile, or extract the source code of the Service.</li>
                <li>Use the Service to generate test cases for software designed to cause harm.</li>
                <li>Circumvent authentication, rate limits, or access controls.</li>
                <li>Resell or sublicense access to the Service without written agreement.</li>
                <li>Upload malicious code, scripts, or payloads to the platform.</li>
              </ul>
            </Section>

            <Section title="4. Your content">
              <p>
                You retain ownership of all content you create in QAMind AI — test cases, recordings, bug reports, and configurations. By using the Service, you grant QAMind AI a limited, non-exclusive licence to store, process, and display your content solely to provide the Service to you.
              </p>
              <p>
                You are responsible for ensuring that any requirements, specifications, or code you upload do not infringe third-party intellectual property rights.
              </p>
            </Section>

            <Section title="5. Subscription and payment">
              <p>
                Free accounts are provided as-is with no uptime guarantee. Paid subscriptions are billed monthly or annually as selected at checkout. Prices are listed on our <Link to="/pricing" className="text-[var(--c-accent)] hover:underline">Pricing page</Link>.
              </p>
              <p>
                You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. We do not offer partial-period refunds except where required by law.
              </p>
            </Section>

            <Section title="6. Uptime and availability">
              <p>
                We aim for high availability but do not guarantee any specific uptime SLA on free plans. Paid plans receive best-effort support and incident response. Planned maintenance will be communicated at least 24 hours in advance via the status page or email.
              </p>
            </Section>

            <Section title="7. Termination">
              <p>
                We may suspend or terminate your account if you breach these Terms, engage in fraudulent activity, or if required by law. We will provide reasonable notice where possible. Upon termination, your data will be deleted in accordance with our <Link to="/privacy" className="text-[var(--c-accent)] hover:underline">Privacy Policy</Link>.
              </p>
              <p>
                You may delete your account at any time from the account settings page.
              </p>
            </Section>

            <Section title="8. Disclaimer of warranties">
              <p>
                The Service is provided "as is" without warranty of any kind. QAMind AI does not warrant that the Service will be error-free, uninterrupted, or that AI-generated test cases will be correct or complete. Test output should be reviewed by a qualified engineer before use in production.
              </p>
            </Section>

            <Section title="9. Limitation of liability">
              <p>
                To the maximum extent permitted by applicable law, QAMind AI's total liability for any claim arising from use of the Service is limited to the amount you paid in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.
              </p>
            </Section>

            <Section title="10. Governing law">
              <p>
                These Terms are governed by the laws of India. Disputes will be resolved in the courts of competent jurisdiction in India. If any provision of these Terms is found unenforceable, the remaining provisions continue in full effect.
              </p>
            </Section>

            <Section title="11. Changes">
              <p>
                We may update these Terms from time to time. Material changes will be communicated via email at least 14 days before taking effect. Continued use after the effective date constitutes acceptance of the updated Terms.
              </p>
            </Section>

            <Section title="12. Contact">
              <p>
                Questions about these Terms: <a href="mailto:hello@qamind.ai" className="text-[var(--c-accent)] hover:underline">hello@qamind.ai</a>
              </p>
            </Section>

          </div>
        </section>
      </main>
    </div>
  );
}
