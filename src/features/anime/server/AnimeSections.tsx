import "server-only";
import type { Anime } from "@/dto";
import {
  getAnimeEpisodes,
  getAnimeGallery,
  getAnimeSchedule,
  getAnimeSeasons,
} from "@/api/server/anime";
import { animeTypeLabel, animeStatusLabel } from "@/i18n/anime";
import { translator } from "@/i18n/ui";
import { titleForLocale } from "@/i18n/content";
import { AnimePlayer } from "@/features/anime/components/AnimePlayer";
import { AnimeGallery } from "@/features/anime/components/AnimeGallery";
import { AiringSchedule } from "@/features/anime/components/AiringSchedule";
import { SeasonList } from "@/features/anime/components/SeasonList";

export async function AnimePlayback({
  anime,
  locale,
}: {
  anime: Anime;
  locale: string;
}) {
  const [episodes, schedule] = await Promise.all([
    getAnimeEpisodes(anime.id, locale),
    ["AIRING", "RELEASING", "ONGOING"].includes(
      anime.status?.toUpperCase() ?? "",
    )
      ? getAnimeSchedule(anime.id).catch(() => undefined)
      : Promise.resolve(undefined),
  ]);
  return (
    <AnimePlayer
      animeId={anime.id}
      schedule={schedule}
      animeTitle={titleForLocale(anime, locale)}
      posterUrl={anime.posterUrl}
      episodes={episodes}
      initialEpisode={episodes[0]}
    />
  );
}

export async function AnimeMedia({
  anime,
  locale,
}: {
  anime: Anime;
  locale: string;
}) {
  const [gallery, episodes] = await Promise.all([
    getAnimeGallery(anime.id).catch(() => []),
    getAnimeEpisodes(anime.id, locale).catch(() => []),
  ]);
  const images = [
    ...new Set([
      ...gallery,
      ...episodes
        .map((episode) => episode.thumbnailUrl)
        .filter((url): url is string => Boolean(url)),
    ]),
  ];
  return <AnimeGallery images={images} title={titleForLocale(anime, locale)} />;
}

export async function AnimeRelease({
  anime,
  locale,
}: {
  anime: Anime;
  locale: string;
}) {
  const [episodes, schedule] = await Promise.all([
    getAnimeEpisodes(anime.id, locale).catch(() => []),
    getAnimeSchedule(anime.id).catch(() => undefined),
  ]);
  return <AiringSchedule episodes={episodes} schedule={schedule} />;
}

function releaseDate(anime: Anime) {
  return (
    anime.airingSchedule?.releaseDate ??
    `${anime.year ?? 9999}-${({ WINTER: "01", SPRING: "04", SUMMER: "07", FALL: "10" } as Record<string, string>)[anime.season ?? ""] ?? "12"}-01`
  );
}
export async function AnimeSeasons({
  anime,
  locale,
}: {
  anime: Anime;
  locale: string;
}) {
  const related = await getAnimeSeasons(anime.id).catch(() => []);
  const seasons = [
    ...new Map(
      [anime, ...related].map((season) => [season.id, season]),
    ).values(),
  ].sort(
    (a, b) =>
      releaseDate(a).localeCompare(releaseDate(b)) ||
      (a.seasonNumber ?? 999) - (b.seasonNumber ?? 999) ||
      a.title.localeCompare(b.title),
  );
  return <SeasonList seasons={seasons} currentId={anime.id} locale={locale} />;
}

export async function AnimeFacts({
  anime,
  locale,
}: {
  anime: Anime;
  locale: string;
}) {
  const related = await getAnimeSeasons(anime.id).catch(() => []);
  const currentSeason =
    related.find((season) => season.id === anime.id)?.seasonNumber ??
    anime.seasonNumber;
  const tui = translator(locale);
  return (
    <div className="sidebar-panel anime-facts">
      <h4 className="text-base font-semibold text-white">
        {tui("aboutTitle")}
      </h4>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-white/50">{tui("status")}</dt>
          <dd className="font-medium text-white">
            {animeStatusLabel(anime.status, locale)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/50">{tui("season")}</dt>
          <dd className="font-medium text-white">
            {currentSeason
              ? tui("seasonNumber", { n: currentSeason })
              : tui("unspecified")}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/50">{tui("year")}</dt>
          <dd className="font-medium text-white">{anime.year ?? "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/50">{tui("type")}</dt>
          <dd className="font-medium text-white">
            {animeTypeLabel(anime.type, locale)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/50">{tui("episodes")}</dt>
          <dd className="font-medium text-white">
            {anime.episodesCount ?? "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
