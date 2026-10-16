import Link from "next/link";
import { HiCheck, HiChevronRight } from "react-icons/hi2";
import { translator } from "@/i18n/ui";
import { titleForLocale } from "@/i18n/content";
import { animeTypeLabel } from "@/i18n/anime";
import type { Anime } from "@/dto";
import styles from "./SeasonList.module.css";

export function SeasonList({ seasons, currentId, locale }: { seasons: Anime[]; currentId: string; locale: string }) {
  const t = translator(locale);
  return <section className={styles.section} aria-labelledby="title-seasons-heading">
    <header className={styles.heading}><h3 id="title-seasons-heading">{t("allSeasons")}</h3><span>{t("seasonCount",{n:seasons.length})}</span></header>
    <nav className={styles.list} aria-label={t("seasons")}>
      {seasons.map(season => {
        const selected = season.id === currentId;
        return <Link key={season.id} href={`/${locale}/anime/${encodeURIComponent(season.slug)}`} className={styles.row} aria-current={selected ? "page" : undefined}>
          <span className={styles.poster}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {season.posterUrl && <img src={season.posterUrl} alt="" loading="lazy" decoding="async" />}
          </span>
          <span className={styles.content}>
            <span className={styles.meta}>{[season.seasonNumber ? t("seasonNumber",{n:season.seasonNumber}) : animeTypeLabel(season.type,locale),season.year].filter(Boolean).join(" · ")}</span>
            <span className={styles.title}>{titleForLocale(season,locale)}</span>
            <span className={styles.detail}>{selected ? t("current") : season.episodesCount ? `${t("episodes")}: ${season.episodesCount}` : animeTypeLabel(season.type,locale)}</span>
          </span>
          <span className={styles.indicator} aria-hidden="true">{selected ? <HiCheck /> : <HiChevronRight />}</span>
        </Link>;
      })}
    </nav>
  </section>;
}
