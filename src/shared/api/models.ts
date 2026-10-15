export type Anime = {
  id: string;
  slug: string;
  title: string;
  titleEn?: string;
  description?: string;
  posterUrl?: string;
  bannerUrl?: string;
  trailerUrl?: string;
  gallery?: string[];
  year?: number;
  score?: number;
  type?: string;
  status?: string;
  season?: string;
  episodesCount?: number;
  duration?: number;
  seasonNumber?: number;
  airingSchedule?: { releaseDate?: string; airDate?: string; number?: number };
};

export type LoloanRow = {
  id: string;
  title: string;
  animes: Anime[];
  nextPage: number;
  hasMore: boolean;
};

export type EpisodeStatus = "UNAVAILABLE" | "UPCOMING" | "AVAILABLE";

export type EpisodeSource = {
  id: string;
  name?: string;
  source?: string; // ANITUBE | YANIME
  embedUrl?: string;
};

export type StreamResponse = {
  embedUrl?: string;
  directUrl?: string | null;
};

export type Episode = {
  id: string;
  number: number;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: number;
  status?: EpisodeStatus;
  airDate?: string; // ISO date string
  sources?: EpisodeSource[];
};

export type CatalogFilters = { search?: string; type?: string; status?: string; season?: string; year?: number; sort?: "score" | "year" | "title" };

export type CatalogPage = { items: Anime[]; total: number; hasMore: boolean; types: string[]; statuses: string[]; seasons: string[]; years: number[] };

export type AnimeTitle = { seasons: Anime[] };
