import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { fmtXcg } from "../lib/money";
import { prettyPhone } from "../lib/phone";
import { WalletProvider, useWallet } from "../lib/wallet";

function Shell() {
  const { session, signOut } = useAuth();
  const { wallet } = useWallet();
  const customer = session!.customer;
  const tab = ({ isActive }: { isActive: boolean }) =>
    `flex-1 border-b-4 py-3 text-center text-sm font-bold ${isActive ? "border-accent text-white" : "border-transparent text-white/70"}`;

  return (
    <div className="mx-auto min-h-screen max-w-md pb-10">
      <header className="bg-brand px-5 pt-8 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">
            Hopi<span className="text-accent">Suerte</span>
          </h1>
          <div className="text-right text-sm">
            <div className="font-semibold">{customer.name ?? prettyPhone(customer.phone)}</div>
            <button onClick={() => void signOut()} className="text-white/80 underline">
              Sign out
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between rounded-xl bg-white/10 px-4 py-2">
          <span className="text-sm text-white/80">Balance</span>
          <span className="text-lg font-extrabold" data-testid="header-balance">
            {wallet ? fmtXcg(wallet.balance_cents) : "…"}
          </span>
        </div>
        <nav className="mt-3 flex" aria-label="Main">
          <NavLink to="/" end className={tab}>
            Games
          </NavLink>
          <NavLink to="/balance" className={tab}>
            Balance
          </NavLink>
        </nav>
      </header>
      <Outlet />
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
