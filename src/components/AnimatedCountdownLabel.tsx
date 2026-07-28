"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Parsed = {
  prefix: string;
  days: number;
  hours: number;
  minutes: number;
};

type AnimatedValues = { days: number; hours: number; minutes: number };

function parseCountdownLabel(label: string): Parsed | null {
  if (label === "É hoje!") return null;
  const prefixMatch = label.match(/^(Há|Faltam)\s+/);
  if (!prefixMatch) return null;

  const rest = label.slice(prefixMatch[0].length);
  const dayMatch = rest.match(/(\d+)\s+(?:dia|dias)\b/);
  const hourMatch = rest.match(/(\d+)\s+(?:hora|horas)\b/);
  const minuteMatch = rest.match(/(\d+)\s+(?:minuto|minutos)\b/);

  if (!dayMatch && !hourMatch && !minuteMatch) return null;

  return {
    prefix: prefixMatch[1]!,
    days: dayMatch ? Number.parseInt(dayMatch[1]!, 10) : 0,
    hours: hourMatch ? Number.parseInt(hourMatch[1]!, 10) : 0,
    minutes: minuteMatch ? Number.parseInt(minuteMatch[1]!, 10) : 0,
  };
}

function joinDurationParts(parts: string[]): string {
  if (parts.length === 1) return parts[0]!;
  if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} e ${parts.at(-1)}`;
}

function formatAnimatedLine(parsed: Parsed, values: AnimatedValues): string {
  const parts: string[] = [];
  if (parsed.days > 0) {
    parts.push(
      values.days === 1 ? "1 dia" : `${values.days} dias`,
    );
  }
  if (parsed.hours > 0) {
    parts.push(
      values.hours === 1 ? "1 hora" : `${values.hours} horas`,
    );
  }
  if (parsed.minutes > 0 || parts.length === 0) {
    parts.push(
      values.minutes === 1 ? "1 minuto" : `${values.minutes} minutos`,
    );
  }
  return `${parsed.prefix} ${joinDurationParts(parts)}`.toLowerCase();
}

function animationDurationMs(target: AnimatedValues): number {
  const weight =
    target.days * 24 * 60 + target.hours * 60 + target.minutes;
  return Math.min(2800, 850 + Math.sqrt(weight) * 55);
}

export function AnimatedCountdownLabel({ label }: { label: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const parsed = useMemo(() => parseCountdownLabel(label), [label]);

  const target: AnimatedValues = useMemo(
    () => ({
      days: parsed?.days ?? 0,
      hours: parsed?.hours ?? 0,
      minutes: parsed?.minutes ?? 0,
    }),
    [parsed],
  );

  const [values, setValues] = useState<AnimatedValues>(() =>
    reducedMotion || !parsed
      ? target
      : { days: 0, hours: 0, minutes: 0 },
  );

  useEffect(() => {
    if (!parsed || reducedMotion) {
      setValues(target);
      return;
    }

    setValues({ days: 0, hours: 0, minutes: 0 });
    const durationMs = animationDurationMs(target);
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      setValues({
        days: Math.round(eased * target.days),
        hours: Math.round(eased * target.hours),
        minutes: Math.round(eased * target.minutes),
      });
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [parsed, reducedMotion, target]);

  if (!parsed) {
    return <>{label.toLowerCase()}</>;
  }

  return (
    <span className="tabular-nums">{formatAnimatedLine(parsed, values)}</span>
  );
}
