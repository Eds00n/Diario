import type { Entry } from "@/lib/types";

export type EntryEditorialCopy = {
  /** Título curto editorial (2–5 palavras); omitir para texto longo estilo citação. */
  title?: string;
  /** Texto principal sempre renderizado como citação (itálico, aspas). */
  caption: string;
};

const MAX_TITLE_WORDS = 4;
/** Títulos em fotos importantes podem ser um pouco mais longos. */
const MAX_TITLE_WORDS_IMPORTANT = 8;
const MAX_TITLE_CHARS = 48;

function stripMarkup(text: string): string {
  return text
    .replace(/\{\{[^}]+\}\}/g, (m) => m.slice(2, -2))
    .replace(/\*\*([^*]+)\*\*/g, "$1");
}

function wordCount(text: string): number {
  const plain = stripMarkup(text).trim();
  if (!plain) return 0;
  return plain.split(/\s+/).length;
}

/** Texto curto o bastante para cabeçalho grande (não parágrafo de WhatsApp). */
export function isShortEntryTitle(
  text: string,
  importantPhoto = false,
): boolean {
  const t = text.trim();
  if (!t || t.includes("\n")) return false;
  if (t.length > MAX_TITLE_CHARS) return false;
  const maxWords = importantPhoto ? MAX_TITLE_WORDS_IMPORTANT : MAX_TITLE_WORDS;
  if (wordCount(t) > maxWords) return false;
  return true;
}

export function getEntryEditorialCopy(entry: Entry): EntryEditorialCopy {
  const allowTitle = entry.foto_importante === true;
  const explicitTitle = entry.titulo?.trim();
  const texto = entry.texto.trim();
  const complemento = entry.texto_complemento?.trim();

  if (entry.citacao_apenas && texto) {
    return {
      caption: complemento ? [texto, complemento].join("\n\n") : texto,
    };
  }

  if (explicitTitle) {
    if (allowTitle) {
      const caption =
        complemento ??
        (texto && texto !== explicitTitle ? texto : "");
      return { title: explicitTitle, caption };
    }
    const extra = [
      texto && texto !== explicitTitle ? texto : "",
      complemento ?? "",
    ]
      .filter(Boolean)
      .join("\n\n");
    return {
      caption: extra ? [explicitTitle, extra].join("\n\n") : explicitTitle,
    };
  }

  if (texto && complemento && isShortEntryTitle(texto, allowTitle)) {
    if (allowTitle) {
      return { title: texto, caption: complemento };
    }
    return { caption: [texto, complemento].join("\n\n") };
  }

  if (texto && complemento && !isShortEntryTitle(texto, allowTitle)) {
    return {
      caption: [texto, complemento].filter(Boolean).join("\n\n"),
    };
  }

  if (texto && isShortEntryTitle(texto, allowTitle) && !complemento) {
    if (allowTitle) {
      return { title: texto, caption: "" };
    }
    return { caption: texto };
  }

  if (texto) {
    return { caption: texto };
  }

  return { caption: "" };
}
