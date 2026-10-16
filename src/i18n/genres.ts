import type { Genre } from "@/dto";

export function genreName(genre: Genre, locale: string) {
  return locale === "uk"
    ? genre.nameUk
    : locale === "ru"
      ? genre.nameRu
      : genre.nameEn;
}
