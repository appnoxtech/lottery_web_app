import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";
import type { Wallet } from "./types";

interface WalletState {
  wallet: Wallet | null;
  refresh: () => Promise<void>;
}

const WalletContext = createContext<WalletState | null>(null);

/** Keeps the balance current: on load, every 30 s, and when the customer comes back to the tab (for example after WhatsApp). */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const refresh = useCallback(async () => {
    try {
      setWallet(await api.get<Wallet>("wallet"));
    } catch {
      /* keep showing the last known balance; a dead session is handled by the api client */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(refresh, 30000);
    const onVisible = () => document.visibilityState === "visible" && void refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return <WalletContext.Provider value={{ wallet, refresh }}>{children}</WalletContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its provider
export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
