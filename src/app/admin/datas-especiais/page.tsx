import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { fetchSpecialDates } from "@/lib/data";
import { formatEntryDate, specialDateCountdown } from "@/lib/dates";

export default async function DatasEspeciaisAdminPage() {
  await requireAdmin();
  const items = await fetchSpecialDates();

  return (
    <main className="mx-auto min-h-full max-w-lg flex-1 px-4 py-8">
      <Link href="/admin" className="text-sm text-ink/50 underline">
        ← Admin
      </Link>
      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ink">Datas especiais</h1>
        <Link
          href="/admin/datas-especiais/nova"
          className="border-2 border-ink bg-ink px-3 py-1.5 text-sm text-paper"
        >
          Nova
        </Link>
      </div>
      <ul className="mt-6 space-y-3">
        {items.map((item) => {
          const { label } = specialDateCountdown(item.data, item.recorrente);
          return (
            <li key={item.id}>
              <Link
                href={`/admin/datas-especiais/${item.id}`}
                className="block border-2 border-ink/20 bg-paper px-4 py-3 hover:border-accent"
              >
                <span className="font-medium">{item.nome}</span>
                <p className="text-sm text-ink/60">
                  {formatEntryDate(item.data)} · {label}
                </p>
              </Link>
            </li>
          );
        })}
        {items.length === 0 && (
          <p className="text-sm text-ink/50">Nenhuma data cadastrada.</p>
        )}
      </ul>
    </main>
  );
}
