import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TicketSheet from "../components/TicketSheet";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { DIGIT_TYPES, deriveLines, isValidStake, newIdempotencyKey, parseEntries, type DigitType } from "../lib/entry";
import { fmtXcg } from "../lib/money";
import { fmtCountdown, fmtTime } from "../lib/time";
import { useServerClock } from "../lib/useServerClock";
import { useWallet } from "../lib/wallet";
import type { Customer, Preview, PurchaseRules, Ticket } from "../lib/types";

const DEFAULT_STAKE = "0.50";

export default function Home() {
  const { session, setCustomer, isNew } = useAuth();
  const customer = session!.customer;
  const now = useServerClock();
  const { wallet, refresh: refreshWallet } = useWallet();

  const [rules, setRules] = useState<PurchaseRules | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [games, setGames] = useState<Set<string>>(new Set());
  const [digits, setDigits] = useState<Set<DigitType>>(new Set<DigitType>([4]));
  const [text, setText] = useState("");
  const [defaultStake, setDefaultStake] = useState(DEFAULT_STAKE);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [confirming, setConfirming] = useState(false);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [buyError, setBuyError] = useState<ApiError | null>(null);
  const [rejected, setRejected] = useState<Set<string>>(new Set());
  const [ticket, setTicket] = useState<Ticket | null>(null);

  // "Repeat" on a ticket sends the old games and numbers here. The customer reviews them; nothing is bought.
  const location = useLocation();
  const navigate = useNavigate();
  const [repeat, setRepeat] = useState<{ games: string[]; digits: DigitType[]; text: string } | null>(
    (location.state as { repeat?: { games: string[]; digits: DigitType[]; text: string } } | null)?.repeat ?? null,
  );
  const [repeatNote, setRepeatNote] = useState<string | null>(null);
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const loadRules = useCallback(async () => {
    try {
      const r = await api.get<PurchaseRules>("purchase/rules");
      setRules(r);
      setLoadError(null);
      // A game that closed while selected leaves the selection.
      setGames((prev) => new Set([...prev].filter((code) => r.games.find((g) => g.code === code)?.is_open)));
    } catch (e) {
      setLoadError((e as ApiError).message);
    }
  }, []);

  useEffect(() => {
    if (!repeat || !rules) return;
    const open = repeat.games.filter((c) => rules.games.find((g) => g.code === c)?.is_open);
    setGames(new Set(open));
    setDigits(new Set(repeat.digits));
    setText(repeat.text);
    setRepeatNote(
      open.length === repeat.games.length
        ? "Your earlier numbers are filled in. Check them, then confirm."
        : open.length
          ? `Your earlier numbers are filled in. ${repeat.games.filter((c) => !open.includes(c)).join(", ")} is closed right now.`
          : "Your earlier numbers are filled in, but none of those games is open right now. Choose another game.",
    );
    setRepeat(null);
  }, [repeat, rules]);

  useEffect(() => {
    void loadRules();
    const t = setInterval(loadRules, 30000);
    return () => clearInterval(t);
  }, [loadRules]);

  // What the customer typed, turned into lines. Removed lines stay out until the number is typed again.
  const { tokens, unreadable } = useMemo(() => parseEntries(text), [text]);
  const derived = useMemo(() => deriveLines(tokens, digits, defaultStake, overrides), [tokens, digits, defaultStake, overrides]);
  const lines = useMemo(() => derived.lines.filter((l) => !removed.has(l.number)), [derived, removed]);
  const stakeProblems = lines.some((l) => !isValidStake(l.stake)) || !isValidStake(defaultStake);

  const onTextChange = (next: string) => {
    const before = new Set(deriveLines(parseEntries(text).tokens, digits, defaultStake, {}).lines.map((l) => l.number));
    const after = deriveLines(parseEntries(next).tokens, digits, defaultStake, {}).lines.map((l) => l.number);
    const fresh = after.filter((n) => !before.has(n));
    if (fresh.length) setRemoved((prev) => new Set([...prev].filter((n) => !fresh.includes(n))));
    setText(next);
    setRejected(new Set());
  };

  const payload = useMemo(
    () => ({ games: [...games].sort(), lines: lines.filter((l) => isValidStake(l.stake)).map((l) => ({ number: l.number, stake: l.stake })) }),
    [games, lines],
  );
  const payloadKey = JSON.stringify(payload);

  // Ask the server what this purchase would cost and which lines it cannot take, a moment after typing stops.
  const seq = useRef(0);
  useEffect(() => {
    if (!payload.games.length || !payload.lines.length) {
      setPreview(null);
      setPreviewError(null);
      setPreviewing(false);
      return;
    }
    const mine = ++seq.current;
    setPreviewing(true);
    const t = setTimeout(async () => {
      try {
        const p = await api.post<Preview>("purchase/preview", payload);
        if (mine !== seq.current) return;
        setPreview(p);
        setPreviewError(null);
      } catch (e) {
        if (mine !== seq.current) return;
        setPreview(null);
        setPreviewError((e as ApiError).message);
        if ((e as ApiError).code === "sales_closed") void loadRules();
      } finally {
        if (mine === seq.current) setPreviewing(false);
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payloadKey, loadRules]);

  const problemOf = (number: string) => preview?.lines.find((l) => l.number === number);
  const hasServerProblem = preview?.lines.some((l) => l.problem) ?? false;
  const canConfirm = !!preview && preview.can_purchase && !previewing && !stakeProblems && !hasServerProblem && lines.length > 0;

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const openConfirm = () => {
    if (!canConfirm) return;
    setKey(newIdempotencyKey());
    setBuyError(null);
    setConfirming(true);
  };

  // A ref, not the `busy` state: two taps in the same instant both see the old state, a ref changes at once.
  const paying = useRef(false);
  const buy = async () => {
    if (paying.current) return;
    paying.current = true;
    setBusy(true);
    setBuyError(null);
    try {
      // The same key on every retry of this sheet: if the first try did go through, the server returns the same ticket.
      const t = await api.post<Ticket>("purchase", payload, { "Idempotency-Key": key });
      setTicket(t);
      setConfirming(false);
      setText("");
      setOverrides({});
      setRemoved(new Set());
      setRejected(new Set());
      setPreview(null);
      void refreshWallet();
    } catch (e) {
      const err = e as ApiError;
      setBuyError(err);
      if (err.code === "number_not_accepted") {
        const details = err.details as unknown as { rejected?: { number: string }[] } | undefined;
        setRejected(new Set((details?.rejected ?? []).map((r) => r.number)));
        setConfirming(false);
      }
      if (err.code === "sales_closed") {
        setConfirming(false);
        void loadRules();
      }
      void refreshWallet();
    } finally {
      paying.current = false;
      setBusy(false);
    }
  };

  const openGames = rules?.games.filter((g) => g.is_open) ?? [];
  const earliest = [...games]
    .map((c) => rules?.games.find((g) => g.code === c)?.draw)
    .filter((d): d is NonNullable<typeof d> => !!d)
    .sort((a, b) => new Date(a.closes_at).getTime() - new Date(b.closes_at).getTime())[0];

  return (
    <>
      <main className="grid gap-5 px-5 pb-40 pt-5 lg:px-0 lg:pb-32 lg:pt-0">
        {!customer.name && <NamePrompt onSaved={setCustomer} welcome={isNew} />}

        {repeatNote && (
          <p role="status" data-testid="repeat-note" className="rounded-xl bg-brand-soft px-4 py-3 text-sm">
            {repeatNote}
          </p>
        )}

        {loadError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
            {loadError}
          </p>
        )}

        {/* 1. Games */}
        <section aria-label="Games" className="grid gap-2">
          <h2 className="text-lg font-bold">1. Choose games</h2>
          {rules === null && !loadError && <p className="text-muted">Loading…</p>}
          <div className="flex flex-wrap gap-2">
            {rules?.games.map((g) => {
              const on = games.has(g.code);
              return (
                <button
                  key={g.code}
                  type="button"
                  disabled={!g.is_open}
                  aria-pressed={on}
                  title={g.name}
                  data-testid={`game-${g.code}`}
                  onClick={() => setGames(toggle(games, g.code))}
                  className={`h-14 min-w-14 rounded-xl border-2 px-4 text-lg font-extrabold ${on ? "border-brand bg-brand text-white" : "border-line bg-white text-ink"} disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400`}
                >
                  {g.code}
                  {!g.is_open && <span className="block text-[10px] font-semibold uppercase">closed</span>}
                </button>
              );
            })}
          </div>
          {rules && openGames.length === 0 && <p className="text-sm text-muted">No game is open for sales right now. Opening times are in Curaçao time.</p>}
          {earliest && now !== null && (
            <p className="text-sm text-muted" data-testid="closing-note">
              Earliest closing: <b className="text-ink">{fmtTime(earliest.closes_at, now)}</b> · {fmtCountdown((new Date(earliest.closes_at).getTime() - now) / 1000)} left (Curaçao time)
            </p>
          )}
        </section>

        {/* 2. Digits */}
        <section aria-label="Digits" className="grid gap-2">
          <h2 className="text-lg font-bold">2. How many digits?</h2>
          <div className="flex gap-2">
            {DIGIT_TYPES.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={digits.has(d)}
                data-testid={`digits-${d}`}
                onClick={() => {
                  const next = toggle(digits, d);
                  if (next.size) setDigits(next);
                }}
                className={`h-12 flex-1 rounded-xl border-2 font-bold lg:max-w-32 ${digits.has(d) ? "border-brand bg-brand text-white" : "border-line bg-white"}`}
              >
                {d} digits
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">Pick 4, 3 and 2 to play a 4-digit number on its last 3 and last 2 digits too.</p>
        </section>

        {/* 3. Numbers */}
        <section aria-label="Numbers" className="grid gap-2">
          <h2 className="text-lg font-bold">3. Type your numbers</h2>
          <textarea
            aria-label="Numbers and amounts"
            data-testid="entry"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            rows={3}
            inputMode="text"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="1234x2  5678x1  0042"
            className="rounded-xl border-2 border-line bg-white p-3 font-mono text-lg tracking-wide outline-none focus:border-brand"
          />
          <div className="flex items-center gap-3">
            <label htmlFor="default-stake" className="text-sm text-muted">
              Amount when you do not type one (x2):
            </label>
            <input
              id="default-stake"
              data-testid="default-stake"
              inputMode="decimal"
              value={defaultStake}
              onChange={(e) => setDefaultStake(e.target.value.replace(",", "."))}
              className={`h-10 w-24 rounded-lg border-2 px-3 text-right outline-none focus:border-brand ${isValidStake(defaultStake) ? "border-line" : "border-danger"}`}
            />
          </div>
          {unreadable.length > 0 && <p className="text-sm text-danger">Cannot read: {unreadable.join(", ")}. Use 2 to 4 digits, optionally followed by x and an amount, like 1234x2.</p>}
          {derived.ignored.length > 0 && <p className="text-sm text-amber-700">Not used with the digits selected: {derived.ignored.join(", ")}.</p>}
        </section>

        {/* 4. Lines */}
        {lines.length > 0 && (
          <section aria-label="Your numbers" className="grid gap-2">
            <h2 className="text-lg font-bold">Your numbers</h2>
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              {lines.map((l) => {
                const server = problemOf(l.number);
                const message = !isValidStake(l.stake) ? "Enter an amount, for example 1 or 0.50." : rejected.has(l.number) ? "This number cannot take that amount. Lower the amount or remove it." : server?.message;
                return (
                  <div key={l.number} data-testid="line" className="border-b border-line px-4 py-3 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <span className="w-20 font-mono text-xl font-extrabold tracking-widest">{l.number}</span>
                      <span className="w-14 text-xs text-muted">{l.digits} digits</span>
                      <input
                        aria-label={`Amount for ${l.number}`}
                        inputMode="decimal"
                        value={l.stake}
                        onChange={(e) => {
                          setOverrides({ ...overrides, [l.number]: e.target.value.replace(",", ".") });
                          setRejected(new Set());
                        }}
                        className={`h-10 min-w-0 flex-1 rounded-lg border-2 px-3 text-right outline-none focus:border-brand ${message ? "border-danger" : "border-line"}`}
                      />
                      <button type="button" aria-label={`Remove ${l.number}`} onClick={() => setRemoved(new Set(removed).add(l.number))} className="h-10 w-10 rounded-lg text-xl text-muted hover:bg-slate-100">
                        ×
                      </button>
                    </div>
                    {message && (
                      <p role="alert" className="mt-1 text-sm text-danger" data-testid="line-error">
                        {message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {previewError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
            {previewError}
          </p>
        )}
        {preview && preview.closed_games.length > 0 && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
            Sales just closed for {preview.closed_games.join(", ")}. Unselect it to continue.
          </p>
        )}
        {buyError && !confirming && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger" data-testid="buy-error">
            {buyError.message}
            {buyError.code === "insufficient_balance" && (
              <>
                {" "}
                <Link to="/balance" className="font-bold underline">
                  Top up
                </Link>
              </>
            )}
          </p>
        )}
      </main>

      {/* Sticky total and Confirm */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white px-5 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:left-64">
        <div className="mx-auto flex max-w-md items-center gap-4 lg:max-w-6xl lg:px-8">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted">
              {games.size === 0 ? "Pick a game" : lines.length === 0 ? "Type a number" : `${games.size} ${games.size === 1 ? "game" : "games"} × ${lines.length} ${lines.length === 1 ? "number" : "numbers"}`}
            </div>
            <div className="text-2xl font-extrabold" data-testid="total">
              {previewing ? "…" : preview ? `XCG ${preview.total}` : "XCG 0.00"}
            </div>
            {preview && !preview.enough_balance && !previewing && (
              <div className="text-xs text-danger" data-testid="low-balance">
                Balance {wallet ? fmtXcg(wallet.balance_cents) : ""} is not enough.{" "}
                <Link to="/balance" className="font-bold underline">
                  Top up
                </Link>
              </div>
            )}
          </div>
          <button type="button" data-testid="confirm" disabled={!canConfirm} onClick={openConfirm} className="h-14 rounded-xl bg-ok px-6 text-lg font-extrabold text-white disabled:opacity-40">
            Confirm Purchase
          </button>
        </div>
      </div>

      {confirming && preview && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 lg:items-center" role="dialog" aria-modal="true" aria-label="Confirm purchase">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 lg:rounded-3xl">
            <h2 className="text-xl font-extrabold">Confirm your purchase</h2>
            <dl className="mt-3 grid grid-cols-[1fr_auto] gap-y-1 text-sm">
              <dt className="text-muted">Games</dt>
              <dd className="font-semibold">{[...games].sort().join(", ")}</dd>
              <dt className="text-muted">Numbers</dt>
              <dd className="font-semibold">{lines.length}</dd>
              <dt className="text-muted">Entries ({games.size} × {lines.length})</dt>
              <dd className="font-semibold">{preview.entries_count}</dd>
              <dt className="text-muted">Balance now</dt>
              <dd className="font-semibold">{fmtXcg(preview.balance_cents)}</dd>
              <dt className="text-muted">Balance after</dt>
              <dd className="font-semibold">{fmtXcg(preview.balance_cents - preview.total_cents)}</dd>
            </dl>
            <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
              <span className="text-muted">Total to pay</span>
              <span className="text-2xl font-extrabold" data-testid="confirm-total">
                XCG {preview.total}
              </span>
            </div>
            {buyError && (
              <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-danger" data-testid="confirm-error">
                {buyError.message}
                {buyError.code === "network_error" && " Tap Pay again: you will not be charged twice."}
              </p>
            )}
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={() => setConfirming(false)} disabled={busy} className="h-12 rounded-xl px-5 font-bold text-muted">
                Back
              </button>
              <button type="button" data-testid="pay" onClick={() => void buy()} disabled={busy} className="h-12 flex-1 rounded-xl bg-ok font-extrabold text-white disabled:opacity-60">
                {busy ? "Paying…" : `Pay XCG ${preview.total}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {ticket && <TicketSheet ticket={ticket} justBought onClose={() => setTicket(null)} />}
    </>
  );
}

function NamePrompt({ onSaved, welcome }: { onSaved: (c: Customer) => void; welcome: boolean }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (saving || name.trim().length < 2) return;
    setSaving(true);
    setError(null);
    try {
      onSaved(await api.patch<Customer>("me", { name: name.trim() }));
    } catch (err) {
      setError((err as ApiError).field("name") ?? (err as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="grid gap-3 lg:max-w-md rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div>
        <div className="font-bold">{welcome ? "Welcome to HopiSuerte!" : "Add your name"}</div>
        <div className="text-sm text-muted">What should we call you? (optional)</div>
      </div>
      <input
        aria-label="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        placeholder="Your name"
        className="h-12 rounded-xl border-2 border-line px-4 outline-none focus:border-brand"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving || name.trim().length < 2} className="h-11 flex-1 rounded-xl bg-brand font-bold text-white disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setHidden(true)} className="h-11 rounded-xl px-4 text-muted">
          Skip
        </button>
      </div>
    </form>
  );
}
