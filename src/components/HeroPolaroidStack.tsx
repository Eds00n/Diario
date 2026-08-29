"use client";

import { RevealOnMount } from "@/components/RevealOnMount";
import {
  getHeroImportantPhotos,
  isVideoMediaUrl,
  type HeroPolaroidPhoto,
} from "@/lib/heroImportantPhotos";
import type { Entry } from "@/lib/types";
import type { CSSProperties } from "react";

const FRAME_REVEAL_DELAYS_MS = [60, 220, 380] as const;
const FRAME_HIDDEN: Record<string, string> = {
  "hero-frame-photo--left": "translateY(-50%) translateX(-24px) scale(0.94)",
  "hero-frame-photo--top-right": "translateX(20px) translateY(-16px) scale(0.94)",
  "hero-frame-photo--bottom-right": "translateX(20px) translateY(16px) scale(0.94)",
};
const FRAME_VISIBLE: Record<string, string> = {
  "hero-frame-photo--left": "translateY(-50%) translateX(0) scale(1)",
  "hero-frame-photo--top-right": "translateX(0) translateY(0) scale(1)",
  "hero-frame-photo--bottom-right": "translateX(0) translateY(0) scale(1)",
};

function polaroidMediaStyle(photo: HeroPolaroidPhoto): CSSProperties | undefined {
  if (!photo.objectPosition && !photo.objectScale) return undefined;
  const style: CSSProperties = {};
  if (photo.objectPosition) style.objectPosition = photo.objectPosition;
  if (photo.objectScale && photo.objectScale !== 1) {
    style.transform = `scale(${photo.objectScale})`;
  }
  return style;
}

function PolaroidMedia({ photo }: { photo: HeroPolaroidPhoto }) {
  const style = polaroidMediaStyle(photo);

  if (isVideoMediaUrl(photo.url)) {
    return (
      <video
        src={photo.url}
        className="polaroid__media"
        autoPlay
        loop
        muted
        playsInline
        style={style}
      />
    );
  }

  return (
    <img
      src={photo.url}
      alt=""
      className="polaroid__media"
      decoding="async"
      style={style}
    />
  );
}

export function HeroPolaroidStack({ entries }: { entries: Entry[] }) {
  const photos = getHeroImportantPhotos(entries);

  if (photos.length === 0) return null;

  return (
    <div className="hero-frame" aria-hidden>
      {photos.map((photo, index) => (
        <RevealOnMount
          key={photo.key}
          delayMs={FRAME_REVEAL_DELAYS_MS[index] ?? 380}
          hiddenTransform={FRAME_HIDDEN[photo.slot] ?? FRAME_HIDDEN["hero-frame-photo--left"]}
          visibleTransform={FRAME_VISIBLE[photo.slot] ?? FRAME_VISIBLE["hero-frame-photo--left"]}
          className={`hero-frame-photo ${photo.slot}`}
        >
          <figure className="polaroid">
            <span
              className="polaroid__tape"
              style={{
                transform: `translateX(-50%) rotate(${photo.tapeTilt})`,
              }}
            />
            <PolaroidMedia photo={photo} />
          </figure>
        </RevealOnMount>
      ))}
    </div>
  );
}
