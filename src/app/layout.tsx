import type { Metadata } from "next";
import {
  Bodoni_Moda,
  Caveat,
  Cormorant_Garamond,
  EB_Garamond,
  Great_Vibes,
  Playfair_Display,
  Work_Sans,
} from "next/font/google";
import { SiteAuthGate } from "@/components/SiteAuthGate";
import "./globals.css";

const isStaticSite = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const title = Playfair_Display({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
});

const body = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

/** Carta do hero "varal" (aniversário): tipografia própria, mais editorial. */
const heroTitle = Bodoni_Moda({
  variable: "--font-hero-title",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const heroBody = EB_Garamond({
  variable: "--font-hero-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const heroSign = Caveat({
  variable: "--font-hero-sign",
  subsets: ["latin"],
  weight: ["500"],
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
      className={`${display.variable} ${title.variable} ${body.variable} ${script.variable} ${heroTitle.variable} ${heroBody.variable} ${heroSign.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-body antialiased">
        {isStaticSite ? <SiteAuthGate>{children}</SiteAuthGate> : children}
      </body>
    </html>
  );
}
