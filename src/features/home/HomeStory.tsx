import Link from "next/link";
import Image from "next/image";
import type { Anime } from "@/dto";
import { homeContent } from "@/i18n/messages/home";
import { HiArrowUpRight, HiPlay, HiPlus } from "react-icons/hi2";

export function HomeExperience({ locale, anime }: { locale: string; anime?: Anime }) {
  const t = homeContent(locale);
  const title = locale === "en" ? anime?.titleEn || anime?.title : anime?.title;
  return <section id="experience" className="landing-section landing-experience">
    <div className="landing-section-heading"><h2>{t.experience}</h2><p>{t.intro}</p></div>
    <div className="landing-experience-grid">
      <div className="landing-viewing-preview">
        {anime && <Link href={`/${locale}/anime/${encodeURIComponent(anime.slug)}`} className="landing-preview-image" aria-label={`${t.open}: ${title}`}>
          {(anime.bannerUrl || anime.posterUrl) && <Image src={anime.bannerUrl || anime.posterUrl!} alt={title || ""} fill unoptimized sizes="(max-width: 760px) 100vw, 60vw" />}
          <span className="landing-preview-play"><HiPlay /></span><span className="landing-preview-caption"><span>{t.open}</span><strong>{title}</strong></span>
        </Link>}
        <div className="landing-preview-caption-bottom"><HiPlay /><span>{t.episode}</span><span aria-hidden="true">KodZuke</span></div>
      </div>
      <div className="landing-experience-copy"><h3>{t.watchTitle}</h3><p>{t.watchText}</p><Link href={`/${locale}/browse`}>{t.browse}<HiArrowUpRight /></Link></div>
    </div>
    <div className="landing-feature-list">{t.features.map(([title, text]) => <div key={title}><h3>{title}</h3><p>{text}</p></div>)}</div>
  </section>;
}

export function HomeDiscover({ locale }: { locale: string }) {
  const t = homeContent(locale);
  return <section className="landing-section landing-discover"><div className="landing-section-heading"><h2>{t.discover}</h2><p>{t.discoverText}</p></div>
    <div className="landing-discover-links">{t.shelves.map(([title, text, query]) => <Link href={`/${locale}/catalog?${query}`} key={query}><div><h3>{title}</h3><p>{text}</p></div><HiArrowUpRight /></Link>)}</div>
  </section>;
}

export function HomeQuestions({ locale }: { locale: string }) {
  const t = homeContent(locale);
  return <section id="questions" className="landing-section landing-questions"><h2>{t.questions}</h2><div>{t.faq.map(([question,answer]) => <details key={question}><summary>{question}<HiPlus /></summary><p>{answer}</p></details>)}</div></section>;
}

export function HomeCallToAction({ locale }: { locale: string }) {
  const t = homeContent(locale);
  return <section className="landing-section landing-final-cta"><div><h2>{t.cta}</h2><p>{t.ctaText}</p></div><Link href={`/${locale}/browse`} className="landing-primary-action"><HiPlay />{t.browse}</Link></section>;
}
