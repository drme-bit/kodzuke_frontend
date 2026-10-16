"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { galleryCopy } from "@/i18n/messages/gallery";
import { useLocalization } from "@/i18n/client";
import { titleForLocale } from "@/i18n/content";
import type { Anime } from "@/dto";
import { useHeroMedia } from "../useHeroMedia";
import { HeroRatings } from "@/features/rating/HeroRatings";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

export function HeroGallery({
  anime,
  locale,
}: {
  anime: Anime;
  locale: string;
}) {
  const { tui } = useLocalization();
  const labels = galleryCopy(locale);
  const media = useHeroMedia(anime);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [broken, setBroken] = useState<string[]>([]);
  const pictures = [
    ...new Set(media.gallery.filter((url) => url !== anime.posterUrl)),
  ]
    .filter((url) => !broken.includes(url))
    .slice(0, 8);
  const images = pictures.length
    ? pictures
    : anime.bannerUrl && !broken.includes(anime.bannerUrl)
      ? [anime.bannerUrl]
      : anime.posterUrl && !broken.includes(anime.posterUrl)
        ? [anime.posterUrl]
        : [];
  const posterFallback = images.length === 1 && images[0] === anime.posterUrl;
  const current = images.length ? index % images.length : 0;
  useEffect(() => {
    if (
      paused ||
      images.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex((value) => value + 1);
    }, 5500);
    return () => clearInterval(timer);
  }, [paused, images.length]);
  const move = (direction: number) =>
    setIndex((current + direction + images.length) % images.length);
  return (
    <aside className="hero-media" aria-label={tui("gallery")}>
      {(images.length > 0 || media.galleryLoading) && (
        <div
          className="hero-gallery"
          data-poster={posterFallback}
          aria-busy={media.galleryLoading}
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            )
              setPaused(false);
          }}
        >
          {posterFallback && anime.posterUrl && (
            <Image
              fill
              unoptimized
              sizes="(max-width: 767px) 100vw, 40vw"
              className="hero-poster-backdrop"
              src={anime.posterUrl}
              alt=""
              aria-hidden="true"
            />
          )}
          {images.length === 0 && (
            <div className="hero-gallery-placeholder" aria-hidden="true" />
          )}
          {/* Real anime stills are remote and can come from several providers. */}
          {/* eslint-disable @next/next/no-img-element */}
          {images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={
                i === current
                  ? posterFallback
                    ? titleForLocale(anime, locale)
                    : `${titleForLocale(anime, locale)} — ${`${labels.frame} ${i + 1}`}`
                  : ""
              }
              aria-hidden={i !== current}
              className={i === current ? "is-current" : ""}
              onError={() =>
                setBroken((value) =>
                  value.includes(src) ? value : [...value, src],
                )
              }
            />
          ))}
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="hero-gallery-previous"
                aria-label={labels.previous}
                onClick={() => move(-1)}
              >
                <HiChevronLeft />
              </button>
              <button
                type="button"
                className="hero-gallery-next"
                aria-label={labels.next}
                onClick={() => move(1)}
              >
                <HiChevronRight />
              </button>
            </>
          )}
        </div>
      )}
      <div className="hero-media-footer">
        {images.length > 1 && (
          <div className="hero-gallery-pages">
            {images.map((src, i) => (
              <button
                type="button"
                key={src}
                aria-label={`${labels.frame} ${i + 1}`}
                aria-pressed={i === current}
                onClick={() => setIndex(i)}
              >
                <span />
              </button>
            ))}
          </div>
        )}
        <HeroRatings
          animeId={anime.id}
          locale={locale}
          external={media.ratings}
          externalLoading={media.ratingsLoading}
        />
      </div>
    </aside>
  );
}
