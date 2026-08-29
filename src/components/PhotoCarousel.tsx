"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EntryPhotoPrintFrame } from "@/components/EntryPhotoPrintFrame";
import { LoopVideoInView } from "@/components/LoopVideoInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const OVERLAY_MS = 250;
const SHELL_MS = 220;
const SLIDE_MS = 420;
/** Deslize com leve “quique” no fim (overshoot). */
const SLIDE_EASE = "cubic-bezier(0.34, 1.32, 0.64, 1)";
const SLIDE_GAP = 6;
/** Largura de cada slide em relação ao viewport interno (sobra “peek” nas laterais). */
const SLIDE_WIDTH_RATIO = 0.72;
const SLIDE_MAX_WIDTH = 480;
/** Foto única no lightbox: grande, mas sem ocupar a tela inteira */
const SINGLE_SLIDE_MAX_WIDTH = 440;
const SINGLE_SLIDE_WIDTH_RATIO = 0.52;
const SINGLE_SLIDE_MAX_HEIGHT_RATIO = 0.72;
/** Transição "crescendo do lugar de origem até o centro" (FLIP). */
const FLIP_MS = 420;
const FLIP_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Ao fechar: só some transparecendo (não encolhe de volta pra miniatura). */
const CLOSE_FADE_MS = 240;

function isVideoUrl(url: string): boolean {
  const decoded = decodeURIComponent(url).toLowerCase();
  return decoded.includes(".mp4");
}

type CarouselMetrics = {
  viewportWidth: number;
  slideWidth: number;
  slideHeight: number;
};

function clampIndex(i: number, len: number): number {
  return Math.max(0, Math.min(len - 1, i));
}

export function PhotoCarousel({
  urls,
  initialIndex,
  onClosed,
  originRect = null,
  slideFit = "contain",
  slideAspect = 4 / 5,
  objectPosition,
  objectScale,
}: {
  urls: string[];
  initialIndex: number;
  onClosed: () => void;
  /** Posição/tamanho da miniatura clicada — a foto "cresce" dali até o centro. */
  originRect?: DOMRect | null;
  /** "cover": mantém o mesmo recorte/proporção da miniatura. "contain": mostra a imagem inteira. */
  slideFit?: "cover" | "contain";
  /** Proporção largura/altura da miniatura (só usada com slideFit="cover"). */
  slideAspect?: number;
  objectPosition?: string;
  objectScale?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const usingFlip = !reducedMotion && originRect != null;

  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(() =>
    clampIndex(initialIndex, urls.length),
  );
  const [overlayOpacity, setOverlayOpacity] = useState(reducedMotion ? 1 : 0);
  const [shellOpen, setShellOpen] = useState(reducedMotion);
  /** true assim que o fechamento começa — a partir daí o shell só some transparecendo. */
  const [closing, setClosing] = useState(false);
  const [flipTransform, setFlipTransform] = useState<string | null>(null);
  /** Proporção real (largura/altura) da mídia ativa, assim que carrega —
   * usada em modo "contain" pra caixa do slide abraçar o conteúdo em vez de
   * sobrar faixa branca (letterbox) grande de um lado. */
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<CarouselMetrics>({
    viewportWidth: 0,
    slideWidth: 280,
    slideHeight: Math.round(280 * (16 / 9)),
  });

  /** Elemento de mídia do slide ativo — usado pra checar a proporção real
   * assim que possível, mesmo quando já veio do cache (onLoad pode não
   * disparar de novo pra imagem/vídeo já carregado). */
  const activeMediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(
    null,
  );
  const measureRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const navLockRef = useRef(false);
  const navLockTimerRef = useRef<number | null>(null);
  const indexRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragPxRef = useRef(0);
  const didDragRef = useRef(false);
  const draggingRef = useRef(false);
  const flipComputedRef = useRef(false);

  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  indexRef.current = index;

  const measure = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;
    const vw = el.clientWidth;
    const isSingle = urls.length <= 1;

    let slideWidth = isSingle
      ? Math.round(
          Math.min(
            SINGLE_SLIDE_MAX_WIDTH,
            Math.max(260, vw * SINGLE_SLIDE_WIDTH_RATIO),
          ),
        )
      : Math.round(
          Math.min(SLIDE_MAX_WIDTH, Math.max(260, vw * SLIDE_WIDTH_RATIO)),
        );

    const maxHeight = Math.round(
      window.innerHeight * (isSingle ? SINGLE_SLIDE_MAX_HEIGHT_RATIO : 0.78),
    );

    let slideHeight: number;
    if (slideFit === "cover") {
      // Mesma proporção da miniatura — só cresce, sem recortar diferente.
      slideHeight = Math.round(slideWidth / slideAspect);
      if (slideHeight > maxHeight) {
        slideHeight = maxHeight;
        slideWidth = Math.round(slideHeight * slideAspect);
      }
    } else {
      const ratio = naturalRatio ?? (isSingle ? 4 / 5 : 1 / 1.05);
      slideHeight = Math.round(slideWidth / ratio);
      if (slideHeight > maxHeight) {
        slideHeight = maxHeight;
        slideWidth = Math.round(slideHeight * ratio);
      }
    }

    setMetrics({
      viewportWidth: isSingle ? slideWidth : vw,
      slideWidth,
      slideHeight,
    });
  }, [urls.length, slideFit, slideAspect, naturalRatio]);

  useLayoutEffect(() => {
    measure();
  }, [measure, mounted, urls.length]);

  useLayoutEffect(() => {
    const el = activeMediaRef.current;
    if (el instanceof HTMLImageElement && el.complete && el.naturalWidth && el.naturalHeight) {
      setNaturalRatio(el.naturalWidth / el.naturalHeight);
      return;
    }
    if (
      el instanceof HTMLVideoElement &&
      el.readyState >= 1 &&
      el.videoWidth &&
      el.videoHeight
    ) {
      setNaturalRatio(el.videoWidth / el.videoHeight);
      return;
    }
    setNaturalRatio(null);
  }, [index]);

  /** FLIP: mede o retângulo final (sem transform) e calcula a transformação
   * que faz o shell nascer exatamente no lugar/tamanho da miniatura clicada. */
  useLayoutEffect(() => {
    if (!usingFlip || flipComputedRef.current) return;
    const el = shellRef.current;
    if (!el || metrics.viewportWidth === 0) return;
    const finalRect = el.getBoundingClientRect();
    if (finalRect.width === 0 || finalRect.height === 0) return;

    const scaleX = originRect!.width / finalRect.width;
    const scaleY = originRect!.height / finalRect.height;
    const translateX =
      originRect!.left + originRect!.width / 2 - (finalRect.left + finalRect.width / 2);
    const translateY =
      originRect!.top + originRect!.height / 2 - (finalRect.top + finalRect.height / 2);

    flipComputedRef.current = true;
    setFlipTransform(
      `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
    );
  }, [usingFlip, metrics, originRect]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    if (reducedMotion) {
      setOverlayOpacity(1);
      setShellOpen(true);
      return;
    }
    if (usingFlip && flipTransform == null) {
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOverlayOpacity(1);
        setShellOpen(true);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [reducedMotion, usingFlip, flipTransform]);

  const finishClose = useCallback(() => {
    closingRef.current = false;
    onClosed();
  }, [onClosed]);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    if (reducedMotion) {
      finishClose();
      return;
    }

    setOverlayOpacity(0);
    setShellOpen(false);
    setClosing(true);
    window.setTimeout(finishClose, CLOSE_FADE_MS);
  }, [reducedMotion, finishClose]);

  const goToIndex = useCallback(
    (target: number) => {
      if (urls.length <= 1) return;
      if (closingRef.current || navLockRef.current) return;

      const next = clampIndex(target, urls.length);
      setIndex((current) => {
        if (next === current) return current;
        navLockRef.current = true;

        if (navLockTimerRef.current !== null) {
          window.clearTimeout(navLockTimerRef.current);
          navLockTimerRef.current = null;
        }

        if (reducedMotion) {
          navLockRef.current = false;
        } else {
          navLockRef.current = true;
          navLockTimerRef.current = window.setTimeout(() => {
            navLockRef.current = false;
            navLockTimerRef.current = null;
          }, SLIDE_MS);
        }
        return next;
      });
    },
    [urls.length, reducedMotion],
  );

  const goTo = useCallback(
    (delta: number) => {
      goToIndex(indexRef.current + delta);
    },
    [goToIndex],
  );

  const slideStep = metrics.slideWidth + SLIDE_GAP;

  const clampDragDelta = useCallback(
    (dx: number) => {
      const i = indexRef.current;
      if (i <= 0 && dx > 0) return dx * 0.35;
      if (i >= urls.length - 1 && dx < 0) return dx * 0.35;
      return dx;
    },
    [urls.length],
  );

  const clearNavLock = useCallback(() => {
    if (navLockTimerRef.current !== null) {
      window.clearTimeout(navLockTimerRef.current);
      navLockTimerRef.current = null;
    }
    navLockRef.current = false;
  }, []);

  const finishDrag = useCallback(() => {
    const dx = dragPxRef.current;
    dragPxRef.current = 0;
    setDragPx(0);
    setIsDragging(false);
    draggingRef.current = false;
    pointerIdRef.current = null;

    const threshold = Math.min(56, slideStep * 0.18);
    if (Math.abs(dx) < threshold) return;

    if (dx > 0) goToIndex(indexRef.current - 1);
    else goToIndex(indexRef.current + 1);
  }, [goToIndex, slideStep]);

  const onViewportPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (urls.length <= 1 || closingRef.current) return;
    if (e.button !== 0) return;

    clearNavLock();
    e.preventDefault();

    pointerIdRef.current = e.pointerId;
    dragStartXRef.current = e.clientX;
    dragPxRef.current = 0;
    didDragRef.current = false;
    setDragPx(0);
    setIsDragging(true);
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onViewportPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || pointerIdRef.current !== e.pointerId) return;

    e.preventDefault();
    const dx = clampDragDelta(e.clientX - dragStartXRef.current);
    if (Math.abs(dx) > 6) didDragRef.current = true;
    dragPxRef.current = dx;
    setDragPx(dx);
  };

  const onViewportPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    finishDrag();
  };

  const onViewportPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    finishDrag();
  };

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestClose, goTo]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted || urls.length === 0) return null;

  const overlayTransition = reducedMotion
    ? "none"
    : `opacity ${OVERLAY_MS}ms ease`;

  const shellTransition = reducedMotion
    ? "none"
    : `opacity ${SHELL_MS}ms ease, transform ${SHELL_MS}ms ease`;

  const flipShellTransition =
    flipTransform != null ? `transform ${FLIP_MS}ms ${FLIP_EASE}` : "none";

  const trackTransition = reducedMotion
    ? "none"
    : `transform ${SLIDE_MS}ms ${SLIDE_EASE}`;

  const slideTransition = reducedMotion
    ? "none"
    : `opacity ${SLIDE_MS * 0.85}ms ${SLIDE_EASE}, filter ${SLIDE_MS * 0.85}ms ease, transform ${SLIDE_MS}ms ${SLIDE_EASE}`;

  const { viewportWidth, slideWidth, slideHeight } = metrics;
  const trackOffset =
    viewportWidth > 0
      ? viewportWidth / 2 -
        index * (slideWidth + SLIDE_GAP) -
        slideWidth / 2
      : 0;

  const shellStyle: React.CSSProperties = closing
    ? {
        opacity: 0,
        transform: "translate(0px, 0px) scale(0.98)",
        transition: `opacity ${CLOSE_FADE_MS}ms ease, transform ${CLOSE_FADE_MS}ms ease`,
      }
    : usingFlip
      ? {
          opacity: 1,
          transform: shellOpen ? "translate(0px, 0px) scale(1, 1)" : (flipTransform ?? "none"),
          transition: flipShellTransition,
        }
      : {
          opacity: shellOpen ? 1 : 0,
          transform: shellOpen ? "scale(1)" : "scale(0.96)",
          transition: shellTransition,
        };

  return createPortal(
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label="Galeria de fotos"
    >
      <div
        className="absolute inset-0 bg-black/88"
        style={{
          opacity: overlayOpacity,
          transition: overlayTransition,
        }}
        onClick={requestClose}
        aria-hidden
      />

      <div className="pointer-events-none relative flex h-full w-full items-center justify-center p-4 sm:p-8">
        <div className="pointer-events-auto relative z-[101] flex w-full max-w-6xl flex-col items-center px-1 sm:px-2">
          <div ref={shellRef} className="flex w-full items-center justify-center" style={shellStyle}>
            <div ref={measureRef} className="relative w-full min-w-0">
            <div
              ref={viewportRef}
              className={`no-native-drag relative touch-none overflow-hidden select-none ${
                urls.length <= 1 ? "mx-auto" : "w-full"
              }`}
              style={{
                width: urls.length <= 1 ? slideWidth : undefined,
                height: slideHeight,
              }}
              onDragStart={(e) => e.preventDefault()}
              onPointerDownCapture={onViewportPointerDown}
              onPointerMoveCapture={onViewportPointerMove}
              onPointerUpCapture={onViewportPointerUp}
              onPointerCancelCapture={onViewportPointerCancel}
            >
              <button
                type="button"
                aria-label="Fechar"
                className="pointer-events-auto absolute right-2 top-2 z-[102] flex h-9 w-9 items-center justify-center border-0 bg-transparent p-0 text-xl leading-none text-white shadow-[0_1px_4px_rgba(0,0,0,0.55)] transition-opacity hover:opacity-80 sm:right-3 sm:top-3 sm:h-10 sm:w-10 sm:text-2xl"
                onClick={requestClose}
              >
                ×
              </button>
              <div
                className="flex h-full will-change-transform"
                style={{
                  gap: SLIDE_GAP,
                  transform: `translateX(${trackOffset + dragPx}px)`,
                  transition: isDragging ? "none" : trackTransition,
                }}
              >
                {urls.map((url, i) => {
                  const isActive = i === index;
                  const isVideo = isVideoUrl(url);
                  return (
                    <button
                      key={`${url}-${i}`}
                      type="button"
                      aria-label={
                        isActive
                          ? `${isVideo ? "Vídeo" : "Foto"} ${i + 1} de ${urls.length}`
                          : `Ir para ${i + 1}`
                      }
                      aria-current={isActive ? "true" : undefined}
                      className="relative shrink-0 overflow-hidden border-0 bg-transparent p-0 shadow-none outline-none ring-0"
                      style={{
                        width: slideWidth,
                        height: slideHeight,
                        opacity: isActive ? 1 : 0.65,
                        filter: isActive ? "none" : "brightness(0.55)",
                        transform:
                          urls.length <= 1
                            ? "scale(1)"
                            : isActive
                              ? "scale(1.02)"
                              : "scale(0.98)",
                        transition: isDragging ? "none" : slideTransition,
                        cursor: isActive ? "default" : "pointer",
                      }}
                      onClick={() => {
                        if (didDragRef.current) return;
                        if (!isActive) goToIndex(i);
                      }}
                      onDragStart={(e) => e.preventDefault()}
                    >
                      <EntryPhotoPrintFrame
                        className="relative h-full w-full"
                        innerClassName="relative h-full"
                      >
                        {isVideo ? (
                          <LoopVideoInView
                            ref={isActive ? (el) => { activeMediaRef.current = el; } : undefined}
                            src={url}
                            className={`pointer-events-none absolute inset-0 h-full w-full ${
                              slideFit === "cover" ? "object-cover" : "object-contain"
                            }`}
                            onLoadedMetadata={(e) => {
                              if (!isActive || slideFit === "cover") return;
                              const v = e.currentTarget;
                              if (v.videoWidth && v.videoHeight) {
                                setNaturalRatio(v.videoWidth / v.videoHeight);
                              }
                            }}
                          />
                        ) : (
                          <Image
                            ref={isActive ? (el) => { activeMediaRef.current = el; } : undefined}
                            src={url}
                            alt=""
                            fill
                            draggable={false}
                            className={`pointer-events-none select-none ${
                              slideFit === "cover" ? "object-cover" : "object-contain"
                            }`}
                            style={
                              slideFit === "cover"
                                ? {
                                    objectPosition: objectPosition ?? undefined,
                                    transform:
                                      objectScale && objectScale !== 1
                                        ? `scale(${objectScale})`
                                        : undefined,
                                  }
                                : undefined
                            }
                            sizes="400px"
                            unoptimized
                            priority={Math.abs(i - index) <= 1}
                            onLoad={(e) => {
                              if (!isActive || slideFit === "cover") return;
                              const img = e.currentTarget;
                              if (img.naturalWidth && img.naturalHeight) {
                                setNaturalRatio(img.naturalWidth / img.naturalHeight);
                              }
                            }}
                          />
                        )}
                      </EntryPhotoPrintFrame>
                    </button>
                  );
                })}
              </div>
            </div>
            </div>
          </div>

          {urls.length > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                aria-label="Anterior"
                disabled={index <= 0}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:pointer-events-none disabled:opacity-30"
                onClick={() => goTo(-1)}
              >
                ‹
              </button>
              <div className="flex items-center justify-center gap-2">
                {urls.map((url, i) => (
                  <button
                    key={`dot-${url}-${i}`}
                    type="button"
                    aria-label={`Ir para ${i + 1}`}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      i === index ? "bg-white" : "bg-white/35 hover:bg-white/55"
                    }`}
                    onClick={() => goToIndex(i)}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Próximo"
                disabled={index >= urls.length - 1}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:pointer-events-none disabled:opacity-30"
                onClick={() => goTo(1)}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
