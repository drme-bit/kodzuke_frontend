"use client";
import type { CardRating } from "@/dto";

import { useEffect, useRef, useState } from "react";
import { fetchCardRatings } from "@/api/ratings";

type CachedRating = { rating: CardRating | null; expires: number };
const cache = new Map<string, CachedRating>();
const waiting = new Set<string>();
const loading = new Set<string>();
const subscribers = new Map<string, Set<() => void>>();
let timer: ReturnType<typeof setTimeout> | undefined;

async function flush() {
  timer = undefined;
  const ids = [...waiting].slice(0, 100);
  ids.forEach((id) => {
    waiting.delete(id);
    loading.add(id);
  });
  if (!ids.length) return;
  try {
    const result = await fetchCardRatings(ids);
    const ratings = new Map(result.map((rating) => [rating.animeId, rating]));
    for (const id of ids) {
      if (cache.size >= 500) cache.delete(cache.keys().next().value!);
      cache.set(id, {
        rating: ratings.get(id) ?? null,
        expires: Date.now() + 30000,
      });
    }
  } catch {
    // Unknown ratings stay absent; the imported score has no reliable source.
  } finally {
    ids.forEach((id) => {
      loading.delete(id);
      subscribers.get(id)?.forEach((notify) => notify());
    });
    if (waiting.size) timer = setTimeout(flush, 30);
  }
}

function request(id: string) {
  if (loading.has(id) || (cache.get(id)?.expires ?? 0) > Date.now()) return;
  waiting.add(id);
  timer ??= setTimeout(flush, 30);
}

export function refreshCardRating(animeId: string) {
  cache.delete(animeId);
  request(animeId);
}

export function useCardRating(animeId: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [, update] = useState(0);
  useEffect(() => {
    const notify = () => update((value) => value + 1);
    const listeners = subscribers.get(animeId) ?? new Set<() => void>();
    listeners.add(notify);
    subscribers.set(animeId, listeners);
    let visible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) request(animeId);
      },
      { rootMargin: "200px" },
    );
    if (ref.current) observer.observe(ref.current);
    const refresh = () => {
      cache.delete(animeId);
      notify();
      if (visible) request(animeId);
    };
    window.addEventListener("kodzuke-rating-change", refresh);
    return () => {
      observer.disconnect();
      listeners.delete(notify);
      if (!listeners.size) subscribers.delete(animeId);
      window.removeEventListener("kodzuke-rating-change", refresh);
    };
  }, [animeId]);
  return { ref, rating: cache.get(animeId)?.rating ?? null };
}
