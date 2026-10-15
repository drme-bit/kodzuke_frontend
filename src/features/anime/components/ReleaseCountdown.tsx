"use client";
import { useMinuteClock } from "@/shared/hooks/useMinuteClock";
import { useLocalization } from "@/i18n/client";
export function ReleaseCountdown({ airDate }: { airDate?: string }) {
  const { tui } = useLocalization();
  const now = useMinuteClock();
  // A calendar date does not identify an exact broadcast time.
  if (!airDate || /^\d{4}-\d{2}-\d{2}$/.test(airDate) || now === null) return null;
  const remaining = new Date(airDate).getTime() - now;
  if (!Number.isFinite(remaining) || remaining <= 0) return null;
  const minutes = Math.ceil(remaining / 60000);
  return <span className="release-countdown">{tui("releaseCountdown", { days: Math.floor(minutes / 1440), hours: Math.floor(minutes % 1440 / 60), minutes: minutes % 60 })}</span>;
}
