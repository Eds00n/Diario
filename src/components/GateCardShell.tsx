import type { ReactNode } from "react";
import { assetPath } from "@/lib/asset-path";

const GATE_PHOTO = assetPath("/images/gate-nos.jpeg");

/** Moldura + foto + cabeçalho do cartão do gate — compartilhado entre a
 * versão server (SiteLoginForm) e a versão client do export estático
 * (SiteLoginFormClient), que só diferem no `<form>` (server action vs
 * validação client-side). */
export function GateCardShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex w-full max-w-[980px] flex-col items-center gap-9 border border-hairline bg-[#fffefb] px-7 py-9 shadow-[0_18px_48px_rgba(28,28,26,0.09)] sm:px-10 sm:py-11 md:flex-row md:items-stretch md:gap-14 md:px-16 md:py-14">
      <div
        className="pointer-events-none absolute inset-[9px] border border-[#f1eee7] sm:inset-[11px]"
        aria-hidden
      />

      <div className="relative flex shrink-0 items-center justify-center">
        <figure
          className="polaroid gate-polaroid"
          style={{ transform: "rotate(-3deg)" }}
        >
          <span className="polaroid__tape" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={GATE_PHOTO}
            alt="nós dois"
            className="polaroid__media"
            style={{ objectPosition: "50% 30%" }}
          />
          <span className="gate-polaroid__caption font-script" aria-hidden>
            nós
          </span>
        </figure>
      </div>

      <div className="hidden w-px self-stretch bg-[#efece6] md:block" aria-hidden />

      <div className="flex w-full max-w-[360px] flex-col items-center text-center md:max-w-[330px] md:items-start md:justify-center md:text-left">
        <p className="font-script text-[24px] leading-none text-gold md:text-[27px]">
          para você
        </p>
        <h1 className="font-title mt-2 text-[34px] font-normal leading-[1.05] text-ink md:mt-2.5 md:text-[48px] md:leading-[1.03]">
          Nosso Diário
        </h1>
        <div className="mt-4 flex items-center gap-2.5 md:mt-5">
          <span className="h-px w-[30px] bg-[#e0d6bf] md:w-[34px]" />
          <span className="h-[5px] w-[5px] shrink-0 rotate-45 bg-gold" />
          <span className="h-px w-[30px] bg-[#e0d6bf] md:hidden" />
        </div>
        <p className="mt-3.5 max-w-[250px] font-display text-[18px] italic leading-[1.5] text-ink-soft md:mt-4.5 md:max-w-none md:text-[20px]">
          <span className="md:hidden">Tudo o que a gente viveu mora aqui dentro.</span>
          <span className="hidden md:inline">
            Tudo o que a gente viveu mora aqui dentro. Diz a palavra e entra.
          </span>
        </p>

        {children}

        <p className="mt-4 font-display text-[13px] tracking-[0.06em] text-ink-soft/75 md:mt-[30px] md:text-sm">
          desde 14 · 03 · 2023
        </p>
      </div>
    </div>
  );
}
