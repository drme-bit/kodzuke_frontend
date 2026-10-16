"use client";
import type { CatalogPage, CatalogFilters } from "@/dto";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchCatalogPage } from "@/api/catalog/client";

export function useCatalogPage(
  initialPage: CatalogPage | null,
  filters: CatalogFilters,
) {
  const key = JSON.stringify(filters);
  const initialKey = useRef(key);
  const [result, setResult] = useState({
    key,
    page: initialPage,
    loading: false,
    error: "",
  });
  const request = useRef<AbortController | null>(null);
  const firstRender = useRef(true);
  const load = useCallback(
    async (append: boolean) => {
      if (append && request.current) return;
      request.current?.abort();
      const controller = new AbortController();
      request.current = controller;
      const offset =
        append && result.key === key ? (result.page?.items.length ?? 0) : 0;
      setResult((previous) => ({ ...previous, loading: true, error: "" }));
      try {
        const page = await fetchCatalogPage(
          JSON.parse(key),
          offset,
          controller.signal,
        );
        if (!controller.signal.aborted)
          setResult((previous) => ({
            key,
            page: {
              ...page,
              items:
                append && previous.key === key
                  ? [...(previous.page?.items ?? []), ...page.items]
                  : page.items,
            },
            loading: false,
            error: "",
          }));
      } catch {
        if (!controller.signal.aborted)
          setResult((previous) => ({
            key,
            page: previous.key === key ? previous.page : null,
            loading: false,
            error: "catalogFailed",
          }));
      } finally {
        if (request.current === controller) request.current = null;
      }
    },
    [key, result.key, result.page?.items.length],
  );
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  }, [load]);
  useEffect(() => {
    if (firstRender.current && key === initialKey.current && initialPage) {
      firstRender.current = false;
      return;
    }
    firstRender.current = false;
    request.current?.abort();
    const timer = setTimeout(() => {
      void loadRef.current(false);
    }, 250);
    return () => {
      clearTimeout(timer);
      request.current?.abort();
    };
  }, [key, initialPage]);
  const current = result.key === key;
  return {
    page: current ? result.page : null,
    loading: result.loading || !current,
    error: result.error,
    loadMore: () => load(true),
    retry: () => load(current && Boolean(result.page)),
  };
}
