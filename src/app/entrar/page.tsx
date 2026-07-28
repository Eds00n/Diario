import { redirect } from "next/navigation";
import { SiteLoginFormClient } from "@/components/SiteLoginFormClient";

export default function EntrarPage() {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT !== "1") {
    redirect("/login");
  }

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg px-6 py-16">
      <div className="w-full max-w-[320px] text-center">
        <p className="font-display text-[clamp(36px,8vw,52px)] font-medium leading-none text-ink">
          Diário
        </p>
        <SiteLoginFormClient />
      </div>
    </main>
  );
}
