"use client";

import { useEffect, useRef, useState } from "react";
import { MidiaView, VideoLoop, Visualizador } from "./Midia";
import { Lirio } from "./Lirio";
import { MESES, partesData, rotuloDataCard, varianteDe } from "@/lib/diario/format";
import type { MemoriaPublica } from "@/lib/diario/types";

type Props = {
  memoria: MemoriaPublica;
  novo?: boolean;
  nomeEle: string;
  nomeEla: string;
  onEditar: (m: MemoriaPublica) => void;
  onExcluir: (m: MemoriaPublica) => void;
};

const SOMBRA_FORTE = "0 1px 2px rgba(28,28,26,.08), 0 14px 28px -12px rgba(28,28,26,.32)";

function Texto({ texto, limite, citacao }: { texto: string; limite: number; citacao?: boolean }) {
  const [aberto, setAberto] = useState(false);
  const longo = texto.length > limite;
  const paragrafos = texto.split(/\n{2,}/);
  const estilo = citacao
    ? "dv-display italic text-[22px] leading-[1.42] text-[#2a2a27]"
    : "text-[15px] font-light leading-[1.68] text-[#33332f]";
  return (
    <>
      <div
        className={`${estilo} flex flex-col gap-3 [text-wrap:pretty] whitespace-pre-line`}
        style={
          longo && !aberto
            ? { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 6, overflow: "hidden" }
            : undefined
        }
      >
        {longo && !aberto ? texto.replace(/\n{2,}/g, "\n") : paragrafos.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      {longo && !aberto ? (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="self-start p-0 text-[13px] text-[#8a6d33] underline underline-offset-4"
        >
          ler mais
        </button>
      ) : null}
    </>
  );
}

function Assinatura({ nome, grande }: { nome: string; grande?: boolean }) {
  return (
    <span className={`dv-assinatura ml-auto leading-none text-ink-soft ${grande ? "text-[27px]" : "text-[25px]"}`}>
      — {nome}
    </span>
  );
}

function Menu({
  aberto,
  setAberto,
  onEditar,
  onExcluir,
  sobreFoto,
}: {
  aberto: boolean;
  setAberto: (v: boolean) => void;
  onEditar: () => void;
  onExcluir: () => void;
  sobreFoto?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, [aberto, setAberto]);

  return (
    <div ref={ref} className={sobreFoto ? "absolute right-2.5 top-2.5 z-[6]" : "relative ml-auto -mr-2"}>
      <button
        type="button"
        aria-label="Opções da memória"
        aria-expanded={aberto}
        onClick={() => setAberto(!aberto)}
        className={`flex h-10 w-10 items-center justify-center rounded-full text-[18px] leading-none ${
          sobreFoto ? "bg-[rgba(247,244,239,.92)] text-ink" : "text-ink-soft hover:bg-[#efebe3]"
        }`}
      >
        ⋯
      </button>
      {aberto && (
        <div className="absolute right-0 top-11 z-[7] flex min-w-[160px] flex-col border border-hairline bg-white p-1.5 shadow-[0_14px_30px_-14px_rgba(28,28,26,.3)]">
          <button
            type="button"
            onClick={() => {
              setAberto(false);
              onEditar();
            }}
            className="px-3 py-[11px] text-left text-[14px] text-ink hover:bg-bg"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => {
              setAberto(false);
              onExcluir();
            }}
            className="px-3 py-[11px] text-left text-[14px] text-[#9a4a3f] hover:bg-[#f9eeea]"
          >
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}

function ContadorPilha({ texto }: { texto: string }) {
  return (
    <span className="absolute right-[22px] top-[22px] z-[2] rounded-full bg-[rgba(28,28,26,.62)] px-[9px] py-[5px] text-[11px] font-medium leading-none tracking-[0.06em] text-[#f7f4ef]">
      {texto}
    </span>
  );
}

function Pilha({ memoria, abrirFoto }: { memoria: MemoriaPublica; abrirFoto: (i: number) => void }) {
  const [carrossel, setCarrossel] = useState(false);
  const [idx, setIdx] = useState(0);
  const toque = useRef<number | null>(null);
  const midias = memoria.midias;
  const total = midias.length;
  const ir = (d: number) => setIdx((i) => (i + d + total) % total);

  if (!carrossel) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setIdx(0);
            setCarrossel(true);
          }}
          className="relative block w-full px-2 pt-2.5 text-left"
          aria-label={`Folhear ${total} fotos`}
        >
          <span className="dv-polaroid absolute inset-x-2 bottom-0 top-2.5 rotate-[5deg]">
            <span className="absolute inset-[12px_12px_44px] overflow-hidden bg-[#ece8df]">
              {midias[2]?.tipo === "foto" && <MidiaView midia={midias[2]} className="h-full w-full object-cover opacity-90" />}
            </span>
          </span>
          <span className="dv-polaroid absolute inset-x-2 bottom-0 top-2.5 rotate-[-4deg]">
            <span className="absolute inset-[12px_12px_44px] overflow-hidden bg-[#e9e4da]">
              {midias[1]?.tipo === "foto" && <MidiaView midia={midias[1]} className="h-full w-full object-cover opacity-90" />}
            </span>
          </span>
          <span className="relative block rotate-[-1deg] bg-white p-3 pb-11" style={{ boxShadow: SOMBRA_FORTE }}>
            <span className="dv-foto block aspect-[4/5]">
              <MidiaView midia={midias[0]} ajuste={memoria.ajuste} />
            </span>
            <ContadorPilha texto={`1/${total}`} />
          </span>
        </button>
        <div className="mt-3.5 flex items-center gap-2 text-[12px] text-ink-soft">
          <span className="dv-losango !h-[5px] !w-[5px]" />
          Toque para folhear · {total} fotos
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative bg-white p-3 pb-11"
        style={{ boxShadow: SOMBRA_FORTE }}
        onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (toque.current == null) return;
          const dx = e.changedTouches[0].clientX - toque.current;
          toque.current = null;
          if (Math.abs(dx) > 40) ir(dx < 0 ? 1 : -1);
        }}
      >
        <button type="button" className="dv-foto block aspect-[4/5] w-full" onClick={() => abrirFoto(idx)} aria-label="Ver em tela cheia">
          <MidiaView key={midias[idx].arquivo} midia={midias[idx]} />
        </button>
        <ContadorPilha texto={`${idx + 1}/${total}`} />
      </div>
      <div className="flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => ir(-1)}
          aria-label="Anterior"
          className="h-11 w-11 rounded-full border border-hairline bg-white text-[22px] font-light leading-none text-ink"
        >
          ‹
        </button>
        <div className="flex flex-wrap items-center justify-center gap-[7px]">
          {midias.map((_, i) =>
            i === idx ? (
              <span key={i} className="dv-losango" />
            ) : (
              <button
                type="button"
                key={i}
                aria-label={`Foto ${i + 1}`}
                onClick={() => setIdx(i)}
                className="h-[5px] w-[5px] rounded-full bg-[#d6d2c8]"
              />
            ),
          )}
        </div>
        <button
          type="button"
          onClick={() => ir(1)}
          aria-label="Próxima"
          className="h-11 w-11 rounded-full border border-hairline bg-white text-[22px] font-light leading-none text-ink"
        >
          ›
        </button>
      </div>
      <button
        type="button"
        onClick={() => setCarrossel(false)}
        className="self-center p-1.5 text-[12px] text-ink-soft underline underline-offset-4"
      >
        recolher pilha
      </button>
    </div>
  );
}

function VideoCard({ memoria }: { memoria: MemoriaPublica }) {
  const [som, setSom] = useState(false);
  const [tempo, setTempo] = useState({ atual: 0, total: 0 });
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  return (
    <div className="rotate-[1.2deg] bg-white p-3 pb-11 shadow-[0_1px_2px_rgba(28,28,26,.08),0_12px_26px_-12px_rgba(28,28,26,.3)]">
      <div className="dv-foto aspect-[4/5]">
        <VideoLoop arquivo={memoria.midias[0].arquivo} comSom={som} onTempo={(atual, total) => setTempo({ atual, total })} />
        <button
          type="button"
          onClick={() => setSom(!som)}
          aria-label={som ? "Desligar som" : "Ligar som"}
          className="absolute right-2.5 top-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(247,244,239,.94)] shadow-[0_4px_10px_-4px_rgba(0,0,0,.25)]"
        >
          <span className="relative block h-[14px] w-[18px]">
            <span className="absolute left-0 top-1 h-1.5 w-[5px] bg-ink" />
            <span className="absolute left-0.5 top-0 h-0 w-0 border-y-[7px] border-r-8 border-y-transparent border-r-ink" />
            {som ? (
              <>
                <span className="absolute left-3 top-1 h-1.5 w-0.5 bg-ink" />
                <span className="absolute left-4 top-px h-3 w-0.5 bg-ink" />
              </>
            ) : (
              <span className="absolute -left-0.5 top-1.5 h-[1.5px] w-[22px] -rotate-[40deg] bg-[#9a4a3f]" />
            )}
          </span>
        </button>
        <span className="absolute bottom-3 left-2.5 flex items-center gap-1.5 rounded-full bg-[rgba(28,28,26,.6)] px-[9px] py-[5px] font-mono text-[10px] leading-none tracking-[0.04em] text-[#f7f4ef]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c8a96a]" />
          loop{tempo.total ? ` · ${fmt(tempo.total)}` : ""}
        </span>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/45">
          <div className="h-full bg-[#c8a96a]" style={{ width: tempo.total ? `${(tempo.atual / tempo.total) * 100}%` : "0%" }} />
        </div>
      </div>
    </div>
  );
}

export function CardMemoria({ memoria, novo, nomeEle, nomeEla, onEditar, onExcluir }: Props) {
  const [menu, setMenu] = useState(false);
  const [foto, setFoto] = useState<number | null>(null);
  const v = varianteDe(memoria);
  const nome = memoria.autor === "edson" ? nomeEle : nomeEla;
  const m = memoria;
  const { dia, mes, ano, semana } = partesData(m.data);

  const menuProps = {
    aberto: menu,
    setAberto: setMenu,
    onEditar: () => onEditar(m),
    onExcluir: () => onExcluir(m),
  };

  return (
    <article className="relative flex flex-col gap-3.5" aria-label={m.titulo ?? rotuloDataCard(m.data)}>
      {novo && <div className="dv-brilho" aria-hidden />}

      {v !== "f" && (
        <div className="relative flex min-h-7 items-center gap-2.5">
          <span className="dv-display text-[19px] font-medium tracking-[0.01em] text-ink">{rotuloDataCard(m.data)}</span>
          {m.data_especial && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c8a96a] bg-[#fbf6ec] py-1 pl-2 pr-[9px] text-[9.5px] font-medium uppercase leading-none tracking-[0.12em] text-[#8a6d33]">
              <span className="h-[5px] w-[5px] rotate-45 bg-[#c8a96a]" />
              data especial
            </span>
          )}
          <Menu {...menuProps} />
        </div>
      )}

      {v === "a" && (
        <div className="relative flex flex-col gap-2.5 border border-[#dde4d5] bg-[#eef1ea] px-6 pb-4 pt-[30px]">
          <span aria-hidden className="dv-display absolute left-4 top-0.5 text-[62px] leading-none text-[#c7d1bf]">
            “
          </span>
          {m.titulo && <h3 className="dv-titulo text-[19px] leading-[1.3] text-ink">{m.titulo}</h3>}
          <Texto texto={m.texto} limite={230} citacao />
          <div className="flex items-center">
            <Assinatura nome={nome} />
          </div>
        </div>
      )}

      {(v === "b" || v === "c" || v === "d" || v === "e") && (
        <div className="flex flex-wrap items-start gap-x-[34px] gap-y-6">
          <div className="min-w-0 max-w-[360px] flex-[1_1_280px]">
            {v === "b" && (
              <button
                type="button"
                onClick={() => setFoto(0)}
                aria-label="Ver foto em tela cheia"
                className="block w-full rotate-[-1.5deg] bg-white p-3 pb-11 shadow-[0_1px_2px_rgba(28,28,26,.08),0_12px_26px_-12px_rgba(28,28,26,.3)]"
              >
                <span className="dv-foto block aspect-[4/5]">
                  <MidiaView midia={m.midias[0]} ajuste={m.ajuste} />
                </span>
              </button>
            )}
            {v === "c" && (
              <div className="relative h-[300px]">
                {[0, 1].map((i) => (
                  <button
                    type="button"
                    key={m.midias[i].arquivo}
                    onClick={() => setFoto(i)}
                    aria-label={`Ver foto ${i + 1}`}
                    className={`dv-polaroid absolute w-[63%] p-2 pb-[30px] ${
                      i === 0 ? "left-0 top-[18px] rotate-[-5deg]" : "right-0 top-0 rotate-[4deg]"
                    }`}
                  >
                    <span className="dv-foto block aspect-[4/5]">
                      <MidiaView midia={m.midias[i]} ajuste={i === 0 ? m.ajuste : undefined} />
                    </span>
                  </button>
                ))}
              </div>
            )}
            {v === "d" && <Pilha memoria={m} abrirFoto={setFoto} />}
            {v === "e" && <VideoCard memoria={m} />}
          </div>
          <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-2.5 pt-0.5">
            {m.titulo && <h3 className="dv-titulo text-[22px] leading-[1.25] text-ink [text-wrap:pretty]">{m.titulo}</h3>}
            {m.texto && <Texto texto={m.texto} limite={300} />}
            <div className="mt-0.5 flex items-center">
              <Assinatura nome={nome} />
            </div>
          </div>
        </div>
      )}

      {v === "f" && (
        <div className="relative border border-[#e6d8b8] bg-[#fffdf8] shadow-[0_1px_2px_rgba(28,28,26,.05),0_24px_44px_-26px_rgba(120,95,40,.45)]">
          <button type="button" onClick={() => setFoto(0)} aria-label="Ver foto em tela cheia" className="dv-foto block aspect-[4/3] w-full">
            <MidiaView midia={m.midias[0]} ajuste={m.ajuste} />
          </button>
          <Menu {...menuProps} sobreFoto />
          <div className="relative flex flex-col items-center gap-3 px-[26px] pb-[30px] pt-14 text-center">
            <div className="absolute -top-10 left-1/2 -ml-10 flex h-20 w-20 items-center justify-center rounded-full border border-[#c8a96a] bg-bg shadow-[0_0_0_5px_#fffdf8]">
              <span className="flex h-[66px] w-[66px] items-center justify-center rounded-full border border-dashed border-[#d8c497]">
                <Lirio className="h-11 w-11 text-[#a8874a]" />
              </span>
            </div>
            <span className="text-[10.5px] font-medium uppercase leading-none tracking-[0.26em] text-[#8a6d33]">Momento especial</span>
            <div className="flex flex-col items-center gap-0.5">
              <span className="dv-display text-[72px] font-medium leading-none text-[#a8874a]">{dia}</span>
              <span className="dv-display text-[19px] italic text-ink-soft">
                {MESES[mes - 1]} de {ano} · {semana}
              </span>
            </div>
            <div className="dv-divisor w-[140px]">
              <span className="dv-losango" />
            </div>
            {m.data_especial && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c8a96a] bg-[#fbf6ec] py-1 pl-2 pr-[9px] text-[9.5px] font-medium uppercase leading-none tracking-[0.12em] text-[#8a6d33]">
                <span className="h-[5px] w-[5px] rotate-45 bg-[#c8a96a]" />
                data especial
              </span>
            )}
            {m.titulo && <h3 className="dv-titulo mt-1 text-[30px] leading-[1.18] text-ink [text-wrap:balance]">{m.titulo}</h3>}
            {m.texto && (
              <div className="flex max-w-[46ch] flex-col gap-3 whitespace-pre-line text-[15.5px] font-light leading-[1.7] text-[#33332f] [text-wrap:pretty]">
                {m.texto.split(/\n{2,}/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            {m.midias.length > 1 && (
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {m.midias.slice(1).map((x, i) => (
                  <button
                    type="button"
                    key={x.arquivo}
                    onClick={() => setFoto(i + 1)}
                    aria-label={`Ver foto ${i + 2}`}
                    className="dv-polaroid w-[84px] p-1 pb-3.5"
                    style={{ transform: `rotate(${[-2, 1.5, -1, 2][i % 4]}deg)` }}
                  >
                    <span className="dv-foto block aspect-square">
                      <MidiaView midia={x} />
                    </span>
                  </button>
                ))}
              </div>
            )}
            <span className="dv-assinatura text-[27px] leading-none text-ink-soft">— {nome}</span>
          </div>
        </div>
      )}

      {foto !== null && <Visualizador midias={m.midias} inicio={foto} onFechar={() => setFoto(null)} />}
    </article>
  );
}
