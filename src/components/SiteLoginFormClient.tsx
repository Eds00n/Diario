"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  setClientAuthenticated,
  verifyClientPassword,
} from "@/lib/site-auth-client";

export function SiteLoginFormClient() {
  const router = useRouter();
  const [showError, setShowError] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const senha = String(new FormData(form).get("senha") ?? "");
    if (!verifyClientPassword(senha)) {
      setShowError(true);
      return;
    }
    setClientAuthenticated();
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 text-left">
      <label
        htmlFor="senha"
        className="mb-2 block text-[13px] font-medium uppercase tracking-[0.12em] text-gold"
      >
        senha
      </label>
      <input
        id="senha"
        name="senha"
        type="password"
        autoComplete="current-password"
        required
        className="w-full border border-hairline bg-paper/80 px-4 py-3 font-body text-[15px] text-ink outline-none ring-0 focus:border-gold/60"
      />
      {showError ? (
        <p className="mt-3 text-[13px] text-ink-soft" role="alert">
          Senha incorreta.
        </p>
      ) : null}
      <button
        type="submit"
        className="mt-6 w-full bg-ink py-3 font-body text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-ink/90"
      >
        Entrar
      </button>
    </form>
  );
}
