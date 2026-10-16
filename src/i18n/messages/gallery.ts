import { normalizeLocale } from "@/i18n";
const copy = {
  en: { previous: "Previous frame", next: "Next frame", frame: "Frame" },
  ru: { previous: "Предыдущий кадр", next: "Следующий кадр", frame: "Кадр" },
  uk: { previous: "Попередній кадр", next: "Наступний кадр", frame: "Кадр" },
};
export function galleryCopy(locale: string) {
  return copy[normalizeLocale(locale)];
}
