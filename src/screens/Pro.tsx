import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Target, Trophy, Barbell, ChartLineUp, ShieldCheck, Gift, CreditCard, ArrowsClockwise } from "@phosphor-icons/react";
import { StatusBar, SportIcon, type Route } from "../components";
import { WORD } from "../wordmark";
import { activities } from "../data";

// Prices from the shipped app. Per-month figures are recalculated (499 / 12 = 41.58).
const plans = [
  { id: "annual", name: "Annual", access: "12 months access", price: "₹499", per: "/ year", monthly: "₹41.58 / mo", trial: 15, ends: "5 Nov 2026", badges: ["Save 58%", "Best value"] },
  { id: "quarter", name: "3 months", access: "3 months access", price: "₹149", per: "/ 3 months", monthly: "₹49.67 / mo", trial: 15, ends: "5 Nov 2026", badges: ["Save 50%", "Most popular"] },
  { id: "monthly", name: "Monthly", access: "Renews every month", price: "₹99", per: "/ month", monthly: "₹99 / mo", trial: 7, ends: "28 Oct 2026", badges: ["Flexible"] },
] as const;

const features = [
  { I: Target, t: "Smart countdown", d: "Pacing, deadline projections and a daily countdown for every goal." },
  { I: Trophy, t: "All-time personal bests", d: "Auto-detects your 1RMs, fastest 5Ks, longest rides and highest climbs." },
  { I: Barbell, t: `${activities.length} sports, with sets and reps`, d: "Full workout logs, barbell splits, conditioning, water, snow and team sports." },
  { I: ChartLineUp, t: "Deep analytics", d: "Training heatmaps, monthly volume charts and achievements." },
  { I: ShieldCheck, t: "Ad-free, with cloud sync", d: "Every workout backed up securely on all your devices." },
];
/* The full ENNOO wordmark as a premium object: satin black body, a cool silver rim catching the
   light along the top edges, a soft contact shadow, and one silver sheen across it on arrival. */
function ProMark() {
  const reduce = useReducedMotion();
  const W = 210, H = 210 * (241.81 / 1920);
  const paths = Object.values(WORD);
  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "relative", width: W, margin: "18px auto 10px" }}>
      <div aria-hidden style={{ position: "absolute", left: "12%", right: "12%", bottom: -10, height: 10, borderRadius: "50%", background: "rgba(11,13,18,0.22)", filter: "blur(7px)" }} />
      <svg viewBox="0 0 1920 241.81" width={W} height={H} role="img" aria-label="Ennoo" style={{ display: "block", overflow: "visible" }}>
        <defs>
          {/* satin black: lifted at the top, deepest just below the middle, a faint return of light at the base */}
          <linearGradient id="pm-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4A4F59" />
            <stop offset="0.28" stopColor="#1C1F25" />
            <stop offset="0.62" stopColor="#0A0B0E" />
            <stop offset="1" stopColor="#23262D" />
          </linearGradient>
          {/* silver rim, brightest on the upper edges */}
          <linearGradient id="pm-rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F2F4F7" />
            <stop offset="0.45" stopColor="#9AA1AC" stopOpacity="0.6" />
            <stop offset="1" stopColor="#5B616C" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="pm-sheen" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#E9EDF2" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="pm-clip">{paths.map((d) => <path key={d.slice(0, 12)} d={d} />)}</clipPath>
        </defs>
        <g filter="drop-shadow(0 10px 14px rgba(11,13,18,0.28))">
          {paths.map((d) => <path key={d.slice(0, 12)} d={d} fill="url(#pm-body)" stroke="url(#pm-rim)" strokeWidth="7" strokeLinejoin="round" paintOrder="stroke" />)}
        </g>
        {!reduce && (
          <g clipPath="url(#pm-clip)">
            <motion.rect y="-40" width="520" height="322" fill="url(#pm-sheen)" initial={{ x: -620 }} animate={{ x: 2000 }}
              transition={{ delay: 0.55, duration: 1.4, ease: [0.45, 0, 0.2, 1] }} style={{ transformBox: "fill-box" }} />
          </g>
        )}
      </svg>
    </motion.div>
  );
}

export default function Pro({ go }: { go: (r: Route) => void }) {
  const [plan, setPlan] = useState<(typeof plans)[number]["id"]>("annual");
  const p = plans.find((x) => x.id === plan)!;

  return (
    <div className="body" style={{ background: "var(--white)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <header className="pad top" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", flex: "none" }}>
        <button className="icon-btn" aria-label="Back" onClick={() => go("home")}><ArrowLeft size={20} /></button>
        {/* the full wordmark sits below, so the badge only names the tier, in the same black and silver */}
        <span style={{ display: "inline-flex", alignItems: "center", height: 28, padding: "0 14px", borderRadius: 999,
          background: "linear-gradient(180deg, #3A3F48 0%, #14161B 55%, #0A0B0E 100%)", boxShadow: "inset 0 1px 0 rgba(242,244,247,0.35), 0 2px 6px -2px rgba(11,13,18,0.4)",
          color: "#E9ECF1", fontSize: 13, fontWeight: 650, letterSpacing: "0.02em" }}>
          Pro
        </span>
        <button onClick={() => go("home")} style={{ justifySelf: "end", fontSize: 14, fontWeight: 560, color: "var(--gray)", padding: "10px 4px", whiteSpace: "nowrap" }}>Skip for now</button>
      </header>

      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        <div className="pad" style={{ paddingTop: 22, paddingBottom: 24 }}>
          <ProMark />
          <h1 className="title" style={{ textAlign: "center", marginTop: 18 }}>Unlock your full potential</h1>
          <p className="meta" style={{ textAlign: "center", fontSize: 15, lineHeight: 1.5, marginTop: 8, maxWidth: "32ch", marginInline: "auto" }}>
            Reach your milestones faster with advanced tracking, all {activities.length} sports and all-time personal bests.
          </p>

          <div className="sec" style={{ marginTop: 22 }}><h2 className="h2">Choose your plan</h2><span className="cap">All Pro features</span></div>
          <div role="radiogroup" aria-label="Plans" style={{ display: "grid", gap: 10 }}>
            {plans.map((x) => {
              const on = x.id === plan;
              return (
                <button key={x.id} role="radio" aria-checked={on} onClick={() => setPlan(x.id)}
                  style={{ textAlign: "left", padding: 16, borderRadius: 20, border: `1.5px solid ${on ? "var(--blue)" : "var(--line)"}`, background: on ? "var(--blue-50)" : "#fff", transition: "all .2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 17, fontWeight: 600, color: on ? "var(--blue)" : "var(--ink)" }}>{x.name}</span>
                    <span style={{ display: "flex", gap: 6 }}>
                      {x.badges.map((b, i) => (
                        <span key={b} style={{ height: 24, padding: "0 9px", borderRadius: 999, fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center",
                          background: i === 1 ? (x.id === "annual" ? "var(--blue)" : "var(--ink)") : "#fff", color: i === 1 ? "#fff" : "var(--blue)", border: i === 1 ? "none" : "1px solid var(--blue-100)" }}>{b}</span>
                      ))}
                    </span>
                  </div>
                  <span className="cap">{x.access}</span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 10 }}>
                    <span className="num" style={{ fontSize: 28, fontWeight: 600 }}>{x.price}<span style={{ fontSize: 14, fontWeight: 400, color: "var(--gray)", letterSpacing: 0 }}> {x.per}</span></span>
                    <span className="num cap" style={{ fontSize: 13, letterSpacing: 0 }}>{x.monthly}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, padding: "10px 12px", borderRadius: 12, background: on ? "#fff" : "var(--bg)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 560, color: "var(--blue)" }}><Gift size={16} weight="duotone" />{x.trial}-day free trial included</span>
                    <span aria-hidden style={{ width: 20, height: 20, borderRadius: "50%", border: on ? "6px solid var(--blue)" : "1.5px solid var(--gray-2)", background: "#fff", transition: "all .2s" }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* what every plan includes, right after the prices */}
          <div className="sec" style={{ marginTop: 24 }}><h2 className="h2">Everything in Pro</h2></div>
          <div className="card" style={{ padding: "6px 18px" }}>
            {features.map(({ I, t, d }, i) => (
              <div key={t} style={{ display: "flex", gap: 14, padding: "14px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: "var(--blue-50)", display: "grid", placeItems: "center", flex: "none" }}><SportIcon Icon={I} size={21} /></span>
                <span>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{t}</span>
                  <span className="cap" style={{ fontSize: 13, lineHeight: 1.45 }}>{d}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: 14, padding: "12px 10px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", textAlign: "center" }}>
            {[[ShieldCheck, "Cancel anytime"], [CreditCard, "No charge today"], [ArrowsClockwise, "Restore anytime"]].map(([I, l]) => {
              const Icon = I as typeof ShieldCheck;
              return <span key={l as string} style={{ display: "grid", justifyItems: "center", gap: 4, fontSize: 12, fontWeight: 560 }}><Icon size={20} weight="duotone" color="var(--blue)" />{l as string}</span>;
            })}
          </div>
          <p className="cap" style={{ textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
            {p.price} billed {p.id === "annual" ? "yearly" : p.id === "quarter" ? "every 3 months" : "monthly"} after your {p.trial}-day free trial. Cancel before {p.ends} and you won't be charged.
          </p>
        </div>
      </div>

      <div style={{ flex: "none", padding: "12px 20px 26px", background: "#fff", borderTop: "1px solid var(--line)" }}>
        <button className="btn btn-blue" style={{ width: "100%" }} onClick={() => go("home")}>Start {p.trial}-day free trial</button>
        <div style={{ display: "flex", justifyContent: "center", gap: 22, marginTop: 10 }}>
          {["Restore purchase", "Terms", "Privacy"].map((l) => <button key={l} className="cap" style={{ fontSize: 13, padding: 4 }}>{l}</button>)}
        </div>
      </div>
    </div>
  );
}
