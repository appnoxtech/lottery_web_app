import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { prettyPhone } from "../lib/phone";
import { fmtDateTime } from "../lib/time";
import { prettySerial, qrDataUrl, repeatToForm, saveTicket, shareTicket, ticketStatus, type RepeatData } from "../lib/ticket";
import type { Ticket } from "../lib/types";
import { CheckIcon, DownloadIcon, RepeatIcon, ShareIcon, TrophyIcon } from "./Icons";
import { LogoMark } from "./Logo";
import { Sheet } from "./ui";
import { MEDAL, WinningNumbers } from "./WinningNumbers";

const PRIZE_STATUS = { pending: "being paid", credited: "added to your balance", paid_out: "paid out" } as const;
const ORDINAL = ["1st", "2nd", "3rd"];

/** The ticket (PDF section 8): QR, serial, customer, reference, status, numbers with their result and prizes, and save, share and repeat. */
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
    <Sheet label="Ticket" onClose={onClose} wide>
      {justBought && (
        <div className="mb-3 flex items-center justify-center gap-2 rounded-[10px] bg-ok-soft py-2 text-sm font-semibold text-ok-ink">
          <CheckIcon size={18} />
          Purchase confirmed
        </div>
      )}

      {ticket.status === "corrected" && (
        <div className="mb-3 rounded-[10px] bg-warn-soft py-2 text-center text-sm font-semibold text-warn-ink" role="status">
          This ticket was corrected. The amount was returned to your balance.
        </div>
      )}

      {/* Wide screens: the stub on the left, the numbers and actions on the right, so the ticket fits without scrolling */}
      <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-5">
        {/* Ticket stub: blue header with the serial, white body with the QR */}
        <div className="overflow-hidden rounded-[14px] border border-line">
          <div className="flex items-center gap-3 bg-hero px-4 py-3 text-white">
            <LogoMark size={32} />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold tracking-widest text-white/90 uppercase">Ticket</div>
              <div className="truncate font-mono text-xl font-extrabold tracking-wider" data-testid="ticket-serial">
                {prettySerial(ticket.serial)}
              </div>
            </div>
          </div>
          <div className="grid justify-items-center gap-1 bg-white px-4 py-3 text-center lg:py-4">
            {qr ? (
              <img src={qr} alt={`QR code of ticket ${prettySerial(ticket.serial)}`} className="h-32 w-32 lg:h-44 lg:w-44" data-testid="ticket-qr" />
            ) : (
              <div className="h-32 w-32 animate-pulse rounded-[10px] bg-ink-100 lg:h-44 lg:w-44" aria-hidden="true" />
            )}
            <dl className="mt-1 grid w-full grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-left text-sm" data-testid="ticket-details">
              {ticket.phone && (
                <>
                  <dt className="text-muted">Customer</dt>
                  <dd className="text-right font-medium text-ink">{prettyPhone(ticket.phone)}</dd>
                </>
              )}
              <dt className="text-muted">Purchased</dt>
              <dd className="text-right font-medium text-ink">{fmtDateTime(ticket.created_at)}</dd>
              {ticket.reference && (
                <>
                  <dt className="text-muted">Reference</dt>
                  <dd className="text-right font-mono font-medium text-ink">{ticket.reference}</dd>
                </>
              )}
              <dt className="text-muted">Status</dt>
              <dd className={`text-right font-semibold ${ticket.status === "corrected" ? "text-warn-ink" : "text-ok-ink"}`}>{ticketStatus(ticket.status)}</dd>
            </dl>
            <div className="text-xs text-ink-400">Times are Curaçao time</div>
            <div className="hidden text-xs text-ink-400 lg:block">Show this code if you need help with your ticket.</div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mt-3 grid gap-3 lg:mt-0">
            {[...groups].map(([code, entries]) => {
              const result = entries[0].result;
              return (
                <div key={code} className="rounded-[14px] border border-line p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="grid h-7 min-w-8 shrink-0 place-items-center rounded-md bg-brand-50 px-1.5 text-xs font-bold text-brand-700">{code}</span>
                      <span className="min-w-0 leading-tight">
                        {entries[0].game_name && <span className="block truncate text-sm font-semibold text-ink">{entries[0].game_name}</span>}
                        {entries[0].draw_at ? (
                          <span className="block text-xs text-muted">draw {fmtDateTime(entries[0].draw_at)}</span>
                        ) : (
                          entries[0].draw_date && <span className="block text-xs text-muted">draw {entries[0].draw_date}</span>
                        )}
                      </span>
                    </span>
                    <span className="text-xs font-medium text-muted">{entries.length} numbers</span>
                  </div>
                  <div className="mb-2 rounded-[10px] bg-ink-100 px-3 py-2 text-sm" data-testid={`result-${code}`}>
                    {result ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted">Result</span>
                        <WinningNumbers numbers={result} size="sm" />
                      </div>
                    ) : (
                      <span className="text-muted">Waiting for the result</span>
                    )}
                  </div>
                  <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 text-sm">
                    {entries.map((e) => (
                      <div key={`${e.digits}-${e.number}`} className="contents">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-mono text-base font-bold tracking-widest">{e.number}</span>
                          <span className="text-xs text-muted">{e.digits} digits</span>
                          {e.prizes?.map((p) => (
                            <span key={p.rank} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${MEDAL[p.rank - 1] ?? MEDAL[0]}`} data-testid="prize-badge">
                              <TrophyIcon size={12} />
                              {ORDINAL[p.rank - 1]} prize XCG {p.amount} · {PRIZE_STATUS[p.status]}
                            </span>
                          ))}
                        </span>
                        <span className="text-right font-medium text-ink-700">{e.stake}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-ink-300 pt-3">
            <span className="text-muted">Total paid</span>
            <span className="font-display text-xl font-extrabold">XCG {ticket.total}</span>
          </div>

          {message && (
            <p role="status" className="alert-info mt-3">
              {message}
            </p>
          )}
          <div className="mt-3 grid grid-cols-3 gap-2 lg:mt-4">
            <button disabled={busy} onClick={() => void run(async () => { await saveTicket(ticket); return "Picture saved to your downloads."; })} className="btn-secondary h-12 text-sm">
              <DownloadIcon size={18} />
              Save
            </button>
            <button disabled={busy} onClick={() => void run(async () => ((await shareTicket(ticket)) === "saved" ? "Sharing is not available here, so the picture was saved instead." : undefined))} className="btn-secondary h-12 text-sm">
              <ShareIcon size={18} />
              Share
            </button>
            <button disabled={busy} onClick={() => void repeat()} data-testid="repeat" className="btn-secondary h-12 text-sm">
              <RepeatIcon size={18} />
              Repeat
            </button>
          </div>
          <button onClick={onClose} className="btn-primary mt-3 h-12 w-full">
            Done
          </button>
        </div>
      </div>
    </Sheet>
  );
}
