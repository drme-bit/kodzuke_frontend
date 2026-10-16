import { AnimeRating } from "@/features/rating/AnimeRating";
import { translator } from "@/i18n/ui";
export function AnimeCommunity({
  animeId,
  locale = "ru",
}: {
  animeId: string;
  locale?: string;
}) {
  const tui = translator(locale);
  return (
    <div className="anime-community">
      <AnimeRating animeId={animeId} locale={locale} />
      <section
        className="anime-comments"
        aria-labelledby="anime-comments-heading"
      >
        <div className="anime-section-heading">
          <h3 id="anime-comments-heading">{tui("comments")}</h3>
          <span>{tui("soon")}</span>
        </div>
        <div className="anime-comment-placeholder">
          <span className="anime-comment-avatar" aria-hidden="true">
            K
          </span>
          <div>
            <p>{tui("discussion")}</p>
            <span>{tui("commentsUnavailable")}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
