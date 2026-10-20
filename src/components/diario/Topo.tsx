"use client";

import { forwardRef, useSyncExternalStore } from "react";
import { MidiaView } from "./Midia";
import { calcularContador, dataComPontos, hojeLocal } from "@/lib/diario/format";
import type { Midia } from "@/lib/diario/types";

const ROTACOES = [-4, 3, -2, 5];
const ALTURAS = [23, 27, 27, 23];

/** Varal com as fotos mais recentes. */
export function Varal({ fotos, desktop }: { fotos: Midia[]; desktop?: boolean }) {
  const n = fotos.length || (desktop ? 3 : 4);
  const largura = desktop ? 78 : 70;
  return (
    <div className={`relative ${desktop ? "h-[150px]" : "h-[118px]"}`} aria-hidden>
      <div className="absolute -left-[39px] -right-[39px] -top-[26px] h-[52px] rounded-b-[50%] border-b border-[#b9ad94]" />
      {Array.from({ length: n }).map((_, i) => {
        const centro = ((i + 0.5) / n) * 100;
        const topo = ALTURAS[Math.round((i / Math.max(1, n - 1)) * 3)] ?? 25;
        const foto = fotos[i];
        return (
          <div key={foto?.arquivo ?? i}>
            <div
              className="absolute bg-white p-1 pb-3.5 shadow-[0_6px_14px_-6px_rgba(28,28,26,.35)]"
              style={{
                left: `calc(${centro}% - ${largura / 2}px)`,
                top: topo + (desktop ? 1 : 0),
                width: largura,
                transform: `rotate(${ROTACOES[i % 4]}deg)`,
                transformOrigin: "50% 0",
              }}
            >
              <div className="dv-foto aspect-square">
                {foto ? (
                  <MidiaView midia={foto} />
                ) : (
                  <div className="h-full w-full bg-[repeating-linear-gradient(135deg,#ece7dd_0_5px,#e4ded2_5px_10px)]" />
                )}
              </div>
            </div>
            <span
              className="absolute h-3.5 w-1.5 border border-[#b5a37e] bg-[#d9cbb0]"
              style={{ left: `calc(${centro}% - 3px)`, top: topo - 7 }}
            />
          </div>
        );
      })}
    </div>
  );
}

const nadaMuda = () => () => undefined;

function Contador({ inicio }: { inicio: string }) {
  // Calculado no aparelho (fuso de quem está vendo); no servidor mostra um traço.
  const hoje = useSyncExternalStore(
    nadaMuda,
    () => hojeLocal(),
    () => null,
  );
  const c = hoje ? calcularContador(inicio, hoje) : null;
  return (
    <>
      <div className="mt-4 flex items-baseline gap-2 md:mt-[22px]">
        <span className="dv-display text-[40px] font-medium leading-none md:text-[44px]">{c ? c.dias : "—"}</span>
        <span className="text-[14px] text-ink-soft">{c?.dias === 1 ? "dia juntos" : "dias juntos"}</span>
      </div>
      {c && c.faltam >= 0 && (
        <div className="mt-1.5 flex items-center gap-2 text-[13px] text-ink-soft md:text-[13.5px]">
          <span className="h-1.5 w-1.5 flex-none rotate-45 bg-[#c8a96a]" />
          {c.hojeEDia ? (
            <span>
              hoje é dia de <strong className="font-medium text-ink">{c.evento}</strong>
            </span>
          ) : (
            <span>
              faltam <strong className="font-medium text-ink">{c.faltam === 1 ? "1 dia" : `${c.faltam} dias`}</strong> pra {c.evento}
            </span>
          )}
        </div>
      )}
    </>
  );
}

type Props = {
  nomeEle: string;
  nomeEla: string;
  inicio: string | null;
  fotos: Midia[];
  vazio: boolean;
  onNova: () => void;
};

export const Topo = forwardRef<HTMLElement, Props>(function Topo({ nomeEle, nomeEla, inicio, fotos, vazio, onNova }, ref) {
  const kicker = `${nomeEle} & ${nomeEla}${inicio ? ` · desde ${dataComPontos(inicio)}` : ""}`;
  const botao = (
    <button type="button" onClick={onNova} className={`dv-botao ${vazio ? "hidden" : ""}`}>
      <span className="text-[22px] font-light leading-none">+</span>
      Nova memória
    </button>
  );
  return (
    <header ref={ref} className="mx-auto w-full max-w-[720px] px-6 pt-[max(18px,env(safe-area-inset-top))] md:grid md:grid-cols-[minmax(0,1fr)_340px] md:gap-6 md:px-0 md:pt-16">
      <div className="flex flex-col">
        <span className="text-[10px] font-medium uppercase leading-none tracking-[0.2em] text-ink-soft md:text-[10.5px]">{kicker}</span>
        <h1 className="dv-display mt-4 text-[56px] font-medium leading-[0.92] tracking-[-0.01em] md:mt-[18px] md:text-[76px] md:leading-[0.9]">
          Nosso Diário
        </h1>
        {inicio && !vazio && <Contador inicio={inicio} />}
        <div className="mt-[26px] hidden self-start md:block">{botao}</div>
      </div>
      <div className="-mx-6 mt-[18px] overflow-hidden px-6 md:hidden">
        <Varal fotos={fotos.slice(0, 4)} />
      </div>
      <div className="mt-5 hidden md:block">
        <Varal fotos={fotos.slice(0, 3)} desktop />
      </div>
      <div className={`mt-2 flex flex-col md:hidden ${vazio ? "hidden" : ""}`}>{botao}</div>
    </header>
  );
});
