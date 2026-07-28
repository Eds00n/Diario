import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { fetchEntries } from "@/lib/data";
import { formatEntryDate } from "@/lib/dates";
import { AdminSignOut } from "@/components/AdminSignOut";

export default async function AdminPage() {
  await requireAdmin();
  const entries = await fetchEntries();

  return (
    <main className="mx-auto min-h-full max-w-lg flex-1 px-4 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Admin</h1>
          <p className="text-sm text-ink/60">Gerenciar entradas</p>
        </div>
        <AdminSignOut />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/admin/entradas/nova"
          className="border-2 border-ink bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-accent"
        >
          Nova entrada
        </Link>
        <Link
          href="/admin/datas-especiais"
          className="border-2 border-ink/40 px-4 py-2 text-sm hover:border-accent"
        >
          Datas especiais
        </Link>
        <Link href="/" className="px-2 py-2 text-sm text-ink/50 underline">
          Ver timeline
        </Link>
      </div>

      <ul className="space-y-3">
        {entries.map((e) => (
          <li key={e.id}>
            <Link
              href={`/admin/entradas/${e.id}`}
              className="block border-2 border-ink/20 bg-paper px-4 py-3 hover:border-accent"
            >
              <span className="font-medium">{formatEntryDate(e.data)}</span>
              {e.is_data_especial && (
                <span className="ml-2 text-xs text-accent">★ especial</span>
              )}
              <p className="mt-1 line-clamp-2 text-sm text-ink/70">{e.texto}</p>
            </Link>
          </li>
        ))}
        {entries.length === 0 && (
          <p className="text-sm text-ink/50">Nenhuma entrada ainda.</p>
        )}
      </ul>
    </main>
  );
}
