import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { SpecialDateForm } from "@/components/SpecialDateForm";

export default async function NovaDataEspecialPage() {
  await requireAdmin();

  return (
    <main className="mx-auto min-h-full max-w-lg flex-1 px-4 py-8">
      <Link href="/admin/datas-especiais" className="text-sm text-ink/50 underline">
        ← Voltar
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink">Nova data especial</h1>
      <div className="mt-6">
        <SpecialDateForm />
      </div>
    </main>
  );
}
