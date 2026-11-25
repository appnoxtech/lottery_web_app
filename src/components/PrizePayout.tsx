import { useState } from "react";
import { Spinner } from "./Icons";
import { ErrorNote } from "./ui";
import { api, ApiError } from "../lib/api";
import { ACCOUNT_TYPES, BANKS, maskAccount } from "../lib/prize";
import type { BankDetails, MyPrize } from "../lib/types";

const AMOUNT = /^\d{1,9}(\.\d{1,2})?$/;
const NAME = /^\p{L}[\p{L}\p{M} .'-]*$/u;
// Letters and digits only once spaces, dots, dashes and slashes are ignored; 5 to 34 long (the IBAN maximum). Same rule as the server.
const compactAccount = (n: string) => n.replace(/[\s.\-/]/g, "");
const EMPTY: BankDetails = { bank_name: "", account_holder: "", account_number: "", account_type: "" };

const accountProblem = (raw: string): string | null => {
  if (!raw.trim()) return "Enter your account number.";
  const c = compactAccount(raw);
  if (!/^[A-Za-z0-9]+$/.test(c)) return "Use only letters and numbers (spaces and dashes are fine).";
  if (c.length < 5 || c.length > 34) return "The account number must be 5 to 34 characters. Check it against your bank card or statement.";
  return null;
};

const bankProblems = (b: BankDetails) => ({
  bank_name: b.bank_name.trim().length >= 2 ? null : "Enter the name of your bank.",
  account_holder: !b.account_holder.trim() ? "Enter the name on the account." : b.account_holder.trim().length < 2 || !NAME.test(b.account_holder.trim()) ? "Use the full name, with letters only." : null,
  account_number: accountProblem(b.account_number),
});

/**
 * Lets a winner say how much of a waiting prize should go to the balance; the rest is paid out to them by bank
 * transfer, so the bank details are asked here (and can be saved for next time). It is only a request: the team
 * settles the prize and can still follow what was agreed on WhatsApp. It can be changed until then.
 */
export default function PrizePayout({ prize, onSaved }: { prize: MyPrize; onSaved: (p: MyPrize) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [bank, setBank] = useState<BankDetails>(EMPTY);
  const [otherOpen, setOtherOpen] = useState<{ bank_name?: boolean; account_type?: boolean }>({});
  const [save, setSave] = useState(true);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingBank, setLoadingBank] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  if (prize.status !== "pending") return null;

  const valid = AMOUNT.test(value.trim()) && Number(value) <= Number(prize.amount);
  const rest = valid ? (Number(prize.amount) - Number(value)).toFixed(2) : null;
  const needsBank = valid && Number(rest) > 0;
  const problems = bankProblems(bank);
  const bankOk = !needsBank || !Object.values(problems).some(Boolean);
  const fieldError = (name: keyof typeof problems) => (touched ? problems[name] : null) ?? (error instanceof ApiError ? error.field(name) : undefined);

  const start = async () => {
    setValue(prize.credit ?? prize.amount);
    setError(null);
    setTouched(false);
    setOtherOpen({});
    setSave(true);
    setBank(prize.bank ? { ...EMPTY, ...prize.bank, account_type: prize.bank.account_type ?? "" } : EMPTY);
    setEditing(true);
    // The details saved last time are filled in, so a returning winner only has to confirm them.
    if (!prize.bank) {
      setLoadingBank(true);
      try {
        const saved = await api.get<BankDetails | null>("payout-account");
        if (saved) setBank({ ...EMPTY, ...saved, account_type: saved.account_type ?? "" });
      } catch {
        // Not saved or not reachable: the form is just empty.
      } finally {
        setLoadingBank(false);
      }
    }
  };

  const submit = async () => {
    setTouched(true);
    if (busy || !valid || !bankOk) return;
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { amount: value.trim() };
      if (needsBank) {
        Object.assign(body, {
          bank_name: bank.bank_name.trim(),
          account_holder: bank.account_holder.trim(),
          account_number: bank.account_number.trim(),
          account_type: bank.account_type?.trim() || null,
          save_account: save,
        });
      }
      onSaved(await api.put<MyPrize>(`prizes/${prize.id}/payout`, body));
      setEditing(false);
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <div className="grid gap-2 text-sm text-ink-700">
        {prize.credit !== null && (
          <p data-testid="payout-choice">
            Your choice: XCG {prize.credit} to your balance, XCG {prize.cash} paid out to you.
          </p>
        )}
        {prize.bank && Number(prize.cash) > 0 && (
          <p data-testid="payout-bank">
            Paid out to: {prize.bank.bank_name}, {prize.bank.account_holder}, {maskAccount(prize.bank.account_number)}
          </p>
        )}
        <button type="button" onClick={() => void start()} data-testid="payout-choose" className="btn-secondary h-10 justify-self-start px-4">
          {prize.credit === null ? "Choose how to get paid" : "Change"}
        </button>
      </div>
    );
  }

  const text = (name: keyof BankDetails, label: string, extra?: { optional?: boolean; autoComplete?: string; inputMode?: "text" | "numeric" }) => (
    <div className="grid gap-1">
      <label htmlFor={`bank-${prize.id}-${name}`} className="text-sm font-semibold text-ink">
        {label}
        {extra?.optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      <input
        id={`bank-${prize.id}-${name}`}
        data-testid={`bank-${name}`}
        value={bank[name] ?? ""}
        disabled={loadingBank}
        maxLength={name === "account_number" ? 50 : name === "account_type" ? 30 : name === "bank_name" ? 80 : 120}
        autoComplete={extra?.autoComplete ?? "off"}
        onChange={(e) => setBank((b) => ({ ...b, [name]: e.target.value }))}
        aria-invalid={!!fieldError(name as keyof typeof problems) || undefined}
        className="field h-11 w-full"
      />
      {fieldError(name as keyof typeof problems) && <p className="text-xs text-danger">{fieldError(name as keyof typeof problems)}</p>}
    </div>
  );

  const OTHER = "__other__";
  /** A real dropdown. A value that is not in the list (a saved bank, or one typed under "Other") shows as "Other" with a text box. */
  const choice = (name: "bank_name" | "account_type", label: string, options: string[], opts: { optional?: boolean; otherLabel?: string; emptyLabel?: string }) => {
    const current = bank[name] ?? "";
    const other = otherOpen[name] || (current !== "" && !options.includes(current));
    const id = `bank-${prize.id}-${name}`;
    const err = fieldError(name as keyof typeof problems);
    return (
      <div className="grid gap-1">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
          {opts.optional && <span className="font-normal text-muted"> (optional)</span>}
        </label>
        <select
          id={id}
          data-testid={`bank-${name}`}
          value={other ? OTHER : current}
          disabled={loadingBank}
          aria-invalid={!!err || undefined}
          onChange={(e) => {
            const v = e.target.value;
            if (v === OTHER) {
              setOtherOpen((o) => ({ ...o, [name]: true }));
              setBank((b) => ({ ...b, [name]: options.includes(b[name] ?? "") ? "" : b[name] ?? "" }));
            } else {
              setOtherOpen((o) => ({ ...o, [name]: false }));
              setBank((b) => ({ ...b, [name]: v }));
            }
          }}
          className="field h-11 w-full"
        >
          <option value="">{opts.emptyLabel ?? "Choose..."}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
          <option value={OTHER}>{opts.otherLabel ?? "Other"}</option>
        </select>
        {other && (
          <input
            data-testid={`bank-${name}-other`}
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
    <div className="grid gap-2 text-sm text-ink-700">
      <label htmlFor={`payout-${prize.id}`} className="font-semibold text-ink">
        How much do you want in your balance?
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-muted">XCG</span>
        <input
          id={`payout-${prize.id}`}
          data-testid="payout-amount"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(",", "."))}
          aria-invalid={!valid || undefined}
          className="field h-11 w-full pl-12 text-right font-semibold"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setValue(prize.amount)} className="h-8 rounded-full border border-ink-300 bg-white px-3 text-xs font-semibold text-ink-700 hover:bg-ink-100">
          All to my balance
        </button>
        <button type="button" onClick={() => setValue("0")} className="h-8 rounded-full border border-ink-300 bg-white px-3 text-xs font-semibold text-ink-700 hover:bg-ink-100">
          All paid out to me
        </button>
      </div>
      <p>{valid ? (needsBank ? `XCG ${rest} is paid out to you by bank transfer.` : "All of it goes to your balance.") : `Enter an amount from 0 to ${prize.amount}.`}</p>

      {needsBank && (
        <fieldset className="grid gap-3 rounded-xl border border-ink-300 p-3" data-testid="bank-form">
          <legend className="px-1 font-semibold text-ink">Where should we send XCG {rest}?</legend>
          {choice("bank_name", "Bank", BANKS, { otherLabel: "Other bank (type it)", emptyLabel: "Choose your bank" })}
          {text("account_holder", "Name on the account", { autoComplete: "name" })}
          {text("account_number", "Account number")}
          {choice("account_type", "Account type", ACCOUNT_TYPES, { optional: true, otherLabel: "Other (type it)", emptyLabel: "Not specified" })}
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} data-testid="bank-save" className="h-4 w-4" />
            Save these details for next time
          </label>
        </fieldset>
      )}

      {error && !(error instanceof ApiError && error.details) && <ErrorNote>{error.message}</ErrorNote>}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setEditing(false)} disabled={busy} className="btn-secondary h-10">
          Cancel
        </button>
        <button type="button" onClick={() => void submit()} disabled={busy || !valid || (touched && !bankOk)} data-testid="payout-save" className="btn-primary h-10">
          {busy && <Spinner />}
          Save
        </button>
      </div>
    </div>
  );
}
