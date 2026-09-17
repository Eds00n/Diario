import type { CSSProperties, ReactNode } from "react";

/** Moldura papel fotográfico — borda branca + sombra suave. */
export function EntryPhotoPrintFrame({
  children,
  className = "",
  innerClassName = "",
  tiltY,
  sway = false,
  swayDeg = -2,
}: {
  children: ReactNode;
  className?: string;
  /** Classes extras pro miolo (`.entry-photo-print__inner`) — ex.: esticar até preencher uma caixa de tamanho fixo. */
  innerClassName?: string;
  /** Graus de rotateY (inclinação 3D estilo foto apoiada de lado). Escala maior no mobile via CSS. */
  tiltY?: number;
  /** "Impressão física" pendurada: rotação 2D fixa + balanço contínuo sutil + fita
   * dourada no topo, em vez da inclinação 3D — usada quando a foto é a única
   * mídia da entrada (sistema de impressões vivo). */
  sway?: boolean;
  /** Graus de rotação 2D base quando `sway` está ativo. */
  swayDeg?: number;
}) {
  if (sway) {
    return (
      <div
        className={`entry-photo-print entry-photo-print--sway relative z-0 overflow-visible shadow-[0_10px_30px_rgba(28,28,26,0.18),0_24px_48px_-10px_rgba(28,28,26,0.14)] ${className}`}
        style={{ "--photo-sway-rotate": `${swayDeg}deg` } as CSSProperties}
      >
        <span className="entry-photo-print__tape" aria-hidden />
        <div className={`entry-photo-print__inner ${innerClassName}`}>{children}</div>
      </div>
    );
  }

  const tiltStyle =
    tiltY != null
      ? ({ "--photo-tilt-y": tiltY, transformStyle: "preserve-3d" } as CSSProperties)
      : undefined;

  return (
    <div
      className={`entry-photo-print relative z-0 overflow-visible shadow-[0_10px_30px_rgba(28,28,26,0.18),0_24px_48px_-10px_rgba(28,28,26,0.14)] ${tiltY != null ? "entry-photo-print--tilt3d" : ""} ${className}`}
      style={tiltStyle}
    >
      {tiltY != null ? <span className="entry-photo-print__tape" aria-hidden /> : null}
      <div className={`entry-photo-print__inner ${innerClassName}`}>{children}</div>
    </div>
  );
}
