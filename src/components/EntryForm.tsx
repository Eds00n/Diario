"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Entry } from "@/lib/types";

const BUCKET = "fotos";

type Props = {
  entry?: Entry;
};

export function EntryForm({ entry }: Props) {
  const router = useRouter();
  const isEdit = !!entry;
  const [data, setData] = useState(entry?.data ?? todayISO());
  const [texto, setTexto] = useState(entry?.texto ?? "");
  const [isDataEspecial, setIsDataEspecial] = useState(
    entry?.is_data_especial ?? false,
  );
  const [existingPhotos, setExistingPhotos] = useState<string[]>(
    entry?.fotos ?? [],
  );
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function uploadPhotos(userId: string): Promise<string[]> {
    if (files.length === 0) return [];
    const supabase = createClient();
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      urls.push(pub.publicUrl);
    }
    return urls;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Sessão expirada. Faça login de novo.");
        return;
      }

      const newUrls = await uploadPhotos(user.id);
      const fotos = [...existingPhotos, ...newUrls];

      const payload = {
        data,
        texto,
        fotos,
        is_data_especial: isDataEspecial,
      };

      if (isEdit && entry) {
        const { error: updErr } = await supabase
          .from("entries")
          .update(payload)
          .eq("id", entry.id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase.from("entries").insert(payload);
        if (insErr) throw insErr;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar. Verifique o Supabase e o bucket de fotos.");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!entry || !confirm("Excluir esta entrada?")) return;
    setLoading(true);
    const supabase = createClient();
    const { error: delErr } = await supabase
      .from("entries")
      .delete()
      .eq("id", entry.id);
    setLoading(false);
    if (delErr) {
      setError("Não foi possível excluir.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block">
        <span className="text-sm font-medium">Data</span>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="mt-1 w-full border-2 border-ink/30 bg-paper px-3 py-2"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Texto</span>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={6}
          className="mt-1 w-full border-2 border-ink/30 bg-paper px-3 py-2"
          placeholder="O que aconteceu hoje?"
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isDataEspecial}
          onChange={(e) => setIsDataEspecial(e.target.checked)}
          className="size-4 accent-accent"
        />
        <span className="text-sm">Marcar como data especial</span>
      </label>

      {existingPhotos.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Fotos atuais</p>
          <ul className="flex flex-wrap gap-2">
            {existingPhotos.map((url) => (
              <li key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-20 w-20 object-cover border border-ink/20" />
                <button
                  type="button"
                  className="absolute -right-1 -top-1 bg-accent px-1 text-xs text-paper"
                  onClick={() =>
                    setExistingPhotos((p) => p.filter((u) => u !== url))
                  }
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <label className="block">
        <span className="text-sm font-medium">Adicionar fotos</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="mt-1 block w-full text-sm"
        />
      </label>

      {error && <p className="text-sm text-accent">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="border-2 border-ink bg-ink px-6 py-2 text-paper hover:bg-accent disabled:opacity-60"
        >
          {loading ? "Salvando…" : isEdit ? "Salvar" : "Publicar"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={onDelete}
            disabled={loading}
            className="border-2 border-accent px-6 py-2 text-accent hover:bg-accent hover:text-paper"
          >
            Excluir
          </button>
        )}
      </div>
    </form>
  );
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
