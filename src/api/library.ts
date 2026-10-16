import type { Section, Library, HistoryFilter } from "@/dto";
import "client-only";
import { gql } from "@/api/graphql/client";
import { accessToken, getSession } from "@/shared/auth/session";
async function options() {
  const token = await accessToken();
  if (!token) throw new Error("UNAUTHENTICATED");
  return { token, fresh: true };
}
export async function library(section: Section, offset = 0, limit = 24) {
  const result = await gql<{ myLibrary: Library }>(
    `query Library($section:String!,$offset:Int!,$limit:Int!){myLibrary(section:$section,offset:$offset,limit:$limit){items{anime{id slug title titleEn posterUrl year} episodeId episodeNumber episodeTitle score positionSeconds durationSeconds completed updatedAt} total hasMore counts{history saved ratings}}}`,
    { section, offset, limit },
    await options(),
  );
  return result.myLibrary;
}
export async function savedAnime(animeId: string) {
  return (
    await gql<{ isSavedAnime: boolean }>(
      `query Saved($id:ID!){isSavedAnime(animeId:$id)}`,
      { id: animeId },
      await options(),
    )
  ).isSavedAnime;
}
export async function saveAnime(animeId: string, saved: boolean) {
  return (
    await gql<{ setSavedAnime: boolean }>(
      `mutation Save($id:ID!,$saved:Boolean!){setSavedAnime(animeId:$id,saved:$saved)}`,
      { id: animeId, saved },
      await options(),
    )
  ).setSavedAnime;
}
export async function recordProgress(
  episodeId: string,
  positionSeconds: number,
  durationSeconds: number,
  completed = false,
  expectedToken?: string,
) {
  if (expectedToken && getSession()?.accessToken !== expectedToken) return;
  const authorization = await options();
  if (expectedToken && authorization.token !== expectedToken) return;
  await gql(
    `mutation Progress($id:ID!,$position:Int!,$duration:Int!,$completed:Boolean!){recordWatchProgress(episodeId:$id,positionSeconds:$position,durationSeconds:$duration,completed:$completed)}`,
    {
      id: episodeId,
      position: Math.floor(positionSeconds),
      duration: Math.floor(durationSeconds),
      completed,
    },
    authorization,
  );
}

export async function watchHistory(
  filter: HistoryFilter,
  offset = 0,
  animeId?: string,
) {
  const result = await gql<{ watchHistory: Library }>(
    `query History($filter:String!,$offset:Int!,$animeId:ID){watchHistory(filter:$filter,offset:$offset,limit:12,animeId:$animeId){items{anime{id slug title titleEn posterUrl year} episodeId episodeNumber episodeTitle thumbnailUrl positionSeconds durationSeconds completed updatedAt} total hasMore counts{history saved ratings}}}`,
    { filter, offset, animeId },
    await options(),
  );
  return result.watchHistory;
}
export async function historyVisibility(animeId: string, removed: boolean) {
  await gql(
    `mutation Visibility($id:ID!,$removed:Boolean!){setHistoryVisibility(animeId:$id,removed:$removed)}`,
    { id: animeId, removed },
    await options(),
  );
}
export async function completeHistory(episodeId: string) {
  await gql(
    `mutation Complete($id:ID!){completeHistoryEpisode(episodeId:$id)}`,
    { id: episodeId },
    await options(),
  );
}
