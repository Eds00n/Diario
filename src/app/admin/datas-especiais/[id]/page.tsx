import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";
import { SpecialDateForm } from "@/components/SpecialDateForm";
import type { SpecialDate } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function EditarDataEspecialPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("special_dates")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <main className="mx-auto min-h-full max-w-lg flex-1 px-4 py-8">
      <Link href="/admin/datas-especiais" className="text-sm text-ink/50 underline">
        ← Voltar
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink">Editar data</h1>
      <div className="mt-6">
        <SpecialDateForm item={data as SpecialDate} />
      </div>
    </main>
  );
}
