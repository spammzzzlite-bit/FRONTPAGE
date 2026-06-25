import { useState, useEffect } from "react";
import { PAGE_TEXT } from "@/content";
import { FileText, Monitor, ChevronRight, Clock, Waves, Boxes, LayoutDashboard, Archive, Bell } from "lucide-react";

const PAIN_ICONS = [Clock, Waves, Boxes, LayoutDashboard, Archive, Bell];
const ICON_ANIMS = [
  "problem-icon-clock",
  "problem-icon-waves",
  "problem-icon-boxes",
  "problem-icon-dashboard",
  "problem-icon-archive",
  "problem-icon-bell",
];

export function HowItWorks({ reduced }: { reduced: boolean }) {
  const hw = PAGE_TEXT.howItWorks;
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false, false, false, false]);
  const [isSolutionMode, setIsSolutionMode] = useState(false);

  useEffect(() => {
    hw.pains.forEach((_, i) => {
      setTimeout(() => {
        setFlipped(f => {
          const next = [...f];
          next[i] = isSolutionMode;
          return next;
        });
      }, i * 60);
    });
  }, [isSolutionMode, hw.pains]);

  return (
    <section
      id="how-it-works"
      data-section-theme="light"
      className="editorial-section relative"
    >
      <span className="editorial-note">§ the work before the work</span>

      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">

        {/* ── Problem block ──────────────────────────────────── */}
        <div className="dim-target mb-20">
          <p className="section-marker label-eyebrow mb-3 group cursor-default">
            <span className="relative inline-block w-[1em] h-[1em] mr-1 align-middle text-[var(--c-accent)]">
              <span className="absolute inset-0 transition-all duration-300 transform origin-center group-hover:rotate-90 group-hover:opacity-0">&sect;</span>
              <span className="absolute inset-0 transition-all duration-300 transform origin-center -rotate-90 opacity-0 group-hover:rotate-0 group-hover:opacity-100">&para;</span>
            </span>
            {hw.sectionMarker}
          </p>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <h2 className="section-heading max-w-[700px] font-display text-4xl leading-[1.04] md:text-5xl">
              {hw.heading}
            </h2>
            
            {/* Global Toggle */}
            <div className="problem-toggle-wrap flex items-center bg-[var(--c-bg-card)] rounded-full p-1 border border-[var(--c-border)] shrink-0 self-start md:self-auto">
              <button 
                className={`problem-toggle-btn ${!isSolutionMode ? "is-active" : ""}`}
                onClick={() => setIsSolutionMode(false)}
                aria-pressed={!isSolutionMode}
              >
                Problems
              </button>
              <button 
                className={`problem-toggle-btn ${isSolutionMode ? "is-active" : ""}`}
                onClick={() => setIsSolutionMode(true)}
                aria-pressed={isSolutionMode}
              >
                Solutions
              </button>
            </div>
          </div>

          <div className="problem-flip-grid">
            {hw.pains.map((item, i) => {
              const Icon = PAIN_ICONS[i] as React.ElementType<{ size?: number; strokeWidth?: number }>;
              return (
                <div
                  key={i}
                  className={`problem-flip-card${flipped[i] ? " is-flipped" : ""}`}
                  onClick={() => {
                    const newFlipped = [...flipped];
                    newFlipped[i] = !newFlipped[i];
                    setFlipped(newFlipped);
                    
                    // Auto-update global toggle state if all cards match
                    if (newFlipped.every(v => v === true)) setIsSolutionMode(true);
                    if (newFlipped.every(v => v === false)) setIsSolutionMode(false);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={flipped[i]}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      const newFlipped = [...flipped];
                      newFlipped[i] = !newFlipped[i];
                      setFlipped(newFlipped);
                      if (newFlipped.every(v => v === true)) setIsSolutionMode(true);
                      if (newFlipped.every(v => v === false)) setIsSolutionMode(false);
                    }
                  }}
                >
                  <div className="problem-flip-card-inner">
                    <div className="problem-flip-card-front">
                      <div className={`problem-flip-icon ${ICON_ANIMS[i]}`}>
                        <Icon size={28} strokeWidth={1.5} />
                      </div>
                      <h3 className="problem-flip-title">{item.title}</h3>
                      <p className="problem-flip-pain">{item.pain}</p>
                    </div>
                    <div className="problem-flip-card-back">
                      <span className="problem-flip-eyebrow">The fix</span>
                      <h3 className="problem-flip-title">{item.title}</h3>
                      <p className="problem-flip-fix">{item.fix}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>


      </div>
    </section>
  );
}
