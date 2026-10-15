"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Anime, LoloanRow } from "@/lib/graphql";
import { AnimeCard } from "@/components/AnimeCard";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

import { fetchLoloan } from "@/shared/api/catalog";
import { useLocalization } from "@/i18n/client";
import { useHorizontalWheel } from "@/shared/hooks/useHorizontalWheel";
type Row = LoloanRow;

function RowScroll({ row, locale, active, onHover }: { row: Row; locale: string; active?: { id: string; rowId: string } | null; onHover: (a: Anime, rowId: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLButtonElement>(null);
  const lock = useRef(false);
  const { tui } = useLocalization();
  const [extra, setExtra] = useState<Anime[]>([]);
  const [nextPage, setNextPage] = useState(row.nextPage);
  const [hasMore, setHasMore] = useState(row.hasMore);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const items = [...row.animes, ...extra];
  useHorizontalWheel(ref);
  const load = useCallback(async () => {
    if (lock.current || !hasMore) return;
    lock.current = true;
    setLoading(true);
    setFailed(false);
    try {
      const result = (await fetchLoloan(row.id, nextPage))[0];
      if (!result) throw new Error("Missing browse shelf");
      setExtra(current => {
        const seen = new Set([...row.animes,...current].map(a => a.id));
        return [...current,...result.animes.filter(a => !seen.has(a.id))];
      });
      setNextPage(result.nextPage);
      setHasMore(result.hasMore);
    } catch { setFailed(true); }
    finally { lock.current = false; setLoading(false); }
  }, [hasMore,nextPage,row.id,row.animes]);
  useEffect(() => {
    const target = sentinel.current;
    if (!target || !hasMore || failed || loading) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) void load();
    }, { rootMargin: "200px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [load,hasMore,failed,loading]);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [items.length]);

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <section className="group/row relative mb-8">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-white">{row.title}</h2>
        <span className="h-px flex-1 bg-white/10" />
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/60">{items.length}{hasMore ? "+" : ""}</span>
      </div>

      <div className="relative">
        {/* blur edges */}
        <div className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#060606] via-[#060606]/70 to-transparent transition-opacity ${canLeft ? "opacity-100" : "opacity-0"}`} />
        <div className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#060606] via-[#060606]/70 to-transparent transition-opacity ${canRight ? "opacity-100" : "opacity-0"}`} />

        {/* arrows */}
        <button
          onClick={() => scroll(-1)}
          aria-label="scroll left"
          className={`absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur ring-1 ring-white/10 transition hover:bg-black/80 md:flex ${canLeft ? "opacity-0 group-hover/row:opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <HiChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="scroll right"
          className={`absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur ring-1 ring-white/10 transition hover:bg-black/80 md:flex ${canRight ? "opacity-0 group-hover/row:opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <HiChevronRight className="h-4 w-4" />
        </button>

        <div ref={ref} className="flex gap-3 overflow-x-auto overflow-y-visible px-1 pt-2 pb-4 no-scrollbar scroll-smooth">
          {items.map((a) => {
            const isActive = active?.id === a.id && active?.rowId === row.id;
            return (
              <Link
                key={`${row.id}-${a.id}`}
                href={`/${locale}/anime/${encodeURIComponent(a.slug)}`}
                onMouseEnter={() => onHover(a, row.id)}
                onFocus={() => onHover(a, row.id)}
                className={`shrink-0 rounded-2xl transition duration-300 will-change-transform ${isActive ? "-translate-y-1 scale-[1.02] shadow-[0_12px_32px_rgba(0,0,0,0.5),0_0_24px_rgba(255,255,255,0.10)]" : "hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)]"}`}
              >
                <AnimeCard anime={a} showTrailer={false} />
              </Link>
            );
          })}
          {hasMore && <button ref={sentinel} type="button" onClick={() => void load()} disabled={loading} aria-live="polite" className="min-w-32 shrink-0 self-center rounded-md border border-white/15 px-4 py-3 text-xs text-white/60 transition hover:border-white/40 hover:text-white disabled:opacity-50">{loading ? tui("loadingTitles") : failed ? tui("retry") : tui("loadMore")}</button>}
        </div>
      </div>
    </section>
  );
}

export function BrowseRows({ rows, locale, active, onHover }: { rows: Row[]; locale: string; active?: { id: string; rowId: string } | null; onHover: (a: Anime, rowId: string) => void }) {
  if (!rows.length) return null;
  return (
    <>
      {rows.map((row) => (
        <RowScroll key={row.id} row={row} locale={locale} active={active} onHover={onHover} />
      ))}
    </>
  );
}
