import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, MagnifyingGlass, Minus, Plus, Check, CalendarBlank, CaretRight, X } from "@phosphor-icons/react";
import { StatusBar, SportIcon, Ring, type Route } from "../components";
import { activities, byId, mottos, groupLabel, type Group } from "../data";

/* Empty search: a lens over an empty lane, with one-tap suggestions so the user is never stuck. */
function EmptySearch({ q, onPick }: { q: string; onPick: (v: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      role="status" style={{ display: "grid", justifyItems: "center", textAlign: "center", padding: "14px 8px 24px" }}>
      <svg width="124" height="94" viewBox="0 0 148 112" aria-hidden fill="none">
        <defs>
          <linearGradient id="es-lens" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2FD4EC" /><stop offset="1" stopColor="#0054FB" /></linearGradient>
          <radialGradient id="es-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#E8F0FF" /><stop offset="1" stopColor="#E8F0FF" stopOpacity="0" /></radialGradient>
        </defs>
        <ellipse cx="74" cy="58" rx="72" ry="52" fill="url(#es-glow)" />
        {/* running lane, empty */}
        <path d="M10 92 C 44 78, 104 78, 138 92" stroke="#D6DEEA" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
        <path d="M22 102 C 52 90, 96 90, 126 102" stroke="#E4E9F1" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
        {/* floating sport marks, faded */}
        <circle cx="26" cy="40" r="11" fill="#fff" stroke="#E4E9F1" /><path d="M21 40h10M26 35v10" stroke="#B9C6D8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="124" cy="30" r="9" fill="#fff" stroke="#E4E9F1" /><circle cx="124" cy="30" r="3" fill="#B9C6D8" />
        <circle cx="118" cy="66" r="6" fill="#fff" stroke="#E4E9F1" />
        {/* lens */}
        <circle cx="68" cy="48" r="26" fill="#fff" stroke="url(#es-lens)" strokeWidth="6" />
        <path d="M58 44c2-6 9-9 15-7" stroke="#CFE0FF" strokeWidth="4" strokeLinecap="round" />
        <path d="M60 56h16" stroke="#B9C6D8" strokeWidth="3" strokeLinecap="round" />
        <path d="M88 68l16 16" stroke="url(#es-lens)" strokeWidth="9" strokeLinecap="round" />
      </svg>
      <p style={{ marginTop: 10, fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>No match for "{q}"</p>
      <p className="meta" style={{ marginTop: 6, fontSize: 14, lineHeight: 1.5, maxWidth: "36ch" }}>Check the spelling, or try one of these.</p>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 16 }}>
        {["Run", "Yoga", "Surf", "Cycling"].map((s) => (
          <button key={s} type="button" className="chip" onClick={() => onPick(s)}>{s}</button>
        ))}
      </div>
    </motion.div>
  );
}

export type Profile = { activity: string; target: number; current: number; due: string; daysLeft: number; motto: string };

const TODAY = new Date(2026, 9, 21); // prototype "today": Wed 21 Oct 2026
const DAY = 86400000;
const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const addDays = (n: number) => new Date(TODAY.getTime() + n * DAY);
const daysUntil = (d: Date) => Math.max(1, Math.round((d.getTime() - TODAY.getTime()) / DAY));

const presets: Record<string, number[]> = {
  km: [100, 500, 1000], workouts: [50, 100, 200], sessions: [50, 100, 200], floors: [110, 500, 1000], races: [1, 3, 5], routes: [20, 50, 100],
};
const presetName = ["Milestone", "Yearly", "Ambitious"];
const stepOf: Record<string, number> = { km: 10, workouts: 5, sessions: 5, floors: 10, races: 1, routes: 5 };
const timeframes = [
  { label: "3 months", days: 90 },
  { label: "6 months", days: 180 },
  { label: "End of year", days: daysUntil(new Date(2026, 11, 31)) },
  { label: "1 full year", days: 365 },
];
const groups: ("All" | Group)[] = ["All", "Endurance", "Strength", "Adventure"];
const fmt = (n: number) => n.toLocaleString("en-IN");

function Stepper({ label, help, value, unit, step, min, onChange }: { label: string; help: string; value: number; unit: string; step: number; min: number; onChange: (v: number) => void }) {
  return (
    <div className="card" style={{ padding: "16px 16px 16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <p className="cap">{label}</p>
        <p className="num" style={{ fontSize: 24, fontWeight: 600, marginTop: 2 }} aria-live="polite">{fmt(value)} <span style={{ fontSize: 14, fontWeight: 500, color: "var(--gray)", letterSpacing: 0 }}>{unit}</span></p>
        <p className="cap" style={{ marginTop: 2 }}>{help}</p>
      </div>
      <button className="icon-btn" aria-label={`Decrease ${label.toLowerCase()}`} onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min} style={{ opacity: value <= min ? 0.4 : 1 }}><Minus size={18} weight="bold" /></button>
      <button className="icon-btn" aria-label={`Increase ${label.toLowerCase()}`} onClick={() => onChange(value + step)}><Plus size={18} weight="bold" /></button>
    </div>
  );
}

function Option({ on, onClick, title, sub }: { on: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button role="radio" aria-checked={on} onClick={onClick}
      style={{ textAlign: "left", padding: "14px 16px", borderRadius: 18, border: `1.5px solid ${on ? "var(--blue)" : "var(--line)"}`, background: on ? "var(--blue-50)" : "#fff", transition: "all .2s" }}>
      <span className="num" style={{ display: "block", fontSize: 16, fontWeight: 600, color: on ? "var(--blue)" : "var(--ink)", letterSpacing: 0 }}>{title}</span>
      <span className="cap">{sub}</span>
    </button>
  );
}

export default function Onboarding({ go, onDone, initialStep = 0 }: { go: (r: Route) => void; onDone: (p: Profile) => void; initialStep?: number }) {
  const [step, setStep] = useState(initialStep);
  const [dir, setDir] = useState(1);
  const [activity, setActivity] = useState("run");
  const [target, setTarget] = useState(500);
  const [current, setCurrent] = useState(0);
  const [days, setDays] = useState(timeframes[2].days);
  const [custom, setCustom] = useState("");
  const [motto, setMotto] = useState("");
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const search = (v: string) => { setQ(v); searchRef.current?.focus(); };
  const [group, setGroup] = useState<(typeof groups)[number]>("All");

  const act = byId(activity);
  const unit = act.unit;
  const due = addDays(days);
  const perWeek = Math.max(0, target - current) / Math.max(1, days / 7);
  const round = (n: number) => (n >= 10 ? Math.round(n) : Math.round(n * 10) / 10);

  const list = useMemo(() => activities.filter((a) => (group === "All" || a.group === group) && a.name.toLowerCase().includes(q.trim().toLowerCase())), [q, group]);
  const sections = (["Endurance", "Strength", "Adventure"] as Group[]).map((g) => ({ g, items: list.filter((a) => a.group === g) })).filter((s) => s.items.length);

  const pick = (id: string) => { setActivity(id); setTarget(presets[byId(id).unit][1]); setCurrent(0); };
  const move = (d: number) => {
    if (step + d < 0) return go("signup");
    if (step + d > 3) return onDone({ activity, target, current, due: fmtDate(due), daysLeft: days, motto: motto.trim() });
    setDir(d); setStep(step + d);
  };
  const cta = [`Continue with ${act.name}`, "Continue", "Continue", "Start my journey"][step];

  return (
    <div className="body" style={{ background: "var(--white)", overflow: "hidden", display: "flex", flexDirection: "column", isolation: "isolate" }}>
      {/* soft blue/cyan mesh bleeding in from the top-right corner, fading diagonally to white */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none",
        background: "radial-gradient(60% 26% at 100% 0%, rgba(47,212,236,0.45) 0%, rgba(47,212,236,0) 100%), radial-gradient(70% 27% at 78% 0%, rgba(0,84,251,0.24) 0%, rgba(0,84,251,0) 100%), radial-gradient(50% 22% at 104% 10%, rgba(31,107,255,0.22) 0%, rgba(31,107,255,0) 100%), radial-gradient(50% 20% at 52% -4%, rgba(56,232,255,0.2) 0%, rgba(56,232,255,0) 100%)",
        filter: "blur(18px)" }} />
      <StatusBar />
      <header className="pad top" style={{ display: "grid", gridTemplateColumns: "44px 1fr 44px", alignItems: "center", gap: 16, flex: "none" }}>
        <button className="icon-btn" aria-label="Back" onClick={() => move(-1)}><ArrowLeft size={20} /></button>
        <div role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1} aria-label={`Step ${step + 1} of 4`} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{ height: 4, borderRadius: 2, background: "#fff", boxShadow: "inset 0 0 0 1px rgba(11,18,32,0.08)", overflow: "hidden" }}>
              <motion.span style={{ display: "block", height: "100%", background: "var(--blue)", transformOrigin: "left" }} animate={{ scaleX: i <= step ? 1 : 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
            </span>
          ))}
        </div>
        <span className="cap num" style={{ textAlign: "right", letterSpacing: 0, color: "var(--ink)", fontWeight: 560 }}>{step + 1}/4</span>
      </header>

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div key={step} initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="body pad" style={{ paddingTop: 24, paddingBottom: 32 }}>

            {step === 0 && (
              <>
                <h1 className="title">What's your primary focus?</h1>
                <p className="meta" style={{ fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>Pick your main sport. We'll shape your goal and stats around it, and you can still log all 27.</p>
                <div style={{ position: "relative", marginTop: 20 }}>
                  <MagnifyingGlass size={18} color="var(--gray)" style={{ position: "absolute", left: 16, top: 18 }} />
                  <input ref={searchRef} type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape" && q) { e.preventDefault(); setQ(""); } }}
                    placeholder="Search all 27 activities" aria-label="Search activities" style={{ paddingLeft: 44, paddingRight: q ? 48 : 16, background: "var(--bg)", borderColor: "transparent" }} />
                  <AnimatePresence>
                    {q && (
                      <motion.button key="clear" type="button" aria-label="Clear search" onClick={() => search("")}
                        initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.15 }}
                        style={{ position: "absolute", right: 3, top: 3, width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 12 }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--gray)", color: "#fff", display: "grid", placeItems: "center" }}><X size={12} weight="bold" /></span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", margin: "14px -20px 0", padding: "0 20px", scrollbarWidth: "none" }}>
                  {groups.map((g) => (
                    <button key={g} className="chip" aria-pressed={group === g} onClick={() => setGroup(g)}>
                      {g}<span style={{ opacity: 0.6 }} className="num">{g === "All" ? 27 : activities.filter((a) => a.group === g).length}</span>
                    </button>
                  ))}
                </div>
                {sections.length ? sections.map(({ g, items }) => (
                  <section key={g}>
                    <div className="sec" style={{ marginTop: 22 }}><h2 className="h2">{groupLabel[g]}</h2><span className="cap">{items.length} activities</span></div>
                    <div role="radiogroup" aria-label={groupLabel[g]} style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                      {items.map(({ id, name, Icon }) => {
                        const on = id === activity;
                        return (
                          <button key={id} role="radio" aria-checked={on} onClick={() => pick(id)}
                            style={{ position: "relative", height: 100, borderRadius: 20, display: "grid", placeItems: "center", alignContent: "center", gap: 10, fontSize: 13, fontWeight: on ? 600 : 500, padding: "0 6px", textAlign: "center",
                              background: on ? "var(--blue-50)" : "var(--white)", color: on ? "var(--blue)" : "var(--ink)", border: `1.5px solid ${on ? "var(--blue)" : "var(--line)"}`, transition: "all .2s" }}>
                            <SportIcon Icon={Icon} size={30} selected={on} />
                            {name}
                            {on && <span style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: "50%", background: "var(--blue)", color: "#fff", display: "grid", placeItems: "center" }}><Check size={11} weight="bold" /></span>}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )) : <EmptySearch q={q} onPick={search} />}
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="title">What's your target goal?</h1>
                <p className="meta" style={{ fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>Choose a popular milestone or set your own number.</p>
                <div className="sec" style={{ marginTop: 24 }}><h2 className="h2">Popular targets</h2></div>
                <div role="radiogroup" aria-label="Popular targets" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {presets[unit].map((p, i) => <Option key={p} on={target === p} onClick={() => setTarget(p)} title={fmt(p)} sub={`${unit}, ${presetName[i].toLowerCase()}`} />)}
                </div>
                <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
                  <Stepper label="Your target" help={`${act.name}, in ${unit}`} value={target} unit={unit} step={stepOf[unit]} min={stepOf[unit]} onChange={(v) => { setTarget(v); if (current >= v) setCurrent(0); }} />
                  <Stepper label="Already done" help="Count what you've completed so far, or start at 0" value={current} unit={unit} step={stepOf[unit]} min={0} onChange={(v) => setCurrent(Math.min(v, target - stepOf[unit]))} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="title">When do you want to achieve it?</h1>
                <p className="meta" style={{ fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>Pick a deadline and we'll turn it into a daily countdown.</p>
                <div className="card" style={{ marginTop: 22, padding: 18, display: "flex", alignItems: "center", gap: 18 }} aria-live="polite">
                  <div style={{ position: "relative", display: "grid", placeItems: "center", flex: "none" }}>
                    <Ring p={Math.min(1, days / 365)} size={96} stroke={8} track="var(--line)" id="ob-ring" />
                    <span style={{ position: "absolute", textAlign: "center" }}>
                      <span className="num" style={{ display: "block", fontSize: 24, fontWeight: 600, lineHeight: 1 }}>{days}</span>
                      <span className="cap" style={{ fontSize: 11 }}>days left</span>
                    </span>
                  </div>
                  <div>
                    <p className="cap">Target deadline</p>
                    <p className="num" style={{ fontSize: 22, fontWeight: 600, color: "var(--blue)", marginTop: 2, letterSpacing: 0 }}>{fmtDate(due)}</p>
                    <p className="cap" style={{ marginTop: 4, lineHeight: 1.45 }}>About <strong style={{ color: "var(--ink)" }}>{fmt(round(perWeek))} {unit}</strong> a week gets you there.</p>
                  </div>
                </div>
                <div className="sec" style={{ marginTop: 24 }}><h2 className="h2">Quick presets</h2></div>
                <div role="radiogroup" aria-label="Deadline presets" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {timeframes.map((t) => <Option key={t.label} on={days === t.days && !custom} onClick={() => { setDays(t.days); setCustom(""); }} title={t.label} sub={`${t.days} days`} />)}
                </div>
                <label className="card" style={{ position: "relative", marginTop: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", borderColor: custom ? "var(--blue)" : "var(--line)" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: "var(--blue-50)", color: "var(--blue)", display: "grid", placeItems: "center", flex: "none" }}><CalendarBlank size={20} weight="duotone" /></span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 560 }}>Pick an exact date</span>
                    <span className="cap">{custom ? fmtDate(new Date(custom)) : "Any day after today"}</span>
                  </span>
                  <CaretRight size={16} color="var(--gray-2)" />
                  <input type="date" aria-label="Exact deadline" min="2026-10-22" value={custom}
                    onChange={(e) => { setCustom(e.target.value); if (e.target.value) setDays(daysUntil(new Date(e.target.value))); }}
                    onClick={(e) => (e.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.()}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                </label>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="title">Your personal motto</h1>
                <p className="meta" style={{ fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>What words keep you moving when motivation fades? It sits on your home screen.</p>
                <div className="field" style={{ marginTop: 22 }}>
                  <label htmlFor="motto">In your own words</label>
                  <input id="motto" className="input" value={motto} maxLength={60} onChange={(e) => setMotto(e.target.value)} placeholder="Type your motto" />
                  <span className="help num" style={{ textAlign: "right", letterSpacing: 0 }}>{motto.length}/60</span>
                </div>
                <div className="sec" style={{ marginTop: 14 }}><h2 className="h2">Or choose one</h2></div>
                <div style={{ display: "grid", gap: 8 }}>
                  {mottos.map((m) => {
                    const on = motto === m;
                    return (
                      <button key={m} onClick={() => setMotto(on ? "" : m)} aria-pressed={on}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "15px 18px", borderRadius: 18, fontSize: 15, textAlign: "left", border: `1.5px solid ${on ? "var(--blue)" : "var(--line)"}`, background: on ? "var(--blue-50)" : "#fff", color: on ? "var(--blue)" : "var(--ink)", fontWeight: on ? 560 : 400, transition: "all .2s" }}>
                        {m}
                        <span style={{ width: 22, height: 22, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", background: on ? "var(--blue)" : "transparent", border: on ? "none" : "1.5px solid var(--gray-2)", color: "#fff" }}>{on && <Check size={12} weight="bold" />}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ flex: "none", padding: "14px 20px 34px", background: "#fff", borderTop: "1px solid var(--line)" }}>
        <button className="btn btn-blue" style={{ width: "100%" }} onClick={() => move(1)}>{cta}</button>
      </div>
    </div>
  );
}
