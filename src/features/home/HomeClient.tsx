"use client";
import { useState } from "react";
import Link from "next/link";
import type { Anime, LoloanRow } from "@/dto";
import { BrowseBackdrop } from "@/features/browse/components/BrowseBackdrop";
import { BrowseHero } from "@/features/browse/components/BrowseHero";
import { BrowseRows } from "@/features/browse/components/BrowseRows";

export function HomeClient({ rows, locale, total }: { rows: LoloanRow[]; locale: string; total: number }) {
  const [active, setActive] = useState<{ anime: Anime; rowId: string } | null>(null);
  const featured = rows[0]?.animes[0] ?? null;
  const display = active?.anime ?? featured;
  return <main className="home-content mx-auto max-w-[1600px] px-4 pb-10 md:px-6">
    <BrowseBackdrop anime={display} />
    <div className="home-heading"><h1>Откройте свою следующую историю</h1><Link href={`/${locale}/catalog`}>Весь каталог →</Link></div>
    {display ? <BrowseHero display={display} locale={locale} fadeKey={display.id} /> : <div className="home-empty"><p>Подборки пока недоступны.</p><Link href={`/${locale}/catalog`}>Перейти в каталог</Link></div>}
    <div className="home-shelves"><BrowseRows rows={rows} locale={locale} active={active ? { id: active.anime.id, rowId: active.rowId } : null} onHover={(anime, rowId) => setActive({ anime, rowId })} /></div>
    <section className="home-catalog-link"><div><h2>Больше историй — в каталоге</h2><p>{total > 0 ? `${total} тайтлов. Найдите свой по жанру, году или рейтингу.` : "Поиск, фильтры и подборки аниме."}</p></div><Link href={`/${locale}/catalog`}>Открыть каталог →</Link></section>
    <footer className="home-footer"><span>KodZuke</span><Link href={`/${locale}/browse`}>Подборки</Link><Link href={`/${locale}/catalog`}>Каталог</Link></footer>
  </main>;
}
