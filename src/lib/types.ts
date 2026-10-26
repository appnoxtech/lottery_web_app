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

export interface ServerTime {
  server_time_utc: string;
  timezone: string;
  utc_offset: string;
  business_date: string;
}
