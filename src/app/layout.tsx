import type { Metadata } from "next";
import { Bebas_Neue, Cormorant_Garamond, Work_Sans } from "next/font/google";
import { SiteAuthGate } from "@/components/SiteAuthGate";
import "./globals.css";

const isStaticSite = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const body = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

/** Estilo próximo ao Intro Rust (Canva) — caps desgastadas. */
const entryRust = Rubik_Distressed({
  variable: "--font-entry-rust",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Nosso Diário",
  description: "Memórias do casal em linha do tempo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${body.variable} ${entryRust.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-body antialiased">
        {isStaticSite ? <SiteAuthGate>{children}</SiteAuthGate> : children}
      </body>
    </html>
  );
}
