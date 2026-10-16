import "client-only";
import type { RatingSummary } from "@/dto";
import { gql } from "@/api/graphql/client";
import { accessToken, saveSession } from "@/shared/auth/session";

const fields = "score votes ratedEpisodes totalEpisodes ownScore";
export async function episodeRating(id: string, signal?: AbortSignal) {
  const token = await accessToken();
  return gql<{ episodeRating: RatingSummary }>(
    `query EpisodeRating($id:ID!){episodeRating(episodeId:$id){${fields}}}`,
    { id },
    { signal, token: token ?? undefined, fresh: true },
  ).then((d) => d.episodeRating);
}
export async function animeRating(id: string, signal?: AbortSignal) {
  return gql<{ animeRating: RatingSummary }>(
    `query AnimeRating($id:ID!){animeRating(animeId:$id){${fields}}}`,
    { id },
    { signal, fresh: true },
  ).then((d) => d.animeRating);
}
export async function vote(id: string, score: number | null) {
  const token = await accessToken();
  if (!token) throw new Error("UNAUTHENTICATED");
  try {
    if (score === null)
      return await gql<{ removeEpisodeRating: RatingSummary }>(
        `mutation RemoveRating($id:ID!){removeEpisodeRating(episodeId:$id){${fields}}}`,
        { id },
        { token, fresh: true },
      ).then((d) => d.removeEpisodeRating);
    return await gql<{ rateEpisode: RatingSummary }>(
      `mutation RateEpisode($id:ID!,$score:Int!){rateEpisode(episodeId:$id,score:$score){${fields}}}`,
      { id, score },
      { token, fresh: true },
    ).then((d) => d.rateEpisode);
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNAUTHENTICATED"))
      saveSession(null);
    throw error;
  }
}

export async function fetchCardRatings(ids: string[]) {
  return (
    await gql<{ cardRatings: import("@/dto").CardRating[] }>(
      `query CardRatings($ids:[ID!]!){cardRatings(animeIds:$ids){animeId source score scale}}`,
      { ids },
      { fresh: true },
    )
  ).cardRatings;
}
export async function fetchExternalRatings(id: string, signal?: AbortSignal) {
  return (
    (
      await gql<{
        animeById: { ratings: import("@/dto").ExternalAnimeRating[] } | null;
      }>(
        `query AnimeExternalRatings($id:ID!){animeById(id:$id){ratings{source score scale url}}}`,
        { id },
        { signal, timeoutMs: 15000 },
      )
    ).animeById?.ratings ?? []
  );
}
