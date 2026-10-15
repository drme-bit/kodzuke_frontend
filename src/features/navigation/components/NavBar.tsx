"use client";
import { useLocalization } from "@/i18n/client";
import { NavSearch } from "./NavSearch";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HiMagnifyingGlass, HiBars3, HiUser, HiXMark } from "react-icons/hi2";

export function NavBar() {
  const { tui, locale } = useLocalization();
  const pathname = usePathname();
  const [panel, setPanel] = useState<"search" | "menu" | null>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    update();
    window.addEventListener("scroll",update,{ passive:true });
    return () => window.removeEventListener("scroll",update);
  }, []);
  const links = [
    { href: `/${locale}`, label: tui("home"), active: pathname === `/${locale}` || pathname === `/${locale}/` },
    { href: `/${locale}/browse`, label: tui("browse"), active: pathname?.includes("/browse") },
    { href: `/${locale}/catalog`, label: tui("catalog"), active: pathname?.includes("/catalog") },
  ];
  return <header className={`site-header${scrolled ? " is-scrolled" : ""}`} onKeyDown={event => { if(event.key === "Escape") setPanel(null); }}>
    <div className="site-nav">
      <div className="nav-start">
        <Link href={`/${locale}`} className="nav-brand" aria-label="KodZuke" onClick={() => setPanel(null)}>
          <svg viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 16v48m0-24 24-24h24L40 40l24 24H40M64 16 16 64" stroke="currentColor" strokeWidth="4" strokeLinejoin="miter" /></svg>
        </Link>
        <nav className="nav-links" aria-label={tui("footerNavigation")}>{links.map(link => <Link key={link.href} href={link.href} aria-current={link.active ? "page" : undefined} onClick={() => setPanel(null)}>{link.label}</Link>)}</nav>
      </div>
      <NavSearch className="nav-desktop-search" />
      <div className="nav-account-area">
        <span className="nav-account-placeholder" aria-label={tui("accountPlace")} title={tui("accountSoon")}><span className="nav-avatar"><HiUser /></span><span>{tui("account")}</span></span>
        <button type="button" className="nav-icon-button nav-mobile-search" aria-label={tui("search")} aria-expanded={panel === "search"} aria-controls="nav-search-panel" onClick={() => setPanel(panel === "search" ? null : "search")}>{panel === "search" ? <HiXMark /> : <HiMagnifyingGlass />}</button>
        <button type="button" className="nav-icon-button nav-menu-toggle" aria-label={tui("menu")} aria-expanded={panel === "menu"} aria-controls="nav-menu-panel" onClick={() => setPanel(panel === "menu" ? null : "menu")}>{panel === "menu" ? <HiXMark /> : <HiBars3 />}</button>
      </div>
    </div>
    {panel === "search" && <div id="nav-search-panel" className="nav-search-panel"><NavSearch onNavigate={() => setPanel(null)} /></div>}
    {panel === "menu" && <nav id="nav-menu-panel" className="nav-menu-panel" aria-label={tui("menu")}>{links.map(link => <Link key={link.href} href={link.href} aria-current={link.active ? "page" : undefined} onClick={() => setPanel(null)}>{link.label}</Link>)}</nav>}
  </header>;
}
