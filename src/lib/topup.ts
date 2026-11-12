/** A currency a customer can pay a top-up in. `rate` is XCG per 1 unit of it (set by the owner in the admin panel). */
export interface TopupOption {
  currency: "XCG" | "USD" | "EUR";
  rate: string;
}

export const CURRENCY_LABEL: Record<TopupOption["currency"], string> = { XCG: "XCG", USD: "Dollars", EUR: "Euro" };
const SYMBOL: Record<TopupOption["currency"], string> = { XCG: "XCG ", USD: "$", EUR: "€" };

/** What the customer pays for `xcgAmount` of credit, e.g. "$57.14". Same rounding as the server (nearest cent). */
export function priceLabel(xcgAmount: string, option: TopupOption): string {
  const cents = Math.round(Number(xcgAmount) * 100);
  const rate = Number(option.rate);
  if (!Number.isFinite(cents) || !(rate > 0)) return "";
  return `${SYMBOL[option.currency]}${(Math.round(cents / rate) / 100).toFixed(2)}`;
}

export const PAY_INTRO = "Choose how much XCG you want to add and the currency you want to pay in. You pay the exact price shown, and the XCG amount is credited to your HopiSuerte balance after we confirm your payment. All prizes are in XCG.";
export const PAY_NOTE = "Already paid and your balance has not changed? Tap \"I have paid\" and tell us on WhatsApp.";
