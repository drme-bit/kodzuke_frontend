import { gql } from "./graphqlClient";
import type { Anime, LoloanRow, CatalogFilters, CatalogPage, AnimeTitle, Episode } from "./models";
// ── anime ──────────────────────────────────────────────────────────────────────
export async function fetchAnimes(): Promise<Anime[]> {
  const data = await gql<{ animes: Anime[] }>(`
    query { animes { id slug title titleEn description posterUrl bannerUrl trailerUrl year score type status season episodesCount duration seasonNumber } }
  `);
  return data.animes ?? [];
}

export async function fetchLoloan(shelf?: string, page = 0, signal?: AbortSignal): Promise<LoloanRow[]> {
  const data = await gql<{ loloan: LoloanRow[] }>(`
    query BrowseShelves($shelf: String, $page: Int!) { loloan(shelf: $shelf, page: $page, limit: 12) { id title nextPage hasMore animes { id slug title titleEn description posterUrl bannerUrl trailerUrl year score type status season episodesCount duration seasonNumber } } }
  `, { shelf, page }, { signal, fresh: true });
  return data.loloan ?? [];
}













export async function fetchCatalogPage(filters: CatalogFilters = {}, offset = 0, signal?: AbortSignal): Promise<CatalogPage> {
  const data = await gql<{ catalogPage: CatalogPage }>(`
    query CatalogPage($offset: Int!, $limit: Int!, $search: String, $type: String, $status: String, $season: String, $year: Int, $sort: String) {
      catalogPage(offset: $offset, limit: $limit, search: $search, type: $type, status: $status, season: $season, year: $year, sort: $sort) {
        total hasMore types statuses seasons years
        items { id slug title titleEn description posterUrl bannerUrl trailerUrl year score type status season episodesCount duration }
      }
    }`, { ...filters, sort: filters.sort ?? "score", offset, limit: 24 }, { signal, fresh: true, timeoutMs: 15000 });
  return data.catalogPage;
}


export const ANIME_FIELDS = "id slug title titleEn description posterUrl bannerUrl trailerUrl year score type status season episodesCount duration seasonNumber";
export const SEASON_FIELDS = "id slug title titleEn posterUrl year season type seasonNumber episodesCount airingSchedule { releaseDate }";
export const EPISODE_FIELDS = "id number title description thumbnailUrl duration status airDate sources { id name source embedUrl }";
export async function fetchAnimeDetails(slug: string, locale = "ru") {
  const data = await gql<{ animeBySlug: (Anime & { episodes: Episode[]; titleInfo: AnimeTitle | null }) | null }>(`
    query AnimeDetails($slug: String!, $locale: String!) { animeBySlug(slug: $slug) { ${ANIME_FIELDS} airingSchedule { releaseDate airDate number } gallery episodes(locale: $locale) { ${EPISODE_FIELDS} } titleInfo { seasons { ${SEASON_FIELDS} } } } }
  `, { slug, locale }, { fresh: true, timeoutMs: 15000 });
  return data.animeBySlug;
}

export async function searchTitles(search: string, signal?: AbortSignal): Promise<{ items: Anime[]; total: number }> {
  const data = await gql<{ catalogPage: { items: Anime[]; total: number } }>(`
    query QuickSearch($search: String!) {
      catalogPage(search: $search, limit: 6, sort: "relevance") { total items { id slug title titleEn posterUrl year type } }
    }`, { search }, { signal, fresh: true, timeoutMs: 15000 });
  return data.catalogPage;
}
