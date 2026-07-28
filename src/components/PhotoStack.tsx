"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { EntryPhotoPrintFrame } from "@/components/EntryPhotoPrintFrame";
import { LoopVideoInView } from "@/components/LoopVideoInView";
import { PhotoCarousel } from "@/components/PhotoCarousel";

function isVideoUrl(url: string): boolean {
  const decoded = decodeURIComponent(url).toLowerCase();
  return decoded.includes(".mp4");
}

type UrlSegment =
  | { kind: "images"; urls: string[] }
  | { kind: "video"; url: string };

function segmentUrls(urls: string[]): UrlSegment[] {
  const segments: UrlSegment[] = [];
  let imageBuffer: string[] = [];

  const flushImages = () => {
    if (imageBuffer.length > 0) {
      segments.push({ kind: "images", urls: imageBuffer });
      imageBuffer = [];
    }
  };

  for (const url of urls) {
    if (isVideoUrl(url)) {
      flushImages();
      segments.push({ kind: "video", url });
    } else {
      imageBuffer.push(url);
    }
  }
  flushImages();
  return segments;
}

/** depthFromFront: 0 = carta da frente */
const DECK_TRANSFORMS = [
  { rotate: -5, x: 0, y: 0 },
  { rotate: -2, x: -12, y: 14 },
  { rotate: 2, x: -22, y: 26 },
  { rotate: 6, x: -32, y: 38 },
] as const;

function StackVideo({
  url,
  prominent = false,
  fill = false,
  prominentMobileLarge = false,
}: {
  url: string;
  prominent?: boolean;
  fill?: boolean;
  prominentMobileLarge?: boolean;
}) {
  if (fill) {
    return (
      <div className="absolute inset-0 h-full w-full overflow-hidden bg-black">
        <LoopVideoInView
          src={url}
          className="h-full w-full object-cover object-center"
        />
      </div>
    );
  }

  const mediaBox = (
    <div
      className={
        prominent
          ? prominentMobileLarge
            ? "relative mx-auto aspect-[4/5] w-full max-w-full overflow-hidden rounded-md max-md:max-h-[min(72vh,620px)] md:max-h-[min(75vh,680px)] md:max-w-[580px]"
            : "relative mx-auto aspect-[4/5] w-full max-h-[min(72vh,680px)] max-w-[580px] overflow-hidden rounded-md"
          : "relative aspect-[4/5] w-full min-w-0 overflow-hidden rounded-md bg-stone-200/40"
      }
    >
      <LoopVideoInView
        src={url}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  );

  return (
    <EntryPhotoPrintFrame
      className={prominent ? "relative w-full" : "w-full min-w-0"}
    >
      {mediaBox}
    </EntryPhotoPrintFrame>
  );
}

const BLUR_IMAGE_CLASS =
  "scale-[1.04] blur-xl saturate-[0.95]";

function coverImageStyle(
  objectPosition?: string,
  objectScale?: number,
): CSSProperties | undefined {
  if (!objectPosition && !objectScale) return undefined;
  const style: CSSProperties = {};
  if (objectPosition) style.objectPosition = objectPosition;
  if (objectScale && objectScale !== 1) {
    style.transform = `scale(${objectScale})`;
  }
  return style;
}

function EyeRevealIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PhotoBlurRevealOverlay({ onReveal }: { onReveal: () => void }) {
  return (
    <div className="photo-blur-reveal-overlay absolute inset-0 z-[5] flex flex-col items-center justify-center gap-3 overflow-hidden rounded-md px-6 text-center text-white">
      <span className="photo-blur-reveal-overlay__icon flex h-[52px] w-[52px] items-center justify-center rounded-full border-[1.5px] border-white/80 text-white">
        <EyeRevealIcon className="h-[22px] w-[22px] text-white" />
      </span>
      <p className="font-body max-w-[240px] text-[13px] font-normal leading-snug tracking-[0.01em] !text-white text-white">
        Imagem sem qualidade
        <span className="block text-[12px] text-white/85">
          não me julgue dona Sâmila
        </span>
      </p>
      <button
        type="button"
        className="font-body mt-0.5 border-0 bg-transparent p-0 text-[14px] font-semibold !text-white transition-opacity hover:opacity-80"
        onClick={(e) => {
          e.stopPropagation();
          onReveal();
        }}
      >
        Ver foto
      </button>
    </div>
  );
}

function StackPhoto({
  url,
  onOpen,
  prominent = false,
  fill = false,
  flushEdges = false,
  prominentMobileLarge = false,
  blurReveal = false,
  objectPosition,
  objectScale,
}: {
  url: string;
  onOpen: () => void;
  prominent?: boolean;
  fill?: boolean;
  flushEdges?: boolean;
  prominentMobileLarge?: boolean;
  blurReveal?: boolean;
  objectPosition?: string;
  objectScale?: number;
}) {
  const [revealed, setRevealed] = useState(!blurReveal);
  const hidden = blurReveal && !revealed;

  const hoverZoomClass =
    objectScale != null
      ? ""
      : "transition-transform duration-300 ease-out group-hover:scale-[1.02]";

  const imageBlurClass = hidden ? BLUR_IMAGE_CLASS : hoverZoomClass;

  const frameStyle = coverImageStyle(
    objectPosition,
    hidden && objectScale ? objectScale * 1.04 : objectScale,
  );

  const blurOverlay = hidden ? (
    <PhotoBlurRevealOverlay onReveal={() => setRevealed(true)} />
  ) : null;
  if (prominent && fill) {
    return (
      <div className="relative h-full w-full min-h-0">
        <button
          type="button"
          className="relative block h-full w-full min-h-0 cursor-zoom-in border-0 bg-transparent p-0 text-left outline-none disabled:cursor-default"
          onClick={() => {
            if (!hidden) onOpen();
          }}
          disabled={hidden}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            draggable={false}
            className={`no-native-drag block h-full w-full object-cover object-center ${imageBlurClass}`}
            style={frameStyle}
          />
        </button>
        {blurOverlay}
      </div>
    );
  }

  if (prominent) {
    return (
      <EntryPhotoPrintFrame className="relative w-full">
        <div className="relative w-full">
          <button
            type="button"
            className="entry-photo-gradient flex w-full cursor-zoom-in justify-center overflow-hidden rounded-[12px] border-0 p-0 text-left outline-none disabled:cursor-default"
            onClick={() => {
              if (!hidden) onOpen();
            }}
            disabled={hidden}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className={
                prominentMobileLarge
                  ? `mx-auto block h-auto w-full max-w-full max-h-[min(72vh,620px)] object-contain sm:max-h-[min(74vh,660px)] md:max-h-[min(75vh,680px)] md:w-auto md:max-w-[580px] ${imageBlurClass}`
                  : `mx-auto block h-auto max-h-[min(46vh,240px)] w-auto max-w-full md:max-h-[min(78vh,760px)] ${imageBlurClass}`
              }
            />
          </button>
          {blurOverlay}
        </div>
      </EntryPhotoPrintFrame>
    );
  }

  const photoButton = (
    <div
      className={`relative w-full min-w-0 overflow-hidden ${
        flushEdges ? "aspect-[3/4]" : "aspect-[4/5]"
      } ${flushEdges ? "" : "rounded-md"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        draggable={false}
        className={`no-native-drag absolute inset-0 h-full w-full object-cover ${imageBlurClass}`}
        style={frameStyle}
      />
      <button
        type="button"
        className="absolute inset-0 z-[1] cursor-zoom-in border-0 bg-transparent p-0 text-left outline-none disabled:cursor-default"
        onClick={() => {
          if (!hidden) onOpen();
        }}
        disabled={hidden}
        aria-label="Ampliar foto"
      />
      {blurOverlay}
    </div>
  );

  if (flushEdges) {
    return photoButton;
  }

  return (
    <EntryPhotoPrintFrame className="w-full min-w-0">
      {photoButton}
    </EntryPhotoPrintFrame>
  );
}

function PhotoPairGrid({
  urls,
  onOpen,
  prominent = false,
  fill = false,
  prominentMobileLarge = false,
  blurReveal = false,
  photoObjectPosition,
  photoObjectScale,
  sideBySide = false,
}: {
  urls: string[];
  onOpen: (indexInSegment: number) => void;
  prominent?: boolean;
  fill?: boolean;
  prominentMobileLarge?: boolean;
  blurReveal?: boolean;
  photoObjectPosition?: string;
  photoObjectScale?: number;
  /** Duas fotos lado a lado (ex.: abaixo do texto). */
  sideBySide?: boolean;
}) {
  return (
    <div
      className={
        fill
          ? "absolute inset-0 grid h-full w-full grid-cols-2 gap-0.5"
          : sideBySide
            ? "grid w-full min-w-0 grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8"
            : "grid w-full min-w-0 grid-cols-1 gap-3"
      }
    >
      {urls.map((url, i) => (
        <div key={`${url}-${i}`} className="min-w-0">
          <StackPhoto
            url={url}
            prominent={prominent}
            fill={fill}
            prominentMobileLarge={prominentMobileLarge}
            blurReveal={blurReveal && i === 0}
            objectPosition={photoObjectPosition}
            objectScale={photoObjectScale}
            onOpen={() => onOpen(i)}
          />
        </div>
      ))}
    </div>
  );
}

function PhotoDeck({
  urls,
  onOpen,
}: {
  urls: string[];
  onOpen: (index: number) => void;
}) {
  const count = urls.length;
  const layerCount = Math.min(4, count);

  const layers = Array.from({ length: layerCount }, (_, depthFromFront) => ({
    depthFromFront,
    photoIndex: depthFromFront,
    url: urls[depthFromFront]!,
  })).sort((a, b) => b.depthFromFront - a.depthFromFront);

  return (
    <button
      type="button"
      className="group relative w-full cursor-zoom-in text-left"
      onClick={() => onOpen(0)}
      aria-label={`Ver ${count} fotos`}
    >
      <div className="relative aspect-[4/5] w-full">
        <div className="absolute inset-0 pl-6 pb-8 pt-2">
          {layers.map(({ depthFromFront, url, photoIndex }) => {
            const t =
              DECK_TRANSFORMS[depthFromFront] ?? DECK_TRANSFORMS[3]!;
            const zIndex = 10 + (layerCount - depthFromFront);

            return (
              <div
                key={`${url}-${depthFromFront}`}
                className="absolute inset-0 pl-6 pb-8 pt-2 transition-transform duration-300 ease-out will-change-transform group-hover:translate-y-[-2px]"
                style={{
                  zIndex,
                  transform: `translate(${t.x}px, ${t.y}px) rotate(${t.rotate}deg)`,
                }}
              >
                <div className="entry-photo-print relative h-full w-full overflow-visible">
                  <div className="entry-photo-print__inner relative h-full w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      draggable={false}
                      className="no-native-drag absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <span
          className="absolute right-1 top-1 z-[50] flex h-9 min-w-9 items-center justify-center rounded-full bg-white px-2 font-body text-[15px] font-medium tabular-nums text-ink shadow-[0_4px_14px_rgba(28,28,26,0.15)] ring-1 ring-black/[0.04]"
          aria-hidden
        >
          {count}
        </span>
      </div>
    </button>
  );
}

export function PhotoStack({
  urls,
  prominent = false,
  fill = false,
  threeColumn = false,
  threeColumnFullBleed = false,
  prominentMobileLarge = false,
  blurReveal = false,
  photoObjectPosition,
  photoObjectScale,
  pairSideBySide = false,
}: {
  urls: string[];
  prominent?: boolean;
  fill?: boolean;
  threeColumn?: boolean;
  threeColumnFullBleed?: boolean;
  /** Fotos importantes no mobile: mídia maior abaixo do texto */
  prominentMobileLarge?: boolean;
  blurReveal?: boolean;
  photoObjectPosition?: string;
  photoObjectScale?: number;
  /** Duas fotos em linha (layout texto acima). */
  pairSideBySide?: boolean;
}) {
  const [carouselIndex, setCarouselIndex] = useState<number | null>(null);

  const segments = useMemo(() => segmentUrls(urls), [urls]);

  const allImageUrls = useMemo(
    () => urls.filter((u) => !isVideoUrl(u)),
    [urls],
  );

  const openAtGlobalIndex = (url: string) => {
    const i = allImageUrls.indexOf(url);
    if (i >= 0) setCarouselIndex(i);
  };

  const openDeck = (segmentUrlsList: string[], indexInSegment: number) => {
    const url = segmentUrlsList[indexInSegment];
    if (url) openAtGlobalIndex(url);
  };

  if (threeColumn && allImageUrls.length > 0) {
    const singleBelow = threeColumnFullBleed && allImageUrls.length === 1;
    return (
      <>
        <div
          className={
            singleBelow
              ? "mx-auto w-full max-w-[640px] sm:max-w-[720px]"
              : threeColumnFullBleed
                ? "grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-1"
                : "grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5"
          }
        >
          {allImageUrls.map((url, i) => {
            const hideOnMobile =
              threeColumnFullBleed &&
              allImageUrls.length === 3 &&
              i !== 1;

            return (
              <div
                key={url}
                className={hideOnMobile ? "hidden sm:block" : undefined}
              >
                <StackPhoto
                  url={url}
                  flushEdges={threeColumnFullBleed}
                  blurReveal={blurReveal && i === 0}
                  onOpen={() => openAtGlobalIndex(url)}
                />
              </div>
            );
          })}
        </div>
        {carouselIndex !== null && (
          <PhotoCarousel
            urls={allImageUrls}
            initialIndex={carouselIndex}
            onClosed={() => setCarouselIndex(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={fill ? "absolute inset-0" : "w-full min-w-0 space-y-4"}>
        {segments.map((segment, segIndex) => {
          if (segment.kind === "video") {
            return (
              <StackVideo
                key={segment.url}
                url={segment.url}
                prominent={prominent}
                fill={fill}
                prominentMobileLarge={prominentMobileLarge}
              />
            );
          }

          if (segment.urls.length >= 3) {
            return (
              <PhotoDeck
                key={`deck-${segIndex}-${segment.urls[0]}`}
                urls={segment.urls}
                onOpen={() => openDeck(segment.urls, 0)}
              />
            );
          }

          if (segment.urls.length === 2) {
            return (
              <PhotoPairGrid
                key={`pair-${segIndex}-${segment.urls[0]}`}
                urls={segment.urls}
                prominent={prominent}
                fill={fill}
                prominentMobileLarge={prominentMobileLarge}
                blurReveal={blurReveal}
                photoObjectPosition={photoObjectPosition}
                photoObjectScale={photoObjectScale}
                sideBySide={pairSideBySide}
                onOpen={(i) => openDeck(segment.urls, i)}
              />
            );
          }

          const single = segment.urls[0];
          if (!single) return null;
          return (
            <StackPhoto
              key={single}
              url={single}
              prominent={prominent}
              fill={fill}
              prominentMobileLarge={prominentMobileLarge}
              blurReveal={blurReveal}
              objectPosition={photoObjectPosition}
              objectScale={photoObjectScale}
              onOpen={() => openAtGlobalIndex(single)}
            />
          );
        })}
      </div>

      {carouselIndex !== null && allImageUrls.length > 0 && (
        <PhotoCarousel
          urls={allImageUrls}
          initialIndex={carouselIndex}
          onClosed={() => setCarouselIndex(null)}
        />
      )}
    </>
  );
}
