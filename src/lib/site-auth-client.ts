"use client";

const AUTH_KEY = "diario_auth_ok";

export function getSitePasswordClient(): string {
  return process.env.NEXT_PUBLIC_SITE_PASSWORD?.trim() || "456987";
}

export function verifyClientPassword(input: string): boolean {
  return input === getSitePasswordClient();
}

export function isClientAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export function setClientAuthenticated(): void {
  sessionStorage.setItem(AUTH_KEY, "1");
}

export function clearClientAuthenticated(): void {
  sessionStorage.removeItem(AUTH_KEY);
}
