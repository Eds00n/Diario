"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Passos da animação de abertura do gate: "E." aparece, depois "&", depois
 * "S.", depois o anel + "nosso diário", e por fim tudo isso dá lugar ao
 * cartão de senha. Mesmos tempos do mock do design (dc-runtime). */
const STEPS: Array<[step: number, ms: number]> = [
  [1, 260],
  [2, 760],
  [3, 1240],
  [4, 1720],
  [5, 2560],
];

function letterStyle(reached: boolean): CSSProperties {
  return {
    opacity: reached ? 1 : 0,
    transform: `translateY(${reached ? 0 : 18}px)`,
    filter: `blur(${reached ? 0 : 6}px)`,
    transition:
      "opacity .7s ease, transform .8s cubic-bezier(.22,.61,.36,1), filter .8s ease",
  };
}

/** Intro do gate: as iniciais "E. & S." surgem letra a letra, depois o anel
 * dourado e "nosso diário" em script, e então tudo isso se dissolve pra dar
 * lugar ao cartão de senha (children). Com prefers-reduced-motion, pula
 * direto pro cartão. */
export function GateIntro({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setStep(5);
      return;
    }
    const timers = STEPS.map(([s, ms]) => setTimeout(() => setStep(s), ms));
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  const ringOn = step >= 4;
  const cardOn = step >= 5;

  return (
    <div className="relative flex w-full items-center justify-center">
      <div
        className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center gap-4"
        style={{
          opacity: cardOn ? 0 : 1,
          transform: `scale(${cardOn ? 1.18 : 1})`,
          transition: "opacity .95s ease, transform 1.5s cubic-bezier(.22,.61,.36,1)",
        }}
        aria-hidden
      >
        <div className="relative flex h-[66px] w-[66px] items-center justify-center md:h-[78px] md:w-[78px]">
          <span
            className="absolute inset-0 rounded-full border border-gold"
            style={{
              opacity: ringOn ? 1 : 0,
              transform: `scale(${ringOn ? 1 : 0.82})`,
              transition: "opacity .9s ease, transform 1.1s cubic-bezier(.22,.61,.36,1)",
            }}
          />
          <div className="font-title flex items-baseline text-[22px] text-ink md:text-[26px]">
            <span style={letterStyle(step >= 1)}>E.</span>
            <span className="font-script mx-[3px] text-[19px] text-gold md:text-[22px]" style={letterStyle(step >= 2)}>
              &amp;
            </span>
            <span style={letterStyle(step >= 3)}>S.</span>
          </div>
        </div>
        <div
          className="font-script text-[23px] text-gold md:text-[26px]"
          style={{ opacity: ringOn ? 1 : 0, transition: "opacity 1s ease .1s" }}
        >
          nosso diário
        </div>
      </div>

      <div
        className="relative z-[1] w-full"
        style={{
          opacity: cardOn ? 1 : 0,
          transform: `translateY(${cardOn ? 0 : 22}px) scale(${cardOn ? 1 : 0.985})`,
          filter: `blur(${cardOn ? 0 : 10}px)`,
          transition:
            "opacity 1.1s ease, transform 1.2s cubic-bezier(.22,.61,.36,1), filter 1.1s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
