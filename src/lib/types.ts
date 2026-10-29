export interface Customer {
  id: number;
  phone: string; // E.164, for example +59995181234
  name: string | null;
  status: "active" | "suspended" | "blocked";
}

export interface Session {
  token: string;
  customer: Customer;
}

export interface DrawInfo {
  id: number;
  draw_date: string;
  status: string;
  is_open: boolean;
  opens_at: string; // exact UTC instants
  closes_at: string;
  draw_at: string;
  closes_at_local: string;
  opens_at_local: string;
}

export interface GameInfo {
  id: number;
  code: string;
  name: string;
  timezone: string;
  sales: "open" | "not_open_yet" | "closed";
  draw: DrawInfo | null;
}

export interface Wallet {
  balance_cents: number;
  balance: string; // "125.50"
  currency: string; // XCG
}

export interface LedgerEntry {
  id: number;
  type: "topup" | "purchase" | "prize" | "adjustment";
  amount_cents: number;
  balance_after_cents: number;
  created_at: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  per_page: number;
  total: number;
}

export interface ServerTime {
  server_time_utc: string;
  timezone: string;
  utc_offset: string;
  business_date: string;
}

export interface GameRules {
  code: string;
  name: string;
  is_open: boolean;
  draw: DrawInfo | null;
  stakes: Record<string, { min: string; step: string }>; // by digits "4" | "3" | "2"
}

export interface PurchaseRules {
  currency: string;
  digits: number[];
  max_lines: number;
  games: GameRules[];
}

export interface PreviewLine {
  number: string;
  digits: number;
  stake: string;
  stake_cents: number;
  problem: "stake_invalid" | "not_accepted" | null;
  message: string | null;
}

export interface Preview {
  lines: PreviewLine[];
  closed_games: string[];
  entries_count: number;
  total_cents: number;
  total: string;
  balance_cents: number;
  enough_balance: boolean;
  can_purchase: boolean;
}

export interface TicketEntry {
  game_code: string;
  draw_date: string | null;
  draw_at: string | null;
  digits: number;
  number: string;
  stake_cents: number;
  stake: string;
  result?: string[] | null; // the draw's published numbers (three, or one for a one-prize game), null until then
  prizes?: TicketPrize[];
}

export interface Ticket {
  serial: string;
  status: string;
  total_cents: number;
  total: string;
  currency: string;
  entries_count: number;
  created_at: string;
  entries?: TicketEntry[];
  qr?: string;
  replayed?: boolean;
}

export interface TicketPrize {
  rank: 1 | 2 | 3;
  amount: string;
  status: "pending" | "credited" | "paid_out";
}

export interface ResultItem {
  draw_id: number;
  game_code: string;
  game_name: string;
  draw_date: string;
  draw_at: string;
  numbers: string[]; // three winning numbers, or one for a game that pays one prize
  corrected: boolean;
  published_at: string | null;
}

export interface MyPrize {
  id: number;
  rank: 1 | 2 | 3;
  amount: string;
  currency: string;
  status: "pending" | "credited" | "paid_out";
  ticket_serial: string;
  game_code: string;
  draw_date: string;
  digits: number;
  number: string;
}
