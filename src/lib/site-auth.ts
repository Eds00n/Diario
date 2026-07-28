import type { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";

export const SITE_AUTH_COOKIE = "diario_auth";

export function getSitePassword(): string {
  return process.env.SITE_PASSWORD?.trim() || "456987";
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function siteAuthCookieValue(): Promise<string> {
  const data = new TextEncoder().encode(`nosso-diario:${getSitePassword()}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bytesToBase64Url(new Uint8Array(hash));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isSiteAuthenticated(
  cookies: Pick<RequestCookies, "get">,
): Promise<boolean> {
  const value = cookies.get(SITE_AUTH_COOKIE)?.value;
  if (!value) return false;
  const expected = await siteAuthCookieValue();
  return safeEqual(value, expected);
}

export function verifySubmittedPassword(input: string): boolean {
  return input === getSitePassword();
}
