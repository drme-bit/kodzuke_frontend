"use client";
import type { AuthTokens } from "@/dto";

import { useSyncExternalStore } from "react";
import { refreshSession } from "@/api/auth";

const key = "kodzuke-session";
const event = "kodzuke-session-change";
export function getSession(): AuthTokens | null {
  try {
    const stored = JSON.parse(sessionStorage.getItem(key) || "null");
    return typeof stored?.accessToken === "string" &&
      typeof stored?.refreshToken === "string"
      ? stored
      : null;
  } catch {
    return null;
  }
}
export function saveSession(tokens: AuthTokens | null) {
  try {
    if (tokens) sessionStorage.setItem(key, JSON.stringify(tokens));
    else sessionStorage.removeItem(key);
  } catch {
    /* Session storage may be unavailable. */
  }
  window.dispatchEvent(new Event(event));
}
function subscribe(callback: () => void) {
  window.addEventListener(event, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(event, callback);
    window.removeEventListener("storage", callback);
  };
}
function snapshot() {
  return getSession()?.accessToken ?? null;
}
export function useSession() {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}
let refreshing: Promise<string | null> | null = null;
export async function accessToken(): Promise<string | null> {
  const session = getSession();
  if (!session) return null;
  try {
    const payload = JSON.parse(
      atob(
        session.accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"),
      ),
    );
    if (payload.exp * 1000 > Date.now() + 30000) return session.accessToken;
  } catch {
    /* Refresh malformed or expired tokens. */
  }
  if (!refreshing)
    refreshing = refreshSession(session.refreshToken)
      .then((tokens) => {
        // Ignore a refresh completed after logout or a different login.
        if (getSession()?.refreshToken !== session.refreshToken) return null;
        saveSession(tokens);
        return tokens?.accessToken ?? null;
      })
      .catch(() => {
        if (getSession()?.refreshToken === session.refreshToken)
          saveSession(null);
        return null;
      })
      .finally(() => {
        refreshing = null;
      });
  return refreshing;
}
