"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/shared/auth/session";
import { library, saveAnime } from "@/api/library";
import type { Library } from "@/dto";
import { libraryCopy } from "@/i18n/messages/library";
export function WatchLaterPanel({ locale }: { locale: string }) {
  const token = useSession();
  const t = libraryCopy(locale);
  const [result, setResult] = useState<{ token: string; data: Library } | null>(
    null,
  );
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!token) return;
    let active = true;
    void library("saved")
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
    <section aria-label={t.saved}>
      {error && (
        <div className="library-error" role="alert">
          {t.error}{" "}
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
          <h2>{t.empty}</h2>
          <p>{t.hint}</p>
          <Link href={`/${locale}/browse`} className="library-action">
            {t.browse}
          </Link>
        </div>
      )}
      {data?.items.map((entry) => (
        <article className="library-row" key={entry.anime.id}>
          <Link
            href={`/${locale}/anime/${encodeURIComponent(entry.anime.slug || entry.anime.title)}`}
          >
            {entry.anime.posterUrl && (
              <Image
                className="library-poster"
                src={entry.anime.posterUrl}
                alt=""
                width={64}
                height={90}
                unoptimized
              />
            )}
            <div>
              <h2>
                {locale === "en"
                  ? entry.anime.titleEn || entry.anime.title
                  : entry.anime.title}
              </h2>
              <p>{entry.anime.year}</p>
              <time dateTime={entry.updatedAt}>
                {new Date(entry.updatedAt).toLocaleDateString(locale)}
              </time>
            </div>
          </Link>
          <button
            className="library-action"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await saveAnime(entry.anime.id, false);
                setRevision((value) => value + 1);
              } catch {
                setError(true);
              } finally {
                setBusy(false);
              }
            }}
          >
            {t.remove}
          </button>
        </article>
      ))}
      {data?.hasMore && (
        <button
          className="library-action library-more"
          disabled={busy}
          onClick={async () => {
            if (!token) return;
            setBusy(true);
            try {
              const page = await library("saved", data.items.length);
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
    </section>
  );
}
