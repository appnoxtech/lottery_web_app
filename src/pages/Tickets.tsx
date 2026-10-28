import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon, TicketIcon } from "../components/Icons";
import TicketSheet from "../components/TicketSheet";
import { Empty, ErrorNote, Loading, PageTitle } from "../components/ui";
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
    <main className="grid gap-4 px-4 pt-5 lg:px-0 lg:pt-0">
      <PageTitle title="My tickets" subtitle={items && items.length > 0 ? `${total} ${total === 1 ? "ticket" : "tickets"}, newest first` : undefined} />
      {error && <ErrorNote>{error}</ErrorNote>}
      {items === null && !error && <Loading label="Loading your tickets…" />}
      {items?.length === 0 && (
        <Empty
          icon={<TicketIcon size={26} />}
          title="No tickets yet"
          text="Buy your first numbers on the Games tab."
          action={
            <Link to="/" className="btn-buy h-12 px-6">
              Play now
            </Link>
          }
        />
      )}
      <div className="grid gap-2 lg:grid-cols-2 lg:gap-3">
        {items?.map((t) => (
          <button
            key={t.serial}
            type="button"
            onClick={() => void show(t.serial)}
            data-testid="ticket-row"
            className="card flex min-h-[72px] items-center gap-3 p-4 text-left transition hover:border-brand-200 hover:shadow-raised"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand">
              <TicketIcon size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-mono font-extrabold tracking-wider">{prettySerial(t.serial)}</span>
              <span className="block text-sm text-muted">
                {fmtDateTime(t.created_at)} · {t.entries_count} entries
              </span>
            </span>
            <span className="font-display font-bold whitespace-nowrap">XCG {t.total}</span>
            <ChevronRightIcon size={18} className="text-ink-400" />
          </button>
        ))}
      </div>
      {items && items.length < total && (
        <button type="button" onClick={() => void load(page + 1)} className="btn-secondary h-12">
          Show more
        </button>
      )}
      {open && <TicketSheet ticket={open} onClose={() => setOpen(null)} />}
    </main>
  );
}
