"use server";

import { cookies } from "next/headers";
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
  store.set(SITE_AUTH_COOKIE, await siteAuthCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });

  redirect(safeNext);
}
