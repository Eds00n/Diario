"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { urlMidia } from "@/lib/diario/format";
import type { Midia } from "@/lib/diario/types";

/** true quando o elemento está na tela (com margem). */
export function useEmTela<T extends Element>(margem = "0px", umaVez = false, inicial = false) {
  const ref = useRef<T>(null);
  const [visivel, setVisivel] = useState(inicial);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([e]) => {
        setVisivel(e.isIntersecting);
        if (e.isIntersecting && umaVez) obs.disconnect();
      },
      { rootMargin: margem },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [margem, umaVez]);
  return [ref, visivel] as const;
}

export function Revelar({ children, className = "", atraso = 0 }: { children: ReactNode; className?: string; atraso?: number }) {
  const [ref, visivel] = useEmTela<HTMLDivElement>("0px 0px -8% 0px", true);
  return (
    <div
      ref={ref}
      className={`dv-revelar ${visivel ? "dv-visivel" : ""} ${className}`}
      style={atraso ? { transitionDelay: `${atraso}ms` } : undefined}
    >
      {children}
    </div>
  );
}

type Ajuste = { posicao?: string; inteira?: boolean };

/** Vídeo que toca mudo em loop só enquanto está na tela. */
export function VideoLoop({
  arquivo,
  comSom = false,
  onTempo,
  className = "",
}: {
  arquivo: string;
  comSom?: boolean;
  onTempo?: (atual: number, total: number) => void;
  className?: string;
}) {
  const [ref, visivel] = useEmTela<HTMLVideoElement>("100px");
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (visivel) v.play().catch(() => undefined);
    else v.pause();
  }, [visivel, ref]);
  useEffect(() => {
    const v = ref.current;
    if (v) v.muted = !comSom;
  }, [comSom, ref]);
  return (
    <video
      ref={ref}
      src={`${urlMidia(arquivo)}#t=0.1`}
      muted
      loop
      playsInline
      preload="metadata"
      className={className}
      onTimeUpdate={(e) => onTempo?.(e.currentTarget.currentTime, e.currentTarget.duration || 0)}
    />
  );
}

export function MidiaView({
  midia,
  ajuste,
  alt = "",
  className = "",
}: {
  midia: Midia;
  ajuste?: Ajuste;
  alt?: string;
  className?: string;
}) {
  if (midia.tipo === "video") {
    return <VideoLoop arquivo={midia.arquivo} className={className} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={urlMidia(midia.arquivo)}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={className}
      style={{
        objectPosition: ajuste?.posicao,
        objectFit: ajuste?.inteira ? "contain" : undefined,
        background: ajuste?.inteira ? "#fff" : undefined,
      }}
    />
  );
}

/** Tela cheia para ver as fotos de uma memória (toque na foto). */
export function Visualizador({
  midias,
  inicio,
  onFechar,
}: {
  midias: Midia[];
  inicio: number;
  onFechar: () => void;
}) {
  const [idx, setIdx] = useState(inicio);
  const toque = useRef<number | null>(null);
  const total = midias.length;
  const ir = (d: number) => setIdx((i) => (i + d + total) % total);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % total);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + total) % total);
    };
    window.addEventListener("keydown", tecla);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", tecla);
      document.body.style.overflow = overflow;
    };
  }, [onFechar, total]);

  const m = midias[idx];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Fotos da memória"
      className="dv-fundo-modal fixed inset-0 z-[80] flex flex-col bg-[rgba(20,20,18,0.94)] text-[#f7f4ef]"
      onClick={onFechar}
    >
      <div className="flex items-center justify-between px-5 pt-[max(16px,env(safe-area-inset-top))] pb-3 text-[13px]">
        <span className="tracking-[0.08em]">{total > 1 ? `${idx + 1}/${total}` : ""}</span>
        <button
          type="button"
          aria-label="Fechar"
          onClick={onFechar}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-[22px] font-light"
        >
          ×
        </button>
      </div>
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-6"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (toque.current == null) return;
          const dx = e.changedTouches[0].clientX - toque.current;
          toque.current = null;
          if (Math.abs(dx) > 50 && total > 1) ir(dx < 0 ? 1 : -1);
        }}
      >
        {m.tipo === "video" ? (
          <video
            key={m.arquivo}
            src={urlMidia(m.arquivo)}
            controls
            autoPlay
            playsInline
            className="max-h-full max-w-full"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={m.arquivo} src={urlMidia(m.arquivo)} alt="" className="max-h-full max-w-full object-contain" />
        )}
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => ir(-1)}
              className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-[26px] font-light md:flex"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Próxima"
              onClick={() => ir(1)}
              className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-[26px] font-light md:flex"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}
