import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isSiteAuthenticated } from "@/lib/site-auth";

/** Retorna uma resposta 401 se não estiver logado; senão null. */
export async function exigirLogin(): Promise<NextResponse | null> {
  const store = await cookies();
  if (await isSiteAuthenticated(store)) return null;
  return NextResponse.json({ error: "Faça login de novo." }, { status: 401 });
}
