"use client";

import { HiStar } from "react-icons/hi2";
import type { ExternalAnimeRating } from "@/dto";
import { ratingCopy } from "@/i18n/messages/ratings";
import { useAnimeRating } from "./useAnimeRating";

import { heroRatingCopy } from "@/i18n/messages/heroRatings";
interface HeroRatingsProps {
  animeId: string;
  locale: string;
  external: ExternalAnimeRating[];
  externalLoading?: boolean;
}

export function HeroRatings({
  animeId,
  locale,
  external,
  externalLoading = false,
}: HeroRatingsProps) {
  const t = ratingCopy(locale);
  const copy = heroRatingCopy(locale);
  const { summary, failed } = useAnimeRating(animeId);
  const hasVotes = Boolean(
    summary && summary.votes > 0 && summary.score !== null,
  );
  const plural = new Intl.PluralRules(locale).select(summary?.votes ?? 0);
  const votesLabel =
    copy.votes[plural === "one" ? 0 : plural === "few" ? 1 : 2];

  return (
    <div className="hero-ratings" aria-label={t.heading}>
      <div className="hero-rating-community" title={t.byEpisodes}>
        <span>KodZuke</span>
        <strong>
          <HiStar aria-hidden="true" />
          {hasVotes
            ? summary!.score!.toLocaleString(locale, {
                maximumFractionDigits: 2,
              })
            : "—"}
          {hasVotes && <small>/10</small>}
        </strong>
        <small className="hero-rating-context">
          {summary
            ? hasVotes
              ? `${summary.votes.toLocaleString(locale)} ${votesLabel}`
              : t.empty
            : failed
              ? copy.unavailable
              : copy.loading}
        </small>
      </div>
      {externalLoading && (
        <div className="hero-rating-placeholder" aria-hidden="true">
          <span />
          <span />
        </div>
      )}
      {external.map((rating) => (
        <a
          key={rating.source}
          href={rating.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{rating.source}</span>
          <strong>
            <HiStar aria-hidden="true" />
            {rating.score.toLocaleString(locale, {
              maximumFractionDigits: rating.scale === 100 ? 0 : 2,
            })}
            <small>/{rating.scale}</small>
          </strong>
        </a>
      ))}
    </div>
  );
}
