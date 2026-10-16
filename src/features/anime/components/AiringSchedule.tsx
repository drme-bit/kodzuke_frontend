"use client";
import { useMinuteClock } from "@/shared/hooks/useMinuteClock";
import { useLocalization } from "@/i18n/client";
import { ReleaseCountdown } from "./ReleaseCountdown";
import type { Episode } from "@/dto";

export function AiringSchedule({ episodes, schedule }: { episodes: Episode[]; schedule?: { airDate?: string; number?: number } }) {
  const { tui, locale } = useLocalization();
  const now = useMinuteClock();
  const upcoming = now === null ? undefined : schedule?.airDate && schedule.number && new Date(schedule.airDate).getTime() > now ? { number: schedule.number, airDate: schedule.airDate } : episodes.filter(episode => {
    if (!episode.airDate) return false;
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(episode.airDate);
    const date = new Date(dateOnly ? `${episode.airDate}T23:59:59` : episode.airDate).getTime();
    return Number.isFinite(date) && date > now;
  }).sort((a, b) => a.airDate!.localeCompare(b.airDate!))[0];
  const dateOnly = upcoming?.airDate && /^\d{4}-\d{2}-\d{2}$/.test(upcoming.airDate);
  const date = upcoming?.airDate ? new Date(dateOnly ? `${upcoming.airDate}T12:00:00` : upcoming.airDate) : null;
  return <section className="airing-schedule" aria-label={tui("nextRelease")}>
    <h3>{tui("nextRelease")}</h3>
    {now === null ? <p>—</p> : upcoming && date ? <>
      <strong>{tui("episodeNumber", { n: upcoming.number })}</strong>
      <time dateTime={upcoming.airDate}>{date.toLocaleString(locale, { day: "numeric", month: "long", ...(dateOnly ? {} : { hour: "2-digit", minute: "2-digit", timeZoneName: "short" }) })}</time>
      <ReleaseCountdown airDate={upcoming.airDate} />
      <p>{tui(dateOnly ? "releaseTimeUnknown" : "releaseLocalTime")}</p>
    </> : <p>{tui("releaseScheduleUnknown")}</p>}
  </section>;
}
