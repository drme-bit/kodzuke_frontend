import { connection } from "next/server";
import Link from "next/link";
import { Suspense } from "react";
import {
  getBrowseRows,
  getBackgroundTrailers,
} from "@/api/server/catalog";
import { ContentSkeleton } from "@/shared/ui/ContentSkeleton";
import { HomeAnimeShelf } from "@/features/home/HomeAnimeShelf";
import { getMessages, locales } from "@/i18n";
import { LandingBackdrop } from "@/features/home/LandingBackdrop";
import { Footer } from "@/components/Footer";
import {
  HomeExperience,
  HomeDiscover,
  HomeQuestions,
  HomeCallToAction,
} from "@/features/home/HomeStory";
import { CiPlay1 } from "react-icons/ci";
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default async function Landing({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await connection();
  const { locale } = await params;
  const t = getMessages(locale);
  return (
    <div
      id="top"
      className="landing-page min-h-screen bg-[#060606] text-white selection:bg-white selection:text-black overflow-x-clip"
    >
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <LandingTrailers />
          </Suspense>
          <div className="absolute inset-0 opacity-[0.04]" style={{}} />
        </div>
        <div className="relative mx-auto w-full max-w-[1600px] px-6 pt-12 md:pt-6">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black leading-[0.88] tracking-[-0.05em] md:text-7xl">
              {t.landing.heroTitle1}{" "}
              <span className="bg-white px-2 text-black">
                {t.landing.heroTitle2}
              </span>
            </h1>
            <p className="mt-4 max-w-xl border-l-2 border-white pl-4 text-[15px] leading-7 text-zinc-300">
              {t.landing.heroDesc}
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href={`/${locale}/browse`}
                className="rounded-sm bg-white px-8 py-3 text-sm font-black tracking-wide text-black hover:bg-zinc-200 transition"
              >
                {t.landing.watch}
              </Link>
              <Link
                href={`/${locale}/catalog`}
                className="rounded-sm border border-white bg-transparent px-8 py-3 text-sm font-bold tracking-wide text-white hover:bg-white hover:text-black transition"
              >
                {t.landing.catalog}
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-3 text-[11px] tracking-widest text-white/50">
              <span className="h-px w-8 bg-white/20" />
              PRESS PLAY. GET LOST.
            </div>
          </div>
        </div>
      </section>
      <Suspense fallback={<ContentSkeleton />}>
        <LandingShelves locale={locale} />
      </Suspense>
      <HomeDiscover locale={locale} />
      <HomeQuestions locale={locale} />
      <HomeCallToAction locale={locale} />
      <Footer locale={locale} />
    </div>
  );
}

async function LandingTrailers() {
  const trailers = await getBackgroundTrailers().catch(() => []);
  return <LandingBackdrop animes={trailers} />;
}

async function LandingShelves({ locale }: { locale: string }) {
  const shelf = await getBrowseRows("trending")
    .then((rows) => rows[0])
    .catch(() => null);
  const animes = shelf?.animes ?? [];
  return (
    <>
      <HomeExperience
        locale={locale}
        anime={animes.find((anime) => anime.bannerUrl) ?? animes[0]}
      />
      {shelf && (
        <HomeAnimeShelf
          locale={locale}
          row={{ ...shelf, title: getMessages(locale).browse.trending }}
        />
      )}
    </>
  );
}
