import Link from "next/link";
import { homeContent } from "@/i18n/messages/home";
import { translator } from "@/i18n/ui";
import { HiArrowUp } from "react-icons/hi2";

export function Footer({ locale }: { locale: string }) {
  const t = homeContent(locale);
  const tui = translator(locale);
  return <footer className="landing-footer">
    <div className="landing-footer-main">
      <div className="landing-footer-identity"><Link href={`/${locale}`} className="landing-footer-brand"><svg viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 16v48m0-24 24-24h24L40 40l24 24H40M64 16 16 64" stroke="currentColor" strokeWidth="4" /></svg>KodZuke</Link><p>{t.footerText}</p></div>
      <nav aria-label={t.discoverLabel}>
        <h2>{t.discoverLabel}</h2>
        <Link href={`/${locale}/browse`}>{tui("browse")}</Link>
        <Link href={`/${locale}/catalog`}>{tui("catalog")}</Link>
        <Link href={`/${locale}/catalog?status=AIRING`}>{t.shelves[1][0]}</Link>
        <Link href={`/${locale}/catalog?status=ANNOUNCED`}>{t.shelves[2][0]}</Link>
      </nav>
      <nav aria-label={t.projectLabel}>
        <h2>{t.projectLabel}</h2>
        <Link href={`/${locale}#experience`}>{t.experienceLink}</Link>
        <Link href={`/${locale}#questions`}>{t.faqLink}</Link>
      </nav>
    </div>
    <div className="landing-footer-bottom"><span>© {new Date().getFullYear()} KodZuke</span><span>{t.note}</span><span>One more episode.</span></div>
  </footer>;
}
