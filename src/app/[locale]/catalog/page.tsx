import { translator } from "@/i18n/ui";
export const dynamic = "force-dynamic";

import { fetchCatalogPage } from "@/lib/graphql";
import { locales } from "@/i18n";
import { CatalogClient } from "./CatalogClient";

export function generateStaticParams() {
  return locales.map((l) => ({ locale: l }));
}

export default async function CatalogPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ status?: string }> }) {
  const { locale } = await params;
  const tui = translator(locale);
  const query = await searchParams;
  const initialStatus = ["AIRING","ANNOUNCED","FINISHED"].includes(query.status ?? "") ? query.status! : "all";
  let initialPage: Awaited<ReturnType<typeof fetchCatalogPage>> | null = null;
  let error: string | null = null;
  try {
    initialPage = await fetchCatalogPage(initialStatus === "all" ? {} : { status: initialStatus });
  } catch (e) {
    error = (e as Error).message;
  }

  return <div className="browse-page min-h-screen overflow-x-clip text-white">
    {error && <p className="mx-auto max-w-[1600px] px-6 py-4 text-sm text-red-400">{tui("refreshCatalog")}</p>}
    <CatalogClient key={initialStatus} initialPage={initialPage} initialStatus={initialStatus} />
  </div>;
}
