"use client";

import { useEffect, useState } from "react";
import { animeRating } from "@/api/ratings";
import type { RatingSummary } from "@/dto";

const cache = new Map<string, { value: RatingSummary; expires: number }>();
interface Result {
  id: string;
  summary: RatingSummary | null;
  failed: boolean;
}

export function useAnimeRating(animeId: string) {
  const [result, setResult] = useState<Result | null>(() => {
    const cached = cache.get(animeId);
    return cached
      ? { id: animeId, summary: cached.value, failed: false }
      : null;
  });
  useEffect(() => {
    const controller = new AbortController();
    const load = (fresh = false) => {
      const cached = cache.get(animeId);
      if (!fresh && cached && cached.expires > Date.now()) {
        setResult({ id: animeId, summary: cached.value, failed: false });
        return;
      }
      void animeRating(animeId, controller.signal)
        .then((summary) => {
          if (controller.signal.aborted) return;
          if (cache.size >= 100) cache.delete(cache.keys().next().value!);
          cache.set(animeId, { value: summary, expires: Date.now() + 30000 });
          setResult({ id: animeId, summary, failed: false });
        })
        .catch(() => {
          if (!controller.signal.aborted)
            setResult({ id: animeId, summary: null, failed: true });
        });
    };
    const timer = setTimeout(() => load(), 100);
    const refresh = () => {
      cache.delete(animeId);
      load(true);
    };
    window.addEventListener("kodzuke-rating-change", refresh);
    return () => {
      clearTimeout(timer);
      controller.abort();
      window.removeEventListener("kodzuke-rating-change", refresh);
    };
  }, [animeId]);
  return result?.id === animeId ? result : { summary: null, failed: false };
}
