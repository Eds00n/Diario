"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CardMemoria } from "./CardMemoria";
import { Confirmacao } from "./Confirmacao";
import { Lirio } from "./Lirio";
import { Revelar, useEmTela } from "./Midia";
import { ModalMemoria } from "./ModalMemoria";
import { Topo } from "./Topo";
import { apagarMemoria } from "@/lib/diario/cliente";
import { MESES, MESES_CURTOS, agruparPorMes, contagemMemorias, ordenarMemorias } from "@/lib/diario/format";
import type { Autor, Midia, MemoriaPublica } from "@/lib/diario/types";

type Props = {
  memorias: MemoriaPublica[];
  inicio: string | null;
  nomeEle: string;
  nomeEla: string;
};

type EstadoModal = { modo: "novo" } | { modo: "editar"; memoria: MemoriaPublica } | null;

const CHAVE_AUTOR = "nosso-diario:autor";

function lerAutor(): Autor {
  try {
    return localStorage.getItem(CHAVE_AUTOR) === "ela" ? "ela" : "edson";
  } catch {
    return "edson";
  }
}

function Ponto({ dourado }: { dourado: boolean }) {
  return dourado ? (
    <span className="absolute -left-px top-[9px] h-[11px] w-[11px] rounded-full bg-[#c8a96a] shadow-[0_0_0_3px_#f7f4ef,0_0_0_4px_#e3d5b5]" />
  ) : (
    <span className="absolute left-0 top-2.5 h-[9px] w-[9px] rounded-full bg-[#c7d1bf] shadow-[0_0_0_3px_#f7f4ef]" />
  );
}

export function Diario({ memorias, inicio, nomeEle, nomeEla }: Props) {
  const router = useRouter();

  // Lista local: atualiza na hora ao salvar/excluir; o servidor confirma em seguida.
  const [base, setBase] = useState(memorias);
  const [lista, setLista] = useState(memorias);
  if (memorias !== base) {
    setBase(memorias);
    setLista(memorias);
  }

  const [modal, setModal] = useState<EstadoModal>(null);
  const [aExcluir, setAExcluir] = useState<MemoriaPublica | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);
  const [novoId, setNovoId] = useState<string | null>(null);
  const [mesAtual, setMesAtual] = useState<string | null>(null);
  const [autorPadrao, setAutorPadrao] = useState<Autor>("edson");

  const [topoRef, topoVisivel] = useEmTela<HTMLElement>("0px", false, true);
  const [chipsRef, chipsVisiveis] = useEmTela<HTMLElement>("0px", false, true);
  const chipsScroll = useRef<HTMLDivElement>(null);

  const grupos = useMemo(() => agruparPorMes(lista), [lista]);
  const fotosVaral = useMemo(() => {
    const fotos: Midia[] = [];
    for (const m of ordenarMemorias(lista)) {
      const f = m.midias.find((x) => x.tipo === "foto");
      if (f) fotos.push(f);
      if (fotos.length >= 4) break;
    }
    return fotos;
  }, [lista]);

  const vazio = lista.length === 0;
  const atual = mesAtual ?? grupos[0]?.chave ?? null;

  // Mês que está no topo da tela (pro cabeçalho grudado e o chip ativo).
  useEffect(() => {
    let raf = 0;
    const medir = () => {
      raf = 0;
      let achado: string | null = null;
      for (const g of grupos) {
        const el = document.getElementById(`mes-${g.chave}`);
        if (el && el.getBoundingClientRect().top <= 130) achado = g.chave;
      }
      setMesAtual(achado);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [grupos]);

  // Mantém o chip ativo visível na faixa rolável.
  useEffect(() => {
    if (!atual) return;
    const chip = chipsScroll.current?.querySelector<HTMLElement>(`[data-chip="${atual}"]`);
    const faixa = chipsScroll.current;
    if (!chip || !faixa || faixa.scrollWidth <= faixa.clientWidth) return;
    const alvo = chip.offsetLeft - faixa.clientWidth / 2 + chip.clientWidth / 2;
    faixa.scrollTo({ left: alvo, behavior: "smooth" });
  }, [atual]);

  // Depois de salvar: rola até a memória nova.
  useEffect(() => {
    if (!novoId) return;
    const el = document.getElementById(`m-${novoId}`);
    if (!el) return;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduzido ? "auto" : "smooth" });
    const t = setTimeout(() => setNovoId(null), 3200);
    return () => clearTimeout(t);
  }, [novoId, lista]);

  const abrirNova = useCallback(() => {
    setAutorPadrao(lerAutor());
    setModal({ modo: "novo" });
  }, []);

  function irParaMes(chave: string) {
    const el = document.getElementById(`mes-${chave}`);
    if (!el) return;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: reduzido ? "auto" : "smooth" });
  }

  function aoSalvar(m: MemoriaPublica) {
    try {
      localStorage.setItem(CHAVE_AUTOR, m.autor);
    } catch {
      /* sem armazenamento local, tudo bem */
    }
    setLista((l) => [...l.filter((x) => x.id !== m.id), m]);
    setModal(null);
    setNovoId(m.id);
    router.refresh();
  }

  function aoExcluir(id: string) {
    setLista((l) => l.filter((x) => x.id !== id));
    setModal(null);
    setAExcluir(null);
    router.refresh();
  }

  async function confirmarExclusao() {
    if (!aExcluir) return;
    setExcluindo(true);
    setErroExcluir(null);
    try {
      await apagarMemoria(aExcluir.id);
      aoExcluir(aExcluir.id);
    } catch (e) {
      setErroExcluir((e as Error).message);
    } finally {
      setExcluindo(false);
    }
  }

  // Chips: meses + separador de ano.
  const chips: ({ tipo: "mes"; chave: string; rotulo: string } | { tipo: "ano"; ano: number })[] = [];
  grupos.forEach((g, i) => {
    if (i > 0 && grupos[i - 1].ano !== g.ano) chips.push({ tipo: "ano", ano: g.ano });
    const mes = Number(g.chave.slice(5, 7));
    chips.push({ tipo: "mes", chave: g.chave, rotulo: `${MESES_CURTOS[mes - 1]} ${String(g.ano).slice(2)}` });
  });

  const grupoAtual = grupos.find((g) => g.chave === atual);
  const maisAntigo = grupos[grupos.length - 1];
  const mostrarGrudado = !chipsVisiveis && !!grupoAtual && !!mesAtual;

  return (
    <div className="dv relative min-h-dvh bg-bg pb-10">
      <Topo ref={topoRef} nomeEle={nomeEle} nomeEla={nomeEla} inicio={inicio} fotos={fotosVaral} vazio={vazio} onNova={abrirNova} />

      {vazio ? (
        <div className="mx-auto flex min-h-[55dvh] max-w-[720px] flex-col items-center justify-center gap-[18px] px-10 pb-20 text-center">
          <Lirio className="h-[150px] w-[120px] text-[#c8a96a]" />
          <p className="dv-display mt-1.5 text-[30px] font-medium italic leading-[1.15] [text-wrap:balance]">
            A primeira página está esperando por vocês
          </p>
          <span className="text-[14px] font-light leading-[1.5] text-ink-soft">Uma foto, uma frase — já é uma memória.</span>
          <button type="button" onClick={abrirNova} className="dv-botao mt-2 px-[30px]">
            <span className="text-[22px] font-light leading-none">+</span>
            Nova memória
          </button>
        </div>
      ) : (
        <>
          {/* Chips de mês */}
          <nav ref={chipsRef} aria-label="Meses" className="mx-auto max-w-[720px] md:mt-10">
            <div
              ref={chipsScroll}
              className="dv-sem-scroll flex gap-2 overflow-x-auto border-b border-hairline px-6 pb-3.5 pt-6 md:flex-wrap md:overflow-visible md:px-0 md:pb-4 md:pt-0"
            >
              {chips.map((c) =>
                c.tipo === "ano" ? (
                  <span key={`ano-${c.ano}`} className="flex flex-none items-center gap-2 px-1">
                    <span className="h-px w-3 bg-[#c8a96a]" />
                    <span className="dv-display text-[18px] italic text-[#8a6d33]">{c.ano}</span>
                    <span className="h-px w-3 bg-[#c8a96a]" />
                  </span>
                ) : (
                  <button
                    type="button"
                    key={c.chave}
                    data-chip={c.chave}
                    onClick={() => irParaMes(c.chave)}
                    aria-current={c.chave === atual ? "true" : undefined}
                    className={`flex h-[34px] flex-none items-center whitespace-nowrap rounded-full border px-3.5 text-[13px] leading-none transition-colors ${
                      c.chave === atual
                        ? "border-[#c8a96a] bg-[#fbf6ec] font-medium text-ink"
                        : "border-hairline text-ink-soft hover:border-[#c8a96a] hover:text-ink"
                    }`}
                  >
                    {c.rotulo}
                  </button>
                ),
              )}
            </div>
          </nav>

          {/* Cabeçalho do mês grudado no topo */}
          <div
            aria-hidden={!mostrarGrudado}
            className={`fixed inset-x-0 top-0 z-30 border-b border-hairline bg-[rgba(247,244,239,.85)] backdrop-blur-[10px] transition-[transform,opacity] duration-300 ${
              mostrarGrudado ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
            }`}
          >
            <div className="mx-auto flex max-w-[720px] items-baseline gap-2 px-6 pb-3 pt-[max(12px,env(safe-area-inset-top))] md:px-0">
              <span className="dv-display text-[28px] font-medium leading-none">{grupoAtual?.mes}</span>
              <span className="dv-display text-[16px] text-ink-soft">{grupoAtual?.ano}</span>
              <span className="ml-auto text-[12px] text-ink-soft">{grupoAtual ? contagemMemorias(grupoAtual.memorias.length) : ""}</span>
            </div>
          </div>

          {/* Meses */}
          {grupos.map((g) => (
            <section
              key={g.chave}
              id={`mes-${g.chave}`}
              aria-label={`${g.mes} de ${g.ano}`}
              className="mx-auto max-w-[720px] px-6 pb-3 pt-10 md:px-0 md:pt-[60px]"
            >
              <div className="flex items-baseline gap-2.5 md:gap-3">
                <h2 className="dv-display text-[46px] font-medium leading-none md:text-[58px]">{g.mes}</h2>
                <span className="dv-display text-[19px] text-ink-soft md:text-[22px]">{g.ano}</span>
                <span className="ml-auto text-[12px] text-ink-soft md:text-[13px]">{contagemMemorias(g.memorias.length)}</span>
              </div>
              <div className="dv-divisor mt-3.5 md:mt-4">
                <span className="dv-losango" />
              </div>
              <div className="relative flex flex-col gap-[52px] pt-[30px] md:gap-16 md:pt-9">
                <div className="absolute bottom-0 left-1 top-10 w-px bg-hairline md:top-[46px]" />
                {g.memorias.map((m) => (
                  <div key={m.id} id={`m-${m.id}`} className="relative scroll-mt-24 pl-[26px] md:pl-[34px]">
                    <Ponto dourado={m.data_especial} />
                    <Revelar>
                      <CardMemoria
                        memoria={m}
                        novo={novoId === m.id}
                        nomeEle={nomeEle}
                        nomeEla={nomeEla}
                        onEditar={(x) => setModal({ modo: "editar", memoria: x })}
                        onExcluir={(x) => {
                          setErroExcluir(null);
                          setAExcluir(x);
                        }}
                      />
                    </Revelar>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {maisAntigo && (
            <div className="flex flex-col items-center gap-2 px-6 pb-14 pt-12 text-ink-soft">
              <div className="dv-divisor w-[140px]">
                <span className="dv-losango !h-1.5 !w-1.5" />
              </div>
              <span className="dv-display text-[21px] italic text-ink">
                {MESES[Number(maisAntigo.chave.slice(5, 7)) - 1].replace(/^./, (c) => c.toUpperCase())} de {maisAntigo.ano}
              </span>
              <span className="text-[12px]">a primeira página do nosso diário</span>
            </div>
          )}
        </>
      )}

      {/* Botão flutuante */}
      {!vazio && (
        <button
          type="button"
          aria-label="Nova memória"
          onClick={abrirNova}
          tabIndex={topoVisivel ? -1 : 0}
          className={`fixed bottom-[max(34px,calc(env(safe-area-inset-bottom)+18px))] right-5 z-40 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#c8a96a] shadow-[0_0_0_4px_rgba(247,244,239,.9),0_14px_28px_-10px_rgba(138,109,51,.7)] transition-[transform,opacity] duration-300 md:right-8 ${
            topoVisivel ? "pointer-events-none translate-y-4 scale-90 opacity-0" : "opacity-100"
          }`}
        >
          <span className="relative h-[22px] w-[22px]">
            <span className="absolute left-2.5 top-0 h-[22px] w-0.5 bg-ink" />
            <span className="absolute left-0 top-2.5 h-0.5 w-[22px] bg-ink" />
          </span>
        </button>
      )}

      {modal && (
        <ModalMemoria
          key={modal.modo === "editar" ? modal.memoria.id : "novo"}
          modo={modal.modo}
          memoria={modal.modo === "editar" ? modal.memoria : undefined}
          nomeEle={nomeEle}
          nomeEla={nomeEla}
          autorPadrao={autorPadrao}
          onFechar={() => setModal(null)}
          onSalvo={aoSalvar}
          onExcluido={aoExcluir}
        />
      )}

      {aExcluir && (
        <Confirmacao
          tipo="excluir"
          fixo
          ocupado={excluindo}
          erro={erroExcluir}
          onSim={confirmarExclusao}
          onNao={() => setAExcluir(null)}
        />
      )}
    </div>
  );
}
