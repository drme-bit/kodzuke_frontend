import { translator } from "@/i18n/ui";
import Link from "next/link";
export function Footer({ locale }: { locale: string }) {
  const tui = translator(locale);
  return <footer className="landing-footer">
    <div className="landing-footer-main"><div><Link href={`/${locale}`} className="landing-footer-brand">KodZuke</Link><p>{tui("nextStory")}</p></div><nav aria-label={tui("footerNavigation")} ><Link href={`/${locale}/browse`}>{tui("browse")}</Link><Link href={`/${locale}/catalog`}>{tui("catalog")}</Link><Link href={`/${locale}`}>{tui("home")}</Link></nav></div>
    <div className="landing-footer-bottom"><span>© {new Date().getFullYear()} KodZuke</span><span>{tui("withoutLimits")}</span></div>
  </footer>;
}
