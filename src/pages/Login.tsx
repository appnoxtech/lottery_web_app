import { useEffect, useRef, useState, type FormEvent } from "react";
import CodeInput from "../components/CodeInput";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { isValidPhone, prettyPhone } from "../lib/phone";
import type { Customer } from "../lib/types";

type Step = "phone" | "code";

export default function Login() {
  const { signIn, notice, clearNotice } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [phone, setPhone] = useState(""); // E.164, as the server understood it
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [codeInvalid, setCodeInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const submitting = useRef(false); // blocks a double tap before React re-renders

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const phoneOk = isValidPhone(phoneInput);
  const phoneError = phoneTouched && !phoneOk ? (phoneInput.trim() ? "Enter a valid phone number, like 9 518 1234 or +599 9 518 1234" : "Enter your phone number") : null;

  const requestCode = async (e?: FormEvent) => {
    e?.preventDefault();
    if (submitting.current || !phoneOk) {
      setPhoneTouched(true);
      return;
    }
    submitting.current = true;
    setLoading(true);
    setError(null);
    clearNotice();
    try {
      const result = await api.post<{ phone: string; resend_after_seconds: number }>("auth/otp/request", { phone: phoneInput.trim() });
      setPhone(result.phone);
      setCode("");
      setCodeInvalid(false);
      setCooldown(result.resend_after_seconds);
      setStep("code");
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === "otp_too_soon") {
        // A code was sent a moment ago: carry on with that one.
        setPhone(phoneInput.trim());
        setCooldown(apiError.retryAfter ?? 30);
        setStep("code");
        setError("A code was sent a moment ago. Enter it below.");
      } else {
        setError(apiError.field("phone") ?? apiError.message);
      }
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  const verify = async (value: string) => {
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);
    setError(null);
    setCodeInvalid(false);
    try {
      const result = await api.post<{ token: string; customer: Customer; is_new: boolean }>("auth/otp/verify", { phone, code: value });
      // Signing in is enough: the guest-only route then moves the customer to the home screen.
      signIn({ token: result.token, customer: result.customer }, result.is_new);
    } catch (err) {
      const apiError = err as ApiError;
      setCode("");
      if (apiError.code === "invalid_code") {
        setCodeInvalid(true);
        setError("That code is not right, or it has expired. Check the message and try again.");
      } else if (apiError.code.startsWith("account_")) {
        setError(apiError.message);
        setStep("phone");
      } else {
        setError(apiError.message);
      }
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  const onCodeChange = (value: string) => {
    setCode(value);
    setCodeInvalid(false);
    if (value.length === 4) void verify(value);
  };

  const changeNumber = () => {
    setStep("phone");
    setError(null);
    setCode("");
    setCooldown(0);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col lg:my-10 lg:min-h-0 lg:max-w-lg lg:overflow-hidden lg:rounded-3xl lg:shadow-xl">
      <header className="bg-brand px-6 pb-10 pt-12 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-2xl text-brand" aria-hidden="true">
            ☘
          </span>
          <div>
            <h1 className="text-3xl font-extrabold leading-none">
              Hopi<span className="text-accent">Suerte</span>
            </h1>
            <p className="mt-1 text-sm italic text-white/80">Tú suerte, nuestro compromiso</p>
          </div>
        </div>
      </header>

      <main className="-mt-5 flex-1 rounded-t-3xl bg-white px-6 pb-10 pt-8 shadow-lg">
        {notice && (
          <p role="alert" className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {notice}
          </p>
        )}

        {step === "phone" ? (
          <form onSubmit={requestCode} noValidate className="grid gap-5">
            <div>
              <h2 className="text-2xl font-bold">Sign in</h2>
              <p className="mt-1 text-muted">Enter your phone number. We send you a 4-digit code.</p>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold">Phone number</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="9 518 1234"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                onBlur={() => setPhoneTouched(true)}
                aria-invalid={!!phoneError || undefined}
                className={`h-14 rounded-xl border-2 px-4 text-lg outline-none focus:border-brand ${phoneError ? "border-danger" : "border-line"}`}
              />
              <span className={`min-h-5 text-sm ${phoneError ? "text-danger" : "text-muted"}`}>
                {phoneError ?? "Curaçao numbers work as they are. For another country start with +."}
              </span>
            </label>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !phoneOk}
              className="h-14 rounded-xl bg-ok text-lg font-bold text-white transition enabled:active:bg-ok-dark disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send me the code"}
            </button>
          </form>
        ) : (
          <div className="grid gap-6">
            <div>
              <h2 className="text-2xl font-bold">Enter the code</h2>
              <p className="mt-1 text-muted">
                We sent a 4-digit code to <b className="text-ink">{prettyPhone(phone)}</b>.
              </p>
            </div>

            <CodeInput value={code} onChange={onCodeChange} disabled={loading} invalid={codeInvalid} />

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-danger">
                {error}
              </p>
            )}
            {loading && <p className="text-center text-sm text-muted">Checking…</p>}

            <div className="grid gap-3 text-center text-sm">
              <button
                type="button"
                onClick={() => void requestCode()}
                disabled={cooldown > 0 || loading}
                className="font-semibold text-brand disabled:text-muted"
              >
                {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
              </button>
              <button type="button" onClick={changeNumber} className="text-muted underline">
                Use a different number
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
