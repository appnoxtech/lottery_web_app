import { useEffect, useState } from "react";
import { api, ApiError } from "../lib/api";
import { ErrorNote, Loading, Sheet } from "./ui";
import type { MyPrize } from "../lib/types";

/** The team's screenshot of the payment for a prize, opened from the winner's own list. */
export default function PrizeProof({ prize }: { prize: MyPrize }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let live = true;
    let made: string | null = null;
    setUrl(null);
    setError(null);
    api
      .blob(`prizes/${prize.id}/proof`)
      .then((b) => {
        made = URL.createObjectURL(b);
        if (live) setUrl(made);
        else URL.revokeObjectURL(made);
      })
      .catch((e) => live && setError((e as ApiError).message));
    return () => {
      live = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [open, prize.id]);

  if (!prize.has_proof) return null;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} data-testid="proof-open" className="btn-secondary h-10 justify-self-start px-4">
        View proof of payment
      </button>
      {open && (
        <Sheet label="Proof of payment" onClose={() => setOpen(false)}>
          <div className="grid gap-3">
            <h3 className="font-display text-lg font-extrabold">Proof of payment</h3>
            <p className="text-sm text-ink-700">XCG {prize.amount} prize with {prize.number}, paid by the HopiSuerte team.</p>
            {!url && !error && <Loading label="Loading…" />}
            {error && <ErrorNote>{error}</ErrorNote>}
            {url && <img src={url} alt="Screenshot of the payment" data-testid="proof-image" className="max-h-[60vh] w-full rounded-lg border border-line object-contain" />}
            <button type="button" onClick={() => setOpen(false)} className="btn-primary h-11">
              Close
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
}
