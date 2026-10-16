"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { authenticate } from "@/features/auth/sessionActions";
import { authCopy } from "@/i18n/messages/auth";
import { authUrl } from "@/features/auth/navigation";
import { accessToken } from "@/shared/auth/session";
import { AuthLayout } from "./AuthLayout";

interface AuthPageProps {
  locale: string;
  returnTo: string;
  mode: "login" | "register";
}

export function AuthPage({ locale, returnTo, mode }: AuthPageProps) {
  const t = authCopy(locale);
  const router = useRouter();
  const register = mode === "register";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void accessToken().then((token) => {
      if (active && token) router.replace(returnTo);
    });
    return () => {
      active = false;
    };
  }, [router, returnTo]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(false);
    try {
      await authenticate(
        {
          email: String(form.get("email")).trim(),
          password: String(form.get("password")),
          ...(register
            ? { username: String(form.get("username")).trim() }
            : {}),
        },
        register,
      );
      router.replace(returnTo);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      locale={locale}
      title={register ? t.register : t.signIn}
    >
      <form className="account-form" onSubmit={submit} aria-busy={busy}>
        {register && (
          <label htmlFor="account-username">
            {t.username}
            <input
              id="account-username"
              name="username"
              autoComplete="username"
              required
              minLength={2}
              maxLength={40}
              disabled={busy}
            />
          </label>
        )}
        <label htmlFor="account-email">
          {t.email}
          <input
            id="account-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={busy}
          />
        </label>
        <label htmlFor="account-password">
          {t.password}
          <input
            id="account-password"
            name="password"
            type="password"
            autoComplete={register ? "new-password" : "current-password"}
            required
            minLength={register ? 8 : 1}
            disabled={busy}
          />
        </label>
        {error && (
          <p className="account-error" role="alert">
            {register ? t.registerFailed : t.authFailed}
          </p>
        )}
        <button type="submit" className="account-primary" disabled={busy}>
          {busy ? t.loading : register ? t.register : t.signIn}
        </button>
      </form>
      <Link
        className="account-secondary"
        href={authUrl(locale, returnTo, register ? "login" : "register")}
      >
        {register ? t.haveAccount : t.newAccount}
      </Link>
    </AuthLayout>
  );
}
