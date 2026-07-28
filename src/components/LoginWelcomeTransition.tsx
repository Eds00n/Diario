"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LilyField } from "@/components/LilyField";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { isClientAuthenticated } from "@/lib/site-auth-client";

const PHRASE = "Olhe com carinho Sâmila Sara";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

type Phase = "idle" | "visible" | "exit";

export function LoginWelcomeTransition() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const next = searchParams.get("next");
  const safeNext =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/";

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "1" && !isClientAuthenticated()) {
      router.replace("/login/");
      return;
    }

    if (reducedMotion) {
      router.replace(safeNext);
      return;
    }

    const show = window.requestAnimationFrame(() => setPhase("visible"));
    const exitTimer = window.setTimeout(() => setPhase("exit"), 3400);
    const goTimer = window.setTimeout(() => router.replace(safeNext), 4600);

    return () => {
      window.cancelAnimationFrame(show);
      window.clearTimeout(exitTimer);
      window.clearTimeout(goTimer);
    };
  }, [reducedMotion, router, safeNext]);

  const hidden = phase === "idle" || phase === "exit";

  return (
    <div className="relative min-h-[100dvh] overflow-x-clip">
      <LilyField />
      <div
        className="relative z-[1] flex min-h-[100dvh] items-center justify-center px-8"
        aria-live="polite"
      >
        <div className="entry-diary-section font-serif">
          <p
            className="entry-quote entry-quote--solo mx-auto whitespace-nowrap text-center italic text-stone-700 motion-reduce:transition-none"
            style={{
              opacity: hidden ? 0 : 1,
              transform:
                phase === "idle"
                  ? "translateY(56px)"
                  : phase === "exit"
                    ? "translateY(-28px)"
                    : "translateY(0)",
              transition: `opacity 900ms ${EASE}, transform 1100ms ${EASE}`,
            }}
          >
            {PHRASE}
          </p>
        </div>
      </div>
    </div>
  );
}
