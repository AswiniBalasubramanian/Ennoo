import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, PencilSimple, Plus, MapPin, CaretRight, Flag, Trophy, Quotes, X } from "@phosphor-icons/react";
import { StatusBar, Wordmark, Ring, SportIcon, type Route } from "../components";
import { athlete, goal as kavyaGoal, otherGoals, entries, week, locations, bests, byId } from "../data";
import type { Profile } from "./Onboarding";

const fmt = (n: number) => n.toLocaleString("en-IN");

/* Goal path: actual progress in splash, the remaining distance as a dashed line to the flag. */
function GoalPath({ history, target, endLabel }: { history: number[]; target: number; endLabel?: string }) {
  const W = 310, H = 96, months = 12;
  const x = (i: number) => (i / (months - 1)) * W;
  const y = (v: number) => H - (v / target) * H;
  const pts = history.map((v, i) => [x(i), y(v)] as const);
  const last = pts[pts.length - 1] ?? [0, H];
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${px},${py}`).join(" ");
  return (
    <svg viewBox={`-6 -10 ${W + 12} ${H + 34}`} width="100%" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <defs><linearGradient id="gp" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.45" /><stop offset="1" stopColor="#fff" /></linearGradient></defs>
      {[0.5, 1].map((t) => <line key={t} x1="0" x2={W} y1={H - t * H} y2={H - t * H} stroke="rgba(255,255,255,0.12)" />)}
      <line x1={last[0]} y1={last[1]} x2={W} y2={0} stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
      {pts.length > 1 && (
        <motion.path d={d} fill="none" stroke="url(#gp)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 0.2, ease: [0.65, 0, 0.35, 1] }} />
      )}
      <circle cx={last[0]} cy={last[1]} r="6" fill="#fff" stroke="rgba(255,255,255,0.35)" strokeWidth="6" paintOrder="stroke" />
      <g transform={`translate(${W - 2},${-2})`} color="#fff"><Flag size={18} weight="fill" x={-2} y={-16} /></g>
      {(endLabel ? [["Today", 0, "start"], [endLabel, W, "end"]] : [["Jan", 0, "start"], ["Today", last[0], "middle"], ["Dec", W, "end"]]).map(([t, tx, a]) => (
        <text key={t as string} x={tx as number} y={H + 18} textAnchor={a as "start"} fontSize="11" fill="rgba(255,255,255,0.6)" fontFamily="Inter Variable">{t}</text>
      ))}
    </svg>
  );
}

export default function Home({ go, profile }: { go: (r: Route) => void; profile: Profile | null }) {
  const fresh = !!profile;
  const g = fresh
    ? { title: `${byId(profile.activity).name} ${fmt(profile.target)} ${byId(profile.activity).unit}`, current: profile.current, target: profile.target, unit: byId(profile.activity).unit, due: profile.due, daysLeft: profile.daysLeft, history: [] as number[] }
    : kavyaGoal;
  const pct = g.current / g.target;
  const perWeek = (g.target - g.current) / (g.daysLeft / 7);
  const motto = profile ? profile.motto : "Consistency beats intensity.";
  const activity = byId(fresh ? profile.activity : kavyaGoal.activity);
  // Pro is offered here, after they've seen their goal live, never as a gate between the goal card and the app
  const [proOffer, setProOffer] = useState(fresh);

  return (
    <div className="body">
      <StatusBar onBlue />
      {/* Hero: brand-blue sky that fades into the page. The goal lives here, not in a card. */}
      <section style={{ position: "relative", color: "#fff", paddingBottom: 72,
        background: "radial-gradient(120% 60% at 85% 18%, rgba(47,212,236,0.35), transparent 60%), linear-gradient(180deg, #0040D0 0%, #0054FB 42%, #3D8BFF 80%, var(--bg) 100%)" }}>
        <header className="pad top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Wordmark width={98} color="#fff" />
          <button className="icon-btn on-blue" aria-label={fresh ? "Notifications" : "Notifications, 2 unread"} style={{ position: "relative" }}>
            <Bell size={20} />
            {!fresh && <span style={{ position: "absolute", top: 10, right: 11, width: 8, height: 8, borderRadius: "50%", background: "#2FD4EC", border: "2px solid #0054FB" }} />}
          </button>
        </header>

        <motion.div className="pad" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ marginTop: 26 }}>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)" }}>{fresh ? `Welcome, ${profile.name || athlete.first}` : `Morning, ${athlete.first}`}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <h1 className="title" style={{ fontSize: 26, color: "#fff" }}>{g.title}</h1>
            <button className="icon-btn on-blue" aria-label="Edit goal" style={{ width: 38, height: 38 }}><PencilSimple size={17} /></button>
          </div>
          <p className="num" style={{ fontSize: 64, fontWeight: 600, lineHeight: 1, marginTop: 18 }}>
            {fmt(g.current)}<span style={{ fontSize: 18, fontWeight: 500, color: "rgba(255,255,255,0.7)", letterSpacing: 0 }}> / {fmt(g.target)} {g.unit}</span>
          </p>
          <div style={{ margin: "20px 0 4px" }}><GoalPath history={g.history} target={g.target} endLabel={fresh ? g.due : undefined} /></div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, overflowX: "auto", scrollbarWidth: "none" }}>
            {[[`${Math.round(pct * 100)}%`, "complete"], [String(g.daysLeft), "days left"], [fmt(g.target - g.current), `${g.unit} to go`]].map(([v, l]) => (
              <span key={l} className="chip-glass"><strong className="num" style={{ fontWeight: 600 }}>{v}</strong> {l}</span>
            ))}
          </div>
          <p style={{ fontSize: 14, marginTop: 14, color: "rgba(255,255,255,0.9)" }}>
            {fresh ? `Your first ${activity.name.toLowerCase()} starts the line.` : `On pace for ${g.due}.`} About {fmt(Math.round(perWeek))} {g.unit} a week gets you there.
          </p>
        </motion.div>
      </section>

      <div className="pad" style={{ paddingBottom: 120, marginTop: -28, position: "relative" }}>

        <AnimatePresence>
          {proOffer && (
            <motion.div key="pro" className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              style={{ position: "relative", padding: "16px 16px 16px 18px", marginBottom: 8, overflow: "hidden" }}>
              <p style={{ fontSize: 15, fontWeight: 600, paddingRight: 36 }}>Pace every week to {fmt(g.target)} {g.unit}</p>
              <p className="meta" style={{ fontSize: 14, marginTop: 4, lineHeight: 1.45, paddingRight: 8 }}>Pro adds deadline projections, all-time bests and every sport. Free for 15 days.</p>
              <button className="btn btn-blue" onClick={() => go("pro")} style={{ height: 44, marginTop: 12, padding: "0 18px", fontSize: 15 }}>See Pro plans</button>
              <button className="icon-btn" aria-label="Dismiss Pro offer" onClick={() => setProOffer(false)}
                style={{ position: "absolute", top: 6, right: 6, border: 0, background: "transparent", color: "var(--gray)" }}><X size={18} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Other goals */}
        <div className="sec"><h2 className="h2">Other goals</h2>{!fresh && <span className="cap">{otherGoals.length} active</span>}</div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", margin: "0 -20px", padding: "0 20px", scrollbarWidth: "none" }}>
          {!fresh && otherGoals.map((o) => {
            const A = byId(o.activity);
            return (
              <div key={o.title} className="card" style={{ flex: "none", width: 200, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 12, background: "var(--blue-50)", color: "var(--blue)", display: "grid", placeItems: "center" }}><SportIcon Icon={A.Icon} size={20} /></span>
                  <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
                    <Ring p={o.current / o.target} size={40} stroke={4} track="var(--line)" id={`r-${o.activity}`} />
                    <span className="num" style={{ position: "absolute", fontSize: 10, fontWeight: 600, letterSpacing: 0 }}>{Math.round((o.current / o.target) * 100)}</span>
                  </div>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, marginTop: 14 }}>{o.title}</p>
                <p className="cap" style={{ marginTop: 2 }}>{o.current} of {o.target} {o.unit}, by {o.due}</p>
              </div>
            );
          })}
          <button className="card" style={{ flex: "none", width: fresh ? "100%" : 140, padding: 16, display: "grid", placeItems: "center", alignContent: "center", gap: 8, borderStyle: "dashed", color: "var(--blue)" }}>
            <Plus size={22} />
            <span style={{ fontSize: 14, fontWeight: 560 }}>{fresh ? "Add a second goal" : "New goal"}</span>
            {fresh && <span className="cap">Track another sport alongside {activity.name.toLowerCase()}</span>}
          </button>
        </div>

        {/* This week */}
        <div className="sec"><h2 className="h2">This week</h2><button className="link">Calendar</button></div>
        <div className="card" style={{ padding: "12px 8px", display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {week.map((w) => {
            const done = !fresh && w.done;
            return (
              <button key={w.n} aria-label={`${w.d} ${w.n}${done ? ", activity logged" : w.planned ? ", session planned" : ""}`}
                style={{ display: "grid", justifyItems: "center", gap: 4, padding: "8px 0", borderRadius: 14, background: w.today ? "var(--blue)" : "transparent", color: w.today ? "#fff" : "var(--ink)" }}>
                <span style={{ fontSize: 11, color: w.today ? "rgba(255,255,255,0.75)" : "var(--gray)" }}>{w.d}</span>
                <span className="num" style={{ fontSize: 17, fontWeight: 600, letterSpacing: 0 }}>{w.n}</span>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: done ? (w.today ? "#fff" : "var(--green)") : "transparent", border: !done && w.planned && !fresh ? "1px solid var(--gray-2)" : "none" }} />
              </button>
            );
          })}
        </div>

        {/* Today's plan */}
        <div className="sec"><h2 className="h2">Today's plan</h2><button className="link"><Plus size={14} weight="bold" />Schedule</button></div>
        <div className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 44, height: 44, borderRadius: 14, background: "var(--blue-50)", color: "var(--blue)", display: "grid", placeItems: "center", flex: "none" }}><SportIcon Icon={activity.Icon} size={23} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 600 }}>{fresh ? `Your first ${activity.name.toLowerCase()}` : "Tempo run, done"}</p>
            <p className="cap" style={{ marginTop: 2 }}>{fresh ? "Start whenever you're ready" : "Next: easy 6 km run, Thursday"}</p>
          </div>
          {fresh
            ? <button className="btn btn-blue" style={{ height: 42, padding: "0 18px", fontSize: 15 }} onClick={() => go("record")}>Start</button>
            : <button className="btn btn-soft" style={{ height: 42, padding: "0 18px", fontSize: 15 }} onClick={() => go("summary")}>View</button>}
        </div>

        {/* Recent activity */}
        <div className="sec"><h2 className="h2">Recent activity</h2>{!fresh && <button className="link" onClick={() => go("timeline")}>See all</button>}</div>
        {fresh ? (
          <p className="card meta" style={{ padding: 18, lineHeight: 1.5 }}>Nothing yet. Every activity you record lands here, with its route, stats and your notes.</p>
        ) : (
          <div className="card" style={{ padding: "4px 18px" }}>
            {entries.slice(0, 3).map((e, i) => {
              const A = byId(e.activity);
              return (
                <button key={e.id} onClick={() => go("summary")} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", padding: "14px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: "var(--blue-50)", color: "var(--blue)", display: "grid", placeItems: "center", flex: "none" }}><SportIcon Icon={A.Icon} size={21} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 560 }}>{e.title}</span>
                    <span className="cap">{e.when}</span>
                  </span>
                  <span className="num" style={{ fontSize: 15, fontWeight: 600, letterSpacing: 0 }}>{e.distance ?? e.duration}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Top locations */}
        <div className="sec"><h2 className="h2">Top locations</h2>{!fresh && <button className="link">View all</button>}</div>
        {fresh ? (
          <p className="card meta" style={{ padding: 18, lineHeight: 1.5 }}>The places you return to most will show up here after a few activities.</p>
        ) : (
          <div className="card" style={{ padding: "4px 18px" }}>
            {locations.map((l, i) => (
              <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: "var(--blue-50)", color: "var(--blue)", display: "grid", placeItems: "center", flex: "none" }}><MapPin size={19} weight="fill" /></span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 560 }}>{l.name}</span>
                  <span className="cap">{l.count} {l.kind}, last {l.last}</span>
                </span>
                <CaretRight size={16} color="var(--gray-2)" />
              </div>
            ))}
          </div>
        )}

        {/* Personal bests */}
        <div className="sec"><h2 className="h2">Personal bests</h2><button className="link"><Plus size={14} weight="bold" />Add</button></div>
        {fresh ? (
          <p className="card meta" style={{ padding: 18, lineHeight: 1.5 }}>Add up to four times, distances or lifts you're proud of. We'll flag it when you beat one.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {bests.map((b) => (
              <div key={b.label} className="card" style={{ padding: 16, position: "relative", overflow: "hidden" }}>
                {b.fresh && <span style={{ position: "absolute", inset: "0 0 auto 0", height: 3, background: "var(--splash)" }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="cap">{b.label}</span>
                  {b.fresh && <Trophy size={15} weight="fill" color="var(--blue)" />}
                </div>
                <p className="num" style={{ fontSize: 24, fontWeight: 600, marginTop: 10 }}>{b.value}</p>
                <p className="cap" style={{ color: b.fresh ? "var(--blue)" : "var(--gray)" }}>{b.fresh ? "New, today" : b.when}</p>
              </div>
            ))}
          </div>
        )}

        {/* Motto */}
        {motto && <figure style={{ marginTop: 32, padding: "24px 4px 0", borderTop: "1px solid var(--line)" }}>
          <Quotes size={22} weight="fill" color="var(--blue)" />
          <blockquote style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.2, marginTop: 10 }}>{motto}</blockquote>
          <figcaption className="cap" style={{ marginTop: 8 }}>Your motto</figcaption>
        </figure>}
      </div>
    </div>
  );
}
