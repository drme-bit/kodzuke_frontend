import { AccountPage } from "@/features/auth/components/AccountPage";
import { safeReturnPath } from "@/features/auth/navigation";
import { normalizeLocale } from "@/i18n/config";

interface AccountRouteProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}

export default async function AccountRoute({
  params,
  searchParams,
}: AccountRouteProps) {
  const locale = normalizeLocale((await params).locale);
  const { returnTo } = await searchParams;
  return (
    <AccountPage
      locale={locale}
      returnTo={safeReturnPath(
        typeof returnTo === "string" ? returnTo : null,
        locale,
      )}
    />
  );
}
