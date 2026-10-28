/** The lucky-clover coin. Same artwork as public/logo-mark.svg, inline so it never flashes. */
export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" className={`shrink-0 ${className}`}>
      <circle cx="32" cy="32" r="32" fill="#F6C21B" />
      <circle cx="32" cy="32" r="27.5" fill="none" stroke="#0B3FA8" strokeOpacity=".16" strokeWidth="2" />
      <g fill="#0B3FA8">
        <circle cx="24.5" cy="23.5" r="8.4" />
        <circle cx="39.5" cy="23.5" r="8.4" />
        <circle cx="24.5" cy="38.5" r="8.4" />
        <circle cx="39.5" cy="38.5" r="8.4" />
      </g>
      <path d="M33 44c1.5 4.5 3.6 7.6 7 10" fill="none" stroke="#0B3FA8" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

interface Props {
  size?: number;
  /** "light" on the blue brand colour, "dark" on white. */
  tone?: "light" | "dark";
  tagline?: boolean;
  /** Use h1 on screens where the logo is the page title (sign-in). */
  as?: "h1" | "div";
}

/** Mark + "HopiSuerte" wordmark, optionally with the tagline under it. */
export default function Logo({ size = 40, tone = "light", tagline = false, as: Tag = "div" }: Props) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <LogoMark size={size} />
      <div className="min-w-0 leading-none">
        <Tag className={`font-display font-extrabold tracking-tight whitespace-nowrap ${tone === "light" ? "text-white" : "text-brand"}`} style={{ fontSize: size * 0.58, lineHeight: 1.1 }}>
          Hopi<span className={tone === "light" ? "text-gold-400" : "text-gold-600"}>Suerte</span>
        </Tag>
        {tagline && <p className={`mt-1 text-sm italic ${tone === "light" ? "text-white/75" : "text-muted"}`}>Tú suerte, nuestro compromiso</p>}
      </div>
    </div>
  );
}
