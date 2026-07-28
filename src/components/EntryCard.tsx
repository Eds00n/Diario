import { PhotoStack } from "@/components/PhotoStack";
import { RevealOnView } from "@/components/RevealOnView";
import { formatEntryDate } from "@/lib/dates";
import { EntryTextEmphasis } from "@/components/EntryTextEmphasis";
import type { Entry } from "@/lib/types";

const entryBodyTextClass =
  "font-display font-normal text-ink whitespace-pre-wrap text-[15px] leading-[1.45] md:text-[26px] md:leading-[1.5]";

function EntryText({
  entry,
  variant = "default",
}: {
  entry: Entry;
  variant?: "default" | "important" | "important-banner";
}) {
  const isImportant = variant === "important";
  const isBanner = variant === "important-banner";

  return (
    <>
      <time
        className={`mb-[14px] block font-medium uppercase tracking-[0.08em] text-gold ${
          isBanner
            ? "text-[13px] tracking-[0.12em] md:text-[14px]"
            : isImportant
              ? "text-[10px] tracking-[0.08em] md:text-[11px] md:tracking-[0.1em]"
              : "text-[10px] tracking-[0.06em] md:text-[13px] md:tracking-[0.08em]"
        }`}
        dateTime={
          entry.data_fim ? `${entry.data}/${entry.data_fim}` : entry.data
        }
      >
        {formatEntryDate(entry.data, entry.data_fim)}
      </time>
      {entry.texto.trim() ? (
        <p
          className={`${entryBodyTextClass} ${
            isBanner
              ? "text-[26px] leading-[1.4] md:text-[32px] md:leading-[1.35]"
              : isImportant
                ? "text-[15px] leading-[1.4] md:text-[20px] md:leading-[1.45]"
                : ""
          }`}
        >
          <EntryTextEmphasis text={entry.texto} />
        </p>
      ) : (
        <p
          className={`font-display font-normal italic text-ink-soft ${
            isBanner
              ? "text-[26px] leading-[1.4] md:text-[32px] md:leading-[1.35]"
              : isImportant
                ? "text-[20px] md:text-[22px] leading-[1.45]"
                : "text-[26px] leading-[1.5]"
          }`}
        >
          Sem texto neste dia.
        </p>
      )}
      {entry.texto_complemento?.trim() ? (
        <p
          className={`mt-4 ${entryBodyTextClass} ${
            isBanner
              ? "text-[26px] leading-[1.4] md:text-[32px] md:leading-[1.35]"
              : isImportant
                ? "text-[15px] leading-[1.4] md:text-[20px] md:leading-[1.45]"
                : ""
          }`}
        >
          <EntryTextEmphasis text={entry.texto_complemento} />
        </p>
      ) : null}
      {entry.is_data_especial && (
        <span className="mt-6 inline-block rounded-full border border-sage-line px-3 py-1.5 font-body text-[11px] uppercase tracking-widest text-sage-line">
          Data especial
        </span>
      )}
    </>
  );
}

export function EntryCard({
  entry,
  reverse = false,
  revealDelay = 0,
}: {
  entry: Entry;
  reverse?: boolean;
  revealDelay?: number;
}) {
  const photos = entry.fotos ?? [];
  const photosBelow = entry.fotos_abaixo ?? [];
  const highlight = entry.foto_importante === true;
  const highlightBanner = highlight && entry.foto_importante_banner === true;
  const twoPhotosLayout = photos.length === 2 && !highlight;

  if (highlightBanner) {
    return (
      <RevealOnView delayMs={revealDelay}>
        <article className="entry-important-photo relative z-[1] mb-[220px] md:mb-[280px] w-full">
          <div className="relative min-h-[380px] w-full overflow-hidden sm:min-h-[440px] md:min-h-[532px]">
            {photos.length > 0 ? (
              <PhotoStack urls={photos} prominent fill />
            ) : (
              <div
                className="entry-photo-gradient entry-photo-grain absolute inset-0"
                aria-hidden
              />
            )}
            <div className="relative z-[2] flex min-h-[380px] sm:min-h-[440px] md:min-h-[532px]">
              <div className="flex min-h-full w-full max-w-[min(100%,520px)] shrink-0 items-center bg-gradient-to-r from-bg from-[70%] to-transparent px-10 py-10 sm:max-w-[min(62vw,580px)] md:max-w-[600px] md:py-14">
                <div className="entry-text-block pointer-events-auto w-full max-w-[360px] text-left md:max-w-[420px]">
                  <EntryText entry={entry} variant="important-banner" />
                </div>
              </div>
            </div>
          </div>
          {photosBelow.length > 0 && (
            <div className="mt-10 w-full md:mt-12">
              <PhotoStack urls={photosBelow} threeColumn threeColumnFullBleed />
            </div>
          )}
        </article>
      </RevealOnView>
    );
  }

  if (highlight) {
    return (
      <RevealOnView delayMs={revealDelay}>
        <article className="entry-important-photo relative z-[1] mx-auto mb-[220px] md:mb-[280px] max-w-[1040px] px-4 md:px-10">
          <div className="flex flex-col gap-5 max-md:gap-6 md:grid md:grid-cols-[minmax(0,220px)_minmax(0,1fr)_minmax(0,220px)] md:items-center md:gap-8 lg:gap-10">
            <div className="entry-text-block order-1 min-w-0 w-full max-w-none text-left md:col-start-1 md:row-start-1 md:max-w-[260px] md:justify-self-start md:pr-2">
              <EntryText entry={entry} variant="important" />
            </div>
            <div className="entry-photo-block order-2 flex min-w-0 w-full justify-center md:col-start-2 md:row-start-1 md:px-2">
              <div className="mx-auto w-full max-w-none md:max-w-[720px]">
                {photos.length > 0 ? (
                  <PhotoStack
                    urls={photos}
                    prominent
                    prominentMobileLarge
                  />
                ) : (
                  <div className="entry-photo-gradient entry-photo-grain relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
                    <span className="absolute bottom-4 left-4 bg-white/70 px-2 py-1 text-[11px] uppercase tracking-widest text-ink-soft">
                      foto
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden md:col-start-3 md:row-start-1 md:block" aria-hidden />
          </div>
        </article>
      </RevealOnView>
    );
  }

  if (twoPhotosLayout) {
    return (
      <RevealOnView delayMs={revealDelay}>
        <article className="relative z-[1] mx-auto mb-[220px] md:mb-[280px] flex max-w-[1040px] flex-col gap-7 px-10 md:gap-9">
        <div className="entry-text-block w-full max-w-[720px]">
          <EntryText entry={entry} />
        </div>
        <div className="entry-photo-block w-full">
          <PhotoStack urls={photos} />
        </div>
        {entry.texto_abaixo?.trim() ? (
          <div className="entry-text-block w-full max-w-[720px]">
            <p className={entryBodyTextClass}>
              <EntryTextEmphasis text={entry.texto_abaixo} />
            </p>
          </div>
        ) : null}
        {entry.texto_abaixo_direita?.trim() ? (
          <div className="entry-text-block ml-auto w-full max-w-[720px] text-right">
            <p className={entryBodyTextClass}>
              <EntryTextEmphasis text={entry.texto_abaixo_direita} />
            </p>
          </div>
        ) : null}
      </article>
      </RevealOnView>
    );
  }

  return (
    <RevealOnView delayMs={revealDelay}>
      <article
      className={`relative z-[1] mx-auto mb-[220px] md:mb-[280px] grid max-w-[1040px] grid-cols-2 items-center gap-3 px-4 md:grid-cols-2 md:gap-16 md:px-10 ${
        reverse ? "entry-reverse" : ""
      }`}
    >
      <div
        className={`entry-photo-block min-w-0 space-y-4 ${reverse ? "order-2 md:order-2" : "order-1 md:order-1"}`}
      >
        {photos.length > 0 ? (
          <PhotoStack urls={photos} />
        ) : (
          <div className="entry-photo-gradient entry-photo-grain relative aspect-[4/5] overflow-hidden rounded-2xl">
            <span className="absolute bottom-4 left-4 bg-white/70 px-2 py-1 text-[11px] uppercase tracking-widest text-ink-soft">
              foto
            </span>
          </div>
        )}
      </div>

      <div
        className={`entry-text-block min-w-0 ${reverse ? "order-1 md:order-1" : "order-2 md:order-2"}`}
      >
        <EntryText entry={entry} />
      </div>
    </article>
    </RevealOnView>
  );
}
