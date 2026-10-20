import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSiteAuthenticated } from "@/lib/site-auth";

const PUBLIC_PREFIXES = ["/login", "/images/", "/_next/", "/favicon.ico"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (await isSiteAuthenticated(request.cookies)) {
    return NextResponse.next();
  }

  // API e fotos: responde 401 em vez de redirecionar (o modal mostra o aviso).
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Faça login de novo." }, { status: 401 });
  }

  const login = request.nextUrl.clone();
  login.pathname = "/login";
  login.search = "";
  if (pathname !== "/") {
    login.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(login);
}

export const config = {
  // "/" separado: com basePath a raiz (/diario) não casa com o padrão de baixo.
  matcher: ["/", "/((?!_next/static|_next/image).*)"],
};
