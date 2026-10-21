import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Diamond, Target, Trophy, Barbell, ChartLineUp, ShieldCheck, Gift, CreditCard, ArrowsClockwise } from "@phosphor-icons/react";
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

export default function Pro({ go }: { go: (r: Route) => void }) {
  const [plan, setPlan] = useState<(typeof plans)[number]["id"]>("annual");
  const p = plans.find((x) => x.id === plan)!;

  return (
    <div className="body" style={{ background: "var(--white)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <header className="pad top" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", flex: "none" }}>
        <button className="icon-btn" aria-label="Back" onClick={() => go("onboarding")}><ArrowLeft size={20} /></button>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", borderRadius: 999, background: "var(--blue-50)", color: "var(--blue)", fontSize: 13, fontWeight: 600 }}>
          <Diamond size={15} weight="fill" />Ennoo Pro
        </span>
        <button onClick={() => go("home")} style={{ justifySelf: "end", fontSize: 14, fontWeight: 560, color: "var(--gray)", padding: "10px 4px" }}>Not now</button>
      </header>

      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        <div className="pad" style={{ paddingTop: 22, paddingBottom: 24 }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ width: 72, height: 72, borderRadius: 24, margin: "0 auto", display: "grid", placeItems: "center", background: "linear-gradient(160deg, #1a66ff, #0041d6)", color: "#fff", boxShadow: "0 12px 28px -12px rgba(0,84,251,0.7)" }}>
            <Diamond size={36} weight="duotone" />
          </motion.div>
          <h1 className="title" style={{ textAlign: "center", marginTop: 18 }}>Unlock your full potential</h1>
          <p className="meta" style={{ textAlign: "center", fontSize: 15, lineHeight: 1.5, marginTop: 8, maxWidth: "32ch", marginInline: "auto" }}>
            Reach your milestones faster with advanced tracking, all 27 sports and all-time personal bests.
          </p>

          <div className="card" style={{ marginTop: 22, padding: "6px 18px" }}>
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

          <div className="sec"><h2 className="h2">Choose your plan</h2><span className="cap">All Pro features</span></div>
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
