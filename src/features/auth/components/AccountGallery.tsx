"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { authCopy } from "@/i18n/messages/auth";
import { fetchAccountPosters } from "@/api/posters";
import type { AccountPoster } from "@/dto";

const COLUMN_COUNT = 4;
const POSTERS_PER_COLUMN = 6;

interface PosterColumnProps {
  posters: AccountPoster[];
  index: number;
}

function PosterColumn({ posters, index }: PosterColumnProps) {
  return (
    <div className="account-poster-column" data-reverse={index % 2 === 1}>
      <div className="account-poster-track">
        {Array.from({ length: 2 }, (_, copy) => (
          <div className="account-poster-group" key={copy}>
            {Array.from({ length: POSTERS_PER_COLUMN }, (_, position) => {
              const poster = posters.length
                ? posters[
                    (index * POSTERS_PER_COLUMN + position) % posters.length
                  ]
                : null;
              return (
                <div className="account-poster" key={position}>
                  {poster && (
                    <Image
                      src={poster.posterUrl}
                      alt=""
                      fill
                      unoptimized
                      sizes="200px"
                      loading="eager"
                      onLoad={(event) => {
                        event.currentTarget.dataset.loaded = "true";
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccountGallery({ locale }: { locale: string }) {
  const t = authCopy(locale);
  const [posters, setPosters] = useState<AccountPoster[]>([]);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetchAccountPosters(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setPosters(result);
      })
      .catch(() => {});
    const updateVisibility = () => setHidden(document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  return (
    <aside
      className="account-gallery"
      aria-label={t.gallery}
      data-paused={hidden}
    >
      <div className="account-poster-scene" aria-hidden="true">
        <div className="account-poster-wall">
          {Array.from({ length: COLUMN_COUNT }, (_, index) => (
            <PosterColumn key={index} index={index} posters={posters} />
          ))}
        </div>
      </div>
      <div className="account-gallery-shade" />
      <div className="account-gallery-caption">
        <svg
          className="account-gallery-mark"
          viewBox="0 0 80 80"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M16 16v48m0-24 24-24h24L40 40l24 24H40M64 16 16 64"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="miter"
          />
        </svg>
        <p className="account-gallery-tagline">{t.galleryTagline}</p>
      </div>
    </aside>
  );
}
