import Link from "next/link";
import { SiteLoginFormClient } from "@/components/SiteLoginFormClient";

const isStaticSite = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

type Props = {
  searchParams: Promise<{ erro?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  if (isStaticSite) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg px-6 py-16">
        <div className="w-full max-w-[320px] text-center">
          <p className="font-display text-[clamp(36px,8vw,52px)] font-medium leading-none text-ink">
            Diário
          </p>
          <SiteLoginFormClient />
          <p className="mt-8">
            <Link
              href="/"
              className="text-[13px] text-ink-soft underline-offset-2 hover:underline"
            >
              Voltar
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const { LoginWithServer } = await import("@/app/login/LoginWithServer");
  return LoginWithServer({ searchParams });
}
