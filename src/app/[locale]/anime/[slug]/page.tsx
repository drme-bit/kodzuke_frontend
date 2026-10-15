import { titleForLocale } from "@/i18n/ui";
import { translator } from "@/i18n/ui";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { getMessages } from "@/i18n";
import { SeasonList } from "@/features/anime/components/SeasonList";
import { fetchAnimeDetails } from "@/lib/graphql";
import { AiringSchedule } from "@/features/anime/components/AiringSchedule";
import { AnimeGallery } from "@/features/anime/components/AnimeGallery";
import { AnimeCommunity } from "@/features/anime/components/AnimeCommunity";
import { animeTypeLabel, animeStatusLabel } from "@/features/anime/presentation";
import { AnimeDescription } from "@/features/anime/components/AnimeDescription";
import { AnimePlayer } from "@/features/anime/components/AnimePlayer";
import { HiArrowLeft } from "react-icons/hi2";

function getYoutubeId(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

export default async function AnimePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const tui = translator(locale);
  const t = getMessages(locale);
  const decodedSlug = decodeURIComponent(slug);
  const anime = await fetchAnimeDetails(decodedSlug, locale);

  if (!anime) {
    return (
      <div className="mx-auto max-w-[1600px] px-6 py-16">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-lg font-semibold text-white">{tui("notFound")}</p>
          <p className="mt-2 text-sm text-white/50">{tui("notFoundHint")}</p>
          <Link href={`/${locale}/browse`} className="mt-6 inline-flex rounded-full bg-white px-6 py-2 text-sm font-bold text-black hover:bg-zinc-100">← {t.browse.title}</Link>
        </div>
      </div>
    );
  }

  const title = anime.titleInfo;
  const episodes = anime.episodes;
  const seasons = [...new Map([anime, ...(title?.seasons ?? [])].map(season => [season.id, season])).values()]
    .sort((a, b) => (a.airingSchedule?.releaseDate ?? `${a.year ?? 9999}-${({ WINTER: "01", SPRING: "04", SUMMER: "07", FALL: "10" } as Record<string, string>)[a.season ?? ""] ?? "12"}-01`).localeCompare(b.airingSchedule?.releaseDate ?? `${b.year ?? 9999}-${({ WINTER: "01", SPRING: "04", SUMMER: "07", FALL: "10" } as Record<string, string>)[b.season ?? ""] ?? "12"}-01`) || (a.seasonNumber ?? 999) - (b.seasonNumber ?? 999) || a.title.localeCompare(b.title));
  const firstEp = episodes[0];
  const ytId = getYoutubeId(anime.trailerUrl);
  const embedSrc = ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0&modestbranding=1` : null;

  const currentSeason = seasons.find(season => season.id === anime.id)?.seasonNumber ?? anime.seasonNumber;
  const gallery = [...new Set([...(anime.gallery ?? []), ...episodes.map(episode => episode.thumbnailUrl).filter((url): url is string => Boolean(url))])];

  return (
    <div className="anime-page">
      <div className="theater-container">
          <AnimePlayer
            animeId={anime.id}
            schedule={anime.airingSchedule}
            animeTitle={titleForLocale(anime,locale)}
            posterUrl={anime.posterUrl}
            episodes={episodes}
            initialEpisode={firstEp}
          />
      </div>

      <div id="anime-information" className="immersive-information">
      <main className="anime-content anime-details">
        {/* left — player with episode selector + gallery + trailer embed */}
        <div className="min-w-0">
          <section className="anime-about"><Link href={`/${locale}/browse`} className="cinema-back"><HiArrowLeft /> {t.browse.title}</Link><h2>{tui("aboutPlot")}</h2><AnimeDescription text={anime.description} /></section>

          {/* youtube trailer inline */}
          {embedSrc && (
            <div id="trailer" className="mt-8">
              <h3 className="mb-3 text-sm font-bold text-white">{tui("trailer")}</h3>
              <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
                <iframe src={embedSrc} className="h-full w-full" allow="encrypted-media" title="trailer" />
              </div>
            </div>
          )}

          {["AIRING", "RELEASING", "ONGOING"].includes(anime.status?.toUpperCase() ?? "") && <AiringSchedule episodes={episodes} schedule={anime.airingSchedule} />}
          <AnimeGallery images={gallery} title={titleForLocale(anime,locale)} />
          <AnimeCommunity score={anime.score} locale={locale} />

        </div>

        {/* right — seasons + meta */}
        <aside className="anime-sidebar sticky top-32 hidden h-[calc(100vh-4rem)] flex-col gap-6 overflow-y-auto pt-16 md:flex">
          <SeasonList seasons={seasons} currentId={anime.id} locale={locale} />

          {/* extra info */}
          <div className="sidebar-panel anime-facts">
            <h4 className="text-base font-semibold text-white">{tui("aboutTitle")}</h4>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-white/50">{tui("status")}</dt><dd className="font-medium text-white">{animeStatusLabel(anime.status,locale)}</dd></div>
              <div className="flex justify-between"><dt className="text-white/50">{tui("season")}</dt><dd className="font-medium text-white">{currentSeason ? tui("seasonNumber",{n:currentSeason}) : tui("unspecified")}</dd></div>
              <div className="flex justify-between"><dt className="text-white/50">{tui("year")}</dt><dd className="font-medium text-white">{anime.year ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-white/50">{tui("type")}</dt><dd className="font-medium text-white">{animeTypeLabel(anime.type,locale)}</dd></div>
              <div className="flex justify-between"><dt className="text-white/50">{tui("episodes")}</dt><dd className="font-medium text-white">{anime.episodesCount ?? "—"}</dd></div>
            </dl>
          </div>
        </aside>
      </main>
      </div>
    </div>
  );
}
