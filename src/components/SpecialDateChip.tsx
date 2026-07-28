import { specialDateCountdown, formatEntryDate } from "@/lib/dates";
import type { SpecialDate } from "@/lib/types";
import { AnimatedCountdownLabel } from "@/components/AnimatedCountdownLabel";

export function SpecialDateBanner({ item }: { item: SpecialDate }) {
  const { label } = specialDateCountdown(item.data, item.recorrente);

  return (
    <div className="flex flex-col items-center gap-5 border-y border-hairline py-8 text-center">
      <div>
        <p className="font-display text-[22px] font-medium text-ink">{item.nome}</p>
        <p className="mt-1 text-[13px] text-ink-soft">
          {formatEntryDate(item.data)}
          {item.recorrente ? " · todo ano" : ""}
        </p>
      </div>
      <p className="font-display max-w-[min(100%,640px)] text-[clamp(28px,4.5vw,42px)] italic leading-snug text-gold lowercase">
        <AnimatedCountdownLabel label={label} />
      </p>
    </div>
  );
}
