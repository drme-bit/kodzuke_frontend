"use client";
import { ReleaseCountdown } from "./ReleaseCountdown";
import { useHorizontalWheel } from "@/shared/hooks/useHorizontalWheel";
import styles from "./EpisodeList.module.css";
import { useLocalization } from "@/i18n/client";
import { useEffect, useRef, useState } from "react";
import { HiPlay, HiLockClosed, HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { isEpisodeAvailable } from "@/features/anime/playerSources";
import type { Episode } from "@/lib/graphql";

function EpisodeThumbnail({ src, number }: { src?: string; number: number }) {
  const { tui } = useLocalization();
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) return <span className="episode-preview-empty"><span>{String(number).padStart(2, "0")}</span><small>{tui("noPreview")}</small></span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(src)} />;
}

export function EpisodeList({ episodes, currentId, onSelect, schedule }: { episodes: Episode[]; currentId?: string; onSelect: (episode: Episode) => void; schedule?: { number?: number; airDate?: string } }) {
  const { tui, locale } = useLocalization();
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const list = listRef.current;
    const selected = selectedRef.current;
    if (!list || !selected) return;
    const offset = selected.getBoundingClientRect().left - list.getBoundingClientRect().left;
    if (offset < 0) list.scrollLeft += offset;
    else if (offset + selected.offsetWidth > list.clientWidth) list.scrollLeft += offset + selected.offsetWidth - list.clientWidth;
  }, [currentId]);
  useHorizontalWheel(listRef);
  return <aside className="theater-episodes" aria-label={tui("episodeList")} >
    <div className="theater-episodes-heading"><h3>{tui("episodes")}</h3><span>{episodes.length}</span></div>
    <div className="episode-rail-navigation">
      <button type="button" aria-label={tui("scrollBack")}  onClick={() => listRef.current?.scrollBy({ left: -450, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}><HiChevronLeft /></button>
      <button type="button" aria-label={tui("scrollForward")}  onClick={() => listRef.current?.scrollBy({ left: 450, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}><HiChevronRight /></button>
    </div>
    <div className={`episode-list overflow-x-auto ${styles.rail}`} ref={listRef} tabIndex={0} aria-label={tui("scrollEpisodes")} >
      {episodes.map(episode => {
        const active = currentId === episode.id;
        const available = isEpisodeAvailable(episode);
        const image = episode.thumbnailUrl;
        const title = episode.title && !/^(?:(?:серия|episode)\s*)?\d+$/i.test(episode.title.trim()) ? episode.title : null;
        return <button type="button" key={episode.id} ref={active ? selectedRef : undefined} className={`episode-row${active ? " selected" : ""}`} disabled={!available} aria-pressed={active} onClick={() => onSelect(episode)}>
          <span className="episode-thumbnail">
            <EpisodeThumbnail src={image} number={episode.number} />
            {available && <span className="episode-playing" aria-hidden="true"><HiPlay /></span>}
            {!available && <span className="episode-lock"><HiLockClosed /></span>}
          </span>
          <span className="episode-caption"><span className="episode-number">{tui("episodeNumber",{n:episode.number})}{episode.duration ? ` · ${Math.round(episode.duration / 60)} ${tui("minutes")}` : ""}</span>{title && <span className="episode-name">{title}</span>}{episode.description && <span className="episode-summary">{episode.description.replace(/<[^>]*>/g, "")}</span>}<ReleaseCountdown airDate={episode.airDate} /><span className="episode-state">{active ? tui("selected") : !available ? tui("unavailable") : episode.airDate ? new Date(episode.airDate).toLocaleDateString(locale) : tui("watch")}</span></span>
        </button>;
      })}
      {schedule?.number && schedule.airDate && !episodes.some(episode => episode.number === schedule.number) && <div className="episode-row episode-upcoming" aria-label={tui("episodeNumber", { n: schedule.number })}>
        <span className="episode-thumbnail episode-upcoming-preview"><ReleaseCountdown airDate={schedule.airDate} /></span>
        <span className="episode-caption"><span className="episode-number">{tui("episodeNumber", { n: schedule.number })}</span><span className="episode-upcoming-date">{new Date(schedule.airDate).toLocaleDateString(locale, { day: "numeric", month: "long" })}</span></span>
      </div>}
      {!episodes.length && <p className="episode-list-empty">{tui("episodesPending")}</p>}
    </div>
  </aside>;
}
