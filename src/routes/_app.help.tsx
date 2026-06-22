import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Download, Puzzle } from "lucide-react";
import { PageHeader } from "./_app.projects";
import { CONTACT_EMAIL } from "@/lib/brand";

export const Route = createFileRoute("/_app/help")({
  head: () => ({ meta: [{ title: "Help & Docs — QAMind AI" }] }),
  component: HelpPage,
});

const FAQ = [
  {
    q: "How do I generate test cases?",
    a: "Open the Generate page from the sidebar, paste your requirements (or upload a doc), and press Generate. Cases are drafted as plain rows you can edit or delete.",
  },
  {
    q: "How do I connect CI/CD?",
    a: "Visit Integrations and connect a runner — GitHub Actions, Jenkins, or GitLab CI. The current build uses mock connections; OAuth wiring is coming in an upcoming release.",
  },
  {
    q: "What file formats are supported?",
    a: ".pdf, .docx, .xlsx, .csv, .json, .yaml, .md and .txt. Files up to 25 MB per upload.",
  },
  {
    q: "Can I export my test cases?",
    a: "Yes — every project has an Export action that produces a .csv or .json snapshot. Coming alongside the first run.",
  },
];

function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        section="§ Help"
        title="Help & docs"
        subtitle={`Questions about setup, runs, or exports? Email ${CONTACT_EMAIL}.`}
      />
      <div className="mb-6 rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-[var(--c-accent-soft)] text-[var(--c-accent)]">
              <Puzzle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-[24px] text-[var(--c-text)]">QA Mind Recorder</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--c-text-muted)]">
                Download the Chrome extension, then open QAMind while signed in so your account's
                projects sync into the extension popup.
              </p>
            </div>
          </div>
          <a
            href="/extension/qa-mind-recorder-extension-v2.1.3.zip"
            download
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[8px] bg-[var(--c-accent)] px-4 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-[1px] hover:bg-[var(--c-accent-dark)]"
          >
            <Download className="h-4 w-4" />
            Download Extension
          </a>
        </div>
      </div>

      <div className="space-y-4">
        {FAQ.map((item, i) => (
          <div
            key={item.q}
            className="rounded-[12px] border border-[var(--c-border)] bg-[var(--c-bg-card)] overflow-hidden transition-all duration-[var(--t-normal)] stagger-item delay-${i * 100}"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[var(--c-bg-hover)] transition-colors"
            >
              <span className="font-display text-[22px] text-[var(--c-text)]">{item.q}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 transition-transform duration-[var(--t-normal)] ${open === i ? "rotate-180 text-[var(--c-accent)]" : "text-[var(--c-text-muted)]"}`}
              />
            </button>
            <div
              className={`px-6 overflow-hidden transition-all duration-[var(--t-normal)] ${open === i ? "max-h-[500px] opacity-100 pb-6" : "max-h-0 opacity-0 pb-0"}`}
            >
              <div className="h-[1px] w-full bg-[var(--c-border)] mb-4" />
              <p className="text-[14px] leading-relaxed text-[var(--c-text-muted)]">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
