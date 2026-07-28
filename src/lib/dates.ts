import {
  differenceInCalendarDays,
  differenceInMinutes,
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

function formatDurationParts(totalMinutes: number): string[] {
  const safe = Math.max(0, totalMinutes);
  const days = Math.floor(safe / (24 * 60));
  const hours = Math.floor((safe % (24 * 60)) / 60);
  const minutes = safe % 60;
  const parts: string[] = [];

  if (days > 0) {
    parts.push(days === 1 ? "1 dia" : `${days} dias`);
  }
  if (hours > 0) {
    parts.push(hours === 1 ? "1 hora" : `${hours} horas`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(minutes === 1 ? "1 minuto" : `${minutes} minutos`);
  }

  return parts;
}

function joinDurationParts(parts: string[]): string {
  if (parts.length === 1) return parts[0]!;
  if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} e ${parts.at(-1)}`;
}

function formatElapsedLabel(from: Date, to: Date, prefix: "Há" | "Faltam"): string {
  const totalMinutes = differenceInMinutes(to, from);
  const parts = formatDurationParts(totalMinutes);
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
