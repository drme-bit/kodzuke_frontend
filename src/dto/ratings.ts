export type ExternalAnimeRating = {
  source: string;
  score: number;
  scale: number;
  url: string;
  votes?: number | null;
  updatedAt?: string | null;
};

export type RatingSummary = {
  score: number | null;
  votes: number;
  ratedEpisodes: number;
  totalEpisodes: number;
  ownScore: number | null;
};
export type CardRating = {
  animeId: string;
  source: string;
  score: number;
  scale: number;
};
