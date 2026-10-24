import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toBlob } from "html-to-image";
import { ArrowLeft, ArrowRight, MagnifyingGlass, Check, Target, CheckCircle, CalendarBlank, CaretRight, CaretLeft, X, ImageSquare, ShareFat } from "@phosphor-icons/react";
import { StatusBar, SportIcon, Wordmark, type Route } from "../components";
import { activities, byId, mottos, groupLabel, groupOrder, type Group } from "../data";

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

/* Story-card timeline: a dotted route from today to the deadline, with quarter milestones as stops */
const fmtShort = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const ROUTE = [[34, 270], [158, 246], [72, 172], [204, 126], [232, 34]] as const;
function GoalRoute({ days, current, target, unit }: { days: number; current: number; target: number; unit: string }) {
  const d = "M" + ROUTE.map(([x, y]) => `${x} ${y}`).join(" L");
  const stop = (i: number) => ({ date: fmtShort(addDays(Math.round((days * i) / 4))), val: `${fmt(Math.round(current + ((target - current) * i) / 4))} ${unit}` });
  // label anchors per stop: [dx, dy, text-anchor]
  const lab: [number, number, "start" | "end"][] = [[-10, 32, "start"], [12, 14, "start"], [-14, 4, "end"], [14, 12, "start"], [-14, 2, "end"]];
  return (
    <svg viewBox="0 0 260 296" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden style={{ overflow: "visible", display: "block" }}>
      <defs>
        <mask id="route-reveal"><motion.path d={d} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 1.6, ease: [0.65, 0, 0.35, 1] }} /></mask>
        <radialGradient id="goal-glow"><stop offset="0" stopColor="#1F6BFF" stopOpacity="0.85" /><stop offset="1" stopColor="#1F6BFF" stopOpacity="0" /></radialGradient>
        {/* 3D flag: brushed pole, waving cloth with a lit face and a shaded fold, glossy finial */}
        <linearGradient id="pole-g" x1="0" x2="1"><stop offset="0" stopColor="#8A97AD" /><stop offset="0.45" stopColor="#FFFFFF" /><stop offset="1" stopColor="#6B7890" /></linearGradient>
        <linearGradient id="flag-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2FD4EC" /><stop offset="0.5" stopColor="#1F7BFF" /><stop offset="1" stopColor="#0040D0" /></linearGradient>
        <linearGradient id="fold-g" x1="0" x2="1"><stop offset="0" stopColor="#001A6B" stopOpacity="0" /><stop offset="0.5" stopColor="#001A6B" stopOpacity="0.45" /><stop offset="1" stopColor="#001A6B" stopOpacity="0" /></linearGradient>
        <radialGradient id="knob-g" cx="0.35" cy="0.3"><stop offset="0" stopColor="#E8FDFF" /><stop offset="0.5" stopColor="#38D4EC" /><stop offset="1" stopColor="#0054FB" /></radialGradient>
        {/* 3D avatar: glossy sphere with a lit bust */}
        <radialGradient id="ava-g" cx="0.35" cy="0.28" r="0.8"><stop offset="0" stopColor="#7FC2FF" /><stop offset="0.55" stopColor="#1F6BFF" /><stop offset="1" stopColor="#002C9E" /></radialGradient>
        <linearGradient id="bust-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#CFE0FF" /></linearGradient>
        <clipPath id="ava-clip"><circle cx={ROUTE[0][0]} cy={ROUTE[0][1]} r="11" /></clipPath>
        <filter id="lift" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.2" floodColor="#000814" floodOpacity="0.55" /></filter>
      </defs>
      <path d={d} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeDasharray="0 7" mask="url(#route-reveal)" />
      {ROUTE.map(([x, y], i) => {
        const s = stop(i), [dx, dy, anchor] = lab[i], end = i === ROUTE.length - 1, start = i === 0;
        return (
          <motion.g key={i} initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.36, duration: 0.35 }} style={{ transformOrigin: `${x}px ${y}px` }}>
            {end && <circle cx={x} cy={y} r="22" fill="url(#goal-glow)" />}
            {start && <motion.circle cx={x} cy={y} r="12" fill="none" stroke="#3D8BFF" strokeWidth="2" animate={{ r: [12, 20], opacity: [0.9, 0] }} transition={{ duration: 1.6, repeat: Infinity }} />}
            {start ? (
              <g filter="url(#lift)">
                <circle cx={x} cy={y} r="11" fill="url(#ava-g)" />
                <g clipPath="url(#ava-clip)">
                  <circle cx={x} cy={y - 2.6} r="3.9" fill="url(#bust-g)" />
                  <ellipse cx={x} cy={y + 8.6} rx="7.6" ry="5.6" fill="url(#bust-g)" />
                </g>
                <ellipse cx={x - 4} cy={y - 6} rx="4" ry="2.2" fill="#fff" opacity="0.45" transform={`rotate(-30 ${x - 4} ${y - 6})`} />
                <circle cx={x} cy={y} r="11" fill="none" stroke="#fff" strokeWidth="2" />
              </g>
            ) : end ? (
              <g filter="url(#lift)">
                <ellipse cx={x} cy={y + 1} rx="6" ry="2.2" fill="#001A6B" opacity="0.5" />
                <rect x={x - 1.3} y={y - 34} width="2.6" height="35" rx="1.3" fill="url(#pole-g)" />
                <path d={`M${x + 1} ${y - 33} C${x + 8} ${y - 37} ${x + 14} ${y - 29} ${x + 25} ${y - 32} L${x + 25} ${y - 17} C${x + 14} ${y - 14} ${x + 8} ${y - 22} ${x + 1} ${y - 18} Z`} fill="url(#flag-g)" />
                <path d={`M${x + 7} ${y - 34.2} C${x + 10} ${y - 33} ${x + 12} ${y - 31} ${x + 14} ${y - 30.6} L${x + 14} ${y - 15.6} C${x + 12} ${y - 16} ${x + 10} ${y - 18} ${x + 7} ${y - 19.6} Z`} fill="url(#fold-g)" />
                <path d={`M${x + 1} ${y - 33} C${x + 8} ${y - 37} ${x + 14} ${y - 29} ${x + 25} ${y - 32}`} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1" />
                <circle cx={x} cy={y - 35.5} r="2.6" fill="url(#knob-g)" />
              </g>
            ) : (
              <circle cx={x} cy={y} r="6" fill="#fff" />
            )}
            <text x={x + dx} y={y + dy - 6} textAnchor={anchor} fill="#fff" fontSize="12" fontWeight="600" fontFamily="Inter, system-ui">{start ? "Today" : end ? `Goal, ${s.date}` : s.date}</text>
            <text x={x + dx} y={y + dy + 8} textAnchor={anchor} fill="rgba(255,255,255,0.72)" fontSize="11" fontFamily="Inter, system-ui">{start && current > 0 ? `${s.val} done` : s.val}</text>
          </motion.g>
        );
      })}
    </svg>
  );
}

/* One scroll wheel: snaps row by row, the centred row is the value. Only rows near the
   current one are rendered, so even a 0–5,000 range stays light. Arrow keys step it too. */
// three rows visible: compact enough that the sheet, the keypad and the page above all fit together
const ROW = 44, VISIBLE = 3, PAD = ROW * ((VISIBLE - 1) / 2);

/* How much of the screen the on-screen keyboard covers, so a sheet can sit just above it.
   Mobile browsers shrink the visual viewport, not the layout, when the keypad opens. */
function useKeyboardInset() {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setInset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    vv.addEventListener("resize", update); vv.addEventListener("scroll", update); update();
    return () => { vv.removeEventListener("resize", update); vv.removeEventListener("scroll", update); };
  }, []);
  return inset;
}
function Wheel({ items, index, onChange, label, wide }: { items: string[]; index: number; onChange: (i: number) => void; label: string; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(index);
  useEffect(() => { if (ref.current) ref.current.scrollTop = index * ROW; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const go = (i: number) => ref.current?.scrollTo({ top: Math.max(0, Math.min(items.length - 1, i)) * ROW, behavior: "smooth" });
  const onScroll = () => {
    const i = Math.max(0, Math.min(items.length - 1, Math.round((ref.current?.scrollTop ?? 0) / ROW)));
    if (i !== cur) { setCur(i); onChange(i); }
  };
  const from = Math.max(0, cur - 30), to = Math.min(items.length, cur + 31);
  return (
    <div ref={ref} role="spinbutton" tabIndex={0} aria-label={label} aria-valuenow={cur} aria-valuetext={items[cur]}
      onScroll={onScroll} onKeyDown={(e) => { if (e.key === "ArrowUp") { e.preventDefault(); go(cur - 1); } if (e.key === "ArrowDown") { e.preventDefault(); go(cur + 1); } }}
      style={{ position: "relative", height: ROW * VISIBLE, overflowY: "auto", scrollSnapType: "y mandatory", scrollbarWidth: "none", overscrollBehavior: "contain",
        WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)", maskImage: "linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)",
        borderRadius: 12, outlineOffset: -2 }}>
      <div style={{ height: PAD + from * ROW }} />
      {items.slice(from, to).map((t, k) => {
        const i = from + k, d = Math.abs(i - cur);
        return (
          <div key={i} onClick={() => go(i)} className="num"
            style={{ height: ROW, scrollSnapAlign: "center", display: "grid", placeItems: "center", cursor: "pointer", letterSpacing: 0,
              fontSize: d === 0 ? (wide ? 30 : 28) : 22, fontWeight: d === 0 ? 650 : 500,
              color: d === 0 ? "var(--ink)" : "var(--gray)", opacity: d === 0 ? 1 : d === 1 ? 0.7 : 0.4, transition: "font-size .12s, opacity .12s" }}>
            {t}
          </div>
        );
      })}
      <div style={{ height: PAD + (items.length - to) * ROW }} />
    </div>
  );
}

/* Bottom sheet with scroll wheels for a goal number: whole number, a decimal for distances,
   and km or miles (miles are converted back to km on Done). */
const wheelMax: Record<string, number> = { km: 5000, workouts: 1000, sessions: 1000, floors: 5000, races: 50, routes: 500 };
const MI = 1.609344;
function NumberSheet({ title, unit, value, min, max, onSave, onClose }: { title: string; help?: string; unit: string; value: number; min: number; max?: number; onSave: (v: number) => void; onClose: () => void }) {
  const dist = unit === "km";
  const top = wheelMax[unit] ?? 1000;
  // the whole number is typed (big targets like 2,500 are quicker on the keypad); decimal and unit stay on wheels
  const [text, setText] = useState(String(Math.floor(value)));
  const whole = text === "" ? NaN : Number(text);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { const t = setTimeout(() => { inputRef.current?.focus({ preventScroll: true }); inputRef.current?.select(); }, 80); return () => clearTimeout(t); }, []);
  const [tenth, setTenth] = useState(Math.round((value - Math.floor(value)) * 10) % 10);
  const [mi, setMi] = useState(false);
  const raw = whole + (dist ? tenth / 10 : 0);
  const v = Math.round((mi ? raw * MI : raw) * 10) / 10; // always stored in the goal's own unit
  const err = text === "" ? "Enter a number" : v > top ? `Up to ${fmt(top)} ${unit}` : v < min ? `At least ${fmt(min)} ${unit}` : max !== undefined && v > max ? `Less than your target of ${fmt(max + 1)} ${unit}` : "";
  const kb = useKeyboardInset();
  const done = () => { if (!err) { onSave(v); onClose(); } };
  return (
    <motion.div key="sheet" initial={{ opacity: 1 }} exit={{ opacity: 1 }} transition={{ duration: 0.3 }}
      style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "flex-end", paddingBottom: kb, transition: "padding-bottom .25s var(--ease)" }}>
      <motion.div aria-hidden onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        style={{ position: "absolute", inset: 0, background: "rgba(11,18,32,0.42)" }} />
      <motion.div role="dialog" aria-modal="true" aria-labelledby="sheet-title" onKeyDown={(e) => { if (e.key === "Escape") onClose(); if (e.key === "Enter") done(); }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 420, damping: 40 }}
        style={{ position: "relative", width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", padding: kb ? "10px 20px 14px" : "10px 20px 28px", boxShadow: "0 -12px 40px -20px rgba(11,18,32,0.4)" }}>
        <span aria-hidden style={{ display: "block", width: 36, height: 4, borderRadius: 2, background: "var(--line)", margin: "0 auto 12px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 id="sheet-title" className="h2" style={{ fontSize: 20 }}>{title}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose} style={{ border: 0, marginRight: -10 }}><X size={20} weight="bold" /></button>
        </div>

        {/* the wheels, over one highlight band marking the chosen row */}
        <div style={{ position: "relative", marginTop: 10 }}>
          <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: PAD, height: ROW, borderRadius: 14, background: "var(--blue-50)" }} />
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: dist ? "1.3fr 16px 0.9fr 1fr" : "1fr", alignItems: "center" }}>
            <label style={{ height: ROW * VISIBLE, display: "grid", alignItems: "center", cursor: "text" }}>
              <input ref={inputRef} inputMode="numeric" pattern="[0-9]*" enterKeyHint="done" aria-label="Number" aria-invalid={!!err}
                value={text} onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=[0-9])/, "").slice(0, 5))}
                                className="num num-input" style={{ width: "100%", height: ROW, border: 0, outline: "none", background: "transparent", textAlign: "center",
                  fontSize: 30, fontWeight: 650, color: "var(--ink)", letterSpacing: 0, caretColor: "var(--blue)",
                  textDecoration: "underline dashed var(--blue-100)", textUnderlineOffset: 8, textDecorationThickness: 2 }} />
            </label>
            {dist && <>
              <span aria-hidden className="num" style={{ fontSize: 28, fontWeight: 650, textAlign: "center", paddingBottom: 4 }}>.</span>
              <Wheel label="Decimal" items={Array.from({ length: 10 }, (_, i) => String(i))} index={tenth} onChange={setTenth} />
              <Wheel label="Unit" items={["km", "mi"]} index={mi ? 1 : 0} onChange={(i) => setMi(i === 1)} />
            </>}
          </div>
          <div aria-hidden className="cap" style={{ display: "grid", gridTemplateColumns: dist ? "1.3fr 16px 0.9fr 1fr" : "1fr", textAlign: "center", marginTop: 8, fontWeight: 600 }}>
            {dist ? <><span>Type a number</span><span /><span>Decimal</span><span>Unit</span></> : <span>Type a number, in {unit}</span>}
          </div>
        </div>

        <p role="status" className="cap" style={{ minHeight: 18, marginTop: 12, textAlign: "center", fontSize: 13, color: err ? "#C9363B" : "var(--gray)" }}>
          {err || (mi ? `That's ${fmt(v)} km` : " ")}
        </p>
        <button type="button" className="btn btn-blue" disabled={!!err} style={{ width: "100%", marginTop: 8, opacity: err ? 0.5 : 1 }}
          onClick={done}>Done</button>
      </motion.div>
    </motion.div>
  );
}

/* Bottom sheet calendar for an exact deadline: month grid, past days disabled, live day count */
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
function DateSheet({ value, onSave, onClose }: { value: Date; onSave: (d: Date) => void; onClose: () => void }) {
  const first = addDays(1);
  const [sel, setSel] = useState(value < first ? first : value);
  const [month, setMonth] = useState(new Date(sel.getFullYear(), sel.getMonth(), 1));
  const lead = (month.getDay() + 6) % 7; // weeks start on Monday
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const canPrev = month > new Date(first.getFullYear(), first.getMonth(), 1);
  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  return (
    <motion.div key="date-sheet" initial={{ opacity: 1 }} exit={{ opacity: 1 }} transition={{ duration: 0.3 }}
      style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "flex-end" }}>
      <motion.div aria-hidden onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        style={{ position: "absolute", inset: 0, background: "rgba(11,18,32,0.42)" }} />
      <motion.div role="dialog" aria-modal="true" aria-labelledby="date-title" onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 420, damping: 40 }}
        style={{ position: "relative", width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", padding: "10px 20px 28px", boxShadow: "0 -12px 40px -20px rgba(11,18,32,0.4)" }}>
        <span aria-hidden style={{ display: "block", width: 36, height: 4, borderRadius: 2, background: "var(--line)", margin: "0 auto 16px" }} />
        <h2 id="date-title" className="h2" style={{ fontSize: 18 }}>Pick your deadline</h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <button type="button" className="icon-btn" aria-label="Previous month" onClick={() => shift(-1)} disabled={!canPrev} style={{ opacity: canPrev ? 1 : 0.35 }}><CaretLeft size={18} weight="bold" /></button>
          <span aria-live="polite" style={{ fontSize: 16, fontWeight: 600 }}>{month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</span>
          <button type="button" className="icon-btn" aria-label="Next month" onClick={() => shift(1)}><CaretRight size={18} weight="bold" /></button>
        </div>
        <div role="grid" aria-label="Calendar" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 4, marginTop: 12, textAlign: "center" }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} className="cap" style={{ fontSize: 12, fontWeight: 600, paddingBottom: 6 }}>{d}</span>)}
          {cells.map((d, i) => {
            if (!d) return <span key={`e${i}`} />;
            const off = d < first, on = sameDay(d, sel), today = sameDay(d, TODAY);
            return (
              <button key={i} type="button" disabled={off} aria-pressed={on} aria-label={fmtDate(d)} onClick={() => setSel(d)}
                className="num" style={{ justifySelf: "center", width: 40, height: 40, borderRadius: "50%", fontSize: 15, fontWeight: on ? 600 : 500, letterSpacing: 0,
                  background: on ? "var(--blue)" : "transparent", color: on ? "#fff" : off ? "var(--gray-2)" : "var(--ink)",
                  boxShadow: today && !on ? "inset 0 0 0 1.5px var(--blue-100)" : "none", cursor: off ? "default" : "pointer", transition: "background .15s" }}>
                {d.getDate()}
              </button>
            );
          })}
        </div>
        <p className="cap" aria-live="polite" style={{ marginTop: 12, textAlign: "center", fontSize: 14 }}>
          <strong style={{ color: "var(--ink)" }}>{fmtDate(sel)}</strong>, {daysUntil(sel)} days from today
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10, marginTop: 14 }}>
          <button type="button" className="btn btn-soft" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-blue" onClick={() => { onSave(sel); onClose(); }}>Set deadline</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

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
  if (group === "Cycling" || ["skate", "rollerski", "skateboard"].includes(id)) return { src: "/img/goal-ride.jpg", pos: "40% 70%" };
  if (group === "Water") return { src: "/img/goal-swim.jpg", pos: "50% 50%" };
  if (group === "Snow" || ["hike", "trek", "climb", "yoga", "pilates", "mobility", "stretch"].includes(id)) return { src: "/img/goal-trail.jpg", pos: "70% 60%" };
  if (group === "Strength" || group === "Racket" || group === "Team") return { src: "/img/goal-gym.jpg", pos: "50% 50%" };
  // motion-blurred stride, supplied by the client
  return { src: "/img/goal-run.webp", pos: "50% 45%" };
};
const QUESTIONS = 4; // sport, goal, deadline, motto; the goal card follows
// the Ennoo mark (from the brand file) as a hairline outline, tiled
const LOOP_PATTERN = "url(/img/loop-pattern.svg)";
const timeframes = [
  { label: "3 months", days: 90 },
  { label: "6 months", days: 180 },
  { label: "End of year", days: daysUntil(new Date(2026, 11, 31)) },
  { label: "1 year", days: 365 },
];
/* Turn a weekly total into the sessions people actually plan in */
const sessionNoun: Record<string, string> = { vrun: "runs", mtb: "rides", gravel: "rides", vride: "rides", ebike: "rides", emtb: "rides", handcycle: "rides", velomobile: "rides", vrow: "rows", sail: "sails", nordic: "ski days", backcountry: "tours", snowshoe: "outings", wheelchair: "pushes", run: "runs", trail: "runs", walk: "walks", hike: "hikes", trek: "treks", cycle: "rides", swim: "swims", row: "rows", kayak: "paddles", canoe: "paddles", paddle: "paddles", ski: "ski days", skate: "skates" };
function planLine(id: string, unit: string, perWeek: number, days: number, left: number) {
  const r1 = (n: number) => (n >= 10 ? Math.round(n) : Math.round(n * 10) / 10);
  if (unit === "km") {
    const n = perWeek > 12 ? 3 : 2;
    return `That's ${n} ${sessionNoun[id] ?? "sessions"} a week of about ${fmt(r1(perWeek / n))} km.`;
  }
  if (unit === "races") { const gap = Math.max(1, Math.round(days / 7 / Math.max(1, left))); return `That's one race every ${gap} week${gap > 1 ? "s" : ""}.`; }
  if (perWeek < 1) { const gap = Math.max(2, Math.round(1 / perWeek)); return `That's about one ${unit.replace(/s$/, "")} every ${gap} weeks.`; }
  return `That's about ${fmt(Math.round(perWeek))} ${unit} a week.`;
}
const groups: ("All" | Group)[] = ["All", ...groupOrder];
const fmt = (n: number) => n.toLocaleString("en-IN");

/* A goal number as one tappable row: icon, value, a hint, a chevron. The number sheet is the
   only way to change it, so number, decimal and unit are all set in one place. */
function PickerField({ label, hint, value, unit, Icon, onEdit }: { label: string; hint: string; value: number; unit: string; Icon: typeof Target; onEdit: () => void }) {
  return (
    <button type="button" className="card" onClick={onEdit} aria-label={`${label}: ${fmt(value)} ${unit}. Tap to change it`}
      style={{ width: "100%", textAlign: "left", padding: "14px 14px 14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
      <span aria-hidden style={{ width: 44, height: 44, borderRadius: 14, background: "var(--blue-50)", color: "var(--blue)", display: "grid", placeItems: "center", flex: "none" }}>
        <Icon size={22} weight="duotone" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="cap" style={{ display: "block" }}>{label}</span>
        <span className="num" aria-live="polite" style={{ display: "block", fontSize: 24, fontWeight: 650, letterSpacing: 0, lineHeight: 1.2, marginTop: 1 }}>
          {fmt(value)} <span style={{ fontSize: 15, fontWeight: 600, color: "var(--blue)" }}>{unit}</span>
        </span>
        <span className="cap" style={{ display: "block", marginTop: 2 }}>{hint}</span>
      </span>
      <CaretRight size={18} color="var(--gray)" aria-hidden />
    </button>
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
  const sections = groupOrder.map((g) => ({ g, items: list.filter((a) => a.group === g) })).filter((s) => s.items.length);

  const pick = (id: string) => { setActivity(id); setTarget(ideasFor(id)[1].v); setCurrent(0); };
  const move = (d: number) => {
    if (step + d < 0) return go("signup");
    if (step + d > QUESTIONS) return onDone({ name: first, activity, target, current, due: fmtDate(due), daysLeft: days, motto: motto.trim() });
    setDir(d); setStep(step + d); setStuck(false);
  };
  const cta = [`Continue with ${act.name}`, "Continue", "Continue", "Create my goal", "Start my journey"][step];
  // the card itself goes out as a 1080×1920 PNG: native share sheet where files are supported, otherwise a download
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState<"idle" | "busy" | "saved">("idle");
  const share = async () => {
    const node = cardRef.current;
    if (!node || sharing === "busy") return;
    setSharing("busy");
    try {
      await document.fonts.ready;
      const blob = await toBlob(node, { pixelRatio: 1, canvasWidth: 1080, canvasHeight: 1920, cacheBust: true, style: { margin: "0", transform: "none", boxShadow: "none", borderRadius: "0" } });
      if (!blob) throw new Error("render failed");
      const file = new File([blob], `ennoo-${act.name.toLowerCase()}-goal.png`, { type: "image/png" });
      const text = `My ${act.name.toLowerCase()} goal on Ennoo: ${fmt(target)} ${unit} by ${fmtDate(due)}.`;
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Ennoo goal", text });
        setSharing("idle");
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        setSharing("saved"); setTimeout(() => setSharing("idle"), 2200);
      }
    } catch { setSharing("idle"); /* share sheet dismissed */ }
  };
  const [editing, setEditing] = useState<null | "target" | "current">(null);
  const [pickingDate, setPickingDate] = useState(false);
  // their own photo for the story card; kept as an object URL, released when replaced or on unmount
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);
  const pickPhoto = (f?: File) => { if (f && f.type.startsWith("image/")) setPhoto(URL.createObjectURL(f)); };

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
            <div role="progressbar" aria-valuemin={1} aria-valuemax={QUESTIONS} aria-valuenow={step + 1} aria-label={`Step ${step + 1} of ${QUESTIONS}`} style={{ display: "grid", gridTemplateColumns: `repeat(${QUESTIONS},1fr)`, gap: 5, width: 132, justifySelf: "center" }}>
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
                <p className="meta" style={{ fontSize: 15, lineHeight: 1.5 }}>Pick your main sport. We'll shape your goal and stats around it, and you can still log all {activities.length}.</p>
                <div style={{ ...band(stuck), top: titleH - 24, zIndex: 2, margin: "0 -20px", padding: "20px 20px 12px", boxShadow: stuck ? "0 1px 0 var(--line)" : "none" }}>
                <div style={{ position: "relative" }}>
                  <MagnifyingGlass size={18} color="var(--gray)" style={{ position: "absolute", left: 16, top: 18 }} />
                  <input ref={searchRef} type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape" && q) { e.preventDefault(); setQ(""); } }}
                    placeholder={`Search all ${activities.length} activities`} aria-label="Search activities" style={{ paddingLeft: 44, paddingRight: q ? 48 : 16, background: "var(--bg)", borderColor: "transparent" }} />
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
                      {g}<span style={{ opacity: 0.6 }} className="num">{g === "All" ? activities.length : activities.filter((a) => a.group === g).length}</span>
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
                <div className="sec" style={{ marginTop: 24 }}><h2 className="h2">Popular challenges</h2><span className="cap">Swipe for more</span></div>
                {/* challenge cards: sport, name, what it takes, set as goal. Edge to edge, snapping, the next card peeks */}
                <div role="radiogroup" aria-label={`Popular ${act.name.toLowerCase()} challenges`}
                  style={{ display: "flex", gap: 12, overflowX: "auto", margin: "0 -20px", padding: "2px 20px 8px", scrollSnapType: "x mandatory", scrollPaddingInline: 20, scrollbarWidth: "none" }}>
                  {ideasFor(activity).map((it) => {
                    const on = target === it.v;
                    return (
                      <button key={it.v} role="radio" aria-checked={on} onClick={(e) => { setTarget(it.v); if (current >= it.v) setCurrent(0); e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" }); }}
                        style={{ flex: "0 0 224px", scrollSnapAlign: "start", display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left", padding: 16, borderRadius: 22,
                          border: `1.5px solid ${on ? "var(--blue)" : "var(--line)"}`, background: on ? "var(--blue-50)" : "#fff", boxShadow: on ? "0 10px 24px -16px rgba(0,84,251,0.6)" : "none", transition: "all .2s" }}>
                        <span style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: on ? "#fff" : "var(--bg)" }}><SportIcon Icon={act.Icon} size={24} selected={on} /></span>
                        <span style={{ marginTop: 12, fontSize: 17, fontWeight: 650, lineHeight: 1.2, color: "var(--ink)" }}>{fmt(it.v)} {unit} {act.name} Challenge</span>
                        <span className="cap" style={{ marginTop: 6, fontSize: 13, lineHeight: 1.45, flex: 1 }}>Log {fmt(it.v)} {unit} in total. {it.label}.</span>
                        <span aria-hidden className="btn" style={{ width: "100%", height: 42, marginTop: 14, fontSize: 15, fontWeight: 600, gap: 6,
                          background: on ? "var(--blue)" : "var(--blue-50)", color: on ? "#fff" : "var(--blue)" }}>
                          {on ? <><Check size={16} weight="bold" />Goal set</> : "Set as goal"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
                  <PickerField label="Your target" hint="Tap to enter your number" value={target} unit={unit} Icon={Target} onEdit={() => setEditing("target")} />
                  <PickerField label="Already done" hint={current > 0 ? "Counted toward your goal" : "Optional, leave at 0 to start fresh"} value={current} unit={unit} Icon={CheckCircle} onEdit={() => setEditing("current")} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="title">When's your finish line?</h1>
                <p className="meta" style={{ fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>Pick a date. We'll pace every week to get you there.</p>
                {/* the countdown leads; the calendar page carries the date; the weekly plan follows */}
                <div className="card" style={{ position: "relative", overflow: "hidden", isolation: "isolate", marginTop: 22, padding: 16, display: "flex", alignItems: "center", gap: 16 }} aria-live="polite">
                  {/* brand texture: staggered Ennoo infinity loops in hairline strokes, fading out behind the text */}
                  <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1, backgroundImage: LOOP_PATTERN, backgroundSize: "320px 128px",
                    WebkitMaskImage: "linear-gradient(90deg, transparent 18%, #000 78%)", maskImage: "linear-gradient(90deg, transparent 18%, #000 78%)" }} />
                  <div aria-hidden style={{ order: 2, width: 78, flex: "none", borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)", boxShadow: "0 8px 18px -12px rgba(11,18,32,0.45)", textAlign: "center", background: "#fff" }}>
                    <div style={{ background: "var(--ink)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "5px 4px", whiteSpace: "nowrap" }}>{due.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</div>
                    <div style={{ fontFamily: "var(--sport)", fontStretch: "72%", fontSize: 36, fontWeight: 620, lineHeight: 1, padding: "7px 0 0", letterSpacing: 0 }}>{due.getDate()}</div>
                    <div className="cap" style={{ fontSize: 11, paddingBottom: 7 }}>{due.toLocaleDateString("en-GB", { weekday: "short" })}</div>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span className="num" style={{ fontSize: 34, fontWeight: 650, lineHeight: 1, color: "var(--blue)", letterSpacing: "-0.02em" }}>{days}</span>
                      <span style={{ fontSize: 17, fontWeight: 600 }}>days to go</span>
                    </p>
                    <p className="cap" style={{ marginTop: 6, lineHeight: 1.45 }}>{planLine(activity, unit, perWeek, days, target - current)}</p>
                  </div>
                </div>
                <div className="sec" style={{ marginTop: 24 }}><h2 className="h2">Choose a timeframe</h2></div>
                <div role="radiogroup" aria-label="Timeframes" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {timeframes.map((t) => <Option key={t.label} on={days === t.days && !custom} onClick={() => { setDays(t.days); setCustom(""); }} title={t.label} sub={`Ends ${addDays(t.days).getFullYear() === TODAY.getFullYear() ? fmtShort(addDays(t.days)) : fmtDate(addDays(t.days))}`} />)}
                </div>
                <button type="button" className="card" onClick={() => setPickingDate(true)} style={{ width: "100%", textAlign: "left", marginTop: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", borderColor: custom ? "var(--blue)" : "var(--line)" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: "var(--blue-50)", color: "var(--blue)", display: "grid", placeItems: "center", flex: "none" }}><CalendarBlank size={20} weight="duotone" /></span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 560 }}>{custom ? "Your own date" : "Choose your own date"}</span>
                    <span className="cap">{custom ? `Ends ${fmtDate(new Date(custom))}` : "Any day from tomorrow"}</span>
                  </span>
                  <CaretRight size={16} color="var(--gray-2)" />
                </button>
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
                <p className="meta" style={{ fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>Share your goal to stay on track. Add your own photo to make it yours.</p>
                {/* the payoff: everything they chose, set as one card */}
                <motion.div ref={cardRef} initial={{ opacity: 0, y: 24, scale: 0.94, rotate: -2 }} animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.1 }}
                  style={{ margin: "22px auto 0", width: "min(100%, 300px)", aspectRatio: "9 / 16", borderRadius: 28, padding: "20px 20px 22px", color: "#fff", position: "relative", overflow: "hidden", isolation: "isolate",
                    display: "flex", flexDirection: "column", background: "#061026", boxShadow: "0 28px 50px -24px rgba(3,11,36,0.75)" }}>
                  {/* vintage, moody grade: faded film colour, navy wash, heavy vignette, grain */}
                  <img src={photo ?? goalPhoto(activity).src} alt="" aria-hidden
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: photo ? "50% 50%" : goalPhoto(activity).pos, zIndex: -1,
                      filter: "saturate(0.9) sepia(0.14) contrast(1.08) brightness(0.8)" }} />
                  <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1, background: "#0A1E5C", mixBlendMode: "multiply", opacity: 0.22 }} />
                  <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1,
                    background: "linear-gradient(180deg, rgba(4,8,20,0.7) 0%, rgba(4,8,20,0.2) 30%, rgba(4,8,20,0.35) 62%, rgba(4,8,20,0.9) 100%), radial-gradient(120% 90% at 50% 45%, transparent 45%, rgba(2,4,12,0.65) 100%)" }} />
                  <div aria-hidden className="grain" style={{ opacity: 0.35, zIndex: -1 }} />
                  {/* 9:16 so it drops straight into an Instagram story */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.16)", display: "grid", placeItems: "center" }}><act.Icon size={16} weight="fill" /></span>
                      <span style={{ fontSize: 13, fontWeight: 560 }}>My {act.name.toLowerCase()} goal</span>
                    </span>
                    <Wordmark width={56} color="rgba(255,255,255,0.85)" />
                  </div>
                  <p style={{ fontFamily: "var(--sport)", fontStretch: "72%", fontWeight: 620, fontSize: 56, lineHeight: 0.95, marginTop: 18 }}>
                    <span className="num">{fmt(target)}</span> <span style={{ fontSize: 24, fontStyle: "italic" }}>{unit}</span>
                  </p>
                  <p style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{days} days, about {fmt(round(perWeek))} {unit} a week</p>
                  {/* a head start, when they've already logged some of it */}
                  {current > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                        <span><strong className="num" style={{ color: "#fff", fontWeight: 650, letterSpacing: 0 }}>{fmt(current)} {unit}</strong> done already</span>
                        <span className="num" style={{ letterSpacing: 0 }}>{Math.round((current / target) * 100)}%</span>
                      </div>
                      <div role="progressbar" aria-label="Progress so far" aria-valuemin={0} aria-valuemax={target} aria-valuenow={current}
                        style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", marginTop: 6, overflow: "hidden" }}>
                        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: Math.max(0.02, current / target) }} transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                          style={{ height: "100%", background: "linear-gradient(90deg, #3D8BFF, #fff)", transformOrigin: "left", borderRadius: 2 }} />
                      </div>
                    </div>
                  )}
                  {/* the motto as a pull quote: a large hanging opening mark, italic serif, a soft closing mark */}
                  {motto.trim() && (
                    <blockquote style={{ position: "relative", margin: "20px 0 0", padding: "4px 0 0 22px" }}>
                      <span aria-hidden style={{ position: "absolute", left: -2, top: -10, fontFamily: "var(--serif)", fontSize: 54, lineHeight: 1, color: "rgba(255,255,255,0.9)" }}>“</span>
                      <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 19, lineHeight: 1.22, color: "#fff", textWrap: "balance" }}>
                        {motto.trim().replace(/^["“”]+|["“”]+$/g, "")}<span aria-hidden style={{ display: "inline-block", fontSize: 32, lineHeight: 0, color: "rgba(255,255,255,0.9)", marginLeft: 3, transform: "translateY(0.32em)" }}>”</span>
                      </p>
                    </blockquote>
                  )}
                  <div style={{ flex: 1, minHeight: 0, margin: "14px 4px 8px" }}>
                    <GoalRoute days={days} current={current} target={target} unit={unit} />
                  </div>
                  {/* signed like a pledge, in a handwritten script */}
                  {first && (
                    <p style={{ textAlign: "right", fontSize: 13, color: "rgba(255,255,255,0.72)" }}>
                      by <span style={{ fontFamily: "var(--signature)", fontSize: 36, lineHeight: 0.8, color: "#fff", marginLeft: 4 }}>{first}</span>
                    </p>
                  )}
                </motion.div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                  <label className="btn btn-soft" style={{ position: "relative", gap: 8, fontWeight: 560, cursor: "pointer", padding: "0 12px", fontSize: 15, minWidth: 0 }}>
                    <ImageSquare size={18} weight="bold" />{photo ? "Change photo" : "Add your photo"}
                    <input type="file" accept="image/*" aria-label="Upload your own photo for the goal card" onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ""; }}
                      style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                  </label>
                  <button type="button" className="btn btn-soft" onClick={share} disabled={sharing === "busy"} aria-busy={sharing === "busy"} style={{ gap: 8, fontWeight: 560, padding: "0 12px", fontSize: 15, minWidth: 0 }} aria-live="polite">
                    {sharing === "busy" ? <span className="spinner" aria-hidden /> : <ShareFat size={18} weight="bold" />}
                    {sharing === "busy" ? "Preparing" : sharing === "saved" ? "Image saved" : "Share my goal"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ flex: "none", padding: "14px 20px 34px", background: "#fff", borderTop: "1px solid var(--line)" }}>
        <button className="btn btn-blue" style={{ width: "100%", gap: 8 }} onClick={() => move(1)}>{cta}<ArrowRight size={18} weight="bold" aria-hidden /></button>
      </div>

      <AnimatePresence>
        {editing === "target" && (
          <NumberSheet title="Your target" help={`Total ${unit} of ${act.name.toLowerCase()} you want to reach`} unit={unit} value={target} min={1}
            onSave={(v) => { setTarget(v); if (current >= v) setCurrent(0); }} onClose={() => setEditing(null)} />
        )}
        {editing === "current" && (
          <NumberSheet title="Already done" help={`How many ${unit} you have so far. Must be less than your target of ${fmt(target)}.`} unit={unit} value={current} min={0} max={target - 1}
            onSave={setCurrent} onClose={() => setEditing(null)} />
        )}
        {pickingDate && (
          <DateSheet value={due} onSave={(d) => { setCustom(iso(d)); setDays(daysUntil(d)); }} onClose={() => setPickingDate(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
