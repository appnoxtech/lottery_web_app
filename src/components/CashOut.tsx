import { useCallback, useEffect, useState } from "react";
import { Spinner } from "./Icons";
import { ErrorNote, Sheet, Loading } from "./ui";
import { api, ApiError } from "../lib/api";
import { fmtXcg } from "../lib/money";
import { fmtDateTime } from "../lib/time";
import { ACCOUNT_TYPES, BANKS, maskAccount } from "../lib/prize";
import type { BankDetails, Cashout, CashoutList, CashoutStatus } from "../lib/types";

const AMOUNT = /^\d{1,9}(\.\d{1,2})?$/;
const NAME = /^\p{L}[\p{L}\p{M} .'-]*$/u;
// Letters and digits only once spaces, dots, dashes and slashes are ignored; 5 to 34 long (the IBAN maximum). Same rule as the server.
const compactAccount = (n: string) => n.replace(/[\s.\-/]/g, "");
const EMPTY: BankDetails = { bank_name: "", account_holder: "", account_number: "", account_type: "" };
const OTHER = "__other__";

const STATUS: Record<CashoutStatus, { label: string; style: string }> = {
  pending: { label: "Waiting to be paid", style: "bg-gold-100 text-gold-ink" },
  paid: { label: "Paid", style: "bg-ok-soft text-ok-ink" },
  rejected: { label: "Not paid, returned to balance", style: "bg-ink-100 text-ink-700" },
  cancelled: { label: "Cancelled", style: "bg-ink-100 text-ink-700" },
};

const accountProblem = (raw: string): string | null => {
  if (!raw.trim()) return "Enter your account number.";
  const c = compactAccount(raw);
  if (!/^[A-Za-z0-9]+$/.test(c)) return "Use only letters and numbers (spaces and dashes are fine).";
  if (c.length < 5 || c.length > 34) return "The account number must be 5 to 34 characters. Check it against your bank card or statement.";
  return null;
};

function Proof({ cashout }: { cashout: Cashout }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let live = true;
    let made: string | null = null;
    setUrl(null);
    setError(null);
    api
      .blob(`cashouts/${cashout.id}/proof`)
      .then((b) => {
        made = URL.createObjectURL(b);
        if (live) setUrl(made);
        else URL.revokeObjectURL(made);
      })
      .catch((e) => live && setError((e as ApiError).message));
    return () => {
      live = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [open, cashout.id]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} data-testid="cashout-proof-open" className="btn-secondary h-9 justify-self-start px-3 text-sm">
        View proof of payment
      </button>
      {open && (
        <Sheet label="Proof of payment" onClose={() => setOpen(false)}>
          <div className="grid gap-3">
            <h3 className="font-display text-lg font-extrabold">Proof of payment</h3>
            <p className="text-sm text-ink-700">XCG {cashout.amount} sent to your bank account by the HopiSuerte team.</p>
            {!url && !error && <Loading label="Loading…" />}
            {error && <ErrorNote>{error}</ErrorNote>}
            {url && <img src={url} alt="Screenshot of the payment" className="max-h-[60vh] w-full rounded-lg border border-line object-contain" />}
            <button type="button" onClick={() => setOpen(false)} className="btn-primary h-11">
              Close
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
}

/**
 * Cash out: winnings and top-ups sit in the balance, and the customer takes out the amount they choose as a bank transfer.
 * The amount leaves the balance when they ask; the team pays it and marks it paid, or returns it with a reason.
 */
export default function CashOut({ balanceCents, onChanged }: { balanceCents: number; onChanged: () => void }) {
  const [list, setList] = useState<CashoutList | null>(null);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState<BankDetails>(EMPTY);
  const [otherOpen, setOtherOpen] = useState<{ bank_name?: boolean; account_type?: boolean }>({});
  const [save, setSave] = useState(true);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setList(await api.get<CashoutList>("cashouts?per_page=5"));
    } catch {
      setList(null);
    }
  }, []);
  useEffect(() => void load(), [load]);

  const cents = AMOUNT.test(amount.trim()) ? Math.round(Number(amount) * 100) : null;
  const minCents = list ? Math.round(Number(list.min) * 100) : 50;
  const amountProblem =
    cents === null
      ? "Enter an amount, for example 25 or 25.50."
      : cents < minCents
        ? `The smallest amount is XCG ${list?.min ?? "0.50"}.`
        : cents > balanceCents
          ? `You only have ${fmtXcg(balanceCents)} in your balance.`
          : null;
  const problems = {
    bank_name: bank.bank_name.trim().length >= 2 ? null : "Enter the name of your bank.",
    account_holder: !bank.account_holder.trim() ? "Enter the name on the account." : bank.account_holder.trim().length < 2 || !NAME.test(bank.account_holder.trim()) ? "Use the full name, with letters only." : null,
    account_number: accountProblem(bank.account_number),
  };
  const bankOk = !Object.values(problems).some(Boolean);
  const fieldError = (name: keyof typeof problems) => (touched ? problems[name] : null) ?? (error instanceof ApiError ? error.field(name) : undefined);

  const start = async () => {
    setOpen(true);
    setDone(null);
    setError(null);
    setTouched(false);
    setOtherOpen({});
    setAmount("");
    setLoadingBank(true);
    try {
      // The details saved last time are filled in, so a returning customer only has to confirm them.
      const saved = await api.get<BankDetails | null>("payout-account");
      setBank(saved ? { ...EMPTY, ...saved, account_type: saved.account_type ?? "" } : EMPTY);
    } catch {
      setBank(EMPTY);
    } finally {
      setLoadingBank(false);
    }
  };

  const submit = async () => {
    setTouched(true);
    if (busy || amountProblem || !bankOk) return;
    setBusy(true);
    setError(null);
    try {
      await api.post("cashouts", {
        amount: amount.trim(),
        bank_name: bank.bank_name.trim(),
        account_holder: bank.account_holder.trim(),
        account_number: bank.account_number.trim(),
        account_type: bank.account_type?.trim() || null,
        save_account: save,
      });
      setDone(`Your cash out of XCG ${Number(amount).toFixed(2)} was sent to the team. We tell you here when it is paid.`);
      setOpen(false);
      await load();
      onChanged();
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (c: Cashout) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`cashouts/${c.id}/cancel`, {});
      setDone(`Cancelled. XCG ${c.amount} is back in your balance.`);
      await load();
      onChanged();
    } catch (e) {
      setError(e as ApiError);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const text = (name: keyof BankDetails, label: string, autoComplete = "off") => (
    <div className="grid gap-1">
      <label htmlFor={`cashout-${name}`} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={`cashout-${name}`}
        data-testid={`cashout-${name}`}
        value={bank[name] ?? ""}
        disabled={loadingBank}
        maxLength={name === "account_number" ? 50 : 120}
        autoComplete={autoComplete}
        onChange={(e) => setBank((b) => ({ ...b, [name]: e.target.value }))}
        aria-invalid={!!fieldError(name as keyof typeof problems) || undefined}
        className="field h-11 w-full"
      />
      {fieldError(name as keyof typeof problems) && <p className="text-xs text-danger">{fieldError(name as keyof typeof problems)}</p>}
    </div>
  );

  /** A real dropdown. A value that is not in the list (a saved bank, or one typed under "Other") shows as "Other" with a text box. */
  const choice = (name: "bank_name" | "account_type", label: string, options: string[], opts: { optional?: boolean; otherLabel: string; emptyLabel: string }) => {
    const current = bank[name] ?? "";
    const other = otherOpen[name] || (current !== "" && !options.includes(current));
    const err = fieldError(name as keyof typeof problems);
    return (
      <div className="grid gap-1">
        <label htmlFor={`cashout-${name}`} className="text-sm font-semibold text-ink">
          {label}
          {opts.optional && <span className="font-normal text-muted"> (optional)</span>}
        </label>
        <select
          id={`cashout-${name}`}
          data-testid={`cashout-${name}`}
          value={other ? OTHER : current}
          disabled={loadingBank}
          aria-invalid={!!err || undefined}
          onChange={(e) => {
            const v = e.target.value;
            if (v === OTHER) {
              setOtherOpen((o) => ({ ...o, [name]: true }));
              setBank((b) => ({ ...b, [name]: options.includes(b[name] ?? "") ? "" : (b[name] ?? "") }));
            } else {
              setOtherOpen((o) => ({ ...o, [name]: false }));
              setBank((b) => ({ ...b, [name]: v }));
            }
          }}
          className="field h-11 w-full"
        >
          <option value="">{opts.emptyLabel}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
          <option value={OTHER}>{opts.otherLabel}</option>
        </select>
        {other && (
          <input
            aria-label={label}
            value={current}
            maxLength={name === "bank_name" ? 80 : 30}
            autoComplete="off"
            placeholder={name === "bank_name" ? "Type the name of your bank" : "Type the account type"}
            onChange={(e) => setBank((b) => ({ ...b, [name]: e.target.value }))}
            className="field h-11 w-full"
          />
        )}
        {err && <p className="text-xs text-danger">{err}</p>}
      </div>
    );
  };

  return (
    <section className="card grid gap-3 p-4" aria-label="Cash out" data-testid="cashout">
      <div>
        <h2 className="font-display text-lg font-extrabold">Cash out</h2>
        <p className="text-sm text-ink-700">Winnings go into your balance by themselves. Take out as much as you want, whenever you want, as a bank transfer.</p>
      </div>
      {done && (
        <div role="status" className="rounded-lg bg-ok-soft p-3 text-sm text-ok-ink" data-testid="cashout-done">
          {done}
        </div>
      )}

      {!open ? (
        <button type="button" onClick={() => void start()} disabled={balanceCents < minCents} data-testid="cashout-start" className="btn-secondary h-11">
          {balanceCents < minCents ? "Not enough balance to cash out" : "Cash out"}
        </button>
      ) : (
        <div className="grid gap-3">
          <div className="grid gap-1">
            <label htmlFor="cashout-amount" className="text-sm font-semibold text-ink">
              How much do you want to cash out?
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-muted">XCG</span>
              <input
                id="cashout-amount"
                data-testid="cashout-amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(",", "."))}
                aria-invalid={(touched && !!amountProblem) || undefined}
                className="field h-11 w-full pl-12 text-right font-semibold"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setAmount((balanceCents / 100).toFixed(2))} className="h-11 rounded-full border border-ink-300 bg-white px-3 text-xs font-semibold text-ink-700 hover:bg-ink-100">
                All ({fmtXcg(balanceCents)})
              </button>
              <span className="text-xs text-muted">Smallest amount: XCG {list?.min ?? "0.50"}</span>
            </div>
            {touched && amountProblem && <p className="text-xs text-danger">{amountProblem}</p>}
          </div>

          <fieldset className="grid gap-3 rounded-xl border border-ink-300 p-3" data-testid="cashout-bank-form">
            <legend className="px-1 text-sm font-semibold text-ink">Where should we send it?</legend>
            {choice("bank_name", "Bank", BANKS, { otherLabel: "Other bank (type it)", emptyLabel: "Choose your bank" })}
            {text("account_holder", "Name on the account", "name")}
            {text("account_number", "Account number")}
            {choice("account_type", "Account type", ACCOUNT_TYPES, { optional: true, otherLabel: "Other (type it)", emptyLabel: "Not specified" })}
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} data-testid="cashout-save" className="h-4 w-4" />
              Save these details for next time
            </label>
          </fieldset>
          <p className="text-xs text-muted">The amount leaves your balance now. If we cannot pay it, it comes back with the reason, and you can cancel while it is waiting.</p>
          {error && !(error instanceof ApiError && error.details) && <ErrorNote>{error.message}</ErrorNote>}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setOpen(false)} disabled={busy} className="btn-secondary h-11">
              Back
            </button>
            <button type="button" onClick={() => void submit()} disabled={busy || (touched && (!!amountProblem || !bankOk))} data-testid="cashout-submit" className="btn-primary h-11">
              {busy && <Spinner />}
              Ask for cash out
            </button>
          </div>
        </div>
      )}

      {!open && error && <ErrorNote>{error.message}</ErrorNote>}

      {list && list.items.length > 0 && (
        <div className="grid gap-2" data-testid="cashout-list">
          <h3 className="text-sm font-semibold text-ink">Your cash outs</h3>
          {list.items.map((c) => (
            <article key={c.id} className="grid gap-1.5 rounded-xl border border-line p-3 text-sm" data-testid="cashout-item">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold">XCG {c.amount}</div>
                  <div className="text-xs text-muted">{fmtDateTime(c.created_at)}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[c.status].style}`}>{STATUS[c.status].label}</span>
              </div>
              {c.bank && (
                <div className="text-xs text-ink-700">
                  To {c.bank.bank_name}, {c.bank.account_holder}, {maskAccount(c.bank.account_number)}
                </div>
              )}
              {c.reason && <div className="text-xs text-ink-700">Reason: {c.reason}</div>}
              {c.status === "pending" && (
                <button type="button" onClick={() => void cancel(c)} disabled={busy} data-testid="cashout-cancel" className="btn-secondary h-11 justify-self-start px-3 text-sm">
                  Cancel and keep it in my balance
                </button>
              )}
              {c.has_proof && <Proof cashout={c} />}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
