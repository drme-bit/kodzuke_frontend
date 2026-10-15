import { translator } from "@/i18n/ui";
export const dynamic = "force-dynamic";

import { fetchCatalogPage } from "@/lib/graphql";
import { locales } from "@/i18n";
import { CatalogClient } from "./CatalogClient";

export function generateStaticParams() {
  return locales.map((l) => ({ locale: l }));
}

export default async function CatalogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tui = translator(locale);
  let initialPage: Awaited<ReturnType<typeof fetchCatalogPage>> | null = null;
  let error: string | null = null;
  try {
    initialPage = await fetchCatalogPage();
  } catch (e) {
    error = (e as Error).message;
  }

  return <div className="browse-page min-h-screen overflow-x-clip text-white">
    {error && <p className="mx-auto max-w-[1600px] px-6 py-4 text-sm text-red-400">{tui("refreshCatalog")}</p>}
    <CatalogClient initialPage={initialPage} />
  </div>;
}
