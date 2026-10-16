"use client";

import { useLocalization } from "@/i18n/client";
import { titleForLocale } from "@/i18n/content";
import {
  animeTypeLabel,
  animeStatusLabel,
  releaseSeasonLabel,
} from "@/i18n/anime";
import type { Anime } from "@/dto";
import { GenreLinks } from "@/features/genre/GenreLinks";
import { descriptionForLocale } from "@/i18n/content";
import { HeroGallery } from "./HeroGallery";

interface BrowseHeroProps {
  display: Anime | null;
  locale: string;
  fadeKey: string;
}

export function BrowseHero({ display, locale, fadeKey }: BrowseHeroProps) {
  const { tui } = useLocalization();
  if (!display) return null;

  const description = descriptionForLocale(display, locale);
  const title = titleForLocale(display, locale);
  const metadata = [
    animeTypeLabel(display.type, locale),
    display.year ? String(display.year) : null,
    releaseSeasonLabel(display.season, locale),
  ].filter(Boolean);
  const status = animeStatusLabel(display.status, locale);
  const facts = [
    display.episodesCount
      ? `${display.episodesCount} ${tui("episodes")}`
      : null,
    display.duration ? `${display.duration} ${tui("minutes")}` : null,
  ].filter(Boolean);

  return (
    <section className="browse-hero" aria-label={title}>
      <div key={fadeKey} className="browse-hero-layout">
        <div className="browse-hero-copy">
          <div className="browse-hero-meta">
            {metadata.map((item, index) => (
              <span key={`${index}-${item}`}>{item}</span>
            ))}
            {status && <span className="browse-hero-status">{status}</span>}
          </div>

          <h2 className="browse-hero-title" title={title}>
            {title}
          </h2>

          {display.titleEn && display.titleEn !== title && (
            <p className="browse-hero-original">{display.titleEn}</p>
          )}

          <GenreLinks genres={display.genres} locale={locale} limit={3} />

          {description && (
            <p className="browse-hero-description">
              {description.replace(/<[^>]*>/g, "")}
            </p>
          )}
          {facts.length > 0 && (
            <div className="browse-hero-facts">
              {facts.map((fact) => (
                <span key={fact}>{fact}</span>
              ))}
            </div>
          )}
        </div>
        <HeroGallery key={display.id} anime={display} locale={locale} />
      </div>
    </section>
  );
}
