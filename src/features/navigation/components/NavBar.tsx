"use client";
import { useLocalization } from "@/i18n/client";

import { NavSearch } from "./NavSearch";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HiMagnifyingGlass,
  HiBars3,
  HiUser,
} from "react-icons/hi2";


export function NavBar() {
  const { tui, locale } = useLocalization();
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const pathname = usePathname();
  const isBrowse = pathname?.includes("/browse");
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  const [openMobileSearch, setOpenMobileSearch] = useState(false);

  return (
    <header className="site-header">
      <div className="site-nav">
        {/* LEFT */}
        <div className="flex items-center gap-6">
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <svg className="h-9 w-9 shrink-0 text-white" viewBox="0 0 80 80" fill="none" aria-hidden="true">
              <path d="M16 16v48m0-24 24-24h24L40 40l24 24H40M64 16 16 64" stroke="currentColor" strokeWidth="4" strokeLinejoin="miter" />
            </svg>
            <span className="hidden text-[15px] font-bold tracking-[-0.03em] text-white sm:block">KodZuke</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
                href={`/${locale}`}
                aria-current={isHome ? "page" : undefined}
                className={`rounded-md px-3.5 py-1.5 text-[13.5px] font-medium transition ${
                    isHome ? "bg-white text-black" : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
            >
              {tui("home")}
            </Link>
            <Link
                href={`/${locale}/browse`}
                aria-current={isBrowse ? "page" : undefined}
                className={`rounded-md px-3.5 py-1.5 text-[13.5px] font-medium transition ${
                    isBrowse ? "bg-white text-black" : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
            >
              {tui("browse")}
            </Link>
            <Link
                href={`/${locale}/catalog`}
                aria-current={pathname?.includes("/catalog") ? "page" : undefined}
                className={`rounded-md px-3.5 py-1.5 text-[13.5px] font-medium transition ${pathname?.includes("/catalog") ? "bg-white text-black" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
            >
              {tui("catalog")}
            </Link>
          </nav>
        </div>

        <span className="nav-section-divider" aria-hidden="true" />
        {/* CENTER search desktop */}
        <NavSearch className="nav-desktop-search hidden lg:flex" />

        {/* RIGHT */}
        <div className="nav-account-area flex items-center gap-2">
          <span className="nav-account-placeholder" aria-label={tui("accountPlace")}  title={tui("accountSoon")} ><HiUser /><span>{tui("account")}</span></span>
          <button
            onClick={() => setOpenMobileSearch((v) => !v)}
            className="nav-mobile-search inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white hover:text-black transition lg:hidden"
            aria-label={tui("search")}
          >
            <HiMagnifyingGlass className="h-4 w-4" />
          </button>

          <Link
            href={`/${locale}/browse`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white md:hidden"
            aria-label={tui("menu")}
          >
            <HiBars3 className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {openMobileSearch && (
        <div className="mt-2 rounded-lg border border-white/10 bg-black/90 px-3 py-3 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] lg:hidden">
          <NavSearch onNavigate={() => setOpenMobileSearch(false)} />
        </div>
      )}
    </header>
  );
}
