import { useState } from "react";
import { Spinner } from "./Icons";
import { ErrorNote } from "./ui";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { fmtDateTime } from "../lib/time";
import type { Customer } from "../lib/types";

/**
 * "Delete my account" (Apple and Google require it). The customer only asks: money may still be owed either way, so
 * the team pays out the balance and any prize first, then deletes. Until then they can change their mind.
 */
export default function DeleteAccount() {
  const { session, setCustomer } = useAuth();
  const customer = session?.customer;
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!customer) return null;
  const requested = customer.deletion_requested_at;

  const send = async (ask: boolean) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      setCustomer(ask ? await api.post<Customer>("me/deletion") : await api.delete<Customer>("me/deletion"));
      setConfirming(false);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="account-title" className="card grid gap-3 p-4 text-sm">
      <h2 id="account-title" className="font-semibold text-ink">
        Your account
      </h2>
      {requested ? (
        <>
          <p className="text-ink-700">
            You asked to delete your account on {fmtDateTime(requested)}. We will pay out your balance and any prizes, then delete your name and phone
            number. You can keep playing until then.
          </p>
          <button onClick={() => void send(false)} disabled={busy} className="btn-secondary h-11">
            {busy && <Spinner />}
            Keep my account
          </button>
        </>
      ) : confirming ? (
        <>
          <p className="text-ink-700">
            We first pay out your balance and any prizes, then delete your name and phone number and sign you out. Tickets stay in our records without
            your name, as the law requires.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setConfirming(false)} disabled={busy} className="btn-secondary h-11">
              Cancel
            </button>
            <button onClick={() => void send(true)} disabled={busy} className="btn h-11 bg-danger text-white hover:bg-danger-ink">
              {busy && <Spinner />}
              Delete my account
            </button>
          </div>
        </>
      ) : (
        <button onClick={() => setConfirming(true)} className="justify-self-start font-semibold text-danger hover:underline">
          Delete my account
        </button>
      )}
      {error && <ErrorNote>{error}</ErrorNote>}
    </section>
  );
}
