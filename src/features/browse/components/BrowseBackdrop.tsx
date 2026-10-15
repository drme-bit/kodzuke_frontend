"use client";
import { useLocalization } from "@/i18n/client";
import type { Anime } from "@/lib/graphql";

function trailerEmbed(url?: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const id = parsed.hostname === "youtu.be" ? parsed.pathname.slice(1) : ["youtube.com", "www.youtube.com"].includes(parsed.hostname) ? parsed.searchParams.get("v") || parsed.pathname.match(/^\/embed\/([^/]+)/)?.[1] : null;
    if (!id || !/^[\w-]+$/.test(id)) return null;
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&rel=0`;
  } catch { return null; }
}

export function BrowseBackdrop({ anime }: { anime: Anime | null }) {
  const { tui } = useLocalization();
  const src = trailerEmbed(anime?.trailerUrl);
  return <div className="browse-backdrop" aria-hidden="true">
    <div key={anime?.id} className="browse-backdrop-media">
      {(anime?.bannerUrl || anime?.posterUrl) && <div className="browse-backdrop-image" style={{ backgroundImage: `url(${anime.bannerUrl || anime.posterUrl})` }} />}
      {src && <iframe src={src} title={tui("backgroundTrailer",{title:anime?.title ?? ""})} tabIndex={-1} allow="autoplay; encrypted-media" className="browse-backdrop-trailer" />}
    </div>
    <div className="browse-backdrop-shade" />
  </div>;
}
