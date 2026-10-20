import { NextResponse } from "next/server";
import { exigirLogin } from "@/lib/diario/auth";
import { ErroValidacao, criarMemoria, listarMemorias, validarEntrada } from "@/lib/diario/store";

export const runtime = "nodejs";

export async function GET() {
  const negado = await exigirLogin();
  if (negado) return negado;
  return NextResponse.json(await listarMemorias());
}

export async function POST(request: Request) {
  const negado = await exigirLogin();
  if (negado) return negado;
  try {
    const entrada = validarEntrada(await request.json());
    const memoria = await criarMemoria(entrada);
    return NextResponse.json(memoria, { status: 201 });
  } catch (err) {
    if (err instanceof ErroValidacao) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[diario] falha ao criar memória", err);
    return NextResponse.json({ error: "Não deu pra guardar agora." }, { status: 500 });
  }
}
