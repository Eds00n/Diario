import { NextResponse } from "next/server";
import { exigirLogin } from "@/lib/diario/auth";
import { ErroValidacao, atualizarMemoria, excluirMemoria, validarEntrada } from "@/lib/diario/store";

export const runtime = "nodejs";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const negado = await exigirLogin();
  if (negado) return negado;
  const { id } = await ctx.params;
  try {
    const entrada = validarEntrada(await request.json());
    const memoria = await atualizarMemoria(id, entrada);
    if (!memoria) return NextResponse.json({ error: "Memória não encontrada." }, { status: 404 });
    return NextResponse.json(memoria);
  } catch (err) {
    if (err instanceof ErroValidacao) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[diario] falha ao editar memória", err);
    return NextResponse.json({ error: "Não deu pra salvar agora." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const negado = await exigirLogin();
  if (negado) return negado;
  const { id } = await ctx.params;
  try {
    const ok = await excluirMemoria(id);
    if (!ok) return NextResponse.json({ error: "Memória não encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[diario] falha ao excluir memória", err);
    return NextResponse.json({ error: "Não deu pra excluir agora." }, { status: 500 });
  }
}
