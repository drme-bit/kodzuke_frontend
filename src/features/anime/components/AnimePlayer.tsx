"use client";
import { useSearchParams } from "next/navigation";
import { useWatchHistory } from "@/features/library/useWatchHistory";
import type { PlayerHandle } from "./Player";
import { useLocalization } from "@/i18n/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { EpisodeRating } from "@/features/rating/EpisodeRating";
import { EpisodePicker } from "./EpisodePicker";
import { EpisodeList } from "@/features/anime/components/EpisodeList";
import { StreamPlayer } from "@/features/anime/components/StreamPlayer";
import {
  HiChevronLeft,
  HiChevronRight,
  HiArrowsPointingOut,
} from "react-icons/hi2";
import {
  isEpisodeAvailable,
  voiceLabel,
  playerLabel,
} from "@/features/anime/playerSources";
import { playbackSelection } from "@/features/anime/playbackSelection";
import type { PlaybackState } from "@/features/anime/playbackEvents";
import { useEpisodeMetadata } from "@/features/anime/hooks/useEpisodeMetadata";
import type { Episode } from "@/dto";
interface AnimePlayerProps {
  schedule?: { airDate?: string; number?: number };
  animeId: string;
  animeTitle: string;
  posterUrl?: string;
  episodes: Episode[];
  initialEpisode?: Episode;
}
export function AnimePlayer({
  animeId,
  schedule,
  animeTitle,
  posterUrl,
  episodes: initialEpisodes,
  initialEpisode,
}: AnimePlayerProps) {
  const { tui, locale } = useLocalization();
  const episodes = useEpisodeMetadata(animeId, locale, initialEpisodes);
  const [episodesOpen, setEpisodesOpen] = useState(false);
  const episodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function cancelEpisodeTimer() {
    if (episodeTimer.current) clearTimeout(episodeTimer.current);
    episodeTimer.current = null;
  }
  function keepEpisodesOpen() {
    cancelEpisodeTimer();
  }
  function scheduleEpisodes(open: boolean) {
    cancelEpisodeTimer();
    episodeTimer.current = setTimeout(
      () => {
        if (
          !open &&
          document
            .querySelector("#episode-overlay")
            ?.contains(document.activeElement)
        )
          return;
        setEpisodesOpen(open);
      },
      open ? 900 : 1200,
    );
  }
  useEffect(
    () => () => {
      if (episodeTimer.current) clearTimeout(episodeTimer.current);
    },
    [],
  );
  const [watchInView, setWatchInView] = useState(true);
  const watchRef = useRef<HTMLElement>(null);
  const [fullscreenError, setFullscreenError] = useState(false);
  const [playback, setPlayback] = useState<{
    session: string;
    state: PlaybackState;
  } | null>(null);
  useEffect(() => {
    const watch = watchRef.current;
    if (!watch) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setWatchInView(entry.isIntersecting && entry.intersectionRatio >= 0.5);
      },
      { threshold: [0, 0.5, 1] },
    );
    observer.observe(watch);
    return () => observer.disconnect();
  }, []);
  const search = useSearchParams();
  const requestedEpisode = search.get("episode");
  const resumeAt = Math.min(86400, Math.max(0, Number(search.get("t")) || 0));
  const playerRef = useRef<PlayerHandle>(null);
  const resumed = useRef(false);
  const [selectedId, setSelectedId] = useState(
    () =>
      episodes.find((episode) => episode.id === requestedEpisode)?.id ??
      initialEpisode?.id ??
      episodes[0]?.id,
  );
  const [voice, setVoice] = useState<string | null>(null);
  const [player, setPlayer] = useState<string | null>(null);
  const [autoNext, setAutoNext] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const current =
    episodes.find((e) => e.id === selectedId) ?? episodes[0] ?? null;
  const episodeTitle =
    current?.title &&
    !/^(?:(?:серия|episode)\s*)?\d+$/i.test(current.title.trim())
      ? current.title
      : null;
  const sources = current?.sources ?? [];
  const { players, activePlayer, voices, activeVoice, source } =
    playbackSelection(sources, player, voice, playerLabel, (source) =>
      voiceLabel(source, locale),
    );
  const index = episodes.findIndex((e) => e.id === current?.id);
  const previous = episodes[index - 1];
  const next = episodes[index + 1];
  const session = `${current?.id ?? "none"}:${source?.id ?? "default"}`;
  const playbackState = playback?.session === session ? playback.state : "idle";
  const history = useWatchHistory(current?.id, playbackState, session);
  useEffect(() => {
    if (
      playbackState === "playing" &&
      current?.id === requestedEpisode &&
      resumeAt > 0 &&
      !resumed.current
    ) {
      resumed.current = true;
      playerRef.current?.seek(resumeAt);
    }
  }, [playbackState, current?.id, requestedEpisode, resumeAt]);
  const [idle, setIdle] = useState(false);
  const lastActivity = useRef(0);
  const noteActivity = useCallback(() => {
    lastActivity.current = Date.now();
    setIdle(false);
  }, []);
  useEffect(() => {
    lastActivity.current = Date.now();
    if (playbackState !== "playing" || !watchInView) return;
    const activity = () => noteActivity();
    window.addEventListener("pointermove", activity, { passive: true });
    window.addEventListener("pointerdown", activity, { passive: true });
    window.addEventListener("keydown", activity);
    const timer = setInterval(() => {
      const pickerOpen = watchRef.current?.querySelector("details[open]");
      if (!pickerOpen && Date.now() - lastActivity.current >= 3500)
        setIdle(true);
    }, 250);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pointermove", activity);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("keydown", activity);
    };
  }, [playbackState, watchInView, noteActivity]);
  const advertising = playbackState === "advertising";
  const showEpisodes =
    !advertising && (playbackState !== "playing" || episodesOpen);
  const uiHidden = playbackState === "playing" && watchInView && idle;
  const onPlaybackState = useCallback(
    (state: PlaybackState) => {
      setPlayback((previous) =>
        previous?.session === session && previous.state === state
          ? previous
          : { session, state },
      );
    },
    [session],
  );
  async function enterFullscreen() {
    type SafariDocument = Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => void;
    };
    type SafariElement = HTMLElement & { webkitRequestFullscreen?: () => void };
    const fullscreenDocument = document as SafariDocument;
    const target = watchRef.current as SafariElement | null;
    try {
      if (fullscreenDocument.fullscreenElement)
        await fullscreenDocument.exitFullscreen();
      else if (fullscreenDocument.webkitFullscreenElement)
        fullscreenDocument.webkitExitFullscreen?.();
      else if (target?.requestFullscreen) await target.requestFullscreen();
      else if (target?.webkitRequestFullscreen)
        target.webkitRequestFullscreen();
      else throw new Error("Fullscreen unavailable");
      setFullscreenError(false);
    } catch {
      setFullscreenError(true);
    }
  }
  function prepareSelection() {
    setAutoPlay(false);
  }
  function selectEpisode(episode: Episode, automatic = false) {
    if (source) {
      setVoice(voiceLabel(source, locale));
      setPlayer(playerLabel(source));
    }
    noteActivity();
    setSelectedId(episode.id);
    setAutoPlay(automatic);
  }

  return (
    <section
      ref={watchRef}
      id="watch"
      className="watch-section immersive-watch"
      data-controls={uiHidden ? "hidden" : "visible"}
      data-rail={showEpisodes ? "open" : "closed"}
      data-in-view={watchInView ? "true" : "false"}
      data-playback={playbackState}
      aria-label={`${tui("watch")} ${animeTitle}`}
    >
      <div className="immersive-video" onPointerEnter={noteActivity}>
        <StreamPlayer
          key={`${current?.id ?? "none"}:${source?.id ?? "default"}`}
          episode={current}
          sourceId={source?.id}
          poster={posterUrl}
          autoPlay={autoPlay}
          playerRef={playerRef}
          onProgress={history.onProgress}
          onPlaybackIntent={() => {
            if (playbackState === "idle") onPlaybackState("advertising");
          }}
          onPlaybackState={onPlaybackState}
          onEnded={() => {
            history.finish();
            if (autoNext && next && isEpisodeAvailable(next))
              selectEpisode(next, true);
          }}
        />
      </div>
      <div
        className="player-wake-edges"
        aria-hidden="true"
        onPointerEnter={noteActivity}
        onPointerMove={noteActivity}
      >
        <span className="player-wake-top" />
        <span className="player-wake-left" />
        <span className="player-wake-right" />
      </div>
      <div id="immersive-panels" className="immersive-panels">
        <div className="watch-controls player-top-controls">
          <label className="watch-field">
            <span>{tui("player")}</span>
            <select
              aria-label={tui("player")}
              disabled={!players.length}
              value={activePlayer ?? ""}
              onChange={(e) => {
                prepareSelection();
                setPlayer(e.target.value);
                setVoice(activeVoice ?? null);
              }}
            >
              {!players.length && <option value="">{tui("noPlayers")}</option>}
              {players.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="watch-field">
            <span>{tui("voice")}</span>
            <select
              aria-label={tui("voice")}
              disabled={!voices.length}
              value={activeVoice ?? ""}
              onChange={(e) => {
                prepareSelection();
                setPlayer(activePlayer ?? null);
                setVoice(e.target.value);
              }}
            >
              {!voices.length && <option value="">{tui("noVoices")}</option>}
              {voices.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <div className="player-unified-controls">
            <div className="episode-navigation">
              <button
                type="button"
                aria-label={tui("previousEpisode")}
                disabled={!previous || !isEpisodeAvailable(previous)}
                onClick={() => previous && selectEpisode(previous)}
              >
                <HiChevronLeft />
              </button>
              <EpisodePicker
                episodes={episodes}
                current={current}
                onSelect={selectEpisode}
              />
              <button
                type="button"
                aria-label={tui("nextEpisode")}
                disabled={!next || !isEpisodeAvailable(next)}
                onClick={() => next && selectEpisode(next)}
              >
                <HiChevronRight />
              </button>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoNext}
              className="auto-next-switch"
              onClick={() => setAutoNext((value) => !value)}
            >
              <span className="switch-track">
                <span />
              </span>
              {tui("autoNext")}
            </button>
            <button
              type="button"
              className="player-fullscreen-button"
              aria-label={tui("fullscreen")}
              onClick={enterFullscreen}
            >
              <HiArrowsPointingOut />
            </button>
          </div>
        </div>
        {fullscreenError && (
          <p className="player-fullscreen-message" role="status">
            {tui("fullscreenUnsupported")}
          </p>
        )}
        <button
          type="button"
          className="episode-dwell-zone w-1/3"
          inert={advertising}
          aria-hidden={advertising}
          onPointerMove={noteActivity}
          aria-expanded={episodesOpen}
          aria-controls="episode-overlay"
          aria-label={tui(episodesOpen ? "collapseEpisodes" : "expandEpisodes")}
          onPointerEnter={(event) => {
            noteActivity();
            if (event.pointerType === "mouse") scheduleEpisodes(true);
          }}
          onPointerLeave={() =>
            episodesOpen ? scheduleEpisodes(false) : cancelEpisodeTimer()
          }
          onClick={() => {
            cancelEpisodeTimer();
            setEpisodesOpen((value) => !value);
          }}
        ></button>
        <section
          onPointerEnter={keepEpisodesOpen}
          onPointerLeave={() => scheduleEpisodes(false)}
          onFocusCapture={keepEpisodesOpen}
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            )
              scheduleEpisodes(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              cancelEpisodeTimer();
              setEpisodesOpen(false);
            }
          }}
          id="episode-overlay"
          className="episode-overlay"
          inert={!showEpisodes}
          aria-hidden={!showEpisodes}
          aria-label={tui("episodeList")}
        >
          <div className="episode-overlay-heading">
            <span className="current-episode-number">
              {tui("episodeNumber", { n: current?.number ?? 1 })}
            </span>
            <h1>{episodeTitle ?? animeTitle}</h1>
            {episodeTitle && (
              <p className="current-anime-title">{animeTitle}</p>
            )}
            {current?.description && (
              <p className="current-episode-summary">
                {current.description.replace(/<[^>]*>/g, "")}
              </p>
            )}
            {playbackState === "error" && (
              <p className="cinema-playback-note">{tui("videoUnavailable")}</p>
            )}
          </div>
          {current && (
            <EpisodeRating
              key={current.id}
              episodeId={current.id}
              available={isEpisodeAvailable(current)}
              locale={locale}
            />
          )}
          <EpisodeList
            schedule={schedule}
            episodes={episodes.map((episode) =>
              schedule?.number === episode.number && schedule.airDate
                ? { ...episode, airDate: schedule.airDate }
                : episode,
            )}
            currentId={current?.id}
            onSelect={selectEpisode}
          />
        </section>
      </div>
    </section>
  );
}
