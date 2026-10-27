/** Cents (as sent by the API) to a readable XCG amount, e.g. 12550 -> "XCG 125.50". */
export const fmtXcg = (cents: number): string => `XCG ${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
