import { EntryDateIntro } from "@/components/EntryDateIntro";
import { EntryGoldOrnament } from "@/components/EntryGoldOrnament";
import { PhotoStack } from "@/components/PhotoStack";
import { formatEntryDate, formatEntryDayMonth } from "@/lib/dates";
import { getEntryEditorialCopy } from "@/lib/entryEditorial";
import { EntryTextEmphasis } from "@/components/EntryTextEmphasis";
import type { Entry } from "@/lib/types";
import type { ReactNode } from "react";

function EntryPageMarker({ pageNumber }: { pageNumber?: number }) {
  if (pageNumber == null) return null;
  return (
    <span className="entry-page-marker" aria-hidden>
      {String(pageNumber).padStart(2, "0")}
    </span>
  );
}

/** Props comuns do `<article>` de cada memória (data estável para estilo por entrada). */
function entryArticleDataAttrs(entry: Entry) {
  const layout = entry.foto_importante
    ? entry.foto_importante_banner
      ? "foto-importante-banner"
      : "foto-importante"
    : (entry.fotos?.length ?? 0) === 2
      ? "text-then-two-photos"
      : "side-by-side";
  return {
    "data-entry-date": entry.data,
    "data-entry-layout": layout,
  };
}

function entryPhotoStackProps(entry: Entry) {
  return {
    blurReveal: entry.foto_revelar_blur,
    photoObjectPosition: entry.foto_object_position,
    photoObjectScale: entry.foto_object_scale,
  };
}

function EntryEditorialText({
  entry,
  compact = false,
  centered = false,
}: {
  entry: Entry;
  compact?: boolean;
  centered?: boolean;
}) {
  const { title, caption } = getEntryEditorialCopy(entry);
  const hasTitle = Boolean(title?.trim());
  const hasCaption = Boolean(caption.trim());
  const alignClass = centered ? "items-center text-center" : "";

  return (
    <div className={`flex flex-col gap-2 md:gap-6 ${alignClass}`}>
      <div className="entry-date-header flex w-full flex-col items-center gap-2 md:gap-4">
        <time
          className={`w-full text-[11px] tracking-[0.1em] text-stone-600 md:text-sm md:tracking-[0.12em] ${centered ? "text-center" : ""}`}
          dateTime={
            entry.data_fim ? `${entry.data}/${entry.data_fim}` : entry.data
          }
        >
          {formatEntryDate(entry.data, entry.data_fim)}
        </time>

        <EntryGoldOrnament variant="under-date" />
      </div>

      {hasTitle && entry.foto_importante ? (
        <h2
          className={`entry-important-title font-title max-w-full break-words whitespace-pre-wrap text-pretty font-normal leading-tight text-stone-900 ${
            compact
              ? "text-xl sm:text-3xl md:text-4xl"
              : "text-xl sm:text-4xl md:text-5xl"
          }`}
        >
          <EntryTextEmphasis text={title!} />
        </h2>
      ) : null}

      {hasCaption ? (
        <p
          className={`entry-quote mt-2 whitespace-pre-wrap text-pretty italic text-stone-700 md:mt-6 ${
            hasTitle
              ? "entry-quote--with-title"
              : entry.citacao_apenas
                ? "entry-quote--solo entry-quote--citacao-apenas"
                : "entry-quote--solo"
          }`}
        >
          <EntryTextEmphasis text={caption} />
        </p>
      ) : !hasTitle ? (
        <p className="text-lg italic text-stone-600">Sem texto neste dia.</p>
      ) : null}

      {hasCaption || hasTitle ? (
        <EntryGoldOrnament
          className={`mt-2 ${centered ? "mx-auto" : ""}`}
        />
      ) : null}

      {entry.is_data_especial ? (
        <span className="mt-2 inline-block font-body text-[11px] uppercase tracking-[0.18em] text-stone-500">
          Data especial
        </span>
      ) : null}
    </div>
  );
}

function EntryPhotoColumn({ children }: { children: ReactNode }) {
  return (
    <div className="entry-photo-col flex w-full min-w-0 justify-center self-center px-0.5 py-1 sm:px-3 sm:py-4">
      <div className="w-full min-w-0 max-w-md xl:max-w-lg">{children}</div>
    </div>
  );
}

const diarySectionClass =
  "entry-diary-section font-serif relative z-[1] mx-auto flex w-full max-w-6xl items-center px-3 py-10 max-md:items-start sm:px-6 sm:py-16 md:px-20 md:py-32";

export function EntryCard({
  entry,
  reverse = false,
  revealDelay = 0,
  pageNumber,
}: {
  entry: Entry;
  reverse?: boolean;
  revealDelay?: number;
  pageNumber?: number;
}) {
  const photos = entry.fotos ?? [];
  const photosBelow = entry.fotos_abaixo ?? [];
  const highlight = entry.foto_importante === true;
  const highlightBanner = highlight && entry.foto_importante_banner === true;
  const twoPhotosBelowText = photos.length === 2 && !highlight;

  const introLabel = formatEntryDayMonth(entry.data, entry.data_fim);

  const gridOrderClass = reverse
    ? "[&_.entry-photo-col]:order-2 [&_.entry-text-col]:order-1"
    : "";

  if (highlightBanner) {
    return (
      <EntryDateIntro dateLabel={introLabel} delayMs={revealDelay}>
        <article
          {...entryArticleDataAttrs(entry)}
          className="entry-important-photo entry-diary-section font-serif relative z-[1] mb-16 w-full md:mb-[280px]"
        >
          <div className="relative min-h-[380px] w-full overflow-hidden sm:min-h-[440px] md:min-h-[532px]">
            {photos.length > 0 ? (
              <PhotoStack
                urls={photos}
                prominent
                fill
                {...entryPhotoStackProps(entry)}
              />
            ) : (
              <div className="entry-photo-gradient absolute inset-0" aria-hidden />
            )}
            <div className="relative z-[2] flex min-h-[380px] sm:min-h-[440px] md:min-h-[532px]">
              <div className="flex min-h-full w-full max-w-[min(100%,520px)] shrink-0 items-center bg-gradient-to-r from-bg from-[70%] to-transparent px-10 py-10 sm:max-w-[min(62vw,580px)] md:max-w-[600px] md:py-14">
                <div className="entry-text-block pointer-events-auto w-full max-w-[360px] text-left md:max-w-[420px]">
                  <EntryEditorialText entry={entry} compact />
                </div>
              </div>
            </div>
          </div>
          <EntryPageMarker pageNumber={pageNumber} />
          {photosBelow.length > 0 && (
            <div className="mt-10 w-full md:mt-12">
              <PhotoStack urls={photosBelow} threeColumn threeColumnFullBleed />
            </div>
          )}
        </article>
      </EntryDateIntro>
    );
  }

  if (highlight) {
    return (
      <EntryDateIntro dateLabel={introLabel} delayMs={revealDelay}>
        <article
          {...entryArticleDataAttrs(entry)}
          className={`${diarySectionClass} entry-foto-importante min-h-0 max-w-[min(100%,1200px)] flex-col gap-5 md:min-h-[min(88vh,820px)] md:gap-10`}
        >
          <div className="entry-foto-importante-grid grid w-full grid-cols-1 items-center gap-5 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,15rem)] md:gap-10 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)_minmax(0,280px)] lg:gap-14">
            <div className="entry-text-col min-w-0 max-w-full md:max-w-[280px] md:justify-self-start md:self-center">
              <EntryEditorialText entry={entry} compact />
            </div>
            <div className="entry-foto-importante-media flex w-full min-w-0 justify-center px-1 md:col-start-2 md:px-2">
              <div className="w-full max-w-[min(100%,440px)] sm:max-w-[min(100%,520px)] md:max-w-[580px]">
                {photos.length > 0 ? (
                  <PhotoStack
                    urls={photos}
                    prominent
                    prominentMobileLarge
                    {...entryPhotoStackProps(entry)}
                  />
                ) : (
                  <div className="entry-photo-print">
                    <div className="entry-photo-print__inner entry-photo-gradient relative aspect-[4/5] w-full">
                      <span className="absolute bottom-4 left-4 bg-white/80 px-2 py-1 font-body text-[11px] uppercase tracking-widest text-stone-500">
                        foto
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden min-w-0 md:block md:col-start-3" aria-hidden />
          </div>
          <EntryPageMarker pageNumber={pageNumber} />
        </article>
      </EntryDateIntro>
    );
  }

  if (twoPhotosBelowText) {
    return (
      <EntryDateIntro dateLabel={introLabel} delayMs={revealDelay}>
        <article
          {...entryArticleDataAttrs(entry)}
          className={`${diarySectionClass} min-h-0 flex-col items-stretch gap-5 md:gap-10`}
        >
          <div className="entry-text-col mx-auto w-full max-w-xl">
            <EntryEditorialText entry={entry} centered />
          </div>
          <div className="entry-photo-col mx-auto w-full max-w-4xl px-1 sm:max-w-5xl sm:px-2 md:max-w-6xl">
            <PhotoStack
              urls={photos}
              pairSideBySide
              {...entryPhotoStackProps(entry)}
            />
          </div>
          {entry.texto_abaixo?.trim() ? (
            <p className="entry-quote entry-quote--with-title mx-auto mt-2 max-w-xl italic text-stone-700 md:mt-4">
              <EntryTextEmphasis text={entry.texto_abaixo} />
            </p>
          ) : null}
          {entry.texto_abaixo_direita?.trim() ? (
            <p className="entry-quote entry-quote--with-title mx-auto mt-4 max-w-xl text-right italic text-stone-700 md:mt-6">
              <EntryTextEmphasis text={entry.texto_abaixo_direita} />
            </p>
          ) : null}
          <EntryPageMarker pageNumber={pageNumber} />
        </article>
      </EntryDateIntro>
    );
  }

  return (
    <EntryDateIntro dateLabel={introLabel} delayMs={revealDelay}>
      <article
        {...entryArticleDataAttrs(entry)}
        className={`${diarySectionClass} entry-diary-section--side-by-side min-h-0 flex-col max-md:justify-start md:min-h-[min(100dvh,960px)]`}
      >
        <div
          className={`grid w-full grid-cols-2 items-center gap-5 sm:gap-8 md:gap-24 ${gridOrderClass}`}
        >
          <EntryPhotoColumn>
            {photos.length > 0 ? (
              <PhotoStack urls={photos} {...entryPhotoStackProps(entry)} />
            ) : (
              <div className="entry-photo-print">
                <div className="entry-photo-print__inner entry-photo-gradient relative aspect-[4/5] w-full overflow-hidden">
                  <span className="absolute bottom-4 left-4 bg-white/80 px-2 py-1 font-body text-[11px] uppercase tracking-widest text-stone-500">
                    foto
                  </span>
                </div>
              </div>
            )}
          </EntryPhotoColumn>

          <div className="entry-text-col min-w-0 self-center">
            <EntryEditorialText entry={entry} centered />
          </div>
        </div>
        {entry.texto_abaixo?.trim() ? (
          <p className="entry-quote entry-quote--with-title mt-4 max-w-xl italic text-stone-700 md:mt-10">
            <EntryTextEmphasis text={entry.texto_abaixo} />
          </p>
        ) : null}
        {entry.texto_abaixo_direita?.trim() ? (
          <p className="entry-quote entry-quote--with-title ml-auto mt-4 max-w-xl text-right italic text-stone-700 md:mt-6">
            <EntryTextEmphasis text={entry.texto_abaixo_direita} />
          </p>
        ) : null}
        <EntryPageMarker pageNumber={pageNumber} />
      </article>
    </EntryDateIntro>
  );
}
