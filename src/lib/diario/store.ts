import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ordenarMemorias } from "./format";
import type {
  DataEspecial,
  Diario,
  EntradaMemoria,
  Memoria,
  MemoriaPublica,
  TipoMidia,
} from "./types";

/** Pasta dos dados, fora do código (sobrevive a deploys). */
export function pastaDados(): string {
  const env = process.env.DIARIO_DATA_DIR?.trim();
  return path.resolve(env || path.join(process.cwd(), "diario-data"));
}

const arquivoDiario = () => path.join(pastaDados(), "diario.json");
export const pastaMidias = () => path.join(pastaDados(), "midias");
const pastaBackups = () => path.join(pastaDados(), "backups");
const pastaLixeira = () => path.join(pastaDados(), "lixeira");

const MAX_BACKUPS = 30;

function diarioVazio(): Diario {
  return { versao: 1, memorias: [], datas_especiais: [] };
}

export async function lerDiario(): Promise<Diario> {
  try {
    const raw = await fsp.readFile(arquivoDiario(), "utf8");
    const d = JSON.parse(raw) as Diario;
    return {
      ...d,
      memorias: Array.isArray(d.memorias) ? d.memorias : [],
      datas_especiais: Array.isArray(d.datas_especiais) ? d.datas_especiais : [],
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return diarioVazio();
    throw err;
  }
}

function carimbo() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}-${p(d.getMilliseconds() % 100)}`;
}

async function fazerBackup() {
  const atual = arquivoDiario();
  if (!fs.existsSync(atual)) return;
  await fsp.mkdir(pastaBackups(), { recursive: true });
  await fsp.copyFile(atual, path.join(pastaBackups(), `diario-${carimbo()}.json`));
  const lista = (await fsp.readdir(pastaBackups()))
    .filter((f) => f.startsWith("diario-") && f.endsWith(".json"))
    .sort();
  for (const velho of lista.slice(0, Math.max(0, lista.length - MAX_BACKUPS))) {
    await fsp.rm(path.join(pastaBackups(), velho), { force: true });
  }
}

async function salvarDiario(d: Diario) {
  await fsp.mkdir(pastaDados(), { recursive: true });
  await fazerBackup();
  const destino = arquivoDiario();
  const tmp = `${destino}.${process.pid}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(d, null, 2));
  await fsp.rename(tmp, destino);
}

/** Fila simples: uma alteração por vez, pra duas pessoas salvando juntas não se atropelarem. */
let fila: Promise<unknown> = Promise.resolve();
function emFila<T>(fn: () => Promise<T>): Promise<T> {
  const r = fila.then(fn, fn);
  fila = r.catch(() => undefined);
  return r;
}

export function semLegado(m: Memoria): MemoriaPublica {
  const { _legado, ...resto } = m;
  const posicao = typeof _legado?.foto_object_position === "string" ? _legado.foto_object_position : undefined;
  const inteira = _legado?.foto_sem_corte === true;
  return posicao || inteira ? { ...resto, ajuste: { posicao, inteira } } : resto;
}

export async function listarMemorias(): Promise<MemoriaPublica[]> {
  const d = await lerDiario();
  return ordenarMemorias(d.memorias).map(semLegado);
}

export async function listarDatasEspeciais(): Promise<DataEspecial[]> {
  return (await lerDiario()).datas_especiais;
}

// ── validação ────────────────────────────────────────────────

export class ErroValidacao extends Error {}

const RE_DATA = /^\d{4}-\d{2}-\d{2}$/;
export const RE_ARQUIVO = /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/;

export function validarEntrada(body: unknown): EntradaMemoria {
  const b = (body ?? {}) as Record<string, unknown>;
  const data = String(b.data ?? "").trim();
  if (!RE_DATA.test(data) || Number.isNaN(Date.parse(data))) {
    throw new ErroValidacao("Data inválida.");
  }
  const titulo = String(b.titulo ?? "").trim().slice(0, 200) || null;
  const texto = String(b.texto ?? "").replace(/\r\n/g, "\n").trim().slice(0, 20_000);
  const midiasRaw = Array.isArray(b.midias) ? b.midias : [];
  const midias = midiasRaw.slice(0, 40).map((x) => {
    const m = (x ?? {}) as Record<string, unknown>;
    const arquivo = String(m.arquivo ?? "");
    const tipo = m.tipo === "video" ? "video" : "foto";
    if (!RE_ARQUIVO.test(arquivo) || !fs.existsSync(path.join(pastaMidias(), arquivo))) {
      throw new ErroValidacao("Uma das fotos não foi encontrada. Envie de novo.");
    }
    return { arquivo, tipo: tipo as TipoMidia };
  });
  if (!texto && midias.length === 0) {
    throw new ErroValidacao("Adicione um texto ou uma foto.");
  }
  const autor = b.autor === "ela" ? "ela" : "edson";
  return {
    data,
    titulo,
    texto,
    midias,
    autor,
    momento_especial: b.momento_especial === true,
    data_especial: b.data_especial === true,
  };
}

// ── memórias ─────────────────────────────────────────────────

export function criarMemoria(entrada: EntradaMemoria): Promise<MemoriaPublica> {
  return emFila(async () => {
    const d = await lerDiario();
    const agora = new Date().toISOString();
    const nova: Memoria = {
      id: `m_${crypto.randomBytes(6).toString("hex")}`,
      ...entrada,
      criado_em: agora,
      atualizado_em: null,
    };
    d.memorias.push(nova);
    await salvarDiario(d);
    return semLegado(nova);
  });
}

export function atualizarMemoria(id: string, entrada: EntradaMemoria): Promise<MemoriaPublica | null> {
  return emFila(async () => {
    const d = await lerDiario();
    const i = d.memorias.findIndex((m) => m.id === id);
    if (i < 0) return null;
    const antes = d.memorias[i];
    const depois: Memoria = {
      ...antes,
      ...entrada,
      id: antes.id,
      criado_em: antes.criado_em,
      atualizado_em: new Date().toISOString(),
    };
    d.memorias[i] = depois;
    await salvarDiario(d);
    await moverOrfasParaLixeira(d, antes.midias.map((m) => m.arquivo));
    return semLegado(depois);
  });
}

export function excluirMemoria(id: string): Promise<boolean> {
  return emFila(async () => {
    const d = await lerDiario();
    const alvo = d.memorias.find((m) => m.id === id);
    if (!alvo) return false;
    d.memorias = d.memorias.filter((m) => m.id !== id);
    await salvarDiario(d);
    await moverOrfasParaLixeira(d, alvo.midias.map((m) => m.arquivo));
    return true;
  });
}

/** Arquivos que nenhuma memória usa mais vão pra lixeira (nunca são apagados). */
async function moverOrfasParaLixeira(d: Diario, candidatos: string[]) {
  const emUso = new Set(d.memorias.flatMap((m) => m.midias.map((x) => x.arquivo)));
  for (const arquivo of candidatos) {
    if (emUso.has(arquivo) || !RE_ARQUIVO.test(arquivo)) continue;
    const de = path.join(pastaMidias(), arquivo);
    if (!fs.existsSync(de)) continue;
    await fsp.mkdir(pastaLixeira(), { recursive: true });
    await fsp.rename(de, path.join(pastaLixeira(), `${carimbo()}-${arquivo}`)).catch(() => undefined);
  }
}

// ── mídias ───────────────────────────────────────────────────

const EXT_POR_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/heic": ".heic",
  "image/heif": ".heic",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
};

export const MIME_POR_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".m4v": "video/mp4",
  ".webm": "video/webm",
};

export const TAMANHO_MAX_MIDIA = 200 * 1024 * 1024;

export async function salvarMidia(
  conteudo: Buffer,
  mime: string,
  nomeOriginal: string,
  data: string,
): Promise<{ arquivo: string; tipo: TipoMidia }> {
  let ext = EXT_POR_MIME[mime.toLowerCase()];
  if (!ext) {
    const e = path.extname(nomeOriginal).toLowerCase();
    if (MIME_POR_EXT[e]) ext = e === ".jpeg" ? ".jpg" : e;
  }
  if (!ext) throw new ErroValidacao("Formato não suportado. Use foto (JPG, PNG, WEBP) ou vídeo (MP4, MOV).");
  const tipo: TipoMidia = MIME_POR_EXT[ext].startsWith("video/") ? "video" : "foto";
  const prefixo = RE_DATA.test(data) ? data : new Date().toISOString().slice(0, 10);
  const hash = crypto.createHash("sha1").update(conteudo).digest("hex").slice(0, 10);
  const arquivo = `${prefixo}-${hash}${ext}`;
  await fsp.mkdir(pastaMidias(), { recursive: true });
  const destino = path.join(pastaMidias(), arquivo);
  if (!fs.existsSync(destino)) {
    const tmp = `${destino}.${process.pid}.tmp`;
    await fsp.writeFile(tmp, conteudo);
    await fsp.rename(tmp, destino);
  }
  return { arquivo, tipo };
}
