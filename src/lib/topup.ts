import { useEffect, useState } from "react";
import { api, ApiError } from "./api";

/** A currency a customer can pay a top-up in. `rate` is XCG per 1 unit of it (set by the owner in the admin panel). */
export interface TopupOption {
  currency: "XCG" | "USD" | "EUR";
  rate: string;
}

/** The exact breakdown from the server: the apps never work out the price or the fee themselves. */
export interface TopupQuote {
  credit: string; // XCG added to the balance
  fee: string; // service fee, in the paying currency ("0.00" when there is none)
  pay: { currency: TopupOption["currency"]; amount: string }; // what is charged, in the paying currency (credit price + fee)
}

export const CURRENCY_LABEL: Record<TopupOption["currency"], string> = { XCG: "XCG", USD: "Dollars", EUR: "Euro" };
const SYMBOL: Record<TopupOption["currency"], string> = { XCG: "XCG ", USD: "$", EUR: "€" };

/** What the customer is charged, e.g. "$60.74". */
export function payLabel(q: TopupQuote): string {
  return `${SYMBOL[q.pay.currency]}${q.pay.amount}`;
}

/** The service fee in the paying currency, e.g. "$3.58". */
export function feeLabel(q: TopupQuote): string {
  return `${SYMBOL[q.pay.currency]}${q.fee}`;
}

export function hasFee(q: TopupQuote | null): q is TopupQuote {
  return !!q && Number(q.fee) > 0;
}

/**
 * Asks the server what `amount` XCG costs in `currency` (with the service fee), a moment after the customer stops typing.
 * `error` is the server's reason when the amount cannot be paid by card (for example too small).
 */
export function useTopupQuote(amount: string, currency: TopupOption["currency"], valid: boolean): { quote: TopupQuote | null; error: string | null } {
  const key = `${amount.trim()}|${currency}`;
  const [state, setState] = useState<{ key: string; quote: TopupQuote | null; error: string | null }>({ key: "", quote: null, error: null });

  useEffect(() => {
    if (!valid) return;
    let stale = false;
    const timer = setTimeout(() => {
      api
        .get<TopupQuote>(`topup/quote?amount=${encodeURIComponent(amount.trim())}&currency=${currency}`)
        .then((quote) => !stale && setState({ key, quote, error: null }))
        .catch((e) => !stale && setState({ key, quote: null, error: e instanceof ApiError && e.status === 422 ? (e.field("amount") ?? null) : null }));
    }, 300);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [amount, currency, valid, key]);

  // An answer for an earlier amount or currency is never shown against the current one.
  return valid && state.key === key ? { quote: state.quote, error: state.error } : { quote: null, error: null };
}

export const PAY_NOTE = "Already paid and your balance has not changed? Tap \"I have paid\" and tell us on WhatsApp.";
export const FEE_NOTE = "The service fee covers the card payment charges. It is not added to your balance.";
