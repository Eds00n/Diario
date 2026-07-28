"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isClientAuthenticated } from "@/lib/site-auth-client";

export function SiteAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  const onLoginPath =
    pathname === "/login" ||
    pathname === "/login/" ||
    pathname.endsWith("/login") ||
    pathname.endsWith("/login/") ||
    pathname === "/entrar" ||
    pathname === "/entrar/" ||
    pathname.endsWith("/entrar") ||
    pathname.endsWith("/entrar/");

  useEffect(() => {
    const ok = isClientAuthenticated();
    setAuthed(ok);
    setReady(true);
    if (!ok && !onLoginPath) {
      router.replace("/login/");
    }
  }, [onLoginPath, router]);

  if (!ready) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-bg">
        <p className="font-body text-sm text-ink-soft">…</p>
      </main>
    );
  }

  if (!authed && !onLoginPath) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-bg">
        <p className="font-body text-sm text-ink-soft">Redirecionando…</p>
      </main>
    );
  }

  return <>{children}</>;
}
