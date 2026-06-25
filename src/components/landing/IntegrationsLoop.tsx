import { useCallback, useEffect, useRef, useState } from "react";
import { PAGE_TEXT } from "@/content";
import { INTEGRATION_ICONS, type IntegrationIcon } from "./integration-icons";

function useIsDark() {
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark")),
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

type HoveredItem = { name: string; category: string; color: string };

function IntegrationChip({
  item,
  isDark,
  onEnter,
  onLeave,
}: {
  item: { name: string; category: string };
  isDark: boolean;
  onEnter: (h: HoveredItem) => void;
  onLeave: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const icon: IntegrationIcon | undefined = INTEGRATION_ICONS[item.name];
  const color = icon ? (isDark ? icon.darkColor : icon.lightColor) : "#888";

  const handleEnter = () => {
    setIsHovered(true);
    onEnter({ name: item.name, category: item.category, color });
  };

  const handleLeave = () => {
    setIsHovered(false);
    onLeave();
  };

  return (
    <div
      className={`integrations-chip${isHovered ? " is-hovered" : ""}`}
      style={{ "--chip-brand": color } as React.CSSProperties}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      role="img"
      aria-label={`${item.name} integration`}
    >
      {icon?.type === "img" ? (
        <img
          src={icon.url}
          alt={`${item.name} logo`}
          className="integrations-svg integrations-img"
          aria-hidden="true"
          style={isDark && icon.invertInDark ? { filter: "invert(1) brightness(1.2)" } : undefined}
        />
      ) : icon?.type === "svg" ? (
        <svg
          viewBox={item.name === "Zephyr Scale" ? "0 0 64 64" : "0 0 24 24"}
          className="integrations-svg"
          aria-hidden="true"
          style={{ fill: color, ...(isDark && icon.invertInDark ? { filter: "invert(1) brightness(1.2)" } : {}) }}
        >
          <path d={icon.path} />
        </svg>
      ) : (
        <span
          className="integrations-initial"
          aria-hidden="true"
          style={{ color, background: `${color}18` }}
        >
          {icon?.letter ?? item.name[0]}
        </span>
      )}
    </div>
  );
}

function CategorySpotlight({
  hovered,
  totalCount,
}: {
  hovered: HoveredItem | null;
  totalCount: number;
}) {
  const [displayed, setDisplayed] = useState<HoveredItem | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      setDisplayed(hovered);
      setVisible(true);
    } else {
      setVisible(false);
      timerRef.current = setTimeout(() => setDisplayed(null), 260);
    }
    return () => clearTimeout(timerRef.current);
  }, [hovered]);

  return (
    <div className="integrations-spotlight" aria-live="polite" aria-atomic="true">
      {/* default — count, fades out on hover */}
      <div className={`integrations-spotlight-count${visible ? " is-hidden" : ""}`}>
        <span className="integrations-count-n">{totalCount}</span>
        <span className="integrations-count-label">integrations</span>
      </div>

      {/* hover detail — fades in on hover */}
      <div className={`integrations-spotlight-detail${visible ? " is-visible" : ""}`}>
        {displayed && (
          <>
            <span
              className="integrations-spotlight-cat"
              style={{ color: displayed.color }}
            >
              {displayed.category}
            </span>
            <span className="integrations-spotlight-name">{displayed.name}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function IntegrationsLoop({ reduced, forceDark }: { reduced: boolean; forceDark?: boolean }) {
  const ig = PAGE_TEXT.integrations;
  const isDarkGlobal = useIsDark();
  const isDark = forceDark ?? isDarkGlobal;

  const [hovered, setHovered] = useState<HoveredItem | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleEnter = useCallback((item: HoveredItem) => {
    clearTimeout(clearTimerRef.current);
    setHovered(item);
  }, []);

  const handleLeave = useCallback(() => {
    clearTimerRef.current = setTimeout(() => setHovered(null), 80);
  }, []);

  return (
    <section
      id="integrations"
      data-section-theme="dark"
      className="editorial-section relative"
    >
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-10 md:pt-28">
        <div className="flex items-end justify-between gap-8">

          {/* Left: copy */}
          <div className="max-w-[520px]">
            <p className="section-marker label-eyebrow mb-4 group cursor-default">
              <span className="relative inline-block w-[1em] h-[1em] mr-1 align-middle text-[var(--c-accent)]">
                <span className="absolute inset-0 transition-all duration-300 origin-center group-hover:rotate-90 group-hover:opacity-0">
                  &sect;
                </span>
                <span className="absolute inset-0 transition-all duration-300 origin-center -rotate-90 opacity-0 group-hover:rotate-0 group-hover:opacity-100">
                  &para;
                </span>
              </span>
              {ig.sectionMarker}
            </p>

            <h2 className="font-display text-3xl md:text-4xl leading-tight text-[var(--c-text)] mb-3">
              {ig.heading}
            </h2>
            <p className="text-[15px] leading-relaxed text-[var(--c-text-muted)]">
              {ig.body}
            </p>
          </div>

          {/* Right: spotlight — visible md+ */}
          <div className="hidden md:block flex-shrink-0">
            <CategorySpotlight hovered={hovered} totalCount={ig.items.length} />
          </div>

        </div>
      </div>

      {/* Marquee — full bleed, fades at edges */}
      <div className={`integrations-wrap pb-20 md:pb-28${reduced ? " is-reduced" : ""}`}>
        <div className="integrations-track">
          {ig.items.map((item, i) => (
            <IntegrationChip
              key={i}
              item={item}
              isDark={isDark}
              onEnter={handleEnter}
              onLeave={handleLeave}
            />
          ))}
          {/* duplicate set for seamless loop — screen readers skip */}
          <div aria-hidden="true" style={{ display: "contents" }}>
            {ig.items.map((item, i) => (
              <IntegrationChip
                key={`d${i}`}
                item={item}
                isDark={isDark}
                onEnter={handleEnter}
                onLeave={handleLeave}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
