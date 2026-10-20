"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Confirmacao, type TipoConfirmacao } from "./Confirmacao";
import { apagarMemoria, enviarMidia, prepararArquivo, salvarMemoria } from "@/lib/diario/cliente";
import { hojeLocal, rotuloDataModal, urlMidia } from "@/lib/diario/format";
import type { Autor, Midia, MemoriaPublica } from "@/lib/diario/types";

type Item = {
  id: string;
  tipo: "foto" | "video";
  preview: string;
  arquivo?: File;
  /** Já está no servidor (memória existente ou upload concluído). */
  salvo?: Midia;
  status: "pronto" | "enviando" | "ok" | "falhou";
  pct: number;
};

type ModoData = "hoje" | "ontem" | "escolher";

export type ModalProps = {
  modo: "novo" | "editar";
  memoria?: MemoriaPublica;
  nomeEle: string;
  nomeEla: string;
  autorPadrao: Autor;
  onFechar: () => void;
  onSalvo: (m: MemoriaPublica) => void;
  onExcluido: (id: string) => void;
};

const ROT = ["-2deg", "1.5deg", "-1deg", "2deg"];
const ACEITOS = "image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,video/mp4,video/quicktime,video/webm";
let seq = 0;
const novoId = () => `i${Date.now().toString(36)}${(seq++).toString(36)}`;

function useTelaGrande() {
  const [grande, setGrande] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const f = () => setGrande(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return grande;
}

function Toggle({ ligado }: { ligado: boolean }) {
  return (
    <span className={`relative h-[26px] w-11 flex-none rounded-full transition-colors ${ligado ? "bg-[#c8a96a]" : "bg-[#e3e1da]"}`}>
      <span
        className={`absolute top-[3px] h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.2)] transition-[left] ${ligado ? "left-[21px]" : "left-[3px]"}`}
      />
    </span>
  );
}

export function ModalMemoria({ modo, memoria, nomeEle, nomeEla, autorPadrao, onFechar, onSalvo, onExcluido }: ModalProps) {
  const editar = modo === "editar" && !!memoria;
  const grande = useTelaGrande();
  const anoAtual = new Date().getFullYear();

  // ── estado inicial ──
  const inicial = useMemo(() => {
    const hoje = hojeLocal();
    const ontem = hojeLocal(-1);
    const data = memoria?.data ?? hoje;
    return {
      data,
      modoData: (data === hoje ? "hoje" : data === ontem ? "ontem" : "escolher") as ModoData,
      titulo: memoria?.titulo ?? "",
      texto: memoria?.texto ?? "",
      autor: memoria?.autor ?? autorPadrao,
      especial: memoria?.momento_especial ?? false,
      dataEsp: memoria?.data_especial ?? false,
      itens: (memoria?.midias ?? []).map<Item>((m) => ({
        id: novoId(),
        tipo: m.tipo,
        preview: urlMidia(m.arquivo),
        salvo: m,
        status: "ok",
        pct: 100,
      })),
    };
  }, [memoria, autorPadrao]);

  const [data, setData] = useState(inicial.data);
  const [modoData, setModoData] = useState<ModoData>(inicial.modoData);
  const [titulo, setTitulo] = useState(inicial.titulo);
  const [texto, setTexto] = useState(inicial.texto);
  const [autor, setAutor] = useState<Autor>(inicial.autor);
  const [especial, setEspecial] = useState(inicial.especial);
  const [dataEsp, setDataEsp] = useState(inicial.dataEsp);
  const [itens, setItens] = useState<Item[]>(inicial.itens);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [progressoTexto, setProgressoTexto] = useState("");
  const [erro, setErro] = useState<{ titulo: string; detalhe: string } | null>(null);
  const [confirmacao, setConfirmacao] = useState<TipoConfirmacao | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);
  const [arrastandoArquivo, setArrastandoArquivo] = useState(false);
  const [puxar, setPuxar] = useState(0);

  const inputArquivos = useRef<HTMLInputElement>(null);
  const inputData = useRef<HTMLInputElement>(null);
  const textoRef = useRef<HTMLTextAreaElement>(null);
  const arrastoItem = useRef<string | null>(null);
  const puxarInicio = useRef<number | null>(null);

  const temConteudo = texto.trim().length > 0 || itens.length > 0;
  const sujo =
    data !== inicial.data ||
    titulo !== inicial.titulo ||
    texto !== inicial.texto ||
    autor !== inicial.autor ||
    especial !== inicial.especial ||
    dataEsp !== inicial.dataEsp ||
    itens.length !== inicial.itens.length ||
    itens.some((it, i) => it.salvo?.arquivo !== inicial.itens[i]?.salvo?.arquivo);

  // Libera as prévias locais ao fechar.
  const itensRef = useRef(itens);
  useEffect(() => {
    itensRef.current = itens;
  }, [itens]);
  useEffect(
    () => () => {
      for (const it of itensRef.current) if (it.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
    },
    [],
  );

  // Trava a rolagem da página por trás.
  useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = antes;
    };
  }, []);

  // Textarea cresce com o texto.
  useEffect(() => {
    const t = textoRef.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = `${Math.max(78, t.scrollHeight)}px`;
  }, [texto]);

  function pedirFechar() {
    if (enviando) return;
    if (sujo) setConfirmacao("descartar");
    else onFechar();
  }

  const pedirFecharRef = useRef(pedirFechar);
  useEffect(() => {
    pedirFecharRef.current = pedirFechar;
  });
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !confirmacao) pedirFecharRef.current();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [confirmacao]);

  // ── mídias ──
  const adicionarArquivos = useCallback((lista: FileList | File[] | null) => {
    if (!lista) return;
    const novos: Item[] = [];
    for (const f of Array.from(lista)) {
      const ehVideo = f.type.startsWith("video/") || /\.(mp4|mov|m4v|webm)$/i.test(f.name);
      const ehFoto = f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(f.name);
      if (!ehVideo && !ehFoto) continue;
      novos.push({
        id: novoId(),
        tipo: ehVideo ? "video" : "foto",
        preview: URL.createObjectURL(f),
        arquivo: f,
        status: "pronto",
        pct: 0,
      });
    }
    if (novos.length) {
      setItens((atual) => [...atual, ...novos].slice(0, 40));
      setErro(null);
    }
  }, []);

  useEffect(() => {
    const colar = (e: ClipboardEvent) => {
      const arquivos = Array.from(e.clipboardData?.files ?? []);
      if (arquivos.length) {
        e.preventDefault();
        adicionarArquivos(arquivos);
      }
    };
    window.addEventListener("paste", colar);
    return () => window.removeEventListener("paste", colar);
  }, [adicionarArquivos]);

  function remover(id: string) {
    setItens((atual) => {
      const it = atual.find((x) => x.id === id);
      if (it?.preview.startsWith("blob:")) URL.revokeObjectURL(it.preview);
      return atual.filter((x) => x.id !== id);
    });
    if (selecionado === id) setSelecionado(null);
  }

  function mover(id: string, delta: number) {
    setItens((atual) => {
      const i = atual.findIndex((x) => x.id === id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= atual.length) return atual;
      const copia = [...atual];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  }

  function soltarSobre(alvoId: string) {
    const origem = arrastoItem.current;
    arrastoItem.current = null;
    if (!origem || origem === alvoId) return;
    setItens((atual) => {
      const de = atual.findIndex((x) => x.id === origem);
      const para = atual.findIndex((x) => x.id === alvoId);
      if (de < 0 || para < 0) return atual;
      const copia = [...atual];
      const [it] = copia.splice(de, 1);
      copia.splice(para, 0, it);
      return copia;
    });
  }

  function onDropArquivos(e: DragEvent) {
    if (!e.dataTransfer.files?.length) return;
    e.preventDefault();
    setArrastandoArquivo(false);
    adicionarArquivos(e.dataTransfer.files);
  }

  // ── data ──
  function escolherData(k: ModoData) {
    setModoData(k);
    if (k === "hoje") setData(hojeLocal());
    else if (k === "ontem") setData(hojeLocal(-1));
    else abrirCalendario();
  }
  function abrirCalendario() {
    const el = inputData.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      el.focus();
      el.click();
    }
  }

  // ── salvar ──
  async function guardar() {
    if (!temConteudo || enviando) return;
    setEnviando(true);
    setErro(null);
    const pendentes = itens.filter((it) => !it.salvo && it.arquivo);
    let feitos = 0;
    const resultado = new Map<string, Midia>();
    let falhou: { indice: number; msg: string; status: number } | null = null;

    for (const it of pendentes) {
      setProgressoTexto(pendentes.length > 1 ? `${feitos + 1} de ${pendentes.length}` : "");
      setItens((a) => a.map((x) => (x.id === it.id ? { ...x, status: "enviando", pct: 0 } : x)));
      try {
        const arquivo = await prepararArquivo(it.arquivo!);
        const salvo = await enviarMidia(arquivo, data, (pct) =>
          setItens((a) => a.map((x) => (x.id === it.id ? { ...x, pct } : x))),
        );
        resultado.set(it.id, salvo);
        feitos++;
        setItens((a) => a.map((x) => (x.id === it.id ? { ...x, status: "ok", pct: 100, salvo } : x)));
      } catch (e) {
        const err = e as { message?: string; status?: number };
        setItens((a) => a.map((x) => (x.id === it.id ? { ...x, status: "falhou" } : x)));
        falhou ??= { indice: itens.findIndex((x) => x.id === it.id), msg: err.message ?? "", status: err.status ?? 0 };
      }
    }

    if (falhou) {
      const ordinal = ["primeira", "segunda", "terceira", "quarta", "quinta", "sexta", "sétima", "oitava", "nona", "décima"][falhou.indice];
      setErro({
        titulo: "Não deu pra guardar agora.",
        detalhe:
          falhou.status === 401
            ? falhou.msg
            : `${falhou.status === 0 ? "A conexão caiu" : falhou.msg.replace(/\.$/, "")} no envio da ${ordinal ?? `${falhou.indice + 1}ª`} foto. Tudo o que você escreveu continua aqui.`,
      });
      setEnviando(false);
      setProgressoTexto("");
      return;
    }

    try {
      setProgressoTexto("");
      const midias = itens
        .map((it) => it.salvo ?? resultado.get(it.id))
        .filter((m): m is Midia => !!m);
      const salva = await salvarMemoria(
        {
          data,
          titulo: titulo.trim() || null,
          texto: texto.trim(),
          midias,
          autor,
          momento_especial: especial,
          data_especial: dataEsp,
        },
        editar ? memoria!.id : undefined,
      );
      onSalvo(salva);
    } catch (e) {
      setErro({
        titulo: "Não deu pra guardar agora.",
        detalhe: `${(e as Error).message} Tudo o que você escreveu continua aqui.`,
      });
      setEnviando(false);
    }
  }

  async function excluir() {
    if (!memoria) return;
    setExcluindo(true);
    setErroExcluir(null);
    try {
      await apagarMemoria(memoria.id);
      onExcluido(memoria.id);
    } catch (e) {
      setErroExcluir((e as Error).message);
      setExcluindo(false);
    }
  }

  const botao = enviando
    ? `Guardando…${progressoTexto ? ` ${progressoTexto}` : ""}`
    : editar
      ? "Salvar alterações"
      : "Guardar memória";
  const pctGeral = (() => {
    const pend = itens.filter((it) => it.arquivo);
    if (!enviando) return 0;
    if (!pend.length) return 70;
    return Math.round(pend.reduce((s, it) => s + it.pct, 0) / pend.length);
  })();

  const sel = itens.find((x) => x.id === selecionado);
  const selIdx = sel ? itens.indexOf(sel) : -1;

  // ── gesto de puxar pra fechar (alça do bottom sheet) ──
  const alca = grande ? null : (
    <div
      className="flex cursor-grab touch-none justify-center pb-0.5 pt-2.5"
      onPointerDown={(e) => {
        puxarInicio.current = e.clientY;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (puxarInicio.current != null) setPuxar(Math.max(0, e.clientY - puxarInicio.current));
      }}
      onPointerUp={() => {
        const d = puxar;
        puxarInicio.current = null;
        setPuxar(0);
        if (d > 110) pedirFechar();
      }}
      onPointerCancel={() => {
        puxarInicio.current = null;
        setPuxar(0);
      }}
    >
      <span className="h-1 w-10 rounded-sm bg-[#d6d2c8]" />
    </div>
  );

  return (
    <div className="dv fixed inset-0 z-[70]">
      <div className="dv-fundo-modal absolute inset-0 bg-[rgba(28,28,26,.44)] backdrop-blur-[2px]" onClick={pedirFechar} />
      <div className={`pointer-events-none absolute inset-0 flex flex-col items-center ${grande ? "justify-center p-6" : "justify-end"}`}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dv-modal-titulo"
          className={`pointer-events-auto relative flex w-full max-w-[560px] flex-col overflow-hidden bg-bg shadow-[0_-12px_40px_-12px_rgba(0,0,0,.35)] ${
            grande ? "dv-dialogo max-h-[88dvh] rounded-[14px]" : "dv-sheet h-[92dvh] rounded-t-[22px]"
          }`}
          style={puxar ? { transform: `translateY(${puxar}px)`, transition: "none" } : undefined}
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes("Files")) {
              e.preventDefault();
              setArrastandoArquivo(true);
            }
          }}
          onDragLeave={(e) => {
            if (e.currentTarget === e.target) setArrastandoArquivo(false);
          }}
          onDrop={onDropArquivos}
        >
          {alca}
          <div className={`flex items-center justify-between gap-3 px-6 pb-3.5 ${grande ? "pt-6" : "pt-3"}`}>
            <h2 id="dv-modal-titulo" className="dv-display text-[32px] font-medium leading-none">
              {editar ? "Editar memória" : "Nova memória"}
            </h2>
            <button
              type="button"
              aria-label="Fechar"
              onClick={pedirFechar}
              className="h-10 w-10 rounded-full border border-hairline text-[20px] font-light leading-none text-ink-soft"
            >
              ×
            </button>
          </div>
          {enviando ? (
            <div className="h-0.5 bg-[#ebe7df]">
              <div className="h-full bg-[#c8a96a] transition-[width] duration-300" style={{ width: `${pctGeral}%` }} />
            </div>
          ) : (
            <div className="mx-6 h-px bg-hairline" />
          )}

          <div className="relative flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto overscroll-contain px-6 pb-7 pt-[22px]">
            {/* Fotos e vídeos */}
            <section className="flex flex-col gap-3">
              <span className="dv-rotulo">Fotos e vídeos</span>
              <input
                ref={inputArquivos}
                type="file"
                multiple
                accept={ACEITOS}
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => {
                  adicionarArquivos(e.target.files);
                  e.target.value = "";
                }}
              />
              {itens.length === 0 ? (
                <button
                  type="button"
                  onClick={() => inputArquivos.current?.click()}
                  className={`flex flex-col items-center gap-2.5 rounded-[3px] border border-dashed px-5 py-8 text-center transition-colors ${
                    arrastandoArquivo ? "border-[#c8a96a] bg-[#fbf6ec]" : "border-[#b9c6ae] bg-[#eef1ea]"
                  }`}
                >
                  <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#c8a96a] bg-bg text-[26px] font-light leading-none text-[#8a6d33]">
                    +
                  </span>
                  <span className="text-[15px] text-ink">Toque para escolher ou arraste aqui</span>
                  <span className="max-w-[30ch] text-[12px] leading-[1.5] text-ink-soft">
                    Várias de uma vez. No notebook, Ctrl+V cola direto.
                  </span>
                </button>
              ) : (
                <>
                  <div className={`dv-sem-scroll -mx-1 flex gap-3.5 overflow-x-auto px-1 pb-1 pt-2.5 ${arrastandoArquivo ? "rounded bg-[#fbf6ec]" : ""}`}>
                    {itens.map((it, i) => (
                      <div
                        key={it.id}
                        className="flex w-[92px] flex-none flex-col gap-2"
                        draggable={!enviando}
                        onDragStart={(e) => {
                          arrastoItem.current = it.id;
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => {
                          if (arrastoItem.current) e.preventDefault();
                        }}
                        onDrop={(e) => {
                          if (arrastoItem.current) {
                            e.preventDefault();
                            e.stopPropagation();
                            soltarSobre(it.id);
                          }
                        }}
                      >
                        <div
                          className={`relative bg-white p-[5px] pb-4 shadow-[0_1px_2px_rgba(28,28,26,.08),0_8px_16px_-8px_rgba(28,28,26,.3)] transition-[outline] ${
                            selecionado === it.id ? "outline outline-2 outline-offset-2 outline-[#c8a96a]" : ""
                          }`}
                          style={{ transform: `rotate(${ROT[i % 4]})` }}
                        >
                          <button
                            type="button"
                            disabled={enviando}
                            onClick={() => setSelecionado(selecionado === it.id ? null : it.id)}
                            aria-label={`Mídia ${i + 1}${i === 0 ? " (capa)" : ""}. Toque para mudar a ordem.`}
                            className="dv-foto block aspect-square w-full"
                          >
                            {it.tipo === "video" ? (
                              <video src={it.preview} muted playsInline preload="metadata" />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={it.preview} alt="" draggable={false} />
                            )}
                            {it.tipo === "video" && (
                              <span className="absolute bottom-1 right-1 rounded-full bg-[rgba(28,28,26,.6)] px-1.5 py-0.5 text-[8.5px] text-white">
                                vídeo
                              </span>
                            )}
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-[3px] left-[5px] text-[8.5px] font-medium uppercase leading-none tracking-[0.14em] text-[#8a6d33]">
                              capa
                            </span>
                          )}
                          {!enviando && (
                            <button
                              type="button"
                              aria-label="Remover"
                              onClick={() => remover(it.id)}
                              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-bg bg-ink text-[13px] leading-none text-[#f7f4ef]"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        {it.status === "enviando" && (
                          <div className="flex flex-col gap-1">
                            <div className="h-0.5 bg-hairline">
                              <div className="h-full bg-[#c8a96a]" style={{ width: `${it.pct}%` }} />
                            </div>
                            <span className="font-mono text-[10px] leading-none text-ink-soft">{it.pct}%</span>
                          </div>
                        )}
                        {it.status === "ok" && it.arquivo && (
                          <div className="flex flex-col gap-1">
                            <div className="h-0.5 bg-[#c8a96a]" />
                            <span className="font-mono text-[10px] leading-none text-[#8a6d33]">enviada</span>
                          </div>
                        )}
                        {it.status === "falhou" && (
                          <div className="flex flex-col gap-1">
                            <div className="h-0.5 bg-[#d9a59b]" />
                            <span className="font-mono text-[10px] leading-none text-[#9a4a3f]">não subiu</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {!enviando && (
                      <button
                        type="button"
                        onClick={() => inputArquivos.current?.click()}
                        className="flex h-[108px] w-[92px] flex-none flex-col items-center justify-center gap-1.5 border border-dashed border-[#c7d1bf] bg-[#eef1ea] text-[11px] text-ink-soft"
                      >
                        <span className="text-[22px] font-light leading-none text-[#8a6d33]">+</span>
                        adicionar
                      </button>
                    )}
                  </div>
                  {sel && !enviando ? (
                    <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink-soft">
                      <button
                        type="button"
                        disabled={selIdx <= 0}
                        onClick={() => mover(sel.id, -1)}
                        className="h-9 rounded-full border border-hairline bg-white px-3.5 text-ink disabled:opacity-40"
                      >
                        ‹ antes
                      </button>
                      <button
                        type="button"
                        disabled={selIdx >= itens.length - 1}
                        onClick={() => mover(sel.id, 1)}
                        className="h-9 rounded-full border border-hairline bg-white px-3.5 text-ink disabled:opacity-40"
                      >
                        depois ›
                      </button>
                      {selIdx > 0 && (
                        <button
                          type="button"
                          onClick={() => mover(sel.id, -selIdx)}
                          className="h-9 rounded-full border border-[#c8a96a] bg-[#fbf6ec] px-3.5 text-ink"
                        >
                          usar como capa
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-[12px] text-ink-soft">Toque numa foto para mudar a ordem · a primeira vira capa</span>
                  )}
                </>
              )}
            </section>

            {/* Data */}
            <section className="flex flex-col gap-3">
              <span className="dv-rotulo">Data</span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["hoje", "Hoje"],
                    ["ontem", "Ontem"],
                    ["escolher", "Escolher data"],
                  ] as [ModoData, string][]
                ).map(([k, r]) => (
                  <button
                    type="button"
                    key={k}
                    onClick={() => escolherData(k)}
                    className={`h-[38px] rounded-full border px-4 text-[13px] leading-none ${
                      modoData === k ? "border-[#c8a96a] bg-[#fbf6ec] font-medium text-ink" : "border-hairline text-ink-soft"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <label className="relative flex cursor-pointer flex-col gap-2" onClick={abrirCalendario}>
                <span className="dv-display text-[22px] leading-[1.2] text-ink">{rotuloDataModal(data, anoAtual)}</span>
                <span className="h-px bg-hairline" />
                <input
                  ref={inputData}
                  type="date"
                  value={data}
                  max={hojeLocal(1)}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    setData(e.target.value);
                    setModoData(e.target.value === hojeLocal() ? "hoje" : e.target.value === hojeLocal(-1) ? "ontem" : "escolher");
                  }}
                  className="pointer-events-none absolute inset-0 opacity-0"
                  aria-label="Data da memória"
                  tabIndex={-1}
                />
              </label>
            </section>

            {/* Título */}
            <label className="flex flex-col gap-2.5">
              <span className="dv-rotulo">
                Título <span className="font-light normal-case tracking-normal">(opcional)</span>
              </span>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Um nome pra esse dia…"
                maxLength={200}
                className={`dv-campo text-[19px] leading-[1.3] ${titulo ? "dv-titulo" : "font-light"}`}
              />
            </label>

            {/* Texto */}
            <label className="flex flex-col gap-2.5">
              <span className="dv-rotulo">Texto</span>
              <textarea
                ref={textoRef}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="O que aconteceu? O que você sentiu?"
                rows={3}
                className="dv-campo resize-none text-[16px] font-light leading-[1.65]"
              />
            </label>

            {/* Autor */}
            <section className="flex flex-col gap-3">
              <span className="dv-rotulo">Quem está escrevendo</span>
              <div className="grid grid-cols-2 rounded-full border border-hairline bg-white p-[3px]">
                {(
                  [
                    ["edson", nomeEle],
                    ["ela", nomeEla],
                  ] as [Autor, string][]
                ).map(([k, n]) => (
                  <button
                    type="button"
                    key={k}
                    aria-pressed={autor === k}
                    onClick={() => setAutor(k)}
                    className={`dv-assinatura h-[42px] rounded-full text-[22px] transition-colors ${
                      autor === k ? "bg-ink text-[#f7f4ef]" : "text-ink-soft"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </section>

            {/* Opções */}
            <section className="flex flex-col">
              {[
                {
                  t: "Momento especial",
                  d: "Vira destaque grande no diário.",
                  on: especial,
                  set: () => setEspecial(!especial),
                },
                {
                  t: "Data especial",
                  d: "Aniversário de namoro, mesversário… ganha selo dourado.",
                  on: dataEsp,
                  set: () => setDataEsp(!dataEsp),
                },
              ].map((o) => (
                <button
                  type="button"
                  role="switch"
                  aria-checked={o.on}
                  key={o.t}
                  onClick={o.set}
                  className="flex items-center gap-4 border-b border-hairline py-3.5 text-left"
                >
                  <span className="flex flex-1 flex-col gap-1">
                    <span className="text-[15px] text-ink">{o.t}</span>
                    <span className="text-[12.5px] font-light leading-[1.45] text-ink-soft">{o.d}</span>
                  </span>
                  <Toggle ligado={o.on} />
                </button>
              ))}
              {especial && itens.length === 0 && (
                <span className="pt-2 text-[12px] text-[#8a6d33]">O destaque grande aparece quando a memória tem pelo menos uma foto.</span>
              )}
            </section>

            {editar && (
              <button
                type="button"
                onClick={() => setConfirmacao("excluir")}
                disabled={enviando}
                className="self-start py-1 text-[14px] text-[#9a4a3f] underline underline-offset-4"
              >
                Excluir memória
              </button>
            )}

            {enviando && <div className="pointer-events-none absolute inset-0 bg-[rgba(247,244,239,.45)]" />}
          </div>

          {erro && (
            <div role="alert" className="mx-6 mb-3 flex items-start gap-3 border border-[#ecd3cb] bg-[#f9eeea] px-3.5 py-3">
              <span className="mt-[5px] h-1.5 w-1.5 flex-none rotate-45 bg-[#c27a6c]" />
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-[14px] text-[#8f4337]">{erro.titulo}</span>
                <span className="text-[12.5px] font-light leading-[1.5] text-[#8f4337]">{erro.detalhe}</span>
              </div>
              <button type="button" onClick={guardar} className="flex-none py-1 text-[13px] font-medium text-[#8f4337] underline underline-offset-4">
                Tentar de novo
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-hairline bg-bg px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-3.5 sm:pb-5">
            <button type="button" onClick={pedirFechar} disabled={enviando} className="h-12 px-1.5 text-[15px] text-ink-soft disabled:opacity-50">
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardar}
              disabled={!temConteudo || enviando}
              className={`h-[50px] rounded-full px-[26px] text-[15px] font-medium transition-colors ${
                enviando
                  ? "cursor-progress bg-[#dcc89d] text-ink"
                  : temConteudo
                    ? "bg-[#c8a96a] text-ink shadow-[0_6px_16px_-8px_rgba(138,109,51,.6)]"
                    : "cursor-not-allowed bg-hairline text-[#8c8b84]"
              }`}
            >
              {botao}
            </button>
          </div>

          {confirmacao && (
            <Confirmacao
              tipo={confirmacao}
              ocupado={excluindo}
              erro={confirmacao === "excluir" ? erroExcluir : null}
              onNao={() => {
                setConfirmacao(null);
                setErroExcluir(null);
              }}
              onSim={confirmacao === "descartar" ? onFechar : excluir}
            />
          )}
        </div>
      </div>
    </div>
  );
}
