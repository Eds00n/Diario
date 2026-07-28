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
      <div className="relative -mx-10 w-[calc(100%+5rem)] min-w-0 max-w-[100vw] px-4 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-3 md:mx-0 md:w-full md:max-w-full">
        <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain px-1 text-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <p className="font-display mx-auto inline-block w-max max-w-none whitespace-nowrap text-[clamp(18px,5.2vw,24px)] italic leading-snug text-ink lowercase md:text-[clamp(26px,calc((100vw-8rem)/32),42px)]">
            <AnimatedCountdownLabel data={item.data} recorrente={item.recorrente} />
          </p>
        </div>
      </div>
    </div>
  );
}
