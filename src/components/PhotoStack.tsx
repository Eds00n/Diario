"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { EntryPhotoPrintFrame } from "@/components/EntryPhotoPrintFrame";
import { LoopVideoInView } from "@/components/LoopVideoInView";
import { PhotoCarousel } from "@/components/PhotoCarousel";

/** Graus extras (0-4) somados à base, só pra variar levemente entre fotos. */
function extraTiltForUrl(url: string): number {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash * 31 + url.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 5;
}

/** Foto à direita inclina pra esquerda (rotateY negativo) e vice-versa. */
function tiltYForUrl(
  url: string,
  photoOnRight: boolean,
  baseMagnitude = 8,
): number {
  const magnitude = baseMagnitude + extraTiltForUrl(url);
  return photoOnRight ? -magnitude : magnitude;
}

function isVideoUrl(url: string): boolean {
  const decoded = decodeURIComponent(url).toLowerCase();
  return decoded.includes(".mp4");
}

/** Rect "achatado" do elemento clicado — ignora a distorção de perspectiva
 * de um ancestral com rotateY (tilt 3D do polaroid), usando o centro
 * projetado (aprox. igual ao centro real pros ângulos que usamos) mas a
 * largura/altura de layout real (offsetWidth/offsetHeight, que o CSS
 * transform não afeta). Sem isso o FLIP nasce com tamanho/posição errados
 * e "salta" ao abrir. */
function flatOriginRect(el: HTMLElement): DOMRect {
  const rect = el.getBoundingClientRect();
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return new DOMRect(cx - width / 2, cy - height / 2, width, height);
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

function StackVideo({
  url,
  prominent = false,
  fill = false,
  prominentMobileLarge = false,
  onOpen,
}: {
  url: string;
  prominent?: boolean;
  fill?: boolean;
  prominentMobileLarge?: boolean;
  onOpen: (rect: DOMRect) => void;
}) {
  const openButton = (
    <button
      type="button"
      className="absolute inset-0 z-[1] cursor-zoom-in border-0 bg-transparent p-0 text-left outline-none"
      onClick={(e) => onOpen(flatOriginRect(e.currentTarget))}
      aria-label="Ampliar vídeo"
    />
  );

  if (fill) {
    return (
      <div className="absolute inset-0 h-full w-full overflow-hidden bg-black">
        <LoopVideoInView
          src={url}
          className="entry-photo-kenburns h-full w-full object-cover object-center"
        />
        {openButton}
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
      {openButton}
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
    <button
      type="button"
      onClick={onReveal}
      className="photo-blur-reveal-overlay absolute inset-0 z-[5] flex w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-md border-0 bg-transparent px-2 text-center text-white sm:gap-3 sm:px-6"
    >
      <span className="photo-blur-reveal-overlay__icon hidden h-[52px] w-[52px] items-center justify-center rounded-full border-[1.5px] border-white/80 text-white sm:flex">
        <EyeRevealIcon className="h-[22px] w-[22px] text-white" />
      </span>
      <p className="font-body max-w-[92%] text-[10px] font-normal leading-snug tracking-[0.01em] text-white sm:max-w-[240px] sm:text-[13px]">
        Imagem sem qualidade
        <span className="block text-[9px] text-white/85 sm:text-[12px]">
          não me julgue dona Sâmila
        </span>
      </p>
      <span className="font-body mt-0.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-80 sm:text-[14px]">
        Ver foto
      </span>
    </button>
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
  photoOnRight = false,
  tiltMagnitude = 8,
  noCrop = false,
  noTilt = false,
  singlePrint = false,
}: {
  url: string;
  onOpen: (rect: DOMRect) => void;
  prominent?: boolean;
  fill?: boolean;
  flushEdges?: boolean;
  prominentMobileLarge?: boolean;
  blurReveal?: boolean;
  objectPosition?: string;
  objectScale?: number;
  /** Lado em que a foto fica no layout texto+foto (define a direção da inclinação 3D). */
  photoOnRight?: boolean;
  /** Graus base da inclinação 3D (antes da variação por foto). */
  tiltMagnitude?: number;
  /** Mostra a foto inteira (object-contain), sem forçar o recorte [4/5] — pra proporções incomuns. */
  noCrop?: boolean;
  /** Sem inclinação 3D (ex.: foto sozinha centralizada, sem texto ao lado). */
  noTilt?: boolean;
  /** Única mídia da entrada: "impressão física" pendurada (fita + balanço
   * contínuo) em vez da inclinação 3D usada em pares/pilhas. */
  singlePrint?: boolean;
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
          onClick={(e) => {
            if (!hidden) onOpen(flatOriginRect(e.currentTarget));
          }}
          disabled={hidden}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            draggable={false}
            loading="lazy"
            decoding="async"
            className={`no-native-drag entry-photo-kenburns block h-full w-full object-cover object-center ${imageBlurClass}`}
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
            onClick={(e) => {
              if (!hidden) onOpen(flatOriginRect(e.currentTarget));
            }}
            disabled={hidden}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              loading="lazy"
              decoding="async"
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

  if (noCrop) {
    return (
      <EntryPhotoPrintFrame
        className="w-full min-w-0"
        sway={singlePrint && !noTilt}
        tiltY={noTilt ? undefined : tiltYForUrl(url, photoOnRight, tiltMagnitude)}
      >
        <button
          type="button"
          className="entry-photo-gradient flex w-full cursor-zoom-in justify-center overflow-hidden rounded-[4px] border-0 p-0 text-left outline-none disabled:cursor-default"
          onClick={(e) => {
            if (!hidden) onOpen(flatOriginRect(e.currentTarget));
          }}
          disabled={hidden}
          aria-label="Ampliar foto"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            loading="lazy"
            decoding="async"
            className={`block h-auto w-full max-h-[70vh] object-contain ${imageBlurClass}`}
          />
        </button>
        {blurOverlay}
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
        loading="lazy"
        decoding="async"
        className={`no-native-drag absolute inset-0 h-full w-full object-cover ${imageBlurClass}`}
        style={frameStyle}
      />
      <button
        type="button"
        className="absolute inset-0 z-[1] cursor-zoom-in border-0 bg-transparent p-0 text-left outline-none disabled:cursor-default"
        onClick={(e) => {
          if (!hidden) onOpen(flatOriginRect(e.currentTarget));
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
    <EntryPhotoPrintFrame
      className="w-full min-w-0"
      sway={singlePrint && !noTilt}
      tiltY={noTilt ? undefined : tiltYForUrl(url, photoOnRight, tiltMagnitude)}
    >
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
  noCrop = false,
  photoOnRight = false,
}: {
  urls: string[];
  onOpen: (indexInSegment: number, rect: DOMRect) => void;
  prominent?: boolean;
  fill?: boolean;
  prominentMobileLarge?: boolean;
  blurReveal?: boolean;
  photoObjectPosition?: string;
  photoObjectScale?: number;
  /** Duas fotos lado a lado (ex.: abaixo do texto). */
  sideBySide?: boolean;
  /** Mostra as fotos inteiras (object-contain), sem recortar. */
  noCrop?: boolean;
  /** Lado da coluna no layout texto+foto (define a direção da inclinação 3D quando empilhadas). */
  photoOnRight?: boolean;
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
            noCrop={noCrop}
            photoOnRight={sideBySide ? i === urls.length - 1 : photoOnRight}
            tiltMagnitude={sideBySide ? 3 : 8}
            onOpen={(rect) => onOpen(i, rect)}
          />
        </div>
      ))}
    </div>
  );
}

/** Graus de rotação por posição — impressões "jogadas" numa fita, não perfeitamente alinhadas. */
const DECK_TILTS = [-1.8, 1.6, -1, 2.2, -1.5, 1.8] as const;

/** 3+ fotos (ou foto+vídeo): fita de impressões deslizando sozinha, cada uma
 * abrindo a galeria em tela cheia no índice certo ao tocar. */
function PhotoDeck({
  urls,
  onOpen,
}: {
  urls: string[];
  onOpen: (index: number, rect: DOMRect) => void;
}) {
  const looped = [...urls, ...urls];

  return (
    <div className="entry-photo-deck">
      <div className="entry-photo-deck__track">
        {looped.map((url, i) => {
          const realIndex = i % urls.length;
          const isVideo = isVideoUrl(url);
          const tilt = DECK_TILTS[realIndex % DECK_TILTS.length];
          return (
            <button
              key={`${url}-${i}`}
              type="button"
              className="entry-photo-deck__item entry-photo-print entry-photo-print--sway"
              style={{ "--photo-sway-rotate": `${tilt}deg` } as CSSProperties}
              onClick={(e) => onOpen(realIndex, flatOriginRect(e.currentTarget))}
              aria-label={`Ver ${isVideo ? "vídeo" : "foto"} ${realIndex + 1} de ${urls.length}`}
            >
              <span className="entry-photo-print__tape" aria-hidden />
              <div className="entry-photo-print__inner entry-photo-deck__media">
                {isVideo ? (
                  <>
                    <video src={url} muted loop autoPlay playsInline />
                    <span className="entry-photo-deck__play" aria-hidden />
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" loading="lazy" decoding="async" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
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
  photoOnRight = false,
  noCrop = false,
  stackVertical = false,
  noTilt = false,
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
  /** Lado da foto no layout texto+foto (define a direção da inclinação 3D). */
  photoOnRight?: boolean;
  /** Mostra a foto inteira (object-contain), sem recortar — pra proporções incomuns (ex.: print de texto). */
  noCrop?: boolean;
  /** 3+ fotos empilhadas verticalmente (todas visíveis), em vez do baralho padrão. */
  stackVertical?: boolean;
  /** Sem inclinação 3D (ex.: foto sozinha centralizada, sem texto ao lado). */
  noTilt?: boolean;
}) {
  const [carouselIndex, setCarouselIndex] = useState<number | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  const segments = useMemo(() => segmentUrls(urls), [urls]);

  const allImageUrls = useMemo(
    () => urls.filter((u) => !isVideoUrl(u)),
    [urls],
  );

  /** Todas as mídias (fotos + vídeos), na ordem original — usada quando o
   * segmento pode conter vídeo (galeria padrão da entrada). */
  const allMediaUrls = urls;

  const closeCarousel = () => {
    setCarouselIndex(null);
    setOriginRect(null);
  };

  const openImageIndex = (url: string, rect: DOMRect) => {
    const i = allImageUrls.indexOf(url);
    if (i >= 0) {
      setCarouselIndex(i);
      setOriginRect(rect);
    }
  };

  const openAtGlobalIndex = (url: string, rect: DOMRect) => {
    const i = allMediaUrls.indexOf(url);
    if (i >= 0) {
      setCarouselIndex(i);
      setOriginRect(rect);
    }
  };

  const openDeck = (
    segmentUrlsList: string[],
    indexInSegment: number,
    rect: DOMRect,
  ) => {
    const url = segmentUrlsList[indexInSegment];
    if (url) openAtGlobalIndex(url, rect);
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
                  onOpen={(rect) => openImageIndex(url, rect)}
                />
              </div>
            );
          })}
        </div>
        {carouselIndex !== null && (
          <PhotoCarousel
            urls={allImageUrls}
            initialIndex={carouselIndex}
            originRect={originRect}
            slideFit="contain"
            onClosed={closeCarousel}
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
                onOpen={(rect) => openAtGlobalIndex(segment.url, rect)}
              />
            );
          }

          if (segment.urls.length >= 3) {
            if (stackVertical) {
              return (
                <div key={`stack-${segIndex}-${segment.urls[0]}`} className="w-full min-w-0 space-y-4">
                  {segment.urls.map((url, i) => (
                    <StackPhoto
                      key={url}
                      url={url}
                      noCrop={noCrop}
                      photoOnRight={photoOnRight}
                      noTilt
                      onOpen={(rect) => openDeck(segment.urls, i, rect)}
                    />
                  ))}
                </div>
              );
            }
            return (
              <PhotoDeck
                key={`deck-${segIndex}-${segment.urls[0]}`}
                urls={segment.urls}
                onOpen={(i, rect) => openDeck(segment.urls, i, rect)}
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
                noCrop={noCrop}
                photoOnRight={photoOnRight}
                onOpen={(i, rect) => openDeck(segment.urls, i, rect)}
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
              photoOnRight={photoOnRight}
              noCrop={noCrop}
              noTilt={noTilt}
              singlePrint={!prominent}
              onOpen={(rect) => openAtGlobalIndex(single, rect)}
            />
          );
        })}
      </div>

      {carouselIndex !== null && allMediaUrls.length > 0 && (
        <PhotoCarousel
          urls={allMediaUrls}
          initialIndex={carouselIndex}
          originRect={originRect}
          slideFit="contain"
          objectPosition={photoObjectPosition}
          objectScale={photoObjectScale}
          onClosed={closeCarousel}
        />
      )}
    </>
  );
}
