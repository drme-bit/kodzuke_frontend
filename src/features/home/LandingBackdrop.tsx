"use client";
import { useLocalization } from "@/i18n/client";
import { useEffect, useState } from "react";
import type { Anime } from "@/lib/graphql";
function embed(url?: string) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : ["youtube.com", "www.youtube.com"].includes(u.hostname) ? u.searchParams.get("v") || u.pathname.match(/^\/embed\/([^/]+)/)?.[1] : null;
    return id && /^[\w-]+$/.test(id) ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&rel=0` : null;
  } catch { return null; }
}
function TrailerLayer({ src, title, current }: { src: string; title: string; current: boolean }) {
  const { tui } = useLocalization();
  return <div className={`landing-trailer-layer ${current ? "is-current" : "is-previous"}`}><iframe src={src} title={tui("backgroundTrailer",{title})} tabIndex={-1} allow="autoplay; encrypted-media" /></div>;
}
export function LandingBackdrop({ animes }: { animes: Anime[] }) {
  const clips = animes.map(anime => ({ anime, src: embed(anime.trailerUrl) })).filter(clip => clip.src);
  const [cycle, setCycle] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (clips.length < 2 || reducedMotion) return;
    const timer = setInterval(() => setCycle(value => value + 1), 20000);
    return () => clearInterval(timer);
  }, [clips.length, reducedMotion]);
  const current = clips.length ? cycle % clips.length : 0;
  const previous = cycle > 0 ? (cycle - 1) % clips.length : -1;
  return <div className="landing-backdrop" aria-hidden="true">
    {!reducedMotion && clips.map((clip, index) => index === current || index === previous ? <TrailerLayer key={`${clip.anime.id}-${index}`} src={clip.src!} title={clip.anime.title} current={index === current} /> : null)}
  </div>;
}
