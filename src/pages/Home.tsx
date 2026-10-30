import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckIcon, ClockIcon, CloseIcon, Spinner } from "../components/Icons";
import TicketSheet from "../components/TicketSheet";
import { ErrorNote, Loading, PageTitle, Sheet } from "../components/ui";
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
      <main className="grid gap-4 px-4 pt-5 pb-40 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-5 lg:px-0 lg:pt-0 lg:pb-24 lg:short:gap-4">
        <div className="lg:col-span-2">
          <PageTitle
            title="Play"
            subtitle={
              earliest && now !== null ? (
                <span data-testid="closing-note" className="inline-flex flex-wrap items-center gap-x-1.5">
                  <ClockIcon size={16} className="text-brand" />
                  Earliest closing: <b className="text-ink">{fmtTime(earliest.closes_at, now)}</b> ·{" "}
                  <b className="text-ink">{fmtCountdown((new Date(earliest.closes_at).getTime() - now) / 1000)}</b> left (Curaçao time)
                </span>
              ) : (
                "Choose games, pick the digits and type your numbers."
              )
            }
          />
        </div>

        {!customer.name && (
          <div className="lg:col-span-2 empty:hidden">
            <NamePrompt onSaved={setCustomer} welcome={isNew} />
          </div>
        )}

        {repeatNote && (
          <p role="status" data-testid="repeat-note" className="alert-info lg:col-span-2">
            {repeatNote}
          </p>
        )}

        {loadError && (
          <div className="lg:col-span-2 empty:hidden">
            <ErrorNote>{loadError}</ErrorNote>
          </div>
        )}

        <div className="grid gap-4 lg:gap-5 lg:short:gap-4">
          {/* 1. Games */}
          <section aria-label="Games" className="card grid gap-3 p-4 sm:p-5 lg:short:p-4">
            <StepTitle n={1} title="Choose games" />
            {rules === null && !loadError && <Loading label="Loading games…" />}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
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
                    className={`relative flex min-h-[72px] flex-col lg:min-h-[64px] lg:short:min-h-[56px] lg:short:py-1.5 items-start justify-center rounded-[14px] border-2 px-3 py-2 text-left transition ${
                      on ? "border-brand bg-brand bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm" : "border-line bg-white enabled:hover:border-brand-200"
                    } disabled:border-dashed disabled:bg-ink-100`}
                  >
                    <span className={`font-display text-lg leading-tight font-extrabold ${on ? "text-gold-400" : g.is_open ? "text-ink" : "text-ink-400"}`}>{g.code}</span>
                    <span className={`w-full truncate pr-5 text-xs font-medium ${on ? "text-white" : g.is_open ? "text-ink-700" : "text-ink-400"}`}>{g.name}</span>
                    {!g.is_open ? (
                      <span className="mt-0.5 text-[11px] font-bold tracking-wide text-ink-400 uppercase">closed</span>
                    ) : (
                      g.draw && now !== null && <span className={`mt-0.5 text-[11px] font-semibold ${on ? "text-white/80" : "text-muted"}`}>closes {fmtTime(g.draw.closes_at, now)}</span>
                    )}
                    {on && (
                      <span className="absolute top-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-white text-brand" aria-hidden="true">
                        <CheckIcon size={13} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {rules && openGames.length === 0 && <p className="text-sm text-muted">No game is open for sales right now. Opening times are in Curaçao time.</p>}
          </section>

          {/* 2. Digits */}
          <section aria-label="Digits" className="card grid gap-3 p-4 sm:p-5 lg:short:p-4">
            <StepTitle n={2} title="How many digits?" />
            <div className="grid grid-cols-3 gap-1 rounded-[14px] bg-ink-100 p-1">
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
                  className={`flex h-12 items-center justify-center gap-1.5 rounded-[10px] font-bold lg:h-11 lg:short:h-10 transition ${digits.has(d) ? "bg-brand text-white shadow-sm" : "text-ink-700 hover:bg-white/70"}`}
                >
                  {digits.has(d) && <CheckIcon size={16} />}
                  {d} digits
                </button>
              ))}
            </div>
            <p className="text-sm text-muted">Pick 4, 3 and 2 to play a 4-digit number on its last 3 and last 2 digits too.</p>
          </section>
        </div>

        <div className="grid gap-4 lg:gap-5 lg:short:gap-4">
          {/* 3. Numbers */}
          <section aria-label="Numbers" className="card grid gap-3 p-4 sm:p-5 lg:short:p-4">
            <StepTitle n={3} title="Type your numbers" />
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
              aria-invalid={unreadable.length > 0 || undefined}
              className="field resize-y py-3 font-mono text-lg tracking-wide"
            />
            <p className="text-xs text-muted">
              Separate numbers with spaces. Add <b className="font-mono text-ink">x</b> and an amount to change it: <span className="font-mono text-ink">1234x2</span> plays XCG 2.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-ink-100 px-3 py-2">
              <label htmlFor="default-stake" className="text-sm text-ink-700">
                Amount when you do not type one (x2):
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-muted">XCG</span>
                <input
                  id="default-stake"
                  data-testid="default-stake"
                  inputMode="decimal"
                  value={defaultStake}
                  onChange={(e) => setDefaultStake(e.target.value.replace(",", "."))}
                  aria-invalid={!isValidStake(defaultStake) || undefined}
                  className="field h-11 w-32 pl-12 text-right font-semibold"
                />
              </div>
            </div>
            {unreadable.length > 0 && <p className="text-sm text-danger">Cannot read: {unreadable.join(", ")}. Use 2 to 4 digits, optionally followed by x and an amount, like 1234x2.</p>}
            {derived.ignored.length > 0 && <p className="text-sm text-warn-ink">Not used with the digits selected: {derived.ignored.join(", ")}.</p>}
          </section>

          {/* 4. Lines */}
          {lines.length > 0 && (
            <section aria-label="Your numbers" className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
                <h2 className="section-title">Your numbers</h2>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">{lines.length}</span>
              </div>
              {lines.map((l) => {
                const server = problemOf(l.number);
                const message = !isValidStake(l.stake) ? "Enter an amount, for example 1 or 0.50." : rejected.has(l.number) ? `The number ${l.number} is sold out.` : server?.message;
                return (
                  <div key={l.number} data-testid="line" className={`border-b border-line px-4 py-3 last:border-b-0 sm:px-5 ${message ? "bg-danger-soft/50" : ""}`}>
                    <div className="flex items-center gap-3">
                      <span className="min-w-[4.5rem] rounded-[10px] bg-brand-50 px-2 py-1.5 text-center font-mono text-xl font-extrabold tracking-widest text-brand-800">{l.number}</span>
                      <span className="w-12 text-xs leading-tight text-muted">{l.digits} digits</span>
                      <div className="relative min-w-0 flex-1">
                        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-muted">XCG</span>
                        <input
                          aria-label={`Amount for ${l.number}`}
                          inputMode="decimal"
                          value={l.stake}
                          onChange={(e) => {
                            setOverrides({ ...overrides, [l.number]: e.target.value.replace(",", ".") });
                            setRejected(new Set());
                          }}
                          aria-invalid={!!message || undefined}
                          className="field h-11 w-full pl-12 text-right font-semibold"
                        />
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${l.number}`}
                        onClick={() => setRemoved(new Set(removed).add(l.number))}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] text-muted hover:bg-danger-soft hover:text-danger"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                    {message && (
                      <p role="alert" className="mt-1.5 text-sm text-danger" data-testid="line-error">
                        {message}
                      </p>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {previewError && <ErrorNote>{previewError}</ErrorNote>}
          {preview && preview.closed_games.length > 0 && <ErrorNote>Sales just closed for {preview.closed_games.join(", ")}. Unselect it to continue.</ErrorNote>}
          {buyError && !confirming && (
            <ErrorNote testId="buy-error">
              {buyError.message}
              {buyError.code === "insufficient_balance" && (
                <>
                  {" "}
                  <Link to="/balance" className="font-bold underline">
                    Top up
                  </Link>
                </>
              )}
            </ErrorNote>
          )}
        </div>
      </main>

      {/* Sticky total and Confirm. On phones it sits on top of the tab bar. */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-6px_20px_rgba(20,33,61,0.08)] backdrop-blur lg:bottom-0 lg:left-64">
        <div className="mx-auto flex max-w-md items-center gap-4 lg:max-w-[1400px] lg:px-8">
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs text-muted">
              {games.size === 0 ? "Pick a game" : lines.length === 0 ? "Type a number" : `${games.size} ${games.size === 1 ? "game" : "games"} × ${lines.length} ${lines.length === 1 ? "number" : "numbers"}`}
            </div>
            <div className="font-display text-2xl font-extrabold tracking-tight" data-testid="total">
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
          <button type="button" data-testid="confirm" disabled={!canConfirm} onClick={openConfirm} className="btn-buy h-14 shrink-0 px-5 text-base sm:px-7 sm:text-lg">
            Confirm Purchase
          </button>
        </div>
      </div>

      {confirming && preview && (
        <Sheet label="Confirm purchase" onClose={() => !busy && setConfirming(false)}>
          <h2 className="font-display text-xl font-bold">Confirm your purchase</h2>
          <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2 rounded-[14px] bg-ink-100 p-4 text-sm">
            <dt className="text-muted">Games</dt>
            <dd className="text-right font-semibold">{[...games].sort().join(", ")}</dd>
            <dt className="text-muted">Numbers</dt>
            <dd className="text-right font-semibold">{lines.length}</dd>
            <dt className="text-muted">Entries ({games.size} × {lines.length})</dt>
            <dd className="text-right font-semibold">{preview.entries_count}</dd>
            <dt className="text-muted">Balance now</dt>
            <dd className="text-right font-semibold">{fmtXcg(preview.balance_cents)}</dd>
            <dt className="text-muted">Balance after</dt>
            <dd className="text-right font-semibold">{fmtXcg(preview.balance_cents - preview.total_cents)}</dd>
          </dl>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-muted">Total to pay</span>
            <span className="font-display text-3xl font-extrabold tracking-tight" data-testid="confirm-total">
              XCG {preview.total}
            </span>
          </div>
          {buyError && (
            <p role="alert" className="alert-error mt-3" data-testid="confirm-error">
              {buyError.message}
              {buyError.code === "network_error" && " Tap Pay again: you will not be charged twice."}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={() => setConfirming(false)} disabled={busy} className="btn-secondary h-14 px-5">
              Back
            </button>
            <button type="button" data-testid="pay" onClick={() => void buy()} disabled={busy} className="btn-buy h-14 flex-1 text-lg">
              {busy && <Spinner />}
              {busy ? "Paying…" : `Pay XCG ${preview.total}`}
            </button>
          </div>
        </Sheet>
      )}

      {ticket && <TicketSheet ticket={ticket} justBought onClose={() => setTicket(null)} />}
    </>
  );
}

/** Numbered step heading; screen readers hear "1. Choose games". */
function StepTitle({ n, title }: { n: number; title: string }) {
  return (
    <h2 className="section-title flex items-center gap-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold-400 text-sm font-extrabold text-brand-800" aria-hidden="true">
        {n}
      </span>
      <span>
        <span className="sr-only">{n}. </span>
        {title}
      </span>
    </h2>
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
    <form onSubmit={save} className="card grid gap-3 border-gold-400/50 bg-gradient-to-br from-gold-100 to-white p-4 sm:p-5 lg:max-w-xl">
      <div>
        <div className="font-display font-bold">{welcome ? "Welcome to HopiSuerte!" : "Add your name"}</div>
        <div className="text-sm text-muted">What should we call you? (optional)</div>
      </div>
      <input
        aria-label="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        placeholder="Your name"
        className="field h-12"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving || name.trim().length < 2} className="btn-primary h-12 flex-1">
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setHidden(true)} className="btn-ghost h-12 px-5">
          Skip
        </button>
      </div>
    </form>
  );
}
