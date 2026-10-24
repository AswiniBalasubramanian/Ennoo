import type { ReactNode, SVGProps } from "react";

export type SportIconType = (p: { size?: number; weight?: "regular" | "fill" | "duotone"; color?: string; className?: string }) => ReactNode;

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
