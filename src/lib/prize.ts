import type { MyPrize } from "./types";

/** What a settled prize turned into, when only part of it went to the balance. */
export const payoutSummary = (p: MyPrize): string | null =>
  p.status === "credited" && p.cash !== null && Number(p.cash) > 0 ? `XCG ${p.credit} added to your balance, XCG ${p.cash} paid out to you` : null;
