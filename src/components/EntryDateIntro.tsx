"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const DATE_HOLD_MS = 1000;
const DATE_FADE_MS = 700;

const ease = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Quão perto do meio da tela o centro do bloco precisa estar (px). */
function isBlockCentered(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.bottom <= 0 || rect.top >= window.innerHeight) return false;
  const blockCenter = rect.top + rect.height / 2;
  const viewCenter = window.innerHeight / 2;
  const tolerance = Math.min(96, window.innerHeight * 0.1);
  return Math.abs(blockCenter - viewCenter) <= tolerance;
}

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

    const beginIntro = () => {
      if (started.current) return;
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
    };

    const onScrollOrResize = () => {
      if (isBlockCentered(el)) beginIntro();
    };

    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };
  }, [delayMs, reducedMotion]);

  const showDate = phase === "date";
  const showContent = phase === "content";

  const dateTransform = showDate
    ? "translateY(0)"
    : phase === "idle"
      ? "translateY(56px)"
      : "translateY(-40px)";

  const contentTransform = showContent ? "translateY(0)" : "translateY(56px)";

  return (
    <div ref={ref} className={className}>
      <div className="relative">
        <div
          aria-hidden={!showDate}
          className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-6 motion-reduce:transition-none"
          style={{
            opacity: showDate ? 1 : 0,
            transform: dateTransform,
            transition: `opacity ${DATE_FADE_MS}ms ${ease}, transform ${DATE_FADE_MS}ms ${ease}`,
          }}
        >
          <p className="entry-intro-date font-display whitespace-nowrap text-center text-[clamp(26px,6.5vw,54px)] font-normal uppercase leading-none tracking-[0.08em] text-ink md:text-[clamp(34px,3.8vw,58px)] md:tracking-[0.1em]">
            {dateLabel.toLocaleUpperCase("pt-BR")}
          </p>
        </div>

        <div
          className="motion-reduce:transition-none"
          style={{
            opacity: showContent ? 1 : 0,
            transform: contentTransform,
            transition: `opacity 950ms ${ease}, transform 950ms ${ease}`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
