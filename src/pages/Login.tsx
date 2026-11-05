import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import "../auth.css";
import AuthBackdrop from "../components/AuthBackdrop";
import CodeInput from "../components/CodeInput";
import { ArrowLeftIcon, ClockIcon, PhoneIcon, ShieldIcon, Spinner, TicketIcon } from "../components/Icons";
import { LogoMark } from "../components/Logo";
import { ErrorNote } from "../components/ui";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import CountrySelect from "../components/CountrySelect";
import { cleanPhoneInput, COUNTRIES, DEFAULT_COUNTRY, examplePhone, hasTooManyDigits, isValidPhone, prettyPhone, toE164 } from "../lib/phone";
import type { CountryCode } from "libphonenumber-js/min";
import { Link } from "react-router-dom";
import type { Customer } from "../lib/types";

type Step = "phone" | "code";

const BENEFITS = [
  { icon: TicketIcon, title: "One screen to play", text: "Pick your games, type your numbers, confirm. Done." },
  { icon: ClockIcon, title: "Every draw on time", text: "Live countdowns to each closing time, in Curaçao time." },
  { icon: ShieldIcon, title: "Your balance, safe", text: "Sign in with a code sent to your phone. No password to forget." },
];

export default function Login() {
  const { signIn, notice, clearNotice } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
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

  const phoneOk = isValidPhone(phoneInput, country);
  // The country selector hides once the customer types a country code of their own (+91 ...).
  const international = phoneInput.trim().startsWith("+");
  const countryName = COUNTRIES.find((c) => c.code === country)?.name ?? "";
  const phoneError =
    phoneTouched && !phoneOk
      ? phoneInput.trim()
        ? international
          ? "Enter a valid international number, like +599 9 518 1234"
          : `Enter a valid ${countryName} number, like ${examplePhone(country)}`
        : "Enter your phone number"
      : null;

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
      const result = await api.post<{ phone: string; resend_after_seconds: number }>("auth/otp/request", { phone: toE164(phoneInput, country) ?? phoneInput.trim() });
      setPhone(result.phone);
      setCode("");
      setCodeInvalid(false);
      setCooldown(result.resend_after_seconds);
      setStep("code");
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === "otp_too_soon") {
        // A code was sent a moment ago: carry on with that one.
        setPhone(toE164(phoneInput, country) ?? phoneInput.trim());
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
    <div className="auth-stage">
      <AuthBackdrop />

      <div className="auth-layout">
        {/* Brand column (desktop) / stage on top (phone) */}
        <section className="auth-brand">
          <div className="auth-rise flex items-center gap-4" style={{ "--i": 0 } as CSSProperties}>
            <span className="auth-coin">
              <LogoMark size={56} />
            </span>
            <div className="min-w-0 text-left leading-none">
              <h1 className="font-display text-[1.9rem] font-extrabold tracking-tight whitespace-nowrap lg:text-[2.2rem]">
                Hopi<span className="text-gold-400">Suerte</span>
              </h1>
              <p className="mt-1.5 text-sm text-white/70 italic">Tú suerte, nuestro compromiso</p>
            </div>
          </div>

          <p
            className="auth-rise mt-6 max-w-xl font-display text-[1.6rem] leading-[1.15] font-bold tracking-tight sm:text-[2.1rem] lg:mt-12 lg:text-[3.25rem] lg:leading-[1.05]"
            style={{ "--i": 1 } as CSSProperties}
          >
            Play your numbers <br className="hidden lg:block" />
            in <span className="bg-gradient-to-r from-gold-400 to-[#ffe27a] bg-clip-text text-transparent">seconds</span>.
          </p>
          <p className="auth-rise mt-3 hidden max-w-md text-[1.0625rem] leading-relaxed text-white/70 sm:block lg:mt-5" style={{ "--i": 2 } as CSSProperties}>
            Pick your games, type your numbers and you are in the draw. Results and winnings, right on your phone.
          </p>

          <ul className="mt-10 hidden max-w-[400px] gap-3 lg:grid">
            {BENEFITS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="auth-rise auth-glass flex items-center gap-4 rounded-2xl px-4 py-3.5" style={{ "--i": 3 + i } as CSSProperties}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-brand-900 shadow-[0_6px_16px_rgba(246,194,27,0.3)]">
                  <Icon size={22} />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-white/65">{text}</span>
                </span>
              </li>
            ))}
          </ul>

          {/* A ticket preview floating beside the copy: decoration, wide screens only */}
          <div aria-hidden="true" className="auth-ticket auth-glass pointer-events-none absolute top-[57%] right-[-3%] hidden w-56 rounded-2xl p-4 xl:block">
            <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.12em] text-white/60 uppercase">
              <span>Ticket</span>
              <span className="font-mono tracking-normal">HS-7KQ2M-X94TD</span>
            </div>
            <div className="mt-3 flex gap-2">
              {["0724", "1388", "4261"].map((n, i) => (
                <span
                  key={n}
                  className={`grid h-9 flex-1 place-items-center rounded-full font-display text-sm font-bold ${i === 0 ? "bg-gold-400 text-brand-900" : "bg-white/15 text-white"}`}
                >
                  {n}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1.5 border-t border-dashed border-white/20 pt-3 text-xs text-white/70">
              <ClockIcon size={14} className="text-gold-400" />
              Results at 9:00 PM
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="auth-panel">
          <main className="auth-card auth-card-in">
            {notice && (
              <p role="alert" className="mb-5 rounded-xl border border-warn/20 bg-warn-soft px-4 py-3 text-sm text-warn-ink">
                {notice}
              </p>
            )}

            {step === "phone" ? (
              <form onSubmit={requestCode} noValidate className="grid gap-6">
                <div>
<h2 className="font-display text-[1.75rem] leading-tight font-bold tracking-tight sm:text-3xl">Sign in</h2>
                  <p className="mt-1.5 text-muted">Enter your phone number. We send you a <span className="whitespace-nowrap">4-digit</span> code.</p>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="phone" className="text-sm font-semibold">
                    Phone number
                  </label>
                  <div className="auth-field" data-invalid={!!phoneError}>
                    {international ? <PhoneIcon className="auth-field-icon mx-4 shrink-0" /> : <CountrySelect value={country} onChange={setCountry} />}
                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder={international ? "+599 9 518 1234" : examplePhone(country) || "Phone number"}
                      value={phoneInput}
                      onChange={(e) => {
                        const next = cleanPhoneInput(e.target.value);
                        // Digits past the country's number length (India 10, Curaçao 8...) are simply not typed (deleting always works).
                        if (next.length <= phoneInput.length || !hasTooManyDigits(next, country)) setPhoneInput(next);
                      }}
                      onBlur={() => setPhoneTouched(true)}
                      aria-invalid={!!phoneError || undefined}
                      aria-describedby="phone-help"
                      className={international ? "" : "pl-1"}
                    />
                  </div>
                  <span id="phone-help" className={`min-h-5 text-sm leading-snug ${phoneError ? "font-medium text-danger" : "text-muted"}`}>
                    {phoneError ?? "Pick your country, then type your number without the country code."}
                  </span>
                </div>

                {error && <ErrorNote>{error}</ErrorNote>}

                {/* Not disabled while the number is incomplete: pressing it shows what is missing instead. */}
                <button type="submit" disabled={loading} className="auth-btn">
                  {loading ? <Spinner /> : null}
                  {loading ? "Sending…" : "Send me the code"}
                  {!loading && <ArrowRight className="auth-arrow" />}
                </button>

                <p className="flex items-center gap-2.5 rounded-xl bg-ok-soft/70 px-3.5 py-3 text-xs leading-snug text-ok-ink">
                  <ShieldIcon size={18} className="shrink-0" />
                  No password needed: we send you a new code each time you sign in.
                </p>
              </form>
            ) : (
              <div className="grid gap-6">
                <div>
                  <button
                    type="button"
                    onClick={changeNumber}
                    className="-ml-2 inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted hover:bg-ink-100 hover:text-ink"
                    aria-label="Back to the phone number"
                  >
                    <ArrowLeftIcon size={16} /> Back
                  </button>
                  <h2 className="mt-2 font-display text-[1.75rem] leading-tight font-bold tracking-tight sm:text-3xl">Enter the code</h2>
                  <p className="mt-1.5 text-muted">
                    We sent a <span className="whitespace-nowrap">4-digit</span> code to <b className="text-ink">{prettyPhone(phone)}</b>.
                  </p>
                </div>

                <CodeInput value={code} onChange={onCodeChange} disabled={loading} invalid={codeInvalid} />

                {error && (
                  <p role="alert" className="alert-error text-center">
                    {error}
                  </p>
                )}
                {loading && (
                  <p className="flex items-center justify-center gap-2 text-sm text-muted" role="status">
                    <Spinner className="text-brand" />
                    Checking…
                  </p>
                )}

                <div className="grid gap-1 border-t border-line pt-4 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => void requestCode()}
                    disabled={cooldown > 0 || loading}
                    className="h-11 rounded-xl font-semibold text-brand transition enabled:hover:bg-brand-50 disabled:text-muted"
                  >
                    {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
                  </button>
                  <button type="button" onClick={changeNumber} className="h-11 rounded-xl text-muted underline-offset-4 transition hover:text-ink hover:underline">
                    Use a different number
                  </button>
                </div>
              </div>
            )}
          </main>
          <p className="mt-5 hidden text-center text-xs text-white/50 sm:block">All times are Curaçao time · Play responsibly</p>
          <p className="mt-4 text-center text-xs text-white/60">
            <Link to="/privacy" className="underline underline-offset-2 hover:text-white">Privacy policy</Link>
          </p>
        </section>
      </div>
    </div>
  );
}

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
