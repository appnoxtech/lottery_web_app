import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, ApiError, SESSION_STORAGE_KEY, setUnauthorizedHandler } from "./api";
import type { Customer, Session } from "./types";

interface AuthValue {
  session: Session | null;
  /** True while the stored session is being checked with the server after a page load. */
  checking: boolean;
  signIn: (session: Session, isNew?: boolean) => void;
  signOut: () => Promise<void>;
  setCustomer: (customer: Customer) => void;
  /** True right after a customer signed in for the very first time (shows a welcome). */
  isNew: boolean;
  /** Why the customer was signed out behind their back (suspended account, expired session). */
  notice: string | null;
  clearNotice: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

function loadSession(): Session | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? "null") as Session | null;
    return parsed?.token && parsed.customer ? parsed : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    /* storage can be blocked (private mode): the customer simply stays signed in until the tab closes */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession);
  const [checking, setChecking] = useState<boolean>(() => loadSession() !== null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const drop = useCallback((message?: string) => {
    saveSession(null);
    setSession(null);
    setIsNew(false);
    if (message) setNotice(message);
  }, []);

  // Any 401 from the API means the token is no longer valid.
  useEffect(() => {
    setUnauthorizedHandler(() => drop("Your session ended. Please sign in again."));
    return () => setUnauthorizedHandler(null);
  }, [drop]);

  // After a page load, confirm the stored session still works (it may have been revoked or suspended).
  useEffect(() => {
    if (!loadSession()) return;
    let cancelled = false;
    api.get<Customer>("me")
      .then((customer) => {
        if (cancelled) return;
        const next = { ...(loadSession() as Session), customer };
        saveSession(next);
        setSession(next);
      })
      .catch((e: ApiError) => {
        if (cancelled) return;
        if (e.status === 403) drop(e.message);
        // a 401 was already handled by the unauthorized handler; a network error keeps the session
      })
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [drop]);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      checking,
      notice,
      isNew,
      clearNotice: () => setNotice(null),
      signIn: (next, firstTime = false) => {
        saveSession(next);
        setSession(next);
        setIsNew(firstTime);
        setNotice(null);
      },
      signOut: async () => {
        try {
          await api.post("auth/logout");
        } catch {
          /* the token is dropped locally either way */
        }
        drop();
      },
      setCustomer: (customer) => {
        setSession((current) => {
          if (!current) return current;
          const next = { ...current, customer };
          saveSession(next);
          return next;
        });
      },
    }),
    [session, checking, notice, isNew, drop]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
