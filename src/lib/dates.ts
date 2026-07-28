import {
  differenceInCalendarDays,
  differenceInSeconds,
  format,
  parseISO,
  setYear,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatMonthYear(dateStr: string): string {
  return format(parseISO(dateStr), "MMMM yyyy", { locale: ptBR });
}

export function formatEntryDate(dateStr: string, dateEndStr?: string): string {
  if (!dateEndStr || dateEndStr === dateStr) {
    return format(parseISO(dateStr), "d 'de' MMMM, yyyy", { locale: ptBR });
  }
  const start = parseISO(dateStr);
  const end = parseISO(dateEndStr);
  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    return `${format(start, "d", { locale: ptBR })}–${format(end, "d 'de' MMMM, yyyy", { locale: ptBR })}`;
  }
  return `${format(start, "d 'de' MMMM", { locale: ptBR })} – ${format(end, "d 'de' MMMM, yyyy", { locale: ptBR })}`;
}

export function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Dia + mês para splash antes da memória (usa a data inicial). */
export function formatEntryDayMonth(dateStr: string): {
  day: string;
  month: string;
} {
  const d = parseISO(dateStr);
  return {
    day: format(d, "d", { locale: ptBR }),
    month: capitalizeFirst(format(d, "MMMM", { locale: ptBR })),
  };
}

function pushUnit(parts: string[], value: number, singular: string, plural: string) {
  parts.push(value === 1 ? `1 ${singular}` : `${value} ${plural}`);
}

function formatDurationPartsFromSeconds(totalSeconds: number): string[] {
  const safe = Math.max(0, totalSeconds);
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const parts: string[] = [];

  if (days > 0) pushUnit(parts, days, "dia", "dias");
  if (hours > 0) pushUnit(parts, hours, "hora", "horas");

  const detailed = days > 0 || hours > 0;
  if (detailed) {
    pushUnit(parts, minutes, "minuto", "minutos");
    pushUnit(parts, seconds, "segundo", "segundos");
  } else {
    if (minutes > 0) pushUnit(parts, minutes, "minuto", "minutos");
    if (seconds > 0 || parts.length === 0) {
      pushUnit(parts, seconds, "segundo", "segundos");
    }
  }

  return parts;
}

function joinDurationParts(parts: string[]): string {
  if (parts.length === 1) return parts[0]!;
  if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} e ${parts.at(-1)}`;
}

function formatElapsedLabel(from: Date, to: Date, prefix: "Há" | "Faltam"): string {
  const totalSeconds = differenceInSeconds(to, from);
  const parts = formatDurationPartsFromSeconds(totalSeconds);
  return `${prefix} ${joinDurationParts(parts)}`;
}

/** Contador para datas especiais cadastradas */
export function specialDateCountdown(
  data: string,
  recorrente: boolean,
  now = new Date(),
): { label: string; kind: "past" | "future" | "today" } {
  const today = startOfDay(now);
  const base = startOfDay(parseISO(data));

  if (!recorrente) {
    const diff = differenceInCalendarDays(base, today);
    if (diff === 0) return { label: "É hoje!", kind: "today" };
    if (diff < 0) {
      return {
        label: formatElapsedLabel(base, now, "Há"),
        kind: "past",
      };
    }
    return {
      label: formatElapsedLabel(now, base, "Faltam"),
      kind: "future",
    };
  }

  const thisYearOccurrence = setYear(base, today.getFullYear());
  const diffThisYear = differenceInCalendarDays(thisYearOccurrence, today);

  if (diffThisYear === 0) return { label: "É hoje!", kind: "today" };
  if (diffThisYear > 0) {
    return {
      label: formatElapsedLabel(now, thisYearOccurrence, "Faltam"),
      kind: "future",
    };
  }
  return {
    label: formatElapsedLabel(thisYearOccurrence, now, "Há"),
    kind: "past",
  };
}
