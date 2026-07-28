import Link from "next/link";
import type { ReactNode } from "react";
import { DecorativeLily } from "@/components/DecorativeLily";
import { EntryCard } from "@/components/EntryCard";
import { EntryImmersiveZone } from "@/components/EntryImmersiveZone";
import { LilyField } from "@/components/LilyField";
import { RevealOnMount } from "@/components/RevealOnMount";
import { RevealOnView } from "@/components/RevealOnView";
import { SpecialDateBanner } from "@/components/SpecialDateChip";
import { TimelineBackgroundProvider } from "@/components/TimelineBackground";
import { capitalizeFirst, formatMonthYear } from "@/lib/dates";
import type { Entry, SpecialDate } from "@/lib/types";

function groupEntriesByMonth(entries: Entry[]): Map<string, Entry[]> {
  const sorted = [...entries].sort((a, b) => a.data.localeCompare(b.data));
  const map = new Map<string, Entry[]>();
  for (const entry of sorted) {
    const key = entry.data.slice(0, 7);
    const list = map.get(key) ?? [];
    list.push(entry);
    map.set(key, list);
  }
  return map;
}

export function Timeline({
  entries,
  specialDates,
  showAdminLink = false,
  isDemo = false,
  dataSource,
}: {
  entries: Entry[];
  specialDates: SpecialDate[];
  showAdminLink?: boolean;
  isDemo?: boolean;
  dataSource?: "supabase" | "local-json" | "demo";
}) {
  const grouped = groupEntriesByMonth(entries);
  const months = [...grouped.keys()].sort((a, b) => a.localeCompare(b));
  let alternateLayoutIndex = 0;

  return (
    <TimelineBackgroundProvider>
    <div className="relative overflow-x-hidden pb-24">
      <LilyField />
      <DecorativeLily position="top-right" size={300} opacity={0.42} priority />
      <DecorativeLily position="left" size={320} opacity={0.38} rotate={-6} />
      <DecorativeLily
        position="bottom-right"
        size={280}
        opacity={0.36}
        rotate={4}
      />

      <section className="relative z-[1] flex min-h-[100dvh] w-full min-w-0 flex-col items-center justify-center px-10 py-16">
        <header className="w-full max-w-[720px] text-center">
          <RevealOnMount delayMs={0}>
            <p className="mb-3.5 text-xs font-medium uppercase tracking-[0.35em] text-gold">
              Nosso
            </p>
          </RevealOnMount>
          <RevealOnMount delayMs={160}>
            <h1 className="font-display text-[clamp(48px,8vw,78px)] font-medium leading-none tracking-[0.01em]">
              Diário
            </h1>
          </RevealOnMount>
          <RevealOnMount delayMs={320}>
            <p className="mt-4 text-[15px] tracking-wide text-ink-soft">
              Memórias guardadas com carinho
            </p>
            {showAdminLink && (
              <Link
                href="/admin"
                className="mt-5 inline-block text-[11px] uppercase tracking-widest text-ink-soft underline-offset-4 hover:text-gold hover:underline"
              >
                Área admin
              </Link>
            )}
          </RevealOnMount>
        </header>

        {specialDates.length > 0 && (
          <div className="mt-12 w-full min-w-0 max-w-[720px]">
            {specialDates.map((d, i) => (
              <RevealOnMount key={d.id} delayMs={520 + i * 140}>
                <SpecialDateBanner item={d} />
              </RevealOnMount>
            ))}
          </div>
        )}
      </section>

      {entries.length === 0 ? (
        <p className="relative z-[1] px-10 text-center text-ink-soft">
          Ainda não há entradas por aqui.
        </p>
      ) : (
        <div className="relative z-[1]">
        <>
          {months.map((monthKey, sectionIndex) => {
            const monthEntries = grouped.get(monthKey)!;
            const label = capitalizeFirst(formatMonthYear(`${monthKey}-01`));
            return (
              <section
                key={monthKey}
                className={`relative z-[1] ${
                  sectionIndex > 0 ? "mt-28 md:mt-40" : "pt-4 md:pt-8"
                }`}
              >
                <RevealOnView>
                  <h2 className="relative z-[1] mx-auto mb-10 max-w-[1040px] px-10 font-display text-[15px] uppercase tracking-[0.25em] text-ink-soft">
                    {label}
                  </h2>
                </RevealOnView>
                <div>
                  {(() => {
                    const nodes: ReactNode[] = [];
                    for (let index = 0; index < monthEntries.length; ) {
                      const entry = monthEntries[index]!;

                      if (entry.fundo_imersivo_grupo) {
                        const prev = monthEntries[index - 1];
                        if (prev?.fundo_imersivo) {
                          index += 1;
                          continue;
                        }
                      }

                      let groupEnd = index;
                      if (entry.fundo_imersivo) {
                        while (
                          groupEnd + 1 < monthEntries.length &&
                          monthEntries[groupEnd + 1]!.fundo_imersivo_grupo ===
                            true
                        ) {
                          groupEnd += 1;
                        }
                      }

                      const renderCard = (e: Entry, idx: number) => {
                        const isImportant = e.foto_importante === true;
                        const reverse =
                          !isImportant && alternateLayoutIndex % 2 === 1;
                        if (!isImportant) {
                          alternateLayoutIndex += 1;
                        }
                        return (
                          <EntryCard
                            key={e.id}
                            entry={e}
                            reverse={reverse}
                            revealDelay={Math.min(idx * 90, 270)}
                          />
                        );
                      };

                      if (entry.fundo_imersivo) {
                        const cards = [];
                        for (let j = index; j <= groupEnd; j++) {
                          cards.push(renderCard(monthEntries[j]!, j));
                        }
                        nodes.push(
                          <EntryImmersiveZone
                            key={`immersive-${entry.id}`}
                            zoneId={entry.id}
                            backgroundUrl={entry.fundo_imersivo}
                          >
                            {cards}
                          </EntryImmersiveZone>,
                        );
                        index = groupEnd + 1;
                      } else {
                        nodes.push(renderCard(entry, index));
                        index += 1;
                      }
                    }
                    return nodes;
                  })()}
                </div>
              </section>
            );
          })}
        </>
        </div>
      )}

      {(isDemo || dataSource === "local-json") && (
        <footer className="relative z-[1] px-10 pb-[100px] pt-[60px] text-center text-xs tracking-wide text-ink-soft">
          {dataSource === "local-json"
            ? `${entries.length} memórias de content/memorias.json (fotos na pasta E. S.)`
            : "Preview local — layout de referência (conecte o Supabase para conteúdo real)"}
        </footer>
      )}
    </div>
    </TimelineBackgroundProvider>
  );
}
