import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { fmtXcg } from "../lib/money";
import { prettyPhone } from "../lib/phone";
import { WalletProvider, useWallet } from "../lib/wallet";

/**
 * Phones: a blue header with the balance and two tabs on top of the page.
 * Wide screens (lg and up): a side menu on the left, a top bar with the balance, and a wide content area.
 */
function Shell() {
  const { session, signOut } = useAuth();
  const { wallet } = useWallet();
  const customer = session!.customer;
  const who = customer.name ?? prettyPhone(customer.phone);
  const balance = wallet ? fmtXcg(wallet.balance_cents) : "…";

  const tab = ({ isActive }: { isActive: boolean }) =>
    `flex-1 border-b-4 py-3 text-center text-sm font-bold ${isActive ? "border-accent text-white" : "border-transparent text-white/70"}`;
  const side = ({ isActive }: { isActive: boolean }) =>
    `block rounded-xl px-4 py-3 font-bold ${isActive ? "bg-accent text-brand-dark" : "text-white/80 hover:bg-white/10"}`;

  return (
    <div className="min-h-screen lg:flex">
      {/* Side menu: wide screens only */}
      <aside className="hidden w-64 shrink-0 flex-col bg-brand p-5 text-white lg:flex">
        <h1 className="mb-8 text-2xl font-extrabold">
          Hopi<span className="text-accent">Suerte</span>
        </h1>
        <nav aria-label="Main" className="grid gap-2">
          <NavLink to="/" end className={side}>
            Games
          </NavLink>
          <NavLink to="/tickets" className={side}>
            My tickets
          </NavLink>
          <NavLink to="/balance" className={side}>
            Balance
          </NavLink>
        </nav>
        <div className="mt-auto text-sm">
          <div className="font-semibold">{who}</div>
          <button onClick={() => void signOut()} className="text-white/80 underline">
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Phone header */}
        <header className="bg-brand px-5 pt-8 text-white lg:hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold">
              Hopi<span className="text-accent">Suerte</span>
            </h1>
            <div className="text-right text-sm">
              <div className="font-semibold">{who}</div>
              <button onClick={() => void signOut()} className="text-white/80 underline">
                Sign out
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between rounded-xl bg-white/10 px-4 py-2">
            <span className="text-sm text-white/80">Balance</span>
            <span className="text-lg font-extrabold" data-testid="header-balance">
              {balance}
            </span>
          </div>
          <nav className="mt-3 flex" aria-label="Main">
            <NavLink to="/" end className={tab}>
              Games
            </NavLink>
            <NavLink to="/tickets" className={tab}>
              Tickets
            </NavLink>
            <NavLink to="/balance" className={tab}>
              Balance
            </NavLink>
          </nav>
        </header>

        {/* Wide-screen top bar */}
        <div className="hidden items-center justify-end gap-3 border-b border-line bg-white px-8 py-4 lg:flex">
          <span className="text-sm text-muted">Balance</span>
          <span className="rounded-full bg-brand-soft px-4 py-1.5 text-lg font-extrabold text-brand-dark" data-testid="header-balance-wide">
            {balance}
          </span>
        </div>

        <div className="mx-auto max-w-md pb-10 lg:max-w-6xl lg:px-8 lg:pt-6">
          <Outlet />
        </div>
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
