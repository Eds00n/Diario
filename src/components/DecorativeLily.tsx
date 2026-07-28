import Image from "next/image";
import type { CSSProperties } from "react";
import { assetPath } from "@/lib/asset-path";

export type LilyPosition = "top-right" | "left" | "bottom-right";

type DecorativeLilyProps = {
  position: LilyPosition;
  size: number;
  opacity: number;
  rotate?: number;
  /** Primeira dobra: carrega com priority (sem lazy) */
  priority?: boolean;
  className?: string;
};

const POSITION_CLASSES: Record<LilyPosition, string> = {
  "top-right":
    "top-4 -right-6 sm:top-8 sm:-right-12 md:top-[30px] md:-right-14",
  left: "top-[720px] -left-10 sm:top-[820px] sm:-left-12 md:top-[880px] md:-left-16",
  "bottom-right":
    "top-[1180px] -right-8 sm:top-[1320px] sm:-right-12 md:top-[1480px] md:-right-10 max-md:origin-bottom-right md:origin-center",
};

const LILY_SRC = assetPath("/images/lirio.jpg");

export function DecorativeLily({
  position,
  size,
  opacity,
  rotate = 0,
  priority = false,
  className = "",
}: DecorativeLilyProps) {
  const mobileSize = Math.round(size * 0.6);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-0 h-[var(--lily-size-mobile)] w-[var(--lily-size-mobile)] md:h-[var(--lily-size)] md:w-[var(--lily-size)] ${POSITION_CLASSES[position]} ${className}`}
      style={
        {
          opacity,
          ["--lily-size" as string]: `${size}px`,
          ["--lily-size-mobile" as string]: `${mobileSize}px`,
        } as CSSProperties
      }
    >
      <div
        className="h-full w-full"
        style={{
          transform: rotate ? `rotate(${rotate}deg)` : undefined,
        }}
      >
        <div
          className="lily-photo-mask relative h-full w-full"
          style={{
            clipPath: "ellipse(78% 82% at 50% 48%)",
          }}
        >
          <Image
            src={LILY_SRC}
            alt=""
            width={size}
            height={size}
            sizes={`(max-width: 768px) ${mobileSize}px, ${size}px`}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className="lily-photo-image h-full w-full object-cover object-center"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
