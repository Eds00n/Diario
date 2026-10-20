"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  SITE_AUTH_COOKIE,
  siteAuthCookieValue,
  verifySubmittedPassword,
} from "@/lib/site-auth";

export async function submitSiteLogin(formData: FormData) {
  const senha = String(formData.get("senha") ?? "");
  const next = String(formData.get("next") ?? "/");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (!verifySubmittedPassword(senha)) {
    redirect(`/login?erro=1&next=${encodeURIComponent(safeNext)}`);
  }

  const store = await cookies();
  // Só marca "secure" quando o acesso é por HTTPS — o site roda em http://IP e o cookie sumiria.
  const proto = (await headers()).get("x-forwarded-proto")?.split(",")[0]?.trim();
  store.set(SITE_AUTH_COOKIE, await siteAuthCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });

  redirect(
    safeNext === "/"
      ? "/bem-vindo"
      : `/bem-vindo?next=${encodeURIComponent(safeNext)}`,
  );
}
