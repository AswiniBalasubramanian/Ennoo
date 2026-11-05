// The nine V1 goal metrics (Ennoo spec: "Goal onboarding metrics"), their units and how a goal reads.
import { Timer, CalendarCheck, Repeat, Footprints, Hash, Scales } from "@phosphor-icons/react";
import { RouteIcon, TrackIcon, StopwatchIcon, type SportIconType } from "./sportIcons";

export type Metric = "distance" | "duration" | "sessions" | "performance" | "reps" | "laps" | "steps" | "count" | "weight";
export type DistUnit = "m" | "km" | "mi";
export type WeightUnit = "kg" | "lb";

export const METRICS: Record<Metric, { label: string; input: string; what: string; Icon: typeof Timer | SportIconType }> = {
  distance: { label: "Distance", input: "m, km or mi", what: "Reach a total distance, such as 100 km.", Icon: RouteIcon },
  duration: { label: "Duration", input: "Hours and minutes", what: "Reach a total time spent, such as 20 hours.", Icon: Timer },
  sessions: { label: "Sessions", input: "Number of sessions", what: "Do it a chosen number of times, such as 20 sessions.", Icon: CalendarCheck },
  performance: { label: "Performance", input: "Distance and target time", what: "Finish a set distance within a target time, such as 100 m in 11.52 s.", Icon: StopwatchIcon },
  reps: { label: "Reps", input: "Rep count, optional distance or saved place", what: "Complete repeated efforts, such as 10 × 400 m or 10 climbs of a saved hill.", Icon: Repeat },
  laps: { label: "Laps", input: "Lap count, optional lap distance or saved loop", what: "Complete circuits of a track or loop, such as 25 laps of a saved track.", Icon: TrackIcon },
  steps: { label: "Steps", input: "Number of steps", what: "Reach a step target, such as 1,000,000 steps.", Icon: Footprints },
  count: { label: "Count", input: "Number of skips", what: "Reach a skipping count, such as 10,000 skips.", Icon: Hash },
  weight: { label: "Body weight", input: "kg or lb", what: "Reach a target body weight, using your latest weigh-in.", Icon: Scales },
};

/* What a Reps or Laps goal counts against: nothing, a distance per effort, or a saved place */
export type Ref = { kind: "none" } | { kind: "dist"; value: number; unit: DistUnit } | { kind: "place"; id: string; name: string };

export type Goal = {
  metric: Metric;
  target: number;        // in `unit`; Duration is in hours, Performance is the target time in seconds
  current: number;       // already done (or current weight); 0 when not used
  unit: string;          // km/mi/m, h, kg/lb, or a count noun (sessions, reps, laps, steps, skips)
  perfDist?: number; perfUnit?: DistUnit;   // Performance: the distance the time is set over
  ref?: Ref;                                 // Reps and Laps
  best?: number;                             // Performance: current best in seconds, optional
  timeFmt?: "hms" | "sec";                   // Performance: h:min:s, or seconds with hundredths for sprints
};

export const cumulative = (m: Metric) => m !== "performance" && m !== "weight";
// Already done: counts toward cumulative goals; Body weight asks for the current weight instead; Performance has none
export const hasStart = (m: Metric) => m !== "performance";

export const fmtN = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
export function fmtHours(h: number) {
  const whole = Math.floor(h), min = Math.round((h - whole) * 60);
  return min ? `${fmtN(whole)} h ${min} min` : `${fmtN(whole)} h`;
}
/* 11.52 → "11.52 s", 1800 → "30:00", 5400 → "1:30:00" */
export function fmtTime(sec: number) {
  if (sec < 60) return `${sec.toFixed(2).replace(/\.00$/, "")} s`;
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const ss = (Number.isInteger(s) ? String(s) : s.toFixed(2)).padStart(Number.isInteger(s) ? 2 : 5, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}
export const refText = (r?: Ref) => (!r || r.kind === "none" ? "" : r.kind === "dist" ? `${fmtN(r.value)} ${r.unit}` : r.name);

/* The goal as one headline: a big value and a smaller unit beside it */
export function goalParts(g: Goal): { value: string; unit: string } {
  switch (g.metric) {
    case "duration": { const w = Math.floor(g.target), min = Math.round((g.target - w) * 60); return { value: fmtN(w), unit: min ? `h ${min} min` : "hours" }; }
    case "performance": return { value: fmtTime(g.target), unit: `over ${fmtN(g.perfDist ?? 0)} ${g.perfUnit}` };
    case "reps": case "laps": return { value: fmtN(g.target), unit: g.unit + (g.ref && g.ref.kind !== "none" ? ` of ${refText(g.ref)}` : "") };
    default: return { value: fmtN(g.target), unit: g.unit };
  }
}
export function goalText(g: Goal) {
  if (g.metric === "duration") return fmtHours(g.target);
  if (g.metric === "performance") return `${fmtN(g.perfDist ?? 0)} ${g.perfUnit} in ${fmtTime(g.target)}`;
  const p = goalParts(g);
  return `${p.value} ${p.unit}`;
}
/* A short amount in the goal's unit, for "done" and "a week" lines */
export const amount = (g: Goal, n: number) => (g.metric === "duration" ? fmtHours(n) : `${fmtN(n)} ${g.unit}`);

/* The goal as a sentence people would say: "Run 400 m in 52.35 s", "Complete 25 laps of Salem Steel Plant Track" */
export function goalSentence(g: Goal, verb?: string) {
  const n = fmtN(g.target);
  switch (g.metric) {
    case "distance": return `${verb ?? "Cover"} ${n} ${g.unit}`;
    case "duration": return `${verb ? `${verb} for` : "Spend"} ${fmtHours(g.target)}`;
    case "sessions": return `Complete ${n} ${g.unit}`;
    case "performance": return `${verb ?? "Finish"} ${fmtN(g.perfDist ?? 0)} ${g.perfUnit} in ${fmtTime(g.target)}`;
    case "reps": return g.ref?.kind === "dist" ? `Complete ${n} × ${refText(g.ref)}` : g.ref?.kind === "place" ? `Complete ${n} reps of ${g.ref.name}` : `Complete ${n} reps`;
    case "laps": return g.ref?.kind === "place" ? `Complete ${n} laps of ${g.ref.name}` : g.ref?.kind === "dist" ? `Complete ${n} laps of ${refText(g.ref)}` : `Complete ${n} laps`;
    case "steps": case "count": return `Reach ${n} ${g.unit}`;
    case "weight": return `Reach ${fmtN(g.target)} ${g.unit}`;
  }
}
