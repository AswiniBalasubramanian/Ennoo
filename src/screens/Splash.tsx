import { useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { StatusBar, type Route } from "../components";
import { WORD } from "../wordmark";

/*
  Splash choreography (seconds)
  0.20  ENN wipes in along its slant
  0.70  the OO loop traces its own outline in cyan
  1.70  the blue/cyan mesh floods the loop, outline fades
  2.10  a light runs the infinity twice, a figure-eight, never a spin
  2.40  tagline
  4.60  hand off to Welcome (the loader line fills over exactly this time)
*/
const TOTAL = 4.6;

const blobs = [
  { c: "#0054FB", cx: [1330, 1420, 1330], cy: [150, 90, 150], r: 230 },
  { c: "#2FD4EC", cx: [1520, 1440, 1520], cy: [40, 130, 40], r: 200 },
  { c: "#0A2FD0", cx: [1700, 1780, 1700], cy: [200, 120, 200], r: 240 },
  { c: "#38E8FF", cx: [1860, 1760, 1860], cy: [60, 30, 60], r: 170 },
];

/* Points on a lemniscate fitted to the OO loop, so the light follows the figure-eight. */
function lemniscate(n = 48) {
  const cx = 1562, cy = 121, a = 300;
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const d = 1 + Math.sin(t) ** 2;
    xs.push(cx + (a * Math.cos(t)) / d);
    ys.push(cy + (a * 1.15 * Math.sin(t) * Math.cos(t)) / d);
  }
  return { xs, ys };
}

export function SplashLogo({ width = 230, animate = true }: { width?: number; animate?: boolean }) {
  const path = useMemo(() => lemniscate(), []);
  const s = (d: number) => (animate ? d : 0);
  return (
    <svg viewBox="0 -40 1920 322" width={width} role="img" aria-label="Ennoo" style={{ overflow: "visible", display: "block" }}>
      <defs>
        <clipPath id="oo-clip"><path d={WORD.oo} /></clipPath>
        <filter id="mesh-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60" /></filter>
        <filter id="glow" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="46" /></filter>
        <filter id="spark" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="28" /></filter>
      </defs>

      {/* glow behind the loop arrives with the fill */}
      <motion.path d={WORD.oo} fill="#1F6BFF" filter="url(#glow)"
        initial={{ opacity: animate ? 0 : 0.55 }} animate={{ opacity: 0.55 }} transition={{ delay: s(1.8), duration: 1 }} />

      {/* ENN */}
      <motion.g
        initial={animate ? { clipPath: "polygon(0 0, 0 0, -12% 100%, -12% 100%)" } : false}
        animate={{ clipPath: "polygon(0 0, 112% 0, 100% 100%, -12% 100%)" }}
        transition={{ duration: 0.8, delay: s(0.2), ease: [0.65, 0, 0.35, 1] }}
        fill="#FFFFFF"
      >
        {[WORD.e1, WORD.e2, WORD.n1, WORD.n2].map((d) => <path key={d.slice(0, 10)} d={d} />)}
      </motion.g>

      {/* OO: mesh fill */}
      <motion.g clipPath="url(#oo-clip)" initial={{ opacity: animate ? 0 : 1 }} animate={{ opacity: 1 }} transition={{ delay: s(1.7), duration: 0.6 }}>
        <rect x="1180" y="-40" width="760" height="320" fill="#0054FB" />
        <g filter="url(#mesh-blur)">
          {blobs.map((b, i) => (
            <motion.circle key={i} r={b.r} fill={b.c}
              initial={{ cx: b.cx[0], cy: b.cy[0] }}
              animate={animate ? { cx: b.cx, cy: b.cy } : { cx: b.cx[0], cy: b.cy[0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }} />
          ))}
        </g>
        {/* the light that runs the figure-eight */}
        {animate && (
          <motion.circle r="90" fill="#E8FDFF" filter="url(#spark)"
            initial={{ cx: path.xs[0], cy: path.ys[0], opacity: 0 }}
            animate={{ cx: [...path.xs, ...path.xs.slice(1)], cy: [...path.ys, ...path.ys.slice(1)], opacity: [0, 0.95, 0.95, 0.95, 0] }}
            transition={{ delay: 2.1, duration: 2.3, ease: "linear", opacity: { delay: 2.1, duration: 2.3, times: [0, 0.08, 0.5, 0.9, 1] } }} />
        )}
      </motion.g>

      {/* OO: outline trace, then it hands over to the fill */}
      {animate && (
        <motion.path d={WORD.oo} fill="none" stroke="#2FD4EC" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{ pathLength: 1, opacity: [1, 1, 0] }}
          transition={{ pathLength: { delay: 0.7, duration: 1.1, ease: [0.65, 0, 0.35, 1] }, opacity: { delay: 0.7, duration: 1.7, times: [0, 0.65, 1] } }} />
      )}
    </svg>
  );
}

export default function Splash({ go }: { go: (r: Route) => void }) {
  const reduce = useReducedMotion();
  const total = reduce ? 1.6 : TOTAL;

  useEffect(() => {
    const t = setTimeout(() => go("welcome"), total * 1000);
    return () => clearTimeout(t);
  }, [go, total]);

  return (
    <div className="body" style={{ background: "#05070D", display: "grid", placeItems: "center", color: "#fff", overflow: "hidden" }}>
      {/* same runners photo and vintage black blend as Welcome, kept darker so the loop leads */}
      <motion.img
        src="/img/welcome-runners.webp" alt="" aria-hidden
        onError={(e) => { const i = e.currentTarget; if (!i.src.endsWith("/img/welcome.jpg")) i.src = "/img/welcome.jpg"; }}
        initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: reduce ? 1.2 : 1.14, opacity: 0.42 }}
        transition={{ scale: { duration: total, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 1.2, delay: reduce ? 0 : 0.1 } }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "52% 34%", filter: "saturate(0.72) contrast(1.12) brightness(0.86) sepia(0.12)" }}
      />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "#1a1f2b", mixBlendMode: "multiply", opacity: 0.55 }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 34% at 50% 50%, rgba(5,7,13,0.72) 0%, rgba(5,7,13,0) 100%), radial-gradient(120% 80% at 50% 45%, rgba(5,7,13,0) 40%, rgba(5,7,13,0.85) 100%)" }} />
      <div aria-hidden className="grain" />
      <StatusBar onBlue />
      <div style={{ position: "relative", display: "grid", justifyItems: "center", gap: 22 }}>
        <div style={{ padding: "12px 6px" }}><SplashLogo animate={!reduce} /></div>
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 2.4, duration: 0.6 }}
          style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, letterSpacing: "0.01em" }}>
          Your sports companion
        </motion.p>
      </div>
      <span aria-hidden style={{ position: "absolute", left: "38%", right: "38%", bottom: 64, height: 2, borderRadius: 2, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
        <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: total, ease: "linear" }}
          style={{ display: "block", height: "100%", background: "linear-gradient(90deg,#0054FB,#2FD4EC)", transformOrigin: "left" }} />
      </span>
    </div>
  );
}
