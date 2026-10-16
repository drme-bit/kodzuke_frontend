export type Section = "history" | "saved" | "ratings";
export type Entry = {
  anime: {
    id: string;
    slug: string;
    title: string;
    titleEn?: string;
    posterUrl?: string;
    year?: number;
  };
  episodeId?: string;
  episodeNumber?: number;
  episodeTitle?: string;
  thumbnailUrl?: string;
  score?: number;
  positionSeconds?: number;
  durationSeconds?: number;
  completed?: boolean;
  updatedAt: string;
};
export type Library = {
  items: Entry[];
  total: number;
  hasMore: boolean;
  counts: Record<Section, number>;
};

export type HistoryFilter = "continue" | "completed" | "all";
