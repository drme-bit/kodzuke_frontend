"use client";
import { useLocalization } from "@/i18n/client";
import { useState } from "react";
import { titleForLocale } from "@/i18n/ui";
import { animeTypeLabel } from "@/features/anime/presentation";
import type { Anime } from "@/lib/graphql";
import { HiStar, HiPlay } from "react-icons/hi2";

function getYoutubeId(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

export function AnimeCard({ anime, showTrailer = true, className }: { anime: Anime; showTrailer?: boolean; className?: string }) {
  const { tui, locale } = useLocalization();
  const [hover, setHover] = useState(false);
  const ytId = getYoutubeId(anime.trailerUrl);
  const embedSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&playsinline=1&modestbranding=1&rel=0`
    : null;
  const withOverlay = showTrailer && !!embedSrc;

  return (
    <div
      className={`group flex-shrink-0 cursor-pointer ${className ?? "w-[160px] md:w-[176px]"}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 transition-all duration-300 group-hover:border-white/15 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.55)] group-hover:-translate-y-0.5">
        {anime.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            loading="lazy"
            decoding="async"
            src={anime.posterUrl}
            alt={titleForLocale(anime,locale)}
            className={`h-full w-full object-cover transition duration-700 ${
              hover && withOverlay ? "scale-105 opacity-0" : "scale-100 opacity-100 group-hover:scale-105"
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-xs text-zinc-500">{titleForLocale(anime,locale)}</div>
        )}

        {/* subtle top */}
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          <span className="rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold tracking-wide text-white backdrop-blur-md ring-1 ring-white/10">
            {animeTypeLabel(anime.type,locale)}
          </span>
        </div>
        {anime.score != null && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-black shadow-sm">
            <HiStar className="h-3 w-3" /> {anime.score.toLocaleString(locale,{minimumFractionDigits:1,maximumFractionDigits:1})}
          </span>
        )}

        {/* gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* trailer overlay */}
        {withOverlay && (
          <div
            className={`absolute inset-0 overflow-hidden bg-black transition-all duration-500 ease-out ${
              hover ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <iframe
              src={hover ? embedSrc! : undefined}
              className="h-full w-full scale-[1.35] object-cover"
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
              loading="lazy"
              title={titleForLocale(anime,locale)}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
        )}

        {/* play badge — netflix style */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition duration-300 ${
            hover ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg">
            <HiPlay className="h-4 w-4 translate-x-[1px]" />
          </span>
        </div>

        <div
          className={`absolute bottom-2 left-2 flex items-center gap-1 transition duration-300 ${
            hover ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-black">
            {withOverlay ? tui("trailer") : tui("watch")}
          </span>
        </div>
      </div>

      <div className="mt-2.5 px-1">
        <p className="line-clamp-2 text-[13px] font-medium leading-4 text-white group-hover:text-white">
          {titleForLocale(anime,locale)}
        </p>
        <p className="mt-1 line-clamp-1 text-xs text-white/50">
          {(anime.titleEn ?? String(anime.year ?? "")) || "—"}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-white/40">
          <span>{anime.year ?? "—"}</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span className="truncate">{animeTypeLabel(anime.type,locale)}</span>
        </div>
      </div>
    </div>
  );
}
