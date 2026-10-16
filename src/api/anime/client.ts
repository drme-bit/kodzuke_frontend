import "client-only";
import { gql } from "@/api/graphql/client";
import { SEASON_FIELDS, EPISODE_FIELDS } from "@/api/anime/fields";
import type { AnimeTitle, Episode, StreamResponse } from "@/dto";
export async function fetchTitle(slug: string): Promise<AnimeTitle | null> {
  return (
    await gql<{ titleBySlug: AnimeTitle | null }>(
      `query($slug: String!) { titleBySlug(slug: $slug) { seasons { ${SEASON_FIELDS} } } }`,
      { slug },
    )
  ).titleBySlug;
}
export async function fetchEpisodes(
  animeId: string,
  locale = "ru",
): Promise<Episode[]> {
  return (
    await gql<{ episodes: Episode[] }>(
      `query($animeId: ID!, $locale: String!) { episodes(animeId: $animeId, locale: $locale) { ${EPISODE_FIELDS} } }`,
      { animeId, locale },
      { fresh: true, timeoutMs: 15000 },
    )
  ).episodes;
}
export async function fetchEpisode(
  episodeId: string,
  locale = "ru",
): Promise<Episode | null> {
  return (
    await gql<{ episode: Episode | null }>(
      `query($id: ID!, $locale: String!) { episode(id: $id, locale: $locale) { ${EPISODE_FIELDS} } }`,
      { id: episodeId, locale },
      { fresh: true },
    )
  ).episode;
}
export async function fetchEpisodeStream(
  episodeId: string,
  sourceId?: string,
  signal?: AbortSignal,
): Promise<StreamResponse | null> {
  return (
    await gql<{ episodeStream: StreamResponse | null }>(
      `query($episodeId: ID!, $sourceId: ID) { episodeStream(episodeId: $episodeId, sourceId: $sourceId) { embedUrl directUrl } }`,
      { episodeId, sourceId },
      { signal, fresh: true, timeoutMs: 15000 },
    )
  ).episodeStream;
}

export async function fetchAnimeGallery(id: string): Promise<string[]> {
  return (
    (
      await gql<{ animeById: { gallery: string[] } | null }>(
        `query HeroGallery($id:ID!){animeById(id:$id){gallery}}`,
        { id },
        { timeoutMs: 8000 },
      )
    ).animeById?.gallery ?? []
  );
}
