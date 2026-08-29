import type { CSSProperties, ReactNode } from "react";

/** Moldura papel fotográfico — borda branca + sombra suave. */
export function EntryPhotoPrintFrame({
  children,
  className = "",
  innerClassName = "",
  tiltY,
}: {
  children: ReactNode;
  className?: string;
  /** Classes extras pro miolo (`.entry-photo-print__inner`) — ex.: esticar até preencher uma caixa de tamanho fixo. */
  innerClassName?: string;
  /** Graus de rotateY (inclinação 3D estilo foto apoiada de lado). Escala maior no mobile via CSS. */
  tiltY?: number;
}) {
  const tiltStyle =
    tiltY != null
      ? ({ "--photo-tilt-y": tiltY, transformStyle: "preserve-3d" } as CSSProperties)
      : undefined;

  return (
    <div
      className={`entry-photo-print relative z-0 overflow-visible shadow-[0_10px_30px_rgba(28,28,26,0.18),0_24px_48px_-10px_rgba(28,28,26,0.14)] ${tiltY != null ? "entry-photo-print--tilt3d" : ""} ${className}`}
      style={tiltStyle}
    >
      <div className={`entry-photo-print__inner ${innerClassName}`}>{children}</div>
    </div>
  );
}
