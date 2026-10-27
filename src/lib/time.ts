/**
 * Everything customers see is Curaçao time (UTC-4, no daylight saving), whatever the phone is set to.
 * The server sends exact UTC instants; this is the only place that turns them into text.
 */
export const TZ = "America/Curacao";

const clock = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true });
const dayAndClock = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", hour: "numeric", minute: "2-digit", hour12: true });
const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** "8:45 PM" for a moment today (Curaçao time), "Tue 12:01 AM" for another day. */
export function fmtTime(iso: string, nowMs: number): string {
  const when = new Date(iso);
  return ymd.format(when) === ymd.format(new Date(nowMs)) ? clock.format(when) : dayAndClock.format(when);
}

const dateAndClock = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });

/** "27 Oct 2026, 3:05 pm" in Curaçao time. */
export const fmtDateTime = (iso: string): string => dateAndClock.format(new Date(iso));

export function fmtCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}m ${String(sec).padStart(2, "0")}s`;
}

/** "2026-10-26" -> "Mon 26 Oct 2026". A business date: no timezone shifting. */
export const fmtBusinessDate = (date: string): string =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00Z`));
