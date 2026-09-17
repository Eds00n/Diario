"use client";

import { useState } from "react";
import { PhotoCarousel } from "@/components/PhotoCarousel";

/** Graus de inclinação por posição, pra dar aquele ar de fotos jogadas na mesa. */
const TILTS = [-7, 4, -4, 6, -6, 3, -3] as const;

function isVideoUrl(url: string): boolean {
  return decodeURIComponent(url).toLowerCase().includes(".mp4");
}

/** Mesma técnica de `flatOriginRect` do PhotoStack: rect "achatado", sem a
 * distorção da rotação do polaroid, pra o lightbox abrir do lugar certo. */
function flatOriginRect(el: HTMLElement): DOMRect {
  const rect = el.getBoundingClientRect();
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return new DOMRect(cx - width / 2, cy - height / 2, width, height);
}

/** Carrossel de fotos em molduras polaroid deslizando continuamente da
 * esquerda para a direita — layout de destaque, diferente das demais
 * entradas do diário (que usam PhotoStack). */
export function PolaroidCarouselMarquee({ urls }: { urls: string[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  if (urls.length === 0) return null;

  /** Com poucas fotos (3 ou menos) o loop duplicado repete rápido demais —
   * fica melhor mostrar todas de uma vez, paradas, lado a lado. */
  const isStatic = urls.length <= 3;
  const looped = !isStatic ? [...urls, ...urls] : urls;

  return (
    <div className={`polaroid-marquee ${isStatic ? "polaroid-marquee--static" : ""}`}>
      <div
        className={`polaroid-marquee__track ${!isStatic ? "polaroid-marquee__track--animated" : ""}`}
      >
        {looped.map((url, i) => {
          const realIndex = i % urls.length;
          const isVideo = isVideoUrl(url);
          const tilt = TILTS[realIndex % TILTS.length];
          return (
            <button
              key={`${url}-${i}`}
              type="button"
              className="polaroid-marquee__item polaroid"
              style={{ "--polaroid-tilt": `${tilt}deg` } as React.CSSProperties}
              onClick={(e) => {
                setOriginRect(flatOriginRect(e.currentTarget));
                setOpenIndex(realIndex);
              }}
              aria-label={`Ampliar ${isVideo ? "vídeo" : "foto"} ${realIndex + 1} de ${urls.length}`}
            >
              <span className="polaroid__tape" aria-hidden />
              {isVideo ? (
                <video
                  src={url}
                  className="polaroid__media"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt=""
                  className="polaroid__media"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              )}
            </button>
          );
        })}
      </div>

      {openIndex !== null && (
        <PhotoCarousel
          urls={urls}
          initialIndex={openIndex}
          originRect={originRect}
          slideFit="contain"
          onClosed={() => {
            setOpenIndex(null);
            setOriginRect(null);
          }}
        />
      )}
    </div>
  );
}
