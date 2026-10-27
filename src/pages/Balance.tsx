import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../lib/api";
import { fmtXcg } from "../lib/money";
import { fmtDateTime } from "../lib/time";
import { useWallet } from "../lib/wallet";
import type { LedgerEntry, Paginated } from "../lib/types";

const LABEL: Record<LedgerEntry["type"], string> = { topup: "Top-up", purchase: "Ticket purchase", prize: "Prize", adjustment: "Adjustment" };

export default function Balance() {
  const { wallet, refresh } = useWallet();
  const [items, setItems] = useState<LedgerEntry[] | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [topupError, setTopupError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  const load = useCallback(async (pageToLoad: number) => {
    try {
      const res = await api.get<Paginated<LedgerEntry>>(`wallet/transactions?per_page=20&page=${pageToLoad}`);
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
    void refresh();
  }, [load, refresh]);

  const topUp = async () => {
    if (opening) return;
    setOpening(true);
    setTopupError(null);
    try {
      const { url } = await api.get<{ url: string }>("topup/whatsapp-link");
      window.open(url, "_blank", "noopener");
    } catch (e) {
      setTopupError((e as ApiError).message);
    } finally {
      setOpening(false);
    }
  };

  return (
    <main className="grid gap-5 px-5 pt-5">
      <section className="grid gap-3 rounded-2xl border border-line bg-white p-5 text-center shadow-sm">
        <div className="text-sm text-muted">Your balance</div>
        <div className="text-4xl font-extrabold" data-testid="balance">
          {wallet ? fmtXcg(wallet.balance_cents) : "…"}
        </div>
        <button onClick={() => void topUp()} disabled={opening} className="h-12 rounded-xl bg-ok font-bold text-white disabled:opacity-60">
          {opening ? "Opening WhatsApp…" : "Top Up on WhatsApp"}
        </button>
        {topupError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
            {topupError}
          </p>
        )}
        <p className="text-xs text-muted">Send your payment details on WhatsApp. Your balance is updated here as soon as we approve your payment.</p>
      </section>

      <section aria-label="History" className="grid gap-3">
        <h2 className="text-lg font-bold">History</h2>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}
        {items === null && !error && <p className="text-muted">Loading…</p>}
        {items?.length === 0 && <p className="text-muted">Nothing here yet. Your top-ups and tickets will show up in this list.</p>}
        {items?.map((e) => (
          <article key={e.id} className="flex items-center justify-between rounded-2xl border border-line bg-white p-4 shadow-sm">
            <div>
              <div className="font-bold">{LABEL[e.type]}</div>
              <div className="text-xs text-muted">{fmtDateTime(e.created_at)}</div>
            </div>
            <div className="text-right">
              <div className={`font-extrabold ${e.amount_cents < 0 ? "text-danger" : "text-ok-dark"}`}>
                {e.amount_cents < 0 ? "−" : "+"}
                {fmtXcg(Math.abs(e.amount_cents))}
              </div>
              <div className="text-xs text-muted">Balance {fmtXcg(e.balance_after_cents)}</div>
            </div>
          </article>
        ))}
        {items && items.length < total && (
          <button onClick={() => void load(page + 1)} className="h-11 rounded-xl border-2 border-line font-semibold">
            Show more
          </button>
        )}
      </section>
    </main>
  );
}
