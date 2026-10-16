/** Only permit local, locale-scoped return paths. */
export function safeReturnPath(
  value: string | null | undefined,
  locale: string,
): string {
  const fallback = `/${locale}`;
  if (!value || !value.startsWith(`/${locale}/`) || /[\\\r\n]/.test(value))
    return fallback;
  try {
    const url = new URL(value, "https://kodzuke.local");
    if (
      url.origin !== "https://kodzuke.local" ||
      !url.pathname.startsWith(`/${locale}/`) ||
      ["account", "login", "register"].some(
        (route) => url.pathname.replace(/\/$/, "") === `/${locale}/${route}`,
      )
    )
      return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
export function authUrl(
  locale: string,
  returnTo: string,
  mode: "login" | "register" = "login",
): string {
  return `/${locale}/${mode}?returnTo=${encodeURIComponent(safeReturnPath(returnTo, locale))}`;
}
