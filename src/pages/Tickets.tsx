import { useCallback, useEffect, useState } from "react";
import TicketSheet from "../components/TicketSheet";
import { prettySerial } from "../lib/ticket";
import { api, ApiError } from "../lib/api";
import { fmtDateTime } from "../lib/time";
import type { Paginated, Ticket } from "../lib/types";

/** The customer's own tickets, newest first. Tap one to see its numbers. */
export default function Tickets() {
  const [items, setItems] = useState<Ticket[] | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Ticket | null>(null);

  const load = useCallback(async (pageToLoad: number) => {
    try {
      const res = await api.get<Paginated<Ticket>>(`tickets?per_page=20&page=${pageToLoad}`);
      setItems((prev) => (pageToLoad === 1 ? res.items : [...(prev ?? []), ...res.items]));
      setTotal(res.total);
      setPage(pageToLoad);
      setError(null);
    } catch (e) {
      setError((e as ApiError).message);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  const show = async (serial: string) => {
    try {
      setOpen(await api.get<Ticket>(`tickets/${serial}`));
    } catch (e) {
      setError((e as ApiError).message);
    }
  };

  return (
    <main className="grid gap-3 px-5 pt-5 lg:px-0 lg:pt-0">
      <h2 className="text-lg font-bold">My tickets</h2>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      {items === null && !error && <p className="text-muted">Loading…</p>}
      {items?.length === 0 && <p className="rounded-2xl border border-line bg-white p-5 text-center text-muted">No tickets yet. Buy your first numbers on the Games tab.</p>}
      <div className="grid gap-2 lg:grid-cols-2">
        {items?.map((t) => (
          <button key={t.serial} type="button" onClick={() => void show(t.serial)} data-testid="ticket-row" className="flex items-center justify-between rounded-2xl border border-line bg-white p-4 text-left shadow-sm">
            <div>
              <div className="font-extrabold tracking-wider">{prettySerial(t.serial)}</div>
              <div className="text-sm text-muted">
                {fmtDateTime(t.created_at)} · {t.entries_count} entries
              </div>
            </div>
            <div className="font-bold">XCG {t.total}</div>
          </button>
        ))}
      </div>
      {items && items.length < total && (
        <button type="button" onClick={() => void load(page + 1)} className="h-11 rounded-xl border border-line bg-white font-bold">
          Show more
        </button>
      )}
      {open && <TicketSheet ticket={open} onClose={() => setOpen(null)} />}
    </main>
  );
}
