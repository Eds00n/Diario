"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Parsed = { prefix: string; days: number; suffix: string };

function parseCountdownLabel(label: string): Parsed | null {
  if (label === "É hoje!") return null;
  const match = label.match(/^(Há|Faltam)\s+(\d+)\s+(dias|dia)([\s\S]*)$/);
  if (!match) return null;
  return {
    prefix: match[1]!,
    days: Number.parseInt(match[2]!, 10),
    suffix: match[4] ?? "",
  };
}

function formatDaysLine(parsed: Parsed, days: number): string {
  const word = days === 1 ? "dia" : "dias";
  return `${parsed.prefix} ${days} ${word}${parsed.suffix}`.toLowerCase();
}

export function AnimatedCountdownLabel({ label }: { label: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const parsed = useMemo(() => parseCountdownLabel(label), [label]);
  const targetDays = parsed?.days ?? 0;

  const [days, setDays] = useState(() =>
    reducedMotion || !parsed ? targetDays : 0,
  );

  useEffect(() => {
    if (!parsed || reducedMotion) {
      setDays(targetDays);
      return;
    }

    setDays(0);
    const durationMs = Math.min(2400, 900 + targetDays * 9);
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setDays(Math.round(eased * targetDays));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [parsed, reducedMotion, targetDays]);

  if (!parsed) {
    return <>{label.toLowerCase()}</>;
  }

  return (
    <span className="tabular-nums">{formatDaysLine(parsed, days)}</span>
  );
}
