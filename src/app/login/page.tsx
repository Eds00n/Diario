import Link from "next/link";
import { Suspense } from "react";
import { SiteLoginFormClient } from "@/components/SiteLoginFormClient";
import { LoginPageLayout } from "@/components/LoginPageLayout";

const isStaticSite = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

type Props = {
  searchParams: Promise<{ erro?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  if (isStaticSite) {
    return (
      <LoginPageLayout>
        <div className="w-full max-w-[320px] text-center">
          <p className="font-display text-[clamp(36px,8vw,52px)] font-medium leading-none text-ink">
            Diário
          </p>
          <Suspense fallback={<p className="mt-10 font-body text-sm text-ink-soft">…</p>}>
            <SiteLoginFormClient />
          </Suspense>
          <p className="mt-8">
            <Link
              href="/"
              className="text-[13px] text-ink-soft underline-offset-2 hover:underline"
            >
              Voltar
            </Link>
          </p>
        </div>
      </LoginPageLayout>
    );
  }

  const { LoginWithServer } = await import("@/app/login/LoginWithServer");
  return LoginWithServer({ searchParams });
}
