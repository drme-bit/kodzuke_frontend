"use client";
import { useState } from "react";
import type { Anime, LoloanRow } from "@/shared/api/models";
import { BrowseRows } from "@/features/browse/components/BrowseRows";

/** Keep landing shelves identical to the browse experience. */
export function HomeAnimeShelf({ row, locale }: { row: LoloanRow; locale: string }) {
  const [active, setActive] = useState<{ id: string; rowId: string } | null>(null);
  return <div className="landing-section landing-anime-shelf"><BrowseRows rows={[row]} locale={locale} active={active} onHover={(anime: Anime, rowId: string) => setActive({ id: anime.id, rowId })} /></div>;
}
