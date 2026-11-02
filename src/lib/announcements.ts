import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import type { Announcement } from "./types";

/** Id of the newest message this browser has shown, so the dot on "Messages" goes away once read. */
const SEEN_KEY = "hs_seen_announcement";
const listeners = new Set<() => void>();

function readSeen(): number {
  try {
    return Number(localStorage.getItem(SEEN_KEY) ?? 0);
  } catch {
    return 0;
  }
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  return (await api.get<{ items: Announcement[] }>("announcements")).items;
}

export function markAnnouncementsSeen(items: Announcement[]): void {
  if (items.length === 0) return;
  try {
    localStorage.setItem(SEEN_KEY, String(items[0].id));
  } catch {
    // Storage blocked (private window): the dot comes back after a reload, nothing worse.
  }
  listeners.forEach((l) => l());
}

/** True when there is a message newer than the last one the customer opened. Checked when the app opens. */
export function useHasUnread(): boolean {
  const [newest, setNewest] = useState(0);
  const [seen, setSeen] = useState(readSeen);

  const refresh = useCallback(() => setSeen(readSeen()), []);

  useEffect(() => {
    let cancelled = false;
    fetchAnnouncements()
      .then((items) => {
        if (!cancelled) setNewest(items[0]?.id ?? 0);
      })
      .catch(() => {
        /* offline: no dot rather than a wrong one */
      });
    listeners.add(refresh);
    return () => {
      cancelled = true;
      listeners.delete(refresh);
    };
  }, [refresh]);

  return newest > seen;
}
