import { Suspense } from "react";
import { LoginWelcomeTransition } from "@/components/LoginWelcomeTransition";

export default function BemVindoPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100dvh] items-center justify-center bg-bg">
          <p className="font-body text-sm text-ink-soft">…</p>
        </main>
      }
    >
      <LoginWelcomeTransition />
    </Suspense>
  );
}
