import { normalizeLocale } from "./config";
import { translator } from "./ui";
import { types, statuses, seasons } from "./messages/anime";
export function animeTypeLabel(value?: string, locale = "ru") {
  const labels: Record<string, string> = types[normalizeLocale(locale)];
  return labels[value ?? ""] ?? value ?? translator(locale)("unspecified");
}
export function animeStatusLabel(value?: string, locale = "ru") {
  const labels: Record<string, string> = statuses[normalizeLocale(locale)];
  return labels[value ?? ""] ?? value ?? translator(locale)("unspecified");
}
export function releaseSeasonLabel(value?: string, locale = "ru") {
  const labels: Record<string, string> = seasons[normalizeLocale(locale)];
  return labels[value ?? ""] ?? value;
}
