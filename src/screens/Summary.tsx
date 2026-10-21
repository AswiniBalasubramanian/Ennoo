import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CaretLeft, ShareNetwork, Trophy, ImageSquare, Check, Target } from "@phosphor-icons/react";
import { StatusBar, type Route } from "../components";
import { entries } from "../data";

const splits = [331, 322, 315, 309, 306, 304, 311, 318]; // seconds per km
const best = Math.min(...splits);
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const feelWords = ["", "Barely moving", "Very easy", "Easy", "Comfortable", "Steady", "Working", "Hard", "Very hard", "Near max", "All out"];

/* Route traced over the park paths in /img/aerial.jpg (900 x 1100 space). */
const ROUTE = "M368 1100 C 362 1000, 345 900, 318 820 S 262 712, 236 650 S 228 590, 262 568 S 330 640, 372 690 S 470 735, 548 768 S 680 830, 742 890 S 790 960, 770 1010 S 700 1080, 640 1100";
const KM: [number, number, string][] = [[318, 820, "2"], [250, 600, "4"], [548, 768, "6"], [766, 950, "8"]];

export default function Summary({ go }: { go: (r: Route) => void }) {
  const a = entries[0];
  const [feel, setFeel] = useState(a.feel);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="body" style={{ background: "#070A12", color: "#fff" }}>
      <StatusBar onBlue />

      {/* Aerial hero with the route drawn in light */}
      <div style={{ position: "relative", height: 470 }}>
        <img src="/img/aerial.jpg" alt="Aerial view of the river and park where the run happened"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 78%", filter: "saturate(0.9) brightness(0.92)" }} />
        <svg viewBox="0 380 900 720" preserveAspectRatio="xMidYMax slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
          <defs>
            <linearGradient id="rt" x1="0" x2="1"><stop offset="0" stopColor="#2FD4EC" /><stop offset="1" stopColor="#3EE29A" /></linearGradient>
            <filter id="rglow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10" /></filter>
          </defs>
          <motion.path d={ROUTE} fill="none" stroke="#7DF2FF" strokeWidth="26" strokeLinecap="round" opacity="0.45" filter="url(#rglow)"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, delay: 0.3, ease: [0.65, 0, 0.35, 1] }} />
          <motion.path d={ROUTE} fill="none" stroke="#ffffff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, delay: 0.3, ease: [0.65, 0, 0.35, 1] }} />
          <motion.path d={ROUTE} fill="none" stroke="url(#rt)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, delay: 0.3, ease: [0.65, 0, 0.35, 1] }} />
          {KM.map(([x, y, t], i) => (
            <motion.g key={t} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.25 }}>
              <circle cx={x} cy={y} r="24" fill="#fff" />
              <text x={x} y={y + 8} textAnchor="middle" fontSize="22" fontWeight="700" fill="#0054FB" fontFamily="Inter Variable">{t}</text>
            </motion.g>
          ))}
        </svg>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,10,18,0.55) 0%, rgba(7,10,18,0) 24%, rgba(7,10,18,0) 70%, #070A12 100%)" }} />
        <header className="pad top" style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
          <button className="icon-btn on-blue" aria-label="Back" onClick={() => go("home")}><CaretLeft size={20} /></button>
          <button className="icon-btn on-blue" aria-label="Share activity"><ShareNetwork size={19} /></button>
        </header>
      </div>

      {/* Dark glass sheet */}
      <motion.section initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", marginTop: -64, borderRadius: "28px 28px 0 0", padding: "12px 20px 40px",
          background: "linear-gradient(180deg, rgba(22,28,44,0.82), #070A12 140px)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <span aria-hidden style={{ display: "block", width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.25)", margin: "0 auto" }} />
        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 14 }}>{a.when}, Chennai</p>
        <h1 style={{ textAlign: "center", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>{a.title}</h1>

        <p className="num" style={{ textAlign: "center", fontSize: 76, fontWeight: 600, lineHeight: 1, marginTop: 18 }}>
          8.42<span style={{ fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,0.6)", letterSpacing: 0 }}> km</span>
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <span className="chip-glass"><Target size={15} />Goal <strong>742 / 1,000 km</strong></span>
          {a.pb && <span className="chip-glass" style={{ borderColor: "rgba(62,226,154,0.5)" }}><Trophy size={15} weight="fill" color="#3EE29A" />5K in <strong>24:18</strong></span>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", textAlign: "center", marginTop: 26, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {[["5:14", "avg pace /km"], [a.duration, "moving time"], ["152", "avg bpm"]].map(([v, l], i) => (
            <div key={l} style={{ borderLeft: i ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
              <p className="num" style={{ fontSize: 22, fontWeight: 600 }}>{v}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{l}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 15, lineHeight: 1.55, color: "rgba(255,255,255,0.78)", marginTop: 22 }}>
          You started cautious and finished strong: the second half was 9 seconds per km faster, with your quickest kilometre at 6.
        </p>

        {/* Splits */}
        <div className="sec"><h2 className="h2">Splits</h2><span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>per km</span></div>
        <div style={{ display: "grid", gap: 10 }}>
          {splits.map((s, i) => {
            const top = s === best;
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "18px 1fr 40px", alignItems: "center", gap: 12, fontSize: 13 }}>
                <span className="num" style={{ color: "rgba(255,255,255,0.45)" }}>{i + 1}</span>
                <motion.span initial={{ width: 0 }} animate={{ width: `${40 + ((340 - s) / 40) * 60}%` }} transition={{ delay: 0.5 + i * 0.04, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: 8, borderRadius: 4, background: top ? "var(--splash)" : "linear-gradient(90deg,#0041D6,#3D8BFF)", opacity: top ? 1 : 0.75 }} />
                <span className="num" style={{ textAlign: "right", fontWeight: top ? 600 : 400, color: top ? "#fff" : "rgba(255,255,255,0.65)" }}>{mmss(s)}</span>
              </div>
            );
          })}
        </div>

        {/* Journal */}
        <h2 className="h2" style={{ marginTop: 32 }}>How did it feel?</h2>
        <div role="radiogroup" aria-label="Perceived effort, 1 to 10" style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 5, marginTop: 12 }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button key={n} role="radio" aria-checked={feel === n} aria-label={`${n}, ${feelWords[n]}`} onClick={() => setFeel(n)} className="num"
              style={{ height: 40, borderRadius: 12, fontSize: 14, fontWeight: 560, letterSpacing: 0, transition: "all .2s",
                background: n === feel ? "linear-gradient(180deg,#3D8BFF,#0054FB)" : n < feel ? "rgba(61,139,255,0.18)" : "rgba(255,255,255,0.06)",
                color: n <= feel ? "#fff" : "rgba(255,255,255,0.5)", border: `1px solid ${n === feel ? "transparent" : "rgba(255,255,255,0.1)"}` }}>
              {n}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 13, marginTop: 10, color: "rgba(255,255,255,0.6)" }}><span style={{ color: "#fff", fontWeight: 560 }}>{feelWords[feel]}.</span> Effort {feel} of 10</p>

        <label htmlFor="note" className="h2" style={{ display: "block", marginTop: 28 }}>Note to future you</label>
        <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="What worked, what didn't, what you noticed"
          style={{ width: "100%", marginTop: 10, padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, lineHeight: 1.5, resize: "none", outlineColor: "#3D8BFF" }} />
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Private unless you share the activity.</p>

        <div style={{ display: "grid", gridTemplateColumns: "54px 1fr", gap: 10, marginTop: 22 }}>
          <button className="btn btn-glass" aria-label="Add photo" style={{ width: 54, height: 54, padding: 0 }}><ImageSquare size={22} /></button>
          <button className="btn btn-blue" onClick={() => { setSaved(true); setTimeout(() => go("timeline"), 800); }}>
            <AnimatePresence mode="wait" initial={false}>
              {saved
                ? <motion.span key="s" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><Check size={18} weight="bold" />Saved</motion.span>
                : <motion.span key="n" exit={{ y: -8, opacity: 0 }}>Save to journal</motion.span>}
            </AnimatePresence>
          </button>
        </div>
      </motion.section>
    </div>
  );
}
