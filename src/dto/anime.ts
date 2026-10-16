import type { Genre } from "./genres";
export type Anime = {
  genres?: Genre[];
  id: string;
  slug: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
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

export type AnimeTitle = { seasons: Anime[] };

/** Lightweight public query projection used by the landing background. */
export type BackgroundTrailer = Pick<Anime, "id" | "title" | "trailerUrl">;
