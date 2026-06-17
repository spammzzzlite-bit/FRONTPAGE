import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Check user preferences and device capabilities
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerMq = window.matchMedia("(pointer: coarse), (hover: none)");

    const updateEnabledState = () => {
      setEnabled(!motionMq.matches && !pointerMq.matches);
    };

    updateEnabledState();

    const motionHandler = () => updateEnabledState();
    motionMq.addEventListener("change", motionHandler);

    return () => {
      motionMq.removeEventListener("change", motionHandler);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove("has-field-cursor");
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;
    let targetX = ringX;
    let targetY = ringY;
    let frame = 0;

    const move = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      dot.style.transform = `translate3d(${targetX - 3}px, ${targetY - 3}px, 0)`;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    const tick = () => {
      ringX += (targetX - ringX) * 0.22;
      ringY += (targetY - ringY) * 0.22;
      ring.style.transform = `translate3d(${ringX - 14}px, ${ringY - 14}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as Element;
      if (
        target.closest(
          "a, button, [role='button'], .fn-hover-target, input, textarea, select, label",
        )
      ) {
        ring.classList.add("is-expanded");
      }
    };

    const onPointerOut = (event: PointerEvent) => {
      const target = event.target as Element;
      if (
        target.closest(
          "a, button, [role='button'], .fn-hover-target, input, textarea, select, label",
        )
      ) {
        ring.classList.remove("is-expanded");
      }
    };

    document.documentElement.classList.add("has-field-cursor");
    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);
    frame = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("has-field-cursor");
      window.removeEventListener("mousemove", move);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="fn-cursor fn-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="fn-cursor fn-cursor-ring" aria-hidden="true" />
    </>
  );
}
