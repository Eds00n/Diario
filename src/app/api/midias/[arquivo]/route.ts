import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { exigirLogin } from "@/lib/diario/auth";
import { MIME_POR_EXT, RE_ARQUIVO, pastaMidias } from "@/lib/diario/store";

export const runtime = "nodejs";

/** Serve fotos e vídeos do diário, só pra quem está logado. Suporta Range (vídeo no iPhone precisa). */
export async function GET(request: Request, ctx: { params: Promise<{ arquivo: string }> }) {
  const negado = await exigirLogin();
  if (negado) return negado;

  const { arquivo } = await ctx.params;
  const nome = decodeURIComponent(arquivo);
  if (!RE_ARQUIVO.test(nome)) return new Response("Não encontrado", { status: 404 });

  const caminho = path.join(pastaMidias(), nome);
  let tamanho: number;
  try {
    tamanho = fs.statSync(caminho).size;
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }

  const tipo = MIME_POR_EXT[path.extname(nome).toLowerCase()] ?? "application/octet-stream";
  const base: Record<string, string> = {
    "Content-Type": tipo,
    "Accept-Ranges": "bytes",
    // Nome do arquivo tem o hash do conteúdo, então nunca muda.
    "Cache-Control": "private, max-age=31536000, immutable",
  };

  const range = request.headers.get("range");
  const m = range?.match(/^bytes=(\d*)-(\d*)$/);
  if (m && (m[1] || m[2])) {
    let inicio = m[1] ? Number(m[1]) : tamanho - Number(m[2]);
    let fim = m[1] && m[2] ? Number(m[2]) : tamanho - 1;
    inicio = Math.max(0, inicio);
    fim = Math.min(fim, tamanho - 1);
    if (inicio > fim) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${tamanho}` } });
    }
    const stream = fs.createReadStream(caminho, { start: inicio, end: fim });
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: {
        ...base,
        "Content-Range": `bytes ${inicio}-${fim}/${tamanho}`,
        "Content-Length": String(fim - inicio + 1),
      },
    });
  }

  const stream = fs.createReadStream(caminho);
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: { ...base, "Content-Length": String(tamanho) },
  });
}
