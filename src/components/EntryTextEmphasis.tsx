import type { ReactNode } from "react";

function parseEmphasis(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\{\{[^}]+\}\})/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const word = part.slice(2, -2);
      return (
        <span key={`em-${index}-${word}`} className="font-bold">
          {word}
        </span>
      );
    }
    if (part.startsWith("{{") && part.endsWith("}}")) {
      const phrase = part.slice(2, -2);
      return (
        <span
          key={`heavy-${index}-${phrase}`}
          className="entry-text-heavy inline-block max-w-full align-baseline leading-[1.15] not-italic whitespace-normal"
        >
          {phrase}
        </span>
      );
    }
    return part;
  });
}

/** **negrito** editorial; {{texto}} = destaque em caps (Work Sans). */
export function EntryTextEmphasis({ text }: { text: string }) {
  return <>{parseEmphasis(text)}</>;
}
