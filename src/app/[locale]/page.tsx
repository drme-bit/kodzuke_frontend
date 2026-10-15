import { translator } from "@/i18n/ui";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { fetchCatalogPage, gql, type Anime } from "@/lib/graphql";
import { AnimeCard } from "@/components/AnimeCard";
import { getMessages, locales } from "@/i18n";
import { LandingBackdrop } from "@/features/home/LandingBackdrop";
import { Footer } from "@/components/Footer";
import { HiPlay } from "react-icons/hi2";
export function generateStaticParams() { return locales.map(locale => ({ locale })); }
export default async function Landing({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tui = translator(locale);
  const t = getMessages(locale);
  const page = await fetchCatalogPage({ sort: "score", status: "FINISHED" }).catch(() => null);
  const animes = page?.items ?? [];
  const trailers = await gql<{ backgroundTrailers: Anime[] }>(`query { backgroundTrailers { id title trailerUrl } }`, undefined, { timeoutMs: 15000, fresh: true }).then(data => data.backgroundTrailers).catch(() => []);
  return <div className="landing-page min-h-screen bg-[#060606] text-white selection:bg-white selection:text-black overflow-x-clip">
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      <div className="absolute inset-0">
        <LandingBackdrop animes={trailers.length ? trailers : animes} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 40px)" }} />
      </div>
      <div className="relative mx-auto w-full max-w-[1600px] px-6 pt-12 md:pt-6"><div className="max-w-2xl">
        <h1 className="text-5xl font-black leading-[0.88] tracking-[-0.05em] md:text-7xl">{t.landing.heroTitle1} <span className="bg-white px-2 text-black">{t.landing.heroTitle2}</span></h1>
        <p className="mt-4 max-w-xl border-l-2 border-white pl-4 text-[15px] leading-7 text-zinc-300">{t.landing.heroDesc}</p>
        <div className="mt-8 flex gap-3"><Link href={`/${locale}/browse`} className="rounded-full bg-white px-8 py-3 text-sm font-black tracking-wide text-black hover:bg-zinc-200 transition">{t.landing.watch}</Link><Link href={`/${locale}/catalog`} className="rounded-full border border-white bg-transparent px-8 py-3 text-sm font-bold tracking-wide text-white hover:bg-white hover:text-black transition">{t.landing.catalog}</Link></div>
        <div className="mt-6 flex items-center gap-3 text-[11px] tracking-widest text-white/50"><span className="h-px w-8 bg-white/20" />EST. 2026 — BLACK & WHITE</div>
      </div></div>
    </section>
    <section className="mx-auto max-w-[1600px] px-6 pb-10">
      <div className="mb-4 flex items-end justify-between border-b border-white/10 pb-3"><h2 className="text-xl font-black tracking-tighter">{t.landing.trending}</h2><Link href={`/${locale}/browse`} className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-widest">{t.landing.browseLink}</Link></div>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">{animes.slice(0,12).map(anime => <Link key={anime.id} href={`/${locale}/anime/${encodeURIComponent(anime.slug)}`} className="shrink-0"><AnimeCard anime={anime} /></Link>)}</div>
    </section>
    <section className="mx-auto max-w-[1600px] px-6 pb-10"><div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white p-8 md:p-10"><div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"><div><h3 className="text-xl font-black tracking-tight text-black">{tui("ready")}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">{tui("landingCta")}</p></div><Link href={`/${locale}/catalog`} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-black px-7 py-3 text-sm font-bold text-white"><HiPlay className="h-4 w-4" /> {tui("openCatalog")}</Link></div></div></section>
    <Footer locale={locale} />
  </div>;
}
