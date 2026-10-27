import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { fmtCountdown, fmtTime } from "../lib/time";
import { useServerClock } from "../lib/useServerClock";
import type { Customer, GameInfo } from "../lib/types";

export default function Home() {
  const { session, setCustomer, isNew } = useAuth();
  const customer = session!.customer;
  const now = useServerClock();
  const [games, setGames] = useState<GameInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setGames(await api.get<GameInfo[]>("games"));
      setError(null);
    } catch (e) {
      setError((e as ApiError).message);
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <>
      <main className="grid gap-5 px-5 pt-5 lg:px-0 lg:pt-0">
        {!customer.name && <NamePrompt onSaved={setCustomer} welcome={isNew} />}

        <p className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand-dark">
          Buying tickets arrives in the next update. For now you can see which games are open and when they close, and top up your balance. All times are Curaçao time.
        </p>

        <section aria-label="Games" className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          <h2 className="text-lg font-bold lg:col-span-full">Today&apos;s games</h2>
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}
          {games === null && !error && <p className="text-muted">Loading…</p>}
          {games?.map((game) => (
            <GameCard key={game.id} game={game} now={now} onRefresh={load} />
          ))}
        </section>
      </main>
    </>
  );
}

function GameCard({ game, now, onRefresh }: { game: GameInfo; now: number | null; onRefresh: () => void }) {
  const draw = game.draw;
  const opens = draw ? new Date(draw.opens_at).getTime() : 0;
  const closes = draw ? new Date(draw.closes_at).getTime() : 0;

  // Decided from the exact instants and the server clock, the same rule the server uses for purchases.
  const state: "open" | "soon" | "closed" = !draw || now === null ? (game.sales === "open" ? "open" : game.sales === "not_open_yet" ? "soon" : "closed") : now >= closes ? "closed" : now >= opens ? "open" : "soon";

  // When the countdown reaches zero, ask the server what comes next.
  useEffect(() => {
    if (now !== null && draw && state === "open" && now >= closes) onRefresh();
  }, [now, draw, state, closes, onRefresh]);

  return (
    <article className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm" data-state={state}>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand text-lg font-extrabold text-white">{game.code}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold">{game.name}</div>
        {state === "open" && draw && now !== null && (
          <div className="text-sm text-muted">
            Closes at <b className="text-ink">{fmtTime(draw.closes_at, now)}</b> · {fmtCountdown((closes - now) / 1000)} left
          </div>
        )}
        {state === "soon" && draw && now !== null && <div className="text-sm text-muted">Opens {fmtTime(draw.opens_at, now)}</div>}
        {state === "closed" && <div className="text-sm text-muted">Closed for now</div>}
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
          state === "open" ? "bg-green-100 text-green-800" : state === "soon" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
        }`}
      >
        {state === "open" ? "Open" : state === "soon" ? "Soon" : "Closed"}
      </span>
    </article>
  );
}

function NamePrompt({ onSaved, welcome }: { onSaved: (c: Customer) => void; welcome: boolean }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (saving || name.trim().length < 2) return;
    setSaving(true);
    setError(null);
    try {
      onSaved(await api.patch<Customer>("me", { name: name.trim() }));
    } catch (err) {
      setError((err as ApiError).field("name") ?? (err as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="grid gap-3 lg:max-w-md rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div>
        <div className="font-bold">{welcome ? "Welcome to HopiSuerte!" : "Add your name"}</div>
        <div className="text-sm text-muted">What should we call you? (optional)</div>
      </div>
      <input
        aria-label="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        placeholder="Your name"
        className="h-12 rounded-xl border-2 border-line px-4 outline-none focus:border-brand"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving || name.trim().length < 2} className="h-11 flex-1 rounded-xl bg-brand font-bold text-white disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setHidden(true)} className="h-11 rounded-xl px-4 text-muted">
          Skip
        </button>
      </div>
    </form>
  );
}
