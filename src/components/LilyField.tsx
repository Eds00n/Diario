"use client";

import { useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useTimelineBackgroundOptional } from "@/components/TimelineBackground";
import { assetPath } from "@/lib/asset-path";

const DEFAULT_FUNDO = assetPath("/images/fundo-lirios.png");
const MOBILE_FUNDO = assetPath("/images/fundo-lirios-mobile.png");
const IMMERSIVE_FUNDO = assetPath("/images/fundo-lirios-namorados.png");
const IMMERSIVE_MOBILE_FUNDO = assetPath("/images/fundo-lirios-namorados-mobile.png");
const IMMERSIVE_FADE_MS = 1650;
const IMMERSIVE_FADE_EASE = "cubic-bezier(0.16, 1, 0.28, 1)";

function immersiveMobileSrc(desktopSrc: string): string {
  if (desktopSrc.includes("fundo-lirios-namorados")) {
    return IMMERSIVE_MOBILE_FUNDO;
  }
  return desktopSrc.replace(/(\.[a-z]+)$/i, "-mobile$1");
}

function LilyBackgroundImage({
  src,
  opacity,
  transition,
  variant = "desktop",
}: {
  src: string;
  opacity: number;
  transition: string;
  variant?: "desktop" | "mobile" | "all";
}) {
  const frameClass =
    variant === "mobile"
      ? "absolute inset-0 md:hidden"
      : variant === "all"
        ? "absolute inset-0"
        : "absolute inset-0 max-md:hidden";

  return (
    <div className={frameClass}>
      {/* img nativo: next/image remove o basePath (/Diario) no GitHub Pages */}
      <img
        src={src}
        alt=""
        decoding="async"
        className={
          variant === "mobile"
            ? "h-full w-full object-cover object-top"
            : "h-full w-full object-cover object-center"
        }
        style={{
          opacity,
          transition,
        }}
      />
    </div>
  );
}

/** Fundo fixo da timeline; crossfade para fundo imersivo quando uma entrada pede. */
export function LilyField() {
  const reducedMotion = usePrefersReducedMotion();
  const ctx = useTimelineBackgroundOptional();
  const immersiveUrl = ctx?.immersiveUrl ?? null;
  const showImmersive = !!immersiveUrl;
  const lastImmersiveSrc = useRef(IMMERSIVE_FUNDO);
  const lastImmersiveMobileSrc = useRef(IMMERSIVE_MOBILE_FUNDO);
  if (immersiveUrl) {
    lastImmersiveSrc.current = immersiveUrl;
    lastImmersiveMobileSrc.current = immersiveMobileSrc(immersiveUrl);
  }

  const transitionMs = reducedMotion ? 0 : IMMERSIVE_FADE_MS;
  const fadeTransition = transitionMs
    ? `opacity ${transitionMs}ms ${IMMERSIVE_FADE_EASE}`
    : "none";

  const defaultOpacity = showImmersive ? 0 : 0.92;
  const immersiveOpacity = showImmersive ? 0.95 : 0;
  const veilOpacity = showImmersive ? 0.22 : 1;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 min-h-[100dvh] overflow-hidden bg-[#f3f1eb] md:bg-[#f3f1eb]"
      aria-hidden
    >
      <LilyBackgroundImage
        src={MOBILE_FUNDO}
        opacity={defaultOpacity}
        transition={fadeTransition}
        variant="mobile"
      />
      <LilyBackgroundImage
        src={DEFAULT_FUNDO}
        opacity={defaultOpacity}
        transition={fadeTransition}
        variant="desktop"
      />
      <LilyBackgroundImage
        src={lastImmersiveMobileSrc.current}
        opacity={immersiveOpacity}
        transition={fadeTransition}
        variant="mobile"
      />
      <LilyBackgroundImage
        src={lastImmersiveSrc.current}
        opacity={immersiveOpacity}
        transition={fadeTransition}
        variant="desktop"
      />
      <div
        className="absolute inset-0 bg-bg/25 max-md:bg-bg/12 md:bg-bg/35"
        style={{
          opacity: veilOpacity,
          transition: fadeTransition,
        }}
      />
    </div>
  );
}
