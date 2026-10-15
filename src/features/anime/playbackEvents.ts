export type PlaybackState = "idle" | "playing" | "paused" | "buffering" | "ended" | "error";
export function readPlaybackEvent(data: unknown): PlaybackState | null {
  if (typeof data === "string") { try { data = JSON.parse(data); } catch { return null; } }
  if (!data || typeof data !== "object") return null;
  const message = data as Record<string, unknown>;
  const name = message.key ?? message.event;
  if (name === "kodik_player_play" || name === "play" || name === "playing") return "playing";
  if (name === "kodik_player_pause" || name === "pause" || name === "paused") return "paused";
  if (name === "kodik_player_video_ended" || name === "ended" || name === "end") return "ended";
  if (name === "waiting" || name === "buffering") return "buffering";
  if (name === "error") return "error";
  return null;
}

export function readPlaybackTime(data: unknown): number | null {
  if (typeof data === "string") { try { data = JSON.parse(data); } catch { return null; } }
  if (!data || typeof data !== "object") return null;
  const message = data as Record<string, unknown>;
  const name = message.key ?? message.event;
  if (name !== "timeupdate" && name !== "kodik_player_time_update") return null;
  const value = message.time ?? message.value;
  const time = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  return Number.isFinite(time) && time >= 0 ? time : null;
}
