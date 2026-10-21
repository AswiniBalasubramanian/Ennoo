import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import { X, Pause, Play } from "@phosphor-icons/react";
import { StatusBar, RouteMap, type Route } from "../components";
import { byId } from "../data";

const sports = ["run", "cycle", "walk", "swim", "hike", "weights", "yoga"].map(byId);

const fmt = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${h ? h + ":" : ""}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

/* Finishing is destructive, so it asks for intent: hold, don't tap. */
function HoldToFinish({ onDone }: { onDone: () => void }) {
  const p = useMotionValue(0);
  const C = 2 * Math.PI * 36;
  const dash = useTransform(p, (v) => C * (1 - v));
  const ctrl = useRef<ReturnType<typeof animate> | null>(null);
  const start = () => { ctrl.current?.stop(); ctrl.current = animate(p, 1, { duration: 0.9, ease: "linear", onComplete: onDone }); };
  const cancel = () => { if (p.get() >= 1) return; ctrl.current?.stop(); ctrl.current = animate(p, 0, { duration: 0.25 }); };
  return (
    <button
      onPointerDown={start} onPointerUp={cancel} onPointerLeave={cancel}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onDone()}
      aria-label="Hold to finish activity"
      style={{ position: "relative", width: 80, height: 80, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,255,255,0.12)", touchAction: "none" }}
    >
      <svg width="80" height="80" style={{ position: "absolute", inset: 0, rotate: "-90deg" }} aria-hidden>
        <motion.circle cx="40" cy="40" r="36" fill="none" stroke="#3ee29a" strokeWidth="3" strokeLinecap="round" strokeDasharray={C} style={{ strokeDashoffset: dash }} />
      </svg>
      <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2, textAlign: "center" }}>Hold to<br />finish</span>
    </button>
  );
}

export default function Record({ go }: { go: (r: Route) => void }) {
  const [sport, setSport] = useState("run");
  const [phase, setPhase] = useState<"ready" | "live" | "paused">("ready");
  const [sec, setSec] = useState(0);

  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const km = sec * 0.003185; // about 5:14 per km
  const pace = sec > 20 ? fmt(Math.round(sec / km)).replace(/^0/, "") : "-:--";
  const bpm = sec > 8 ? 138 + Math.round(Math.sin(sec / 9) * 5 + Math.min(sec, 600) / 40) : null;
  const name = byId(sport).name;
  const title = phase === "ready" ? "New activity" : phase === "paused" ? "Paused" : name;

  return (
    <div className="body" style={{ background: "var(--blue)", color: "#fff", overflow: "hidden" }}>
      <StatusBar onBlue />
      <header className="pad top" style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "44px 1fr 44px", alignItems: "center" }}>
        <button className="icon-btn on-blue" aria-label="Close" onClick={() => go("home")}><X size={20} /></button>
        <span style={{ textAlign: "center", fontSize: 16, fontWeight: 600 }}>{title}</span>
      </header>

      <AnimatePresence mode="wait">
        {phase === "ready" ? (
          <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            style={{ position: "absolute", inset: "124px 0 0 0", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 20px", scrollbarWidth: "none" }}>
              {sports.map(({ id, name, Icon }) => (
                <button key={id} className="chip on-blue" aria-pressed={sport === id} onClick={() => setSport(id)}>
                  <Icon size={17} weight={sport === id ? "fill" : "duotone"} />{name}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, position: "relative", marginTop: 16 }}>
              <RouteMap tone="blue" height={420} route={false} draw={false} />
              <div style={{ position: "absolute", top: "45%", left: "50%", translate: "-50% -50%", display: "grid", placeItems: "center" }}>
                <motion.span animate={{ scale: [1, 2.6], opacity: [0.35, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                  style={{ position: "absolute", width: 22, height: 22, borderRadius: "50%", background: "#fff" }} />
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 0 0 5px rgba(255,255,255,0.25)" }} />
              </div>
            </div>
            <div className="pad" style={{ paddingBottom: 40, display: "grid", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Today's plan</p>
                  <p style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 2 }}>Easy 6 km</p>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", textAlign: "right" }}>GPS ready<br />accurate to 4 m</p>
              </div>
              <button className="btn btn-white" style={{ height: 60, fontSize: 17 }} onClick={() => setPhase("live")}>Start {name.toLowerCase()}</button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="live" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "absolute", inset: "124px 0 0 0", display: "flex", flexDirection: "column" }}>
            <div className="pad" style={{ textAlign: "center" }}>
              <p className="num" style={{ fontSize: 88, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.055em", opacity: phase === "paused" ? 0.5 : 1, transition: "opacity .3s" }}>{fmt(sec)}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>Moving time</p>
            </div>
            <div className="pad" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", marginTop: 32, textAlign: "center" }}>
              {[["Distance", km.toFixed(2), "km"], ["Avg pace", pace, "/km"], ["Heart rate", bpm ? String(bpm) : "-", "bpm"]].map(([l, v, u], i) => (
                <div key={l} style={{ borderLeft: i ? "1px solid rgba(255,255,255,0.16)" : "none" }}>
                  <p className="num" style={{ fontSize: 28, fontWeight: 600 }}>{v}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{l}, {u}</p>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", marginTop: 12 }}>
              <RouteMap tone="blue" height={232} markers={false} progress={Math.max(0.03, Math.min(km / 8.42, 1))} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, padding: "0 20px 44px" }}>
              {phase === "paused" && <HoldToFinish onDone={() => go("summary")} />}
              <button aria-label={phase === "live" ? "Pause" : "Resume"} onClick={() => setPhase(phase === "live" ? "paused" : "live")}
                style={{ width: 88, height: 88, borderRadius: "50%", display: "grid", placeItems: "center", background: "#fff", color: "var(--blue)", transition: "transform .2s" }}>
                {phase === "live" ? <Pause size={32} weight="fill" /> : <Play size={32} weight="fill" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
