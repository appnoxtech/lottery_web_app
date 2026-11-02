import { useState, type CSSProperties } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useHasUnread } from "../lib/announcements";
import { useAuth } from "../lib/auth";
import { fmtXcg } from "../lib/money";
import { prettyPhone } from "../lib/phone";
import { WalletProvider, useWallet } from "../lib/wallet";
import { BellIcon, GamesIcon, LogoutIcon, PlusIcon, SidebarIcon, TicketIcon, TrophyIcon, WalletIcon } from "./Icons";
import Logo, { LogoMark } from "./Logo";

/** Remembers in this browser whether the wide-screen side menu is collapsed. */
const MENU_KEY = "hs_side_menu";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(MENU_KEY) === "collapsed";
  } catch {
    return false;
  }
}

/**
 * Hover / keyboard-focus label, styled like the admin panel's tooltips (dark ink pill, no arrow).
 * Put it inside an element with `group relative`. Screen readers skip it: that element carries the aria-label.
 */
function Tip({ label, side = "right" }: { label: string; side?: "right" | "bottom" }) {
  const place = side === "right" ? "left-full top-1/2 ml-3.5 -translate-y-1/2" : "top-full left-1/2 mt-2 -translate-x-1/2";
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-50 rounded-[4px] bg-ink px-2 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:delay-100 group-focus-visible:opacity-100 ${place}`}
    >
      {label}
    </span>
  );
}

const NAV = [
  { to: "/", label: "Games", wide: "Games", icon: GamesIcon, end: true },
  { to: "/tickets", label: "Tickets", wide: "My tickets", icon: TicketIcon },
  { to: "/results", label: "Results", wide: "Results", icon: TrophyIcon },
  { to: "/balance", label: "Balance", wide: "Balance", icon: WalletIcon },
];

/** Red dot for an unread message, on the corner of the bell. */
function UnreadDot({ className }: { className: string }) {
  return <span className={`absolute h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-white ${className}`} aria-hidden="true" />;
}

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

  const unread = useHasUnread();
  const messagesLabel = unread ? "Messages, new message" : "Messages";
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const toggleMenu = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(MENU_KEY, next ? "collapsed" : "expanded");
    } catch {
      // Storage blocked (private window): the choice just lasts until the page reloads.
    }
  };
  const menuLabel = collapsed ? "Expand menu" : "Collapse menu";

  // Collapsed: icons only, centred; the label moves to a tooltip and stays readable by screen readers.
  const side = ({ isActive }: { isActive: boolean }) =>
    `group relative flex h-12 items-center gap-3 rounded-[10px] font-semibold transition ${collapsed ? "justify-center px-0" : "px-4"} ${isActive ? "bg-white text-brand shadow-sm" : "text-ink-700 hover:bg-white/60 hover:text-ink"}`;
  const tab = ({ isActive }: { isActive: boolean }) =>
    `relative flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold transition ${isActive ? "text-brand" : "text-muted"}`;

  return (
    // --side-menu-w: the side menu's current width, for anything fixed to the screen that must start right of it (e.g. the purchase bar).
    <div className="min-h-screen lg:flex" style={{ "--side-menu-w": collapsed ? "5rem" : "16rem" } as CSSProperties}>
      {/* Side menu: wide screens only. Collapses to an icon rail; the choice is remembered in this browser. */}
      {/* Open: overflow is clipped so the labels never spill out while the menu widens. Collapsed: visible, so the tooltips can stick out to the right. */}
      <aside
        id="side-menu"
        className={`sticky top-0 z-20 hidden h-screen shrink-0 flex-col border-r border-white/70 bg-canvas py-5 text-ink transition-[width] duration-200 lg:flex ${collapsed ? "w-20 px-3" : "w-64 overflow-hidden px-5"}`}
      >
        <Link to="/" className={`mb-8 rounded-[10px] ${collapsed ? "self-center" : "px-1"}`} aria-label="HopiSuerte, games">
          {collapsed ? <LogoMark size={40} /> : <Logo size={40} tone="dark" as="h1" />}
        </Link>
        <nav aria-label="Main" className="grid gap-1">
          {NAV.map(({ to, wide, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={side} aria-label={collapsed ? wide : undefined}>
              {({ isActive }) => (
                <>
                  <Icon className={isActive ? "text-blue-600" : "text-ink-500"} />
                  {collapsed ? <Tip label={wide} /> : wide}
                </>
              )}
            </NavLink>
          ))}
          {/* Messages sit in the side menu on wide screens; on phones they are the bell in the header, so the tab bar keeps four tabs. */}
          <NavLink to="/messages" className={side} aria-label={collapsed || unread ? messagesLabel : undefined}>
            {({ isActive }) => (
              <>
                <span className="relative">
                  <BellIcon className={isActive ? "text-blue-600" : "text-ink-500"} />
                  {unread && <UnreadDot className="-top-1 -right-1" />}
                </span>
                {collapsed ? <Tip label="Messages" /> : "Messages"}
              </>
            )}
          </NavLink>
        </nav>
        <div className={`group relative mt-auto flex items-center gap-3 rounded-[14px] bg-white/70 ring-1 ring-white ${collapsed ? "justify-center p-2" : "p-3"}`}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-400 text-sm font-bold text-brand-800" aria-hidden="true">
            {initials}
          </span>
          {collapsed ? (
            <>
              <span className="sr-only">{who}</span>
              <Tip label={who} />
            </>
          ) : (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{who}</div>
              {customer.name && <div className="truncate text-xs text-muted">{prettyPhone(customer.phone)}</div>}
            </div>
          )}
        </div>
        <button
          onClick={() => void signOut()}
          aria-label="Sign out"
          className={`group relative mt-2 flex h-11 items-center gap-3 rounded-[10px] text-sm font-semibold text-ink-700 hover:bg-white/60 hover:text-ink ${collapsed ? "justify-center" : "px-4"}`}
        >
          <LogoutIcon size={18} />
          {collapsed ? <Tip label="Sign out" /> : "Sign out"}
        </button>
        <button
          onClick={toggleMenu}
          aria-label={menuLabel}
          aria-controls="side-menu"
          aria-expanded={!collapsed}
          className={`group relative mt-1 flex h-11 items-center gap-3 rounded-[10px] text-sm font-semibold text-muted hover:bg-white/60 hover:text-ink ${collapsed ? "justify-center" : "px-4"}`}
        >
          <SidebarIcon size={18} open={!collapsed} />
          {collapsed ? <Tip label={menuLabel} /> : "Collapse menu"}
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Phone header */}
        <header className="border-b border-white/70 bg-canvas px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4 text-ink lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Logo size={34} tone="dark" as="h1" />
            <div className="flex items-center gap-1">
              <NavLink
                to="/messages"
                aria-label={messagesLabel}
                className={({ isActive }) => `relative grid h-11 w-11 place-items-center rounded-[10px] active:bg-white/60 ${isActive ? "bg-white text-brand" : "text-ink-700"}`}
              >
                <BellIcon size={20} />
                {unread && <UnreadDot className="top-2 right-2" />}
              </NavLink>
              <button onClick={() => void signOut()} className="flex h-11 items-center gap-1.5 rounded-[10px] px-3 text-sm font-semibold text-ink-700 active:bg-white/60">
                <LogoutIcon size={18} />
                Sign out
              </button>
            </div>
          </div>
          <Link to="/balance" className="mt-4 flex items-center justify-between rounded-[14px] bg-white px-4 py-3 shadow-sm ring-1 ring-white active:bg-brand-50">
            <span className="flex items-center gap-2 text-sm text-muted">
              <WalletIcon size={18} />
              Balance
            </span>
            <span className="flex items-center gap-3">
              <span className="text-xl font-extrabold text-ink" data-testid="header-balance">
                {balance}
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gold-400 text-brand-800" aria-hidden="true">
                <PlusIcon size={16} />
              </span>
            </span>
          </Link>
        </header>

        {/* Wide-screen top bar */}
        <div className="sticky top-0 z-10 hidden items-center justify-end gap-3 border-b border-white/70 bg-white/60 px-8 py-3 backdrop-blur lg:flex">
          <button
            onClick={toggleMenu}
            aria-label={menuLabel}
            aria-controls="side-menu"
            aria-expanded={!collapsed}
            className="group relative mr-auto -ml-3 grid h-10 w-10 place-items-center rounded-[10px] text-ink-700 hover:bg-ink-100"
          >
            <SidebarIcon size={22} open={!collapsed} />
            <Tip label={menuLabel} side="bottom" />
          </button>
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
