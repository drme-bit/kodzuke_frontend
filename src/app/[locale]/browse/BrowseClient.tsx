"use client";
import { useLocalization } from "@/i18n/client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import type { Anime, LoloanRow } from "@/dto";
import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import { BrowseBackdrop } from "@/features/browse/components/BrowseBackdrop";
import { BrowseHero } from "@/features/browse/components/BrowseHero";
import { BrowseRows } from "@/features/browse/components/BrowseRows";

type Row = LoloanRow;

export function BrowseClient({ rows }: { rows: Row[] }) {
  const { tui } = useLocalization();
  const params = useParams() as { locale: string };
  const locale = params?.locale ?? "ru";
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  const filteredRows = useMemo(() => {
    if (!q) return rows;
    return rows
      .map((r) => ({
        ...r,
        animes: r.animes.filter(
          (a) => a.title.toLowerCase().includes(q) || (a.titleEn ?? "").toLowerCase().includes(q) || (a.description ?? "").toLowerCase().includes(q)
        ),
      }))
      .filter((r) => r.animes.length > 0);
  }, [rows, q]);

  const flatFiltered = useMemo(() => filteredRows.flatMap((r) => r.animes), [filteredRows]);
  const featured = filteredRows[0]?.animes[0] ?? rows[0]?.animes[0] ?? null;
  const [active, setActive] = useState<{ anime: Anime; rowId: string } | null>(null);
  const display = active?.anime ?? featured;

  const totalFiltered = flatFiltered.length;

  return (
    <div className="browse-content relative">
      <BrowseBackdrop anime={display} />
      {q && (
        <div className="mt-4 mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
            <HiMagnifyingGlass className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-[11px] font-semibold tracking-widest text-white/50">{tui("search")}</p>
            <p className="text-sm font-medium text-white">
              &ldquo;{searchParams.get("q")}&rdquo; — {tui("results",{n:totalFiltered})}
            </p>
          </div>
          <Link href={`/${locale}/browse`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-white/90 transition">
            <HiXMark className="h-3.5 w-3.5" /> {tui("clearSearch")}
          </Link>
        </div>
      )}

      <BrowseHero display={display} locale={locale} fadeKey={display?.id ?? "init"} />

      <div className="relative pt-6">
        {q && filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
            <HiMagnifyingGlass className="h-8 w-8 text-white/30" />
            <p className="mt-3 text-sm font-medium text-white">{tui("nothingFound")}: &ldquo;{searchParams.get("q")}&rdquo;</p>
            <p className="mt-1 text-xs text-white/50">Try other keywords.</p>
            <Link href={`/${locale}/browse`} className="mt-4 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black">
              Clear
            </Link>
          </div>
        ) : (
          <BrowseRows
            rows={filteredRows}
            locale={locale}
            active={active ? { id: active.anime.id, rowId: active.rowId } : null}
            onHover={(a, rowId) => setActive({ anime: a, rowId })}
          />
        )}
        {!q && filteredRows.length > 0 && (
          <div className="mt-2 flex items-center justify-center gap-2 pt-4">
            <span className="h-px w-10 bg-white/10" />
            <span className="text-[11px] tracking-wide text-white/30">{tui("titles",{n:filteredRows.reduce((n,r)=>n+r.animes.length,0)})}</span>
            <span className="h-px w-10 bg-white/10" />
          </div>
        )}
      </div>
    </div>
  );
}
