import { normalizeLocale } from "@/i18n";
const labels = {
  en: {
    loading: "Loading…",
    unavailable: "Unavailable",
    votes: ["vote", "votes", "votes"],
  },
  ru: {
    loading: "Загружаем…",
    unavailable: "Недоступно",
    votes: ["голос", "голоса", "голосов"],
  },
  uk: {
    loading: "Завантажуємо…",
    unavailable: "Недоступно",
    votes: ["голос", "голоси", "голосів"],
  },
} as const;

export function heroRatingCopy(locale: string) {
  return labels[normalizeLocale(locale)];
}
