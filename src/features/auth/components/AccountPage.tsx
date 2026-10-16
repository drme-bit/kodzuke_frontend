"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LatestRatings } from "@/features/library/LatestRatings";
import { WatchHistoryPanel } from "@/features/library/WatchHistoryPanel";
import { WatchLaterPanel } from "@/features/library/WatchLaterPanel";
import { historyCopy } from "@/i18n/messages/history";
import { libraryCopy } from "@/i18n/messages/library";
import { ProfileEditor } from "./ProfileEditor";
import { profileCopy } from "@/i18n/messages/profile";
import { signOut } from "@/features/auth/sessionActions";
import { authUrl } from "../navigation";
import { accessToken } from "@/shared/auth/session";
import { useCurrentUser } from "../useCurrentUser";
import "@/features/library/library.css";

export function AccountPage({
  locale,
  returnTo,
}: {
  locale: string;
  returnTo: string;
}) {
  const t = libraryCopy(locale);
  const p = profileCopy(locale);
  const router = useRouter();
  const { user } = useCurrentUser();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [section, setSection] = useState<"history" | "saved">("history");
  useEffect(() => {
    let active = true;
    void accessToken().then((value) => {
      if (active && !value)
        router.replace(authUrl(locale, `/${locale}/account`));
    });
    return () => {
      active = false;
    };
  }, [locale, router]);
  return (
    <main className="profile-page">
      <header className="profile-heading">
        {user?.avatar ? (
          <Image
            className="profile-avatar"
            src={user.avatar}
            alt=""
            width={72}
            height={72}
            unoptimized
          />
        ) : (
          <span className="profile-avatar" aria-hidden="true">
            {user?.username?.slice(0, 1).toUpperCase() ?? "K"}
          </span>
        )}
        <div>
          <p>{t.heading}</p>
          <h1>{user?.username ?? t.loading}</h1>
        </div>
        <div className="profile-heading-actions">
          {user && (
            <button
              className="library-action"
              onClick={() => setEditing((value) => !value)}
              aria-expanded={editing}
            >
              {p.edit}
            </button>
          )}
          <button
            className="library-action"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await signOut();
              router.replace(authUrl(locale, returnTo));
            }}
          >
            {t.signOut}
          </button>
        </div>
      </header>
      {user?.description && !editing && (
        <p className="profile-description">{user.description}</p>
      )}
      {editing && user && (
        <ProfileEditor
          key={user.id}
          user={user}
          locale={locale}
          onClose={() => setEditing(false)}
        />
      )}
      <div className="profile-columns">
        <section className="profile-library" aria-label={t.heading}>
          <nav className="library-tabs" aria-label={t.heading}>
            {(["history", "saved"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-current={section === value ? "page" : undefined}
                data-active={section === value}
                onClick={() => setSection(value)}
              >
                {value === "history" ? historyCopy(locale).continue : t.saved}
              </button>
            ))}
          </nav>
          {section === "history" ? (
            <WatchHistoryPanel locale={locale} />
          ) : (
            <WatchLaterPanel locale={locale} />
          )}
        </section>
        <LatestRatings locale={locale} />
      </div>
    </main>
  );
}
