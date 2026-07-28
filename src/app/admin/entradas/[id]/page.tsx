import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { fetchEntry } from "@/lib/data";
import { EntryForm } from "@/components/EntryForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditarEntradaPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const entry = await fetchEntry(id);
  if (!entry) notFound();

  return (
    <main className="mx-auto min-h-full max-w-lg flex-1 px-4 py-8">
      <Link href="/admin" className="text-sm text-ink/50 underline">
        ← Voltar
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink">Editar entrada</h1>
      <div className="mt-6">
        <EntryForm entry={entry} />
      </div>
    </main>
  );
}
