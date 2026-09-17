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
      <Suspense fallback={<p className="font-body text-sm text-ink-soft">…</p>}>
        <SiteLoginFormClient />
      </Suspense>
    </LoginPageLayout>
  );
}
