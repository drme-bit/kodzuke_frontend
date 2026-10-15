export const dynamic = "force-dynamic";
import { redirect, notFound } from "next/navigation";
import { fetchTitle } from "@/lib/api";

export default async function LegacyTitle({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const title = await fetchTitle(decodeURIComponent(slug));
  const first = title?.seasons.slice().sort((a,b) => (a.seasonNumber ?? 999)-(b.seasonNumber ?? 999) || (a.year ?? 9999)-(b.year ?? 9999))[0];
  if (!first) notFound();
  redirect(`/${locale}/anime/${encodeURIComponent(first.slug)}`);
}
