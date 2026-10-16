import type { Anime } from "./anime";
export type LoloanRow = {
  id: string;
  title: string;
  animes: Anime[];
  nextPage: number;
  hasMore: boolean;
};

export type CatalogFilters = {
  genres?: string[];
  search?: string;
  type?: string;
  status?: string;
  season?: string;
  year?: number;
  sort?: "score" | "year" | "title";
};

export type CatalogPage = {
  items: Anime[];
  total: number;
  hasMore: boolean;
  types: string[];
  statuses: string[];
  seasons: string[];
  years: number[];
};
