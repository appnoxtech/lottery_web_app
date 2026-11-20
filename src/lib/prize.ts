import type { MyPrize } from "./types";

/** What a settled prize turned into, when only part of it went to the balance. */
export const payoutSummary = (p: MyPrize): string | null =>
  p.status === "credited" && p.cash !== null && Number(p.cash) > 0 ? `XCG ${p.credit} added to your balance, XCG ${p.cash} paid out to you` : null;

/** Only the last 4 characters of an account number are shown back on screen. */
export const maskAccount = (n: string): string => (n.length <= 4 ? n : `••••${n.slice(-4)}`);

/** Banks a winner is likely to use, offered as suggestions in the bank field. Any other bank can still be typed. */
export const BANKS = [
  "Maduro & Curiel's Bank (MCB)",
  "RBC Royal Bank",
  "Orco Bank",
  "Banco di Caribe",
  "Windward Islands Bank (WIB)",
  "Aruba Bank",
  "Caribbean Mercantile Bank (CMB)",
  "Chinese Commercial Bank",
  "Girobank",
];

export const ACCOUNT_TYPES = ["Savings", "Checking"];
