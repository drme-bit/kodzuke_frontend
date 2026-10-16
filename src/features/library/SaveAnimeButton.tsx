"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/shared/auth/session";
import { authUrl } from "@/features/auth/navigation";
import { saveAnime, savedAnime } from "@/api/library";
import { libraryCopy } from "@/i18n/messages/library";
import "./library.css";
export function SaveAnimeButton({
  animeId,
  locale,
}: {
  animeId: string;
  locale: string;
}) {
  const token = useSession();
  const router = useRouter();
  const path = usePathname();
  const t = libraryCopy(locale);
  const [value, setValue] = useState<{ token: string; saved: boolean } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!token) return;
    let active = true;
    void savedAnime(animeId)
      .then((saved) => {
        if (active) setValue({ token, saved });
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [animeId, token]);
  const saved = value?.token === token && value?.saved;
  return (
    <div className="save-anime">
      <button
        className="library-action"
        type="button"
        aria-pressed={Boolean(saved)}
        disabled={busy || Boolean(token && !value && !error)}
        onClick={async () => {
          if (!token) {
            router.push(authUrl(locale, path));
            return;
          }
          setBusy(true);
          setError(false);
          try {
            const result = await saveAnime(animeId, !saved);
            setValue({ token, saved: result });
          } catch {
            setError(true);
          } finally {
            setBusy(false);
          }
        }}
      >
        {saved ? `✓ ${t.savedLabel}` : `+ ${t.save}`}
      </button>
      {error && <p role="alert">{t.saveError}</p>}
    </div>
  );
}
