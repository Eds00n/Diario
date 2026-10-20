"use client";

import { useEffect } from "react";

export type TipoConfirmacao = "descartar" | "excluir";

const TEXTOS: Record<TipoConfirmacao, { titulo: string; texto: string; sim: string; nao: string; perigo: boolean }> = {
  descartar: {
    titulo: "Descartar essa memória?",
    texto: "O que você escreveu e as fotos escolhidas não serão guardados.",
    sim: "Descartar",
    nao: "Continuar escrevendo",
    perigo: false,
  },
  excluir: {
    titulo: "Excluir essa memória?",
    texto: "Ela sai do diário de vez, com fotos e texto. Não dá pra desfazer.",
    sim: "Excluir",
    nao: "Manter memória",
    perigo: true,
  },
};

/** Caixinha de confirmação. `fixo` = por cima da página inteira; senão, por cima do modal. */
export function Confirmacao({
  tipo,
  ocupado,
  erro,
  fixo,
  onSim,
  onNao,
}: {
  tipo: TipoConfirmacao;
  ocupado?: boolean;
  erro?: string | null;
  fixo?: boolean;
  onSim: () => void;
  onNao: () => void;
}) {
  const t = TEXTOS[tipo];
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onNao();
      }
    };
    window.addEventListener("keydown", tecla, true);
    return () => window.removeEventListener("keydown", tecla, true);
  }, [onNao]);

  return (
    <div
      className={`${fixo ? "fixed z-[90]" : "absolute z-10"} dv-fundo-modal inset-0 flex items-center justify-center bg-[rgba(247,244,239,.7)] p-7 backdrop-blur-[4px]`}
      onClick={onNao}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dv-conf-titulo"
        className="dv-dialogo flex w-full max-w-[320px] flex-col items-center gap-2.5 border border-hairline bg-white px-6 pb-5 pt-[30px] text-center shadow-[0_24px_48px_-24px_rgba(28,28,26,.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="dv-losango !h-2 !w-2" />
        <span id="dv-conf-titulo" className="dv-display text-[28px] font-medium leading-[1.1]">
          {t.titulo}
        </span>
        <span className="text-[14px] font-light leading-[1.55] text-ink-soft [text-wrap:pretty]">{t.texto}</span>
        {erro && <span className="text-[13px] text-[#8f4337]">{erro}</span>}
        <div className="mt-3 flex w-full flex-col gap-1.5">
          <button
            type="button"
            autoFocus
            disabled={ocupado}
            onClick={onSim}
            className={`h-12 rounded-full text-[15px] font-medium disabled:opacity-60 ${
              t.perigo ? "bg-[#a8564a] text-white" : "bg-ink text-[#f7f4ef]"
            }`}
          >
            {ocupado ? "Excluindo…" : t.sim}
          </button>
          <button type="button" onClick={onNao} className="h-11 text-[14px] text-ink-soft">
            {t.nao}
          </button>
        </div>
      </div>
    </div>
  );
}
