import { useEffect, useMemo, useRef, useState } from "react";
import type { CountryCode } from "libphonenumber-js/min";
import { COUNTRIES, flagUrl } from "../lib/phone";

type Props = { value: CountryCode; onChange: (code: CountryCode) => void };

function Flag({ code }: { code: string }) {
  return <img src={flagUrl(code)} alt="" width={22} height={16} loading="lazy" className="h-4 w-[22px] shrink-0 rounded-[3px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,0.1)]" />;
}

/** Flag + dial code button that opens a searchable list of countries. */
export default function CountrySelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const selected = COUNTRIES.find((c) => c.code === value) ?? COUNTRIES[0];

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q || c.dial.startsWith(q));
  }, [query]);

  const pick = (code: CountryCode) => {
    onChange(code);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={root} className="relative mx-2 shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country: ${selected.name}, +${selected.dial}. Change country`}
        className="flex h-10 items-center gap-2 rounded-[10px] bg-ink-100 px-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-200/70"
      >
        <Flag code={selected.code} />
        +{selected.dial}
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-12 left-0 z-30 w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-xl border border-line bg-white shadow-[0_16px_40px_rgba(15,30,70,0.2)]">
          <div className="border-b border-line p-2">
            <input
              ref={search}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              aria-label="Search country or code"
              className="h-10 w-full rounded-lg bg-ink-100 px-3 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <ul role="listbox" aria-label="Country" className="max-h-64 overflow-y-auto py-1">
            {matches.map((c) => (
              <li key={c.code} role="option" aria-selected={c.code === value}>
                <button
                  type="button"
                  onClick={() => pick(c.code)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-brand-50 ${c.code === value ? "bg-brand-50 font-semibold" : ""}`}
                >
                  <Flag code={c.code} />
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="text-muted">+{c.dial}</span>
                </button>
              </li>
            ))}
            {matches.length === 0 && <li className="px-3 py-4 text-center text-sm text-muted">No country found</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
