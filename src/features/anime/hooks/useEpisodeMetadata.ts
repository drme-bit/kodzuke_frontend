"use client";
import { useEffect, useState } from "react";
import { fetchEpisodes } from "@/api/anime/client";
import type { Episode } from "@/dto";
export function useEpisodeMetadata(animeId: string, locale: string, initialEpisodes: Episode[]) {
  const [enriched, setEnriched] = useState<{ animeId: string; locale: string; episodes: Episode[] } | null>(null);
  const episodes = enriched?.animeId === animeId && enriched.locale === locale ? enriched.episodes : initialEpisodes;
  useEffect(() => {
    let active = true;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const values = await fetchEpisodes(animeId, locale);
        if (active && values.length) setEnriched({ animeId, locale, episodes: values });
      } catch { /* Metadata is optional; keep the usable episode list. */ }
      if (active && ++attempts < 10) timer = setTimeout(refresh, 30000);
    };
    timer = setTimeout(refresh, 30000);
    return () => { active = false; clearTimeout(timer); };
  }, [animeId, locale]);
  return episodes;
}
