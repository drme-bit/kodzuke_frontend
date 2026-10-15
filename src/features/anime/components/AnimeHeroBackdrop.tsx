"use client";
import { useSyncExternalStore } from "react";

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getMotionPreference = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function AnimeHeroBackdrop({ imageUrl, youtubeId }: { imageUrl?: string; youtubeId: string | null }) {
  const reduceMotion = useSyncExternalStore(subscribeMotion, getMotionPreference, () => true);
  const playing = Boolean(youtubeId) && !reduceMotion;
  return <>
    <div className="anime-hero-media" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {imageUrl && <img src={imageUrl} alt="" />}
      {playing && <div className="anime-hero-video"><iframe tabIndex={-1} title="Фоновый трейлер" src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&playsinline=1&rel=0&disablekb=1`} allow="autoplay; encrypted-media" /></div>}
      <div className="anime-hero-shade" />
    </div>
  </>;
}
