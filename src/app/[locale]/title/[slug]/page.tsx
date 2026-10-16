import { connection } from "next/server";

import { redirect, notFound } from "next/navigation";
import { getTitle as fetchTitle } from "@/api/server/anime";

export default async function LegacyTitle({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  await connection();
  const { locale, slug } = await params;
  const title = await fetchTitle(decodeURIComponent(slug));
  const first = title?.seasons
    .slice()
    .sort(
      (a, b) =>
        (a.seasonNumber ?? 999) - (b.seasonNumber ?? 999) ||
        (a.year ?? 9999) - (b.year ?? 9999),
    )[0];
  if (!first) notFound();
  redirect(`/${locale}/anime/${encodeURIComponent(first.slug)}`);
}
