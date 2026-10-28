import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { fmtXcg } from "../lib/money";
import { prettyPhone } from "../lib/phone";
import { WalletProvider, useWallet } from "../lib/wallet";
import { GamesIcon, LogoutIcon, PlusIcon, TicketIcon, TrophyIcon, WalletIcon } from "./Icons";
import Logo from "./Logo";

const NAV = [
  { to: "/", label: "Games", wide: "Games", icon: GamesIcon, end: true },
  { to: "/tickets", label: "Tickets", wide: "My tickets", icon: TicketIcon },
  { to: "/results", label: "Results", wide: "Results", icon: TrophyIcon },
  { to: "/balance", label: "Balance", wide: "Balance", icon: WalletIcon },
];

/**
 * Phones: a compact blue header (logo + balance) and a tab bar at the bottom, where the thumb is.
 * Wide screens (lg and up): a side menu on the left, a top bar with the balance, and a wide content area.
 */
function Shell() {
  const { session, signOut } = useAuth();
  const { wallet } = useWallet();
  const customer = session!.customer;
  const who = customer.name ?? prettyPhone(customer.phone);
  const balance = wallet ? fmtXcg(wallet.balance_cents) : "…";
  const initials = (customer.name ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || customer.phone.replace(/\D/g, "").slice(-2);

  const side = ({ isActive }: { isActive: boolean }) =>
    `flex h-12 items-center gap-3 rounded-[10px] px-4 font-semibold transition ${isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`;
  const tab = ({ isActive }: { isActive: boolean }) =>
    `relative flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold transition ${isActive ? "text-brand" : "text-muted"}`;

  return (
    <div className="min-h-screen lg:flex">
      {/* Side menu: wide screens only */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-gradient-to-b from-brand-700 to-brand-900 p-5 text-white lg:flex">
        <Link to="/" className="mb-8 rounded-[10px] px-1" aria-label="HopiSuerte, games">
          <Logo size={40} as="h1" />
        </Link>
        <nav aria-label="Main" className="grid gap-1">
          {NAV.map(({ to, wide, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={side}>
              {({ isActive }) => (
                <>
                  <Icon className={isActive ? "text-gold-400" : ""} />
                  {wide}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-[14px] bg-white/10 p-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-400 text-sm font-bold text-brand-800" aria-hidden="true">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{who}</div>
            {customer.name && <div className="truncate text-xs text-white/60">{prettyPhone(customer.phone)}</div>}
          </div>
        </div>
        <button onClick={() => void signOut()} className="mt-2 flex h-11 items-center gap-3 rounded-[10px] px-4 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white">
          <LogoutIcon size={18} />
          Sign out
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Phone header */}
        <header className="bg-gradient-to-br from-brand-500 to-brand-700 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4 text-white lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Logo size={34} as="h1" />
            <button onClick={() => void signOut()} className="flex h-11 items-center gap-1.5 rounded-[10px] px-3 text-sm font-semibold text-white/85 active:bg-white/10">
              <LogoutIcon size={18} />
              Sign out
            </button>
          </div>
          <Link to="/balance" className="mt-4 flex items-center justify-between rounded-[14px] bg-white/12 px-4 py-3 ring-1 ring-white/15 active:bg-white/20">
            <span className="flex items-center gap-2 text-sm text-white/80">
              <WalletIcon size={18} />
              Balance
            </span>
            <span className="flex items-center gap-3">
              <span className="text-xl font-extrabold" data-testid="header-balance">
                {balance}
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gold-400 text-brand-800" aria-hidden="true">
                <PlusIcon size={16} />
              </span>
            </span>
          </Link>
        </header>

        {/* Wide-screen top bar */}
        <div className="sticky top-0 z-10 hidden items-center justify-end gap-3 border-b border-line bg-white/90 px-8 py-3 backdrop-blur lg:flex">
          <span className="text-sm text-muted">Balance</span>
          <span className="rounded-full bg-brand-50 px-4 py-1.5 text-lg font-extrabold text-brand-700" data-testid="header-balance-wide">
            {balance}
          </span>
          <Link to="/balance" className="btn-buy h-10 px-4 text-sm">
            <PlusIcon size={18} />
            Top up
          </Link>
        </div>

        {/* Bottom padding keeps the last item clear of the phone tab bar. */}
        <div className="mx-auto max-w-md pb-28 lg:max-w-[1400px] lg:px-8 lg:pt-6 lg:pb-10 lg:short:pt-4">
          <Outlet />
        </div>

        {/* Phone tab bar */}
        <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(20,33,61,0.06)] backdrop-blur lg:hidden">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={tab}>
              {({ isActive }) => (
                <>
                  <span className={`absolute top-0 h-[3px] w-10 rounded-b-full ${isActive ? "bg-brand" : "bg-transparent"}`} aria-hidden="true" />
                  <span className={`grid h-8 w-14 place-items-center rounded-full transition ${isActive ? "bg-brand-50" : ""}`}>
                    <Icon size={22} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default function AppShell() {
  return (
    <WalletProvider>
      <Shell />
    </WalletProvider>
  );
}
