import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { submitSiteLogin } from "@/app/login/actions";
import { SiteLoginForm } from "@/components/SiteLoginForm";
import { LoginPageLayout } from "@/components/LoginPageLayout";
import { isSiteAuthenticated } from "@/lib/site-auth";

type Props = {
  searchParams: Promise<{ erro?: string; next?: string }>;
};

export async function LoginWithServer({ searchParams }: Props) {
  const store = await cookies();
  if (await isSiteAuthenticated(store)) {
    redirect("/");
  }

  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "/";
  const showError = params.erro === "1";

  return (
    <LoginPageLayout>
      <div className="w-full max-w-[320px] text-center">
        <p className="font-display text-[clamp(36px,8vw,52px)] font-medium leading-none text-ink">
          Diário
        </p>
        <SiteLoginForm action={submitSiteLogin} next={next} showError={showError} />
      </div>
    </LoginPageLayout>
  );
}
