import { formatEntryDate } from "@/lib/dates";
import type { SpecialDate } from "@/lib/types";
import { AnimatedCountdownLabel } from "@/components/AnimatedCountdownLabel";

export function SpecialDateBanner({ item }: { item: SpecialDate }) {
  return (
    <div className="flex flex-col items-center gap-5 border-y border-hairline py-8 text-center">
      <div>
        <p className="font-display text-[22px] font-medium text-ink">{item.nome}</p>
        <p className="mt-1 text-[13px] text-ink-soft">
          {formatEntryDate(item.data)}
          {item.recorrente ? " · todo ano" : ""}
        </p>
      </div>
      <div className="w-full max-w-full overflow-x-auto px-2 text-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <p className="font-display inline-block whitespace-nowrap text-[clamp(16px,3.35vw,42px)] italic leading-snug text-gold lowercase">
          <AnimatedCountdownLabel data={item.data} recorrente={item.recorrente} />
        </p>
      </div>
    </div>
  );
}
