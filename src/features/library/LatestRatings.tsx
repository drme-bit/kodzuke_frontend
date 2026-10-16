"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/shared/auth/session";
import { profileCopy } from "@/i18n/messages/profile";
import { libraryCopy } from "@/i18n/messages/library";
import { library } from "@/api/library";
import type { Library } from "@/dto";
export function LatestRatings({ locale }: { locale: string }) {
  const token = useSession();
  const t = libraryCopy(locale);
  const p = profileCopy(locale);
  const [result, setResult] = useState<{ token: string; data: Library } | null>(
    null,
  );
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!token) return;
    let active = true;
    void library("ratings", 0, 6)
      .then((data) => {
        if (active) {
          setResult({ token, data });
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [token, revision]);
  const data = result?.token === token ? result.data : null;
  return (
    <aside className="profile-ratings" aria-label={p.latest}>
      <header>
        <h2>{p.latest}</h2>
        {data && <span>{data.total}</span>}
      </header>
      {error && (
        <div role="alert">
          <p>{t.error}</p>
          <button
            className="library-action"
            onClick={() => setRevision((value) => value + 1)}
          >
            {t.retry}
          </button>
        </div>
      )}
      {!data && !error && <p role="status">{t.loading}</p>}
      {data?.items.length === 0 && <p>{p.emptyRatings}</p>}
      {data?.items.map((entry) => (
        <Link
          className="profile-rating"
          key={entry.episodeId}
          href={`/${locale}/anime/${encodeURIComponent(entry.anime.slug || entry.anime.title)}?episode=${entry.episodeId}#watch`}
        >
          {entry.anime.posterUrl && (
            <Image
              src={entry.anime.posterUrl}
              alt=""
              width={40}
              height={56}
              unoptimized
            />
          )}
          <div>
            <h3>
              {locale === "en"
                ? entry.anime.titleEn || entry.anime.title
                : entry.anime.title}
            </h3>
            <p>
              {t.episode} {entry.episodeNumber}
            </p>
            <time dateTime={entry.updatedAt}>
              {new Date(entry.updatedAt).toLocaleDateString(locale)}
            </time>
          </div>
          <strong>
            ★ {entry.score}
            <small>/10</small>
          </strong>
        </Link>
      ))}
      {data?.hasMore && (
        <button
          className="library-action library-more"
          disabled={busy}
          onClick={async () => {
            if (!token) return;
            setBusy(true);
            try {
              const page = await library("ratings", data.items.length, 6);
              setResult((previous) =>
                previous?.token === token
                  ? {
                      token,
                      data: {
                        ...page,
                        items: [...previous.data.items, ...page.items],
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
    </aside>
  );
}
