import { NextResponse } from "next/server";
import { exigirLogin } from "@/lib/diario/auth";
import { ErroValidacao, TAMANHO_MAX_MIDIA, salvarMidia } from "@/lib/diario/store";

export const runtime = "nodejs";

/** Recebe UM arquivo por vez (multipart: `arquivo`, `data`). Assim o modal mostra o progresso de cada foto. */
export async function POST(request: Request) {
  const negado = await exigirLogin();
  if (negado) return negado;

  try {
    const form = await request.formData();
    const arquivo = form.get("arquivo");
    const data = String(form.get("data") ?? "");
    if (!(arquivo instanceof File) || arquivo.size === 0) {
      return NextResponse.json({ error: "Nenhum arquivo recebido." }, { status: 400 });
    }
    if (arquivo.size > TAMANHO_MAX_MIDIA) {
      return NextResponse.json({ error: "Arquivo grande demais (máx. 200 MB)." }, { status: 413 });
    }
    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const salvo = await salvarMidia(buffer, arquivo.type, arquivo.name, data);
    return NextResponse.json(salvo, { status: 201 });
  } catch (err) {
    if (err instanceof ErroValidacao) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[diario] falha ao salvar mídia", err);
    return NextResponse.json({ error: "Falha ao salvar o arquivo." }, { status: 500 });
  }
}
