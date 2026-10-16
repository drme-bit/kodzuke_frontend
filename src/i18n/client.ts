"use client";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { normalizeLocale } from "@/i18n/config";
import { translator } from "@/i18n/ui";
export function useLocalization() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname?.split("/")[1] ?? "ru");
  const tui = useMemo(() => translator(locale), [locale]);
  return { locale, tui };
}
