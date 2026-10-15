export const dynamic = "force-dynamic";
import Link from "next/link";
import { fetchLoloan, gql, type Anime } from "@/lib/graphql";
import { HomeAnimeShelf } from "@/features/home/HomeAnimeShelf";
import { getMessages, locales } from "@/i18n";
import { LandingBackdrop } from "@/features/home/LandingBackdrop";
import { Footer } from "@/components/Footer";
import { HomeExperience, HomeDiscover, HomeQuestions, HomeCallToAction } from "@/features/home/HomeStory";
export function generateStaticParams() { return locales.map(locale => ({ locale })); }
export default async function Landing({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getMessages(locale);
  const shelf = await fetchLoloan("trending").then(rows => rows[0]).catch(() => null);
  const animes = shelf?.animes ?? [];
  const trailers = await gql<{ backgroundTrailers: Anime[] }>(`query { backgroundTrailers { id title trailerUrl } }`, undefined, { timeoutMs: 15000, fresh: true }).then(data => data.backgroundTrailers).catch(() => []);
  return <div id="top" className="landing-page min-h-screen bg-[#060606] text-white selection:bg-white selection:text-black overflow-x-clip">
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      <div className="absolute inset-0">
        <LandingBackdrop animes={trailers.length ? trailers : animes} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 40px)" }} />
      </div>
      <div className="relative mx-auto w-full max-w-[1600px] px-6 pt-12 md:pt-6"><div className="max-w-2xl">
        <h1 className="text-5xl font-black leading-[0.88] tracking-[-0.05em] md:text-7xl">{t.landing.heroTitle1} <span className="bg-white px-2 text-black">{t.landing.heroTitle2}</span></h1>
        <p className="mt-4 max-w-xl border-l-2 border-white pl-4 text-[15px] leading-7 text-zinc-300">{t.landing.heroDesc}</p>
        <div className="mt-8 flex gap-3">
          <Link href={`/${locale}/browse`} className="rounded-2xl bg-white px-8 py-3 text-sm font-black tracking-wide text-black hover:bg-zinc-200 transition">{t.landing.watch}</Link>
          <Link href={`/${locale}/catalog`} className="rounded-2xl border border-white bg-transparent px-8 py-3 text-sm font-bold tracking-wide text-white hover:bg-white hover:text-black transition">{t.landing.catalog}</Link></div>
        <div className="mt-6 flex items-center gap-3 text-[11px] tracking-widest text-white/50"><span className="h-px w-8 bg-white/20" />PRESS PLAY. GET LOST.</div>
      </div></div>
    </section>
    <HomeExperience locale={locale} anime={animes.find(a => a.bannerUrl) ?? animes[0]} />
    {shelf && <HomeAnimeShelf locale={locale} row={{ ...shelf, title: t.browse.trending }} />}
    <HomeDiscover locale={locale} />
    <HomeQuestions locale={locale} />
    <HomeCallToAction locale={locale} />
    <Footer locale={locale} />
  </div>;
}
