"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { fontShuffleClasses } from "@/lib/shuffleFonts";

const CYCLE_MS = 95;
const VIEW_STOP_MS = 3000;

export function FontShuffleText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (!inView) {
      setStopped(false);
      return;
    }
    if (reducedMotion || stopped) return;

    const intervalId = window.setInterval(() => {
      setIndex((i) => (i + 1) % fontShuffleClasses.length);
    }, CYCLE_MS);

    const stopId = window.setTimeout(() => setStopped(true), VIEW_STOP_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(stopId);
    };
  }, [inView, reducedMotion, stopped]);

  const fontClass = reducedMotion
    ? "font-body font-black uppercase tracking-[0.06em]"
    : fontShuffleClasses[index]!;

  return (
    <span
      ref={ref}
      className={`inline-block shrink-0 whitespace-nowrap align-baseline leading-[1.15] text-ink transition-none ${fontClass} ${className}`}
      aria-label={text}
    >
      {text}
    </span>
  );
}
