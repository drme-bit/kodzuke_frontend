"use client";
import { useLocalization } from "@/i18n/client";
import Link from "next/link";
import { titleForLocale } from "@/i18n/ui";
import { animeTypeLabel, animeStatusLabel, releaseSeasonLabel } from "@/features/anime/presentation";
import type { Anime } from "@/lib/graphql";
import { HiStar, HiPlay } from "react-icons/hi2";

type Props = {
  display: Anime | null;
  locale: string;
  fadeKey: string;
};

export function BrowseHero({ display, locale, fadeKey }: Props) {
  const { tui } = useLocalization();
  if (!display) return null;
  const metaLine = [animeTypeLabel(display.type,locale), display.year ? String(display.year) : null, releaseSeasonLabel(display.season,locale), animeStatusLabel(display.status,locale)].filter(Boolean).join(" • ");
  const extraLine = [display.episodesCount ? `${display.episodesCount} ${tui("episodes")}` : null, display.duration ? `${display.duration} ${tui("minutes")}` : null].filter(Boolean).join(" • ");

  return (
    <section className="browse-hero pt-6">
      <div key={fadeKey + "-content"} className="relative mx-auto flex min-h-[400px] max-w-[1600px] flex-col justify-end px-4 py-7 md:min-h-[440px] md:flex-row md:items-end md:justify-between md:gap-8 md:px-6 md:py-9 lg:min-h-[460px]" style={{ animation: "heroFade 520ms ease-out" }}>
        {/* left */}
        <div className="flex min-w-0 max-w-[640px] flex-1 flex-col justify-end">
          {metaLine && (
            <div className="inline-flex w-fit flex-wrap items-center gap-2 text-[11px] font-medium tracking-widest text-white/70">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 backdrop-blur-md ring-1 ring-white/10">
                
                {metaLine}
              </span>
              {extraLine && <span className="rounded-md bg-black/40 px-2.5 py-1 text-white/60 backdrop-blur-md ring-1 ring-white/10">{extraLine}</span>}
            </div>
          )}
          <h2 className="mt-3 text-[30px] font-bold leading-[0.95] tracking-[-0.03em] text-white md:text-[42px] lg:text-[46px]">{titleForLocale(display,locale)}</h2>
          {display.titleEn && display.titleEn !== titleForLocale(display,locale) && <p className="mt-1.5 line-clamp-1 text-sm font-medium text-white/50">{display.titleEn}</p>}
          {display.description && <p className="mt-3 line-clamp-3 max-w-[560px] text-[14px] leading-6 text-white/70">{display.description}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2">

            {display.seasonNumber && <span className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md ring-1 ring-white/10">{display.seasonNumber} • {display.episodesCount ? `${display.episodesCount} ${tui("episodes")}` : animeTypeLabel(display.type,locale)}{display.duration ? ` • ${display.duration} ${tui("minutes")}` : ""}</span>}

          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href={`/${locale}/anime/${encodeURIComponent(display.slug)}`} className="inline-flex items-center gap-2 rounded-md bg-white px-7 py-3 text-sm font-bold text-black hover:bg-zinc-100 transition shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <HiPlay className="h-4 w-4" /> {tui("watch")}
            </Link>
            <Link href={`/${locale}/anime/${encodeURIComponent(display.slug)}`} className="inline-flex items-center gap-2 rounded-md bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/15 hover:bg-white/20 transition">
              {tui("details")}
            </Link>
          </div>
        </div>

        {/* right — poster only */}
        <div className="hidden w-[380px] shrink-0 flex-col items-end justify-end md:flex lg:w-[400px]">
          {display.posterUrl && (
            <div className="relative overflow-hidden rounded-lg ring-1 ring-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={display.posterUrl} src={display.posterUrl} alt="" className="h-[340px] w-full object-cover lg:h-[380px]" style={{ animation: "heroFade 520ms ease-out" }} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              {display.score != null && (
                  <div className="absolute bottom-1.5 right-1.5 mt-3 flex items-center gap-2 self-end rounded-md px-3 py-1.5 backdrop-blur-md ring-1 ring-white/10">
                    <HiStar className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-bold text-white">{display.score.toLocaleString(locale,{minimumFractionDigits:1,maximumFractionDigits:1})}</span>
                    <span className="text-xs text-white/50">• {animeTypeLabel(display.type,locale)} • {display.year ?? "—"}</span>
                  </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes heroFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </section>
  );
}
