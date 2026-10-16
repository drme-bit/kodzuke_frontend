"use client";
import { ratingChanged } from "./events";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authCopy } from "@/i18n/messages/auth";
import { authUrl } from "@/features/auth/navigation";
import { useSession } from "@/shared/auth/session";
import { episodeRating, vote } from "@/api/ratings";
import type { RatingSummary } from "@/dto";
import { ratingCopy } from "@/i18n/messages/ratings";

interface EpisodeRatingProps {
  episodeId: string;
  available: boolean;
  locale: string;
}

export function EpisodeRating({
  episodeId,
  available,
  locale,
}: EpisodeRatingProps) {
  const t = ratingCopy(locale);
  const token = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const signInUrl = authUrl(locale, `${pathname}#watch`);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void episodeRating(episodeId, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setSummary(result);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [episodeId, token]);

  async function submit(score: number | null) {
    if (!token) {
      router.push(signInUrl);
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      setSummary(await vote(episodeId, score));
      ratingChanged();
      setMessage(t.saved);
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNAUTHENTICATED"))
        router.push(signInUrl);
      else setMessage(t.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="episode-rating-control">
      <div className="episode-rating-label">
        <span>{t.episode}</span>
        {summary && summary.votes > 0 && (
          <span>
            ★{" "}
            {summary.score?.toLocaleString(locale, {
              maximumFractionDigits: 1,
            })}{" "}
            <small>({summary.votes})</small>
          </span>
        )}
      </div>
      <div className="episode-rating-row">
        <div className="episode-rating-buttons" role="group" aria-label={t.own}>
          {Array.from({ length: 10 }, (_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`${t.own}: ${index + 1}/10`}
              aria-pressed={summary?.ownScore === index + 1}
              disabled={busy || !available}
              onClick={() => void submit(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="episode-rating-actions">
          {!available ? (
            <span>{t.unreleased}</span>
          ) : !token ? (
            <Link href={signInUrl}>{authCopy(locale).signIn}</Link>
          ) : summary?.ownScore != null ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit(null)}
            >
              {t.remove}
            </button>
          ) : null}
          <span role="status">{busy ? t.saving : message}</span>
        </div>
      </div>
    </div>
  );
}
