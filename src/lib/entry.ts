/**
 * Turns what the customer types ("1234x2 5678x1 234x0.5") into the lines they will buy.
 * Display only: the server re-reads every number and stake and decides prices, limits and totals.
 *
 * Numbers stay strings all the way (0007 is not 7). With several digit types selected a longer number also
 * gives its last digits: 1234 with 4, 3 and 2 selected gives 1234, 234 and 34, each with the same amount.
 */
export type DigitType = 2 | 3 | 4;
export const DIGIT_TYPES: DigitType[] = [4, 3, 2];

export interface Token {
  number: string;
  stake: string | null; // as typed after the x, or null to use the default amount
}

export interface Line {
  number: string;
  digits: DigitType;
  stake: string; // "1.50" (what will be sent), or what the customer typed while it is not a valid amount
}

export const STAKE_PATTERN = /^\d{1,9}(\.\d{1,2})?$/;

/** "1.5" -> 150. Only call with a valid amount. */
export const toCents = (amount: string): number => Math.round(Number(amount) * 100);
export const centsToAmount = (cents: number): string => (cents / 100).toFixed(2);
export const isValidStake = (amount: string): boolean => STAKE_PATTERN.test(amount) && toCents(amount) > 0;

const TOKEN = /^(\d{2,4})(?:[x*×](\d+(?:[.,]\d{1,2})?))?$/i;

export function parseEntries(text: string): { tokens: Token[]; unreadable: string[] } {
  const tokens: Token[] = [];
  const unreadable: string[] = [];
  for (const raw of text.split(/[\s,;]+/).filter(Boolean)) {
    const m = TOKEN.exec(raw);
    if (m) tokens.push({ number: m[1], stake: m[2] ? m[2].replace(",", ".") : null });
    else unreadable.push(raw);
  }
  return { tokens, unreadable };
}

/**
 * One line per number to buy. The same number from two tokens is one line with the amounts added.
 * `overrides` holds amounts the customer edited in the table; they replace the typed ones.
 */
export function deriveLines(tokens: Token[], digits: Set<DigitType>, defaultStake: string, overrides: Record<string, string>): { lines: Line[]; ignored: string[] } {
  const sums = new Map<string, { digits: DigitType; cents: number; bad: string | null }>();
  const ignored: string[] = [];

  for (const t of tokens) {
    const stake = t.stake ?? defaultStake;
    const ok = isValidStake(stake);
    let used = false;
    for (const d of DIGIT_TYPES) {
      if (!digits.has(d) || t.number.length < d) continue;
      used = true;
      const number = t.number.slice(t.number.length - d);
      const entry = sums.get(number) ?? { digits: d, cents: 0, bad: null };
      if (ok) entry.cents += toCents(stake);
      else entry.bad = stake;
      sums.set(number, entry);
    }
    if (!used) ignored.push(t.number);
  }

  const lines: Line[] = [];
  for (const [number, e] of sums) {
    const override = overrides[number];
    const stake = override !== undefined ? override : e.bad !== null ? e.bad : centsToAmount(e.cents);
    lines.push({ number, digits: e.digits, stake });
  }
  // Longest numbers first, then in the order typed.
  lines.sort((a, b) => b.digits - a.digits);

  return { lines, ignored };
}

/** A fresh key for one purchase attempt. Works on plain http too (crypto.randomUUID needs https). */
export function newIdempotencyKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
