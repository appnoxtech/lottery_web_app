import { useCallback, useEffect, useState } from "react";
import { TrophyIcon } from "../components/Icons";
import TicketSheet from "../components/TicketSheet";
import { Empty, ErrorNote, Loading, PageTitle } from "../components/ui";
import { WinningNumbers } from "../components/WinningNumbers";
import { api, ApiError } from "../lib/api";
import { prettySerial } from "../lib/ticket";
import { fmtBusinessDate } from "../lib/time";
import type { MyPrize, Paginated, ResultItem, Ticket } from "../lib/types";

const ORDINAL = ["1st", "2nd", "3rd"];
const STATUS = { pending: "Being paid", credited: "Added to your balance", paid_out: "Paid out" } as const;
const STATUS_STYLE = { pending: "bg-warn-soft text-warn-ink", credited: "bg-ok-soft text-ok-ink", paid_out: "bg-ink-100 text-ink-700" } as const;

/** Published results (newest first) and the customer's own winnings. */
export default function Results() {
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [prizes, setPrizes] = useState<MyPrize[] | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [prizePage, setPrizePage] = useState(1);
  const [prizeTotal, setPrizeTotal] = useState(0);
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

  const loadPrizes = useCallback(async (pageToLoad: number) => {
    try {
      const res = await api.get<Paginated<MyPrize>>(`results/mine?per_page=10&page=${pageToLoad}`);
      setPrizes((prev) => (pageToLoad === 1 ? res.items : [...(prev ?? []), ...res.items]));
      setPrizeTotal(res.total);
      setPrizePage(pageToLoad);
    } catch {
      setPrizes((prev) => prev ?? []);
    }
  }, []);

  useEffect(() => {
    void load(1);
    void loadPrizes(1);
  }, [load, loadPrizes]);

  const showTicket = async (serial: string) => {
    try {
      setOpen(await api.get<Ticket>(`tickets/${serial}`));
    } catch (e) {
      setError((e as ApiError).message);
    }
  };

  return (
    <main className="grid gap-6 px-4 pt-5 lg:grid-cols-[1fr_360px] lg:items-start lg:px-0 lg:pt-0">
      {/* My winnings first on phones: it is what a winner comes here for. */}
      <section className="grid gap-3 lg:order-2">
        <h2 className="section-title">My winnings</h2>
        {prizes === null && <Loading />}
        {prizes?.length === 0 && (
          <div className="card flex items-center gap-3 border-gold-400/40 bg-gradient-to-br from-gold-100 to-white p-4 text-sm text-gold-ink">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-ink">
              <TrophyIcon size={20} />
            </span>
            No winnings yet. Good luck!
          </div>
        )}
        {prizes?.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => void showTicket(p.ticket_serial)}
            data-testid="prize-row"
            className="card grid gap-1.5 border-gold-400/60 bg-gradient-to-br from-gold-100/70 to-white p-4 text-left transition hover:shadow-raised"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-display text-2xl font-extrabold text-ok-ink">XCG {p.amount}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[p.status]}`}>{STATUS[p.status]}</span>
            </span>
            <span className="text-sm text-muted">
              {p.game_code} · {fmtBusinessDate(p.draw_date)} · {ORDINAL[p.rank - 1]} prize with <span className="font-mono font-bold text-ink">{p.number}</span> · {prettySerial(p.ticket_serial)}
            </span>
          </button>
        ))}
        {prizes && prizes.length < prizeTotal && (
          <button type="button" onClick={() => void loadPrizes(prizePage + 1)} className="btn-secondary h-12">
            Show more
          </button>
        )}
      </section>

      <section className="grid gap-3 lg:order-1">
        <PageTitle title="Results" subtitle="Winning numbers of every draw, newest first." />
        {error && <ErrorNote>{error}</ErrorNote>}
        {results === null && !error && <Loading label="Loading results…" />}
        {results?.length === 0 && <Empty icon={<TrophyIcon size={26} />} title="No results yet" text="They appear here after each draw." />}
        <div className="grid gap-3 xl:grid-cols-2">
          {results?.map((r) => (
            <div key={r.draw_id} data-testid="result-row" className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="grid h-8 min-w-9 place-items-center rounded-md bg-brand-50 px-2 text-sm font-extrabold text-brand-700">{r.game_code}</span>
                  <span className="truncate text-sm font-semibold">{r.game_name}</span>
                </span>
                <span className="shrink-0 text-sm font-medium text-muted">{fmtBusinessDate(r.draw_date)}</span>
              </div>
              <div className="mt-3 flex justify-center">
                <WinningNumbers numbers={r.numbers} />
              </div>
              {r.corrected && <div className="mt-3 rounded-md bg-warn-soft px-2 py-1 text-center text-xs text-warn-ink">This result was corrected.</div>}
            </div>
          ))}
        </div>
        {results && results.length < total && (
          <button type="button" onClick={() => void load(page + 1)} className="btn-secondary h-12">
            Show more
          </button>
        )}
      </section>
      {open && <TicketSheet ticket={open} onClose={() => setOpen(null)} />}
    </main>
  );
}
