import { useEffect, useState } from "react";
import { api } from "./api";
import type { ServerTime } from "./types";

/**
 * The current time according to the SERVER, ticking every second. The phone's own clock is only used to
 * measure the seconds since the last sync, so a wrong clock or time zone cannot show a wrong countdown.
 * Returns null until the first sync.
 */
export function useServerClock(): number | null {
  const [offsetMs, setOffsetMs] = useState<number | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        const before = Date.now();
        const t = await api.get<ServerTime>("time");
        const after = Date.now();
        // The server stamped the time about halfway through the round trip.
        if (!cancelled) setOffsetMs(new Date(t.server_time_utc).getTime() - (before + after) / 2);
      } catch {
        /* keep the previous offset and try again at the next sync */
      }
    };
    sync();
    const resync = setInterval(sync, 5 * 60 * 1000);
    const ticker = setInterval(() => setTick((n) => n + 1), 1000);
    return () => {
      cancelled = true;
      clearInterval(resync);
      clearInterval(ticker);
    };
  }, []);

  return offsetMs === null ? null : Date.now() + offsetMs;
}
