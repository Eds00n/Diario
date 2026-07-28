import type { ReactNode } from "react";
import { LilyField } from "@/components/LilyField";

export function LoginPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] overflow-x-clip">
      <LilyField />
      <main className="relative z-[1] flex min-h-[100dvh] flex-col items-center justify-center bg-transparent px-6 py-16">
        {children}
      </main>
    </div>
  );
}
