export const locales = ["en", "ru", "uk"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

export function normalizeLocale(value: string): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}
