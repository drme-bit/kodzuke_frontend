"use client";
import { useLocalization } from "@/i18n/client";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import Hls from "hls.js";
import {
  getEmbedCommand,
  type EmbedCommand,
} from "@/features/anime/embedPlayerApi";
import {
  readAdvertisementEvent,
  readPlaybackEvent,
  readPlaybackTime,
  type PlaybackState,
} from "@/features/anime/playbackEvents";

// Прямые медиафайлы (HLS/прогрессив) играем в <video>, всё остальное — внешний плеер в <iframe>.
function isDirectMedia(url: string) {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return (
      path.endsWith(".m3u8") ||
      path.endsWith(".mp4") ||
      path.endsWith(".webm") ||
      path.endsWith(".ogg") ||
      path.endsWith(".mkv")
    );
  } catch {
    return false;
  }
}
function toYoutubeEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be"))
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
  } catch {}
  return url;
}

export interface PlayerHandle {
  play: () => Promise<boolean>;
  pause: () => boolean;
  seek: (time: number) => void;
  volume: (value: number) => void;
}
export type PlayerProgress = {
  time: number;
  duration: number;
  volume?: number;
};
export function Player({
  src,
  poster,
  autoPlay = false,
  playRequest = 0,
  onEnded,
  onPlaybackState,
  onPlaybackIntent,
  playerRef,
  onProgress,
}: {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  playRequest?: number;
  onEnded?: () => void;
  onPlaybackState?: (state: PlaybackState) => void;
  onPlaybackIntent?: () => void;
  playerRef?: Ref<PlayerHandle>;
  onProgress?: (progress: PlayerProgress) => void;
}) {
  const { tui } = useLocalization();
  const callbacks = useRef({
    onEnded,
    onPlaybackState,
    onPlaybackIntent,
    onProgress,
  });
  useEffect(() => {
    callbacks.current = {
      onEnded,
      onPlaybackState,
      onPlaybackIntent,
      onProgress,
    };
  }, [onEnded, onPlaybackState, onPlaybackIntent, onProgress]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState<string | null>(null);

  const isEmbed = src ? !isDirectMedia(src) : false;
  const isHls = src?.toLowerCase().includes(".m3u8") && !isEmbed;

  const embedPlaying = useRef(false);
  const retryTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const embeddedProgress = useRef<PlayerProgress>({ time: 0, duration: 0 });
  const sendEmbedCommand = useCallback(
    (method: EmbedCommand, value?: number) => {
      const command = getEmbedCommand(src, method, value);
      if (!command || !iframeRef.current?.contentWindow) return false;
      if (method === "play" || method === "pause") {
        retryTimers.current.forEach(clearTimeout);
        retryTimers.current = [];
      }
      const send = () =>
        iframeRef.current?.contentWindow?.postMessage(
          command.message,
          command.origin,
        );
      send();
      // Alloha installs its API listener after player readiness, not iframe load.
      if (method === "play")
        for (const delay of [500, 1500, 3500, 7000])
          retryTimers.current.push(
            setTimeout(() => {
              if (!embedPlaying.current) send();
            }, delay),
          );
      return true;
    },
    [src],
  );
  useEffect(
    () => () => {
      retryTimers.current.forEach(clearTimeout);
    },
    [src],
  );
  useImperativeHandle(
    playerRef,
    () => ({
      async play() {
        if (!ref.current) return sendEmbedCommand("play");
        try {
          await ref.current.play();
          return true;
        } catch {
          callbacks.current.onPlaybackState?.("paused");
          return false;
        }
      },
      pause() {
        if (!ref.current) return sendEmbedCommand("pause");
        ref.current.pause();
        return true;
      },
      seek(time) {
        if (!Number.isFinite(time)) return;
        if (ref.current)
          ref.current.currentTime = Math.max(
            0,
            Math.min(ref.current.duration || 0, time),
          );
        else sendEmbedCommand("seek", Math.max(0, time));
      },
      volume(value) {
        if (!Number.isFinite(value)) return;
        const volume = Math.max(0, Math.min(1, value));
        if (ref.current) ref.current.volume = volume;
        else sendEmbedCommand("volume", volume);
      },
    }),
    [sendEmbedCommand],
  );
  function reportProgress() {
    const video = ref.current;
    if (video && Number.isFinite(video.duration))
      onProgress?.({
        time: video.currentTime,
        duration: video.duration,
        volume: video.volume,
      });
  }
  useEffect(() => {
    if (!src || isEmbed) return;
    const video = ref.current;
    if (!video) return;
    if (isHls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(
        Hls.Events.ERROR,
        (_event: unknown, data: { fatal?: boolean; details?: string }) => {
          if (data?.fatal) {
            setErr(data.details || "HLS error");
            onPlaybackState?.("error");
          }
        },
      );
      return () => hls.destroy();
    }
    // Safari native HLS or mp4
    video.src = src;
    const onErr = () => {
      setErr(tui("videoError"));
      onPlaybackState?.("error");
    };
    video.addEventListener("error", onErr);
    return () => video.removeEventListener("error", onErr);
  }, [tui, src, isHls, isEmbed, onPlaybackState]);

  useEffect(() => {
    if (!isEmbed) return;
    const origin = new URL(toYoutubeEmbed(src), window.location.href).origin;
    let ended = false;
    let advertising = false;
    let previousTime: { value: number; at: number } | null = null;
    let lastState: PlaybackState | null = null;
    function receive(event: MessageEvent) {
      if (
        event.source !== iframeRef.current?.contentWindow ||
        event.origin !== origin ||
        ended
      )
        return;
      const ad = readAdvertisementEvent(event.data);
      if (ad !== null) {
        advertising = ad;
        previousTime = null;
        lastState = ad ? "advertising" : "buffering";
        callbacks.current.onPlaybackState?.(lastState);
        if (ad) return;
      }
      if (advertising) return;
      let state = readPlaybackEvent(event.data);
      const time = readPlaybackTime(event.data);
      if (time !== null) {
        const now = Date.now();
        if (
          previousTime &&
          time > previousTime.value &&
          time - previousTime.value <= 15 &&
          now - previousTime.at <= 30000
        )
          state = "playing";
        previousTime = { value: time, at: now };
      }
      let payload = event.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }
      if (payload && typeof payload === "object") {
        const value =
          payload.key === "kodik_player_duration_update"
            ? payload.value
            : payload.event === "duration"
              ? payload.time
              : null;
        if (typeof value === "number" && Number.isFinite(value) && value > 0)
          embeddedProgress.current.duration = value;
        if (
          payload.key === "kodik_player_volume_change" &&
          typeof payload.value === "number"
        )
          embeddedProgress.current.volume = payload.value;
        if (time !== null) embeddedProgress.current.time = time;
        if (embeddedProgress.current.duration > 0)
          callbacks.current.onProgress?.({ ...embeddedProgress.current });
      }
      if (state === "playing" || state === "paused" || state === "ended") {
        embedPlaying.current = state === "playing";
        retryTimers.current.forEach(clearTimeout);
        retryTimers.current = [];
        if (state === "playing" && lastState !== state)
          sendEmbedCommand("duration");
      }
      if (!state) return;
      if (lastState !== state) {
        lastState = state;
        callbacks.current.onPlaybackState?.(state);
      }
      if (state === "ended") {
        ended = true;
        callbacks.current.onEnded?.();
      }
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [src, isEmbed, autoPlay, sendEmbedCommand]);

  useEffect(() => {
    if (!isEmbed) return;
    let pending: ReturnType<typeof setTimeout> | undefined;
    function detectFrameInteraction() {
      if (pending) clearTimeout(pending);
      pending = setTimeout(() => {
        if (document.activeElement === iframeRef.current)
          callbacks.current.onPlaybackIntent?.();
      }, 0);
    }
    window.addEventListener("blur", detectFrameInteraction);
    return () => {
      window.removeEventListener("blur", detectFrameInteraction);
      if (pending) clearTimeout(pending);
    };
  }, [isEmbed, src]);

  useEffect(() => {
    if (autoPlay && isEmbed) {
      callbacks.current.onPlaybackState?.("advertising");
      sendEmbedCommand("play");
    } else if (autoPlay)
      void ref.current?.play().catch(() => onPlaybackState?.("paused"));
  }, [autoPlay, playRequest, isEmbed, onPlaybackState, sendEmbedCommand]);

  if (!src)
    return (
      <div className="flex h-full items-center justify-center text-zinc-500 text-sm">
        {tui("noVideo")}
      </div>
    );

  if (isEmbed) {
    const embedUrl = new URL(toYoutubeEmbed(src), "https://localhost");
    if (autoPlay) embedUrl.searchParams.set("autoplay", "1");
    const embed = embedUrl.toString();
    return (
      <div className="relative h-full w-full bg-black">
        <iframe
          onLoad={() => {
            sendEmbedCommand("duration");
            if (autoPlay) sendEmbedCommand("play");
          }}
          ref={iframeRef}
          key={embed}
          src={embed}
          className="h-full w-full"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          title="player-embed"
          referrerPolicy="origin"
        />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black">
      <video
        ref={ref}
        controls
        onLoadedMetadata={reportProgress}
        onTimeUpdate={reportProgress}
        onVolumeChange={reportProgress}
        playsInline
        autoPlay={autoPlay}
        onPlay={() => onPlaybackState?.("playing")}
        onPlaying={() => onPlaybackState?.("playing")}
        onPause={() => onPlaybackState?.("paused")}
        onWaiting={() => onPlaybackState?.("buffering")}
        onEnded={() => {
          onPlaybackState?.("ended");
          onEnded?.();
        }}
        poster={poster}
        className="h-full w-full"
      />
      {err && (
        <div className="absolute bottom-3 left-3 right-3 rounded bg-red-600/90 px-3 py-2 text-sm text-white">
          {err}
        </div>
      )}
    </div>
  );
}
