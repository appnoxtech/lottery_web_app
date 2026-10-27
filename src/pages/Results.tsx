import { useCallback, useEffect, useState } from "react";
import TicketSheet from "../components/TicketSheet";
import { api, ApiError } from "../lib/api";
import { prettySerial } from "../lib/ticket";
import { fmtBusinessDate } from "../lib/time";
import type { MyPrize, Paginated, ResultItem, Ticket } from "../lib/types";

const ORDINAL = ["1st", "2nd", "3rd"];
const STATUS = { pending: "Being paid", credited: "Added to your balance", paid_out: "Paid out" } as const;

/** Published results (newest first) and the customer's own winnings. */
export default function Results() {
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [prizes, setPrizes] = useState<MyPrize[] | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Ticket | null>(null);

  const load = useCallback(async (pageToLoad: number) => {
    try {
      const res = await api.get<Paginated<ResultItem>>(`results?per_page=20&page=${pageToLoad}`);
      setResults((prev) => (pageToLoad === 1 ? res.items : [...(prev ?? []), ...res.items]));
      setTotal(res.total);
      setPage(pageToLoad);
      setError(null);
    } catch (e) {
      setError((e as ApiError).message);
    }
  }, []);

  useEffect(() => {
    void load(1);
    api.get<Paginated<MyPrize>>("results/mine").then((r) => setPrizes(r.items)).catch(() => setPrizes([]));
  }, [load]);

  const showTicket = async (serial: string) => {
    try {
      setOpen(await api.get<Ticket>(`tickets/${serial}`));
    } catch (e) {
      setError((e as ApiError).message);
    }
  };

  return (
    <main className="grid gap-5 px-5 pt-5 lg:grid-cols-[1fr_360px] lg:items-start lg:px-0 lg:pt-0">
      <section className="grid gap-3">
        <h2 className="text-lg font-bold">Results</h2>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}
        {results === null && !error && <p className="text-muted">Loading…</p>}
        {results?.length === 0 && <p className="rounded-2xl border border-line bg-white p-5 text-center text-muted">No results yet. They appear here after each draw.</p>}
        <div className="grid gap-2 lg:grid-cols-2">
          {results?.map((r) => (
            <div key={r.draw_id} data-testid="result-row" className="rounded-2xl border border-line bg-white p-4 shadow-sm">
              <div className="flex items-baseline justify-between">
                <span className="font-extrabold">{r.game_code}</span>
                <span className="text-sm text-muted">{fmtBusinessDate(r.draw_date)}</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                {r.numbers.map((n, i) => (
                  <div key={i} className="rounded-xl bg-brand-soft py-2">
                    <div className="text-xs text-muted">{ORDINAL[i]}</div>
                    <div className="font-mono text-xl font-extrabold tracking-widest">{n}</div>
                  </div>
                ))}
              </div>
              {r.corrected && <div className="mt-2 text-xs text-muted">This result was corrected.</div>}
            </div>
          ))}
        </div>
        {results && results.length < total && (
          <button type="button" onClick={() => void load(page + 1)} className="h-11 rounded-xl border border-line bg-white font-bold">
            Show more
          </button>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-bold">My winnings</h2>
        {prizes?.length === 0 && <p className="rounded-2xl border border-line bg-white p-5 text-center text-muted">No winnings yet. Good luck!</p>}
        {prizes?.map((p) => (
          <button key={p.id} type="button" onClick={() => void showTicket(p.ticket_serial)} data-testid="prize-row" className="rounded-2xl border border-line bg-white p-4 text-left shadow-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-ok">XCG {p.amount}</span>
              <span className="text-sm font-semibold">{STATUS[p.status]}</span>
            </div>
            <div className="text-sm text-muted">
              {p.game_code} · {fmtBusinessDate(p.draw_date)} · {ORDINAL[p.rank - 1]} prize with <span className="font-mono font-bold">{p.number}</span> · {prettySerial(p.ticket_serial)}
            </div>
          </button>
        ))}
      </section>
      {open && <TicketSheet ticket={open} onClose={() => setOpen(null)} />}
    </main>
  );
}
