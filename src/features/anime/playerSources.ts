import { translator } from "@/i18n/ui";
import type { Episode, EpisodeSource } from "@/lib/graphql";
export function isEpisodeAvailable(episode: Episode) {
  if (episode.sources?.length) return true;
  if (episode.status) return episode.status === "AVAILABLE";
  if (episode.airDate) return new Date(episode.airDate).getTime() <= Date.now();
  return Boolean(episode.sources?.length);
}
export function voiceLabel(source: EpisodeSource, locale = "ru") { const t=translator(locale); return source.name?.replace(/^Озвучка\s*/i,t("voice")+" ").replace(/^Субтитры\s*/i,t("subtitles")+" ") || t("original"); }
export function playerLabel(source: EpisodeSource) {
  try {
    const host = new URL(source.embedUrl || "", "https://localhost").hostname;
    if (host.includes("kodik")) return "Kodik";
    if (host.includes("alloha")) return "Alloha";
    if (host === "player.aksor.tv") return "Aksor";
    if (host === "ru.yummyani.me") return "YummyAnime";
    if (host !== "localhost") return host.replace(/^www\./, "");
  } catch { /* A source can be resolved only after requesting the stream. */ }
  return source.source === "YANIME" ? "YummyAnime" : source.source === "ANITUBE" ? "Anitube" : source.source || "Основной";
}
