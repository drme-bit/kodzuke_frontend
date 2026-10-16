import "server-only";
import { cache } from "react";
import { publicGraphql } from "@/api/graphql/server";
import {
  ANIME_FIELDS,
  SEASON_FIELDS,
  EPISODE_FIELDS,
} from "@/api/anime/fields";
import type { Anime, AnimeTitle, Episode } from "@/dto";

export const getAnimeOverview = cache(async (slug: string) => {
  const data = await publicGraphql<{ animeBySlug: Anime | null }>(
    `query AnimeOverview($slug: String!) { animeBySlug(slug: $slug) { ${ANIME_FIELDS} } }`,
    { slug },
  );
  return data.animeBySlug;
});
export const getAnimeEpisodes = cache(
  async (animeId: string, locale: string) => {
    const data = await publicGraphql<{ episodes: Episode[] }>(
      `query AnimeEpisodes($animeId: ID!, $locale: String!) { episodes(animeId: $animeId, locale: $locale) { ${EPISODE_FIELDS} } }`,
      { animeId, locale },
    );
    return data.episodes;
  },
);
export const getAnimeSchedule = cache(async (id: string) => {
  const data = await publicGraphql<{
    animeById: { airingSchedule: Anime["airingSchedule"] } | null;
  }>(
    `query AnimeSchedule($id: ID!) { animeById(id: $id) { airingSchedule { releaseDate airDate number } } }`,
    { id },
  );
  return data.animeById?.airingSchedule;
});
export const getAnimeGallery = cache(async (id: string) => {
  const data = await publicGraphql<{ animeById: { gallery: string[] } | null }>(
    `query AnimeGallery($id: ID!) { animeById(id: $id) { gallery } }`,
    { id },
  );
  return data.animeById?.gallery ?? [];
});
export const getAnimeSeasons = cache(async (id: string) => {
  const data = await publicGraphql<{
    animeById: { titleInfo: AnimeTitle | null } | null;
  }>(
    `query AnimeSeasons($id: ID!) { animeById(id: $id) { titleInfo { seasons { ${SEASON_FIELDS} } } } }`,
    { id },
  );
  return data.animeById?.titleInfo?.seasons ?? [];
});
export const getEpisode = cache(async (id: string, locale: string) => {
  const data = await publicGraphql<{ episode: Episode | null }>(
    `query Episode($id: ID!, $locale: String!) { episode(id: $id, locale: $locale) { ${EPISODE_FIELDS} } }`,
    { id, locale },
  );
  return data.episode;
});
export const getTitle = cache(async (slug: string) => {
  const data = await publicGraphql<{ titleBySlug: AnimeTitle | null }>(
    `query Title($slug: String!) { titleBySlug(slug: $slug) { seasons { ${SEASON_FIELDS} } } }`,
    { slug },
  );
  return data.titleBySlug;
});
