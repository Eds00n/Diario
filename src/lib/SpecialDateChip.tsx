import { formatEntryDate } from "@/lib/dates";
import type { SpecialDate } from "@/lib/types";
import { AnimatedCountdownLabel } from "@/components/AnimatedCountdownLabel";

export function SpecialDateBanner({ item }: { item: SpecialDate }) {
  return (
    <div className="flex flex-col items-center gap-5 border-y border-hairline py-8 text-center">
      <div>
        <p className="font-display text-[22px] font-medium text-ink">{item.nome}</p>
        {item.subtitulo ? (
          <p className="font-display mt-1 text-[20px] font-normal italic text-ink md:text-[22px]">
            {item.subtitulo}
          </p>
        ) : null}
        <p className="mt-1 text-[13px] text-ink-soft">
          {formatEntryDate(item.data)}
          {item.recorrente ? " · todo ano" : ""}
        </p>
      </div>
      <div className="w-full min-w-0 px-1">
        <p className="font-display mx-auto max-w-full text-pretty text-[clamp(17px,4.8vw,24px)] italic leading-snug text-ink lowercase md:max-w-[min(100%,920px)] md:text-[clamp(22px,2.6vw,42px)] md:leading-[1.35]">
          <AnimatedCountdownLabel data={item.data} recorrente={item.recorrente} />
        </p>
      </div>
    </div>
  );
}
