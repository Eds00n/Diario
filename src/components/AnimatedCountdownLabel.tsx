"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { specialDateCountdown } from "@/lib/dates";

type Parsed = {
  prefix: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type AnimatedValues = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type CountField = keyof AnimatedValues;

function parseCountdownLabel(label: string): Parsed | null {
  if (label === "É hoje!") return null;
  const prefixMatch = label.match(/^(Há|Faltam)\s+/);
  if (!prefixMatch) return null;

  const rest = label.slice(prefixMatch[0].length);
  const dayMatch = rest.match(/(\d+)\s+(?:dia|dias)\b/);
  const hourMatch = rest.match(/(\d+)\s+(?:hora|horas)\b/);
  const minuteMatch = rest.match(/(\d+)\s+(?:minuto|minutos)\b/);
  const secondMatch = rest.match(/(\d+)\s+(?:segundo|segundos)\b/);

  if (!dayMatch && !hourMatch && !minuteMatch && !secondMatch) return null;

  return {
    prefix: prefixMatch[1]!,
    days: dayMatch ? Number.parseInt(dayMatch[1]!, 10) : 0,
    hours: hourMatch ? Number.parseInt(hourMatch[1]!, 10) : 0,
    minutes: minuteMatch ? Number.parseInt(minuteMatch[1]!, 10) : 0,
    seconds: secondMatch ? Number.parseInt(secondMatch[1]!, 10) : 0,
  };
}

function parsedToValues(parsed: Parsed): AnimatedValues {
  return {
    days: parsed.days,
    hours: parsed.hours,
    minutes: parsed.minutes,
    seconds: parsed.seconds,
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
    parts.push(values.days === 1 ? "1 dia" : `${values.days} dias`);
  }
  if (parsed.hours > 0) {
    parts.push(values.hours === 1 ? "1 hora" : `${values.hours} horas`);
  }
  const detailed = parsed.days > 0 || parsed.hours > 0;
  if (detailed) {
    parts.push(
      values.minutes === 1 ? "1 minuto" : `${values.minutes} minutos`,
    );
    parts.push(
      values.seconds === 1 ? "1 segundo" : `${values.seconds} segundos`,
    );
  } else {
    if (parsed.minutes > 0) {
      parts.push(
        values.minutes === 1 ? "1 minuto" : `${values.minutes} minutos`,
      );
    }
    if (parsed.seconds > 0 || parts.length === 0) {
      parts.push(
        values.seconds === 1 ? "1 segundo" : `${values.seconds} segundos`,
      );
    }
  }
  return `${parsed.prefix} ${joinDurationParts(parts)}`.toLowerCase();
}

function durationForCount(max: number): number {
  if (max <= 0) return 0;
  if (max <= 59) return Math.min(1200, 350 + max * 12);
  return Math.min(2400, 900 + max * 9);
}

function animateCount(
  from: number,
  to: number,
  durationMs: number,
  onValue: (value: number) => void,
): Promise<void> {
  if (to <= from || durationMs <= 0) {
    onValue(to);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      onValue(Math.round(from + eased * (to - from)));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        onValue(to);
        resolve();
      }
    };

    frame = requestAnimationFrame(step);
  });
}

export function AnimatedCountdownLabel({
  data,
  recorrente,
}: {
  data: string;
  recorrente: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [now, setNow] = useState(() => new Date());
  const [introDone, setIntroDone] = useState(reducedMotion);
  const introStarted = useRef(false);

  const { label } = useMemo(
    () => specialDateCountdown(data, recorrente, now),
    [data, recorrente, now],
  );

  const parsed = useMemo(() => parseCountdownLabel(label), [label]);
  const liveTarget = useMemo(
    () => (parsed ? parsedToValues(parsed) : null),
    [parsed],
  );

  const [values, setValues] = useState<AnimatedValues>(() =>
    liveTarget && !reducedMotion
      ? { days: 0, hours: 0, minutes: 0, seconds: 0 }
      : liveTarget ?? { days: 0, hours: 0, minutes: 0, seconds: 0 },
  );

  useEffect(() => {
    if (!introDone) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [introDone]);

  useEffect(() => {
    if (!introDone || !liveTarget) return;
    setValues(liveTarget);
  }, [introDone, liveTarget]);

  useEffect(() => {
    if (!parsed || !liveTarget || reducedMotion || introStarted.current) {
      return;
    }
    introStarted.current = true;

    let cancelled = false;

    const run = async () => {
      setValues({ days: 0, hours: 0, minutes: 0, seconds: 0 });

      const sequence: Array<{ field: CountField; max: number }> = [
        { field: "days", max: liveTarget.days },
        { field: "hours", max: liveTarget.hours },
        { field: "minutes", max: liveTarget.minutes },
        { field: "seconds", max: liveTarget.seconds },
      ];

      for (const { field, max } of sequence) {
        if (cancelled || max <= 0) continue;
        await animateCount(0, max, durationForCount(max), (value) => {
          if (!cancelled) {
            setValues((prev) => ({ ...prev, [field]: value }));
          }
        });
      }

      if (!cancelled) setIntroDone(true);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [parsed, liveTarget, reducedMotion]);

  if (!parsed) {
    return <>{label.toLowerCase()}</>;
  }

  return (
    <span className="tabular-nums">{formatAnimatedLine(parsed, values)}</span>
  );
}
