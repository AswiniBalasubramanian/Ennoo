import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { play } from "cuelume";
import { toBlob } from "html-to-image";
import { ArrowLeft, ArrowRight, MagnifyingGlass, Check, CheckCircle, Target, CalendarBlank, CaretRight, CaretLeft, CaretDown, X, ImageSquare, ShareFat, Ruler, Scales, MapPin, Info, Trophy, Mountains, Path, ArrowsClockwise, Plus, Timer, NavigationArrow, DownloadSimple } from "@phosphor-icons/react";
import { StatusBar, SportIcon, Wordmark, type Route } from "../components";
import { Sheet, Wheel, WheelBand } from "../sheet";
import { TrackIcon, RouteIcon, type SportIconType } from "../sportIcons";
import { activities, byId, mottos, groupInfo, groupOrder, matches, savedPlaces, nearbyPlaces, type Activity, type Group, type Place, type PlaceType } from "../data";
import { METRICS, fmtN, fmtHours, fmtTime, refText, goalParts, goalSentence, amount, type Goal, type Metric, type DistUnit } from "../metrics";

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
          <button data-cuelume-tap key={s} type="button" className="chip" onClick={() => onPick(s)}>{s}</button>
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
function GoalRoute({ days, vals, started, Icon }: { days: number; vals: string[]; started: boolean; Icon: SportIconType | typeof Target }) {
  const d = "M" + ROUTE.map(([x, y]) => `${x} ${y}`).join(" L");
  const stop = (i: number) => ({ date: fmtShort(addDays(Math.round((days * i) / 4))), val: vals[i] });
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
              <g>
                {/* the chosen activity's icon on a flat blue disc */}
                <circle cx={x} cy={y} r="13" fill="#0054FB" stroke="#fff" strokeWidth="2" />
                <g transform={`translate(${x - 8} ${y - 8})`} style={{ color: "#fff" }}><Icon size={16} weight="duotone" color="#fff" /></g>
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
            <text x={x + dx} y={y + dy - 6} textAnchor={anchor} fill="#fff" fontSize="12" fontWeight="600" fontFamily="DM Sans Variable, DM Sans, system-ui">{start ? `Today, ${s.date}` : end ? `Goal, ${s.date}` : s.date}</text>
            <text x={x + dx} y={y + dy + 8} textAnchor={anchor} fill="rgba(255,255,255,0.72)" fontSize="11" fontFamily="DM Sans Variable, DM Sans, system-ui">{start && started ? `${s.val} done` : s.val}</text>
          </motion.g>
        );
      })}
    </svg>
  );
}

/* ---------- Goal set-up fields: typed straight into the page, no sheets ---------- */
const unitName: Record<string, string> = { hours: "hours", minutes: "min" };
const clean = (v: string, dec?: boolean) => {
  let t = v.replace(dec ? /[^0-9.]/g : /[^0-9]/g, "");
  if (dec) { const [a, ...b] = t.split("."); t = b.length ? `${a}.${b.join("").slice(0, 2)}` : a; }
  return t.replace(/^0+(?=\d)/, "").slice(0, 9);
};
const fieldErr = (msg?: string) => msg ? <p className="err" role="alert" style={{ marginTop: 6 }}>{msg}</p> : null;

/* Unit picker that matches the app: a quiet button in the field, opening a small card of options.
   Arrow keys move, Enter or Space picks, Escape or a tap outside closes. */
function UnitMenu({ label, units, unit, onUnit }: { label: string; units: string[]; unit?: string; onUnit: (u: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    list.current?.focus();
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);
  const show = () => { setHi(Math.max(0, units.indexOf(unit ?? ""))); setOpen(true); };
  const pick = (u: string) => { onUnit(u); setOpen(false); btn.current?.focus(); };
  return (
    <div ref={wrap} className="umenu">
      <button ref={btn} data-cuelume-open type="button" className="umenu-btn" aria-haspopup="listbox" aria-expanded={open} aria-label={`${label}: ${unitName[unit ?? ""] ?? unit}`}
        onClick={() => (open ? setOpen(false) : show())} onKeyDown={(e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); show(); } }}>
        {unitName[unit ?? ""] ?? unit}<CaretDown size={13} weight="bold" aria-hidden style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div ref={list} role="listbox" tabIndex={-1} aria-label={label} aria-activedescendant={`um-${units[hi]}`} className="umenu-list"
            initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(units.length - 1, h + 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
              else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(units[hi]); }
              else if (e.key === "Escape" || e.key === "Tab") { setOpen(false); if (e.key === "Escape") btn.current?.focus(); }
            }}>
            {units.map((u, i) => {
              const on = u === unit;
              return (
                <div key={u} id={`um-${u}`} role="option" aria-selected={on} data-hi={i === hi || undefined} data-cuelume-select className="umenu-opt"
                  onPointerEnter={() => setHi(i)} onClick={() => pick(u)}>
                  <span>{unitName[u] ?? u}</span>{on && <Check size={15} weight="bold" aria-hidden />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* A number and its unit in one box: the unit is a fixed suffix, or a small menu when there's a choice */
function NumField({ id, label, optional, value, onChange, decimals, suffix, units, unit, onUnit, error, placeholder }: {
  id: string; label: string; optional?: boolean; value: number; onChange: (v: number) => void; decimals?: boolean; suffix?: string;
  units?: string[]; unit?: string; onUnit?: (u: string) => void; error?: string; placeholder?: string;
}) {
  const [text, setText] = useState(value ? String(value) : "");
  // follow the value when it changes from outside (a new metric, a unit switch), not while typing "10."
  useEffect(() => { if ((Number(text) || 0) !== value) setText(value ? String(value) : ""); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <label className="flabel" htmlFor={id}>{label}{optional && <span className="opt">Optional</span>}</label>
      <div style={{ position: "relative" }}>
      <div className="nf" data-invalid={error ? "true" : undefined}>
        <input data-cuelume-type id={id} inputMode={decimals ? "decimal" : "numeric"} placeholder={placeholder ?? "0"} value={text} aria-invalid={!!error}
          onChange={(e) => { const t = clean(e.target.value, decimals); setText(t); onChange(Number(t) || 0); }} />
        {units && onUnit
          ? <UnitMenu label={`${label} unit`} units={units} unit={unit} onUnit={onUnit} />
          : suffix && <span className="sfx">{suffix}</span>}
      </div>
      </div>
      {fieldErr(error)}
    </div>
  );
}

type TimeFmt = "hms" | "sec";

function Seg<T extends string>({ label, options, value, onChange }: { label: string; options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map(([v, t]) => <button data-cuelume-select key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}>{t}</button>)}
    </div>
  );
}
const Note = ({ children }: { children: React.ReactNode }) => <p className="note"><Info size={17} weight="fill" aria-hidden /><span>{children}</span></p>;

const placeIcon: Record<PlaceType, typeof Path | SportIconType> = { Track: TrackIcon, Hill: Mountains, Road: Path, Loop: ArrowsClockwise };
const placeLine = (p: Place) => `${fmtN(p.dist)} ${p.unit} · ${p.type}`;
const awayText = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m away` : `${fmtN(Math.round(km * 10) / 10)} km away`);
export type LocState = "unknown" | "locating" | "on" | "off";

/* The place's photo, or its type icon for a place the person added themselves */
function PlaceThumb({ p, on }: { p: Place; on: boolean }) {
  return p.img
    ? <img src={p.img} alt="" aria-hidden style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", flex: "none", boxShadow: on ? "0 0 0 2px #fff, 0 0 0 3.5px var(--blue)" : "none" }} />
    : <span aria-hidden style={{ width: 52, height: 52, borderRadius: 12, background: on ? "#fff" : "var(--bg)", display: "grid", placeItems: "center", flex: "none" }}><SportIcon Icon={placeIcon[p.type]} size={24} selected={on} neutral /></span>;
}
const SkeletonRow = () => (
  <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 16, border: "1.5px solid var(--line)" }}>
    <span className="skel" style={{ width: 52, height: 52, borderRadius: 12 }} />
    <span style={{ flex: 1, display: "grid", gap: 8 }}><span className="skel" style={{ height: 12, width: "62%", borderRadius: 6 }} /><span className="skel" style={{ height: 10, width: "40%", borderRadius: 6 }} /></span>
  </div>
);

/* Places for a Reps or Laps reference, found like a map search: with location on, saved places and places
   near you are sorted by how far away they are and the search box looks around you; with it off, only saved
   places show. One tap to pick (tap again to clear), or add a new one inline. */
function PlacePicker({ noun, places, selected, onSelect, onAdd, loc, onAskLoc }: {
  noun: "rep" | "lap"; places: Place[]; selected?: string; onSelect: (p: Place | null) => void; onAdd: (p: Place) => void; loc: LocState; onAskLoc: () => void;
}) {
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<{ name: string; dist: number; unit: string; type: PlaceType }>({ name: "", dist: 0, unit: noun === "lap" ? "m" : "km", type: noun === "lap" ? "Track" : "Hill" });
  const [tried, setTried] = useState(false);
  // a short "searching around you" beat after each pause in typing, like a real lookup
  useEffect(() => { if (loc !== "on" || !q.trim()) return setSearching(false); setSearching(true); const t = setTimeout(() => setSearching(false), 450); return () => clearTimeout(t); }, [q, loc]);
  const gps = loc === "on";
  const term = q.trim().toLowerCase();
  const hit = (p: Place) => !term || p.name.toLowerCase().includes(term) || (p.area ?? "").toLowerCase().includes(term) || p.type.toLowerCase().includes(term);
  const byAway = (a: Place, b: Place) => (a.away ?? 99) - (b.away ?? 99);
  const saved = places.filter(hit).sort(gps ? byAway : () => 0);
  const nearby = gps ? nearbyPlaces.filter((n) => !places.some((p) => p.id === n.id)).filter(hit).sort(byAway) : [];
  const pick = (p: Place, on: boolean) => { if (on) return onSelect(null); if (!places.some((x) => x.id === p.id)) onAdd(p); onSelect(p); };
  const save = () => {
    setTried(true);
    if (!draft.name.trim() || !(draft.dist > 0)) return;
    const p: Place = { id: `pl-${Date.now()}`, name: draft.name.trim(), dist: draft.dist, unit: draft.unit as Place["unit"], type: draft.type, ...(gps && { away: 0, area: "Your location" }) };
    onAdd(p); onSelect(p); setAdding(false); setTried(false); setDraft({ ...draft, name: "", dist: 0 });
  };
  const row = (p: Place) => {
    const on = p.id === selected;
    return (
      <button data-cuelume-select key={p.id} type="button" role="radio" aria-checked={on} onClick={() => pick(p, on)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: 8, paddingRight: 12, borderRadius: 16, textAlign: "left", border: `1.5px solid ${on ? "var(--blue)" : "var(--line)"}`, background: on ? "var(--blue-50)" : "#fff", transition: "all .2s" }}>
        <PlaceThumb p={p} on={on} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 15, fontWeight: 600, color: on ? "var(--blue)" : "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
          <span className="cap num" style={{ letterSpacing: 0, display: "block" }}>{placeLine(p)}{p.area && ` · ${p.area}`}</span>
          {gps && p.away !== undefined && <span className="num" style={{ display: "inline-flex", alignItems: "center", gap: 3, marginTop: 3, fontSize: 12, fontWeight: 600, color: "var(--ink)", letterSpacing: 0 }}><NavigationArrow size={11} weight="fill" aria-hidden />{p.away === 0 ? "Here" : awayText(p.away)}</span>}
        </span>
        <span aria-hidden style={{ width: 22, height: 22, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", background: on ? "var(--blue)" : "transparent", border: on ? "none" : "1.5px solid var(--gray-2)", color: "#fff" }}>{on && <Check size={12} weight="bold" />}</span>
      </button>
    );
  };
  const head = (t: string) => <p className="cap" style={{ fontSize: 12, fontWeight: 600, margin: "6px 2px 0", color: "var(--gray)" }}>{t}</p>;
  return (
    <div>
      <span className="flabel">{noun === "lap" ? "Find a track" : "Find a location"}</span>
      <div style={{ position: "relative" }}>
        <MagnifyingGlass size={17} color="var(--gray)" aria-hidden style={{ position: "absolute", left: 14, top: 15 }} />
        <input data-cuelume-type type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={gps ? "Search places near you" : "Search saved places"} aria-label={gps ? "Search places near you" : "Search saved places"}
          style={{ height: 46, paddingLeft: 40, background: "var(--bg)", borderColor: "transparent" }} />
      </div>

      {/* where the search is looking from */}
      {loc === "on" && (
        <p className="cap" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13 }}>
          <span aria-hidden className="gps-dot" />Near you · Adyar, Chennai
        </p>
      )}
      {loc === "locating" && (
        <p className="cap" aria-live="polite" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13 }}>
          <span aria-hidden style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid var(--line)", borderTopColor: "var(--blue)", animation: "spin .8s linear infinite" }} />Finding places near you…
        </p>
      )}
      {(loc === "off" || loc === "unknown") && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, padding: "10px 12px", borderRadius: 14, background: "var(--bg)" }}>
          <MapPin size={18} color="var(--gray)" aria-hidden />
          <span style={{ flex: 1, fontSize: 13, color: "#344054", lineHeight: 1.35 }}>Turn on location to find tracks and hills near you.</span>
          <button data-cuelume-open type="button" className="link" style={{ fontSize: 13, flex: "none" }} onClick={onAskLoc}>Turn on</button>
        </div>
      )}

      <div role="radiogroup" aria-label="Places" style={{ display: "grid", gap: 8, marginTop: 10 }}>
        {loc === "locating" || searching ? <><SkeletonRow /><SkeletonRow /><SkeletonRow /></> : (<>
          {gps && saved.length > 0 && head("Saved")}
          {saved.map(row)}
          {nearby.length > 0 && head(term ? "Near you" : "Popular near you")}
          {nearby.map(row)}
          {!saved.length && !nearby.length && <p className="cap" style={{ padding: "6px 2px" }}>Nothing matches “{q}”{gps ? " near you" : ""}. Add it below.</p>}
        </>)}
      </div>
      {adding ? (
        <div className="card" style={{ marginTop: 10, padding: 14, display: "grid", gap: 14, background: "var(--bg)", borderColor: "transparent" }}>
          <div>
            <label className="flabel" htmlFor="pl-name">Name</label>
            <input data-cuelume-type id="pl-name" className="input" value={draft.name} maxLength={40} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder={noun === "lap" ? "Such as City Stadium track" : "Such as Temple hill"}
              aria-invalid={tried && !draft.name.trim()} style={{ height: 50 }} />
            {fieldErr(tried && !draft.name.trim() ? "Give the place a name" : undefined)}
          </div>
          <NumField id="pl-dist" label={noun === "lap" ? "Lap length" : "Length of one rep"} value={draft.dist} decimals onChange={(v) => setDraft({ ...draft, dist: v })}
            units={["m", "km", "mi"]} unit={draft.unit} onUnit={(u) => setDraft({ ...draft, unit: u })} error={tried && !(draft.dist > 0) ? "Enter its length" : undefined} />
          <div><span className="flabel">Type</span><Seg label="Place type" options={[["Track", "Track"], ["Hill", "Hill"], ["Road", "Road"], ["Loop", "Loop"]]} value={draft.type} onChange={(t) => setDraft({ ...draft, type: t })} /></div>
          {gps && <p className="cap" style={{ display: "flex", alignItems: "center", gap: 6 }}><span aria-hidden className="gps-dot" />Pinned to where you are now</p>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 8 }}>
            <button data-cuelume-close type="button" className="btn btn-soft" onClick={() => { setAdding(false); setTried(false); }}>Cancel</button>
            <button data-cuelume-tap type="button" className="btn btn-blue" onClick={save}>Save place</button>
          </div>
        </div>
      ) : (
        <button data-cuelume-open type="button" onClick={() => setAdding(true)}
          style={{ width: "100%", marginTop: 8, height: 48, borderRadius: 14, border: "1.5px dashed var(--line)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 560, color: "var(--blue)" }}>
          <Plus size={16} weight="bold" aria-hidden />Add a new place
        </button>
      )}
    </div>
  );
}

/* Asks before using location: says why, offers both allow choices and a clear no */
function LocationSheet({ onAllow, onDeny }: { onAllow: () => void; onDeny: () => void }) {
  return (
    <Sheet id="loc" title="Allow Ennoo to use your location?" onClose={onDeny}>
      <div aria-hidden style={{ position: "relative", height: 132, margin: "16px 0 4px", borderRadius: 18, overflow: "hidden", background: "var(--blue-50)" }}>
        <img src="/img/aerial.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55, filter: "saturate(0.6)" }} />
        <span className="gps-pulse" style={{ position: "absolute", left: "50%", top: "50%" }} />
      </div>
      <p className="meta" style={{ fontSize: 14, lineHeight: 1.5, marginTop: 12 }}>
        We use it to find tracks, hills and loops near you and show how far each one is. It's only used while you're picking a place.
      </p>
      <div style={{ display: "grid", gap: 8, marginTop: 18 }}>
        <button data-cuelume-tap type="button" className="btn btn-blue" style={{ width: "100%" }} onClick={onAllow}>Allow while using Ennoo</button>
        <button data-cuelume-tap type="button" className="btn btn-soft" style={{ width: "100%" }} onClick={onAllow}>Allow once</button>
        <button data-cuelume-close type="button" className="btn" style={{ width: "100%", height: 44, background: "transparent", color: "var(--gray)" }} onClick={onDeny}>Don't allow</button>
      </div>
    </Sheet>
  );
}

/* Target distance on scroll wheels: whole number, a tenth, and the unit, plus one-tap presets.
   Switching the unit converts the number rather than keeping it, so 100 km becomes 62.1 mi. */
const DIST_UNITS = ["km", "mi", "m"] as const;
const TO_M = { km: 1000, mi: 1609.344, m: 1 };
const wholesFor = (u: string) => (u === "m" ? Array.from({ length: 500 }, (_, i) => (i + 1) * 100) : Array.from({ length: 5000 }, (_, i) => i + 1));
const presetsFor = (u: string) => (u === "m" ? [1000, 5000, 10000, 21100, 42200] : [50, 100, 250, 500, 1000]);
function DistanceSheet({ value, unit, onSave, onClose, title = "Target distance", cta = "Set distance" }: { value: number; unit: string; onSave: (v: number, u: string) => void; onClose: () => void; title?: string; cta?: string }) {
  const place = (v: number, u: string) => {
    const ws = wholesFor(u);
    if (u === "m") { const i = Math.max(0, Math.min(ws.length - 1, Math.round(v / 100) - 1)); return { w: i, d: 0 }; }
    const r = Math.max(1, Math.min(5000, Math.round(v * 10) / 10));
    return { w: Math.floor(r) - 1, d: Math.round((r - Math.floor(r)) * 10) };
  };
  const [u, setU] = useState(Math.max(0, DIST_UNITS.indexOf(unit as "km")));
  const [{ w, d }, setPos] = useState(() => place(value, unit));
  const uName = DIST_UNITS[u], isM = uName === "m";
  const ws = wholesFor(uName);
  const v = ws[w] + (isM ? 0 : d / 10);
  const switchUnit = (i: number) => { const to = DIST_UNITS[i]; setPos(place((v * TO_M[uName]) / TO_M[to], to)); setU(i); };
  // Custom: type any number and pick the unit, instead of scrolling
  const [custom, setCustom] = useState(false);
  const [cVal, setCVal] = useState(0);
  const [cUnit, setCUnit] = useState<string>(uName);
  const [cTried, setCTried] = useState(false);
  useEffect(() => { if (custom) setTimeout(() => document.getElementById("dist-custom")?.focus(), 60); }, [custom]);
  const out = custom ? { v: cVal, u: cUnit } : { v, u: uName };
  const save = () => { if (custom && !(cVal > 0)) return setCTried(true); onSave(Math.round(out.v * 10) / 10, out.u); onClose(); };
  return (
    <Sheet id="dist" title={title} sub="Scroll to set it, tap a preset, or type your own." onClose={onClose}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", margin: "14px -20px 0", padding: "0 20px", scrollbarWidth: "none" }}>
        <button data-cuelume-select type="button" className="chip" aria-pressed={custom} onClick={() => { setCustom(true); setCVal(0); setCUnit(uName); setCTried(false); }} style={{ flex: "none", height: 34, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Plus size={13} weight="bold" aria-hidden />Custom
        </button>
        {presetsFor(uName).map((p) => (
          <button data-cuelume-select key={p} type="button" className="chip" aria-pressed={!custom && v === p} onClick={() => { setCustom(false); setPos(place(p, uName)); }} style={{ flex: "none", height: 34, fontSize: 13 }}>
            <span className="num" style={{ letterSpacing: 0 }}>{fmtN(p)} {uName}</span>
          </button>
        ))}
      </div>
      {custom ? (
        <div style={{ marginTop: 18, minHeight: 150 }}>
          <NumField id="dist-custom" label="Your distance" value={cVal} decimals placeholder="Such as 75" onChange={setCVal}
            units={[...DIST_UNITS]} unit={cUnit} onUnit={setCUnit} error={cTried && !(cVal > 0) ? "Enter a distance above 0" : undefined} />
        </div>
      ) : (
      <div style={{ position: "relative", marginTop: 12 }}>
        <WheelBand />
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: isM ? "1.6fr 1fr" : "1.3fr 14px 0.8fr 1fr", alignItems: "center" }}>
          <Wheel big label="Distance" items={ws.map((x) => fmtN(x))} index={w} onChange={(i) => setPos((p) => ({ ...p, w: i }))} />
          {!isM && <>
            <span aria-hidden className="num" style={{ fontSize: 26, fontWeight: 650, textAlign: "center" }}>.</span>
            <Wheel big label="Tenths" items={Array.from({ length: 10 }, (_, i) => String(i))} index={d} onChange={(i) => setPos((p) => ({ ...p, d: i }))} />
          </>}
          <Wheel big label="Unit" items={[...DIST_UNITS]} index={u} onChange={switchUnit} />
        </div>
      </div>
      )}
      <p className="cap" aria-live="polite" style={{ textAlign: "center", marginTop: 12, fontSize: 14 }}>
        {out.v > 0 && <><strong className="num" style={{ color: "var(--ink)", letterSpacing: 0 }}>{fmtN(out.v)} {out.u}</strong>
        {out.u !== "km" && <> · about {fmtN(Math.round((out.v * TO_M[out.u as "km"]) / 100) / 10)} km</>}</>}
      </p>
      <button data-cuelume-tap type="button" className="btn btn-blue" style={{ width: "100%", marginTop: 14 }} onClick={save}>{cta}</button>
    </Sheet>
  );
}

/* Chips row shared by the picker sheets: Custom first, then presets */
function PresetChips({ custom, onCustom, presets }: { custom: boolean; onCustom: () => void; presets: { label: string; on: boolean; pick: () => void }[] }) {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", margin: "14px -20px 0", padding: "0 20px", scrollbarWidth: "none" }}>
      <button data-cuelume-select type="button" className="chip" aria-pressed={custom} onClick={onCustom} style={{ flex: "none", height: 34, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 5 }}>
        <Plus size={13} weight="bold" aria-hidden />Custom
      </button>
      {presets.map((x) => (
        <button data-cuelume-select key={x.label} type="button" className="chip" aria-pressed={!custom && x.on} onClick={x.pick} style={{ flex: "none", height: 34, fontSize: 13 }}>
          <span className="num" style={{ letterSpacing: 0 }}>{x.label}</span>
        </button>
      ))}
    </div>
  );
}
const focusSoon = (id: string) => setTimeout(() => document.getElementById(id)?.focus(), 60);
const readout = (text: string | null, err: string | false) => (
  <p className="cap" aria-live="polite" style={{ textAlign: "center", marginTop: 12, fontSize: 14, minHeight: 20 }}>
    {text ? <strong className="num" style={{ color: "var(--ink)", letterSpacing: 0 }}>{text}</strong> : err && <span className="err">{err}</span>}
  </p>
);

/* Total time on hour and minute wheels */
const HOURS = Array.from({ length: 1000 }, (_, i) => String(i));
const MINS = Array.from({ length: 12 }, (_, i) => i * 5);
function DurationSheet({ value, onSave, onClose, title, cta }: { value: number; onSave: (hours: number) => void; onClose: () => void; title: string; cta: string }) {
  const split = (v: number) => { const t = Math.round(v * 12) / 12; return { h: Math.min(999, Math.floor(t)), mi: Math.round((t - Math.floor(t)) * 12) % 12 }; };
  const [{ h, mi }, setPos] = useState(() => split(value));
  const [custom, setCustom] = useState(false);
  const [ch, setCh] = useState(0);
  const [cm, setCm] = useState(0);
  const [tried, setTried] = useState(false);
  const total = custom ? ch + cm / 60 : h + MINS[mi] / 60;
  const bad = !(total > 0) || (custom && cm > 59);
  const save = () => { if (bad) return setTried(true); onSave(Math.round(total * 1000) / 1000); onClose(); };
  return (
    <Sheet id="dur" title={title} sub="Scroll to set it, tap a preset, or type your own." onClose={onClose}>
      <PresetChips custom={custom} onCustom={() => { setCustom(true); setCh(0); setCm(0); setTried(false); focusSoon("dur-h"); }}
        presets={[10, 25, 50, 100, 200].map((x) => ({ label: x + " h", on: h === x && mi === 0, pick: () => { setCustom(false); setPos({ h: x, mi: 0 }); } }))} />
      {custom ? (
        <div style={{ marginTop: 18, minHeight: 150, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignContent: "start" }}>
          <NumField id="dur-h" label="Hours" value={ch} onChange={setCh} suffix="h" />
          <NumField id="dur-m" label="Minutes" value={cm} onChange={setCm} suffix="min" error={cm > 59 ? "Up to 59" : undefined} />
        </div>
      ) : (
        <div style={{ position: "relative", marginTop: 12 }}>
          <WheelBand />
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.3fr 0.5fr 1fr 0.7fr", alignItems: "center" }}>
            <Wheel big label="Hours" items={HOURS} index={h} onChange={(i) => setPos((x) => ({ ...x, h: i }))} />
            <span aria-hidden style={{ fontSize: 17, fontWeight: 600 }}>h</span>
            <Wheel big label="Minutes" items={MINS.map((x) => String(x).padStart(2, "0"))} index={mi} onChange={(i) => setPos((x) => ({ ...x, mi: i }))} />
            <span aria-hidden style={{ fontSize: 17, fontWeight: 600 }}>min</span>
          </div>
        </div>
      )}
      {readout(!bad ? fmtHours(total) : null, tried && "Enter a time above 0")}
      <button data-cuelume-tap type="button" className="btn btn-blue" style={{ width: "100%", marginTop: 14 }} onClick={save}>{cta}</button>
    </Sheet>
  );
}

/* Any count or measure on wheels: whole numbers by step, optional tenths, and an optional unit wheel that converts */
type UnitDef = { name: string; f: number }; // f: size of one unit in the base unit
function NumberSheet({ title, cta, value, unit, units, min = 1, max, step = 1, tenths, presets, onSave, onClose }: {
  title: string; cta: string; value: number; unit: string; units?: UnitDef[]; min?: number; max: number; step?: number; tenths?: boolean;
  presets: number[]; onSave: (v: number, unit: string) => void; onClose: () => void;
}) {
  const wholes = useMemo(() => Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step), [min, max, step]);
  const labels = useMemo(() => wholes.map((x) => fmtN(x)), [wholes]);
  const place = (v: number) => {
    const r = tenths ? Math.round(v * 10) / 10 : v;
    const w = Math.max(0, Math.min(wholes.length - 1, Math.round((Math.floor(r) - min) / step)));
    return { w, d: tenths ? Math.round((r - Math.floor(r)) * 10) % 10 : 0 };
  };
  const [u, setU] = useState(unit);
  const [{ w, d }, setPos] = useState(() => place(value > 0 ? value : presets[0]));
  const [custom, setCustom] = useState(false);
  const [cv, setCv] = useState(0);
  const [tried, setTried] = useState(false);
  const v = custom ? cv : wholes[w] + (tenths ? d / 10 : 0);
  const switchUnit = (to: string) => {
    if (!units || to === u) return;
    const a = units.find((x) => x.name === u)!, b = units.find((x) => x.name === to)!;
    if (custom) setCv(Math.round(((cv * a.f) / b.f) * 10) / 10); else setPos(place((v * a.f) / b.f));
    setU(to);
  };
  const save = () => { if (!(v > 0)) return setTried(true); onSave(tenths ? Math.round(v * 10) / 10 : Math.round(v), u); onClose(); };
  return (
    <Sheet id="num" title={title} sub="Scroll to set it, tap a preset, or type your own." onClose={onClose}>
      <PresetChips custom={custom} onCustom={() => { setCustom(true); setCv(0); setTried(false); focusSoon("num-custom"); }}
        presets={presets.map((x) => ({ label: fmtN(x) + " " + u, on: v === x, pick: () => { setCustom(false); setPos(place(x)); } }))} />
      {custom ? (
        <div style={{ marginTop: 18, minHeight: 150 }}>
          {units
            ? <NumField id="num-custom" label={title} value={cv} decimals={tenths} onChange={setCv} units={units.map((x) => x.name)} unit={u} onUnit={switchUnit} />
            : <NumField id="num-custom" label={title} value={cv} decimals={tenths} onChange={setCv} suffix={u} />}
        </div>
      ) : (
        <div style={{ position: "relative", marginTop: 12 }}>
          <WheelBand />
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: tenths ? "1.3fr 14px 0.8fr 1fr" : "1.6fr 1fr", alignItems: "center" }}>
            <Wheel big label={title} items={labels} index={w} onChange={(i) => setPos((x) => ({ ...x, w: i }))} />
            {tenths && <>
              <span aria-hidden className="num" style={{ fontSize: 26, fontWeight: 650, textAlign: "center" }}>.</span>
              <Wheel big label="Tenths" items={Array.from({ length: 10 }, (_, i) => String(i))} index={d} onChange={(i) => setPos((x) => ({ ...x, d: i }))} />
            </>}
            {units
              ? <Wheel big label="Unit" items={units.map((x) => x.name)} index={units.findIndex((x) => x.name === u)} onChange={(i) => switchUnit(units[i].name)} />
              : <span aria-hidden style={{ fontSize: 18, fontWeight: 600, paddingLeft: 8 }}>{u}</span>}
          </div>
        </div>
      )}
      {readout(v > 0 ? fmtN(v) + " " + u : null, tried && "Enter a number above 0")}
      <button data-cuelume-tap type="button" className="btn btn-blue" style={{ width: "100%", marginTop: 14 }} onClick={save}>{cta}</button>
    </Sheet>
  );
}

/* A time on wheels: h : min : s for longer efforts, or seconds . hundredths for sprints */
const R60 = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const TIME_COLS = {
  hms: [{ label: "Hours", items: Array.from({ length: 24 }, (_, i) => String(i)), sep: "h" }, { label: "Minutes", items: R60, sep: "min" }, { label: "Seconds", items: R60, sep: "s" }],
  sec: [{ label: "Seconds", items: Array.from({ length: 600 }, (_, i) => String(i)), sep: "." }, { label: "Hundredths", items: Array.from({ length: 100 }, (_, i) => String(i).padStart(2, "0")), sep: "s" }],
};
function TimeSheet({ title, cta, fmt, value, onSave, onClose }: { title: string; cta: string; fmt: "hms" | "sec"; value: number; onSave: (sec: number) => void; onClose: () => void }) {
  const cols = TIME_COLS[fmt];
  const split = (t: number) => fmt === "hms"
    ? [Math.min(23, Math.floor(t / 3600)), Math.floor((t % 3600) / 60), Math.round(t % 60) % 60]
    : [Math.min(599, Math.floor(t)), Math.round((t % 1) * 100) % 100];
  const [idx, setIdx] = useState(() => split(value > 0 ? value : fmt === "hms" ? 1800 : 60));
  const total = fmt === "hms" ? idx[0] * 3600 + idx[1] * 60 + idx[2] : idx[0] + idx[1] / 100;
  const [tried, setTried] = useState(false);
  const save = () => { if (!(total > 0)) return setTried(true); onSave(Math.round(total * 100) / 100); onClose(); };
  return (
    <Sheet id="time" title={title} sub={fmt === "hms" ? "Scroll hours, minutes and seconds." : "Scroll seconds and hundredths."} onClose={onClose}>
      <div style={{ position: "relative", marginTop: 16 }}>
        <WheelBand />
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: cols.map(() => "1fr 34px").join(" "), alignItems: "center" }}>
          {cols.map((c, k) => (<Fragment key={c.label}>
            <Wheel big label={c.label} items={c.items} index={idx[k]} onChange={(i) => setIdx((x) => x.map((y, j) => (j === k ? i : y)))} />
            <span aria-hidden style={{ fontSize: 15, fontWeight: 600, color: "var(--gray)" }}>{c.sep}</span>
          </Fragment>))}
        </div>
      </div>
      {readout(total > 0 ? fmtTime(total) : null, tried && "Pick a time above 0")}
      <button data-cuelume-tap type="button" className="btn btn-blue" style={{ width: "100%", marginTop: 14 }} onClick={save}>{cta}</button>
    </Sheet>
  );
}

/* A field that shows its value and opens a bottom sheet to change it: the one input pattern for goal numbers */
function SheetField({ label, optional, Icon, value, unit, empty, onOpen, onClear, error, help }: {
  label: string; optional?: boolean; Icon: typeof Target | SportIconType; value: string | null; unit?: string; empty: string;
  onOpen: () => void; onClear?: () => void; error?: string; help?: string;
}) {
  return (
    <div>
      <span className="flabel">{label}{optional && <span className="opt">Optional</span>}</span>
      <button data-cuelume-open type="button" className="nf" onClick={onOpen} aria-invalid={!!error} data-invalid={error ? "true" : undefined}
        aria-label={value ? `${label}, ${value}${unit ? " " + unit : ""}. Change` : `${label}. ${empty}`} style={{ width: "100%", padding: "0 14px", gap: 10, cursor: "pointer", height: 60 }}>
        <SportIcon Icon={Icon} size={24} neutral />
        {value
          ? <span className="num" style={{ flex: 1, textAlign: "left", fontSize: 24, fontWeight: 650, letterSpacing: 0 }}>{value}{unit && <> <span style={{ fontSize: 15, fontWeight: 600, color: "var(--blue)" }}>{unit}</span></>}</span>
          : <span style={{ flex: 1, textAlign: "left", fontSize: 16, color: "var(--gray)" }}>{empty}</span>}
        <span className="cap">{value ? "Change" : "Add"}</span>
        <CaretRight size={16} color="var(--gray)" aria-hidden />
      </button>
      {error ? fieldErr(error) : (help || (value && onClear)) ? (
        <p className="cap" style={{ marginTop: 6 }}>{help}{value && onClear && <>{help ? " " : ""}<button data-cuelume-tap type="button" className="link" style={{ fontSize: 13 }} onClick={onClear}>Clear</button></>}</p>
      ) : null}
    </div>
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
          <button data-cuelume-navigate type="button" className="icon-btn" aria-label="Previous month" onClick={() => shift(-1)} disabled={!canPrev} style={{ opacity: canPrev ? 1 : 0.35 }}><CaretLeft size={18} weight="bold" /></button>
          <span aria-live="polite" style={{ fontSize: 16, fontWeight: 600 }}>{month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</span>
          <button data-cuelume-navigate type="button" className="icon-btn" aria-label="Next month" onClick={() => shift(1)}><CaretRight size={18} weight="bold" /></button>
        </div>
        <div role="grid" aria-label="Calendar" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 4, marginTop: 12, textAlign: "center" }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} className="cap" style={{ fontSize: 12, fontWeight: 600, paddingBottom: 6 }}>{d}</span>)}
          {cells.map((d, i) => {
            if (!d) return <span key={`e${i}`} />;
            const off = d < first, on = sameDay(d, sel), today = sameDay(d, TODAY);
            return (
              <button data-cuelume-select key={i} type="button" disabled={off} aria-pressed={on} aria-label={fmtDate(d)} onClick={() => setSel(d)}
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
          <button data-cuelume-close type="button" className="btn btn-soft" onClick={onClose}>Cancel</button>
          <button data-cuelume-tap type="button" className="btn btn-blue" onClick={() => { onSave(sel); onClose(); }}>Set deadline</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export type Profile = { name: string; activity: string; goal: Goal; target: number; current: number; unit: string; due: string; daysLeft: number; motto: string };

const TODAY = new Date(2026, 9, 21); // prototype "today": Wed 21 Oct 2026
const DAY = 86400000;
const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const addDays = (n: number) => new Date(TODAY.getTime() + n * DAY);
const daysUntil = (d: Date) => Math.max(1, Math.round((d.getTime() - TODAY.getTime()) / DAY));
const meters = (d: number, u?: string) => (u === "km" ? d * 1000 : u === "mi" ? d * 1609.344 : d);
// sprints read best as 52.35 s, longer efforts as 20:30
const autoFmt = (d: number, u?: string): TimeFmt => (meters(d, u) <= 400 ? "sec" : "hms");

/* The verb people use for the sport, so the goal reads "Run 100 km", "Ride 40 km in 1:30:00" */
function verbOf(a: Activity) {
  if (["run", "hillrun", "trail", "vrun"].includes(a.id)) return "Run";
  if (a.id === "walk") return "Walk";
  if (a.id === "hike" || a.id === "trek") return "Hike";
  if (a.id === "wheelchair") return "Push";
  if (a.group === "Cycling") return "Ride";
  if (a.id === "swim") return "Swim";
  if (a.id === "row" || a.id === "vrow") return "Row";
  if (["kayak", "canoe", "paddle"].includes(a.id)) return "Paddle";
  if (a.group === "Snow" && a.id !== "iceskate" && a.id !== "snowshoe") return "Ski";
  return undefined;
}

/* A sensible starting goal for each activity and metric, so the details step opens with real numbers to adjust */
function defaultGoal(a: Activity, metric: Metric): Goal {
  const id = a.id, g = a.group;
  switch (metric) {
    case "distance": {
      const km = id === "run" || id === "trail" ? 500 : id === "walk" ? 300 : id === "swim" ? 50 : id === "tri" ? 100 : g === "Cycling" ? 1000 : 200;
      return { metric, target: km, current: 0, unit: "km" };
    }
    case "duration": return { metric, target: 50, current: 0, unit: "h" };
    case "sessions": return { metric, target: 100, current: 0, unit: a.noun };
    case "performance":
      if (g === "Cycling") return { metric, target: 5400, current: 0, unit: "s", perfDist: 40, perfUnit: "km", timeFmt: "hms" };
      if (id === "swim") return { metric, target: 210, current: 0, unit: "s", perfDist: 200, perfUnit: "m", timeFmt: "hms" };
      if (id === "row" || id === "vrow") return { metric, target: 480, current: 0, unit: "s", perfDist: 2000, perfUnit: "m", timeFmt: "hms" };
      return { metric, target: 1800, current: 0, unit: "s", perfDist: 5, perfUnit: "km", timeFmt: "hms" };
    case "reps": return { metric, target: 10, current: 0, unit: "reps", ref: { kind: "dist", value: 400, unit: "m" } };
    case "laps": return { metric, target: 25, current: 0, unit: "laps", ref: { kind: "dist", value: 400, unit: "m" } };
    case "steps": return { metric, target: id === "walk" ? 1000000 : g === "Fitness" ? 100000 : 500000, current: 0, unit: "steps" };
    case "count": return { metric, target: 10000, current: 0, unit: "skips" };
    case "weight": return { metric, target: 65, current: 72, unit: "kg" };
  }
}
/* Goal-card backdrop: a moody photo from the sport's world (Unsplash), graded vintage in CSS */
const goalPhoto = (id: string) => {
  const { group } = byId(id);
  if (group === "Cycling" || ["skate", "rollerski", "skateboard"].includes(id)) return { src: "/img/goal-ride.jpg", pos: "40% 70%" };
  if (group === "Water") return { src: "/img/goal-swim.jpg", pos: "50% 50%" };
  if (group === "Snow" || ["hike", "trek", "hillrun", "climb", "yoga", "pilates", "mobility", "meditation"].includes(id)) return { src: "/img/goal-trail.jpg", pos: "70% 60%" };
  if (group === "Fitness" || group === "Racket" || group === "Team") return { src: "/img/goal-gym.jpg", pos: "50% 50%" };
  // motion-blurred stride, supplied by the client
  return { src: "/img/goal-run.webp", pos: "50% 45%" };
};
// the spec's V1 flow: activity, goal metric, goal details (with the target date), review
const QUESTIONS = 4;
const timeframes = [
  { label: "3 months", days: 90 },
  { label: "6 months", days: 180 },
  { label: "End of year", days: daysUntil(new Date(2026, 11, 31)) },
  { label: "1 year", days: 365 },
];
/* The weekly picture of a goal, in the sport's own terms */
function planLine(a: Activity, g: Goal, days: number) {
  const weeks = Math.max(1, days / 7);
  const r1 = (n: number) => (n >= 10 ? Math.round(n) : Math.round(n * 10) / 10);
  if (g.metric === "performance") return `${Math.round(weeks)} weeks to train for it.`;
  if (g.metric === "weight") return `About ${fmtN(r1(Math.abs(g.current - g.target) / weeks))} ${g.unit} a week.`;
  const perWeek = Math.max(0, g.target - g.current) / weeks;
  if (!(perWeek > 0)) return "";
  if (g.metric === "distance") { const n = perWeek > 12 ? 3 : 2; return `About ${n} ${a.noun} a week of ${fmtN(r1(perWeek / n))} ${g.unit}.`; }
  if (g.metric === "duration") return `About ${fmtHours(Math.max(0.25, Math.round(perWeek * 4) / 4))} a week.`;
  if (perWeek < 1) return `About one every ${Math.max(2, Math.round(1 / perWeek))} weeks.`;
  return `About ${fmtN(Math.round(perWeek))} ${g.unit} a week.`;
}
// sub-label under each metric tile
// one line on what each metric measures, in this activity's words
const tileAbout = (m: Metric, a: Activity) => ({
  distance: "The total distance you cover", duration: "The total time you spend active", sessions: `How many ${a.noun} you complete`, performance: "Beat a target time over a set distance",
  reps: "Repeated efforts, like 10 hill climbs", laps: "Circuits of a track or loop", steps: "The total steps you take", count: "The total skips you do", weight: "A target body weight to reach",
})[m];
const groups: ("All" | Group)[] = ["All", ...groupOrder];
const signed = (s: number) => (Math.abs(s) < 60 ? `${Math.abs(s).toFixed(2).replace(/\.00$/, "")} s` : fmtTime(Math.round(Math.abs(s) * 100) / 100));

export default function Onboarding({ go, onDone, name = "", initialStep = 0 }: { go: (r: Route) => void; onDone: (p: Profile) => void; name?: string; initialStep?: number }) {
  const [step, setStep] = useState(initialStep);
  const first = name.trim(); // from Signup; Google sign-up has none, so copy falls back to neutral
  const [dir, setDir] = useState(1);
  const [activity, setActivity] = useState("run");
  const [goal, setGoal] = useState<Goal>(() => defaultGoal(byId("run"), "distance"));
  const [days, setDays] = useState(timeframes[2].days);
  const [custom, setCustom] = useState("");
  const [motto, setMotto] = useState("");
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const search = (v: string) => { setQ(v); searchRef.current?.focus(); };
  const [group, setGroup] = useState<(typeof groups)[number]>("All");
  const [closed, setClosed] = useState<Group[]>([]);
  const [stuck, setStuck] = useState(false);
  // goal-detail helpers: duration entry unit, reps/laps reference tab and remembered distance, saved places, performance format choice
  const [refTab, setRefTab] = useState<"dist" | "place">("dist");
  const [refDist, setRefDist] = useState<{ value: number; unit: DistUnit }>({ value: 400, unit: "m" });
  const [places, setPlaces] = useState<Place[]>(savedPlaces);
  // location permission for the place search: asked the first time the Location tab opens
  const [loc, setLoc] = useState<LocState>("unknown");
  const [askingLoc, setAskingLoc] = useState(false);
  const allowLoc = () => { setAskingLoc(false); setLoc("locating"); setTimeout(() => setLoc("on"), 1400); };
  const [fmtPicked, setFmtPicked] = useState(false);
  const [tried, setTried] = useState(false);
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
  const m = goal.metric;
  const M = METRICS[m];
  const verb = verbOf(act);
  const due = addDays(days);
  const actLower = act.name.toLowerCase();
  const set = (p: Partial<Goal>) => setGoal((g) => ({ ...g, ...p }));
  const place = goal.ref?.kind === "place" ? places.find((p) => p.id === (goal.ref as { id: string }).id) : undefined;

  const list = useMemo(() => activities.filter((a) => (group === "All" || a.group === group) && matches(a, q)), [q, group]);
  const sections = groupOrder.map((g) => ({ g, items: list.filter((a) => a.group === g) })).filter((s) => s.items.length);

  const reset = (a: Activity, metric: Metric) => {
    setGoal(defaultGoal(a, metric)); setRefTab("dist"); setRefDist({ value: 400, unit: "m" }); setFmtPicked(false); setTried(false);
  };
  const pick = (id: string) => { if (id !== activity) { setActivity(id); reset(byId(id), byId(id).metrics[0]); } };
  const pickMetric = (x: Metric) => { if (x !== m) reset(act, x); };
  const setPerfDist = (d: number, u: DistUnit) => set({ perfDist: d, perfUnit: u, ...(!fmtPicked && d > 0 && { timeFmt: autoFmt(d, u) }) });

  // what still needs fixing before the review
  const problems: Partial<Record<"target" | "current" | "dist" | "time" | "best", string>> = {};
  if (m === "performance") {
    if (!((goal.perfDist ?? 0) > 0)) problems.dist = "Enter the distance";
    if (goal.target < 0) problems.time = "Check the time";
    else if (!(goal.target > 0)) problems.time = "Enter your target time";
    if ((goal.best ?? 0) < 0) problems.best = "Check the time";
  } else if (m === "weight") {
    if (!(goal.target > 0)) problems.target = "Enter your target weight";
    if (!(goal.current > 0)) problems.current = "Enter your current weight";
    else if (goal.target === goal.current) problems.target = "Pick a weight different from today's";
  } else if (!(goal.target > 0)) problems.target = m === "duration" ? "Enter a time above 0" : "Enter a number above 0";
  else if (goal.current >= goal.target) problems.current = "This already reaches your target. Raise the target or lower this.";
  const shown = (k: keyof typeof problems) => (tried ? problems[k] : undefined);

  const move = (d: number) => {
    if (step + d < 0) return go("signup");
    if (d > 0 && step === 2 && Object.keys(problems).length) { setTried(true); play("error", { emphasis: "subtle" }); return; }
    if (step + d >= QUESTIONS) {
      play("success");
      return onDone({ name: first, activity, goal, target: goal.target, current: goal.current, unit: m === "duration" ? "h" : goal.unit, due: fmtDate(due), daysLeft: days, motto: motto.trim() });
    }
    setDir(d); setStep(step + d); setStuck(false);
  };
  const jump = (to: number) => { setDir(to < step ? -1 : 1); setStep(to); setStuck(false); };
  const cta = [`Continue with ${act.name}`, `Continue with ${M.label.toLowerCase()}`, "Review my goal", "Create goal"][step];

  // the card itself goes out as a 1080×1920 PNG: native share sheet where files are supported, otherwise a download
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState<"idle" | "busy" | "saved">("idle");
  const [saving, setSaving] = useState<"idle" | "busy" | "saved">("idle");
  const sentence = goalSentence(goal, verb);
  const renderCard = async () => {
    const node = cardRef.current;
    if (!node) return null;
    await document.fonts.ready;
    const blob = await toBlob(node, { pixelRatio: 1, canvasWidth: 1080, canvasHeight: 1920, cacheBust: true, style: { margin: "0", transform: "none", boxShadow: "none", borderRadius: "0" } });
    if (!blob) throw new Error("render failed");
    return new File([blob], `ennoo-${act.id}-goal.png`, { type: "image/png" });
  };
  const saveFile = (file: File) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file); a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  // share sheet where the device supports sharing files; otherwise it falls back to saving the image
  const share = async () => {
    if (sharing === "busy") return;
    setSharing("busy");
    try {
      const file = await renderCard();
      if (!file) return setSharing("idle");
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Ennoo goal", text: `My Ennoo goal: ${sentence} by ${fmtDate(due)}.` });
        setSharing("idle");
      } else {
        saveFile(file); play("success", { emphasis: "subtle" }); setSharing("saved"); setTimeout(() => setSharing("idle"), 2200);
      }
    } catch { setSharing("idle"); /* share sheet dismissed */ }
  };
  // always saves the 1080×1920 PNG to the device
  const download = async () => {
    if (saving === "busy") return;
    setSaving("busy");
    try {
      const file = await renderCard();
      if (!file) return setSaving("idle");
      saveFile(file); play("success", { emphasis: "subtle" }); setSaving("saved"); setTimeout(() => setSaving("idle"), 2200);
    } catch { setSaving("idle"); }
  };
  const [pickingDate, setPickingDate] = useState(false);
  const [pickingDist, setPickingDist] = useState(false);
  const [pickingDone, setPickingDone] = useState(false);
  // which goal number has its sheet open
  const [picking, setPicking] = useState<null | "dur" | "dur-done" | "count" | "count-done" | "ref" | "pdist" | "ptime" | "pbest" | "wt" | "wt-now">(null);
  // their own photo for the story card; kept as an object URL, released when replaced or on unmount
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);
  const pickPhoto = (f?: File) => { if (f && f.type.startsWith("image/")) setPhoto(URL.createObjectURL(f)); };

  // labels along the card's route: today, three quarter stops, the finish
  const parts = goalParts(goal);
  const routeVals = [0, 1, 2, 3, 4].map((i) =>
    m === "performance" ? (i === 4 ? fmtTime(goal.target) : i === 0 && goal.best ? `best ${fmtTime(goal.best)}` : "")
      : m === "weight" ? `${fmtN(Math.round((goal.current + ((goal.target - goal.current) * i) / 4) * 10) / 10)} ${goal.unit}`
      : amount(goal, m === "duration" ? Math.round((goal.target * i) / 4 * 2) / 2 : Math.round((goal.target * i) / 4)));
  const targetText = m === "performance" ? `${fmtN(goal.perfDist ?? 0)} ${goal.perfUnit} in ${fmtTime(goal.target)}` : m === "duration" ? fmtHours(goal.target) : `${fmtN(goal.target)} ${goal.unit}`;
  const note = {
    distance: `All your recorded ${actLower} distance is added to this goal.`,
    duration: `All your recorded ${actLower} time is added to this goal.`,
    sessions: `Each completed ${actLower} you log counts as one session.`,
    reps: `The ${refTab === "place" ? "location" : "distance"} is only a reference. Reps are counted from your ${actLower} entries that match it.`,
    laps: `The ${refTab === "place" ? "track" : "lap distance"} is only a reference. Laps are counted from your ${actLower} entries that match it.`,
    performance: `Progress is based on your best recorded time at ${fmtN(goal.perfDist ?? 0)} ${goal.perfUnit ?? ""}.`,
    steps: `Only steps you record for ${actLower} count toward this goal.`,
    count: "Every skip you log is added to this goal.",
    weight: "We track your latest weigh-in, not a total.",
  }[m];
  const gap = m === "performance" && (goal.best ?? 0) > 0 && goal.target > 0 ? (goal.best ?? 0) - goal.target : null;

  return (
    <div className="body" style={{ background: "var(--white)", overflow: "hidden", display: "flex", flexDirection: "column", isolation: "isolate" }}>
      {/* soft blue/cyan mesh bleeding in from the top-right corner, fading diagonally to white */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none",
        background: "radial-gradient(60% 26% at 100% 0%, rgba(47,212,236,0.45) 0%, rgba(47,212,236,0) 100%), radial-gradient(70% 27% at 78% 0%, rgba(0,84,251,0.24) 0%, rgba(0,84,251,0) 100%), radial-gradient(50% 22% at 104% 10%, rgba(31,107,255,0.22) 0%, rgba(31,107,255,0) 100%), radial-gradient(50% 20% at 52% -4%, rgba(56,232,255,0.2) 0%, rgba(56,232,255,0) 100%)",
        filter: "blur(18px)" }} />
      <StatusBar />
      <header className="pad top" style={{ display: "grid", gridTemplateColumns: "44px 1fr 44px", alignItems: "center", gap: 16, flex: "none" }}>
        <button data-cuelume-navigate className="icon-btn" aria-label="Back" onClick={() => move(-1)}><ArrowLeft size={20} /></button>
        <div role="progressbar" aria-valuemin={1} aria-valuemax={QUESTIONS} aria-valuenow={step + 1} aria-label={`Step ${step + 1} of ${QUESTIONS}`} style={{ display: "grid", gridTemplateColumns: `repeat(${QUESTIONS},1fr)`, gap: 5, width: 132, justifySelf: "center" }}>
          {Array.from({ length: QUESTIONS }, (_, i) => (
            <span key={i} style={{ height: 4, borderRadius: 2, background: "#fff", boxShadow: "inset 0 0 0 1px rgba(11,18,32,0.08)", overflow: "hidden" }}>
              <motion.span style={{ display: "block", height: "100%", background: "var(--blue)", transformOrigin: "left" }} animate={{ scaleX: i <= step ? 1 : 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
            </span>
          ))}
        </div>
        <span className="cap num" style={{ textAlign: "right", letterSpacing: 0, color: "var(--ink)", fontWeight: 560 }}>{step + 1}/{QUESTIONS}</span>
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
                <p className="meta" style={{ fontSize: 15, lineHeight: 1.5 }}>Pick your main activity. We'll shape your goal and stats around it, and you can still log all {activities.length}.</p>
                <div style={{ ...band(stuck), top: titleH - 24, zIndex: 2, margin: "0 -20px", padding: "20px 20px 12px", boxShadow: stuck ? "0 1px 0 var(--line)" : "none" }}>
                <div style={{ position: "relative" }}>
                  <MagnifyingGlass size={18} color="var(--gray)" style={{ position: "absolute", left: 16, top: 18 }} />
                  <input data-cuelume-type ref={searchRef} type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape" && q) { e.preventDefault(); setQ(""); } }}
                    placeholder={`Search all ${activities.length} activities`} aria-label="Search activities" style={{ paddingLeft: 44, paddingRight: q ? 48 : 16, background: "var(--bg)", borderColor: "transparent" }} />
                  <AnimatePresence>
                    {q && (
                      <motion.button data-cuelume-close key="clear" type="button" aria-label="Clear search" onClick={() => search("")}
                        initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.15 }}
                        style={{ position: "absolute", right: 3, top: 3, width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 12 }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--gray)", color: "#fff", display: "grid", placeItems: "center" }}><X size={12} weight="bold" /></span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", margin: "14px -20px 0", padding: "0 20px", scrollbarWidth: "none" }}>
                  {groups.map((g) => (
                    <button data-cuelume-select key={g} className="chip" aria-pressed={group === g} onClick={() => setGroup(g)}>
                      {g === "All" ? "All" : groupInfo[g].label}<span style={{ opacity: 0.6 }} className="num">{g === "All" ? activities.length : activities.filter((a) => a.group === g).length}</span>
                    </button>
                  ))}
                </div>
                </div>
                {sections.length ? sections.map(({ g, items }, si) => {
                  const info = groupInfo[g], open = !!q || !closed.includes(g);
                  return (
                    <section key={g} style={{ marginTop: si ? 26 : 12 }}>
                      {/* category header: icon tile, name and what it covers, count, collapse */}
                      <button data-cuelume-toggle type="button" aria-expanded={open} onClick={() => setClosed((c) => (c.includes(g) ? c.filter((x) => x !== g) : [...c, g]))}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "2px 0 12px" }}>
                        <span aria-hidden style={{ width: 46, height: 46, borderRadius: 14, background: "var(--blue-50)", display: "grid", placeItems: "center", flex: "none" }}><SportIcon Icon={info.Icon} size={26} /></span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                            <span style={{ fontSize: 17, fontWeight: 650, color: "var(--ink)" }}>{info.label}</span>
                            <span className="cap num" style={{ whiteSpace: "nowrap", letterSpacing: 0 }}>{items.length} {items.length === 1 ? "activity" : "activities"}</span>
                          </span>
                          <span className="cap" style={{ display: "block", marginTop: 2, lineHeight: 1.35 }}>{info.about}</span>
                        </span>
                        <CaretDown size={16} color="var(--gray)" aria-hidden style={{ flex: "none", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                      </button>
                      {open && (
                        <div role="radiogroup" aria-label={info.label} style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                          {items.map(({ id, name, Icon }) => {
                            const on = id === activity;
                            return (
                              <button data-cuelume-select key={id} role="radio" aria-checked={on} onClick={() => pick(id)}
                                style={{ position: "relative", minHeight: 104, borderRadius: 20, display: "grid", placeItems: "center", alignContent: "center", gap: 10, fontSize: 13, fontWeight: on ? 600 : 500, padding: "12px 6px", textAlign: "center", lineHeight: 1.25,
                                  background: on ? "var(--blue-50)" : "var(--white)", color: on ? "var(--blue)" : "var(--ink)", border: `1.5px solid ${on ? "var(--blue)" : "var(--line)"}`, transition: "all .2s" }}>
                                <SportIcon Icon={Icon} size={34} selected={on} />
                                {name}
                                {on && <span style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: "50%", background: "var(--blue)", color: "#fff", display: "grid", placeItems: "center" }}><Check size={11} weight="bold" /></span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  );
                }) : <EmptySearch q={q} onPick={search} />}
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="title">What will you track for your {actLower} goal?</h1>
                <p className="meta" style={{ fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>Choose one metric. Only the ones that suit {actLower} are shown, and you can change this later.</p>
                {/* the chosen activity, for reference only (Back changes it) */}
                <div className="card" style={{ marginTop: 18, padding: "12px 14px", display: "flex", alignItems: "center", gap: 14 }}>
                  <span aria-hidden style={{ width: 48, height: 48, borderRadius: 14, background: "var(--blue-50)", display: "grid", placeItems: "center", flex: "none" }}><SportIcon Icon={act.Icon} size={28} /></span>
                  <span style={{ flex: 1 }}><span className="cap" style={{ display: "block" }}>Selected activity</span><span style={{ display: "block", fontSize: 16, fontWeight: 650 }}>{act.name}</span></span>
                </div>

                <h2 className="h2" style={{ marginTop: 24 }}>Goal metric</h2>
                <p className="cap" style={{ fontSize: 13, marginTop: 2 }}>Pick one metric for your goal.</p>
                <div role="radiogroup" aria-label="Goal metric" style={{ display: "grid", gap: 8, marginTop: 12 }}>
                  {act.metrics.map((x) => {
                    const info = METRICS[x], on = m === x;
                    return (
                      <button data-cuelume-select key={x} type="button" role="radio" aria-checked={on} className="mtile" onClick={() => pickMetric(x)}>
                        <span className="mtile-ic" aria-hidden><SportIcon Icon={info.Icon} size={24} selected={on} neutral /></span>
                        <span className="mtile-tx"><b>{info.label}</b><small>{tileAbout(x, act)}</small></span>
                        <span className="radio" aria-hidden>{on && <Check size={12} weight="bold" />}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="title">Set your {M.label.toLowerCase()} goal</h1>
                {/* the goal as a sentence, updating as they type */}
                <p aria-live="polite" style={{ fontSize: 16, marginTop: 8, lineHeight: 1.4, color: "var(--blue)", fontWeight: 600 }}>{sentence} by {fmtDate(due)}</p>

                <div style={{ marginTop: 22, display: "grid", gap: 20 }}>
                  {m === "distance" && <SheetField label="Target distance" Icon={RouteIcon} value={goal.target > 0 ? fmtN(goal.target) : null} unit={goal.unit} empty="Set a distance" onOpen={() => setPickingDist(true)} error={shown("target")} />}
                  {m === "duration" && <SheetField label="Target total time" Icon={Timer} value={goal.target > 0 ? fmtHours(goal.target) : null} empty="Set a total time" onOpen={() => setPicking("dur")} error={shown("target")} />}
                  {(m === "sessions" || m === "steps" || m === "count") && (
                    <SheetField label={m === "sessions" ? `Target number of ${act.noun}` : m === "steps" ? "Target steps" : "Target skips"} Icon={M.Icon} value={goal.target > 0 ? fmtN(goal.target) : null} unit={goal.unit} empty="Set a number" onOpen={() => setPicking("count")} error={shown("target")} />
                  )}
                  {(m === "reps" || m === "laps") && (<>
                    <div>
                      <span className="flabel">Reference<span className="opt">Optional</span></span>
                      <Seg label="Reference" options={[["dist", "Distance"], ["place", m === "laps" ? "Saved track" : "Location"]]} value={refTab}
                        onChange={(t) => { setRefTab(t); if (t === "place" && loc === "unknown") setAskingLoc(true); set({ ref: t === "dist" && refDist.value > 0 ? { kind: "dist", ...refDist } : { kind: "none" } }); }} />
                    </div>
                    {refTab === "dist" ? (
                      <SheetField label={m === "reps" ? "Distance per rep" : "Lap distance"} optional Icon={Ruler} value={refDist.value > 0 ? fmtN(refDist.value) : null} unit={refDist.unit} empty="Add a distance"
                        onOpen={() => setPicking("ref")} onClear={() => { setRefDist({ ...refDist, value: 0 }); set({ ref: { kind: "none" } }); }} />
                    ) : (
                      <PlacePicker noun={m === "reps" ? "rep" : "lap"} places={places} selected={place?.id} loc={loc} onAskLoc={() => setAskingLoc(true)}
                        onSelect={(p) => set({ ref: p ? { kind: "place", id: p.id, name: p.name } : { kind: "none" } })} onAdd={(p) => setPlaces((ps) => [...ps, p])} />
                    )}
                    <SheetField label={m === "reps" ? "Target repetitions" : "Target laps"} Icon={M.Icon} value={goal.target > 0 ? fmtN(goal.target) : null} unit={goal.unit} empty="Set a number" onOpen={() => setPicking("count")} error={shown("target")} />
                  </>)}
                  {m === "performance" && (<>
                    <SheetField label="Distance" Icon={RouteIcon} value={(goal.perfDist ?? 0) > 0 ? fmtN(goal.perfDist ?? 0) : null} unit={goal.perfUnit} empty="Set a distance" onOpen={() => setPicking("pdist")} error={shown("dist")} />
                    <div>
                      <Seg label="Time format" options={[["hms", "H : M : S"], ["sec", "Seconds (s.ss)"]]} value={goal.timeFmt ?? "hms"} onChange={(f) => { setFmtPicked(true); set({ timeFmt: f }); }} />
                      <p className="cap" style={{ marginTop: 6, lineHeight: 1.4 }}>Seconds suit short sprints (100 m, 400 m). H : M : S suits longer efforts (5 km, a marathon).</p>
                    </div>
                    <SheetField label="Target time" Icon={Timer} value={goal.target > 0 ? fmtTime(goal.target) : null} empty="Set a time" onOpen={() => setPicking("ptime")} error={shown("time")} />
                    <SheetField label="Current best" optional Icon={Trophy} value={(goal.best ?? 0) > 0 ? fmtTime(goal.best ?? 0) : null} empty="Add your best" onOpen={() => setPicking("pbest")} onClear={() => set({ best: 0 })} error={shown("best")} />
                    {gap !== null && (
                      <div aria-live="polite" style={{ borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden", fontSize: 14 }}>
                        {[["Target time", fmtTime(goal.target)], ["Current best", fmtTime(goal.best ?? 0)]].map(([l, v]) => (
                          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--line)" }}><span className="meta" style={{ fontSize: 14 }}>{l}</span><strong className="num" style={{ letterSpacing: 0 }}>{v}</strong></div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: gap > 0 ? "#ECFDF3" : "#FFFAEB", color: gap > 0 ? "#067647" : "#B54708", fontWeight: 600 }}>
                          <span>{gap > 0 ? "Improvement needed" : "Your best already beats this"}</span><span className="num" style={{ letterSpacing: 0 }}>{gap > 0 ? `−${signed(gap)}` : `${signed(gap)} under`}</span>
                        </div>
                      </div>
                    )}
                  </>)}
                  {m === "weight" && (<>
                    <SheetField label="Target weight" Icon={Scales} value={goal.target > 0 ? fmtN(goal.target) : null} unit={goal.unit} empty="Set a weight" onOpen={() => setPicking("wt")} error={shown("target")} />
                    <SheetField label="Current weight" Icon={Scales} value={goal.current > 0 ? fmtN(goal.current) : null} unit={goal.unit} empty="Add your weight" onOpen={() => setPicking("wt-now")} error={shown("current")} />
                  </>)}

                  {/* progress made before Ennoo: counts toward cumulative goals (weight and performance ask for today's figure instead) */}
                  {m !== "weight" && m !== "performance" && (
                    <SheetField label="Already done" optional Icon={CheckCircle} error={shown("current")}
                      empty={m === "distance" ? "Add distance" : m === "duration" ? "Add time" : "Add a number"}
                      value={goal.current > 0 ? (m === "duration" ? fmtHours(goal.current) : fmtN(goal.current)) : null} unit={m === "duration" ? undefined : goal.unit}
                      onOpen={() => (m === "distance" ? setPickingDone(true) : setPicking(m === "duration" ? "dur-done" : "count-done"))}
                      onClear={() => set({ current: 0 })}
                      help={goal.current > 0
                        ? goal.target > goal.current ? (m === "duration" ? fmtHours(goal.target - goal.current) : `${fmtN(Math.round((goal.target - goal.current) * 10) / 10)} ${goal.unit}`) + " to go." : undefined
                        : "Progress you made before Ennoo, so it counts toward this goal."} />
                  )}

                  {/* the target date: a field that opens the calendar, with quick picks underneath */}
                  <div>
                    <span className="flabel">Target date</span>
                    <button data-cuelume-open type="button" className="nf" onClick={() => setPickingDate(true)} aria-label={`Target date, ${fmtDate(due)}. Change`} style={{ width: "100%", padding: "0 14px", gap: 10, cursor: "pointer" }}>
                      <CalendarBlank size={20} color="var(--ink)" weight="duotone" aria-hidden />
                      <span className="num" style={{ flex: 1, textAlign: "left", fontSize: 16, fontWeight: 600, letterSpacing: 0 }}>{fmtDate(due)}</span>
                      <span className="cap num" style={{ letterSpacing: 0 }}>{days} days</span>
                      <CaretRight size={16} color="var(--gray)" aria-hidden />
                    </button>
                    <div style={{ display: "flex", gap: 6, overflowX: "auto", margin: "10px -20px 0", padding: "0 20px", scrollbarWidth: "none" }}>
                      {timeframes.map((t) => (
                        <button data-cuelume-select key={t.label} type="button" className="chip" aria-pressed={days === t.days && !custom} onClick={() => { setDays(t.days); setCustom(""); }} style={{ height: 34, fontSize: 13, flex: "none" }}>{t.label}</button>
                      ))}
                    </div>
                    {planLine(act, goal, days) && <p className="cap" style={{ marginTop: 8 }}>{planLine(act, goal, days)}</p>}
                  </div>
                </div>
                <div style={{ marginTop: 14 }}><Note>{note}</Note></div>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="title">Review your goal{first ? `, ${first}` : ""}</h1>
                <p className="meta" style={{ fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>Check the details, then create it.</p>
                {/* summary: the goal as a sentence, then every choice as a row */}
                <div className="card" style={{ marginTop: 18, overflow: "hidden", borderRadius: 24 }}>
                  {/* photo hero: the chosen place, or the sport's world, graded into brand blue */}
                  <div style={{ position: "relative", minHeight: 214, padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#fff", isolation: "isolate" }}>
                    <img src={place?.img ?? goalPhoto(activity).src} alt="" aria-hidden
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: place?.img ? "50% 50%" : goalPhoto(activity).pos, zIndex: -2, filter: "saturate(1.1)" }} />
                    <span aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1, background: "linear-gradient(180deg, rgba(3,11,36,0.15) 0%, rgba(3,11,36,0.35) 40%, rgba(0,40,140,0.88) 100%)" }} />
                    <span style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px 5px 5px", borderRadius: 999, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", fontSize: 13, fontWeight: 600 }}>
                      <span aria-hidden style={{ width: 28, height: 28, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center" }}><SportIcon Icon={act.Icon} size={18} /></span>
                      {act.name} · {M.label} goal
                    </span>
                    <div>
                      <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.015em", textWrap: "balance", textShadow: "0 1px 12px rgba(0,0,0,0.25)" }}>{sentence}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginTop: 14, borderRadius: 14, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
                        {[["Target", targetText], ["By", fmtDate(due).replace(/ \d{4}$/, "")], ["Days", String(days)]].map(([l, v], i) => (
                          <span key={l} style={{ padding: "8px 10px", borderLeft: i ? "1px solid rgba(255,255,255,0.2)" : "none", minWidth: 0 }}>
                            <span style={{ display: "block", fontSize: 11, opacity: 0.75, fontWeight: 500 }}>{l}</span>
                            <span className="num" style={{ display: "block", fontSize: 14, fontWeight: 650, letterSpacing: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {([
                    // the hero already shows the metric and the target; performance targets are too long for its strip
                    ...(m === "performance" ? [[Target, "Target", targetText, ""]] : []),
                    ...(goal.ref?.kind === "dist" ? [[Ruler, "Reference", `${refText(goal.ref)} (per ${m === "reps" ? "rep" : "lap"})`, ""]] : []),
                    ...(place ? [[MapPin, "Location", place.name, placeLine(place)]] : []),
                    ...(m === "performance" ? [[Trophy, "Current best", goal.best ? fmtTime(goal.best) : "Not set", ""]] : []),
                    ...(m === "weight" ? [[Scales, "Current weight", `${fmtN(goal.current)} ${goal.unit}`, ""]] : []),
                    ...(m !== "weight" && m !== "performance" && goal.current > 0 ? [[Check, "Already done", `${fmtN(Math.round(goal.current * 10) / 10)} ${m === "duration" ? "h" : goal.unit}`, ""]] : []),
                    [CalendarBlank, "Target date", fmtDate(due), `${days} days from today`],
                  ] as [typeof Target | SportIconType, string, string, string][]).map(([Icon, l, v, s]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
                      <span aria-hidden style={{ width: 36, height: 36, borderRadius: 11, background: "var(--bg)", display: "grid", placeItems: "center", flex: "none" }}><Icon size={19} weight="duotone" className="duo-icon neu" /></span>
                      <span className="meta" style={{ flex: 1, fontSize: 14 }}>{l}</span>
                      <span style={{ textAlign: "right", minWidth: 0 }}>
                        <span className="num" style={{ display: "block", fontSize: 15, fontWeight: 600, letterSpacing: 0 }}>{v}</span>
                        {s && <span className="cap num" style={{ letterSpacing: 0 }}>{s}</span>}
                      </span>
                    </div>
                  ))}
                </div>

                {/* optional motto: it sits on the card below and on the home screen */}
                <div className="field" style={{ marginTop: 24 }}>
                  <label htmlFor="motto">Your motto <span className="cap">(optional)</span></label>
                  <input data-cuelume-type id="motto" className="input" value={motto} maxLength={60} onChange={(e) => setMotto(e.target.value)} placeholder="What keeps you going?" />
                  <span className="help num" style={{ textAlign: "right", letterSpacing: 0 }}>{motto.length}/60</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {mottos.map((x) => (
                    <button data-cuelume-toggle key={x} type="button" className="chip" aria-pressed={motto === x} onClick={() => setMotto(motto === x ? "" : x)} style={{ textAlign: "left", height: "auto", minHeight: 36, padding: "8px 14px", whiteSpace: "normal" }}>{x}</button>
                  ))}
                </div>

                <div className="sec" style={{ marginTop: 28 }}><h2 className="h2">Your goal card</h2></div>
                <p className="cap" style={{ fontSize: 13, marginTop: -4 }}>Share it to stay accountable.</p>
                {/* 9:16 so it drops straight into an Instagram story */}
                <motion.div ref={cardRef} initial={{ opacity: 0, y: 24, scale: 0.94, rotate: -2 }} animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.1 }}
                  style={{ margin: "14px auto 0", width: "min(100%, 300px)", aspectRatio: "9 / 16", borderRadius: 28, padding: "20px 20px 22px", color: "#fff", position: "relative", overflow: "hidden", isolation: "isolate",
                    display: "flex", flexDirection: "column", background: "#061026", boxShadow: "0 28px 50px -24px rgba(3,11,36,0.75)" }}>
                  {/* vintage, moody grade: faded film colour, navy wash, heavy vignette, grain */}
                  <img src={photo ?? goalPhoto(activity).src} alt="" aria-hidden
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: photo ? "50% 50%" : goalPhoto(activity).pos, zIndex: -1,
                      filter: "saturate(0.9) sepia(0.14) contrast(1.08) brightness(0.8)" }} />
                  <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1, background: "#0A1E5C", mixBlendMode: "multiply", opacity: 0.22 }} />
                  <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1,
                    background: "linear-gradient(180deg, rgba(4,8,20,0.7) 0%, rgba(4,8,20,0.2) 30%, rgba(4,8,20,0.35) 62%, rgba(4,8,20,0.9) 100%), radial-gradient(120% 90% at 50% 45%, transparent 45%, rgba(2,4,12,0.65) 100%)" }} />
                  <div aria-hidden className="grain" style={{ opacity: 0.35, zIndex: -1 }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <span style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.16)", display: "grid", placeItems: "center", flex: "none" }}><M.Icon size={16} weight="fill" /></span>
                      <span style={{ fontSize: 13, fontWeight: 560 }}>My {actLower} goal</span>
                    </span>
                    <Wordmark width={56} color="rgba(255,255,255,0.85)" />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: parts.value.length > 7 ? 40 : 52, lineHeight: 1, letterSpacing: "-0.04em", marginTop: 18 }}>
                    <span className="num">{parts.value}</span> <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", whiteSpace: "nowrap", ...(parts.unit.length > 8 && { display: "block", marginTop: 8 }) }}>{parts.unit}</span>
                  </p>
                  <p style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.35 }}>{sentence} by {fmtDate(due)}</p>
                  {/* the motto as a pull quote: a large hanging opening mark, Roboto italic, a soft closing mark */}
                  {motto.trim() && (
                    <blockquote style={{ position: "relative", margin: "20px 0 0", padding: "4px 0 0 22px" }}>
                      <span aria-hidden style={{ position: "absolute", left: -2, top: -10, fontWeight: 700, fontSize: 48, lineHeight: 1, color: "rgba(255,255,255,0.9)" }}>“</span>
                      <p style={{ fontStyle: "italic", fontWeight: 500, fontSize: 17, lineHeight: 1.3, color: "#fff", textWrap: "balance" }}>
                        {motto.trim().replace(/^["“”]+|["“”]+$/g, "")}<span aria-hidden style={{ display: "inline-block", fontSize: 32, lineHeight: 0, color: "rgba(255,255,255,0.9)", marginLeft: 3, transform: "translateY(0.32em)" }}>”</span>
                      </p>
                    </blockquote>
                  )}
                  <div style={{ flex: 1, minHeight: 0, margin: "14px 4px 8px" }}>
                    <GoalRoute days={days} vals={routeVals} started={false} Icon={act.Icon} />
                  </div>
                  {/* signed like a pledge, in a handwritten script */}
                  {first && (
                    <p style={{ textAlign: "right", fontSize: 13, color: "rgba(255,255,255,0.72)" }}>
                      by <span style={{ fontFamily: "var(--signature)", fontSize: 17, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.01em", color: "#fff", marginLeft: 6 }}>{first}</span>
                    </p>
                  )}
                </motion.div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 52px", gap: 8, marginTop: 14 }}>
                  <label className="btn btn-soft" style={{ position: "relative", gap: 8, fontWeight: 560, cursor: "pointer", padding: "0 12px", fontSize: 15, minWidth: 0 }}>
                    <ImageSquare size={18} weight="bold" />{photo ? "Change photo" : "Add photo"}
                    <input type="file" accept="image/*" aria-label="Upload your own photo for the goal card" onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ""; }}
                      style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                  </label>
                  <button data-cuelume-tap type="button" className="btn btn-soft" onClick={share} disabled={sharing === "busy"} aria-busy={sharing === "busy"} style={{ gap: 8, fontWeight: 560, padding: "0 12px", fontSize: 15, minWidth: 0 }} aria-live="polite">
                    {sharing === "busy" ? <span className="spinner" aria-hidden /> : <ShareFat size={18} weight="bold" />}
                    {sharing === "busy" ? "Preparing" : sharing === "saved" ? "Saved" : "Share"}
                  </button>
                  <button data-cuelume-tap type="button" className="btn btn-soft" onClick={download} disabled={saving === "busy"} aria-busy={saving === "busy"}
                    aria-label={saving === "saved" ? "Goal card downloaded" : "Download goal card"} title="Download image" style={{ padding: 0, width: 52 }}>
                    {saving === "busy" ? <span className="spinner" aria-hidden /> : saving === "saved" ? <Check size={18} weight="bold" color="#067647" /> : <DownloadSimple size={19} weight="bold" />}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ flex: "none", padding: "14px 20px 34px", background: "#fff", borderTop: "1px solid var(--line)", display: "grid", gap: 8 }}>
        {step === 2 && tried && Object.keys(problems).length > 0 && <p className="err" role="alert" style={{ textAlign: "center" }}>Fix the highlighted field{Object.keys(problems).length > 1 ? "s" : ""} to continue.</p>}
        {/* review: Edit on the left, Create on the right, in one row */}
        <div style={{ display: "grid", gridTemplateColumns: step === 3 ? "1fr 1.6fr" : "1fr", gap: 10 }}>
          {step === 3 && <button data-cuelume-navigate type="button" className="btn btn-soft" style={{ width: "100%" }} onClick={() => jump(2)}>Edit goal</button>}
          <button data-cuelume-tap className="btn btn-blue" style={{ width: "100%", gap: 8 }} onClick={() => move(1)}>{cta}{step === 3 ? <Check size={18} weight="bold" aria-hidden /> : <ArrowRight size={18} weight="bold" aria-hidden />}</button>
        </div>
      </div>

      <AnimatePresence>
        {(picking === "dur" || picking === "dur-done") && <DurationSheet title={picking === "dur" ? "Target total time" : "Already done"} cta={picking === "dur" ? "Set time" : "Save time"}
          value={picking === "dur" ? goal.target : goal.current > 0 ? goal.current : Math.round(goal.target / 4)}
          onSave={(h) => set(picking === "dur" ? { target: h } : { current: h })} onClose={() => setPicking(null)} />}
        {(picking === "count" || picking === "count-done") && (() => {
          const cfg = m === "steps" ? { step: 1000, max: 5000000, presets: [100000, 250000, 500000, 1000000] }
            : m === "count" ? { step: 100, max: 1000000, presets: [5000, 10000, 25000, 50000] }
            : m === "laps" ? { step: 1, max: 2000, presets: [10, 25, 50, 100] }
            : m === "reps" ? { step: 1, max: 500, presets: [5, 10, 20, 50] }
            : { step: 1, max: 1000, presets: [10, 25, 50, 100] };
          const t = picking === "count";
          const ttl = !t ? "Already done" : m === "sessions" ? `Number of ${act.noun}` : m === "reps" ? "Repetitions" : m === "laps" ? "Laps" : m === "steps" ? "Target steps" : "Target skips";
          return <NumberSheet title={ttl} cta={t ? "Set target" : "Save"} value={t ? goal.target : goal.current} unit={goal.unit} min={cfg.step} max={cfg.max} step={cfg.step} presets={cfg.presets}
            onSave={(v) => set(t ? { target: v } : { current: v })} onClose={() => setPicking(null)} />;
        })()}
        {picking === "ref" && <DistanceSheet title={m === "reps" ? "Distance per rep" : "Lap distance"} cta="Set distance" value={refDist.value > 0 ? refDist.value : 400} unit={refDist.unit}
          onSave={(v, u) => { setRefDist({ value: v, unit: u as DistUnit }); set({ ref: { kind: "dist", value: v, unit: u as DistUnit } }); }} onClose={() => setPicking(null)} />}
        {picking === "pdist" && <DistanceSheet title="Distance" cta="Set distance" value={goal.perfDist ?? 5} unit={goal.perfUnit ?? "km"}
          onSave={(v, u) => setPerfDist(v, u as DistUnit)} onClose={() => setPicking(null)} />}
        {(picking === "ptime" || picking === "pbest") && <TimeSheet title={picking === "ptime" ? "Target time" : "Current best"} cta={picking === "ptime" ? "Set time" : "Save best"}
          fmt={goal.timeFmt ?? "hms"} value={picking === "ptime" ? goal.target : (goal.best ?? 0) > 0 ? goal.best ?? 0 : goal.target}
          onSave={(sec) => set(picking === "ptime" ? { target: sec } : { best: sec })} onClose={() => setPicking(null)} />}
        {(picking === "wt" || picking === "wt-now") && <NumberSheet title={picking === "wt" ? "Target weight" : "Current weight"} cta={picking === "wt" ? "Set weight" : "Save weight"}
          value={picking === "wt" ? goal.target : goal.current} unit={goal.unit} units={[{ name: "kg", f: 1 }, { name: "lb", f: 0.45359237 }]} min={20} max={400} tenths presets={goal.unit === "lb" ? [130, 150, 170, 190] : [55, 60, 65, 70, 75]}
          onSave={(v, u) => {
            const conv = (x: number) => (u === goal.unit ? x : Math.round((u === "kg" ? x * 0.45359237 : x / 0.45359237) * 10) / 10);
            set(picking === "wt" ? { target: v, unit: u, current: conv(goal.current) } : { current: v, unit: u, target: conv(goal.target) });
          }} onClose={() => setPicking(null)} />}
        {askingLoc && <LocationSheet onAllow={allowLoc} onDeny={() => { setAskingLoc(false); setLoc("off"); }} />}
        {pickingDone && <DistanceSheet title="Already done" cta="Save distance" value={goal.current > 0 ? goal.current : Math.round(goal.target / 4)} unit={goal.unit}
          onSave={(v, u) => set({ current: Math.round(((v * TO_M[u as "km"]) / TO_M[goal.unit as "km"]) * 10) / 10 })} onClose={() => setPickingDone(false)} />}
        {pickingDist && <DistanceSheet value={goal.target} unit={goal.unit} onSave={(v, u) => set({ target: v, unit: u })} onClose={() => setPickingDist(false)} />}
        {pickingDate && (
          <DateSheet value={due} onSave={(d) => { setCustom(iso(d)); setDays(daysUntil(d)); }} onClose={() => setPickingDate(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
