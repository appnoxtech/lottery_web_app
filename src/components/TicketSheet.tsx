import { fmtDateTime } from "../lib/time";
import { prettySerial } from "../lib/ticket";
import type { Ticket } from "../lib/types";

/** The ticket: serial, what was bought and what it cost. Save, share and repeat arrive with the tickets update. */
export default function TicketSheet({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const groups = new Map<string, NonNullable<Ticket["entries"]>>();
  for (const e of ticket.entries ?? []) {
    const key = e.game_code;
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 lg:items-center" role="dialog" aria-modal="true" aria-label="Ticket">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 lg:rounded-3xl">
        <div className="text-center">
          <div className="text-sm font-semibold text-ok">Purchase confirmed</div>
          <div className="mt-1 text-2xl font-extrabold tracking-wider" data-testid="ticket-serial">
            {prettySerial(ticket.serial)}
          </div>
          <div className="text-sm text-muted">{fmtDateTime(ticket.created_at)} · Curaçao time</div>
        </div>

        <div className="mt-4 grid gap-3">
          {[...groups].map(([code, entries]) => (
            <div key={code} className="rounded-xl border border-line p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-bold">
                  {code}
                  {entries[0].draw_date && <span className="ml-2 text-xs font-normal text-muted">draw {entries[0].draw_date}</span>}
                </span>
                <span className="text-sm text-muted">{entries.length} numbers</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-x-4 text-sm">
                {entries.map((e) => (
                  <div key={`${e.digits}-${e.number}`} className="contents">
                    <span className="font-mono text-base font-bold tracking-widest">{e.number}</span>
                    <span className="text-right">{e.stake}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
          <span className="text-muted">Total paid</span>
          <span className="text-xl font-extrabold">XCG {ticket.total}</span>
        </div>
        <button onClick={onClose} className="mt-4 h-12 w-full rounded-xl bg-brand font-bold text-white">
          Done
        </button>
      </div>
    </div>
  );
}
