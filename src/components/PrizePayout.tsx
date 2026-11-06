import { useState } from "react";
import { Spinner } from "./Icons";
import { ErrorNote } from "./ui";
import { api, ApiError } from "../lib/api";
import type { MyPrize } from "../lib/types";

const AMOUNT = /^\d{1,9}(\.\d{1,2})?$/;

/**
 * Lets a winner say how much of a waiting prize should go to the balance; the rest is paid out to them. It is only a
 * request: the team settles the prize and can still follow what was agreed on WhatsApp. It can be changed until then.
 */
export default function PrizePayout({ prize, onSaved }: { prize: MyPrize; onSaved: (p: MyPrize) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (prize.status !== "pending") return null;

  const valid = AMOUNT.test(value.trim()) && Number(value) <= Number(prize.amount);
  const rest = valid ? (Number(prize.amount) - Number(value)).toFixed(2) : null;

  const start = () => {
    setValue(prize.credit ?? prize.amount);
    setError(null);
    setEditing(true);
  };

  const save = async () => {
    if (busy || !valid) return;
    setBusy(true);
    setError(null);
    try {
      onSaved(await api.put<MyPrize>(`prizes/${prize.id}/payout`, { amount: value.trim() }));
      setEditing(false);
    } catch (e) {
      setError((e as ApiError).message);
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
        <button type="button" onClick={start} data-testid="payout-choose" className="btn-secondary h-10 justify-self-start px-4">
          {prize.credit === null ? "Choose how to get paid" : "Change"}
        </button>
      </div>
    );
  }

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
      <p>{valid ? `XCG ${rest} is paid out to you.` : `Enter an amount from 0 to ${prize.amount}.`}</p>
      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setEditing(false)} disabled={busy} className="btn-secondary h-10">
          Cancel
        </button>
        <button type="button" onClick={() => void save()} disabled={busy || !valid} data-testid="payout-save" className="btn-primary h-10">
          {busy && <Spinner />}
          Save
        </button>
      </div>
    </div>
  );
}
