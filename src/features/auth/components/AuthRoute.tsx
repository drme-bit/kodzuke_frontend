import { normalizeLocale } from "@/i18n/config";
import { safeReturnPath } from "../navigation";
import { AuthPage } from "./AuthPage";

export interface AuthRouteProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}

export async function AuthRoute({
  params,
  searchParams,
  mode,
}: AuthRouteProps & { mode: "login" | "register" }) {
  const locale = normalizeLocale((await params).locale);
  const { returnTo } = await searchParams;
  return (
    <AuthPage
      key={mode}
      locale={locale}
      mode={mode}
      returnTo={safeReturnPath(
        typeof returnTo === "string" ? returnTo : null,
        locale,
      )}
    />
  );
}
