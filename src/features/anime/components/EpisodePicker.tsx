"use client";
import { useRef, useState } from "react";
import { HiChevronRight } from "react-icons/hi2";
import { useLocalization } from "@/i18n/client";
import { isEpisodeAvailable } from "@/features/anime/playerSources";
import type { Episode } from "@/shared/api/models";

export function EpisodePicker({ episodes, current, onSelect }: { episodes: Episode[]; current: Episode | null; onSelect: (episode: Episode) => void }) {
  const { tui, locale } = useLocalization();
  const [query, setQuery] = useState("");
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const normalized = query.trim().toLocaleLowerCase(locale);
  const matches = episodes.filter(episode => String(episode.number).includes(normalized) || episode.title?.toLocaleLowerCase(locale).includes(normalized));
  return <details className="episode-picker" ref={detailsRef} onToggle={event => { if (event.currentTarget.open) searchRef.current?.focus(); }} onKeyDown={event => { if (event.key === "Escape" && detailsRef.current) { detailsRef.current.open = false; detailsRef.current.querySelector("summary")?.focus(); } }}>
    <summary aria-label={tui("episode")}>{current ? tui("episodeOf", { n: current.number, total: episodes.length }) : tui("noEpisodes")}<HiChevronRight /></summary>
    <div className="episode-picker-menu">
      <input ref={searchRef} type="search" aria-label={tui("searchEpisodes")} placeholder={tui("searchEpisodes")} value={query} onChange={event => setQuery(event.target.value)} />
      <div className="episode-picker-results">
        {matches.map(episode => <button type="button" key={episode.id} aria-current={current?.id === episode.id ? "true" : undefined} disabled={!isEpisodeAvailable(episode)} onClick={() => { onSelect(episode); setQuery(""); if (detailsRef.current) { detailsRef.current.open = false; detailsRef.current.querySelector("summary")?.focus(); } }}>
          <span>{tui("episodeNumber", { n: episode.number })}</span>{episode.title && <small>{episode.title}</small>}
        </button>)}
        {!matches.length && <p>{tui("noEpisodeMatches")}</p>}
      </div>
    </div>
  </details>;
}
