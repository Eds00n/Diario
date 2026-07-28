"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { formatEntryDayMonth } from "@/lib/dates";

const INTRO_HOLD_MS = 1050;

type Phase = "idle" | "intro" | "content";

export function EntryDateReveal({
  date,
  children,
  className = "",
  delayMs = 0,
}: {
  date: string;
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const reducedMotion = usePrefersReducedMotion();
  const { day, month } = formatEntryDayMonth(date);

  useEffect(() => {
    if (reducedMotion) {
      setPhase("content");
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setPhase((current) => (current === "idle" ? "intro" : current));
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (phase !== "intro") return;
    const hold = INTRO_HOLD_MS + delayMs;
    const id = window.setTimeout(() => setPhase("content"), hold);
    return () => window.clearTimeout(id);
  }, [phase, delayMs]);

  const showIntro = phase === "intro";
  const showContent = phase === "content";

  return (
    <div
      ref={ref}
      className={`relative ${showContent ? className : ""} ${
        showContent ? "" : "flex min-h-[min(52vh,520px)] items-center justify-center py-12 md:min-h-[min(48vh,560px)]"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center text-center transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          showIntro
            ? "scale-100 opacity-100"
            : "scale-[0.98] opacity-0"
        }`}
        aria-hidden={!showIntro}
      >
        <p className="font-display text-[clamp(72px,18vw,148px)] font-medium leading-none tracking-[0.02em] text-ink tabular-nums">
          {day}
        </p>
        <p className="font-display mt-2 text-[clamp(28px,7vw,56px)] font-medium leading-none tracking-[0.04em] text-gold">
          {month}
        </p>
      </div>

      <div
        className={`relative z-[1] w-full transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          showContent
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-10 opacity-0"
        }`}
        style={{
          transitionDelay: showContent && delayMs > 0 ? `${Math.min(delayMs, 200)}ms` : undefined,
        }}
        aria-hidden={!showContent}
      >
        {showContent ? children : null}
      </div>
    </div>
  );
}
