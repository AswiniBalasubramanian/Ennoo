import type { ComponentType, ReactNode, SVGProps } from "react";

type IconProps = { size?: number; weight?: "regular" | "fill" | "duotone"; color?: string; className?: string };
export type SportIconType = (p: IconProps) => ReactNode;
type AnyIcon = ComponentType<IconProps>;

/*
  Variants read as the base object plus a small badge, the way the reference set does it:
  bike + mountains = MTB, bike + bolt = e-bike, sneaker + screen = virtual run.
  The base sits bottom-left, a badge top-right (and optionally a second one top-left).
*/
export function combo(Main: AnyIcon, Badge: AnyIcon, Left?: AnyIcon): SportIconType {
  return function Combo({ size = 24, weight, color, className }: IconProps) {
    const p = { weight, color, className };
    return (
      <span aria-hidden style={{ position: "relative", display: "inline-block", width: size, height: size, flex: "none" }}>
        <span style={{ position: "absolute", left: 0, bottom: 0, display: "flex" }}><Main size={Math.round(size * 0.84)} {...p} /></span>
        <span style={{ position: "absolute", right: -size * 0.08, top: -size * 0.06, display: "flex" }}><Badge size={Math.round(size * 0.48)} {...p} /></span>
        {Left && <span style={{ position: "absolute", left: -size * 0.04, top: -size * 0.1, display: "flex" }}><Left size={Math.round(size * 0.44)} {...p} /></span>}
      </span>
    );
  };
}
/* Three disciplines side by side: swim, bike, run */
export function trio(A: AnyIcon, B: AnyIcon, C: AnyIcon): SportIconType {
  return function Trio({ size = 24, weight, color, className }: IconProps) {
    const p = { weight, color, className, size: Math.round(size * 0.5) };
    return <span aria-hidden style={{ display: "inline-flex", alignItems: "center", gap: size * 0.02, height: size }}><A {...p} /><B {...p} /><C {...p} /></span>;
  };
}

/*
  Racket-sport icons Phosphor doesn't ship, drawn on its 256 grid with its 16px round stroke
  so they sit beside the library icons. The 0.2-opacity shapes pick up the duotone gradient
  (.duo-icon in styles.css); weight="fill" makes them solid for the selected state.
*/
type Props = Omit<SVGProps<SVGSVGElement>, "fill" | "children"> & { size?: number; weight?: string; color?: string };

function Base({ size = 24, weight, color = "currentColor", children, ...rest }: Props & { children: (solid: boolean) => ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="none" color={color}
      stroke="currentColor" strokeWidth={14.5} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {/* scaled up a touch so the drawing fills the same box as Phosphor's (stroke compensated to stay at 16) */}
      <g transform="translate(128 128) scale(1.1) translate(-128 -128)">{children(weight === "fill")}</g>
    </svg>
  );
}
const tone = (solid: boolean) => (solid ? { fill: "currentColor" } : { fill: "currentColor", opacity: "0.2", stroke: "none" });

/* Padel: a solid, perforated paddle with a short handle */
export function PadelIcon(p: Props) {
  return (
    <Base {...p}>{(solid) => (<>
      <ellipse cx="146" cy="102" rx="62" ry="70" transform="rotate(45 146 102)" {...tone(solid)} />
      <ellipse cx="146" cy="102" rx="62" ry="70" transform="rotate(45 146 102)" />
      <path d="M102,146 56,192" strokeWidth={22} />
      {[[128, 84], [160, 84], [144, 112], [176, 116], [128, 120]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="7" fill={solid ? "var(--white, #fff)" : "currentColor"} stroke="none" />
      ))}
      <circle cx="204" cy="208" r="16" />
    </>)}</Base>
  );
}

/* Pickleball: a squared-off paddle and the holed plastic ball */
export function PickleballIcon(p: Props) {
  return (
    <Base {...p}>{(solid) => (<>
      <rect x="104" y="36" width="104" height="120" rx="34" transform="rotate(45 156 96)" {...tone(solid)} />
      <rect x="104" y="36" width="104" height="120" rx="34" transform="rotate(45 156 96)" />
      <path d="M104,152 52,204" strokeWidth={22} />
      <circle cx="200" cy="204" r="26" />
      {[[192, 196], [208, 202], [198, 214]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="5" fill="currentColor" stroke="none" />)}
    </>)}</Base>
  );
}

/* Squash: a long, narrow teardrop head on a slim throat, and the small ball */
export function SquashIcon(p: Props) {
  return (
    <Base {...p}>{(solid) => (<>
      <ellipse cx="160" cy="90" rx="42" ry="74" transform="rotate(45 160 90)" {...tone(solid)} />
      <ellipse cx="160" cy="90" rx="42" ry="74" transform="rotate(45 160 90)" />
      <path d="M118,138 50,206" />
      <circle cx="206" cy="210" r="11" fill="currentColor" stroke="none" />
    </>)}</Base>
  );
}

/* Skipping: a rope looping between two chunky handles */
export function JumpRopeIcon(p: Props) {
  return (
    <Base {...p}>{(solid) => (<>
      <path d="M64,96 C52,236 204,236 192,96" />
      <rect x="44" y="32" width="40" height="72" rx="20" {...tone(solid)} />
      <rect x="44" y="32" width="40" height="72" rx="20" />
      <rect x="172" y="32" width="40" height="72" rx="20" {...tone(solid)} />
      <rect x="172" y="32" width="40" height="72" rx="20" />
    </>)}</Base>
  );
}

/* Badminton: a shuttlecock, tilted in flight: cork nose, feathered skirt with ribs and a binding band */
export function ShuttlecockIcon(p: Props) {
  return (
    <Base {...p}>{(solid) => (
      <g transform="rotate(35 128 128)">
        <path d="M104,172 L70,52 Q128,40 186,52 L152,172 Z" {...tone(solid)} />
        <path d="M104,172 L70,52 Q128,40 186,52 L152,172" />
        <path d="M116,172 L108,50 M128,172 V46 M140,172 L148,50" strokeWidth={10} />
        <path d="M88,116 H168" strokeWidth={10} />
        <path d="M98,172 H158 V180 A30,26 0 0 1 98,180 Z" fill={solid ? "currentColor" : "none"} />
      </g>
    )}</Base>
  );
}

/* Distance: a route between a start dot and a finish pin */
export function RouteIcon(p: Props) {
  return (
    <Base {...p}>{(solid) => (<>
      <path d="M68,188 C68,128 188,156 188,96" strokeDasharray="1 26" strokeWidth={16} />
      <circle cx="68" cy="196" r="24" {...tone(solid)} />
      <circle cx="68" cy="196" r="24" />
      <path d="M188,40 a36,36 0 0 1 36,36 c0,32 -36,60 -36,60 s-36,-28 -36,-60 a36,36 0 0 1 36,-36 Z" {...tone(solid)} />
      <path d="M188,40 a36,36 0 0 1 36,36 c0,32 -36,60 -36,60 s-36,-28 -36,-60 a36,36 0 0 1 36,-36 Z" />
      <circle cx="188" cy="76" r="10" fill="currentColor" stroke="none" />
    </>)}</Base>
  );
}

/* Laps: a stadium running track, the infield left white */
export function TrackIcon(p: Props) {
  return (
    <Base {...p}>{(solid) => (<>
      <rect x="24" y="64" width="208" height="128" rx="64" {...tone(solid)} />
      <rect x="24" y="64" width="208" height="128" rx="64" />
      <rect x="68" y="104" width="120" height="48" rx="24" fill={solid ? "var(--white, #fff)" : "#fff"} />
      <path d="M128,64 V104" strokeWidth={10} />
    </>)}</Base>
  );
}

/* Performance: a stopwatch with the hand near the line */
export function StopwatchIcon(p: Props) {
  return (
    <Base {...p}>{(solid) => (<>
      <circle cx="128" cy="144" r="84" {...tone(solid)} />
      <circle cx="128" cy="144" r="84" />
      <path d="M104,28 H152 M128,28 V60 M196,72 L212,56" />
      <path d="M128,144 L168,104" strokeWidth={18} />
      <circle cx="128" cy="144" r="10" fill="currentColor" stroke="none" />
    </>)}</Base>
  );
}
