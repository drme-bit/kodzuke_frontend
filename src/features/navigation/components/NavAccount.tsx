"use client";

import Link from "next/link";
import { useState } from "react";
import { HiUser } from "react-icons/hi2";
import { authCopy } from "@/i18n/messages/auth";
import { authUrl } from "@/features/auth/navigation";
import { useCurrentUser } from "@/features/auth/useCurrentUser";

function initials(name: string) {
  const words = name.trim().split(/\s+/u);
  return (
    words.length > 1
      ? Array.from(words[0])[0] + Array.from(words[words.length - 1])[0]
      : Array.from(words[0]).slice(0, 2).join("")
  ).toLocaleUpperCase();
}

export function NavAccount({
  locale,
  pathname,
  onNavigate,
}: {
  locale: string;
  pathname: string;
  onNavigate: () => void;
}) {
  const { token, user } = useCurrentUser();
  const [brokenAvatar, setBrokenAvatar] = useState<string | null>(null);
  const copy = authCopy(locale);
  const name = user?.username.trim() || copy.account;
  const avatar = user?.avatar?.trim();
  const hasAvatar =
    avatar &&
    brokenAvatar !== avatar &&
    (/^https?:\/\//i.test(avatar) ||
      (avatar.startsWith("/") && !avatar.startsWith("//")));
  return (
    <Link
      href={token ? `/${locale}/account` : authUrl(locale, pathname)}
      className="nav-account-link"
      aria-label={token ? `${copy.account}: ${name}` : copy.signIn}
      title={token ? name : copy.signIn}
      onClick={onNavigate}
    >
      <span
        className={token ? "nav-avatar" : "nav-sign-in-icon"}
        aria-hidden="true"
      >
        {token && hasAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setBrokenAvatar(avatar)}
          />
        ) : token && user?.username.trim() ? (
          initials(user.username)
        ) : (
          <HiUser />
        )}
      </span>
      <span className="nav-account-name">{token ? name : copy.signIn}</span>
    </Link>
  );
}
