import type { GraphQLRequester } from "@/api/graphql/transport";
import type {
  Genre,
  Anime,
  LoloanRow,
  CatalogFilters,
  CatalogPage,
} from "@/dto";

import { ANIME_FIELDS } from "../anime/fields";

export function createCatalogApi(gql: GraphQLRequester) {
  // ── anime ──────────────────────────────────────────────────────────────────────
  async function fetchAnimes(): Promise<Anime[]> {
    const data = await gql<{ animes: Anime[] }>(`
    query { animes { ${ANIME_FIELDS} } }
  `);
    return data.animes ?? [];
  }

  async function fetchLoloan(
    shelf?: string,
    page = 0,
    signal?: AbortSignal,
  ): Promise<LoloanRow[]> {
    const data = await gql<{ loloan: LoloanRow[] }>(
      `
    query BrowseShelves($shelf: String, $page: Int!) { loloan(shelf: $shelf, page: $page, limit: 12) { id title nextPage hasMore animes { ${ANIME_FIELDS} } } }
  `,
      { shelf, page },
      { signal },
    );
    return data.loloan ?? [];
  }

  async function fetchCatalogPage(
    filters: CatalogFilters = {},
    offset = 0,
    signal?: AbortSignal,
  ): Promise<CatalogPage> {
    const data = await gql<{ catalogPage: CatalogPage }>(
      `
    query CatalogPage($offset: Int!, $limit: Int!, $search: String, $type: String, $status: String, $season: String, $year: Int, $sort: String, $genres: [String!]) {
      catalogPage(offset: $offset, limit: $limit, search: $search, type: $type, status: $status, season: $season, year: $year, sort: $sort, genres: $genres) {
        total hasMore types statuses seasons years
        items { id slug title titleEn description descriptionEn posterUrl bannerUrl trailerUrl year score type status season episodesCount duration genres { slug nameEn nameRu nameUk } }
      }
    }`,
      { ...filters, sort: filters.sort ?? "score", offset, limit: 24 },
      { signal, timeoutMs: 15000 },
    );
    return data.catalogPage;
  }

  async function searchTitles(
    search: string,
    signal?: AbortSignal,
  ): Promise<{ items: Anime[]; total: number }> {
    const data = await gql<{ catalogPage: { items: Anime[]; total: number } }>(
      `
    query QuickSearch($search: String!) {
      catalogPage(search: $search, limit: 6, sort: "relevance") { total items { id slug title titleEn posterUrl year type } }
    }`,
      { search },
      { signal, timeoutMs: 15000 },
    );
    return data.catalogPage;
  }

  async function fetchGenres(): Promise<Genre[]> {
    const data = await gql<{ genres: Genre[] }>(
      `query Genres { genres { slug nameEn nameRu nameUk } }`,
    );
    return data.genres;
  }

  return {
    fetchAnimes,
    fetchLoloan,
    fetchCatalogPage,
    searchTitles,
    fetchGenres,
  };
}
