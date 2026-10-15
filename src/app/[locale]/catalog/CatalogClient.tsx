"use client";
import { useLocalization } from "@/i18n/client";
import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { animeTypeLabel, animeStatusLabel, releaseSeasonLabel } from "@/features/anime/presentation";
import type { CatalogPage } from "@/lib/graphql";
import { AnimeCard } from "@/components/AnimeCard";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useCatalogPage } from "@/features/browse/useCatalogPage";
import { BrowseBackdrop } from "@/features/browse/components/BrowseBackdrop";
import { BrowseHero } from "@/features/browse/components/BrowseHero";

type Props = { initialPage: CatalogPage | null };

export function CatalogClient({ initialPage }: Props) {
  const { tui } = useLocalization();
  const params = useParams() as { locale: string };
  const locale = params?.locale ?? "ru";

  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [season, setSeason] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [sort, setSort] = useState<"score" | "year" | "title">("score");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filters = useMemo(() => ({
    ...(q.trim() && { search: q.trim() }), ...(type !== "all" && { type }),
    ...(status !== "all" && { status }), ...(season !== "all" && { season }),
    ...(year !== "all" && { year: Number(year) }), sort,
  }), [q, type, status, season, year, sort]);
  const { page, loading, error, loadMore, retry } = useCatalogPage(initialPage, filters);
  const filtered = useMemo(() => page?.items ?? [], [page]);
  const types = page?.types ?? initialPage?.types ?? [];
  const statuses = page?.statuses ?? initialPage?.statuses ?? [];
  const seasons = page?.seasons ?? initialPage?.seasons ?? [];
  const years = page?.years ?? initialPage?.years ?? [];

  const preview = useMemo(() => {
    if (selectedId) return filtered.find((a) => a.id === selectedId) ?? filtered[0] ?? null;
    return filtered[0] ?? null;
  }, [filtered, selectedId]);

  const hasActiveFilters = type !== "all" || status !== "all" || season !== "all" || year !== "all" || q;

  const clear = () => {
    setQ("");
    setType("all");
    setStatus("all");
    setSeason("all");
    setYear("all");
    setSort("score");
  };

  const sentinel = useRef<HTMLDivElement>(null);
  const hasMore = page?.hasMore ?? false;
  const loadMoreRef = useRef(loadMore);
  useEffect(() => { loadMoreRef.current = loadMore; }, [loadMore]);
  useEffect(() => {
    const target = sentinel.current;
    if (!target || !hasMore || loading || error) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) void loadMoreRef.current();
    }, { rootMargin: "240px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, error, filtered.length]);

  return <main className="catalog-content mx-auto max-w-[1600px] px-4 pb-12 md:px-6">
    <BrowseBackdrop anime={preview} />
    <div className="catalog-heading"><h1>{tui("catalog")}</h1><span>{tui("titles",{n:page?.total ?? initialPage?.total ?? 0})}</span></div>
    <BrowseHero display={preview} locale={locale} fadeKey={preview?.id ?? "catalog"} />
    <div className="catalog-filters">
      <label className="catalog-search"><HiMagnifyingGlass /><input aria-label={tui("searchCatalog")}  value={q} onChange={event => setQ(event.target.value)} placeholder={tui("searchPlaceholder")}  /></label>
      {[
        { label: tui("type"), value: type, setter: setType, opts: types },
        { label: tui("status"), value: status, setter: setStatus, opts: statuses },
        { label: tui("season"), value: season, setter: setSeason, opts: seasons },
        { label: tui("year"), value: year, setter: setYear, opts: years.map(String) },
      ].map(filter => <label key={filter.label}><span>{filter.label}</span><select aria-label={filter.label} value={filter.value} onChange={event => filter.setter(event.target.value)}><option value="all">{tui("all")}</option>{filter.opts.map(value => <option key={value} value={value}>{types.includes(value) ? animeTypeLabel(value,locale) : statuses.includes(value) ? animeStatusLabel(value,locale) : seasons.includes(value) ? releaseSeasonLabel(value,locale) : value}</option>)}</select></label>)}
      <label><span>{tui("sort")}</span><select aria-label={tui("sort")}  value={sort} onChange={event => setSort(event.target.value as typeof sort)}><option value="score">{tui("sortScore")}</option><option value="year">{tui("sortYear")}</option><option value="title">{tui("sortTitle")}</option></select></label>
      {hasActiveFilters && <button className="catalog-reset" onClick={clear}>{tui("reset")}</button>}
    </div>
    <div className="catalog-results-heading"><h2>{tui("anime")}</h2><span role="status">{tui("titles",{n:page?.total ?? 0})}</span></div>
    {filtered.length ? <div className="catalog-grid">{filtered.map(anime => <Link key={anime.id} href={`/${locale}/anime/${encodeURIComponent(anime.slug)}`} onMouseEnter={() => setSelectedId(anime.id)} onFocus={() => setSelectedId(anime.id)}><AnimeCard anime={anime} showTrailer={false} className="w-full" /></Link>)}</div> : !loading && !error && <div className="catalog-empty"><p>{tui("nothingFound")}</p><button onClick={clear}>{tui("resetFilters")}</button></div>}
    <div ref={sentinel} className="catalog-load-more" role="status">{loading ? <span>{tui("loadingTitles")}</span> : error ? <div><p>{tui("catalogFailed")}</p><button onClick={retry}>{tui("retry")}</button></div> : hasMore ? <button onClick={loadMore}>{tui("loadMore")}</button> : filtered.length > 0 && <span>{tui("allLoaded",{n:page?.total ?? 0})}</span>}</div>
  </main>;
}
