// Formats verified against the providers' own iframe bundles.
export type EmbedCommand = "play" | "pause" | "seek" | "volume" | "duration";
export function getEmbedCommand(src: string, command: EmbedCommand, value?: number): { origin: string; message: object | string } | null {
  let url: URL;
  try { url = new URL(src, "https://localhost"); } catch { return null; }
  const host = url.hostname;
  if (host === "kodikplayer.com" || host === "kodik.info") {
    if (command === "duration") return null;
    const payload: Record<string, string | number> = { method: command };
    if (command === "seek") { if (value == null || !Number.isFinite(value) || value < 0) return null; payload.seconds = value; }
    if (command === "volume") { if (value == null || !Number.isFinite(value) || value < 0 || value > 1) return null; payload.volume = value; }
    return { origin: url.origin, message: { key: "kodik_player_api", value: payload } };
  }
  if (host === "alloha.yani.tv") {
    if (command === "volume") return null;
    const payload: Record<string, string | number> = { api: command };
    if (command === "seek") { if (value == null || !Number.isFinite(value) || value <= 0) return null; payload.value = value; }
    return { origin: url.origin, message: JSON.stringify(payload) };
  }
  return null;
}
