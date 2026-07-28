"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Entrada ao carregar a página (hero), de cima para baixo com atraso. */
export function RevealOnMount({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const id = window.setTimeout(() => setVisible(true), 80 + delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs, reducedMotion]);

  const show = visible || reducedMotion;

  return (
    <div
      className={`will-change-[opacity,transform] transition-[opacity,transform] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${className}`}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(-36px)",
      }}
    >
      {children}
    </div>
  );
}
