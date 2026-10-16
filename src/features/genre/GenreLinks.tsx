import Link from "next/link";
import type { Genre } from "@/dto";
import { genreCopy } from "@/i18n/messages/genres";
import { genreName } from "@/i18n/genres";

export function GenreLinks({
  genres = [],
  locale,
  limit,
}: {
  genres?: Genre[];
  locale: string;
  limit?: number;
}) {
  if (!genres.length) return null;
  return (
    <nav className="genre-links" aria-label={genreCopy(locale).label}>
      {genres.slice(0, limit).map((genre) => (
        <Link
          key={genre.slug}
          href={`/${locale}/catalog?genre=${encodeURIComponent(genre.slug)}`}
        >
          <span>{genreName(genre, locale)}</span>
        </Link>
      ))}
    </nav>
  );
}
