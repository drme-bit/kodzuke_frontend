import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { headers } from "next/headers";
import { normalizeLocale, translator } from "@/i18n/ui";
import { Suspense } from "react";
import { NavBar } from "@/features/navigation/components/NavBar";

import "@/styles/index.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale((await headers()).get("x-kodzuke-locale") ?? "ru");
  return { title: "KodZuke", description: translator(locale)("withoutLimits") };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = normalizeLocale((await headers()).get("x-kodzuke-locale") ?? "ru");
  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-black text-white antialiased`}>
        <Suspense fallback={<div className="h-[76px] w-full" />}>
          <NavBar />
        </Suspense>
        <div className="h-[80px]" aria-hidden />
        {children}
      </body>
    </html>
  );
}
