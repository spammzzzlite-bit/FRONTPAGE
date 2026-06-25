import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, BookOpen, Zap, CreditCard, Clock, AlertTriangle, Boxes, Video, HelpCircle, Download, FileText, Play, History, Bug, BarChart3, GitBranch, ClipboardList, Layers, ArrowRight, Github, Youtube, Linkedin, Mail, Send, TrendingDown, MessageSquare } from "lucide-react";
import { PAGE_TEXT } from "../content";
import { useAuth, signOut } from "@/frontend/store/store";
import { QAMindLogo } from "@/frontend/components/brand";
import { HowItWorks, IntegrationsLoop, FAQSection, RecorderDownloadModal } from "@/components/landing";
import { CONTACT_EMAIL, TAGLINE } from "@/lib/brand";
import { isOnboardingCompleteLocally, qamindStorage } from "@/lib/storage-keys";
import { isGptSite } from "@/lib/gpt-site";
import { Particles } from "@/components/ui/particles";

const PILL_NAV: Record<string, string> = {
  "how-it-works": "Problems",
  integrations: "Integrations",
  practice: "Practice",
  recorder: "Recorder",
  faq: "FAQ",
  colophon: "About",
};

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && isGptSite()) {
      throw redirect({ to: "/gpt" });
    }
  },
  head: () => ({
    meta: [
      { title: "QAMind AI — Quality assurance, with a mind of its own." },
      {
        name: "description",
        content:
          "QAMind AI generates, runs, and reasons about your tests — surfacing flaky cases and real bugs before your users do.",
      },
      { property: "og:title", content: "QAMind AI — Quality assurance, with a mind of its own." },
      {
        property: "og:description",
        content:
          "QAMind AI generates, runs, and reasons about your tests — surfacing flaky cases and real bugs before your users do.",
      },
    ],
  }),
  component: Welcome,
});

function renderWithFallWords(text: string) {
  const words = PAGE_TEXT.fallWords || [];
  if (!words.length || !text) return <>{text}</>;

  const regex = new RegExp(`\\b(${words.join("|")})\\b`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        if (words.some((w) => w.toLowerCase() === part.toLowerCase())) {
          return (
            <span key={i} className="fall-word" data-fall-word="true">
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

type GsapInstance = {
  registerPlugin: (...plugins: unknown[]) => void;
  timeline: (vars?: Record<string, unknown>) => GsapTimeline;
  set: (targets: unknown, vars: Record<string, unknown>) => void;
  to: (targets: unknown, vars: Record<string, unknown>) => GsapTween;
  from: (targets: unknown, vars: Record<string, unknown>) => GsapTween;
  fromTo: (
    targets: unknown,
    fromVars: Record<string, unknown>,
    toVars: Record<string, unknown>,
  ) => GsapTween;
  utils: {
    toArray: <T = Element>(targets: string | Element[] | NodeListOf<Element>) => T[];
  };
};

type GsapTimeline = {
  from: (
    targets: unknown,
    vars: Record<string, unknown>,
    position?: string | number,
  ) => GsapTimeline;
  to: (targets: unknown, vars: Record<string, unknown>, position?: string | number) => GsapTimeline;
  set: (
    targets: unknown,
    vars: Record<string, unknown>,
    position?: string | number,
  ) => GsapTimeline;
  kill: () => void;
};

type GsapTween = { kill: () => void };

type ScrollTriggerInstance = {
  create: (vars: Record<string, unknown>) => { kill: () => void };
  update: () => void;
  refresh: () => void;
  getAll: () => Array<{ kill: () => void }>;
};

type SplitTextInstance = {
  chars?: Element[];
  words?: Element[];
  revert: () => void;
};

type SplitTextConstructor = new (
  element: Element,
  vars: { type: string; charsClass?: string; wordsClass?: string },
) => SplitTextInstance;

type LenisInstance = {
  raf: (time: number) => void;
  destroy: () => void;
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) => void;
};

type LenisConstructor = new (vars: {
  duration: number;
  easing: (t: number) => number;
  smoothWheel: boolean;
  wheelMultiplier?: number;
}) => LenisInstance;

declare global {
  interface Window {
    gsap?: GsapInstance;
    ScrollTrigger?: ScrollTriggerInstance;
    SplitText?: SplitTextConstructor;
    Lenis?: LenisConstructor;
    __qlenis?: LenisInstance;
  }
}

const CDN_SCRIPTS = [
  "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/bundled/lenis.min.js",
  "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js",
  "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js",
  "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js",
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}


function useCdnScripts() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadOne = (src: string) =>
      new Promise<void>((resolve) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
        if (existing) {
          if (existing.dataset.loaded === "true") resolve();
          else existing.addEventListener("load", () => resolve(), { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.dataset.qamindMotion = "true";
        script.addEventListener("load", () => {
          script.dataset.loaded = "true";
          resolve();
        });
        script.addEventListener("error", () => resolve());
        document.head.appendChild(script);
      });

    CDN_SCRIPTS.reduce((promise, src) => promise.then(() => loadOne(src)), Promise.resolve()).then(
      () => {
        if (!cancelled) setLoaded(true);
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return loaded;
}

function useLenis(ready: boolean, reduced: boolean) {
  useEffect(() => {
    if (!ready || reduced || !window.Lenis) return;

    const lenis = new window.Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      window.ScrollTrigger?.update();
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);
    window.__qlenis = lenis;

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      window.__qlenis = undefined;
    };
  }, [ready, reduced]);
}

function useMotionSystem(
  ready: boolean,
  reduced: boolean,
  rootRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (reduced) {
      root.classList.add("motion-reduced");
      return () => root.classList.remove("motion-reduced");
    }

    if (!ready || !window.gsap || !window.ScrollTrigger) return;

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const splitInstances: SplitTextInstance[] = [];
    const cleanupFns: Array<() => void> = [];

    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(window.SplitText);

    const split = (element: Element, type: "chars" | "words") => {
      if (!window.SplitText) return null;
      const instance = new window.SplitText(element, {
        type,
        charsClass: "fn-split-char",
        wordsClass: "fn-split-word",
      });
      splitInstances.push(instance);
      return instance;
    };

    const headline = root.querySelector(".hero-headline");
    const nav = root.querySelector(".field-nav");
    const subtext = root.querySelector(".hero-subtext");
    const ctas = root.querySelectorAll(".hero-cta");
    const chars = headline ? split(headline, "chars")?.chars : null;

    if (chars?.length) {
      gsap.set(chars, { yPercent: 105 });
    }

    const intro = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => root.classList.add("intro-complete"),
    });

    intro
      .from(nav, { opacity: 0, y: -18, duration: 0.22 })
      .to(
        chars?.length ? chars : headline,
        { yPercent: 0, opacity: 1, duration: 0.44, stagger: 0.018 },
        0.14,
      )
      .from(subtext, { opacity: 0, y: 14, duration: 0.28 }, 0.42)
      .from(ctas, { opacity: 0, y: 22, duration: 0.32, stagger: 0.05 }, 0.54);

    if (!chars?.length && headline) {
      gsap.from(headline, { opacity: 0, y: 26, duration: 0.52, ease: "power3.out" });
    }

    root.querySelectorAll(".section-marker").forEach((marker) => {
      gsap.from(marker, {
        opacity: 0,
        rotate: -15,
        y: 10,
        duration: 0.58,
        ease: "power3.out",
        scrollTrigger: { trigger: marker, start: "top 84%", once: true },
      });
    });

    root.querySelectorAll(".section-heading").forEach((heading) => {
      const words = split(heading, "words")?.words;
      gsap.from(words?.length ? words : heading, {
        yPercent: words?.length ? 105 : 0,
        y: words?.length ? 0 : 22,
        opacity: words?.length ? 1 : 0,
        duration: 0.62,
        stagger: 0.045,
        ease: "power3.out",
        scrollTrigger: { trigger: heading, start: "top 82%", once: true },
      });
    });

    gsap.from(root.querySelectorAll(".practice-card"), {
      opacity: 0,
      y: 34,
      duration: 0.62,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: "#practice", start: "top 68%", once: true },
    });

    root.querySelectorAll<HTMLElement>(".editorial-note").forEach((note) => {
      gsap.fromTo(
        note,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          delay: 0.5,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: { trigger: note.closest("section"), start: "top 70%", once: true },
        },
      );
    });

    // Pain rows reveal
    const painRows = root.querySelectorAll(".how-pain-row");
    if (painRows.length) {
      gsap.from(painRows, {
        opacity: 0,
        y: 18,
        duration: 0.45,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: ".how-pain-rows", start: "top 80%", once: true },
      });
    }

    // Pipeline reveal: stagger cards then connectors
    const pipelineSteps = root.querySelectorAll(".pipeline-step");
    const pipelineConnectors = root.querySelectorAll(".pipeline-connector");
    if (pipelineSteps.length) {
      const pipeTl = gsap.timeline({
        scrollTrigger: { trigger: ".how-pipeline-steps", start: "top 76%", once: true },
      });
      pipelineSteps.forEach((step, i) => {
        pipeTl.from(step, { opacity: 0, y: 32, duration: 0.5, ease: "power3.out" }, i * 0.15);
        if (pipelineConnectors[i]) {
          pipeTl.from(
            pipelineConnectors[i],
            { opacity: 0, x: -10, duration: 0.3, ease: "power2.out" },
            i * 0.15 + 0.38,
          );
        }
      });
    }

    // FAQ rows stagger-reveal
    const faqRows = root.querySelectorAll(".faq-row");
    if (faqRows.length) {
      gsap.from(faqRows, {
        opacity: 0,
        y: 18,
        duration: 0.45,
        stagger: 0.09,
        ease: "power2.out",
        scrollTrigger: { trigger: "#faq", start: "top 78%", once: true },
      });
    }

    root.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
      const onMove = (event: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, {
          rotateX: y * -20,
          rotateY: x * 20,
          duration: 0.22,
          ease: "power2.out",
          transformPerspective: 600,
          transformStyle: "preserve-3d",
        });
      };
      const onLeave = () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.55)",
        });
      };
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      cleanupFns.push(() => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      });
    });

    root.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((button) => {
      const onMove = (event: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = event.clientX - centerX;
        const dy = event.clientY - centerY;
        const distance = Math.hypot(dx, dy);

        if (distance < 80) {
          const force = (80 - distance) / 80;
          gsap.to(button, {
            x: dx * 0.32 * force,
            y: dy * 0.42 * force,
            duration: 0.2,
            ease: "power2.out",
          });
        } else {
          gsap.to(button, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.5)" });
        }
      };
      const onLeave = () => {
        gsap.to(button, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" });
      };
      window.addEventListener("mousemove", onMove, { passive: true });
      button.addEventListener("mouseleave", onLeave);
      cleanupFns.push(() => {
        window.removeEventListener("mousemove", onMove);
        button.removeEventListener("mouseleave", onLeave);
      });
    });

    ScrollTrigger.refresh();

    return () => {
      intro.kill();
      cleanupFns.forEach((cleanup) => cleanup());
      splitInstances.forEach((instance) => instance.revert());
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      root.classList.remove("intro-complete");
    };
  }, [ready, reduced, rootRef]);
}

function TypewriterDesc({
  text,
  hovered,
  reduced,
}: {
  text: string;
  hovered: boolean;
  reduced: boolean;
}) {
  const [displayed, setDisplayed] = useState(text);

  useEffect(() => {
    if (reduced) {
      setDisplayed(text);
      return;
    }
    if (hovered) {
      setDisplayed("");
      let i = 0;
      let frame: number;
      let lastTime = performance.now();

      const step = (now: number) => {
        const rate = 800 / Math.max(text.length, 1);
        if (now - lastTime > rate) {
          i++;
          setDisplayed(text.slice(0, i));
          lastTime = now;
        }
        if (i < text.length) {
          frame = requestAnimationFrame(step);
        }
      };
      frame = requestAnimationFrame(step);
      return () => cancelAnimationFrame(frame);
    } else {
      setDisplayed(text);
    }
  }, [hovered, text, reduced]);

  return (
    <>
      {displayed}
      {hovered && !reduced && displayed.length < text.length && (
        <span className="typewriter-cursor">|</span>
      )}
    </>
  );
}

function CountUpDesc({
  text,
  hovered,
  reduced,
}: {
  text: string;
  hovered: boolean;
  reduced: boolean;
}) {
  const [val, setVal] = useState(0);
  const match = text.match(/\d+/);
  const target = match ? parseInt(match[0], 10) : 0;

  useEffect(() => {
    if (reduced || !target) return;
    if (hovered) {
      setVal(0);
      const start = performance.now();
      let frame: number;
      const step = (now: number) => {
        const progress = Math.min((now - start) / 600, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setVal(Math.round(target * ease));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
      return () => cancelAnimationFrame(frame);
    } else {
      setVal(target);
    }
  }, [hovered, target, reduced]);

  if (!target) return <>{text}</>;
  return <>{text.replace(/\d+/, val.toString())}</>;
}

function FeatureIcon({
  type,
  hovered,
  reduced,
}: {
  type: string;
  hovered: boolean;
  reduced: boolean;
}) {
  if (type === "workspace") {
    return (
      <div className="w-8 h-8 relative">
        {/* Desk scene */}
        <div className="absolute bottom-1 left-1 w-4 h-1 bg-[var(--c-border-strong)] rounded-full"></div>
        <div className="absolute bottom-2 left-2 w-2 h-4 bg-[var(--c-border-strong)] rounded-t-sm"></div>
        <div className="absolute bottom-5 left-1 w-4 h-2 bg-[var(--c-border-strong)] rounded-full origin-bottom-right transform rotate-12"></div>
        <div
          className={`absolute bottom-2 left-0 w-6 h-6 rounded-full bg-[var(--c-accent)] mix-blend-screen blur-sm transition-opacity duration-300 ${hovered && !reduced ? "opacity-40" : "opacity-0"}`}
        ></div>
        <div className="absolute bottom-1 right-1 w-2 h-2 bg-[var(--c-text-muted)] rounded-b-sm"></div>
        {hovered && !reduced && (
          <>
            <div
              className="absolute bottom-4 right-1 w-1 h-1 bg-[var(--c-text-muted)] rounded-full animate-steam"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="absolute bottom-4 right-2 w-1 h-1 bg-[var(--c-text-muted)] rounded-full animate-steam"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="absolute bottom-4 right-1.5 w-1 h-1 bg-[var(--c-text-muted)] rounded-full animate-steam"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </>
        )}
      </div>
    );
  }
  if (type === "pace") {
    return (
      <div className="w-8 h-8 relative flex justify-center items-end pb-1 overflow-hidden">
        <div className="w-4 h-1 bg-[var(--c-border-strong)] rounded-full absolute bottom-1"></div>
        <div
          className={`absolute bottom-1.5 w-0.5 h-6 bg-[var(--c-accent)] origin-bottom transition-transform ${hovered && !reduced ? "animate-metronome" : ""}`}
        >
          <div className="absolute -top-1 -left-0.5 w-1.5 h-1.5 bg-[var(--c-accent)] rounded-full"></div>
        </div>
      </div>
    );
  }
  return null;
}

function FeatureCard({
  n,
  featureKey,
  reduced,
}: {
  n: string;
  featureKey: "workspace" | "format" | "pace" | "cost";
  reduced: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const feature = PAGE_TEXT.features[featureKey];
  const manifesto = PAGE_TEXT.features.manifestos[featureKey];

  return (
    <div
      className="feature-card-wrapper fn-hover-target"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`feature-card-inner relative w-full h-full rounded-[8px] transition-transform ${flipped ? "is-flipped" : ""}`}
        style={{ transitionDuration: reduced ? "0s" : "0.6s" }}
      >
        {/* Front Face (Relative to set height) */}
        <div
          className={`feature-card-front relative w-full h-full backface-hidden rounded-[8px] border bg-[var(--c-bg-card)] p-4 flex flex-col justify-between ${hovered && featureKey === "cost" && !reduced && !feature.desc.match(/\d/) ? "border-pulse-orange" : "border-[var(--c-border)]"}`}
        >
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="block font-mono text-[10px] text-[var(--c-accent)]">{n}</span>
              <FeatureIcon type={featureKey} hovered={hovered} reduced={reduced} />
            </div>
            <p className="text-[14px] font-semibold text-[var(--c-text)]">{feature.label}</p>
          </div>
          <p className="mt-2 text-[12px] leading-[1.45] text-[var(--c-text-muted)]">
            {featureKey === "format" ? (
              <TypewriterDesc text={feature.desc} hovered={hovered} reduced={reduced} />
            ) : featureKey === "cost" ? (
              <CountUpDesc text={feature.desc} hovered={hovered} reduced={reduced} />
            ) : (
              feature.desc
            )}
          </p>
        </div>

        {/* Back Face (Absolute to overlay) */}
        <div className="feature-card-back absolute inset-0 backface-hidden rotate-y-180 rounded-[8px] border border-[var(--c-border)] bg-[var(--c-bg-hover)] p-4 flex items-center justify-center text-center">
          <p className="font-display italic text-[15px] leading-snug text-[var(--c-text)]">
            {manifesto}
          </p>
        </div>
      </div>
    </div>
  );
}

function useGlobalInteractions(reduced: boolean) {
  const [activeNav, setActiveNav] = useState<string>("");

  useEffect(() => {
    // Nav Dot scroll spy
    const sections = document.querySelectorAll("section[id], footer[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        let visibleSection = activeNav;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSection = entry.target.id;
          }
        });
        if (visibleSection !== activeNav) {
          setActiveNav(visibleSection);
        }
      },
      { rootMargin: "-40% 0px -40% 0px" },
    );

    sections.forEach((s) => observer.observe(s));

    // HR Draw-In
    const hrs = document.querySelectorAll(".fn-hr-draw");
    const hrObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !reduced) {
            (entry.target as HTMLElement).style.transform = "scaleX(1)";
          }
        });
      },
      { threshold: 0.1 },
    );

    hrs.forEach((hr) => {
      (hr as HTMLElement).style.transform = reduced ? "scaleX(1)" : "scaleX(0)";
      (hr as HTMLElement).style.transformOrigin = "center";
      (hr as HTMLElement).style.transition = "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
      hrObserver.observe(hr);
    });

    // Stillness Reward
    let idleTimeout: NodeJS.Timeout;
    const resetIdle = () => {
      clearTimeout(idleTimeout);
      document.body.classList.remove("is-idle");

      idleTimeout = setTimeout(() => {
        document.body.classList.add("is-idle");
      }, 20000);
    };

    window.addEventListener("mousemove", resetIdle, { passive: true });
    window.addEventListener("keydown", resetIdle, { passive: true });
    window.addEventListener("scroll", resetIdle, { passive: true });
    resetIdle();

    return () => {
      observer.disconnect();
      hrObserver.disconnect();
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      window.removeEventListener("scroll", resetIdle);
      clearTimeout(idleTimeout);
    };
  }, [activeNav, reduced]);

  return activeNav;
}


function SectionMarker({ label }: { label: string }) {
  return (
    <p className="section-marker label-eyebrow mb-3 group cursor-default">
      <span className="fn-section-symbol relative inline-block w-[1em] h-[1em] mr-1 align-middle text-[var(--c-accent)]">
        <span className="absolute inset-0 transition-all duration-300 transform origin-center group-hover:rotate-90 group-hover:opacity-0">
          &sect;
        </span>
        <span className="absolute inset-0 transition-all duration-300 transform origin-center -rotate-90 opacity-0 group-hover:rotate-0 group-hover:opacity-100">
          &para;
        </span>
      </span>
      {label}
    </p>
  );
}

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, key: string) {
  e.preventDefault();
  const target = document.getElementById(key);
  if (!target) return;
  if (window.__qlenis) {
    window.__qlenis.scrollTo(target, { offset: -80 });
  } else {
    target.scrollIntoView({ behavior: "smooth" });
  }
}

function Welcome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scriptsReady = useCdnScripts();
  const reduced = usePrefersReducedMotion();
  const auth = useAuth();
  const isAuthenticated = !!auth.session;
  const onboardingComplete =
    isAuthenticated &&
    typeof window !== "undefined" &&
    isOnboardingCompleteLocally(auth.user?.id) &&
    !!qamindStorage.get(qamindStorage.workspaceMeta());

  useLenis(scriptsReady, reduced);
  useMotionSystem(scriptsReady, reduced, rootRef);

  const activeNav = useGlobalInteractions(reduced);
  const [dotStyle, setDotStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [pillVisible, setPillVisible] = useState(false);
  const [pillIndicator, setPillIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const [pillTheme, setPillTheme] = useState<"dark" | "light">("dark");
  const [productOpen, setProductOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownLeaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const recorderDropdownRef = useRef<HTMLDivElement>(null);
  const recorderLeaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("ann-banner-v1") === "1"
  );

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
    localStorage.setItem("ann-banner-v1", "1");
  }, []);

  const openDropdown = useCallback(() => {
    if (dropdownLeaveRef.current) clearTimeout(dropdownLeaveRef.current);
    setProductOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    dropdownLeaveRef.current = setTimeout(() => setProductOpen(false), 150);
  }, []);

  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const solutionsDropdownRef = useRef<HTMLDivElement>(null);
  const solutionsLeaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSolutionsDropdown = useCallback(() => {
    if (solutionsLeaveRef.current) clearTimeout(solutionsLeaveRef.current);
    setSolutionsOpen(true);
  }, []);

  const closeSolutionsDropdown = useCallback(() => {
    solutionsLeaveRef.current = setTimeout(() => setSolutionsOpen(false), 150);
  }, []);

  const openRecorderDropdown = useCallback(() => {
    if (recorderLeaveRef.current) clearTimeout(recorderLeaveRef.current);
    setRecorderOpen(true);
  }, []);

  const closeRecorderDropdown = useCallback(() => {
    recorderLeaveRef.current = setTimeout(() => setRecorderOpen(false), 150);
  }, []);

  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesDropdownRef = useRef<HTMLDivElement>(null);
  const resourcesLeaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openResourcesDropdown = useCallback(() => {
    if (resourcesLeaveRef.current) clearTimeout(resourcesLeaveRef.current);
    setResourcesOpen(true);
  }, []);

  const closeResourcesDropdown = useCallback(() => {
    resourcesLeaveRef.current = setTimeout(() => setResourcesOpen(false), 150);
  }, []);

  useEffect(() => {
    // Sections that belong under Product dropdown in header
    const PRODUCT_SECTIONS = new Set(["features", "dashboard"]);
    if (!activeNav) {
      setDotStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    const nav = document.querySelector("nav.fn-nav") as HTMLElement;
    let target: HTMLElement | null = null;
    if (PRODUCT_SECTIONS.has(activeNav)) {
      target = document.querySelector("button.fn-nav-product-btn") as HTMLElement;
    } else if (activeNav === "recorder") {
      target = document.querySelector("button.fn-nav-recorder-btn") as HTMLElement;
    } else if (activeNav === "colophon") {
      target = document.querySelector("a.fn-nav-about-link") as HTMLElement;
    }
    // integrations / practice / faq have no header nav link → dot hides
    if (target && nav) {
      const linkRect = target.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      setDotStyle({
        left: linkRect.left - navRect.left + linkRect.width / 2 - 3,
        width: 6,
        opacity: 1,
      });
    } else {
      setDotStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [activeNav]);

  useEffect(() => {
    if (!activeNav) {
      setPillIndicator((p) => ({ ...p, opacity: 0 }));
      return;
    }
    const container = document.querySelector(".landing-pill-links") as HTMLElement;
    const link = document.querySelector(
      `.landing-pill-links a[href="#${activeNav}"]`,
    ) as HTMLElement;
    if (link && container) {
      const lr = link.getBoundingClientRect();
      const cr = container.getBoundingClientRect();
      setPillIndicator({ left: lr.left - cr.left, width: lr.width, opacity: 1 });
    } else {
      setPillIndicator((p) => ({ ...p, opacity: 0 }));
    }
  }, [activeNav]);

  useEffect(() => {
    const section = document.getElementById(activeNav) as HTMLElement | null;
    const theme = section?.dataset.sectionTheme as "dark" | "light" | undefined;
    setPillTheme(theme ?? "dark");
  }, [activeNav]);

  useEffect(() => {
    if (!productOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [productOpen]);

  useEffect(() => {
    if (!recorderOpen) return;
    const handler = (e: MouseEvent) => {
      if (recorderDropdownRef.current && !recorderDropdownRef.current.contains(e.target as Node)) {
        setRecorderOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [recorderOpen]);

  useEffect(() => {
    if (!solutionsOpen) return;
    const handler = (e: MouseEvent) => {
      if (solutionsDropdownRef.current && !solutionsDropdownRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [solutionsOpen]);

  useEffect(() => {
    if (!resourcesOpen) return;
    const handler = (e: MouseEvent) => {
      if (resourcesDropdownRef.current && !resourcesDropdownRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [resourcesOpen]);

  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => setPillVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    // Fall Words Logic
    const pile = document.getElementById("fall-word-pile");
    const words = document.querySelectorAll<HTMLElement>("[data-fall-word]");

    let triggered = false;
    const clones: { clone: HTMLElement; original: HTMLElement; index: number }[] = [];

    const fallScrollHandler = () => {
      if (triggered) return;
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);

      if (scrollPercent >= 0.7) {
        triggered = true;
        clones.forEach(({ clone, index }) => {
          setTimeout(() => {
            clone.style.transition = "none";
            clone.style.top = "-50px";
            clone.style.opacity = "0";

            // Force reflow
            void clone.offsetHeight;

            clone.style.transition = "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)";
            clone.style.top = clone.dataset.targetY || "0px";
            clone.style.opacity = "0.5";
          }, index * 80);
        });
      }
    };

    if (pile && words.length > 0 && !reduced) {
      words.forEach((word, index) => {
        const clone = document.createElement("span");
        clone.textContent = word.textContent;
        clone.className = "fallen-word";

        const randomX = Math.random() * 90;
        const randomRotate = Math.random() * 30 - 15;
        const randomY = Math.random() * 160;

        clone.style.left = randomX + "%";
        clone.style.top = randomY + "px";
        clone.style.transform = `rotate(${randomRotate}deg)`;
        clone.style.opacity = "0";
        clone.dataset.targetY = randomY + "px"; // store for animation target

        pile.appendChild(clone);
        clones.push({ clone, original: word, index });
      });

      window.addEventListener("scroll", fallScrollHandler, { passive: true });
    }

    return () => {
      if (pile && !reduced) {
        window.removeEventListener("scroll", fallScrollHandler);
      }
    };
  }, [reduced]);

  /* ─── Proximity parallax handler for hero headline chars ─── */
  const heroRafRef = useRef(0);
  const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    cancelAnimationFrame(heroRafRef.current);
    const cx = e.clientX;
    const cy = e.clientY;

    // Update CSS variables for the interactive grid spotlight
    const currentTarget = e.currentTarget;
    const rect = currentTarget.getBoundingClientRect();
    currentTarget.style.setProperty('--mouse-x', `${cx - rect.left}px`);
    currentTarget.style.setProperty('--mouse-y', `${cy - rect.top}px`);

    heroRafRef.current = requestAnimationFrame(() => {
      const chars = rootRef.current?.querySelectorAll<HTMLElement>(".fn-hero-char");
      if (!chars) return;
      const THRESHOLD = 150;
      const MAX_OFFSET = 2;
      chars.forEach((ch) => {
        const rect = ch.getBoundingClientRect();
        const chCx = rect.left + rect.width / 2;
        const chCy = rect.top + rect.height / 2;
        const dist = Math.hypot(cx - chCx, cy - chCy);
        if (dist < THRESHOLD) {
          const ratio = 1 - dist / THRESHOLD;
          const dx = (cx - chCx) / dist || 0;
          const dy = (cy - chCy) / dist || 0;
          ch.style.transform = `translate3d(${dx * MAX_OFFSET * ratio}px, ${dy * MAX_OFFSET * ratio}px, 0)`;
        } else {
          ch.style.transform = "translate3d(0,0,0)";
        }
      });
    });
  }, []);

  const handleHeroMouseLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    cancelAnimationFrame(heroRafRef.current);

    // Reset spotlight to top center
    const currentTarget = e.currentTarget;
    currentTarget.style.setProperty('--mouse-x', '50%');
    currentTarget.style.setProperty('--mouse-y', '0%');

    rootRef.current?.querySelectorAll<HTMLElement>(".fn-hero-char").forEach((ch) => {
      ch.style.transform = "translate3d(0,0,0)";
    });
  }, []);

  return (
    <div
      ref={rootRef}
      data-section-theme="dark"
      className="qamind-marketing-page min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]"
    >
      <RecorderDownloadModal open={downloadOpen} onClose={() => setDownloadOpen(false)} />



      {/* ENHANCED: Global Micro-Interactions | Edit text in content.ts */}
      <div className="stillness-overlay" aria-hidden="true" />

      <header
        className="field-nav w-full"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02] mt-1.5 -ml-6" aria-label="QAMind AI home">
            <img
              src="/brand/appicon-primary.png"
              alt=""
              aria-hidden="true"
              className="h-[50px] w-[50px] flex-shrink-0 rounded-[11px]"
            />
            <span className="font-display text-[28px] font-semibold leading-none tracking-[-0.025em] text-[var(--c-text)]">
              QAMind <span className="text-[var(--c-accent)]">AI</span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-6 md:flex relative fn-nav"
            aria-label="Landing page"
          >
            {/* Features dropdown */}
            <div className="relative" ref={dropdownRef} onMouseEnter={openDropdown} onMouseLeave={closeDropdown}>
              <button
                className="fn-nav-product-btn landing-nav-link flex items-center gap-1 text-[14px] font-semibold text-[var(--c-text)] transition-colors py-1"
                onClick={() => setProductOpen((o) => !o)}
                aria-expanded={productOpen}
                aria-haspopup="true"
              >
                Features
                <ChevronDown
                  className="w-3 h-3 transition-transform duration-200"
                  style={{ transform: productOpen ? "rotate(180deg)" : undefined }}
                />
              </button>
              <div
                className={`fn-dropdown fn-feat-dropdown${productOpen ? " is-open" : ""}`}
                role="menu"
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
              >
                {/* Header */}
                <div className="fn-feat-header">
                  <span className="fn-dropdown-eyebrow">§ Everything in QAMind</span>
                </div>
                {/* 3-col grid — 12 features */}
                <div className="fn-feat-grid-3col">
                  {([
                    { icon: <Zap size={15} strokeWidth={1.75} />, name: "AI Test Generation", desc: "Paste a spec — local AI drafts structured test cases in minutes", href: "/features/generate" },
                    { icon: <Video size={15} strokeWidth={1.75} />, name: "QA Recorder", desc: "Record browser sessions → structured test cases", href: "/features/recorder" },
                    { icon: <FileText size={15} strokeWidth={1.75} />, name: "Script Generator", desc: "Generate Playwright .spec.ts files from approved test cases", href: "/features/scripts" },
                    { icon: <Layers size={15} strokeWidth={1.75} />, name: "Test Suites", desc: "Organise cases by feature or sprint. Draft → Ready → Approved.", href: "/features/suites" },
                    { icon: <History size={15} strokeWidth={1.75} />, name: "Run History", desc: "Every run — per-case pass/fail/skip, full error output, flaky flag", href: "/features/runs" },
                    { icon: <Bug size={15} strokeWidth={1.75} />, name: "Bug Tracker", desc: "One click files a tracked bug from any failed run", href: "/features/bugs" },
                    { icon: <BarChart3 size={15} strokeWidth={1.75} />, name: "Analytics", desc: "Pass rate, flaky %, coverage trends — six cards, real numbers", href: "/features/analytics" },
                    { icon: <GitBranch size={15} strokeWidth={1.75} />, name: "Traceability", desc: "Requirements ↔ tests ↔ runs — coverage gaps surface first", href: "/features/traceability" },
                    { icon: <ClipboardList size={15} strokeWidth={1.75} />, name: "Sprint Planner", desc: "Auto-scaffold 14-day sprints. Assign testers, track coverage.", href: "/features/planner" },
                    { icon: <TrendingDown size={15} strokeWidth={1.75} />, name: "Regression Analysis", desc: "Spot tests that passed last run and failed this one", href: "/features/regression" },
                    { icon: <Download size={15} strokeWidth={1.75} />, name: "Reports & Exports", desc: ".xlsx · Jira · Qase · Xray · Zephyr — generated on demand", href: "/features/reports" },
                    { icon: <MessageSquare size={15} strokeWidth={1.75} />, name: "GPT Console", desc: "Private AI chat at gpt.qamind.ai — local model, PDF upload", href: "/features/gpt" },
                  ] as const).map(({ icon, name, desc, href }, i) => (
                    <Link
                      key={name}
                      to={href as any}
                      className={`fn-feat-card fn-feat-card-${i}`}
                      onClick={() => setProductOpen(false)}
                      role="menuitem"
                    >
                      <div className="fn-feat-icon">{icon}</div>
                      <div className="fn-feat-info">
                        <span className="fn-feat-name">{name}</span>
                        <span className="fn-feat-desc">{desc}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* Footer strip */}
                <div className="fn-feat-footer">
                  <Link to="/features" className="fn-feat-footer-link" onClick={() => setProductOpen(false)}>
                    View all features <ArrowRight size={12} strokeWidth={2} className="inline ml-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Solutions dropdown */}
            <div className="relative" ref={solutionsDropdownRef} onMouseEnter={openSolutionsDropdown} onMouseLeave={closeSolutionsDropdown}>
              <button
                className="fn-nav-solutions-btn landing-nav-link flex items-center gap-1 text-[14px] font-semibold text-[var(--c-text)] transition-colors py-1"
                onClick={() => setSolutionsOpen((o) => !o)}
                aria-expanded={solutionsOpen}
                aria-haspopup="true"
              >
                Solutions
                <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ transform: solutionsOpen ? "rotate(180deg)" : undefined }} />
              </button>
              <div
                className={`fn-dropdown fn-sol-dropdown${solutionsOpen ? " is-open" : ""}`}
                role="menu"
                onMouseEnter={openSolutionsDropdown}
                onMouseLeave={closeSolutionsDropdown}
              >
                <div className="fn-sol-header">
                  <span className="fn-dropdown-eyebrow">§ Who it's for</span>
                </div>
                <div className="fn-sol-list">
                  {([
                    {
                      role: "QA ENGINEER",
                      title: "For QA Engineers",
                      desc: "Write fewer cases by hand. Catch flaky tests before they waste your day.",
                      href: "/for-qa",
                    },
                    {
                      role: "DEVELOPER",
                      title: "For Dev Teams",
                      desc: "Merge with confidence. Know what's covered before the PR lands.",
                      href: "/for-devs",
                    },
                    {
                      role: "MANAGER",
                      title: "For Engineering Managers",
                      desc: "Pass rate, coverage, open bugs — one dashboard, no spreadsheet.",
                      href: "/for-managers",
                    },
                  ] as const).map(({ role, title, desc, href }, i) => (
                    <Link
                      key={role}
                      to={href as any}
                      className={`fn-sol-card fn-sol-card-${i}`}
                      onClick={() => setSolutionsOpen(false)}
                      role="menuitem"
                    >
                      <div className="fn-sol-card-inner">
                        <span className="fn-sol-role">{role}</span>
                        <span className="fn-sol-title">{title}</span>
                        <span className="fn-sol-desc">{desc}</span>
                      </div>
                      <span className="fn-sol-arrow" aria-hidden="true">→</span>
                    </Link>
                  ))}
                </div>
                <div className="fn-sol-footer">
                  <Link to="/pricing" className="fn-feat-footer-link" onClick={() => setSolutionsOpen(false)}>
                    See pricing <ArrowRight size={12} strokeWidth={2} className="inline ml-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Recorder dropdown */}
            <div className="relative" ref={recorderDropdownRef} onMouseEnter={openRecorderDropdown} onMouseLeave={closeRecorderDropdown}>
              <button
                className="fn-nav-recorder-btn fn-nav-recorder-link flex items-center gap-1 text-[14px] font-semibold text-[var(--c-text)] transition-colors py-1"
                onClick={() => setRecorderOpen((o) => !o)}
                aria-expanded={recorderOpen}
                aria-haspopup="true"
              >
                Recorder
                <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ transform: recorderOpen ? "rotate(180deg)" : undefined }} />
              </button>
              <div
                className={`fn-dropdown rec-dropdown${recorderOpen ? " is-open" : ""}`}
                role="menu"
                onMouseEnter={openRecorderDropdown}
                onMouseLeave={closeRecorderDropdown}
              >
                <div className="rec-dd-cols">
                  <div className="rec-dd-links">
                    <span className="fn-dropdown-eyebrow">§ Recorder</span>
                    <button className="rec-dd-item rec-dd-download" onClick={() => { setRecorderOpen(false); setDownloadOpen(true); }} role="menuitem">
                      <div className="rec-dd-icon rec-dd-icon-accent"><Download size={14} strokeWidth={1.75} /></div>
                      <div className="rec-dd-info">
                        <span className="rec-dd-name">Download extension</span>
                        <span className="rec-dd-desc">Free · Chrome · installs in 10 seconds</span>
                      </div>
                    </button>
                    <Link to="/recorder" className="rec-dd-item" onClick={() => setRecorderOpen(false)} role="menuitem">
                      <div className="rec-dd-icon"><FileText size={14} strokeWidth={1.75} /></div>
                      <div className="rec-dd-info">
                        <span className="rec-dd-name">What is Recorder?</span>
                        <span className="rec-dd-desc">Chrome extension → Playwright tests</span>
                      </div>
                    </Link>
                    <a href="/recorder#step-02" className="rec-dd-item" onClick={() => setRecorderOpen(false)} role="menuitem">
                      <div className="rec-dd-icon"><Play size={14} strokeWidth={1.75} /></div>
                      <div className="rec-dd-info">
                        <span className="rec-dd-name">See it in action</span>
                        <span className="rec-dd-desc">Step-by-step walkthrough</span>
                      </div>
                    </a>
                    <a href="/recorder#setup" className="rec-dd-item" onClick={() => setRecorderOpen(false)} role="menuitem">
                      <div className="rec-dd-icon"><BookOpen size={14} strokeWidth={1.75} /></div>
                      <div className="rec-dd-info">
                        <span className="rec-dd-name">Setup guide</span>
                        <span className="rec-dd-desc">Install → record → import</span>
                      </div>
                    </a>
                  </div>
                  <div className="fn-dd-divider" aria-hidden="true" />
                  <div className="rec-dd-preview" aria-hidden="true">
                    <div className="rec-ext-popup-mini">
                      <div className="rec-ext-mini-bar">
                        <span className="rec-ext-mini-name">QA Recorder</span>
                        <span className="rec-recording-dot" />
                      </div>
                      <div className="rec-ext-mini-timer">00:14</div>
                      <div className="rec-ext-mini-events">
                        {(["click #login-btn", 'type "user@…"', "navigate /db", "assert .msg"] as const).map((ev, i) => (
                          <div key={i} className={`rec-ext-mini-ev rec-mini-ev-${i}`}>
                            <span className="rec-mini-check">✓</span>{ev}
                          </div>
                        ))}
                        <div className="rec-mini-importing">↓ importing…</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources dropdown */}
            <div className="relative" ref={resourcesDropdownRef} onMouseEnter={openResourcesDropdown} onMouseLeave={closeResourcesDropdown}>
              <button
                className="landing-nav-link flex items-center gap-1 text-[14px] font-semibold text-[var(--c-text)] transition-colors py-1"
                onClick={() => setResourcesOpen((o) => !o)}
                aria-expanded={resourcesOpen}
                aria-haspopup="true"
              >
                Resources
                <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ transform: resourcesOpen ? "rotate(180deg)" : undefined }} />
              </button>
              <div
                className={`fn-dropdown fn-res-dropdown${resourcesOpen ? " is-open" : ""}`}
                role="menu"
                onMouseEnter={openResourcesDropdown}
                onMouseLeave={closeResourcesDropdown}
              >
                <div className="fn-res-header">
                  <span className="fn-dropdown-eyebrow">§ Resources</span>
                </div>
                <div className="fn-res-list">
                  <Link to="/changelog" className="fn-res-item fn-res-item-0" onClick={() => setResourcesOpen(false)} role="menuitem">
                    <div className="fn-res-icon"><Clock size={14} strokeWidth={1.75} /></div>
                    <div className="fn-res-info">
                      <span className="fn-res-name">Changelog</span>
                      <span className="fn-res-desc">What shipped. No roadmap theatre.</span>
                    </div>
                  </Link>
                  <Link to="/how-it-works" className="fn-res-item fn-res-item-1" onClick={() => setResourcesOpen(false)} role="menuitem">
                    <div className="fn-res-icon"><BookOpen size={14} strokeWidth={1.75} /></div>
                    <div className="fn-res-info">
                      <span className="fn-res-name">How it works</span>
                      <span className="fn-res-desc">From spec to tested feature, step by step.</span>
                    </div>
                  </Link>
                  <a
                    href="#faq"
                    className="fn-res-item fn-res-item-2"
                    onClick={(e) => { scrollToSection(e, "faq"); setResourcesOpen(false); }}
                    role="menuitem"
                  >
                    <div className="fn-res-icon"><HelpCircle size={14} strokeWidth={1.75} /></div>
                    <div className="fn-res-info">
                      <span className="fn-res-name">Help &amp; FAQ</span>
                      <span className="fn-res-desc">Guides, common questions, and setup.</span>
                    </div>
                  </a>
                  <div className="fn-res-item fn-res-item-3 fn-res-status" role="menuitem">
                    <div className="fn-res-icon fn-res-icon-green"><span className="fn-res-status-dot" aria-hidden="true" /></div>
                    <div className="fn-res-info">
                      <span className="fn-res-name">Status</span>
                      <span className="fn-res-desc fn-res-status-ok">All systems operational</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <Link
              to="/pricing"
              className="landing-nav-link text-[14px] font-semibold text-[var(--c-text)] transition-colors py-1"
            >
              Pricing
            </Link>

            {/* About */}
            <a
              href="#colophon"
              onClick={(e) => scrollToSection(e, "colophon")}
              className="fn-nav-about-link landing-nav-link text-[14px] font-semibold text-[var(--c-text)] transition-colors py-1"
            >
              About
            </a>

            <div
              className="fn-nav-dot absolute bottom-0 h-[6px] w-[6px] rounded-full bg-[var(--c-accent)] transition-all duration-300"
              aria-hidden="true"
              style={{
                transform: `translateX(${dotStyle.left}px)`,
                opacity: dotStyle.opacity,
                width: `${dotStyle.width}px`,
              }}
            />
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/auth"
                  search={{ mode: "signin" }}
                  onClick={async () => {
                    await signOut();
                  }}
                  className="fn-nav-action"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  onClick={async () => {
                    await signOut();
                  }}
                  className="fn-nav-action is-primary relative overflow-hidden group"
                >
                  <span className="relative z-10">Open an account</span>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--c-accent)_0%,transparent_0%)] opacity-0 group-hover:opacity-100 group-hover:bg-[radial-gradient(circle_at_center,var(--c-accent)_100%,transparent_100%)] transition-all duration-500 transform scale-0 group-hover:scale-[2]" />
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth" search={{ mode: "signin" }} className="fn-nav-action">
                  Sign in
                </Link>
                <a
                  href="/auth?mode=signup"
                  className="fn-nav-action is-primary relative overflow-hidden group"
                >
                  <span className="relative z-10">Open an account</span>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--c-accent)_0%,transparent_0%)] opacity-0 group-hover:opacity-100 group-hover:bg-[radial-gradient(circle_at_center,var(--c-accent)_100%,transparent_100%)] transition-all duration-500 transform scale-0 group-hover:scale-[2]" />
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Floating Pill Nav ────────────────────────────── */}
      <div
        className={`landing-pill-nav${pillVisible ? " is-visible" : ""}`}
        data-pill-theme={pillTheme}
        aria-hidden={!pillVisible}
      >
        <Link to="/" aria-label="QAMind AI home" className="landing-pill-logo">
          <img
            src={pillTheme === "light" ? "/brand/appicon-light.png" : "/brand/appicon-dark.png"}
            alt="QAMind AI"
            className="h-[30px] w-[30px] rounded-[7px]"
          />
        </Link>
        <span className="landing-pill-sep" aria-hidden="true" />
        <nav className="hidden items-center md:flex landing-pill-links" aria-label="Page sections">
          <div
            className="pill-active-indicator"
            aria-hidden="true"
            style={{
              transform: `translateX(${pillIndicator.left}px)`,
              width: `${pillIndicator.width}px`,
              opacity: pillIndicator.opacity,
            }}
          />
          {Object.entries(PILL_NAV).map(([key, label]) => (
            <a
              key={key}
              href={`#${key}`}
              onClick={(e) => scrollToSection(e, key)}
              className={`landing-pill-link${activeNav === key ? " is-active" : ""}`}
            >
              {label}
            </a>
          ))}
        </nav>
        <span className="landing-pill-sep hidden md:block" aria-hidden="true" />
        <Link
          to="/auth"
          search={{ mode: "signup" }}
          className="fn-nav-action is-primary landing-pill-cta"
        >
          Get started
        </Link>
      </div>

      <main>
        {/* ─── HERO ─────────────────────────────────────── */}
        <section
          data-section-theme="dark"
          className="dim-target field-hero relative overflow-hidden"
          onMouseMove={reduced ? undefined : handleHeroMouseMove}
          onMouseLeave={reduced ? undefined : handleHeroMouseLeave}
        >
          {/* Particles Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.8] transition-opacity duration-300">
            <Particles
              className="absolute inset-0"
              quantity={300}
              ease={40}
              staticity={20}
              color="#C2552E"
              refresh
            />
          </div>
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-28 pt-20 text-center md:pb-40 md:pt-32 relative z-10">
            <p className="mb-8 font-mono text-xs uppercase tracking-[0.22em] text-[var(--c-text-muted)]">
              {PAGE_TEXT.heroEyebrow}
            </p>

            <HeroHeadline reduced={reduced} />

            <h2 className="hero-subtext mt-8 max-w-[660px] text-[17px] font-normal leading-[1.75] text-[var(--c-text-muted)]">
              {PAGE_TEXT.heroSubtext}
            </h2>
            <p className="stillness-reward-caption">Empty is a state, not a failure.</p>

            <div className="mt-10 flex flex-row items-center gap-4">
              {isAuthenticated ? (
                <Link
                  to={onboardingComplete ? "/dashboard" : "/onboarding"}
                  data-magnetic
                  className="hero-cta fn-button fn-hover-target bg-[var(--c-accent)] text-white"
                >
                  Get started →
                </Link>
              ) : (
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  data-magnetic
                  className="hero-cta fn-button fn-hover-target bg-[var(--c-accent)] text-white"
                >
                  Get started →
                </Link>
              )}
            </div>

            <p className="mt-12 font-mono text-xs uppercase tracking-[0.15em] text-[var(--c-text-muted)]">
              {PAGE_TEXT.heroStats.join(" · ")}
            </p>
            <div id="hero-sentinel" aria-hidden="true" style={{ height: 0 }} />
          </div>
        </section>

        {/* ─── PROBLEMS ─────────────────────────────────── */}
        <HowItWorks reduced={reduced} />

        {/* ─── INTEGRATIONS ─────────────────────────────── */}
        <IntegrationsLoop reduced={reduced} forceDark={true} />

        {/* ENHANCED: Practice Gestures | Edit text in content.ts */}
        <EditorialSection id="practice" note="&rarr; see also: drafting notes" sectionTheme="light">
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
            <div className="dim-target">
              {/* ENHANCED: Section Labels morphing | Edit text in content.ts */}
              <SectionMarker label="Practice" />
              <h2 className="section-heading max-w-[760px] font-display text-4xl leading-[1.04] md:text-6xl">
                Three things we do, deliberately.
              </h2>
            </div>

            <PracticeGestures reduced={reduced} />
          </div>
        </EditorialSection>
        {/* END EDITABLE */}

        {/* ─── RECORDER ─────────────────────────────────── */}
        <section id="recorder" data-section-theme="dark" className="relative">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">

              {/* Copy */}
              <div className="flex flex-col">
                <p className="hiw-eyebrow mb-5">
                  <span className="text-[var(--c-accent)]">&sect;</span> CHROME EXTENSION
                </p>
                <h2 className="font-display text-4xl leading-[1.04] tracking-[-0.02em] md:text-5xl mb-5">
                  Record once.<br />Tests follow.
                </h2>
                <p className="text-[15px] text-[var(--c-text-muted)] leading-relaxed mb-6 max-w-[420px]">
                  {PAGE_TEXT.recorder.body}
                </p>

                {/* Status pipeline */}
                <div className="flex items-center gap-0 mb-8">
                  {PAGE_TEXT.recorder.statusSteps.map((step, i) => (
                    <span key={i} className="flex items-center gap-0">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] tracking-[0.06em]
                          ${i === 1
                            ? "border-transparent bg-[var(--c-accent-soft)] text-[var(--c-accent)] font-semibold"
                            : "border-[var(--c-border)] bg-[var(--c-bg-card)] text-[var(--c-text-dim)]"
                          }`}
                      >
                        {i === 1 && (
                          <span
                            className="inline-block h-[5px] w-[5px] rounded-full bg-[var(--c-accent)]"
                            style={{ animation: "recPulse 1.4s ease-in-out infinite" }}
                            aria-hidden="true"
                          />
                        )}
                        {step}
                      </span>
                      {i < PAGE_TEXT.recorder.statusSteps.length - 1 && (
                        <span className="mx-1 font-mono text-[10px] text-[var(--c-text-dim)]">→</span>
                      )}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setDownloadOpen(true)}
                    className="fn-nav-action is-primary flex items-center gap-2"
                  >
                    <Download size={14} strokeWidth={2} />
                    Download extension
                  </button>
                  <Link to="/recorder" className="fn-nav-action">
                    What is Recorder? →
                  </Link>
                </div>
              </div>

              {/* Extension popup mock */}
              <div className="flex justify-center" aria-hidden="true">
                <div
                  className="w-[260px] overflow-hidden rounded-xl border shadow-2xl"
                  style={{
                    background: "#161210",
                    borderColor: "#2e2520",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* titlebar */}
                  <div
                    className="flex items-center gap-2 border-b px-3 py-2.5"
                    style={{ background: "#1e1914", borderColor: "#2e2520" }}
                  >
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                    <span className="flex-1 font-mono text-[10px] text-[#b5a898]">QA Recorder</span>
                    <span className="rec-recording-dot" />
                  </div>

                  {/* body */}
                  <div className="p-3">
                    {/* status bar */}
                    <div
                      className="mb-3 flex items-center gap-2 rounded-md px-2.5 py-1.5"
                      style={{ background: "rgba(239,68,68,0.1)" }}
                    >
                      <span className="rec-recording-dot" />
                      <span className="flex-1 font-mono text-[9px] tracking-[0.12em] text-[#ef4444]">RECORDING</span>
                      <span className="font-mono text-[10px] text-[#9e8e7e]">00:14</span>
                    </div>

                    {/* events */}
                    <div className="mb-3 flex flex-col gap-1.5">
                      {PAGE_TEXT.recorder.events.map((ev, i) => (
                        <div key={i} className={`rec-ext-ev rec-ev-${i} flex items-start gap-2`}>
                          <span className="mt-px font-mono text-[9px] text-[#6a9e5a]">✓</span>
                          <span className="font-mono text-[9.5px] leading-[1.4] text-[#b5a898] break-all">{ev}</span>
                        </div>
                      ))}
                      <div className="rec-ev-importing font-mono text-[9px] text-[var(--c-accent)]">↓ importing…</div>
                    </div>

                    {/* stop button */}
                    <button
                      className="w-full rounded-md py-2 font-mono text-[10px] font-semibold tracking-[0.03em] text-white"
                      style={{ background: "var(--c-accent)" }}
                      tabIndex={-1}
                    >
                      Stop &amp; Import →
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────── */}
        <FAQSection reduced={reduced} />

        <EditorialSection id="colophon" note="cf. print tradition, 1455" sectionTheme="dark">
          <div className="dim-target mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-12 md:py-32">
            <div className="md:col-span-4">
              <SectionMarker label={PAGE_TEXT.nav.colophon} />
              <h2 className="section-heading font-display text-4xl leading-[1.04] md:text-5xl">
                About QAMind AI.
              </h2>
            </div>

            <div className="space-y-5 text-base leading-relaxed text-[var(--c-text-muted)] md:col-span-7 md:col-start-6">
              <p>
                QAMind AI generates, runs, and reasons about your tests — surfacing flaky cases and
                real bugs before your users do. Built by QA engineers who wanted a workspace that
                stays precise, not loud.
              </p>
              <p>
                {PAGE_TEXT.stillnessQuotes[1]} Charts only when they help. Numbers only when they
                exist. Empty states that say so{" "}
                <span className="fall-word" data-fall-word>
                  plainly
                </span>
                .
              </p>
              <p className="font-display italic">
                Set in Bricolage Grotesque, Hanken Grotesk &amp; IBM Plex Mono.
              </p>
            </div>
          </div>
        </EditorialSection>

        {/* ─── SPOTLIGHT: AI GENERATION ─────────────────── */}
        <section className="spotlight-section" data-section-theme="dark">
          <div className="spotlight-block">
            <div className="spotlight-copy">
              <p className="spotlight-eyebrow">§ AI TEST GENERATION</p>
              <h2 className="spotlight-headline">Paste a spec. Get test cases in minutes.</h2>
              <p className="spotlight-body">
                QAMind reads your requirement document and drafts structured test cases as editable rows — title, steps, expected result, priority. The AI runs on your own workstation via Ollama. Your specs are never sent to any external API.
              </p>
              <ul className="spotlight-bullets">
                <li className="spotlight-bullet"><span className="spotlight-bullet-dot" />3–8 min generation on local GPU</li>
                <li className="spotlight-bullet"><span className="spotlight-bullet-dot" />Qwen 3 Coder 30B — same model as GPT console</li>
                <li className="spotlight-bullet"><span className="spotlight-bullet-dot" />Draft → Ready → Approved approval workflow</li>
              </ul>
              <Link to="/features/generate" className="spotlight-link">
                See how generation works →
              </Link>
            </div>
            <div className="spotlight-visual">
              <div className="feat-mock-window">
                <div className="feat-mock-chrome">
                  <div className="feat-mock-dots">
                    <span className="feat-mock-dot feat-mock-dot-r" />
                    <span className="feat-mock-dot feat-mock-dot-y" />
                    <span className="feat-mock-dot feat-mock-dot-g" />
                  </div>
                  <span className="feat-mock-path">generate</span>
                  <span className="feat-mock-badge-tag">LOCAL AI</span>
                </div>
                <div className="feat-mock-body">
                  <p className="feat-mock-label-sm mb-2">Generated — 4 cases from password reset spec</p>
                  {[
                    { id: "TC-041", title: "Valid reset — password updated", status: "Approved" },
                    { id: "TC-042", title: "Link expires at 30 min boundary", status: "Ready" },
                    { id: "TC-043", title: "Invalid token shows error", status: "Draft" },
                    { id: "TC-044", title: "Unknown email — generic response", status: "Draft" },
                  ].map((tc) => (
                    <div key={tc.id} className="feat-mock-case-row">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62", minWidth: 44 }}>{tc.id}</span>
                      <span style={{ flex: 1, color: "#c8bfb2", fontSize: 10 }}>{tc.title}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, padding: "0.1rem 0.35rem", borderRadius: 4, border: "1px solid", borderColor: tc.status === "Approved" ? "rgba(74,163,84,0.3)" : "#2e2520", color: tc.status === "Approved" ? "#6ec47a" : tc.status === "Ready" ? "#d9b06a" : "#7d6e62" }}>{tc.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SPOTLIGHT: TRACEABILITY ───────────────────── */}
        <section className="spotlight-section" data-section-theme="light">
          <div className="spotlight-block is-reversed">
            <div className="spotlight-copy">
              <p className="spotlight-eyebrow">§ TRACEABILITY MATRIX</p>
              <h2 className="spotlight-headline">Requirement to result. One view.</h2>
              <p className="spotlight-body">
                Tag test cases with requirement IDs and the traceability matrix assembles itself. Coverage gaps — requirements with no test cases — surface before a run, not after. The full chain from requirement to bug is navigable in one workspace.
              </p>
              <ul className="spotlight-bullets">
                <li className="spotlight-bullet"><span className="spotlight-bullet-dot" />Auto-assembled from requirement ID tags</li>
                <li className="spotlight-bullet"><span className="spotlight-bullet-dot" />Coverage gaps visible before execution</li>
                <li className="spotlight-bullet"><span className="spotlight-bullet-dot" />Requirement → test case → run → bug — one click deep</li>
              </ul>
              <Link to="/features/traceability" className="spotlight-link">
                Traceability details →
              </Link>
            </div>
            <div className="spotlight-visual">
              <div className="feat-mock-window">
                <div className="feat-mock-chrome">
                  <div className="feat-mock-dots">
                    <span className="feat-mock-dot feat-mock-dot-r" />
                    <span className="feat-mock-dot feat-mock-dot-y" />
                    <span className="feat-mock-dot feat-mock-dot-g" />
                  </div>
                  <span className="feat-mock-path">traceability</span>
                  <span className="feat-mock-badge-tag">MATRIX</span>
                </div>
                <div className="feat-mock-body">
                  <p className="feat-mock-label-sm mb-2">Auth module — requirement coverage</p>
                  {[
                    { req: "REQ-001", label: "User auth", cases: 5, status: "Covered" },
                    { req: "REQ-002", label: "Password reset", cases: 4, status: "Partial" },
                    { req: "REQ-003", label: "Session management", cases: 3, status: "Covered" },
                    { req: "REQ-004", label: "Profile update", cases: 0, status: "Gap" },
                  ].map((row) => (
                    <div key={row.req} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.35rem 0", borderBottom: "1px solid #1e1914" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62", minWidth: 48 }}>{row.req}</span>
                      <span style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 10, color: "#c8bfb2" }}>{row.label}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7d6e62" }}>{row.cases} cases</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, padding: "0.1rem 0.35rem", borderRadius: 4, border: "1px solid", borderColor: row.status === "Covered" ? "rgba(74,163,84,0.3)" : row.status === "Gap" ? "rgba(229,115,115,0.3)" : "rgba(217,176,106,0.3)", color: row.status === "Covered" ? "#6ec47a" : row.status === "Gap" ? "#e57373" : "#d9b06a" }}>{row.status}</span>
                    </div>
                  ))}
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#e57373", marginTop: 8 }}>⚠ REQ-004 — no test cases</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SPOTLIGHT: GPT CONSOLE ────────────────────── */}
        <section className="spotlight-section" data-section-theme="dark">
          <div className="spotlight-block">
            <div className="spotlight-copy">
              <p className="spotlight-eyebrow">§ GPT CONSOLE</p>
              <h2 className="spotlight-headline">Private AI chat for your QA work.</h2>
              <p className="spotlight-body">
                The GPT console at gpt.qamind.ai runs the same local Qwen model as test generation. Upload a requirement document as a PDF, ask about edge cases, draft Playwright assertions — without sending your data to any external AI service.
              </p>
              <ul className="spotlight-bullets">
                <li className="spotlight-bullet"><span className="spotlight-bullet-dot" />PDF and DOCX upload for document context</li>
                <li className="spotlight-bullet"><span className="spotlight-bullet-dot" />Conversations organised by project, persisted</li>
                <li className="spotlight-bullet"><span className="spotlight-bullet-dot" />Same auth as your QAMind workspace</li>
              </ul>
              <Link to="/features/gpt" className="spotlight-link">
                GPT console details →
              </Link>
            </div>
            <div className="spotlight-visual">
              <div className="feat-mock-window">
                <div className="feat-mock-chrome">
                  <div className="feat-mock-dots">
                    <span className="feat-mock-dot feat-mock-dot-r" />
                    <span className="feat-mock-dot feat-mock-dot-y" />
                    <span className="feat-mock-dot feat-mock-dot-g" />
                  </div>
                  <span className="feat-mock-path">gpt.qamind.ai / auth-project</span>
                  <span className="feat-mock-badge-tag">LOCAL AI</span>
                </div>
                <div className="feat-mock-body" style={{ padding: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, padding: "0.35rem 0.6rem", background: "#1e1914", borderRadius: 6, border: "1px solid #2e2520" }}>
                    <FileText size={10} style={{ color: "#7d6e62" }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9b8b7a" }}>auth-requirements.pdf</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#6ec47a", marginLeft: "auto" }}>Loaded</span>
                  </div>
                  {[
                    { role: "user", text: "What edge cases should I test for the password reset flow?" },
                    { role: "ai", text: "Based on the PRD: 1) Link expiry at 30min boundary 2) Token reuse after reset 3) Email enumeration via error messages 4) Invalid token format handling" },
                  ].map((msg, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: msg.role === "user" ? "var(--c-accent-soft)" : "#2e2520", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 7, fontWeight: 700, color: msg.role === "user" ? "var(--c-accent)" : "#b5a898", marginTop: 2 }}>
                        {msg.role === "user" ? "U" : "AI"}
                      </div>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, lineHeight: 1.55, color: msg.role === "user" ? "#c8bfb2" : "#9e8e7e", flex: 1 }}>{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── NUMBERS STRIP ─────────────────────────────── */}
        <section data-section-theme="dark" style={{ borderTop: "1px solid var(--c-border)" }}>
          <div className="mx-auto max-w-7xl">
            <div className="numbers-strip">
              {[
                { value: "247", label: "Test cases\nin one workspace" },
                { value: "93.5%", label: "Average\npass rate" },
                { value: "14", label: "Day sprint\nauto-scaffolded" },
                { value: "4", label: "Export formats\nfor third-party tools" },
                { value: "0", label: "Cloud AI APIs\nreceiving your data" },
              ].map((stat) => (
                <div key={stat.label} className="numbers-strip-cell">
                  <div className="numbers-strip-value">
                    <span className="numbers-strip-accent">{stat.value}</span>
                  </div>
                  <div className="numbers-strip-label" style={{ whiteSpace: "pre-line" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PRICING PREVIEW ───────────────────────────── */}
        <section data-section-theme="light" style={{ borderTop: "1px solid var(--c-border)" }}>
          <div className="mx-auto max-w-5xl px-6 py-20">
            <p className="feat-eyebrow mb-3" style={{ marginBottom: "1rem" }}>
              <span style={{ color: "var(--c-accent)" }}>&sect;</span> PRICING
            </p>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold tracking-[-0.02em] text-[var(--c-text)] mb-3 max-w-[440px]">
              Per workspace. Not per seat.
            </h2>
            <p className="text-[15px] text-[var(--c-text-muted)] leading-relaxed mb-10 max-w-[400px]">
              One subscription per workspace. Invite your whole team without a per-user fee. Two plans based on AI usage volume.
            </p>
            <div className="pricing-preview-grid">
              <div className="pricing-preview-card">
                <p className="pricing-preview-plan">Plan</p>
                <p className="pricing-preview-name">Standard</p>
                <ul className="pricing-preview-bullets">
                  <li className="pricing-preview-bullet">100 AI tokens per day — refills at midnight</li>
                  <li className="pricing-preview-bullet">All features: generate, suites, runs, bugs, analytics</li>
                  <li className="pricing-preview-bullet">Playwright script generation via MCP server</li>
                  <li className="pricing-preview-bullet">GPT console access at gpt.qamind.ai</li>
                  <li className="pricing-preview-bullet">Per workspace — unlimited team members</li>
                </ul>
                <Link to="/pricing" className="fn-nav-action" style={{ marginTop: "auto", display: "inline-flex" }}>View pricing →</Link>
              </div>
              <div className="pricing-preview-card is-featured">
                <p className="pricing-preview-plan">Plan</p>
                <p className="pricing-preview-name">Premium</p>
                <ul className="pricing-preview-bullets">
                  <li className="pricing-preview-bullet">Unlimited AI tokens — no daily cap</li>
                  <li className="pricing-preview-bullet">Everything in Standard</li>
                  <li className="pricing-preview-bullet">Priority generation queue</li>
                  <li className="pricing-preview-bullet">Advanced analytics and regression reports</li>
                  <li className="pricing-preview-bullet">Per workspace — unlimited team members</li>
                </ul>
                <Link to="/auth" search={{ mode: "signup" }} className="fn-nav-action is-primary" style={{ marginTop: "auto", display: "inline-flex" }}>Get started →</Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer id="contact" data-section-theme="dark" className="ftr-root">

        {/* Newsletter strip */}
        <div className="ftr-newsletter">
          <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="ftr-nl-heading">Stay sharp.</p>
              <p className="ftr-nl-sub">QAMind updates, once a month. No noise.</p>
            </div>
            <form className="ftr-nl-form" onSubmit={(e) => e.preventDefault()}>
              <div className="ftr-nl-input-wrap">
                <Mail size={14} strokeWidth={1.75} className="ftr-nl-icon" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="ftr-nl-input"
                  aria-label="Email address"
                />
              </div>
              <button type="submit" className="ftr-nl-btn">
                <Send size={13} strokeWidth={2} />
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* 4-col link grid */}
        <div className="mx-auto max-w-7xl px-6 py-14 grid grid-cols-2 gap-10 md:grid-cols-4">

          {/* Platform */}
          <div>
            <p className="ftr-col-heading">Platform</p>
            <ul className="ftr-col-list">
              {([
                ["Generate Tests",  "/app/generate"],
                ["Test Suites",     "/app/suites"],
                ["Run History",     "/app/runs"],
                ["Bug Tracker",     "/app/bugs"],
                ["Analytics",       "/app/analytics"],
                ["Traceability",    "/app/traceability"],
                ["Planner",         "/app/planner"],
                ["QA Recorder",     "/recorder"],
              ] as const).map(([label, href]) => (
                <li key={label}>
                  <Link to={href as any} className="ftr-col-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <p className="ftr-col-heading">Solutions</p>
            <ul className="ftr-col-list">
              {([
                ["For QA Engineers",        "/for-qa"],
                ["For Dev Teams",           "/for-devs"],
                ["For Engineering Managers","/for-managers"],
              ] as const).map(([label, href]) => (
                <li key={label}>
                  <Link to={href as any} className="ftr-col-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="ftr-col-heading">Resources</p>
            <ul className="ftr-col-list">
              <li><Link to="/how-it-works" className="ftr-col-link">How it works</Link></li>
              <li><Link to="/changelog" className="ftr-col-link">Changelog</Link></li>
              <li><a href="#faq" onClick={(e) => scrollToSection(e, "faq")} className="ftr-col-link">Help &amp; FAQ</a></li>
              <li><Link to="/pricing" className="ftr-col-link">Pricing</Link></li>
              <li><Link to="/local-ai" className="ftr-col-link">Local AI</Link></li>
              <li><Link to="/security" className="ftr-col-link">Security</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="ftr-col-heading">Company</p>
            <ul className="ftr-col-list">
              <li><a href="#colophon" onClick={(e) => scrollToSection(e, "colophon")} className="ftr-col-link">About</a></li>
              <li><a href={`mailto:${CONTACT_EMAIL}`} className="ftr-col-link">{CONTACT_EMAIL}</a></li>
              <li><Link to="/privacy" className="ftr-col-link">Privacy Policy</Link></li>
              <li><Link to="/terms" className="ftr-col-link">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="ftr-bottom">
          <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between gap-4 relative overflow-hidden">

            {/* Watermark */}
            <span className="ftr-watermark" aria-hidden="true">QAMind</span>

            {/* Copyright */}
            <span className="ftr-copy relative z-10">
              &copy; {new Date().getFullYear()} QAMind AI. All rights reserved.
            </span>

            {/* Social icons */}
            <div className="flex items-center gap-3 relative z-10">
              <a href="https://github.com/qamind-ai" target="_blank" rel="noopener noreferrer" className="ftr-social" aria-label="GitHub">
                <Github size={16} strokeWidth={1.75} />
              </a>
              <a href="https://youtube.com/@qamind" target="_blank" rel="noopener noreferrer" className="ftr-social" aria-label="YouTube">
                <Youtube size={16} strokeWidth={1.75} />
              </a>
              <a href="https://linkedin.com/company/qamind-ai" target="_blank" rel="noopener noreferrer" className="ftr-social" aria-label="LinkedIn">
                <Linkedin size={16} strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </div>

      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HeroHeadline — "The Living Typewriter"
   ─────────────────────────────────────────────────────────
   Reads from PAGE_TEXT.heroHeadline so text is editable in
   one place. Splits into <span class="fn-hero-char"> for
   proximity parallax. Accent word gets ink-underline.
   Final period pulses like a living cursor.
   ═══════════════════════════════════════════════════════════ */
function HeroHeadline({ reduced }: { reduced: boolean }) {
  const text = PAGE_TEXT.heroHeadline;
  const accent = PAGE_TEXT.heroAccentWord;

  /*
   * Split strategy:
   * 1. Find the accent word boundary in the full string
   * 2. Split into segments: before-accent, accent, after-accent
   * 3. For each segment, split by \n to preserve hard breaks
   * 4. For each line, split by spaces to group words in `nowrap` spans
   * 5. The final "." gets a pulsing class
   */

  const accentIdx = text.indexOf(accent);
  const hasAccent = accentIdx !== -1;

  const before = hasAccent ? text.slice(0, accentIdx) : text;
  const after = hasAccent ? text.slice(accentIdx + accent.length) : "";

  /** Renders text handling \n, words, spaces, and the pulsing period */
  const renderText = (str: string, keyPrefix: string, isPeriodEnd: boolean) => {
    const lines = str.split("\n");
    return lines.map((line, lIdx) => {
      const isLastLine = lIdx === lines.length - 1;
      const tokens = line.split(/(\s+)/);
      let charIndex = 0;

      const lineContent = tokens.map((token, tIdx) => {
        if (!token) return null;
        // Space token
        if (/^\s+$/.test(token)) {
          return (
            <span
              key={`${keyPrefix}-l${lIdx}-s${tIdx}`}
              className="fn-hero-char fn-hero-space"
              style={{ display: "inline-block" }}
              aria-hidden="true"
            >
              {"\u00A0".repeat(token.length)}
            </span>
          );
        }
        // Word token
        const wTrimmed = token.toLowerCase().replace(/[^a-z]/g, "");
        const isFallWord = PAGE_TEXT.fallWords.includes(wTrimmed);

        return (
          <span
            key={`${keyPrefix}-l${lIdx}-w${tIdx}`}
            style={{ whiteSpace: "nowrap" }}
            className={isFallWord ? "fall-word" : ""}
            data-fall-word={isFallWord ? "true" : undefined}
          >
            {token.split("").map((ch, i) => {
              const isLastCharInToken = i === token.length - 1;
              const isLastToken =
                tIdx === tokens.length - 1 ||
                (tIdx === tokens.length - 2 && /^\s+$/.test(tokens[tokens.length - 1]));
              const isPulse =
                isPeriodEnd && isLastLine && isLastToken && isLastCharInToken && ch === ".";

              return (
                <span
                  key={`${keyPrefix}-c-${charIndex++}`}
                  className={`fn-hero-char${isPulse ? " fn-hero-pulse" : ""}`}
                  style={{
                    display: "inline-block",
                    willChange: reduced ? "auto" : "transform",
                    transition: reduced ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  aria-hidden="true"
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      });

      return (
        <span key={`${keyPrefix}-line-${lIdx}`}>
          {lineContent}
          {!isLastLine && <br />}
        </span>
      );
    });
  };

  /** Accent word chars inside the underline container */
  const accentChars = accent.split("").map((ch, i) => (
    <span
      key={`acc-${i}`}
      className="fn-hero-char"
      style={{
        display: "inline-block",
        willChange: reduced ? "auto" : "transform",
        transition: reduced ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      aria-hidden="true"
    >
      {ch}
    </span>
  ));

  return (
    <h1
      className="hero-headline font-display text-[54px] leading-[0.94] text-[var(--c-text)] sm:text-[72px] lg:text-[104px]"
      aria-label={text.replace(/\n/g, " ") + " - AI Automated Testing & QA"}
    >
      {/* Before accent */}
      {renderText(before, "pre", false)}

      {/* Accent word with ink-underline */}
      {hasAccent && (
        <span className="fn-hero-accent-wrap italic text-[var(--c-accent)]">
          {accentChars}
          <span className="fn-ink-underline" aria-hidden="true" />
        </span>
      )}

      {/* After accent */}
      {renderText(after, "post", true)}
    </h1>
  );
}

/* ═══════════════════════════════════════════════════════════
   Practice Gestures
   ─────────────────────────────────────────────────────────
   The Three Gestures interactive component.
   ═══════════════════════════════════════════════════════════ */
function PracticeGestures({ reduced }: { reduced: boolean }) {
  const [runState, setRunState] = useState<"idle" | "running" | "complete">("idle");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for Roman Numeral draw-in
  useEffect(() => {
    if (reduced || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    const cards = sectionRef.current.querySelectorAll(".practice-card");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [reduced]);

  const handleRunClick = () => {
    if (runState === "idle" || runState === "complete") {
      setRunState("running");
      if (reduced) {
        setRunState("complete");
      } else {
        setTimeout(() => setRunState("complete"), 1500);
      }
    }
  };

  const pt = PAGE_TEXT.practice;
  const visibleClass = isVisible || reduced ? "is-visible" : "";

  return (
    <div ref={sectionRef} className="mt-14 grid gap-8 md:grid-cols-3">
      {/* COLUMN i: Drafting */}
      <article
        className={`practice-card col-drafting border-t border-[var(--c-border)] pt-7 ${visibleClass}`}
        style={{ transitionDelay: reduced ? "0s" : "0s" }}
      >
        <p className="font-display text-4xl italic text-[var(--c-accent)]">
          <span className="fn-numeral-reveal">i.</span>
        </p>
        <h3 className="mt-4 font-display text-3xl">{pt.drafting.title}</h3>
        <p className="mt-4 text-sm leading-relaxed text-[var(--c-text-muted)]">
          {renderWithFallWords(pt.drafting.description)}
        </p>

        <div className="fn-drafting-wrap mt-4">
          <div className="fn-drafting-inner">
            <textarea
              className="fn-drafting-textarea"
              placeholder={pt.drafting.placeholder}
              aria-label="Draft cases"
            ></textarea>
          </div>
        </div>
      </article>

      {/* COLUMN ii: Running */}
      <article
        className={`practice-card col-running border-t border-[var(--c-border)] pt-7 is-${runState} ${visibleClass}`}
        onClick={handleRunClick}
        style={{ transitionDelay: reduced ? "0s" : "0.2s" }}
      >
        <div className="fn-run-progress" />
        <p className="font-display text-4xl italic text-[var(--c-accent)]">
          <span className="fn-numeral-reveal">ii.</span>
        </p>
        <h3 className="mt-4 font-display text-3xl flex justify-between items-center">
          {pt.running.title}
          <span className="text-sm font-mono text-[var(--c-accent)] uppercase tracking-wider">
            {runState === "idle"
              ? pt.running.idle
              : runState === "running"
                ? pt.running.running
                : pt.running.complete}
          </span>
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-[var(--c-text-muted)]">
          {renderWithFallWords(pt.running.description)}
        </p>

        {runState === "complete" && (
          <div className="mt-6 flex justify-end">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--c-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="fn-run-check"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        )}
      </article>

      {/* COLUMN iii: Reading */}
      <article
        className={`practice-card col-reading border-t border-[var(--c-border)] pt-7 ${visibleClass}`}
        style={{ transitionDelay: reduced ? "0s" : "0.4s" }}
      >
        <p className="font-display text-4xl italic text-[var(--c-accent)]">
          <span className="fn-numeral-reveal">iii.</span>
        </p>
        <h3 className="mt-4 font-display text-3xl">{pt.reading.title}</h3>
        <p className="mt-4 text-sm leading-relaxed text-[var(--c-text-muted)]">
          {renderWithFallWords(pt.reading.description)}
        </p>
      </article>
    </div>
  );
}

function EditorialSection({
  id,
  note,
  subtle,
  sectionTheme,
  children,
}: {
  id: string;
  note: string;
  subtle?: boolean;
  sectionTheme?: "dark" | "light";
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-section-theme={sectionTheme}
      className={`editorial-section relative ${!sectionTheme ? "border-b border-[var(--c-border)]" : ""} ${subtle ? "bg-[var(--c-bg-hover)]" : ""}`}
    >
      <span className="editorial-note" dangerouslySetInnerHTML={{ __html: note }} />
      {children}
    </section>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="label-eyebrow mb-3 text-[rgba(255,255,255,0.6)]">{title}</p>
      <ul className="space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              className="inline-block text-[rgba(255,255,255,0.6)] transition-colors hover:text-white"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
