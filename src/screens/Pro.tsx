import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Target, Trophy, Barbell, ChartLineUp, ShieldCheck, Gift, CreditCard, ArrowsClockwise } from "@phosphor-icons/react";
import { StatusBar, SportIcon, type Route } from "../components";

// Prices from the shipped app. Per-month figures are recalculated (499 / 12 = 41.58).
const plans = [
  { id: "annual", name: "Annual", access: "12 months access", price: "₹499", per: "/ year", monthly: "₹41.58 / mo", trial: 15, ends: "5 Nov 2026", badges: ["Save 58%", "Best value"] },
  { id: "quarter", name: "3 months", access: "3 months access", price: "₹149", per: "/ 3 months", monthly: "₹49.67 / mo", trial: 15, ends: "5 Nov 2026", badges: ["Save 50%", "Most popular"] },
  { id: "monthly", name: "Monthly", access: "Renews every month", price: "₹99", per: "/ month", monthly: "₹99 / mo", trial: 7, ends: "28 Oct 2026", badges: ["Flexible"] },
] as const;

const features = [
  { I: Target, t: "Smart countdown", d: "Pacing, deadline projections and a daily countdown for every goal." },
  { I: Trophy, t: "All-time personal bests", d: "Auto-detects your 1RMs, fastest 5Ks, longest rides and highest climbs." },
  { I: Barbell, t: "27 sports, with sets and reps", d: "Full workout logs, barbell splits, conditioning and adventure tracking." },
  { I: ChartLineUp, t: "Deep analytics", d: "Training heatmaps, monthly volume charts and achievements." },
  { I: ShieldCheck, t: "Ad-free, with cloud sync", d: "Every workout backed up securely on all your devices." },
];

/* Pro mark: the Ennoo loop as a 3D object in the brand blue-to-cyan gradient, on a soft halo, with one light sweep on arrival */
const MASK = "url(/img/pro-mark.svg) center / contain no-repeat";
const BRAND = "linear-gradient(90deg, #0054FB 0%, #1F8BFF 45%, #2FD4EC 100%)";
const Loop = ({ w, h, style }: { w: number; h: number; style?: React.CSSProperties }) => (
  <span aria-hidden style={{ display: "block", width: w, height: h, background: BRAND, WebkitMask: MASK, mask: MASK, ...style }} />
);
function ProMark() {
  const reduce = useReducedMotion();
  const W = 140, H = 52;
  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "relative", width: W, height: H, margin: "10px auto 8px" }}>
      <div aria-hidden style={{ position: "absolute", inset: "-38px -52px", background: "radial-gradient(50% 50% at 50% 55%, rgba(47,212,236,0.06), rgba(0,84,251,0) 60%)" }} />
      <div aria-hidden style={{ position: "absolute", left: "16%", right: "16%", bottom: -12, height: 10, borderRadius: "50%", background: "rgba(0,40,140,0.12)", filter: "blur(7px)" }} />
      {/* the object: brand gradient body, the 3D file's bevel shading blended over it, a specular top light; isolated so blends stay inside */}
      <div style={{ position: "relative", width: W, height: H, isolation: "isolate",
        filter: "drop-shadow(0 1px 0.5px rgba(0,26,107,0.45)) drop-shadow(0 6px 10px rgba(0,64,208,0.16))" }}>
        <Loop w={W} h={H} style={{ position: "absolute", inset: 0, background: "linear-gradient(95deg, #003FD0 0%, #0A63FF 38%, #1FA2FF 68%, #3BDDF2 100%)" }} />
        <img src="/img/pro-mark-3d.svg" alt="" aria-hidden width={W} height={H}
          style={{ position: "absolute", inset: 0, display: "block", mixBlendMode: "overlay", filter: "grayscale(1) contrast(1.5) brightness(1.12)", opacity: 0.95 }} />
        <span aria-hidden style={{ position: "absolute", inset: 0, WebkitMask: MASK, mask: MASK, mixBlendMode: "soft-light",
          background: "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.15) 38%, rgba(0,0,0,0) 55%, rgba(0,10,60,0.35) 100%)" }} />
        {!reduce && (
          <motion.span aria-hidden initial={{ backgroundPositionX: "160%" }} animate={{ backgroundPositionX: "-60%" }} transition={{ delay: 0.6, duration: 1.5, ease: [0.45, 0, 0.2, 1] }}
            style={{ position: "absolute", inset: 0, WebkitMask: MASK, mask: MASK, mixBlendMode: "soft-light",
              backgroundImage: "linear-gradient(105deg, transparent 38%, rgba(255,255,255,1) 50%, transparent 62%)", backgroundSize: "250% 100%", backgroundRepeat: "no-repeat" }} />
        )}
      </div>
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
        <button className="icon-btn" aria-label="Back" onClick={() => go("onboarding")}><ArrowLeft size={20} /></button>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 30, padding: "0 12px", borderRadius: 999, background: "var(--blue-50)", boxShadow: "inset 0 0 0 1px var(--blue-100)", color: "var(--blue)", fontSize: 13, fontWeight: 600 }}>
          <Loop w={22} h={8} />Ennoo Pro
        </span>
        <button onClick={() => go("home")} style={{ justifySelf: "end", fontSize: 14, fontWeight: 560, color: "var(--gray)", padding: "10px 4px", whiteSpace: "nowrap" }}>Skip for now</button>
      </header>

      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        <div className="pad" style={{ paddingTop: 22, paddingBottom: 24 }}>
          <ProMark />
          <h1 className="title" style={{ textAlign: "center", marginTop: 18 }}>Unlock your full potential</h1>
          <p className="meta" style={{ textAlign: "center", fontSize: 15, lineHeight: 1.5, marginTop: 8, maxWidth: "32ch", marginInline: "auto" }}>
            Reach your milestones faster with advanced tracking, all 27 sports and all-time personal bests.
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
