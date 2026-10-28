const ORDINAL = ["1st", "2nd", "3rd"];

/** The three winning numbers as lottery balls: 1st prize gold, 2nd blue, 3rd light blue. */
export function WinningNumbers({ numbers, size = "md" }: { numbers: string[]; size?: "sm" | "md" }) {
  const ball = ["bg-gold-400 text-brand-800 ring-gold-600/30", "bg-brand text-white ring-brand-700/30", "bg-brand-100 text-brand-800 ring-brand-200"];
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
