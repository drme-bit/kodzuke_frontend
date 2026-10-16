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
