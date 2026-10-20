"use client";

import type { EntradaMemoria, Midia, MemoriaPublica } from "./types";

export function apiUrl(caminho: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";
  return `${base}${caminho}`;
}

export class ErroApi extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const MSG_SESSAO = "Sua sessão expirou. Entre de novo numa outra aba e tente outra vez.";

async function lerErro(res: Response) {
  if (res.status === 401) return new ErroApi(MSG_SESSAO, 401);
  const j = (await res.json().catch(() => null)) as { error?: string } | null;
  return new ErroApi(j?.error ?? "Não deu pra guardar agora.", res.status);
}

const LADO_MAX = 2560;

/** Reduz fotos grandes do celular antes de enviar (mais rápido no 4G). Vídeos e GIFs vão como estão. */
export async function prepararArquivo(arquivo: File): Promise<File> {
  const tipo = arquivo.type.toLowerCase();
  if (!/^image\/(jpeg|png|webp)$/.test(tipo) || arquivo.size < 1_200_000) return arquivo;
  try {
    const bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
    const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * escala);
    const h = Math.round(bitmap.height * escala);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return arquivo;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.86));
    if (!blob || blob.size >= arquivo.size) return arquivo;
    return new File([blob], arquivo.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return arquivo;
  }
}

/** Envia um arquivo e informa o progresso (0–100). */
export function enviarMidia(arquivo: File, data: string, onProgresso: (pct: number) => void): Promise<Midia> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl("/api/midias"));
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgresso(Math.min(99, Math.round((e.loaded / e.total) * 100)));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response?.arquivo) {
        onProgresso(100);
        resolve(xhr.response as Midia);
      } else if (xhr.status === 401) {
        reject(new ErroApi(MSG_SESSAO, 401));
      } else {
        reject(new ErroApi(xhr.response?.error ?? "Falha no envio.", xhr.status));
      }
    };
    xhr.onerror = () => reject(new ErroApi("A conexão caiu.", 0));
    xhr.ontimeout = () => reject(new ErroApi("A conexão caiu.", 0));
    const form = new FormData();
    form.append("data", data);
    form.append("arquivo", arquivo, arquivo.name || "arquivo");
    xhr.send(form);
  });
}

export async function salvarMemoria(entrada: EntradaMemoria, id?: string): Promise<MemoriaPublica> {
  const res = await fetch(apiUrl(id ? `/api/memorias/${encodeURIComponent(id)}` : "/api/memorias"), {
    method: id ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entrada),
  });
  if (!res.ok) throw await lerErro(res);
  return (await res.json()) as MemoriaPublica;
}

export async function apagarMemoria(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/memorias/${encodeURIComponent(id)}`), { method: "DELETE" });
  if (!res.ok) throw await lerErro(res);
}
