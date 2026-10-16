"use client";
import { useCallback, useEffect, useMemo } from "react";
import { useSession } from "@/shared/auth/session";
import type { PlaybackState } from "@/features/anime/playbackEvents";
import type { PlayerProgress } from "@/features/anime/components/Player";
import { recordProgress } from "@/api/library";
import { PlaybackRecorder } from "./PlaybackRecorder";

export function useWatchHistory(
  episodeId: string | undefined,
  state: PlaybackState,
  session: string,
) {
  const token = useSession();
  const recorder = useMemo(
    () => new PlaybackRecorder(episodeId, token, session, recordProgress),
    [episodeId, token, session],
  );
  useEffect(
    () => () => {
      void recorder.flush();
    },
    [recorder],
  );
  useEffect(() => {
    recorder.state(state);
  }, [recorder, state]);
  useEffect(() => {
    if (state !== "playing") return;
    const timer = setInterval(() => recorder.tick(), 1000);
    return () => clearInterval(timer);
  }, [recorder, state]);
  const onProgress = useCallback(
    (value: PlayerProgress) => recorder.update(value),
    [recorder],
  );
  const finish = useCallback(() => {
    void recorder.flush(true);
  }, [recorder]);
  return { onProgress, finish };
}
