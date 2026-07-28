import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSiteAuthenticated } from "@/lib/site-auth";

const PUBLIC_PREFIXES = [
  "/login",
  "/api/memoria-foto",
  "/images/",
  "/_next/",
  "/favicon.ico",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (await isSiteAuthenticated(request.cookies)) {
    return NextResponse.next();
  }

  const login = new URL("/login", request.url);
  if (pathname !== "/") {
    login.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
