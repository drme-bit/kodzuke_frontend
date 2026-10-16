"use client";
import { useLocalization } from "@/i18n/client";
import { useEffect, useState, type Ref } from "react";
import type { PlaybackState } from "@/features/anime/playbackEvents";
import { Player, type PlayerHandle, type PlayerProgress } from "@/features/anime/components/Player";
import { fetchEpisodeStream } from "@/api/anime/client";
import type { Episode, StreamResponse } from "@/dto";
export function StreamPlayer({ episode, sourceId: selectedSourceId, poster, autoPlay = false, playRequest = 0, onEnded, onPlaybackState, onPlaybackIntent, playerRef, onProgress, className = "aspect-video" }: { episode: Episode | null; sourceId?: string; poster?: string; autoPlay?: boolean; playRequest?: number; onEnded?: () => void; onPlaybackState?: (state: PlaybackState) => void; className?: string; onPlaybackIntent?: () => void; playerRef?: Ref<PlayerHandle>; onProgress?: (progress: PlayerProgress) => void }) {
  const { tui } = useLocalization();
  const episodeId = episode?.id ?? null;
  const sources = episode?.sources ?? [];
  const sourceId = selectedSourceId ?? sources[0]?.id ?? null;
  const fallbackUrl = (sources.find(source => source.id === sourceId) ?? sources[0])?.embedUrl;
  const [stream, setStream] = useState<StreamResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!episodeId) return;
    const controller = new AbortController();
    async function load() {
      try {
        const data = await fetchEpisodeStream(episodeId!, sourceId ?? undefined, controller.signal);
        if (!data) throw new Error(tui("sourceUnavailable"));
        if (!controller.signal.aborted) { setStream(data); setError(null); }
      } catch (e) {
        if (!controller.signal.aborted) { setStream(null); setError(e instanceof Error ? e.message : tui("sourceUnavailable")); if (!fallbackUrl) onPlaybackState?.("error"); }
      }
    }
    void load();
    return () => controller.abort();
  }, [episodeId, sourceId, fallbackUrl, onPlaybackState, tui]);
  const activeSource = sources.find(s => s.id === sourceId) ?? sources[0] ?? null;
  const src = stream?.directUrl || stream?.embedUrl || activeSource?.embedUrl || null;
  const loading = Boolean(episodeId) && !src && !error;
  return (
    <div className="stream-shell">
      <div className={`stream-screen ${className}`}>
        {src ? <Player key={src} src={src} poster={poster} autoPlay={autoPlay} playRequest={playRequest} onEnded={onEnded} onPlaybackState={onPlaybackState} onPlaybackIntent={onPlaybackIntent} playerRef={playerRef} onProgress={onProgress} /> : (
          <div className="stream-placeholder" role="status">
            {poster && <div className="stream-backdrop" style={{ backgroundImage: `url(${poster})` }} />}
            <div className="stream-message">
              {loading ? <div className="stream-spinner" /> : <span className="stream-empty-icon">▷</span>}
              <p>{loading ? tui("connecting") : error ? tui("videoFailed") : tui("videoPending")}</p>
              <span>{error ? tui("retryVideo") : loading ? tui("loadingHint") : tui("chooseEpisode")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
