import { translator } from "@/i18n/ui";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { fetchEpisode } from "@/lib/api";
import { StreamPlayer } from "@/features/anime/components/StreamPlayer";

export default async function Watch({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const tui = translator(locale);
  const episode = await fetchEpisode(id,locale).catch(() => null);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/80 p-4 backdrop-blur">
        <Link href={`/${locale}/browse`} className="text-sm text-white/70 hover:text-white">← {tui("browse")}</Link>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        {episode ? (
          <>
            <div className="overflow-hidden rounded-xl bg-zinc-900">
              <StreamPlayer episode={episode} className="aspect-video" />
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              {tui("episodeNumber",{n:episode.number})}
              {episode.title ? ` • ${episode.title}` : ""}
              {episode.sources?.length ? ` • ${tui("sources",{n:episode.sources.length})}` : ""}
            </p>
          </>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-zinc-900 text-zinc-500">
            {tui("episodeNotFound")}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Link href={`/${locale}/browse`} className="rounded bg-white/10 px-4 py-2 text-sm">{tui("catalog")}</Link>
        </div>
      </main>
    </div>
  );
}
