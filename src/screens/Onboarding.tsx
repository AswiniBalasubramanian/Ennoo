import { useEffect, useMemo, useRef, useState } from "react";
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

/* frosted sticky band used by the step-1 header; clear at rest so the mesh shows through */
const band = (on: boolean): React.CSSProperties => ({
  position: "sticky", background: on ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0)",
  backdropFilter: on ? "blur(18px) saturate(1.4)" : "none", WebkitBackdropFilter: on ? "blur(18px) saturate(1.4)" : "none",
  transition: "background .2s, box-shadow .2s",
});

export type Profile = { name: string; activity: string; target: number; current: number; due: string; daysLeft: number; motto: string };

const TODAY = new Date(2026, 9, 21); // prototype "today": Wed 21 Oct 2026
const DAY = 86400000;
const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const addDays = (n: number) => new Date(TODAY.getTime() + n * DAY);
const daysUntil = (d: Date) => Math.max(1, Math.round((d.getTime() - TODAY.getTime()) / DAY));

const presets: Record<string, number[]> = {
  km: [100, 500, 1000], workouts: [50, 100, 200], sessions: [50, 100, 200], floors: [110, 500, 1000], races: [1, 3, 5], routes: [20, 50, 100],
};
const presetName = ["A solid milestone", "A big year", "Go all in"];
/* Goal ideas told in each sport's own terms, so the number means something before they commit to it */
type Idea = { v: number; label: string };
const ideas: Record<string, Idea[]> = {
  run: [{ v: 100, label: "About 20 parkruns" }, { v: 500, label: "About 12 marathons" }, { v: 1000, label: "About 24 marathons" }],
  trail: [{ v: 100, label: "About 20 parkruns" }, { v: 500, label: "About 12 marathons" }, { v: 1000, label: "About 24 marathons" }],
  walk: [{ v: 100, label: "About 130,000 steps" }, { v: 300, label: "Chennai to Pondy and back" }, { v: 1000, label: "About 1.3 million steps" }],
  cycle: [{ v: 200, label: "About 4 ECR coffee rides" }, { v: 1000, label: "Roughly Chennai to Goa" }, { v: 3000, label: "About 30 century rides" }],
  swim: [{ v: 10, label: "About 400 pool lengths" }, { v: 50, label: "About 2,000 pool lengths" }, { v: 100, label: "The English Channel, three times" }],
  stairs: [{ v: 110, label: "The Willis Tower, top to bottom" }, { v: 500, label: "About 3 Burj Khalifas" }, { v: 1000, label: "About 6 Burj Khalifas" }],
  tri: [{ v: 1, label: "Your first finish line" }, { v: 3, label: "A full race season" }, { v: 5, label: "A race every couple of months" }],
  yoga: [{ v: 30, label: "A 30-day streak" }, { v: 100, label: "100 mats unrolled" }, { v: 200, label: "Practice most days" }],
  climb: [{ v: 20, label: "Fill your first logbook page" }, { v: 50, label: "Push up a grade" }, { v: 100, label: "A century of sends" }],
  surf: [{ v: 20, label: "Paddle out most weekends" }, { v: 50, label: "Catch most of the season" }, { v: 100, label: "A century of sessions" }],
};
const workoutIdeas: Idea[] = [{ v: 50, label: "Once a week, all year" }, { v: 100, label: "Twice a week, all year" }, { v: 200, label: "Four a week, all year" }];
const ideasFor = (id: string): Idea[] => {
  const unit = byId(id).unit;
  return ideas[id] ?? (unit === "workouts" ? workoutIdeas : presets[unit].map((v, i) => ({ v, label: presetName[i] })));
};
/* Goal-card backdrop: a moody photo from the sport's world (Unsplash), graded vintage in CSS */
const goalPhoto = (id: string) => {
  const { group } = byId(id);
  if (["cycle", "skate"].includes(id)) return { src: "/img/goal-ride.jpg", pos: "40% 70%" };
  if (["swim", "row", "kayak", "canoe", "paddle", "surf"].includes(id)) return { src: "/img/goal-swim.jpg", pos: "50% 50%" };
  if (["hike", "trek", "climb", "ski", "snowboard", "yoga", "pilates", "mobility", "stretch"].includes(id)) return { src: "/img/goal-trail.jpg", pos: "70% 60%" };
  if (group === "Strength") return { src: "/img/goal-gym.jpg", pos: "50% 50%" };
  // motion-blurred stride, supplied by the client
  return { src: "/img/goal-run.webp", pos: "50% 45%" };
};
const QUESTIONS = 4; // sport, goal, deadline, motto; the goal card follows
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

export default function Onboarding({ go, onDone, name = "", initialStep = 0 }: { go: (r: Route) => void; onDone: (p: Profile) => void; name?: string; initialStep?: number }) {
  const [step, setStep] = useState(initialStep);
  const first = name.trim(); // from Signup; Google sign-up has none, so copy falls back to neutral
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
  const [stuck, setStuck] = useState(false);
  // the title band is pinned on its own; search + filters pin directly beneath it, so measure it
  const titleRef = useRef<HTMLDivElement>(null);
  const [titleH, setTitleH] = useState(70);
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTitleH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [step]);

  const act = byId(activity);
  const unit = act.unit;
  const due = addDays(days);
  const perWeek = Math.max(0, target - current) / Math.max(1, days / 7);
  const round = (n: number) => (n >= 10 ? Math.round(n) : Math.round(n * 10) / 10);

  const list = useMemo(() => activities.filter((a) => (group === "All" || a.group === group) && a.name.toLowerCase().includes(q.trim().toLowerCase())), [q, group]);
  const sections = (["Endurance", "Strength", "Adventure"] as Group[]).map((g) => ({ g, items: list.filter((a) => a.group === g) })).filter((s) => s.items.length);

  const pick = (id: string) => { setActivity(id); setTarget(ideasFor(id)[1].v); setCurrent(0); };
  const move = (d: number) => {
    if (step + d < 0) return go("signup");
    if (step + d > QUESTIONS) return onDone({ name: first, activity, target, current, due: fmtDate(due), daysLeft: days, motto: motto.trim() });
    setDir(d); setStep(step + d); setStuck(false);
  };
  const cta = [`Continue with ${act.name}`, "Continue", "Continue", "Create my goal", "Start my journey"][step];
  const share = async () => {
    const text = `${first}'s goal on Ennoo: ${fmt(target)} ${unit} of ${act.name.toLowerCase()} by ${fmtDate(due)}.${motto.trim() ? ` "${motto.trim()}"` : ""}`;
    try { if (navigator.share) await navigator.share({ title: "My Ennoo goal", text }); else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2200); } } catch { /* share sheet dismissed */ }
  };
  const [copied, setCopied] = useState(false);

  return (
    <div className="body" style={{ background: "var(--white)", overflow: "hidden", display: "flex", flexDirection: "column", isolation: "isolate" }}>
      {/* soft blue/cyan mesh bleeding in from the top-right corner, fading diagonally to white */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none",
        background: "radial-gradient(60% 26% at 100% 0%, rgba(47,212,236,0.45) 0%, rgba(47,212,236,0) 100%), radial-gradient(70% 27% at 78% 0%, rgba(0,84,251,0.24) 0%, rgba(0,84,251,0) 100%), radial-gradient(50% 22% at 104% 10%, rgba(31,107,255,0.22) 0%, rgba(31,107,255,0) 100%), radial-gradient(50% 20% at 52% -4%, rgba(56,232,255,0.2) 0%, rgba(56,232,255,0) 100%)",
        filter: "blur(18px)" }} />
      <StatusBar />
      <header className="pad top" style={{ display: "grid", gridTemplateColumns: "44px 1fr 44px", alignItems: "center", gap: 16, flex: "none" }}>
        <button className="icon-btn" aria-label="Back" onClick={() => move(-1)}><ArrowLeft size={20} /></button>
        {step < QUESTIONS ? (
          <>
            <div role="progressbar" aria-valuemin={1} aria-valuemax={QUESTIONS} aria-valuenow={step + 1} aria-label={`Step ${step + 1} of ${QUESTIONS}`} style={{ display: "grid", gridTemplateColumns: `repeat(${QUESTIONS},1fr)`, gap: 6 }}>
              {Array.from({ length: QUESTIONS }, (_, i) => (
                <span key={i} style={{ height: 4, borderRadius: 2, background: "#fff", boxShadow: "inset 0 0 0 1px rgba(11,18,32,0.08)", overflow: "hidden" }}>
                  <motion.span style={{ display: "block", height: "100%", background: "var(--blue)", transformOrigin: "left" }} animate={{ scaleX: i <= step ? 1 : 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
                </span>
              ))}
            </div>
            <span className="cap num" style={{ textAlign: "right", letterSpacing: 0, color: "var(--ink)", fontWeight: 560 }}>{step + 1}/{QUESTIONS}</span>
          </>
        ) : <span style={{ gridColumn: "span 2" }} />}
      </header>

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div key={step} initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="body pad" style={{ paddingTop: 24, paddingBottom: 32 }}
            onScroll={(e) => setStuck(e.currentTarget.scrollTop > 4)}>

            {step === 0 && (
              <>
                {/* title and search/filters pin as two frosted bands; the intro line scrolls away between them */}
                <div ref={titleRef} style={{ ...band(stuck), top: -24, zIndex: 3, margin: "-24px -20px 0", padding: "24px 20px 8px" }}>
                  <h1 className="title">{first ? `${first}, what's your primary focus?` : "What's your primary focus?"}</h1>
                </div>
                <p className="meta" style={{ fontSize: 15, lineHeight: 1.5 }}>Pick your main sport. We'll shape your goal and stats around it, and you can still log all 27.</p>
                <div style={{ ...band(stuck), top: titleH - 24, zIndex: 2, margin: "0 -20px", padding: "20px 20px 12px", boxShadow: stuck ? "0 1px 0 var(--line)" : "none" }}>
                <div style={{ position: "relative" }}>
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
                </div>
                {sections.length ? sections.map(({ g, items }, si) => (
                  <section key={g}>
                    <div className="sec" style={{ marginTop: si ? 22 : 10 }}><h2 className="h2">{groupLabel[g]}</h2><span className="cap">{items.length} activities</span></div>
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
                <h1 className="title">What's your {act.name.toLowerCase()} goal?</h1>
                <p className="meta" style={{ fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>Pick a popular {act.name.toLowerCase()} challenge or set your own number.</p>
                <div className="sec" style={{ marginTop: 24 }}><h2 className="h2">Popular challenges</h2></div>
                <div role="radiogroup" aria-label={`Popular ${act.name.toLowerCase()} challenges`} style={{ display: "grid", gap: 8 }}>
                  {ideasFor(activity).map((it) => {
                    const on = target === it.v;
                    return (
                      <button key={it.v} role="radio" aria-checked={on} onClick={() => { setTarget(it.v); if (current >= it.v) setCurrent(0); }}
                        style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", padding: "12px 16px 12px 12px", borderRadius: 18, border: `1.5px solid ${on ? "var(--blue)" : "var(--line)"}`, background: on ? "var(--blue-50)" : "#fff", transition: "all .2s" }}>
                        <span style={{ width: 40, height: 40, borderRadius: 12, flex: "none", display: "grid", placeItems: "center", background: on ? "#fff" : "var(--bg)" }}><SportIcon Icon={act.Icon} size={22} selected={on} /></span>
                        <span style={{ flex: 1 }}>
                          <span className="num" style={{ display: "block", fontSize: 17, fontWeight: 600, letterSpacing: 0, color: on ? "var(--blue)" : "var(--ink)" }}>{fmt(it.v)} {unit}</span>
                          <span className="cap">{it.label}</span>
                        </span>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", background: on ? "var(--blue)" : "transparent", border: on ? "none" : "1.5px solid var(--gray-2)", color: "#fff" }}>{on && <Check size={12} weight="bold" />}</span>
                      </button>
                    );
                  })}
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
                <h1 className="title">{first ? `What keeps you going, ${first}?` : "Your personal motto"}</h1>
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

            {step === 4 && (
              <>
                <h1 className="title">Here's your goal{first ? `, ${first}` : ""}</h1>
                <p className="meta" style={{ fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>It lives at the top of your home screen. Every session you log fills the ring.</p>
                {/* the payoff: everything they chose, set as one card */}
                <motion.div initial={{ opacity: 0, y: 24, scale: 0.94, rotate: -2 }} animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.1 }}
                  style={{ marginTop: 22, borderRadius: 28, padding: "22px 22px 24px", color: "#fff", position: "relative", overflow: "hidden", isolation: "isolate",
                    background: "#061026", boxShadow: "0 28px 50px -24px rgba(3,11,36,0.75)" }}>
                  {/* vintage, moody grade: faded film colour, navy wash, heavy vignette, grain */}
                  <img src={goalPhoto(activity).src} alt="" aria-hidden
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: goalPhoto(activity).pos, zIndex: -1,
                      filter: "saturate(0.9) sepia(0.14) contrast(1.08) brightness(0.85)" }} />
                  <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1, background: "#0A1E5C", mixBlendMode: "multiply", opacity: 0.22 }} />
                  <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1,
                    background: "linear-gradient(180deg, rgba(4,8,20,0.6) 0%, rgba(4,8,20,0.15) 34%, rgba(4,8,20,0.25) 60%, rgba(4,8,20,0.85) 100%), radial-gradient(120% 90% at 50% 45%, transparent 45%, rgba(2,4,12,0.7) 100%)" }} />
                  <div aria-hidden className="grain" style={{ opacity: 0.35, zIndex: -1 }} />
                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.16)", display: "grid", placeItems: "center" }}><act.Icon size={20} weight="fill" /></span>
                    <span style={{ fontSize: 14, fontWeight: 560 }}>{first ? `${first}'s` : "Your"} {act.name.toLowerCase()} goal</span>
                  </div>
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 18 }}>
                    <p style={{ fontFamily: "var(--serif)", fontSize: 56, lineHeight: 0.95 }}>
                      <span className="num">{fmt(target)}</span> <span style={{ fontSize: 26, fontStyle: "italic" }}>{unit}</span>
                    </p>
                    <div style={{ position: "relative", display: "grid", placeItems: "center", flex: "none" }}>
                      <Ring p={current / target} size={76} stroke={7} id="ob-card-ring" />
                      <span className="num" style={{ position: "absolute", fontSize: 15, fontWeight: 600 }}>{Math.round((current / target) * 100)}%</span>
                    </div>
                  </div>
                  <p style={{ position: "relative", marginTop: 8, fontSize: 15, color: "rgba(255,255,255,0.82)" }}>by {fmtDate(due)}</p>
                  <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
                    {[[`${days}`, "days to go"], [`${fmt(round(perWeek))} ${unit}`, "a week to get there"]].map(([v, l]) => (
                      <div key={l} style={{ borderRadius: 16, padding: "12px 14px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.16)" }}>
                        <p className="num" style={{ fontSize: 18, fontWeight: 600, letterSpacing: 0 }}>{v}</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{l}</p>
                      </div>
                    ))}
                  </div>
                  {motto.trim() && (
                    <p style={{ position: "relative", marginTop: 18, paddingLeft: 12, borderLeft: "2px solid #2FD4EC", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 20, lineHeight: 1.25 }}>"{motto.trim()}"</p>
                  )}
                </motion.div>
                <button type="button" className="btn" onClick={share} style={{ width: "100%", marginTop: 12, color: "var(--blue)", fontWeight: 560 }} aria-live="polite">
                  {copied ? "Copied to clipboard" : "Share my goal"}
                </button>
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
