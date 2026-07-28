"use client";

import type { ReactNode } from "react";
import { FontShuffleText } from "@/components/FontShuffleText";

function parseEmphasis(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\{\{[^}]+\}\})/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const word = part.slice(2, -2);
      return (
        <span
          key={`em-${index}-${word}`}
          className="entry-text-heavy inline-block align-baseline"
        >
          {word}
        </span>
      );
    }
    if (part.startsWith("{{") && part.endsWith("}}")) {
      const phrase = part.slice(2, -2);
      return (
        <FontShuffleText key={`shuffle-${index}-${phrase}`} text={phrase} />
      );
    }
    return part;
  });
}

/** **negrito** editorial; {{texto}} = font shuffle ao entrar na tela. */
export function EntryTextEmphasis({ text }: { text: string }) {
  return <>{parseEmphasis(text)}</>;
}
