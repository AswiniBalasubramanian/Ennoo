import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NumField } from "./Onboarding";
import {
  ArrowLeft, CaretRight, Check, Plus, Minus, MagnifyingGlass, Camera, User, UserPlus, Flag, Target, ProhibitInset,
  Star, X, Bell, Info, Ruler, Timer, Coffee, Stack, ArrowsClockwise,
} from "@phosphor-icons/react";
import { StatusBar, SportIcon } from "../components";
import { Sheet } from "../sheet";
import { TAG_LIBRARY, MARK_ALL, PEOPLE_LIMIT, type Gear, type Person } from "../entryData";

/* ---------- A full page that slides in over the form ---------- */
export function Page({ title, onBack, right, footer, children }: { title: string; onBack: () => void; right?: React.ReactNode; footer?: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 40 }}
      role="dialog" aria-label={title} style={{ position: "absolute", inset: 0, zIndex: 20, background: "#fff", overflowY: "auto", scrollbarWidth: "none", display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <header className="pad" style={{ position: "sticky", top: 0, zIndex: 3, background: "#fff", paddingTop: 52, paddingBottom: 10, display: "grid", gridTemplateColumns: "64px 1fr 64px", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
        <button type="button" className="icon-btn" aria-label="Back" onClick={onBack} style={{ border: 0, marginLeft: -10 }}><ArrowLeft size={22} /></button>
        <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 600 }}>{title}</h2>
        <span style={{ justifySelf: "end" }}>{right}</span>
      </header>
      <div style={{ flex: 1 }}>{children}</div>
      {footer && <div style={{ position: "sticky", bottom: 0, zIndex: 3, padding: "12px 20px 28px", background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 26%)" }}>{footer}</div>}
    </motion.div>
  );
}

/* A detail row on the entry page: icon, label, value, chevron */
export function DetailRow({ Icon, label, value, placeholder, onClick, lead }: { Icon?: typeof Flag; label: string; value?: React.ReactNode; placeholder?: string; onClick: () => void; lead?: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={`${label}${typeof value === "string" && value ? `, ${value}` : ""}. Change`}
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 56, padding: "8px 14px", borderRadius: 16, border: "1px solid var(--line)", background: "#fff", textAlign: "left" }}>
      {lead ?? (Icon && <SportIcon Icon={Icon} size={22} neutral />)}
      <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: value ? 600 : 500, color: value ? "var(--ink)" : "var(--gray)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {value || placeholder || label}
      </span>
      <CaretRight size={16} color="var(--gray)" aria-hidden />
    </button>
  );
}

/* ---------- How did you feel: animated reaction faces (art from VueFeedbackReaction, MIT) ----------
   Grey at rest; hovering or picking one plays its animation, then it settles in colour with a ripple. */
export const FEELS = ["Awful", "Poor", "Okay", "Good", "Amazing"] as const;
type Feel = (typeof FEELS)[number];
const FEEL_ART: Record<Feel, string> = { Awful: "hate", Poor: "disappointed", Okay: "natural", Good: "good", Amazing: "excellent" };
const art = (m: Feel, k: "" | "_active" | "_inactive") => `/img/feel/${FEEL_ART[m]}${k}${k ? ".png" : ".gif"}`;
const PLAY_MS = 1900;
function Face({ mood, on, dim }: { mood: Feel; on: boolean; dim: boolean }) {
  const [hover, setHover] = useState(false);
  const [play, setPlay] = useState(0); // bumps on each pick so the animation restarts from frame one
  const [playing, setPlaying] = useState(false);
  const was = useRef(on);
  useEffect(() => {
    if (on && !was.current) { setPlay((n) => n + 1); setPlaying(true); const t = setTimeout(() => setPlaying(false), PLAY_MS); was.current = on; return () => clearTimeout(t); }
    was.current = on;
  }, [on]);
  const animated = playing || (hover && !dim);
  const src = animated ? `${art(mood, "")}?p=${play}` : on ? art(mood, "_active") : art(mood, "_inactive");
  return (
    <span onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)} onPointerLeave={() => setHover(false)}
      style={{ position: "relative", width: 56, height: 56, display: "grid", placeItems: "center" }}>
      {/* the ripple when picked */}
      <AnimatePresence>
        {playing && (
          <motion.span key={play} aria-hidden initial={{ scale: 0.7, opacity: 0.9 }} animate={{ scale: 1.55, opacity: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 6, borderRadius: "50%", background: "radial-gradient(circle, rgba(254,215,100,0.55) 0%, rgba(254,215,100,0) 70%)", border: "2px solid rgba(254,200,60,0.7)" }} />
        )}
      </AnimatePresence>
      <motion.img src={src} alt="" aria-hidden draggable={false} width={48} height={48}
        animate={{ scale: on ? (playing ? [1, 1.28, 1.14] : 1.14) : hover && !dim ? 1.1 : 1, opacity: dim && !hover ? 0.55 : 1, y: on ? -2 : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 18 }} whileTap={{ scale: 0.88 }}
        style={{ position: "relative", width: 48, height: 48, borderRadius: "50%", objectFit: "contain", filter: on ? "drop-shadow(0 6px 10px rgba(247,144,9,0.28))" : "none", transition: "filter .3s" }} />
    </span>
  );
}
export function FeelPicker({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  // warm the cache so the first hover or pick animates at once
  useEffect(() => { for (const m of FEELS) for (const k of ["", "_active"] as const) { const i = new Image(); i.src = art(m, k); } }, []);
  return (
    <div role="radiogroup" aria-label="How did you feel" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 2 }}>
      {FEELS.map((t) => {
        const on = value === t;
        return (
          <button key={t} type="button" role="radio" aria-checked={on} aria-label={t} onClick={() => onChange(on ? null : t)}
            style={{ display: "grid", justifyItems: "center", gap: 4, padding: "4px 0 6px", background: "transparent", WebkitTapHighlightColor: "transparent" }}>
            <Face mood={t} on={on} dim={!!value && !on} />
            <motion.span animate={{ color: on ? "#0B1220" : "#667085" }} style={{ fontSize: 13, fontWeight: on ? 650 : 500 }}>{t}</motion.span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Chips that pick many: blue with a tick when on ---------- */
function PickChip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      style={{ height: 40, padding: on ? "0 12px 0 16px" : "0 16px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: on ? 600 : 500,
        background: on ? "var(--blue)" : "#fff", color: on ? "#fff" : "var(--ink)", border: `1px solid ${on ? "var(--blue)" : "var(--line)"}`, transition: "all .18s" }}>
      {label}{on && <Check size={14} weight="bold" aria-hidden />}
    </button>
  );
}
/* ---------- Tags: a half-screen sheet; the sport's suggestions first, then See all ---------- */
export function TagSheet({ sport, suggested, value, custom, onDone, onClose }: { sport: string; suggested: string[]; value: string[]; custom: string[]; onDone: (tags: string[], custom: string[]) => void; onClose: () => void }) {
  const [sel, setSel] = useState(value);
  const [mine] = useState(custom);
  const [all, setAll] = useState(false);
  const [q, setQ] = useState("");
  const first = suggested.slice(0, 8);
  const rest = [...suggested.slice(8), ...TAG_LIBRARY.filter((x) => !suggested.includes(x))];
  const toggle = (x: string) => setSel((s) => (s.includes(x) ? s.filter((y) => y !== x) : [...s, x]));
  const shownRest = rest.filter((x) => x.toLowerCase().includes(q.trim().toLowerCase()));
  const chosenElsewhere = sel.filter((x) => !first.includes(x) && !mine.includes(x));
  return (
    <Sheet id="tags" title={`${sport} tags`} sub="Select tags (optional). Pick as many as fit." onClose={onClose} expandable={all}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        {[...first, ...mine, ...(all ? [] : chosenElsewhere)].map((x) => <PickChip key={x} label={x} on={sel.includes(x)} onClick={() => toggle(x)} />)}
      </div>
      {!all ? (
        <button type="button" className="link" style={{ marginTop: 16 }} onClick={() => setAll(true)}>See all tags<CaretRight size={14} /></button>
      ) : (
        <>
          <h3 className="h2" style={{ fontSize: 15, margin: "22px 0 10px" }}>All tags</h3>
          <div style={{ position: "relative" }}>
            <MagnifyingGlass size={17} color="var(--gray)" aria-hidden style={{ position: "absolute", left: 14, top: 15 }} />
            <input type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tags" aria-label="Search tags" style={{ height: 46, paddingLeft: 40, background: "var(--bg)", borderColor: "transparent" }} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {shownRest.map((x) => <PickChip key={x} label={x} on={sel.includes(x)} onClick={() => toggle(x)} />)}
            {!shownRest.length && <p className="meta" style={{ fontSize: 14 }}>No tag called “{q}”.</p>}
          </div>
        </>
      )}
      <div style={{ position: "sticky", bottom: -28, margin: "18px -20px -28px", padding: "12px 20px 28px", background: "#fff" }}>
        <button type="button" className="btn btn-blue" style={{ width: "100%" }} onClick={() => { onDone(sel, mine); onClose(); }}>{sel.length ? `Done (${sel.length})` : "Done"}</button>
      </div>
    </Sheet>
  );
}

/* ---------- Mark this day: a few marks in line, the rest searchable ---------- */
export function MarkSheet({ value, onDone, onClose }: { value: string[]; onDone: (v: string[]) => void; onClose: () => void }) {
  const [sel, setSel] = useState(value);
  const [q, setQ] = useState("");
  const list = MARK_ALL.filter((x) => x.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Sheet id="marks" title="Mark this day" sub="Find a mark or scroll the list." onClose={onClose}>
      <div style={{ position: "relative", marginTop: 14 }}>
        <MagnifyingGlass size={17} color="var(--gray)" aria-hidden style={{ position: "absolute", left: 14, top: 15 }} />
        <input type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search marks, like sore or rainy" aria-label="Search marks" style={{ height: 46, paddingLeft: 40, background: "var(--bg)", borderColor: "transparent" }} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        {list.map((x) => <PickChip key={x} label={x} on={sel.includes(x)} onClick={() => setSel((s) => (s.includes(x) ? s.filter((y) => y !== x) : [...s, x]))} />)}
        {!list.length && <p className="meta" style={{ fontSize: 14 }}>No mark matches “{q}”.</p>}
      </div>
      <button type="button" className="btn btn-blue" style={{ width: "100%", marginTop: 18 }} onClick={() => { onDone(sel); onClose(); }}>{sel.length ? `Done (${sel.length})` : "Done"}</button>
    </Sheet>
  );
}

/* ---------- Gear: shoes for runs, bikes for rides; a reminder as it nears its limit ---------- */
export function GearCard({ g, onClick }: { g: Gear; onClick: () => void }) {
  const near = g.km / g.limit >= 0.9;
  return (
    <button type="button" onClick={onClick} aria-label={`${g.name}, ${g.km} km. Change gear`}
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 14px 10px 10px", borderRadius: 16, border: "1px solid var(--line)", background: "#fff", textAlign: "left" }}>
      <img src={g.img} alt="" style={{ width: 56, height: 44, objectFit: g.kind === "shoe" ? "contain" : "cover", borderRadius: 10, background: "var(--bg)", flex: "none" }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{g.name}</span>
        <span className="num" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: near ? "#B54708" : "var(--gray)", marginTop: 2 }}>
          {near && <Bell size={13} weight="fill" aria-hidden />}{g.km.toLocaleString("en-IN")} of {g.limit.toLocaleString("en-IN")} km{near ? ", due for a swap soon" : ""}
        </span>
        <span aria-hidden style={{ display: "block", height: 4, borderRadius: 2, background: "var(--line)", marginTop: 6, overflow: "hidden" }}>
          <span style={{ display: "block", height: "100%", width: `${Math.min(100, (g.km / g.limit) * 100)}%`, background: near ? "#F79009" : "var(--blue)" }} />
        </span>
      </span>
      <CaretRight size={16} color="var(--gray)" aria-hidden />
    </button>
  );
}
export function GearSheet({ kind, list, value, onDone, onAdd, onClose }: { kind: "shoe" | "bike"; list: Gear[]; value: string | null; onDone: (id: string | null) => void; onAdd: () => void; onClose: () => void }) {
  const [sel, setSel] = useState(value);
  const noun = kind === "shoe" ? "shoes" : "bike";
  return (
    <Sheet id="gear" title={kind === "shoe" ? "Your shoes" : "Your bikes"} sub={`We track the distance on each, and remind you when your ${noun} need${kind === "shoe" ? "" : "s"} a swap.`} onClose={onClose}>
      <div role="radiogroup" aria-label="Gear" style={{ marginTop: 10 }}>
        {list.map((g) => {
          const on = sel === g.id;
          return (
            <button key={g.id} type="button" role="radio" aria-checked={on} onClick={() => setSel(g.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 64, padding: "8px 0", borderBottom: "1px solid var(--line)", textAlign: "left" }}>
              <img src={g.img || "/img/auth-shoe.png"} alt="" style={{ width: 52, height: 40, objectFit: kind === "shoe" ? "contain" : "cover", borderRadius: 10, background: "var(--bg)" }} />
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{g.name}</span>
                <span className="num cap">{g.km.toLocaleString("en-IN")} km used</span>
              </span>
              <Radio on={on} />
            </button>
          );
        })}
        <button type="button" role="radio" aria-checked={sel === null} onClick={() => setSel(null)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 56, textAlign: "left" }}>
          <span style={{ width: 52, display: "grid", placeItems: "center", color: "var(--gray)" }}><ProhibitInset size={22} /></span>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>No gear</span>
          <Radio on={sel === null} />
        </button>
      </div>
      <button type="button" className="link" style={{ marginTop: 10 }} onClick={onAdd}><Plus size={16} weight="bold" />Add new gear</button>
      <button type="button" className="btn btn-blue" style={{ width: "100%", marginTop: 16 }} onClick={() => { onDone(sel); onClose(); }}>Apply</button>
    </Sheet>
  );
}

function Radio({ on }: { on: boolean }) {
  return (
    <span aria-hidden style={{ width: 24, height: 24, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", border: on ? "none" : "1.5px solid #C3C9D4", background: on ? "var(--blue)" : "#fff", color: "#fff" }}>
      {on && <Check size={13} weight="bold" />}
    </span>
  );
}

/* ---------- People: avatars, the entry row's summary, the picker and Add person ---------- */
export function Avatar({ p, size = 40, ring }: { p: Person; size?: number; ring?: boolean }) {
  return (
    <span aria-hidden style={{ width: size, height: size, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", overflow: "hidden", background: p.tint, color: "#fff", fontSize: size * 0.42, fontWeight: 650, boxShadow: ring ? "0 0 0 2px #fff" : "none" }}>
      {p.photo ? <img src={p.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : p.name.slice(0, 1).toUpperCase()}
    </span>
  );
}
export function peopleText(list: Person[]) {
  if (!list.length) return "";
  if (list.length <= 3) return list.map((p) => p.name).join(", ");
  return `${list[0].name}, ${list[1].name} +${list.length - 2}`;
}
export function PeopleStack({ list }: { list: Person[] }) {
  const shown = list.slice(0, list.length > 3 ? 2 : 3);
  return (
    <span style={{ display: "flex", flex: "none" }}>
      {shown.map((p, i) => <span key={p.id} style={{ marginLeft: i ? -10 : 0 }}><Avatar p={p} size={32} ring /></span>)}
      {list.length > 3 && <span className="num" style={{ marginLeft: -10, width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--bg)", boxShadow: "0 0 0 2px #fff", fontSize: 12, fontWeight: 650 }}>+{list.length - 2}</span>}
    </span>
  );
}
export function PeopleSheet({ people, value, onDone, onNew, onClose }: { people: Person[]; value: string[]; onDone: (ids: string[]) => void; onNew: () => void; onClose: () => void }) {
  const [sel, setSel] = useState(value);
  const [q, setQ] = useState("");
  const t = q.trim().toLowerCase();
  const recent = people.filter((p) => p.last).slice(0, 3);
  const shown = people.filter((p) => p.name.toLowerCase().includes(t));
  const full = sel.length >= PEOPLE_LIMIT;
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : full ? s : [...s, id]));
  const changed = sel.length !== value.length || sel.some((x) => !value.includes(x));
  const row = (p: Person, sub?: string) => {
    const on = sel.includes(p.id);
    return (
      <button key={p.id} type="button" role="checkbox" aria-checked={on} disabled={!on && full} onClick={() => toggle(p.id)}
        style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minHeight: 60, padding: "6px 0", textAlign: "left" }}>
        <Avatar p={p} />
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", fontSize: 16, fontWeight: 600 }}>{p.name}</span>
          {sub && <span className="cap">{sub}</span>}
        </span>
        <Radio on={on} />
      </button>
    );
  };
  return (
    <Sheet id="people" title="With whom" onClose={onClose} expandable head={
      <div style={{ position: "relative", marginTop: 14 }}>
        <MagnifyingGlass size={17} color="var(--gray)" aria-hidden style={{ position: "absolute", left: 14, top: 15 }} />
        <input type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people" aria-label="Search people" style={{ height: 46, paddingLeft: 40, background: "var(--bg)", borderColor: "transparent" }} />
      </div>
    }>
      {!t && recent.length > 0 && (
        <>
          <h3 className="h2" style={{ fontSize: 16, margin: "18px 0 4px" }}>Recently used</h3>
          {recent.map((p) => row(p, p.last))}
        </>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "18px 0 4px", paddingTop: t ? 0 : 14, borderTop: t ? "none" : "1px solid var(--line)" }}>
        <h3 className="h2" style={{ fontSize: 16 }}>{t ? "Results" : `All people (${people.length})`}</h3>
        <button type="button" className="link" onClick={onNew}><UserPlus size={16} />New person</button>
      </div>
      {(t ? shown : people.filter((p) => !recent.includes(p))).map((p) => row(p))}
      {t && !shown.length && <p className="meta" style={{ fontSize: 14, marginTop: 8 }}>No one called “{q}” yet. Add them as a new person.</p>}
      {full && <p className="cap" style={{ marginTop: 8 }}>That's the limit of {PEOPLE_LIMIT} people for one activity.</p>}
      <div style={{ position: "sticky", bottom: -28, margin: "14px -20px -28px", padding: "12px 20px 28px", background: "#fff", zIndex: 2 }}>
        {changed || sel.length ? (
          <button type="button" className="btn btn-blue" style={{ width: "100%" }} onClick={() => { onDone(sel); onClose(); }}>{sel.length ? `Add (${sel.length})` : "Clear people"}</button>
        ) : (
          <button type="button" className="btn btn-soft" style={{ width: "100%", color: "var(--blue)" }} onClick={onNew}><Plus size={18} weight="bold" />Add new person</button>
        )}
      </div>
    </Sheet>
  );
}
export function AddPersonPage({ onSave, onBack }: { onSave: (name: string, photo?: string) => void; onBack: () => void }) {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string>();
  const file = useRef<HTMLInputElement>(null);
  return (
    <Page title="Add person" onBack={onBack} footer={<button type="button" className="btn btn-blue" style={{ width: "100%" }} disabled={!name.trim()} onClick={() => onSave(name.trim(), photo)}>Save</button>}>
      <div className="pad" style={{ display: "grid", justifyItems: "center", gap: 24, paddingTop: 28 }}>
        <button type="button" onClick={() => file.current?.click()} aria-label={photo ? "Change photo" : "Add photo"}
          style={{ width: 112, height: 112, borderRadius: "50%", overflow: "hidden", background: "var(--bg)", display: "grid", placeItems: "center", alignContent: "center", gap: 4, color: "var(--gray)", border: "1px solid var(--line)" }}>
          {photo ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <><Camera size={30} /><span style={{ fontSize: 13 }}>Add photo</span></>}
        </button>
        <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f)); }} />
        <div style={{ position: "relative", width: "100%" }}>
          <User size={20} color="var(--gray)" aria-hidden style={{ position: "absolute", left: 14, top: 16 }} />
          <input autoFocus className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" aria-label="Name" maxLength={40} style={{ paddingLeft: 44 }}
            onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSave(name.trim(), photo); }} />
        </div>
        <p className="meta" style={{ fontSize: 14, textAlign: "center", lineHeight: 1.5 }}>Saved once, you can add them to any activity: runs, rides, hikes and more.</p>
      </div>
    </Page>
  );
}

/* ---------- Link to goal: the primary goal by default, any active goal, or No goal ---------- */
export type GoalOpt = { title: string; activity: string; primary?: boolean };
export function GoalSheet({ goals, value, onApply, onNewGoal, onClose }: { goals: GoalOpt[]; value: string | null; onApply: (t: string | null) => void; onNewGoal: () => void; onClose: () => void }) {
  const [sel, setSel] = useState(value);
  const opt = (key: string | null, label: string, Icon: typeof Flag, badge?: boolean) => {
    const on = sel === key;
    return (
      <button key={key ?? "none"} type="button" role="radio" aria-checked={on} onClick={() => setSel(key)}
        style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minHeight: 60, padding: "8px 0", borderBottom: "1px solid var(--line)", textAlign: "left" }}>
        <Icon size={24} color={key && on ? "var(--blue)" : "var(--ink)"} aria-hidden />
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{label}</span>
          {badge && <span style={{ display: "inline-block", marginTop: 4, padding: "2px 8px", borderRadius: 6, background: "var(--blue-50)", color: "var(--blue)", fontSize: 12, fontWeight: 600 }}>Primary goal</span>}
        </span>
        <Radio on={on} />
      </button>
    );
  };
  return (
    <Sheet id="goal-link" title="Link to goal" sub="This activity counts toward the goal you pick." onClose={onClose}>
      <div role="radiogroup" aria-label="Goal" style={{ marginTop: 8 }}>
        {goals.map((g) => opt(g.title, g.title, g.primary ? Target : Flag, g.primary))}
        {opt(null, "No goal", ProhibitInset)}
      </div>
      <button type="button" className="link" style={{ marginTop: 12 }} onClick={onNewGoal}><Plus size={16} weight="bold" />Create a new goal</button>
      <button type="button" className="btn btn-blue" style={{ width: "100%", marginTop: 16 }} onClick={() => { onApply(sel); onClose(); }}>Apply</button>
    </Sheet>
  );
}
export const WhyGoal = () => (
  <div style={{ display: "flex", gap: 12, padding: "14px 16px", borderRadius: 16, background: "var(--blue-50)", marginTop: 10 }}>
    <Star size={20} weight="fill" color="var(--blue)" aria-hidden style={{ flex: "none", marginTop: 1 }} />
    <p style={{ fontSize: 14, lineHeight: 1.45 }}><strong style={{ color: "var(--blue)" }}>Why link a goal?</strong> You'll see how each activity moves you closer to it.</p>
  </div>
);

/* ---------- Sets & reps: Reps only or Sets & reps; distance, time and rest are optional per rep ---------- */
export type Rep = { d: number; t: number; r: number };
export type SR = { mode: "reps" | "sets"; on: { dist: boolean; time: boolean; rest: boolean; setRest: boolean }; unit: "m" | "km"; sets: { reps: Rep[]; rest: number }[] };
export const SR_LIMIT = { sets: 10, reps: 30 }; // pending user testing: 6 × 10 may become the cap
export const emptySR = (): SR => ({ mode: "reps", on: { dist: false, time: false, rest: false, setRest: false }, unit: "m", sets: [{ reps: Array.from({ length: 5 }, () => ({ d: 400, t: 90, r: 60 })), rest: 180 }] });
export const srTotal = (s: SR) => s.sets.reduce((n, x) => n + x.reps.length, 0);
const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;
export function srText(s: SR) {
  const first = s.sets[0].reps[0];
  const same = (k: keyof Rep) => s.sets.every((x) => x.reps.every((r) => r[k] === first[k]));
  const head = s.mode === "sets" ? `${s.sets.length} × ${s.sets[0].reps.length}` : `${srTotal(s)} reps`;
  const dist = s.on.dist ? (same("d") ? ` × ${first.d} ${s.unit}` : `, varied distance`) : "";
  const bits = [s.on.time && (same("t") ? mmss(first.t) : "varied time"), s.on.rest && `rest ${same("r") ? mmss(first.r) : "varied"}`].filter(Boolean);
  return `${head}${s.mode === "sets" ? " reps" : ""}${dist}${bits.length ? ` (${bits.join(", ")})` : ""}`;
}

/* a time typed as m:ss, or digits (130 → 1:30) */
function TimeIn({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [txt, setTxt] = useState<string | null>(null);
  const commit = () => {
    if (txt === null) return;
    const s = txt.trim();
    let v = value;
    if (s.includes(":")) { const [m, sec] = s.split(":"); v = (parseInt(m) || 0) * 60 + Math.min(59, parseInt(sec) || 0); }
    else if (s) { const n = parseInt(s.replace(/\D/g, "")) || 0; v = n >= 100 ? Math.floor(n / 100) * 60 + Math.min(59, n % 100) : n; }
    onChange(v); setTxt(null);
  };
  return <input aria-label={label} inputMode="numeric" value={txt ?? mmss(value)} onFocus={(e) => { setTxt(mmss(value)); e.currentTarget.select(); }} onChange={(e) => setTxt(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} className="srin num" />;
}
function DistIn({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return <input aria-label={label} inputMode="decimal" value={value || ""} placeholder="0" onChange={(e) => onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.currentTarget.select()} className="srin num" />;
}
function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const b = (dis: boolean): React.CSSProperties => ({ width: 52, height: 52, display: "grid", placeItems: "center", color: dis ? "var(--gray-2)" : "var(--blue)" });
  return (
    <div>
      <span className="flabel">{label}</span>
      <div role="group" aria-label={label} style={{ display: "grid", gridTemplateColumns: "52px 1fr 52px", alignItems: "center", height: 54, borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)} style={b(value <= min)}><Minus size={20} weight="bold" /></button>
        <span className="num" aria-live="polite" style={{ textAlign: "center", fontSize: 22, fontWeight: 650, borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)", lineHeight: "52px" }}>{value}</span>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)} style={b(value >= max)}><Plus size={20} weight="bold" /></button>
      </div>
    </div>
  );
}
function Toggle({ label, Icon, on, onChange, children }: { label: string; Icon: typeof Flag; on: boolean; onChange: (v: boolean) => void; children?: React.ReactNode }) {
  return (
    <div style={{ borderBottom: "1px solid var(--line)", padding: "4px 0" }}>
      <label style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 48, cursor: "pointer" }}>
        <SportIcon Icon={Icon} size={22} selected={on} neutral />
        <span style={{ flex: 1, fontSize: 15, fontWeight: on ? 600 : 500 }}>{label}</span>
        <input type="checkbox" role="switch" checked={on} onChange={(e) => onChange(e.target.checked)} className="switch" />
      </label>
      {on && children && <div style={{ padding: "0 0 12px 34px" }}>{children}</div>}
    </div>
  );
}

export function SetsRepsPage({ value, sport, onSave, onRemove, onBack }: { value: SR | null; sport: string; onSave: (s: SR) => void; onRemove?: () => void; onBack: () => void }) {
  const [s, setS] = useState<SR>(() => value ?? emptySR());
  const [tab, setTab] = useState(0);
  const cur = s.sets[Math.min(tab, s.sets.length - 1)];
  const base = s.sets[0].reps[0];
  const repsPer = s.sets[0].reps.length;
  const resize = (sets: number, reps: number) => setS((x) => {
    const tmpl = x.sets[0].reps[0];
    const fit = (list: Rep[]) => list.length >= reps ? list.slice(0, reps) : [...list, ...Array.from({ length: reps - list.length }, () => ({ ...(list[list.length - 1] ?? tmpl) }))];
    const out = x.sets.slice(0, sets).map((st) => ({ ...st, reps: fit(st.reps) }));
    while (out.length < sets) out.push({ reps: fit(out[out.length - 1].reps.map((r) => ({ ...r }))), rest: out[out.length - 1].rest });
    return { ...x, sets: out };
  });
  // a default above the list: changing it updates every rep that still matches the old default
  const setAll = (k: keyof Rep, v: number) => setS((x) => { const old = x.sets[0].reps[0][k]; return { ...x, sets: x.sets.map((st) => ({ ...st, reps: st.reps.map((r) => (r[k] === old ? { ...r, [k]: v } : r)) })) }; });
  const setRep = (si: number, ri: number, k: keyof Rep, v: number) => setS((x) => ({ ...x, sets: x.sets.map((st, i) => (i !== si ? st : { ...st, reps: st.reps.map((r, j) => (j === ri ? { ...r, [k]: v } : r)) })) }));
  const on = (k: keyof SR["on"], v: boolean) => setS((x) => ({ ...x, on: { ...x.on, [k]: v } }));
  const setMode = (m: SR["mode"]) => { setS((x) => ({ ...x, mode: m, sets: m === "reps" ? [{ ...x.sets[0], reps: x.sets.flatMap((st) => st.reps).slice(0, SR_LIMIT.reps) }] : x.sets })); setTab(0); if (m === "sets" && s.sets.length < 2) resize(3, Math.min(repsPer, 5)); };
  const cols = [s.on.dist && "dist", s.on.time && "time", s.on.rest && "rest"].filter(Boolean) as ("dist" | "time" | "rest")[];
  const colName = { dist: `Distance (${s.unit})`, time: "Time", rest: "Rest" };
  const si = Math.min(tab, s.sets.length - 1);
  const lastRep = (i: number) => i === cur.reps.length - 1; // no rest after the last rep of a set

  return (
    <Page title="Sets & reps" onBack={onBack}
      footer={<div style={{ display: "grid", gridTemplateColumns: onRemove ? "1fr 2fr" : "1fr", gap: 8 }}>
        {onRemove && <button type="button" className="btn btn-soft" style={{ color: "#d92d20" }} onClick={onRemove}>Remove</button>}
        <button type="button" className="btn btn-blue" onClick={() => onSave(s)}><Check size={18} weight="bold" />Save {s.mode === "sets" ? "sets" : "reps"}</button>
      </div>}>
      <div className="pad" style={{ paddingTop: 16, paddingBottom: 20 }}>
        <div role="tablist" aria-label="How you record it" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: 4, borderRadius: 14, background: "var(--bg)" }}>
          {(["reps", "sets"] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={s.mode === m} onClick={() => setMode(m)}
              style={{ height: 42, borderRadius: 11, fontSize: 15, fontWeight: 600, background: s.mode === m ? "var(--blue)" : "transparent", color: s.mode === m ? "#fff" : "var(--ink)", transition: "all .2s" }}>
              {m === "reps" ? "Reps only" : "Sets & reps"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, background: "var(--blue-50)", marginTop: 14 }}>
          <span aria-hidden style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", display: "grid", placeItems: "center", flex: "none" }}><SportIcon Icon={s.mode === "sets" ? Stack : ArrowsClockwise} size={26} selected /></span>
          <span>
            <span className="num" style={{ display: "block", fontSize: 17, fontWeight: 650 }}>{srText(s)}</span>
            <span className="cap">{s.mode === "sets" ? `${srTotal(s)} reps in all on this ${sport.toLowerCase()}` : cols.length ? "Each rep is editable below" : "Count only"}</span>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: s.mode === "sets" ? "1fr 1fr" : "1fr", gap: 10, marginTop: 16 }}>
          {s.mode === "sets" && <Stepper label="Sets" value={s.sets.length} min={1} max={SR_LIMIT.sets} onChange={(n) => { resize(n, repsPer); if (tab >= n) setTab(n - 1); }} />}
          <Stepper label={s.mode === "sets" ? "Reps per set" : "Number of reps"} value={s.mode === "sets" ? repsPer : cur.reps.length} min={1} max={SR_LIMIT.reps} onChange={(n) => resize(s.sets.length, n)} />
        </div>

        <h3 className="h2" style={{ fontSize: 16, margin: "22px 0 4px" }}>Add details <span className="meta" style={{ fontSize: 14, fontWeight: 500 }}>optional</span></h3>
        <Toggle label="Distance per rep" Icon={Ruler} on={s.on.dist} onChange={(v) => on("dist", v)}>
          <div className="nolabel"><NumField id="sr-dist" label="Distance per rep" value={base.d} decimals onChange={(v) => setAll("d", v)} units={["m", "km"]} unit={s.unit} onUnit={(u) => setS({ ...s, unit: u as SR["unit"] })} /></div>
        </Toggle>
        <Toggle label="Time per rep" Icon={Timer} on={s.on.time} onChange={(v) => on("time", v)}>
          <span className="nf" style={{ height: 48 }}><TimeIn label="Time per rep, minutes and seconds" value={base.t} onChange={(v) => setAll("t", v)} /><span className="sfx">m:ss</span></span>
        </Toggle>
        <Toggle label="Rest between reps" Icon={Coffee} on={s.on.rest} onChange={(v) => on("rest", v)}>
          <span className="nf" style={{ height: 48 }}><TimeIn label="Rest between reps" value={base.r} onChange={(v) => setAll("r", v)} /><span className="sfx">m:ss</span></span>
        </Toggle>
        {s.mode === "sets" && (
          <Toggle label="Rest between sets" Icon={Stack} on={s.on.setRest} onChange={(v) => on("setRest", v)}>
            <span className="nf" style={{ height: 48 }}><TimeIn label="Rest between sets" value={s.sets[0].rest} onChange={(v) => setS((x) => ({ ...x, sets: x.sets.map((st) => (st.rest === x.sets[0].rest ? { ...st, rest: v } : st)) }))} /><span className="sfx">m:ss</span></span>
          </Toggle>
        )}

        <h3 className="h2" style={{ fontSize: 16, margin: "24px 0 10px" }}>Your {s.mode === "sets" ? "sets" : "reps"}</h3>
        {s.mode === "sets" && (
          <div role="tablist" aria-label="Sets" style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", marginBottom: 10 }}>
            {s.sets.map((_, i) => (
              <button key={i} type="button" role="tab" aria-selected={si === i} onClick={() => setTab(i)}
                style={{ flex: "none", height: 36, padding: "0 16px", borderRadius: 999, fontSize: 14, fontWeight: si === i ? 600 : 500, background: si === i ? "var(--blue)" : "#fff", color: si === i ? "#fff" : "var(--ink)", border: `1px solid ${si === i ? "var(--blue)" : "var(--line)"}` }}>Set {i + 1}</button>
            ))}
          </div>
        )}
        <div role="table" aria-label={s.mode === "sets" ? `Set ${si + 1}` : "Reps"} style={{ borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
          <div role="row" style={{ display: "grid", gridTemplateColumns: `36px repeat(${Math.max(1, cols.length)}, minmax(0,1fr)) 36px`, alignItems: "center", gap: 6, padding: "0 6px 0 10px", height: 38, background: "var(--bg)", fontSize: 12, fontWeight: 650, color: "var(--gray)" }}>
            <span role="columnheader">#</span>
            {cols.length ? cols.map((c) => <span key={c} role="columnheader">{colName[c]}</span>) : <span role="columnheader">Rep</span>}
            <span />
          </div>
          {cur.reps.map((r, i) => (
            <div role="row" key={i} style={{ display: "grid", gridTemplateColumns: `36px repeat(${Math.max(1, cols.length)}, minmax(0,1fr)) 36px`, alignItems: "center", gap: 6, padding: "4px 6px 4px 10px", minHeight: 52, borderTop: "1px solid var(--line)" }}>
              <span role="cell" className="num" style={{ fontSize: 14, fontWeight: 650 }}>{i + 1}</span>
              {cols.length ? cols.map((c) => (
                <span role="cell" key={c}>
                  {c === "dist" ? <DistIn label={`Rep ${i + 1} distance`} value={r.d} onChange={(v) => setRep(si, i, "d", v)} />
                    : c === "time" ? <TimeIn label={`Rep ${i + 1} time`} value={r.t} onChange={(v) => setRep(si, i, "t", v)} />
                    : lastRep(i) ? <span className="meta" style={{ fontSize: 14, paddingLeft: 10 }}>None</span>
                    : <TimeIn label={`Rest after rep ${i + 1}`} value={r.r} onChange={(v) => setRep(si, i, "r", v)} />}
                </span>
              )) : <span role="cell" style={{ fontSize: 15 }}>Rep</span>}
              <button type="button" aria-label={`Remove rep ${i + 1}`} disabled={cur.reps.length === 1}
                onClick={() => setS((x) => ({ ...x, sets: x.sets.map((st, k) => (k !== si ? st : { ...st, reps: st.reps.filter((_, j) => j !== i) })) }))}
                style={{ width: 36, height: 44, display: "grid", placeItems: "center", color: "var(--gray)", opacity: cur.reps.length === 1 ? 0.3 : 1 }}><X size={16} /></button>
            </div>
          ))}
        </div>
        {s.mode === "sets" && s.on.setRest && si < s.sets.length - 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, padding: "6px 6px 6px 14px", borderRadius: 14, background: "var(--bg)" }}>
            <SportIcon Icon={Coffee} size={20} neutral />
            <span style={{ flex: 1, fontSize: 14 }}>Rest after set {si + 1}</span>
            <span style={{ width: 100 }}><TimeIn label={`Rest after set ${si + 1}`} value={cur.rest} onChange={(v) => setS((x) => ({ ...x, sets: x.sets.map((st, k) => (k === si ? { ...st, rest: v } : st)) }))} /></span>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: s.mode === "sets" ? "1fr 1fr" : "1fr", gap: 8, marginTop: 10 }}>
          <button type="button" className="btn btn-soft" disabled={cur.reps.length >= SR_LIMIT.reps}
            onClick={() => setS((x) => ({ ...x, sets: x.sets.map((st, k) => (k !== si ? st : { ...st, reps: [...st.reps, { ...st.reps[st.reps.length - 1] }] })) }))}><Plus size={16} weight="bold" />Add rep</button>
          {s.mode === "sets" && <button type="button" className="btn btn-soft" disabled={s.sets.length >= SR_LIMIT.sets}
            onClick={() => { setS((x) => ({ ...x, sets: [...x.sets, { reps: x.sets[x.sets.length - 1].reps.map((r) => ({ ...r })), rest: x.sets[x.sets.length - 1].rest }] })); setTab(s.sets.length); }}><Plus size={16} weight="bold" />Add set</button>}
        </div>
        <p className="cap" style={{ display: "flex", gap: 6, marginTop: 12, lineHeight: 1.45 }}><Info size={15} aria-hidden style={{ flex: "none", marginTop: 1 }} />Up to {SR_LIMIT.sets} sets of {SR_LIMIT.reps} reps. Tap any value to change just that rep.</p>
      </div>
    </Page>
  );
}

/* the metric tile glyph used for Sets & reps */
export const SetsIcon = ArrowsClockwise;
