"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SpecialDate } from "@/lib/types";

export function SpecialDateForm({ item }: { item?: SpecialDate }) {
  const router = useRouter();
  const [nome, setNome] = useState(item?.nome ?? "");
  const [data, setData] = useState(item?.data ?? "");
  const [recorrente, setRecorrente] = useState(item?.recorrente ?? true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const payload = { nome, data, recorrente };
    const { error: err } = item
      ? await supabase.from("special_dates").update(payload).eq("id", item.id)
      : await supabase.from("special_dates").insert(payload);
    setLoading(false);
    if (err) {
      setError("Não foi possível salvar.");
      return;
    }
    router.push("/admin/datas-especiais");
    router.refresh();
  }

  async function onDelete() {
    if (!item || !confirm("Excluir esta data?")) return;
    const supabase = createClient();
    await supabase.from("special_dates").delete().eq("id", item.id);
    router.push("/admin/datas-especiais");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Nome</span>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="mt-1 w-full border-2 border-ink/30 bg-paper px-3 py-2"
          required
        />
      </label>
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
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={recorrente}
          onChange={(e) => setRecorrente(e.target.checked)}
        />
        <span className="text-sm">Repete todo ano</span>
      </label>
      {error && <p className="text-sm text-accent">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="border-2 border-ink bg-ink px-5 py-2 text-paper"
        >
          Salvar
        </button>
        {item && (
          <button
            type="button"
            onClick={onDelete}
            className="border-2 border-accent px-5 py-2 text-accent"
          >
            Excluir
          </button>
        )}
      </div>
    </form>
  );
}
