"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
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
  return (
    <div
      className={
        fill
          ? "absolute inset-0 h-full w-full overflow-hidden bg-black"
          : `relative w-full overflow-hidden rounded-2xl ${
              prominent
                ? prominentMobileLarge
                  ? "relative mx-auto aspect-[4/5] w-full max-w-full max-md:max-h-[min(78vh,680px)] md:max-h-[min(78vh,760px)] md:max-w-[760px]"
                  : "relative mx-auto aspect-[4/5] max-h-[min(78vh,760px)] max-w-[760px]"
                : "entry-photo-gradient entry-photo-grain relative aspect-[4/5]"
            }`
      }
    >
      <LoopVideoInView
        src={url}
        className="h-full w-full object-cover object-center"
      />
    </div>
  );
}

const BLUR_IMAGE_CLASS = "scale-[1.08] blur-2xl brightness-[0.75] saturate-[0.85]";

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
    <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-black/25 px-6 text-center">
      <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-[1.5px] border-white/90 text-white">
        <EyeRevealIcon className="h-[22px] w-[22px]" />
      </span>
      <p className="font-body max-w-[240px] text-[13px] font-normal leading-snug tracking-[0.01em] text-white">
        Imagem sem qualidade
        <span className="block text-[12px] text-white/70">
          não me julgue dona Sâmila
        </span>
      </p>
      <button
        type="button"
        className="font-body mt-0.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-80"
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
}: {
  url: string;
  onOpen: () => void;
  prominent?: boolean;
  fill?: boolean;
  flushEdges?: boolean;
  prominentMobileLarge?: boolean;
  blurReveal?: boolean;
}) {
  const [revealed, setRevealed] = useState(!blurReveal);
  const hidden = blurReveal && !revealed;

  const imageBlurClass = hidden
    ? BLUR_IMAGE_CLASS
    : "transition-transform duration-300 ease-out group-hover:scale-[1.02]";

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
          />
        </button>
        {blurOverlay}
      </div>
    );
  }

  if (prominent) {
    return (
      <div className="relative w-full">
        <button
          type="button"
          className="entry-photo-gradient flex w-full cursor-zoom-in justify-center overflow-hidden rounded-2xl border-0 p-0 text-left outline-none disabled:cursor-default"
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
                ? `mx-auto block h-auto w-full max-w-full max-h-[min(78vh,680px)] object-contain md:max-h-[min(78vh,760px)] md:w-auto ${imageBlurClass}`
                : `mx-auto block h-auto max-h-[min(46vh,240px)] w-auto max-w-full md:max-h-[min(78vh,760px)] ${imageBlurClass}`
            }
          />
        </button>
        {blurOverlay}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${
        flushEdges ? "aspect-[3/4]" : "aspect-[4/5]"
      }`}
    >
      <button
        type="button"
        className={`entry-photo-gradient entry-photo-grain group relative h-full w-full cursor-zoom-in overflow-hidden text-left ${
          flushEdges ? "rounded-none" : "rounded-2xl"
        } disabled:cursor-default`}
        onClick={() => {
          if (!hidden) onOpen();
        }}
        disabled={hidden}
      >
        <Image
          src={url}
          alt=""
          fill
          className={`object-cover ${imageBlurClass}`}
          sizes={
            flushEdges
              ? "(max-width: 640px) 100vw, 33vw"
              : "(max-width: 760px) 100vw, 480px"
          }
          unoptimized
        />
      </button>
      {blurOverlay}
    </div>
  );
}

function PhotoPairGrid({
  urls,
  onOpen,
  prominent = false,
  fill = false,
  prominentMobileLarge = false,
  blurReveal = false,
}: {
  urls: string[];
  onOpen: (indexInSegment: number) => void;
  prominent?: boolean;
  fill?: boolean;
  prominentMobileLarge?: boolean;
  blurReveal?: boolean;
}) {
  return (
    <div
      className={
        fill
          ? "absolute inset-0 grid h-full grid-cols-2 gap-0.5"
          : "grid grid-cols-2 gap-3 sm:gap-4"
      }
    >
      {urls.map((url, i) => (
        <StackPhoto
          key={`${url}-${i}`}
          url={url}
          prominent={prominent}
          fill={fill}
          prominentMobileLarge={prominentMobileLarge}
          blurReveal={blurReveal && i === 0}
          onOpen={() => onOpen(i)}
        />
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
                <div className="entry-photo-grain relative h-full w-full overflow-hidden rounded-2xl bg-[#f2f1ec] shadow-[0_8px_24px_rgba(28,28,26,0.12)] ring-1 ring-black/[0.06]">
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 760px) 100vw, 480px"
                    unoptimized
                    priority={photoIndex === 0}
                  />
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
}: {
  urls: string[];
  prominent?: boolean;
  fill?: boolean;
  threeColumn?: boolean;
  threeColumnFullBleed?: boolean;
  /** Fotos importantes no mobile: mídia maior abaixo do texto */
  prominentMobileLarge?: boolean;
  blurReveal?: boolean;
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
      <div className={fill ? "absolute inset-0" : "space-y-4"}>
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
