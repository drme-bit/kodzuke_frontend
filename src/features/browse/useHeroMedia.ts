"use client";
import { useEffect, useState } from "react";
import { refreshCardRating } from "@/features/rating/useCardRating";
import { fetchAnimeGallery } from "@/api/anime/client";
import { fetchExternalRatings } from "@/api/ratings";
import type { Anime } from "@/dto";

import type { ExternalAnimeRating as AnimeRating } from "@/dto";
type Media = { gallery: string[]; ratings: AnimeRating[] };
const galleries = new Map<string, string[]>();
const ratings = new Map<string, { value: AnimeRating[]; expires: number }>();
const requests = new Map<string, Promise<unknown>>();

function request<T>(key: string, load: () => Promise<T>): Promise<T> {
  const pending = requests.get(key);
  if (pending) return pending as Promise<T>;
  const pendingRequest = load().finally(() => requests.delete(key));
  requests.set(key, pendingRequest);
  return pendingRequest;
}
function remember<T>(cache: Map<string, T>, id: string, value: T) {
  if (cache.size >= 100) cache.delete(cache.keys().next().value!);
  cache.set(id, value);
}
export function useHeroMedia(anime: Anime) {
  const [data, setData] = useState<{
    id: string;
    media: Partial<Media>;
  } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const apply = (media: Partial<Media>) => {
      if (!controller.signal.aborted)
        setData((current) => ({
          id: anime.id,
          media: {
            ...(current?.id === anime.id ? current.media : {}),
            ...media,
          },
        }));
    };
    const timer = setTimeout(() => {
      const gallery = galleries.get(anime.id);
      if (gallery) apply({ gallery });
      else
        void request(`${anime.id}:gallery`, () => fetchAnimeGallery(anime.id))
          .then((result) => {
            const value = result.filter(Boolean);
            remember(galleries, anime.id, value);
            apply({ gallery: value });
          })
          .catch(() => apply({ gallery: [] }));
      const scores = ratings.get(anime.id);
      if (scores && scores.expires > Date.now())
        apply({ ratings: scores.value });
      else
        void request(`${anime.id}:ratings`, () =>
          fetchExternalRatings(anime.id),
        )
          .then((result) => {
            const value = result;
            remember(ratings, anime.id, {
              value,
              expires: Date.now() + (value.length ? 300000 : 30000),
            });
            refreshCardRating(anime.id);
            apply({ ratings: value });
          })
          .catch(() => apply({ ratings: [] }));
    }, 100);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [anime.id]);
  const media = data?.id === anime.id ? data.media : {};
  return {
    gallery: media.gallery ?? galleries.get(anime.id) ?? anime.gallery ?? [],
    ratings: media.ratings ?? ratings.get(anime.id)?.value ?? [],
    galleryLoading:
      media.gallery === undefined &&
      !galleries.has(anime.id) &&
      !anime.gallery?.length,
    ratingsLoading: media.ratings === undefined && !ratings.has(anime.id),
  };
}
