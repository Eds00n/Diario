"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { capitalizeFirst } from "@/lib/dates";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const DATE_HOLD_MS = 1000;
const DATE_FADE_MS = 700;

type Phase = "idle" | "date" | "content";

export function EntryDateIntro({
  dateLabel,
  children,
  delayMs = 0,
  className = "",
}: {
  dateLabel: string;
  children: ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>(() =>
    reducedMotion ? "content" : "idle",
  );
  const started = useRef(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (reducedMotion) {
      setPhase("content");
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started.current) return;
        started.current = true;

        timersRef.current.push(
          window.setTimeout(() => setPhase("date"), delayMs),
        );
        timersRef.current.push(
          window.setTimeout(
            () => setPhase("content"),
            delayMs + DATE_HOLD_MS + DATE_FADE_MS,
          ),
        );
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };
  }, [delayMs, reducedMotion]);

  const showDate = phase === "date";
  const showContent = phase === "content";

  const dateOpacity = showDate ? 1 : 0;
  const contentOpacity = showContent ? 1 : 0;

  return (
    <div ref={ref} className={className}>
      <div className="relative">
        <div
          aria-hidden={!showDate}
          className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-6 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{ opacity: dateOpacity }}
        >
          <p className="font-display whitespace-nowrap text-center text-[clamp(26px,6.5vw,54px)] font-medium uppercase leading-none tracking-[0.05em] text-ink md:text-[clamp(34px,3.8vw,58px)]">
            {capitalizeFirst(dateLabel)}
          </p>
        </div>

        <div
          className="transition-[opacity,transform] duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{
            opacity: contentOpacity,
            transform: showContent ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
