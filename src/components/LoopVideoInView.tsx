"use client";

import { useEffect, useRef, type SyntheticEvent } from "react";

export function LoopVideoInView({
  src,
  className = "h-full w-full object-cover",
  onLoadedMetadata,
}: {
  src: string;
  className?: string;
  onLoadedMetadata?: (e: SyntheticEvent<HTMLVideoElement>) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.play().catch(() => {
            /* autoplay bloqueado até interação */
          });
        } else {
          el.pause();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      className={className}
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden
      onLoadedMetadata={onLoadedMetadata}
    />
  );
}
