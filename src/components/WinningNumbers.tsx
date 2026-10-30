const ORDINAL = ["1st", "2nd", "3rd"];

/** Medal colours by prize: 1st gold, 2nd silver, 3rd bronze. Index 0 = 1st prize. */
export const MEDAL = ["bg-gold-400 text-brand-800 ring-gold-600/30", "bg-silver-300 text-silver-ink ring-silver-500/60", "bg-bronze-300 text-bronze-ink ring-bronze-600/50"];

/** The three winning numbers as lottery balls in medal colours: 1st gold, 2nd silver, 3rd bronze. */
export function WinningNumbers({ numbers, size = "md" }: { numbers: string[]; size?: "sm" | "md" }) {
  const ball = MEDAL;
  return (
    <div className={`flex ${size === "sm" ? "gap-1.5" : "gap-2"}`}>
      {numbers.map((n, i) => (
        <div key={i} className="grid justify-items-center gap-1">
          <span
            className={`grid place-items-center rounded-full font-mono font-extrabold tracking-wider ring-2 ring-inset ${ball[i] ?? ball[2]} ${
              size === "sm" ? "h-8 min-w-[3.25rem] px-2 text-sm" : "h-12 min-w-[4.5rem] px-3 text-xl"
            }`}
          >
            {size === "sm" && <span className="sr-only">{ORDINAL[i]} prize </span>}
            {n}
          </span>
          {size === "md" && <span className="text-[11px] font-semibold text-muted">{ORDINAL[i]}</span>}
        </div>
      ))}
    </div>
  );
}
