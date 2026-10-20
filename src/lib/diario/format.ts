import type { GrupoMes, Midia, MemoriaPublica } from "./types";

export const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
export const MESES_CURTOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
export const DIAS_SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

export const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function partesData(data: string) {
  const [ano, mes, dia] = data.split("-").map(Number);
  const semana = DIAS_SEMANA[new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()];
  return { ano, mes, dia, semana };
}

/** "12 de setembro · sábado" */
export function rotuloDataCard(data: string) {
  const { dia, mes, semana } = partesData(data);
  return `${dia} de ${MESES[mes - 1]} · ${semana}`;
}

/** "segunda, 19 de outubro" (+ " de 2025" se não for o ano atual) */
export function rotuloDataModal(data: string, anoAtual: number) {
  const { ano, mes, dia, semana } = partesData(data);
  return `${semana}, ${dia} de ${MESES[mes - 1]}${ano !== anoAtual ? ` de ${ano}` : ""}`;
}

export function urlMidia(arquivo: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";
  return `${base}/api/midias/${encodeURIComponent(arquivo)}`;
}

export type Variante = "a" | "b" | "c" | "d" | "e" | "f";

/**
 * a só texto · b 1 foto · c 2 mídias em leque · d 3+ pilha/carrossel · e 1 vídeo · f momento especial.
 * Vídeos dentro de c/d tocam mudos em loop no lugar da foto.
 */
export function varianteDe(m: Pick<MemoriaPublica, "momento_especial" | "midias">): Variante {
  const midias: Midia[] = m.midias ?? [];
  if (m.momento_especial && midias.length > 0) return "f";
  if (midias.length === 0) return "a";
  if (midias.length === 1) return midias[0].tipo === "video" ? "e" : "b";
  if (midias.length === 2) return "c";
  return "d";
}

export function ordenarMemorias<T extends Pick<MemoriaPublica, "data" | "criado_em">>(lista: T[]): T[] {
  return [...lista].sort(
    (a, b) => b.data.localeCompare(a.data) || b.criado_em.localeCompare(a.criado_em),
  );
}

export function agruparPorMes(memorias: MemoriaPublica[]): GrupoMes[] {
  const grupos: GrupoMes[] = [];
  for (const m of ordenarMemorias(memorias)) {
    const chave = m.data.slice(0, 7);
    let g = grupos[grupos.length - 1];
    if (!g || g.chave !== chave) {
      const { ano, mes } = partesData(m.data);
      g = { chave, mes: capitalizar(MESES[mes - 1]), ano, memorias: [] };
      grupos.push(g);
    }
    g.memorias.push(m);
  }
  return grupos;
}

export function contagemMemorias(n: number) {
  return `${n} ${n === 1 ? "memória" : "memórias"}`;
}

/** Data local (do aparelho) no formato AAAA-MM-DD. */
export function hojeLocal(deslocamentoDias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + deslocamentoDias);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function diasEntre(a: string, b: string) {
  const [ya, ma, da] = a.split("-").map(Number);
  const [yb, mb, db] = b.split("-").map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86_400_000);
}

/** Contador do topo: dias juntos e o próximo mesversário/aniversário. */
export function calcularContador(inicio: string, hoje: string) {
  const dias = Math.max(0, diasEntre(inicio, hoje));
  const [yi, mi, di] = inicio.split("-").map(Number);
  const [yh, mh] = hoje.split("-").map(Number);

  // Próximo dia "di" a partir de hoje (ajusta pra meses curtos).
  let ano = yh;
  let mes = mh;
  let proxima = "";
  for (let i = 0; i < 3; i++) {
    const ultimo = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
    const dia = Math.min(di, ultimo);
    const cand = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    if (diasEntre(hoje, cand) >= 0) {
      proxima = cand;
      break;
    }
    mes += 1;
    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
  }
  const meses = (ano - yi) * 12 + (mes - mi);
  const faltam = proxima ? diasEntre(hoje, proxima) : 0;
  const anual = meses > 0 && meses % 12 === 0;
  const evento = anual
    ? `${meses / 12 === 1 ? "nosso primeiro" : `nossos ${meses / 12}`} ${meses / 12 === 1 ? "aniversário" : "anos"} de namoro`
    : `${meses === 1 ? "nosso primeiro mês" : `nossos ${meses} meses`}`;
  return { dias, faltam, evento, hojeEDia: faltam === 0 && meses > 0 };
}

/** "02.02.2026" */
export function dataComPontos(data: string) {
  const [y, m, d] = data.split("-");
  return `${d}.${m}.${y}`;
}
