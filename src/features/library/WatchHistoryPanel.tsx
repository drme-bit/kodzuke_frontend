"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/shared/auth/session";
import { completeHistory, historyVisibility, watchHistory } from "@/api/library";
import type { Entry, Library, HistoryFilter } from "@/dto";
import { libraryCopy } from "@/i18n/messages/library";
import { historyCopy } from "@/i18n/messages/history";
const time = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
function episodeHref(entry: Entry, locale: string) {
  return `/${locale}/anime/${encodeURIComponent(entry.anime.slug || entry.anime.title)}?episode=${entry.episodeId}${!entry.completed && entry.positionSeconds ? `&t=${entry.positionSeconds}` : ""}#watch`;
}
function EpisodeHistory({
  animeId,
  locale,
}: {
  animeId: string;
  locale: string;
}) {
  const token = useSession();
  const t = libraryCopy(locale);
  const [result, setResult] = useState<{ token: string; data: Library } | null>(
    null,
  );
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!token) return;
    let active = true;
    void watchHistory("all", 0, animeId)
      .then((data) => {
        if (active) setResult({ token, data });
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [animeId, token]);
  const data = result?.token === token ? result.data : null;
  return (
    <div className="history-episodes">
      {error && <p role="alert">{t.error}</p>}
      {!data && !error && <p role="status">{t.loading}</p>}
      {data?.items.map((entry) => (
        <Link key={entry.episodeId} href={episodeHref(entry, locale)}>
          <span>
            {t.episode} {entry.episodeNumber}
          </span>
          <span>
            {entry.completed ? "✓" : time(entry.positionSeconds ?? 0)}
          </span>
          <time dateTime={entry.updatedAt}>
            {new Date(entry.updatedAt).toLocaleDateString(locale)}
          </time>
        </Link>
      ))}
      {data?.hasMore && (
        <button
          className="library-action"
          disabled={busy}
          onClick={async () => {
            if (!token) return;
            setBusy(true);
            try {
              const next = await watchHistory(
                "all",
                data.items.length,
                animeId,
              );
              setResult((previous) =>
                previous?.token === token
                  ? {
                      token,
                      data: {
                        ...next,
                        items: [...previous.data.items, ...next.items],
                      },
                    }
                  : previous,
              );
            } catch {
              setError(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          {t.more}
        </button>
      )}
    </div>
  );
}
export function WatchHistoryPanel({ locale }: { locale: string }) {
  const token = useSession();
  const t = libraryCopy(locale);
  const h = historyCopy(locale);
  const [filter, setFilter] = useState<HistoryFilter>("continue");
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    token: string;
    filter: HistoryFilter;
    data: Library;
  } | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [removed, setRemoved] = useState<{ token: string; id: string } | null>(
    null,
  );
  useEffect(() => {
    if (!token) return;
    let active = true;
    void watchHistory(filter)
      .then((data) => {
        if (active) {
          setResult({ token, filter, data });
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [token, filter, revision]);
  const data =
    result?.token === token && result.filter === filter ? result.data : null;
  async function action(task: () => Promise<void>) {
    setBusy(true);
    setError(false);
    try {
      await task();
      setRevision((value) => value + 1);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="watch-history" aria-label={h.continue}>
      <div className="history-filters">
        {(["continue", "completed", "all"] as HistoryFilter[]).map((value) => (
          <button
            type="button"
            key={value}
            data-active={filter === value}
            aria-pressed={filter === value}
            onClick={() => {
              setFilter(value);
              setError(false);
            }}
          >
            {value === "continue" ? h.inProgress : h[value]}
          </button>
        ))}
      </div>
      {removed?.token === token && (
        <div className="history-notice" role="status">
          {h.removed}
          <button
            disabled={busy}
            onClick={() =>
              action(async () => {
                await historyVisibility(removed.id, false);
                setRemoved(null);
              })
            }
          >
            {h.undo}
          </button>
        </div>
      )}
      {error && (
        <div role="alert" className="library-error">
          {h.error}{" "}
          <button
            className="library-action"
            onClick={() => setRevision((value) => value + 1)}
          >
            {t.retry}
          </button>
        </div>
      )}
      {!data && !error && <p role="status">{t.loading}</p>}
      {data?.items.length === 0 && (
        <div className="library-empty">
          <h2>{filter === "continue" ? h.empty : t.empty}</h2>
          <p>{h.emptyHint}</p>
          <Link className="library-action" href={`/${locale}/browse`}>
            {t.browse}
          </Link>
        </div>
      )}
      <div className="history-grid">
        {data?.items.map((entry) => {
          const title =
            locale === "en"
              ? entry.anime.titleEn || entry.anime.title
              : entry.anime.title;
          return (
            <article className="history-card" key={entry.anime.id}>
              <Link href={episodeHref(entry, locale)} className="history-cover">
                {(entry.thumbnailUrl || entry.anime.posterUrl) && (
                  <Image
                    src={entry.thumbnailUrl || entry.anime.posterUrl!}
                    alt=""
                    width={480}
                    height={270}
                    unoptimized
                  />
                )}
                <span className="history-play" aria-hidden="true">
                  ▷
                </span>
                <span className="history-position">
                  {entry.completed
                    ? h.watched
                    : entry.durationSeconds
                      ? `${time(entry.positionSeconds ?? 0)} / ${time(entry.durationSeconds)}`
                      : h.unknown}
                </span>
                {Boolean(entry.durationSeconds) && (
                  <span className="history-bar">
                    <i
                      style={{
                        width: `${Math.min(100, entry.completed ? 100 : ((entry.positionSeconds ?? 0) / entry.durationSeconds!) * 100)}%`,
                      }}
                    />
                  </span>
                )}
              </Link>
              <Link href={episodeHref(entry, locale)}>
                <h2>{title}</h2>
                <p>
                  {t.episode} {entry.episodeNumber}
                  {entry.episodeTitle &&
                  !/^(?:(?:серия|episode|епізод)\s*)?\d+$/i.test(
                    entry.episodeTitle.trim(),
                  )
                    ? ` · ${entry.episodeTitle}`
                    : ""}
                </p>
              </Link>
              <time dateTime={entry.updatedAt}>
                {new Date(entry.updatedAt).toLocaleDateString(locale)}
              </time>
              <div className="history-actions">
                <button
                  disabled={busy}
                  aria-expanded={expanded === entry.anime.id}
                  onClick={() =>
                    setExpanded((value) =>
                      value === entry.anime.id ? null : entry.anime.id,
                    )
                  }
                >
                  {h.details}
                </button>
                {!entry.completed && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      action(() => completeHistory(entry.episodeId!))
                    }
                  >
                    {h.mark}
                  </button>
                )}
                <button
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      await historyVisibility(entry.anime.id, true);
                      if (token) setRemoved({ token, id: entry.anime.id });
                    })
                  }
                >
                  {h.remove}
                </button>
              </div>
              {expanded === entry.anime.id && (
                <EpisodeHistory
                  key={`${entry.anime.id}:${revision}`}
                  animeId={entry.anime.id}
                  locale={locale}
                />
              )}
            </article>
          );
        })}
      </div>
      {data?.hasMore && (
        <button
          className="library-action library-more"
          disabled={busy}
          onClick={async () => {
            if (!token) return;
            setBusy(true);
            try {
              const next = await watchHistory(filter, data.items.length);
              setResult((previous) =>
                previous?.token === token && previous.filter === filter
                  ? {
                      token,
                      filter,
                      data: {
                        ...next,
                        items: [...previous.data.items, ...next.items],
                      },
                    }
                  : previous,
              );
            } catch {
              setError(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          {t.more}
        </button>
      )}
    </section>
  );
}
