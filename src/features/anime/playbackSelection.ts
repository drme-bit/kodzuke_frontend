import type { EpisodeSource } from "@/dto";

/** Player is the primary choice. Audio never widens the source pool. */
export function playbackSelection(
  sources: EpisodeSource[], preferredPlayer: string | null, preferredVoice: string | null,
  playerKey: (source: EpisodeSource) => string, voiceKey: (source: EpisodeSource) => string,
) {
  const players = [...new Set(sources.map(playerKey))];
  const activePlayer = preferredPlayer && players.includes(preferredPlayer) ? preferredPlayer : players[0];
  const playerSources = sources.filter(source => playerKey(source) === activePlayer);
  const voices = [...new Set(playerSources.map(voiceKey))];
  const activeVoice = preferredVoice && voices.includes(preferredVoice) ? preferredVoice : voices[0];
  const source = playerSources.find(source => voiceKey(source) === activeVoice);
  return { players, activePlayer, voices, activeVoice, source };
}
