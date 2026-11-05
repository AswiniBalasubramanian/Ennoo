import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import lottie from "lottie-web/build/player/lottie_light";
import { StatusBar, type Route } from "../components";
import { byId, collage } from "../data";
import { goalSentence } from "../metrics";
import { pops } from "../lottie/celebrate";
import type { Profile } from "./Onboarding";

const rise = (d: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: d, ease: [0.16, 1, 0.3, 1] as const },
});

/* the Welcome screen's sport carousel, but each photo pops in on a spring before the rows start to drift */
const TILES = [{ w: 112, r: 30 }, { w: 84, r: 42 }, { w: 100, r: 24 }, { w: 120, r: 42 }, { w: 88, r: 30 }, { w: 108, r: 24 }];
function PopRow({ photos, dir, row, still }: { photos: string[]; dir: 1 | -1; row: number; still: boolean }) {
  const strip = [...photos, ...photos, ...photos];
  return (
    <div style={{ overflow: "hidden", padding: "6px 0" }}>
      <motion.div style={{ display: "flex", gap: 8, width: "max-content" }}
        initial={{ x: dir === 1 ? "-8%" : "-25%" }}
        animate={still ? undefined : { x: dir === 1 ? ["-8%", "-41.333%"] : ["-25%", "8.333%"] }}
        transition={{ duration: 46 + row * 8, delay: 1.2, repeat: Infinity, ease: "linear" }}>
        {strip.map((src, i) => {
          const t = TILES[(i + row * 2) % TILES.length];
          // only the tiles that start on screen pop; the rest are already there when they drift in
          const k = i % photos.length;
          return (
            <motion.img key={i} src={src} alt="" aria-hidden className="pill-photo" style={{ width: t.w, height: 84, borderRadius: t.r }}
              initial={still ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.15 + row * 0.12 + k * 0.07 }} />
          );
        })}
      </motion.div>
    </div>
  );
}

/* Shown once, right after "Create goal": a short celebration before Home. */
export default function Hello({ go, profile }: { go: (r: Route) => void; profile: Profile | null }) {
  const box = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  useEffect(() => {
    if (!box.current || reduce) return;
    const a = lottie.loadAnimation({ container: box.current, renderer: "svg", loop: false, autoplay: true, animationData: pops });
    return () => a.destroy();
  }, [reduce]);
  // no button: the moment plays, then Home takes over
  useEffect(() => { const t = setTimeout(() => go("home"), 4500); return () => clearTimeout(t); }, [go]);

  const name = profile?.name.trim();
  const verb = profile ? byId(profile.activity).name : "";
  const goal = profile ? `${goalSentence(profile.goal, verb)} by ${profile.due}` : null;

  return (
    <div className="body" style={{ background: "#fff", overflow: "hidden" }}>
      <StatusBar />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 40% at 50% 26%, var(--blue-50) 0%, rgba(238,243,255,0) 100%)" }} />

      {/* popping carousel, faded at the sides, with confetti pops over it */}
      <div aria-hidden style={{ position: "absolute", top: 70, left: 0, right: 0,
        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)", maskImage: "linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)" }}>
        {collage.map((row, i) => <PopRow key={i} photos={row} dir={i % 2 ? -1 : 1} row={i} still={reduce} />)}
      </div>
      <div ref={box} aria-hidden style={{ position: "absolute", top: 40, left: "50%", width: 400, height: 400, marginLeft: -200, pointerEvents: "none" }} />

      <div style={{ position: "absolute", left: 24, right: 24, top: 404 }}>
        <div style={{ textAlign: "center" }}>
          <motion.h1 {...rise(0.9)} className="title" style={{ fontSize: 30, display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
            Hi{name ? ` ${name}` : " there"}
            <motion.span role="img" aria-label="waving hand" style={{ display: "inline-block", transformOrigin: "70% 80%" }}
              animate={reduce ? undefined : { rotate: [0, 18, -8, 16, -4, 10, 0] }} transition={{ duration: 1.4, delay: 1.3, ease: "easeInOut" }}>
              👋
            </motion.span>
          </motion.h1>
          <motion.p {...rise(1.05)} style={{ fontSize: 20, fontWeight: 600, marginTop: 6 }}>Welcome to Ennoo</motion.p>
          {goal && (
            <motion.div {...rise(1.2)} style={{ margin: "20px auto 0", padding: "12px 16px", borderRadius: 16, background: "var(--bg)", maxWidth: 300 }}>
              <p className="cap" style={{ fontSize: 13 }}>Your goal is set</p>
              <p style={{ fontSize: 15, fontWeight: 600, marginTop: 2, color: "var(--blue)" }}>{goal}</p>
            </motion.div>
          )}
        </div>
      </div>
      <motion.p {...rise(1.35)} className="cap" aria-live="polite" style={{ position: "absolute", left: 0, right: 0, bottom: 36, textAlign: "center", fontSize: 13 }}>Taking you home…</motion.p>
    </div>
  );
}
