import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { AddMemoryButton } from "@/components/AddMemoryButton";
import { EntryCard } from "@/components/EntryCard";
import { EntryImmersiveZone } from "@/components/EntryImmersiveZone";
import { LilyField } from "@/components/LilyField";
import { RevealOnMount } from "@/components/RevealOnMount";
import { TimelineBackgroundProvider } from "@/components/TimelineBackground";
import { HeroClothesline } from "@/components/HeroClothesline";
import type { Entry } from "@/lib/types";

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
  showAdminLink = false,
  isDemo = false,
  dataSource,
}: {
  entries: Entry[];
  showAdminLink?: boolean;
  isDemo?: boolean;
  dataSource?: "supabase" | "local-json" | "demo";
}) {
  const grouped = groupEntriesByMonth(entries);
  const months = [...grouped.keys()].sort((a, b) => a.localeCompare(b));
  const entryPageNumbers = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.data.localeCompare(b.data));
    const map = new Map<string, number>();
    sorted.forEach((entry, index) => map.set(entry.id, index + 1));
    return map;
  }, [entries]);
  let alternateLayoutIndex = 0;

  return (
    <TimelineBackgroundProvider>
    <div className="relative pb-24">
      <LilyField />

      <section className="relative z-[1] flex min-h-[calc(100dvh-clamp(4.5rem,11vh,7rem))] w-full min-w-0 flex-col items-center justify-center overflow-x-clip bg-transparent px-5 py-12 sm:px-6 md:px-10 md:py-16">
        <header className="w-full max-w-[min(100%,980px)] bg-transparent">
          <RevealOnMount delayMs={140}>
            <HeroClothesline entries={entries} />
          </RevealOnMount>
          {showAdminLink && (
            <RevealOnMount delayMs={400}>
              <Link
                href="/admin"
                className="mt-8 inline-block text-center text-[11px] uppercase tracking-widest text-ink-soft underline-offset-4 hover:text-gold hover:underline w-full"
              >
                Área admin
              </Link>
            </RevealOnMount>
          )}
        </header>
      </section>

      {entries.length === 0 ? (
        <p className="relative z-[1] px-10 text-center text-ink-soft">
          Ainda não há entradas por aqui.
        </p>
      ) : (
        <div className="relative z-[1] -mt-[clamp(4.5rem,11vh,7rem)]">
        <>
          {dataSource === "local-json" && (
            <AddMemoryButton defaultDate={entries[0]?.data ?? ""} />
          )}
          {months.map((monthKey, sectionIndex) => {
            const monthEntries = grouped.get(monthKey)!;
            return (
              <section
                key={monthKey}
                className={`relative z-[1] ${
                  sectionIndex > 0 ? "mt-20 md:mt-40" : ""
                }`}
              >
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
                          !isImportant &&
                          (e.foto_direita === true ||
                            alternateLayoutIndex % 2 === 1);
                        if (!isImportant) {
                          alternateLayoutIndex += 1;
                        }
                        const pageNum = entryPageNumbers.get(e.id);
                        return (
                          <EntryCard
                            key={e.id}
                            entry={e}
                            reverse={reverse}
                            revealDelay={
                              pageNum === 1 ? 320 : Math.min(idx * 90, 270)
                            }
                            revealedOnLoad={pageNum === 1}
                            pageNumber={pageNum}
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
                      if (dataSource === "local-json") {
                        nodes.push(
                          <AddMemoryButton
                            key={`add-after-${entry.id}`}
                            defaultDate={entry.data}
                          />,
                        );
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
