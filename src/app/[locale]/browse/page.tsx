import { connection } from "next/server";
import { translator } from "@/i18n/ui";

export const revalidate = 30;

import { getBrowseRows as fetchLoloan } from "@/api/server/catalog";
import type { LoloanRow } from "@/dto";
import { BrowseClient } from "./BrowseClient";
import { getMessages, locales } from "@/i18n";

export function generateStaticParams() {
  return locales.map((l) => ({ locale: l }));
}

export default async function Browse({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await connection();
  const { locale } = await params;
  const tui = translator(locale);
  const t = getMessages(locale);

  let rows: LoloanRow[] = [];

  try {
    const labels: Record<string, string> = {
      trending: t.browse.trending,
      recent: t.browse.recent,
      tv: t.browse.tv,
      all: t.browse.all,
      updated: t.browse.updated,
      announced: t.browse.announced,
    };
    rows = (await fetchLoloan()).map((row) => ({
      ...row,
      title: labels[row.id] ?? row.title,
    }));
  } catch (e) {
    console.error(
      "[browse] fetchLoloan failed:",
      e instanceof Error ? e.message : String(e),
    );
  }

  const isEmpty = rows.length === 0 || rows.every((r) => !r.animes.length);

  return (
    <div className="browse-page min-h-screen overflow-x-clip text-white">
      <main className="mx-auto max-w-[1600px] px-4 pb-8 md:px-6">
        {isEmpty ? (
          <div className="py-10">
            <p className="text-sm text-zinc-300">{tui("noData")}</p>
          </div>
        ) : (
          <BrowseClient rows={rows} />
        )}
      </main>
    </div>
  );
}
