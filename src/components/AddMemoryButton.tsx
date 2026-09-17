"use client";

import { useRef, useState, type ClipboardEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AddMemoryButton({ defaultDate }: { defaultDate: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(defaultDate);
  const [texto, setTexto] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setDate(defaultDate);
    setTexto("");
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  }

  function pickFile(f: File | null | undefined) {
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    const item = Array.from(e.clipboardData.items).find((it) =>
      it.type.startsWith("image/"),
    );
    if (item) pickFile(item.getAsFile());
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    pickFile(e.target.files?.[0]);
  }

  async function handleSave() {
    setError(null);
    if (!texto.trim() && !file) {
      setError("Adicione um texto ou uma foto.");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = { data: date, texto };
      if (file) {
        body.mediaBase64 = await fileToBase64(file);
        body.mediaMime = file.type;
      }
      const res = await fetch("/api/adicionar-memoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? "Falha ao salvar.");
      }
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative z-[2] my-3 flex justify-center">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Adicionar memória aqui"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-ink/25 text-ink/40 opacity-60 transition hover:border-gold hover:text-gold hover:opacity-100"
      >
        +
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
            <h2 className="mb-4 font-display text-xl text-ink">Nova memória</h2>

            <label className="mb-3 block text-sm text-ink">
              Data
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full border border-ink/20 bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              />
            </label>

            <label className="mb-3 block text-sm text-ink">
              Texto
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={3}
                className="mt-1 w-full resize-none border border-ink/20 bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              />
            </label>

            <div
              tabIndex={0}
              onPaste={handlePaste}
              onClick={() => fileInputRef.current?.click()}
              className="mb-4 flex min-h-24 cursor-pointer items-center justify-center border border-dashed border-ink/25 px-3 py-4 text-center text-xs text-ink-soft outline-none focus:border-gold"
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt=""
                  className="max-h-32 max-w-full object-contain"
                />
              ) : (
                <span>Clique pra escolher, ou clique aqui e Ctrl+V</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="px-3 py-2 text-sm text-ink-soft"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="border-2 border-ink bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-accent disabled:opacity-50"
              >
                {saving ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
