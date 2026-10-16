"use client";

import { useEffect, useId, useState } from "react";
import { HiStar } from "react-icons/hi2";
import { fetchExternalRatings } from "@/api/ratings";
import type { ExternalAnimeRating } from "@/dto";
import { ratingCopy } from "@/i18n/messages/ratings";
import { heroRatingCopy } from "@/i18n/messages/heroRatings";
import { useAnimeRating } from "./useAnimeRating";
import styles from "./AnimeRating.module.css";

export function AnimeRating({
  animeId,
  locale,
}: {
  animeId: string;
  locale: string;
}) {
  const t = ratingCopy(locale);
  const labels = heroRatingCopy(locale);
  const headingId = useId();
  const { summary, failed } = useAnimeRating(animeId);
  const [external, setExternal] = useState<{
    id: string;
    values: ExternalAnimeRating[];
  } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void fetchExternalRatings(animeId, controller.signal)
      .then((values) => {
        if (!controller.signal.aborted) setExternal({ id: animeId, values });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [animeId]);
  const hasVotes = Boolean(summary?.votes && summary.score !== null);
  const category = new Intl.PluralRules(locale).select(summary?.votes ?? 0);
  const votesLabel =
    labels.votes[category === "one" ? 0 : category === "few" ? 1 : 2];
  const externalRatings = external?.id === animeId ? external.values : [];
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.heading}>
        {t.sectionHeading}
      </h3>
      <div className={styles.sources}>
        <div className={styles.community}>
          <span className={styles.source}>KodZuke</span>
          <div className={styles.communityValue}>
            <strong className={styles.score}>
              <HiStar aria-hidden="true" />
              {hasVotes
                ? summary!.score!.toLocaleString(locale, {
                    maximumFractionDigits: 2,
                  })
                : "—"}
              {hasVotes && <small>/10</small>}
            </strong>
            <span className={styles.context} role="status">
              {summary
                ? hasVotes
                  ? `${summary.votes.toLocaleString(locale)} ${votesLabel}`
                  : t.empty
                : failed
                  ? labels.unavailable
                  : labels.loading}
            </span>
          </div>
        </div>
        {externalRatings.map((value) => (
          <a
            className={styles.external}
            key={value.source}
            href={value.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.source}>{value.source}</span>
            <strong>
              {value.score.toLocaleString(locale, { maximumFractionDigits: 2 })}
              <small>/{value.scale}</small>
            </strong>
          </a>
        ))}
      </div>
      <details className={styles.method}>
        <summary>{t.howCalculated}</summary>
        <div>
          <p>{t.byEpisodes}</p>
          {summary && summary.totalEpisodes > 0 && (
            <p>
              {t.ratedEpisodesLabel}:{" "}
              {summary.ratedEpisodes.toLocaleString(locale)} /{" "}
              {summary.totalEpisodes.toLocaleString(locale)}
            </p>
          )}
        </div>
      </details>
    </section>
  );
}
