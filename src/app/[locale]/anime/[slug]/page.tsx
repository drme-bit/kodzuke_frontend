import { connection } from "next/server";
import { Suspense } from "react";
import { ContentSkeleton } from "@/shared/ui/ContentSkeleton";
import {
  AnimePlayback,
  AnimeMedia,
  AnimeSeasons,
  AnimeFacts,
  AnimeRelease,
} from "@/features/anime/server/AnimeSections";
import { translator } from "@/i18n/ui";

import Link from "next/link";
import { getMessages } from "@/i18n";
import { GenreLinks } from "@/features/genre/GenreLinks";
import { getAnimeOverview } from "@/api/server/anime";
import { SaveAnimeButton } from "@/features/library/SaveAnimeButton";
import { AnimeCommunity } from "@/features/anime/components/AnimeCommunity";

import { descriptionForLocale } from "@/i18n/content";
import { AnimeDescription } from "@/features/anime/components/AnimeDescription";
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

export default async function AnimePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  await connection();
  const { locale, slug } = await params;
  const tui = translator(locale);
  const t = getMessages(locale);
  const decodedSlug = decodeURIComponent(slug);
  const anime = await getAnimeOverview(decodedSlug);

  if (!anime) {
    return (
      <div className="mx-auto max-w-[1600px] px-6 py-16">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-lg font-semibold text-white">{tui("notFound")}</p>
          <p className="mt-2 text-sm text-white/50">{tui("notFoundHint")}</p>
          <Link
            href={`/${locale}/browse`}
            className="mt-6 inline-flex rounded-full bg-white px-6 py-2 text-sm font-bold text-black hover:bg-zinc-100"
          >
            ← {t.browse.title}
          </Link>
        </div>
      </div>
    );
  }

  const description = descriptionForLocale(anime, locale);
  const ytId = getYoutubeId(anime.trailerUrl);
  const embedSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0&modestbranding=1`
    : null;

  return (
    <div className="anime-page">
      <div className="theater-container">
        <Suspense fallback={<ContentSkeleton player />}>
          <AnimePlayback anime={anime} locale={locale} />
        </Suspense>
      </div>

      <div id="anime-information" className="immersive-information">
        <main className="anime-content anime-details">
          {/* left — player with episode selector + gallery + trailer embed */}
          <div className="min-w-0">
            <section className="anime-about">
              <Link href={`/${locale}/browse`} className="cinema-back">
                <HiArrowLeft /> {t.browse.title}
              </Link>
              <h2>{tui("aboutPlot")}</h2>
              <GenreLinks genres={anime.genres} locale={locale} />
              <AnimeDescription text={description} />
              {locale === "en" && !description && (
                <p className="text-sm text-white/50">
                  {tui("englishSynopsisMissing")}
                </p>
              )}
              <SaveAnimeButton
                key={anime.id}
                animeId={anime.id}
                locale={locale}
              />
            </section>

            {/* youtube trailer inline */}
            {embedSrc && (
              <div id="trailer" className="mt-8">
                <h3 className="mb-3 text-sm font-bold text-white">
                  {tui("trailer")}
                </h3>
                <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <iframe
                    src={embedSrc}
                    className="h-full w-full"
                    allow="encrypted-media"
                    title="trailer"
                  />
                </div>
              </div>
            )}

            {["AIRING", "RELEASING", "ONGOING"].includes(
              anime.status?.toUpperCase() ?? "",
            ) && (
              <Suspense fallback={null}>
                <AnimeRelease anime={anime} locale={locale} />
              </Suspense>
            )}
            <Suspense fallback={<ContentSkeleton />}>
              <AnimeMedia anime={anime} locale={locale} />
            </Suspense>
            <AnimeCommunity animeId={anime.id} locale={locale} />
          </div>

          {/* right — seasons + meta */}
          <aside className="anime-sidebar sticky top-32 hidden h-[calc(100vh-4rem)] flex-col gap-6 overflow-y-auto pt-16 md:flex">
            <Suspense fallback={<ContentSkeleton />}>
              <AnimeSeasons anime={anime} locale={locale} />
            </Suspense>

            <Suspense fallback={<ContentSkeleton />}>
              <AnimeFacts anime={anime} locale={locale} />
            </Suspense>
          </aside>
        </main>
      </div>
    </div>
  );
}
