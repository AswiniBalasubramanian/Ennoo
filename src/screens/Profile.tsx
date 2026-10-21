import { motion } from "motion/react";
import { Gear, Ruler, Watch, ShieldCheck, Bell, SignOut, CaretRight } from "@phosphor-icons/react";
import { StatusBar, type Route } from "../components";
import { athlete, consistency } from "../data";
import type { Profile as P } from "./Onboarding";

const mix = [
  { name: "Run", pct: 58, color: "var(--blue)" },
  { name: "Cycling", pct: 19, color: "#5c8dff" },
  { name: "Swimming", pct: 10, color: "#9dbaff" },
  { name: "Yoga", pct: 8, color: "#c9d8ff" },
  { name: "Other", pct: 5, color: "#e4e8ef" },
];
const months = [["Aug", 0], ["Sep", 35], ["Oct", 70]] as const;
const dot = (v: number) => (v === 3 ? "var(--green)" : v === 2 ? "var(--blue)" : v === 1 ? "#9dbaff" : "#e4e8ef");

export default function Profile({ go, profile }: { go: (r: Route) => void; profile: P | null }) {
  const active = consistency.filter(Boolean).length;
  const settings = [
    { I: Ruler, l: "Units", v: "Kilometres" },
    { I: Watch, l: "Connected devices", v: "Garmin Forerunner 265" },
    { I: ShieldCheck, l: "Privacy", v: "Followers only" },
    { I: Bell, l: "Reminders", v: "Mon, Wed, Fri, Sat" },
  ];
  return (
    <div className="body">
      <StatusBar />
      <header className="pad top" style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="icon-btn" aria-label="Settings"><Gear size={20} /></button>
      </header>
      <div className="pad" style={{ paddingBottom: 120 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
          <span style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--blue)", color: "#fff", display: "grid", placeItems: "center", fontSize: 26, fontWeight: 600 }}>KR</span>
          <div>
            <h1 className="title" style={{ fontSize: 26 }}>{athlete.first} {athlete.last}</h1>
            <p className="meta" style={{ marginTop: 4 }}>{athlete.city}, on Ennoo since {athlete.since}</p>
          </div>
        </div>
        {(profile ? profile.motto : "Consistency beats intensity.") && <p style={{ marginTop: 16, fontSize: 15, paddingLeft: 12, borderLeft: "2px solid var(--blue)" }}>{profile ? profile.motto : "Consistency beats intensity."}</p>}

        <div className="card" style={{ marginTop: 22, padding: 18, display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
          {[["214", "activities"], ["2,318", "km"], ["196 h", "moving"]].map(([v, l], i) => (
            <div key={l} style={{ paddingLeft: i ? 14 : 0, borderLeft: i ? "1px solid var(--line)" : "none" }}>
              <p className="num" style={{ fontSize: 22, fontWeight: 600 }}>{v}</p>
              <p className="cap">{l}, all time</p>
            </div>
          ))}
        </div>

        <div className="sec"><h2 className="h2">What you do</h2><span className="cap">Last 12 months</span></div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", gap: 2 }}>
            {mix.map((m, i) => (
              <motion.span key={m.name} initial={{ flexGrow: 0 }} animate={{ flexGrow: m.pct }} transition={{ delay: 0.1 + i * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ flexBasis: 0, background: m.color }} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 10, marginTop: 16 }}>
            {mix.map((m) => (
              <span key={m.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color }} />{m.name}
                <span className="num" style={{ color: "var(--gray)", marginLeft: "auto", marginRight: 16, letterSpacing: 0 }}>{m.pct}%</span>
              </span>
            ))}
          </div>
        </div>

        <div className="sec"><h2 className="h2">Consistency</h2><span className="cap">{active} active days in 13 weeks</span></div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
            {months.map(([m, start]) => (
              <div key={m}>
                <p className="cap" style={{ marginBottom: 10 }}>{m}</p>
                <div style={{ display: "grid", gridAutoFlow: "column", gridTemplateRows: "repeat(7, 8px)", gridAutoColumns: "8px", gap: 7 }}>
                  {consistency.slice(start, start + 35).map((v, i) => <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: dot(v) }} />)}
                </div>
              </div>
            ))}
          </div>
          <div className="cap" style={{ display: "flex", gap: 16, marginTop: 16 }}>
            {([["Light", 1], ["Solid", 2], ["Key session", 3]] as const).map(([l, v]) => (
              <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: dot(v) }} />{l}</span>
            ))}
          </div>
        </div>

        <div className="sec"><h2 className="h2">Settings</h2></div>
        <div className="card" style={{ padding: "4px 18px" }}>
          {settings.map(({ I, l, v }, i) => (
            <button key={l} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", padding: "15px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
              <I size={20} color="var(--gray)" />
              <span style={{ flex: 1, fontSize: 15 }}>{l}</span>
              <span className="cap" style={{ fontSize: 13 }}>{v}</span>
              <CaretRight size={15} color="var(--gray-2)" />
            </button>
          ))}
        </div>
        <button className="btn btn-soft" style={{ width: "100%", marginTop: 16 }} onClick={() => go("welcome")}><SignOut size={18} />Sign out</button>
      </div>
    </div>
  );
}
