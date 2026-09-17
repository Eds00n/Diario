import Link from "next/link";
import { Suspense } from "react";
import { SiteLoginFormClient } from "@/components/SiteLoginFormClient";
import { LoginPageLayout } from "@/components/LoginPageLayout";
import { GateIntro } from "@/components/GateIntro";

const isStaticSite = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

type Props = {
  searchParams: Promise<{ erro?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  if (isStaticSite) {
    return (
      <LoginPageLayout>
        <div className="w-full max-w-[980px] text-center">
          <GateIntro>
            <Suspense fallback={<p className="font-body text-sm text-ink-soft">…</p>}>
              <SiteLoginFormClient />
            </Suspense>
          </GateIntro>
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
