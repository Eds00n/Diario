import { formatEntryDate } from "@/lib/dates";
import type { SpecialDate } from "@/lib/types";
import { AnimatedCountdownLabel } from "@/components/AnimatedCountdownLabel";

export function SpecialDateBanner({ item }: { item: SpecialDate }) {
  const subtitulo = item.subtitulo?.trim() ?? "";
  const omitElapsedPrefix = /há\s*$/i.test(subtitulo);

  return (
    <div className="flex flex-col items-center gap-5 border-y border-hairline py-8 text-center">
      <div>
        {item.nome?.trim() ? (
          <p className="font-display text-[22px] font-medium text-ink">{item.nome}</p>
        ) : null}
        <p className={`text-[13px] text-ink-soft ${item.nome?.trim() ? "mt-1" : ""}`}>
          {formatEntryDate(item.data)}
          {item.recorrente ? " · todo ano" : ""}
        </p>
        {item.subtitulo ? (
          <p className="font-display mt-2 text-[20px] font-normal italic text-ink md:mt-2.5 md:text-[22px]">
            {item.subtitulo}
          </p>
        ) : null}
      </div>
      <div className="w-full min-w-0 px-1">
        <p className="font-display mx-auto max-w-full text-pretty text-[clamp(17px,4.8vw,24px)] italic leading-snug text-ink lowercase md:max-w-[min(100%,920px)] md:text-[clamp(22px,2.6vw,42px)] md:leading-[1.35]">
          <AnimatedCountdownLabel
            data={item.data}
            recorrente={item.recorrente}
            omitElapsedPrefix={omitElapsedPrefix}
          />
        </p>
      </div>
    </div>
  );
}
