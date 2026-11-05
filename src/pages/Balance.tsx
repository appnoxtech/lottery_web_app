import { useCallback, useEffect, useState } from "react";
import { ChatIcon, PlusIcon, Spinner, TicketIcon, TrophyIcon, WalletIcon } from "../components/Icons";
import DeleteAccount from "../components/DeleteAccount";
import { LogoMark } from "../components/Logo";
import { Empty, ErrorNote, Loading } from "../components/ui";
import { api, ApiError } from "../lib/api";
import { isValidStake } from "../lib/entry";
import { fmtXcg } from "../lib/money";
import { PAY_INTRO, PAY_LINKS, PAY_NOTE } from "../lib/topup";
import { fmtDateTime } from "../lib/time";
import { useWallet } from "../lib/wallet";
import type { LedgerEntry, Paginated } from "../lib/types";

const LABEL: Record<LedgerEntry["type"], string> = { topup: "Top-up", purchase: "Ticket purchase", prize: "Prize", adjustment: "Adjustment" };
const QUICK_AMOUNTS = ["10", "25", "50", "100"];
const ICON: Record<LedgerEntry["type"], { icon: typeof WalletIcon; style: string }> = {
  topup: { icon: PlusIcon, style: "bg-ok-soft text-ok-ink" },
  purchase: { icon: TicketIcon, style: "bg-brand-50 text-brand" },
  prize: { icon: TrophyIcon, style: "bg-gold-100 text-gold-ink" },
  adjustment: { icon: WalletIcon, style: "bg-ink-100 text-ink-700" },
};

export default function Balance() {
  const { wallet, refresh } = useWallet();
  const [items, setItems] = useState<LedgerEntry[] | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [topupError, setTopupError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [amount, setAmount] = useState("");
  const [amountTouched, setAmountTouched] = useState(false);
  const [paying, setPaying] = useState(false);
  const amountOk = isValidStake(amount);

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

  const topUp = () => {
    if (!amountOk) {
      setAmountTouched(true);
      return;
    }
    setPaying(true);
  };

  const paid = async () => {
    if (opening) return;
    setOpening(true);
    setTopupError(null);
    try {
      const { url } = await api.get<{ url: string }>(`topup/whatsapp-link?amount=${encodeURIComponent(amount)}`);
      window.open(url, "_blank", "noopener");
    } catch (e) {
      setTopupError((e as ApiError).message);
    } finally {
      setOpening(false);
    }
  };

  return (
    <main className="grid gap-6 px-4 pt-5 lg:grid-cols-[380px_1fr] lg:items-start lg:px-0 lg:pt-0">
      <section className="grid gap-3 lg:sticky lg:top-24">
        {/* Balance card */}
        <div className="relative overflow-hidden rounded-[20px] bg-hero p-5 text-white shadow-raised">
          <div aria-hidden="true" className="absolute -top-10 -right-10 h-36 w-36 rounded-full border-[22px] border-gold-400 opacity-20" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/90">Your balance</span>
            <LogoMark size={28} />
          </div>
          <div className="mt-2 font-display text-4xl font-extrabold tracking-tight" data-testid="balance">
            {wallet ? fmtXcg(wallet.balance_cents) : "…"}
          </div>
          <div className="mt-5 grid gap-2">
            <label htmlFor="topup-amount" className="text-sm font-medium text-white/90">
              How much do you want to add?
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-muted">XCG</span>
              <input
                id="topup-amount"
                data-testid="topup-amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(",", "."))}
                onBlur={() => setAmountTouched(true)}
                aria-invalid={(amountTouched && !amountOk) || undefined}
                className="field h-12 w-full pl-12 text-right text-lg font-semibold"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((q) => (
                <button key={q} type="button" onClick={() => { setAmount(q); setAmountTouched(true); }} className="h-9 rounded-full bg-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/25">
                  XCG {q}
                </button>
              ))}
            </div>
            {amountTouched && !amountOk && <p role="alert" className="text-sm font-medium text-gold-400">Enter an amount, for example 25 or 25.50.</p>}
          </div>
          <button onClick={topUp} className="btn-buy mt-4 h-12 w-full">
            <PlusIcon size={18} />
            Top Up
          </button>
        </div>
        {paying && (
          <div className="card grid gap-3 p-4 text-sm text-ink-700" data-testid="pay-panel">
            <p>{PAY_INTRO}</p>
            <div className="grid gap-2">
              {PAY_LINKS.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn-buy h-11 w-full">
                  {l.label}
                </a>
              ))}
            </div>
            <p>{PAY_NOTE}</p>
            <button onClick={() => void paid()} disabled={opening} className="btn-buy h-12 w-full">
              {opening ? <Spinner /> : <ChatIcon size={18} />}
              {opening ? "Opening WhatsApp…" : "I have paid"}
            </button>
          </div>
        )}
        {topupError && <ErrorNote>{topupError}</ErrorNote>}
        <ol className="card grid gap-3 p-4 text-sm text-ink-700">
          {["Enter the amount, tap Top Up and pay with one of the links.", "Tap I have paid to tell us on WhatsApp. We check your payment.", "Your balance is updated here as soon as we approve it."].map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <DeleteAccount />
      </section>

      <section aria-label="History" className="grid gap-3">
        <h2 className="section-title">History</h2>
        {error && <ErrorNote>{error}</ErrorNote>}
        {items === null && !error && <Loading label="Loading your history…" />}
        {items?.length === 0 && <Empty icon={<WalletIcon size={26} />} title="Nothing here yet" text="Your top-ups and tickets will show up in this list." />}
        {items && items.length > 0 && (
          <div className="card divide-y divide-line overflow-hidden">
            {items.map((e) => {
              const { icon: Icon, style } = ICON[e.type];
              return (
                <article key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${style}`}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{LABEL[e.type]}</div>
                    <div className="text-xs text-muted">{fmtDateTime(e.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold whitespace-nowrap ${e.amount_cents < 0 ? "text-danger" : "text-ok-ink"}`}>
                      {e.amount_cents < 0 ? "−" : "+"}
                      {fmtXcg(Math.abs(e.amount_cents))}
                    </div>
                    <div className="text-xs whitespace-nowrap text-muted">Balance {fmtXcg(e.balance_after_cents)}</div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {items && items.length < total && (
          <button onClick={() => void load(page + 1)} className="btn-secondary h-12">
            Show more
          </button>
        )}
      </section>
    </main>
  );
}
