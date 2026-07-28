import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { getAdminUser } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  const user = await getAdminUser();
  if (user) redirect("/admin");

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="font-display text-3xl text-ink">Admin</h1>
        <p className="mt-2 text-sm text-ink/60">Login para editar o diário</p>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
        <p className="mt-8 text-xs text-ink/40">
          <Link href="/" className="underline">
            Ver o diário
          </Link>
        </p>
      </div>
    </main>
  );
}
