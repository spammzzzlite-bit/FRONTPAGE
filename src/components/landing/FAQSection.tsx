import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PAGE_TEXT } from "@/content";

export function FAQSection({ reduced }: { reduced: boolean }) {
  const faq = PAGE_TEXT.faq;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section
      id="faq"
      data-section-theme="light"
      className="editorial-section relative"
    >
      <span className="editorial-note">§ before you sign up</span>

      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="md:grid md:grid-cols-12 md:gap-16 lg:gap-20">

          {/* Left — heading */}
          <div className="mb-12 md:col-span-4 md:mb-0 md:pt-1">
            <p className="section-marker label-eyebrow mb-4 group cursor-default">
              <span className="relative inline-block w-[1em] h-[1em] mr-1 align-middle text-[var(--c-accent)]">
                <span className="absolute inset-0 transition-all duration-300 origin-center group-hover:rotate-90 group-hover:opacity-0">
                  &sect;
                </span>
                <span className="absolute inset-0 transition-all duration-300 origin-center -rotate-90 opacity-0 group-hover:rotate-0 group-hover:opacity-100">
                  &para;
                </span>
              </span>
              {faq.sectionMarker}
            </p>

            <h2 className="section-heading font-display text-3xl md:text-4xl leading-tight text-[var(--c-text)]">
              {faq.heading}
            </h2>

            {faq.subtext && (
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--c-text-muted)]">
                {faq.subtext}
              </p>
            )}
          </div>

          {/* Right — accordion */}
          <div className="md:col-span-7 md:col-start-6">
            <div className="faq-list">
              {faq.items.map((item, i) => {
                const isOpen = openIndex === i;
                const panelId = `faq-panel-${i}`;
                const triggerId = `faq-trigger-${i}`;

                return (
                  <div
                    key={i}
                    className={`faq-row${isOpen ? " is-open" : ""}`}
                  >
                    <button
                      id={triggerId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="faq-trigger"
                      onClick={() => toggle(i)}
                    >
                      <span className="faq-question">{item.question}</span>
                      <ChevronDown
                        className={`faq-chevron${isOpen ? " is-open" : ""}`}
                        aria-hidden="true"
                      />
                    </button>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      className={`faq-body${isOpen ? " is-open" : ""}`}
                    >
                      <div className="faq-body-inner">
                        <p className="faq-answer">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
