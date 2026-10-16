"use client";
import type { CurrentUser } from "@/dto";

import { useEffect, useState } from "react";
import { fetchCurrentUser } from "@/api/user";
import { accessToken, getSession, useSession } from "@/shared/auth/session";

type ProfileResult = { token: string; user: CurrentUser | null };
let cached: ProfileResult | null = null;
let pending: { token: string; request: Promise<ProfileResult> } | null = null;

async function loadProfile(): Promise<ProfileResult | null> {
  const token = await accessToken();
  if (!token) return null;
  if (cached?.token === token) return cached;
  if (pending?.token === token) return pending.request;
  const request = fetchCurrentUser(token)
    .then((getUser) => {
      const result = { token, user: getUser };
      if (getSession()?.accessToken === token) cached = result;
      return result;
    })
    .finally(() => {
      if (pending?.request === request) pending = null;
    });
  pending = { token, request };
  return request;
}

export function publishCurrentUser(token: string, user: CurrentUser) {
  if (getSession()?.accessToken !== token) return;
  cached = { token, user };
  window.dispatchEvent(new Event("kodzuke-profile-change"));
}

export function useCurrentUser() {
  const token = useSession();
  const [result, setResult] = useState<ProfileResult | null>(null);
  useEffect(() => {
    let active = true;
    if (!token) {
      cached = null;
      return;
    }
    void loadProfile()
      .then((profile) => {
        if (active && profile && getSession()?.accessToken === profile.token)
          setResult(profile);
      })
      .catch(() => {
        // A temporary profile failure must not discard an otherwise valid session.
      });
    return () => {
      active = false;
    };
  }, [token]);
  useEffect(() => {
    const changed = () => {
      if (cached?.token === getSession()?.accessToken) setResult(cached);
    };
    window.addEventListener("kodzuke-profile-change", changed);
    return () => window.removeEventListener("kodzuke-profile-change", changed);
  }, []);
  return { token, user: result?.token === token ? result.user : null };
}
