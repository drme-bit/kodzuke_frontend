import type { Anime } from "@/dto";
/** Never present the catalog's Russian synopsis as English. */
export function descriptionForLocale(
  anime: Pick<Anime, "description" | "descriptionEn">,
  locale: string,
): string | undefined {
  if (locale !== "en")
    return anime.description || anime.descriptionEn || undefined;
  if (anime.descriptionEn?.trim()) return anime.descriptionEn;
  const legacy = anime.description?.trim();
  return legacy && !/\p{Script=Cyrillic}/u.test(legacy) && /[a-z]/i.test(legacy)
    ? legacy
    : undefined;
}

export function titleForLocale(
  anime: { title: string; titleEn?: string },
  locale: string,
) {
  return locale === "en" ? anime.titleEn || anime.title : anime.title;
}
