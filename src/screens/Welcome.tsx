import { motion, useReducedMotion } from "motion/react";
import { StatusBar, Wordmark, type Route } from "../components";
import { collage } from "../data";

const rise = (d: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay: d, ease: [0.16, 1, 0.3, 1] as const },
});

/*
  Welcome: the existing app's idea (every sport, drifting past) told in the new cinematic voice.
  Runners photo = atmosphere. Three rows of sport photos drift in alternate directions over it,
  graded vintage so mixed stock reads as one set, and dissolve into black before the headline.
*/
function Row({ photos, dir, delay, still }: { photos: string[]; dir: 1 | -1; delay: number; still: boolean }) {
  const strip = [...photos, ...photos, ...photos];
  return (
    <motion.div initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: "hidden" }}>
      <motion.div
        style={{ display: "flex", gap: 8, width: "max-content" }}
        initial={{ x: dir === 1 ? "0%" : "-33.333%" }}
        animate={still ? undefined : { x: dir === 1 ? ["0%", "-33.333%"] : ["-33.333%", "0%"] }}
        transition={{ duration: 38 + delay * 20, repeat: Infinity, ease: "linear" }}
      >
        {strip.map((src, i) => (
          <img key={i} src={src} alt="" aria-hidden className="pill-photo" style={{ width: i % 3 === 1 ? 128 : 88 }} />
        ))}
      </motion.div>
    </motion.div>
  );
}
export default function Welcome({ go }: { go: (r: Route) => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="body" style={{ background: "#05070D", color: "#fff", overflow: "hidden" }}>
      <StatusBar onBlue />

      <motion.img
        src="/img/welcome-blur.webp" alt="A runner in motion against a blue sky"
        onError={(e) => { const i = e.currentTarget; if (!i.src.endsWith("/img/welcome.jpg")) i.src = "/img/welcome.jpg"; }}
        initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: reduce ? 1.14 : 1.04, opacity: 0.7 }}
        transition={{ scale: { duration: 6, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.9 } }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "62% 30%", filter: "saturate(0.9) contrast(1.08) brightness(0.9) sepia(0.06)" }}
      />
      {/* vintage black blend: multiply veil + vignette + bottom fade + film grain */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "#1a1f2b", mixBlendMode: "multiply", opacity: 0.3 }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 40%, rgba(5,7,13,0) 45%, rgba(5,7,13,0.7) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,7,13,0.35) 0%, rgba(5,7,13,0) 22%, rgba(5,7,13,0.05) 48%, rgba(5,7,13,0.8) 66%, rgba(5,7,13,0.96) 80%, #05070D 100%)" }} />
      <div aria-hidden className="grain" />

      {/* drifting sport collage, faded at the edges and into the copy below */}
      <div aria-hidden style={{ position: "absolute", top: 112, left: 0, right: 0, display: "grid", gap: 8,
        WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 62%, transparent 100%), linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
        WebkitMaskComposite: "source-in", maskImage: "linear-gradient(180deg, #000 0%, #000 62%, transparent 100%), linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)", maskComposite: "intersect" }}>
        {collage.map((row, i) => <Row key={i} photos={row} dir={i % 2 ? -1 : 1} delay={reduce ? 0 : 1.0 + i * 0.15} still={!!reduce} />)}
      </div>

      <motion.div {...rise(0.3)} style={{ position: "absolute", top: 66, left: 24 }}>
        <Wordmark width={104} color="#fff" />
      </motion.div>

      <div style={{ position: "absolute", left: 24, right: 24, bottom: 28 }}>
        <motion.h1 {...rise(reduce ? 0 : 1.6)} style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSizeAdjust: "none", fontSize: 41, lineHeight: 1.04, paddingBottom: 4 }}>
          Your Activities.<br /><em>Remembered Forever.</em>
        </motion.h1>
        <motion.p {...rise(reduce ? 0 : 1.75)} style={{ marginTop: 14, fontSize: 16, lineHeight: 1.5, color: "rgba(255,255,255,0.72)", maxWidth: "30ch" }}>
          Track, understand and keep everything you do, in one place.
        </motion.p>
        <motion.div {...rise(reduce ? 0 : 1.9)} style={{ display: "grid", gap: 6, marginTop: 28 }}>
          <button className="btn btn-blue" onClick={() => go("signup")}>Get started</button>
          <button className="btn" style={{ color: "rgba(255,255,255,0.86)", fontWeight: 500 }} onClick={() => go("login")}>I'm already a member</button>
        </motion.div>
      </div>
    </div>
  );
}
