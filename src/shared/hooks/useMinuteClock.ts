"use client";
import { useSyncExternalStore } from "react";
let current: number | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();
function tick() { current = Date.now(); listeners.forEach(listener => listener()); }
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) { tick(); timer = setInterval(tick, 60000); }
  return () => { listeners.delete(listener); if (!listeners.size && timer) { clearInterval(timer); timer = null; } };
}
/** One browser timer for all countdowns, with a hydration-safe server snapshot. */
export function useMinuteClock() { return useSyncExternalStore(subscribe, () => current, () => null); }
