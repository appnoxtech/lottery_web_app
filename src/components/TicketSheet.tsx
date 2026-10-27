import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { fmtDateTime } from "../lib/time";
import { prettySerial, qrDataUrl, repeatToForm, saveTicket, shareTicket, type RepeatData } from "../lib/ticket";
import type { Ticket } from "../lib/types";

const PRIZE_STATUS = { pending: "being paid", credited: "added to your balance", paid_out: "paid out" } as const;
const ORDINAL = ["1st", "2nd", "3rd"];

/** The ticket: QR, serial, numbers with their result and prizes, and save, share and repeat. */
export default function TicketSheet({ ticket, onClose, justBought = false }: { ticket: Ticket; onClose: () => void; justBought?: boolean }) {
  const navigate = useNavigate();
  const [qr, setQr] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    void qrDataUrl(ticket.serial).then((u) => live && setQr(u));
    return () => {
      live = false;
    };
  }, [ticket.serial]);

  const groups = new Map<string, NonNullable<Ticket["entries"]>>();
  for (const e of ticket.entries ?? []) groups.set(e.game_code, [...(groups.get(e.game_code) ?? []), e]);

  const run = async (fn: () => Promise<string | void>) => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      setMessage((await fn()) ?? null);
    } catch (e) {
      setMessage((e as ApiError).message || "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const repeat = () =>
    run(async () => {
      const data = await api.get<RepeatData>(`tickets/${ticket.serial}/repeat`);
      onClose();
      navigate("/", { state: { repeat: repeatToForm(data) } });
    });

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 lg:items-center" role="dialog" aria-modal="true" aria-label="Ticket">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 lg:rounded-3xl">
        <div className="text-center">
          {justBought && <div className="text-sm font-semibold text-ok">Purchase confirmed</div>}
          <div className="mt-1 text-2xl font-extrabold tracking-wider" data-testid="ticket-serial">
            {prettySerial(ticket.serial)}
          </div>
          <div className="text-sm text-muted">{fmtDateTime(ticket.created_at)} · Curaçao time</div>
          {qr && <img src={qr} alt={`QR code of ticket ${prettySerial(ticket.serial)}`} className="mx-auto mt-3 h-40 w-40" data-testid="ticket-qr" />}
        </div>

        <div className="mt-4 grid gap-3">
          {[...groups].map(([code, entries]) => {
            const result = entries[0].result;
            return (
              <div key={code} className="rounded-xl border border-line p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-bold">
                    {code}
                    {entries[0].draw_date && <span className="ml-2 text-xs font-normal text-muted">draw {entries[0].draw_date}</span>}
                  </span>
                  <span className="text-sm text-muted">{entries.length} numbers</span>
                </div>
                <div className="mb-2 rounded-lg bg-brand-soft px-3 py-1.5 text-sm" data-testid={`result-${code}`}>
                  {result ? (
                    <>
                      Result: <span className="font-mono font-bold tracking-widest">{result.join("  ")}</span>
                    </>
                  ) : (
                    <span className="text-muted">Waiting for the result</span>
                  )}
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
                  {entries.map((e) => (
                    <div key={`${e.digits}-${e.number}`} className="contents">
                      <span>
                        <span className="font-mono text-base font-bold tracking-widest">{e.number}</span>
                        {e.prizes?.map((p) => (
                          <span key={p.rank} className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-brand-dark" data-testid="prize-badge">
                            {ORDINAL[p.rank - 1]} prize XCG {p.amount} · {PRIZE_STATUS[p.status]}
                          </span>
                        ))}
                      </span>
                      <span className="text-right">{e.stake}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
          <span className="text-muted">Total paid</span>
          <span className="text-xl font-extrabold">XCG {ticket.total}</span>
        </div>

        {message && (
          <p role="status" className="mt-3 rounded-xl bg-brand-soft px-4 py-2 text-sm">
            {message}
          </p>
        )}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button disabled={busy} onClick={() => void run(async () => { await saveTicket(ticket); return "Picture saved to your downloads."; })} className="h-11 rounded-xl border border-line bg-white font-bold disabled:opacity-60">
            Save
          </button>
          <button disabled={busy} onClick={() => void run(async () => ((await shareTicket(ticket)) === "saved" ? "Sharing is not available here, so the picture was saved instead." : undefined))} className="h-11 rounded-xl border border-line bg-white font-bold disabled:opacity-60">
            Share
          </button>
          <button disabled={busy} onClick={() => void repeat()} data-testid="repeat" className="h-11 rounded-xl border border-line bg-white font-bold disabled:opacity-60">
            Repeat
          </button>
        </div>
        <button onClick={onClose} className="mt-3 h-12 w-full rounded-xl bg-brand font-bold text-white">
          Done
        </button>
      </div>
    </div>
  );
}
