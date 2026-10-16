import { connection } from "next/server";
import { translator } from "@/i18n/ui";

import {
  getCatalogPage as fetchCatalogPage,
  getGenres as fetchGenres,
} from "@/api/server/catalog";
import { locales } from "@/i18n";
import { CatalogClient } from "./CatalogClient";

export function generateStaticParams() {
  return locales.map((l) => ({ locale: l }));
}

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; genre?: string | string[] }>;
}) {
  await connection();
  const { locale } = await params;
  const tui = translator(locale);
  const query = await searchParams;
  const initialStatus = ["AIRING", "ANNOUNCED", "FINISHED"].includes(
    query.status ?? "",
  )
    ? query.status!
    : "all";
  const genresRequest = fetchGenres().catch(() => []);
  const requestedGenres = Array.isArray(query.genre)
    ? query.genre
    : query.genre
      ? [query.genre]
      : [];
  const initialGenres = [...new Set(requestedGenres)]
    .filter((slug) => /^[a-z][a-z-]{0,49}$/.test(slug))
    .slice(0, 30);
  let initialPage: Awaited<ReturnType<typeof fetchCatalogPage>> | null = null;
  let error: string | null = null;
  try {
    initialPage = await fetchCatalogPage({
      ...(initialStatus === "all" ? {} : { status: initialStatus }),
      ...(initialGenres.length ? { genres: initialGenres } : {}),
    });
  } catch (e) {
    error = (e as Error).message;
  }

  const genres = await genresRequest;

  return (
    <div className="browse-page min-h-screen overflow-x-clip text-white">
      {error && (
        <p className="mx-auto max-w-[1600px] px-6 py-4 text-sm text-red-400">
          {tui("refreshCatalog")}
        </p>
      )}
      <CatalogClient
        key={`${initialStatus}:${initialGenres.join(",")}`}
        initialPage={initialPage}
        initialStatus={initialStatus}
        genres={genres}
        initialGenres={initialGenres}
      />
    </div>
  );
}
