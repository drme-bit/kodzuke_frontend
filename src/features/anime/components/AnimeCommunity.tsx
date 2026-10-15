import { translator } from "@/i18n/ui";
export function AnimeCommunity({ score, locale = "ru" }: { score?: number; locale?: string }) {
  const tui = translator(locale);
  return <div className="anime-community">
    <section className="anime-rating" aria-labelledby="anime-rating-heading"><div className="anime-section-heading"><h3 id="anime-rating-heading">{tui("rating")}</h3>{score != null && <span>★ {score.toLocaleString(locale,{minimumFractionDigits:1,maximumFractionDigits:1})} <small>{tui("titleRating")}</small></span>}</div><p>{tui("yourRating")}</p><div className="anime-rating-options" aria-label={tui("ratingSoon")} >{Array.from({ length: 10 }, (_, index) => <button key={index} type="button" disabled aria-label={tui("ratingOption",{n:index+1})}>{index + 1}</button>)}</div><p className="anime-placeholder-note">{tui("ratingLater")}</p></section>
    <section className="anime-comments" aria-labelledby="anime-comments-heading"><div className="anime-section-heading"><h3 id="anime-comments-heading">{tui("comments")}</h3><span>{tui("soon")}</span></div><div className="anime-comment-placeholder"><span className="anime-comment-avatar" aria-hidden="true">K</span><div><p>{tui("discussion")}</p><span>{tui("commentsUnavailable")}</span></div></div></section>
  </div>;
}
