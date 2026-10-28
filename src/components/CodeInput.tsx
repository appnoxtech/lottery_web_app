import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}

const LENGTH = 4;

/** Four big boxes for the login code. Typing moves ahead, backspace moves back, a pasted code fills all four. */
export default function CodeInput({ value, onChange, disabled, invalid }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  // After a wrong code is cleared, put the cursor back on the first box.
  useEffect(() => {
    if (value === "" && !disabled) refs.current[0]?.focus();
  }, [value, disabled]);

  const setAt = (index: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");
    if (clean === "") {
      onChange(digits.map((d, i) => (i === index ? "" : d)).join("").slice(0, LENGTH));
      return;
    }
    // Typing several digits at once (autofill, paste) spreads them across the boxes.
    const next = digits.slice();
    clean.split("").forEach((ch, offset) => {
      if (index + offset < LENGTH) next[index + offset] = ch;
    });
    onChange(next.join(""));
    refs.current[Math.min(index + clean.length, LENGTH - 1)]?.focus();
  };

  return (
    <div className={`flex justify-center gap-3 ${invalid ? "animate-shake" : ""}`} role="group" aria-label="Login code">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={LENGTH}
          disabled={disabled}
          value={digit}
          onChange={(e) => setAt(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && digit === "" && i > 0) {
              refs.current[i - 1]?.focus();
            }
          }}
          onFocus={(e) => e.currentTarget.select()}
          className={`h-[60px] w-[56px] rounded-[14px] border-[1.5px] text-center font-display text-[1.75rem] font-bold text-ink caret-brand outline-none transition duration-150 focus-visible:outline-none focus:-translate-y-0.5 focus:border-brand focus:shadow-[0_0_0_4px_rgba(11,63,168,0.12),0_8px_18px_-8px_rgba(11,63,168,0.45)] disabled:bg-ink-100 disabled:text-muted motion-reduce:focus:translate-y-0 sm:h-16 sm:w-[60px] ${
            invalid
              ? "border-danger bg-danger-soft focus:border-danger focus:shadow-[0_0_0_4px_rgba(220,38,38,0.12)]"
              : digit
                ? "border-brand/50 bg-brand-50 text-brand-700"
                : "border-ink-300 bg-white hover:border-ink-400"
          }`}
        />
      ))}
    </div>
  );
}
