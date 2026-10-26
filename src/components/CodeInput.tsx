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
    <div className="flex justify-center gap-3" role="group" aria-label="Login code">
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
          className={`h-16 w-14 rounded-xl border-2 bg-white text-center text-3xl font-bold outline-none transition focus:border-brand disabled:opacity-50 ${
            invalid ? "border-danger" : "border-line"
          }`}
        />
      ))}
    </div>
  );
}
