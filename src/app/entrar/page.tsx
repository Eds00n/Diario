import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SiteLoginFormClient } from "@/components/SiteLoginFormClient";
import { LoginPageLayout } from "@/components/LoginPageLayout";

export default function EntrarPage() {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT !== "1") {
    redirect("/login");
  }

  return (
    <LoginPageLayout>
      <div className="w-full max-w-[320px] text-center">
        <p className="font-display text-[clamp(36px,8vw,52px)] font-medium leading-none text-ink">
          Diário
        </p>
        <Suspense fallback={<p className="mt-10 font-body text-sm text-ink-soft">…</p>}>
          <SiteLoginFormClient />
        </Suspense>
      </div>
    </LoginPageLayout>
  );
}
