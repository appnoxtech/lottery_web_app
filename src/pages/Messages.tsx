import { useEffect, useState } from "react";
import { BellIcon } from "../components/Icons";
import { Empty, ErrorNote, Loading, PageTitle } from "../components/ui";
import { fetchAnnouncements, markAnnouncementsSeen } from "../lib/announcements";
import { ApiError } from "../lib/api";
import { fmtDateTime } from "../lib/time";
import type { Announcement } from "../lib/types";

/** Messages from HopiSuerte (draw delays, account notices), newest first. The web app gets no push, so this is where they are read. */
export default function Messages() {
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAnnouncements()
      .then((list) => {
        if (cancelled) return;
        setItems(list);
        markAnnouncementsSeen(list);
      })
      .catch((e) => {
        if (!cancelled) setError((e as ApiError).message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="grid gap-4 px-4 pt-5 lg:px-0 lg:pt-0">
      <PageTitle title="Messages" subtitle="Important news about draws and your account." />
      {error && <ErrorNote>{error}</ErrorNote>}
      {items === null && !error && <Loading label="Loading messages…" />}
      {items?.length === 0 && <Empty icon={<BellIcon size={26} />} title="No messages yet" text="When HopiSuerte sends an important message, it shows up here." />}
      <div className="grid max-w-3xl gap-2 lg:gap-3">
        {items?.map((a) => (
          <article key={a.id} className="card grid gap-1 p-4" data-testid="announcement">
            <h3 className="font-bold text-ink">{a.title}</h3>
            <p className="text-ink-700">{a.body}</p>
            <p className="text-xs text-muted">{fmtDateTime(a.created_at)}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
