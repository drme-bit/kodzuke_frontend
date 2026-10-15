"use client";
import styles from "./NavSearch.module.css";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import { useLocalization } from "@/i18n/client";
import { titleForLocale } from "@/i18n/ui";
import { searchTitles, type Anime } from "@/lib/graphql";

export function NavSearch({ onNavigate, className = "" }: { onNavigate?: () => void; className?: string }) {
  const { tui, locale } = useLocalization();
  const router = useRouter();
  const params = useSearchParams();
  const urlQuery = params.get("q") ?? "";
  const [draft, setDraft] = useState({ urlQuery, value: urlQuery });
  const query = draft.urlQuery === urlQuery ? draft.value : urlQuery;
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<{ query: string; items: Anime[]; total: number; error?: boolean } | null>(null);
  const root = useRef<HTMLFormElement>(null);
  const id = useId();
  const trimmed = query.trim();
  useEffect(() => {
    if (trimmed.length < 2 || !open) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchTitles(trimmed, controller.signal).then(value => setResult({ query: trimmed, ...value })).catch(() => {
        if (!controller.signal.aborted) setResult({ query: trimmed, items: [], total: 0, error: true });
      });
    }, 280);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [trimmed, open]);
  function close() { setOpen(false); onNavigate?.(); }
  function navigate(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    router.push(href);
    close();
  }
  const matching = result?.query === trimmed ? result : null;
  return <form ref={root} className={`${styles.root} ${className}`} onSubmit={event => {
    event.preventDefault(); close(); router.push(`/${locale}/catalog${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`);
  }} onBlur={event => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    // Safari may leave relatedTarget null when clicking a link. Let its click finish.
    setTimeout(() => { if (!root.current?.contains(document.activeElement)) setOpen(false); }, 150);
  }} onKeyDown={event => {
    if (event.key === "Escape") setOpen(false);
    if (event.key === "ArrowDown") {
      const links = Array.from(root.current?.querySelectorAll<HTMLAnchorElement>(`section a`) ?? []);
      const index = links.indexOf(document.activeElement as HTMLAnchorElement);
      if (links.length) { event.preventDefault(); links[Math.min(index + 1, links.length - 1)].focus(); }
    }
    if (event.key === "ArrowUp") {
      const links = Array.from(root.current?.querySelectorAll<HTMLAnchorElement>(`section a`) ?? []);
      const index = links.indexOf(document.activeElement as HTMLAnchorElement);
      if (index >= 0) { event.preventDefault(); if (index) links[index - 1].focus(); else root.current?.querySelector("input")?.focus(); }
    }
  }}>
    <div className={styles.field}>
      <HiMagnifyingGlass />
      <input type="search" value={query} aria-label={tui("searchTitles")} aria-controls={id} placeholder={tui("searchTitles")} autoComplete="off" onFocus={() => setOpen(true)} onChange={event => { setDraft({ urlQuery, value: event.target.value }); setOpen(true); }} />
      {query && <button type="button" aria-label={tui("clearSearch")} onClick={() => { setDraft({ urlQuery, value: "" }); setOpen(false); root.current?.querySelector("input")?.focus(); }}><HiXMark /></button>}
    </div>
    {open && trimmed.length >= 2 && <section id={id} className={styles.results} onPointerDown={event => { if (event.button === 0 && (event.target as Element).closest("a")) event.preventDefault(); }} aria-label={tui("searchTitles")}>
      {!matching ? <p role="status">{tui("searchLoading")}</p> : matching.error ? <p role="status">{tui("searchFailed")}</p> : <>
        {matching.items.map(anime => <Link key={anime.id} href={`/${locale}/anime/${encodeURIComponent(anime.slug)}`} onClick={event => navigate(event, `/${locale}/anime/${encodeURIComponent(anime.slug)}`)}> 
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {anime.posterUrl ? <img src={anime.posterUrl} alt="" /> : <span className={styles.posterEmpty} />}
          <span><strong>{titleForLocale(anime, locale)}</strong><small>{anime.year ?? "—"}</small></span>
        </Link>)}
        {!matching.items.length && <p role="status">{tui("searchEmpty")}</p>}
        <Link className={styles.all} href={`/${locale}/catalog?q=${encodeURIComponent(trimmed)}`} onClick={event => navigate(event, `/${locale}/catalog?q=${encodeURIComponent(trimmed)}`)}>{tui("allSearchResults", { n: matching.total })} →</Link>
      </>}
    </section>}
  </form>;
}
