import type { CSSProperties } from "react";

type Pos = { top?: string; right?: string; bottom?: string; left?: string };

interface Ball {
  n: string;
  kind: "gold" | "glass";
  size: number;
  /** Where it sits on wide screens (percent of the stage). */
  pos: Pos;
  /** Phones and tablets: smaller and kept clear of the logo. Without it the ball is hidden there. */
  mobile?: Pos & { size: number };
  dur: number;
  delay: number;
  dx: number;
  dy: number;
  rot: number;
}

const BALLS: Ball[] = [
  { n: "07", kind: "gold", size: 112, pos: { top: "9%", left: "40%" }, mobile: { top: "17%", right: "-2%", size: 84 }, dur: 13, delay: 0, dx: 12, dy: -16, rot: 8 },
  { n: "88", kind: "glass", size: 88, pos: { top: "5%", right: "6%" }, mobile: { top: "2.5%", right: "34%", size: 50 }, dur: 15, delay: -7, dx: -14, dy: 12, rot: -8 },
  { n: "24", kind: "glass", size: 72, pos: { top: "70%", left: "1%" }, dur: 11, delay: -3, dx: -10, dy: 14, rot: -6 },
  { n: "13", kind: "gold", size: 54, pos: { bottom: "6%", left: "36%" }, dur: 9, delay: -5, dx: 10, dy: -12, rot: 10 },
  { n: "42", kind: "glass", size: 46, pos: { bottom: "14%", right: "5%" }, dur: 10, delay: -2, dx: 12, dy: -10, rot: 6 },
  { n: "61", kind: "gold", size: 60, pos: { top: "36%", left: "47%" }, dur: 12, delay: -8, dx: -12, dy: -14, rot: -10 },
];

const vars = (prefix: string, p: Pos & { size: number }) => ({
  [`--${prefix}top`]: p.top ?? "auto",
  [`--${prefix}right`]: p.right ?? "auto",
  [`--${prefix}bottom`]: p.bottom ?? "auto",
  [`--${prefix}left`]: p.left ?? "auto",
  [`--${prefix}size`]: `${p.size}px`,
});

/** The animated background of the sign-in page: two drifting glows, a dot grid and floating lottery balls. */
export default function AuthBackdrop() {
  return (
    <div aria-hidden="true">
      <div className="auth-glow auth-glow--gold" />
      <div className="auth-glow auth-glow--blue" />
      <div className="auth-dots" />
      {BALLS.map((b) => (
        <div
          key={b.n}
          className={`auth-ball auth-ball--${b.kind} ${b.mobile ? "" : "auth-ball--wide"}`}
          style={
            {
              ...vars("", { ...b.pos, size: b.size }),
              ...(b.mobile ? vars("m-", b.mobile) : {}),
              "--dur": `${b.dur}s`,
              "--delay": `${b.delay}s`,
              "--dx": `${b.dx}px`,
              "--dy": `${b.dy}px`,
              "--rot": `${b.rot}deg`,
            } as CSSProperties
          }
        >
          <span>{b.n}</span>
        </div>
      ))}
    </div>
  );
}
