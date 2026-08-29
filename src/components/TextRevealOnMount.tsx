"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type RevealableProps = {
  className?: string;
  style?: CSSProperties;
};

/**
 * Revela cada filho direto em sequência ao carregar a página — texto
 * "surgindo" em cascata, com leve desfoque, deslocamento e escala, um
 * bloco de cada vez, em vez de tudo ao mesmo tempo.
 *
 * Não adiciona nenhum elemento novo ao DOM: apenas injeta classe/estilo
 * diretamente nos filhos existentes, então seletores de irmãos (ex.:
 * `.hero-birthday-body + .hero-birthday-body`) continuam funcionando.
 */
export function TextRevealOnMount({
  children,
  startDelayMs = 0,
  staggerMs = 120,
  liftPx = 20,
  blurPx = 6,
}: {
  children: ReactNode;
  startDelayMs?: number;
  staggerMs?: number;
  liftPx?: number;
  blurPx?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setActive(true);
      return;
    }
    const id = window.setTimeout(() => setActive(true), 80 + startDelayMs);
    return () => window.clearTimeout(id);
  }, [reducedMotion, startDelayMs]);

  const show = active || reducedMotion;

  return (
    <>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        const element = child as ReactElement<RevealableProps>;
        return cloneElement(element, {
          className: `text-reveal-item motion-reduce:transition-none ${
            element.props.className ?? ""
          }`.trim(),
          style: {
            ...element.props.style,
            opacity: show ? 1 : 0,
            transform: show
              ? "translateY(0) scale(1)"
              : `translateY(${liftPx}px) scale(0.985)`,
            filter: show ? "blur(0px)" : `blur(${blurPx}px)`,
            transitionDelay: show ? `${index * staggerMs}ms` : undefined,
          },
        });
      })}
    </>
  );
}
