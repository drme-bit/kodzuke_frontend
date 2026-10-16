import { normalizeLocale } from "@/i18n";
const copy = {
  en: {
    label: "Genres",
    search: "Find a genre",
    all: "All selected genres",
    empty: "No genres found",
    remove: "Remove",
  },
  ru: {
    label: "Жанры",
    search: "Найти жанр",
    all: "Все выбранные жанры",
    empty: "Жанры не найдены",
    remove: "Убрать",
  },
  uk: {
    label: "Жанри",
    search: "Знайти жанр",
    all: "Усі вибрані жанри",
    empty: "Жанрів не знайдено",
    remove: "Прибрати",
  },
};
export function genreCopy(locale: string) {
  return copy[normalizeLocale(locale)];
}
