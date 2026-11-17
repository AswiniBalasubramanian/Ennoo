import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "motion/react";
import {
  ArrowLeft, CaretLeft, CaretRight, MagnifyingGlass, Check, CheckCircle, Plus, Star, Trash, DotsSixVertical, DotsThree,
  CalendarBlank, Clock, ImageSquare, Images, X, MapPin, CaretDown, Info,Mountains, Metronome, Repeat,
  Sneaker, Flag, Heartbeat, Fire, Gauge, Trophy, Medal, FlagCheckered,
} from "@phosphor-icons/react";
import { StatusBar, SportIcon, addWith, type Route } from "../components";
import { Sheet, Wheel, WheelBand } from "../sheet";
import { activities, byId, groupInfo, groupOrder, matches, goal, otherGoals, type Activity } from "../data";
import { METRICS, fmtN, fmtTime } from "../metrics";
import { NumField,TimeSheet, DistanceSheet, fieldErr } from "./Onboarding";

/*
  Add activity, laid out like an activity's details page: photos on top, the title with its date and place,
  then one row per detail. Each row opens its own sheet or page.
  Metrics follow the "70 Activities & Metric Mapping" spec: the sport's goal metrics (less Sessions, since one
  entry is one session, and Performance, which is worked out from distance and time) plus its additional entry
  metrics. Mixed intervals is a simple list until its rules arrive.
*/

/* ---------- Sport picker: search, your top sports, then every category ---------- */
const TOP = ["run", "walk", "cycle", "swim", "weights"];
function ActivitySheet({ value, onPick, onClose }: { value: string; onPick: (id: string) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => activities.filter((a) => matches(a, q)), [q]);
  const row = (a: Activity) => {
    const on = a.id === value;
    return (
      <button key={a.id} type="button" role="radio" aria-checked={on} onClick={() => onPick(a.id)}
        style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minHeight: 52, padding: "4px 2px", textAlign: "left" }}>
        <SportIcon Icon={a.Icon} size={26} selected={on} />
        <span style={{ flex: 1, fontSize: 16, fontWeight: on ? 600 : 500, color: on ? "var(--blue)" : "var(--ink)" }}>{a.name}</span>
        {on && <Check size={20} weight="bold" color="var(--blue)" aria-hidden />}
      </button>
    );
  };
  return (
    <Sheet id="act" title="Choose activity" onClose={onClose}>
      <div style={{ position: "relative", marginTop: 14 }}>
        <MagnifyingGlass size={17} color="var(--gray)" aria-hidden style={{ position: "absolute", left: 14, top: 15 }} />
        <input type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activities" aria-label="Search activities"
          style={{ height: 46, paddingLeft: 40, background: "var(--bg)", borderColor: "transparent" }} />
      </div>
      <div role="radiogroup" aria-label="Activity">
        {!q.trim() && (
          <>
            <h3 className="h2" style={{ fontSize: 16, margin: "20px 0 12px" }}>Your top sports</h3>
            <div style={{ display: "flex", gap: 14, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 6 }}>
              {TOP.map(byId).map((a) => {
                const on = a.id === value;
                return (
                  <button key={a.id} type="button" onClick={() => onPick(a.id)} aria-pressed={on} style={{ display: "grid", justifyItems: "center", gap: 8, flex: "none", width: 68 }}>
                    <span style={{ position: "relative", width: 64, height: 64, borderRadius: "50%", display: "grid", placeItems: "center", background: on ? "var(--blue-50)" : "var(--bg)", boxShadow: on ? "inset 0 0 0 1.5px var(--blue)" : "none" }}>
                      <SportIcon Icon={a.Icon} size={28} selected={on} />
                      {on && <span aria-hidden style={{ position: "absolute", top: -2, right: -2, width: 22, height: 22, borderRadius: "50%", background: "var(--blue)", color: "#fff", display: "grid", placeItems: "center", border: "2px solid #fff" }}><Check size={11} weight="bold" /></span>}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: on ? 600 : 500, color: on ? "var(--blue)" : "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 68 }}>{a.name}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        {groupOrder.map((g) => {
          const items = list.filter((a) => a.group === g);
          if (!items.length) return null;
          return (
            <section key={g}>
              <h3 className="h2" style={{ fontSize: 16, margin: "20px 0 4px", paddingTop: 16, borderTop: "1px solid var(--line)" }}>{groupInfo[g].label}</h3>
              {items.map(row)}
            </section>
          );
        })}
        {!list.length && <p className="meta" style={{ fontSize: 14, marginTop: 18 }}>No activity matches “{q}”. Try another word, like ride or gym.</p>}
      </div>
    </Sheet>
  );
}

/* ---------- Photos: a phone-gallery picker, per-photo actions and a reorder page ---------- */
type Media = { id: string; src: string };
const GALLERY = ["/img/run-sq.jpg", "/img/w/run.webp", "/img/dawn.jpg", "/img/w/trail.webp", "/img/hike.jpg", "/img/w/race.webp", "/img/ride-sq.jpg", "/img/swim-sq.jpg", "/img/yoga.jpg", "/img/w/stairs.webp", "/img/w/hike.webp", "/img/stairs.jpg"];

function GallerySheet({ have, onAdd, onClose }: { have: string[]; onAdd: (srcs: string[]) => void; onClose: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const file = useRef<HTMLInputElement>(null);
  const toggle = (s: string) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  return (
    <Sheet id="gallery" title="Add photos or videos" sub="Pick from your recent photos, in the order you want them." onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, marginTop: 14, borderRadius: 16, overflow: "hidden" }}>
        {GALLERY.map((s) => {
          const n = picked.indexOf(s), added = have.includes(s);
          return (
            <button key={s} type="button" disabled={added} aria-pressed={n >= 0} aria-label={added ? "Already added" : n >= 0 ? `Photo ${n + 1} selected` : "Select photo"} onClick={() => toggle(s)}
              style={{ position: "relative", aspectRatio: "1", padding: 0, overflow: "hidden", opacity: added ? 0.4 : 1 }}>
              <img src={s} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: n >= 0 ? "scale(0.9)" : "none", borderRadius: n >= 0 ? 10 : 0, transition: "transform .2s var(--ease), border-radius .2s" }} />
              <span aria-hidden className="num" style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700,
                background: n >= 0 ? "var(--blue)" : "rgba(11,18,32,0.25)", border: "2px solid #fff", color: "#fff" }}>{n >= 0 ? n + 1 : added ? <Check size={11} weight="bold" /> : ""}</span>
            </button>
          );
        })}
      </div>
      <input ref={file} type="file" accept="image/*,video/*" multiple hidden
        onChange={(e) => { const f = [...(e.target.files ?? [])].map((x) => URL.createObjectURL(x)); if (f.length) { onAdd(f); onClose(); } }} />
      <button type="button" className="link" style={{ marginTop: 14 }} onClick={() => file.current?.click()}>Browse all files</button>
      <button type="button" className="btn btn-blue" disabled={!picked.length} style={{ width: "100%", marginTop: 14 }} onClick={() => { onAdd(picked); onClose(); }}>
        {picked.length ? `Add ${picked.length} photo${picked.length > 1 ? "s" : ""}` : "Select photos"}
      </button>
    </Sheet>
  );
}

function MediaActions({ isHighlight, onHighlight, onDelete, onClose }: { isHighlight: boolean; onHighlight: () => void; onDelete: () => void; onClose: () => void }) {
  const opt = (Icon: typeof Star, t: string, on: () => void, danger?: boolean) => (
    <button type="button" onClick={() => { on(); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", height: 56, textAlign: "left", fontSize: 16, fontWeight: 500, color: danger ? "#d92d20" : "var(--ink)" }}>
      <Icon size={24} weight={danger ? "regular" : "duotone"} />{t}
    </button>
  );
  return (
    <Sheet id="media-actions" title="Photo" onClose={onClose}>
      <div style={{ marginTop: 6 }}>
        {!isHighlight && opt(Star, "Set as highlight", onHighlight)}
        {opt(Trash, "Delete", onDelete, true)}
      </div>
    </Sheet>
  );
}

const HighlightTag = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 22, padding: "0 8px", borderRadius: 11, background: "var(--blue)", color: "#fff", fontSize: 11, fontWeight: 600 }}>
    <Star size={11} weight="fill" aria-hidden />Highlight
  </span>
);

function ReorderRow({ m, highlight, onMore }: { m: Media; highlight: boolean; onMore: () => void }) {
  const drag = useDragControls();
  return (
    <Reorder.Item value={m} dragListener={false} dragControls={drag}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--line)", background: "#fff", listStyle: "none", position: "relative" }}
      whileDrag={{ scale: 1.02, boxShadow: "0 18px 36px -18px rgba(11,18,32,0.45)", borderRadius: 16 }}>
      <img src={m.src} alt="" draggable={false} style={{ width: 76, height: 100, borderRadius: 12, objectFit: "cover", flex: "none" }} />
      <span style={{ flex: 1, display: "grid", gap: 8, justifyItems: "start" }}>
        {highlight && <HighlightTag />}
        <button type="button" aria-label="Photo options" onClick={onMore} className="icon-btn" style={{ border: 0, width: 36, height: 36, marginLeft: -8 }}><DotsThree size={24} weight="bold" /></button>
      </span>
      <button type="button" aria-label="Drag to reorder" onPointerDown={(e) => drag.start(e)}
        style={{ width: 44, height: 56, display: "grid", placeItems: "center", color: "var(--gray)", touchAction: "none", cursor: "grab" }}>
        <DotsSixVertical size={26} weight="bold" />
      </button>
    </Reorder.Item>
  );
}

/* ---------- A full page that slides in over the form (metrics, location, photo order) ---------- */
function Page({ title, onBack, right, children }: { title: string; onBack: () => void; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 40 }}
      role="dialog" aria-label={title} style={{ position: "absolute", inset: 0, zIndex: 20, background: "#fff", overflowY: "auto" }}>
      <StatusBar />
      <header className="pad" style={{ position: "sticky", top: 0, zIndex: 2, background: "#fff", paddingTop: 52, paddingBottom: 10, display: "grid", gridTemplateColumns: "64px 1fr 64px", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
        <button type="button" className="icon-btn" aria-label="Back" onClick={onBack} style={{ border: 0, marginLeft: -10 }}><ArrowLeft size={22} /></button>
        <h2 style={{ textAlign: "center", fontSize: 17, fontWeight: 600 }}>{title}</h2>
        <span style={{ justifySelf: "end" }}>{right}</span>
      </header>
      {children}
    </motion.div>
  );
}

/* ---------- Date and time, two separate fields (nothing in the future) ---------- */
const H12 = Array.from({ length: 12 }, (_, i) => String(i + 1));
const M60 = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const dateName = (d: Date, now: Date) => {
  const y = new Date(now); y.setDate(y.getDate() - 1);
  const full = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return sameDay(d, now) ? `Today, ${full}` : sameDay(d, y) ? `Yesterday, ${full}` : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};
const dayShort = (d: Date, now: Date) => {
  const y = new Date(now); y.setDate(y.getDate() - 1);
  return sameDay(d, now) ? "Today" : sameDay(d, y) ? "Yesterday" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric" });
};
const timeName = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

function DateSheet({ value, now, onSave, onClose }: { value: Date; now: Date; onSave: (d: Date) => void; onClose: () => void }) {
  const [sel, setSel] = useState(value);
  const [view, setView] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));
  const first = (view.getDay() + 6) % 7; // weeks start on Monday
  const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const atNow = view.getFullYear() === now.getFullYear() && view.getMonth() === now.getMonth();
  const shift = (n: number) => setView(new Date(view.getFullYear(), view.getMonth() + n, 1));
  return (
    <Sheet id="date" title="Date" sub="When did you do it?" onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
        <button type="button" className="icon-btn" aria-label="Previous month" onClick={() => shift(-1)} style={{ border: 0 }}><CaretLeft size={20} /></button>
        <p style={{ fontSize: 16, fontWeight: 600 }} aria-live="polite">{view.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        <button type="button" className="icon-btn" aria-label="Next month" disabled={atNow} onClick={() => shift(1)} style={{ border: 0, opacity: atNow ? 0.3 : 1 }}><CaretRight size={20} /></button>
      </div>
      <div role="grid" aria-label="Choose a date" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginTop: 8 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} aria-hidden className="meta" style={{ textAlign: "center", fontSize: 12, fontWeight: 600, padding: "6px 0" }}>{d}</span>)}
        {Array.from({ length: first }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: count }, (_, i) => {
          const d = new Date(view.getFullYear(), view.getMonth(), i + 1);
          const future = d > now && !sameDay(d, now), on = sameDay(d, sel), today = sameDay(d, now);
          return (
            <button key={i} type="button" disabled={future} aria-pressed={on} aria-label={d.toDateString()} onClick={() => setSel(d)} className="num"
              style={{ height: 42, borderRadius: 21, fontSize: 15, fontWeight: on || today ? 650 : 500, opacity: future ? 0.28 : 1,
                background: on ? "var(--blue)" : "transparent", color: on ? "#fff" : today ? "var(--blue)" : "var(--ink)", boxShadow: today && !on ? "inset 0 0 0 1.5px var(--blue)" : "none" }}>
              {i + 1}
            </button>
          );
        })}
      </div>
      <button type="button" className="btn btn-blue" style={{ width: "100%", marginTop: 18 }} onClick={() => { onSave(sel); onClose(); }}>Set date</button>
    </Sheet>
  );
}

function ClockSheet({ value, now, onSave, onClose }: { value: Date; now: Date; onSave: (d: Date) => void; onClose: () => void }) {
  const [h, setH] = useState((value.getHours() + 11) % 12);
  const [mi, setMi] = useState(value.getMinutes());
  const [pm, setPm] = useState(value.getHours() >= 12 ? 1 : 0);
  const at = new Date(value); at.setHours(((h + 1) % 12) + pm * 12, mi, 0, 0);
  const future = at > now;
  return (
    <Sheet id="clock" title="Start time" sub="What time did you start?" onClose={onClose}>
      <div style={{ position: "relative", marginTop: 12 }}>
        <WheelBand />
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 0.3fr 1fr 1fr", alignItems: "center" }}>
          <Wheel big label="Hour" items={H12} index={h} onChange={setH} />
          <span aria-hidden style={{ fontSize: 24, fontWeight: 650, textAlign: "center" }}>:</span>
          <Wheel big label="Minute" items={M60} index={mi} onChange={setMi} />
          <Wheel label="AM or PM" items={["AM", "PM"]} index={pm} onChange={setPm} />
        </div>
      </div>
      <p className="num" aria-live="polite" style={{ textAlign: "center", marginTop: 10, fontSize: 15, fontWeight: 600, color: future ? "#d92d20" : "var(--ink)" }}>
        {future ? "That time hasn't happened yet today" : timeName(at)}
      </p>
      <button type="button" className="btn btn-blue" disabled={future} style={{ width: "100%", marginTop: 14 }} onClick={() => { onSave(at); onClose(); }}>Set time</button>
    </Sheet>
  );
}

/* ---------- Small pickers for the optional rows ---------- */
type Opt = { label: string; Icon?: typeof Star };
function AddOwn({ placeholder, onAdd }: { placeholder: string; onAdd: (v: string) => void }) {
  const [v, setV] = useState("");
  const add = () => { if (v.trim()) { onAdd(v.trim()); setV(""); } };
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
      <input className="input" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder={placeholder} aria-label={placeholder} style={{ flex: 1 }} />
      <button type="button" className="btn btn-soft" disabled={!v.trim()} onClick={add} style={{ padding: "0 18px" }}>Add</button>
    </div>
  );
}

/* ---------- Metric input sheets ---------- */
function NumberSheet({ title, sub, label, suffix, decimals, units, unit, value, onSave, onRemove, onClose }: {
  title: string; sub?: string; label: string; suffix?: string; decimals?: boolean; units?: string[]; unit?: string; value: number; onSave: (v: number, u?: string) => void; onRemove: () => void; onClose: () => void;
}) {
  const [v, setV] = useState(value);
  const [u, setU] = useState(unit);
  return (
    <Sheet id="num" title={title} sub={sub} onClose={onClose}>
      <div style={{ marginTop: 14 }}>
        <NumField id="num-in" label={label} value={v} onChange={setV} decimals={decimals} suffix={units ? undefined : suffix} units={units} unit={u} onUnit={setU} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: value > 0 ? "1fr 2fr" : "1fr", gap: 8, marginTop: 16 }}>
        {value > 0 && <button type="button" className="btn btn-soft" style={{ color: "#d92d20" }} onClick={() => { onRemove(); onClose(); }}>Remove</button>}
        <button type="button" className="btn btn-blue" disabled={!(v > 0)} onClick={() => { onSave(v, u); onClose(); }}>Save</button>
      </div>
    </Sheet>
  );
}

function IntervalsSheet({ value, onSave, onClose }: { value: { reps: number; m: number }[]; onSave: (v: { reps: number; m: number }[]) => void; onClose: () => void }) {
  const [list, setList] = useState(value.length ? value : [{ reps: 0, m: 0 }]);
  const set = (i: number, k: "reps" | "m", v: number) => setList(list.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <Sheet id="intervals" title="Mixed intervals" sub="Add each set of efforts, like 6 × 400 m." onClose={onClose}>
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {list.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 36px", gap: 8, alignItems: "end" }}>
            <NumField id={`iv-r-${i}`} label={`Set ${i + 1}`} value={s.reps} onChange={(v) => set(i, "reps", v)} suffix="reps" />
            <NumField id={`iv-m-${i}`} label="Each" value={s.m} onChange={(v) => set(i, "m", v)} suffix="m" />
            <button type="button" aria-label={`Remove set ${i + 1}`} disabled={list.length === 1} onClick={() => setList(list.filter((_, j) => j !== i))} style={{ height: 52, color: "var(--gray)", opacity: list.length === 1 ? 0.3 : 1 }}><X size={18} /></button>
          </div>
        ))}
        <button type="button" className="link" onClick={() => setList([...list, { ...list[list.length - 1] }])}><Plus size={16} weight="bold" />Add another set</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: value.length ? "1fr 2fr" : "1fr", gap: 8, marginTop: 16 }}>
        {value.length > 0 && <button type="button" className="btn btn-soft" style={{ color: "#d92d20" }} onClick={() => { onSave([]); onClose(); }}>Remove</button>}
        <button type="button" className="btn btn-blue" disabled={!list.some((x) => x.reps > 0)} onClick={() => { onSave(list.filter((x) => x.reps > 0)); onClose(); }}>Save intervals</button>
      </div>
    </Sheet>
  );
}

/* ---------- What each sport records (spec: goal metrics + additional entry metrics) ---------- */
type Extra = "intervals" | "hr" | "cal" | "pace" | "elev" | "cad";
const RUNS = ["run", "hillrun", "trail", "vrun"], WALKS = ["walk", "hike", "trek"];
const RIDES = ["cycle", "mtb", "gravel", "vride", "ebike", "emtb", "handcycle"];
function extrasFor(a: Activity): Extra[] {
  if (a.id === "meditation" || a.id === "weightmgmt") return [];
  if (RUNS.includes(a.id) || RIDES.includes(a.id)) return ["intervals", "hr", "cal", "pace", "elev", "cad"];
  if (a.id === "velomobile") return ["intervals", "hr", "cal", "pace", "elev"];
  if (WALKS.includes(a.id)) return ["hr", "cal", "pace", "elev", "cad"];
  if (a.id === "wheelchair") return ["hr", "cal", "pace", "elev"];
  if (["swim", "row", "vrow"].includes(a.id)) return ["intervals", "hr", "cal", "pace"];
  if (["elliptical", "skate", "rollerski"].includes(a.id)) return ["hr", "cal", "pace"];
  if (a.group === "Snow") return ["hr", "cal", "elev"];
  return ["hr", "cal"];
}
// goal metrics you type in for one entry: sessions is the entry itself, performance comes from distance and time
type Entry = "distance" | "duration" | "reps" | "laps" | "steps" | "count" | "weight";
const entryFor = (a: Activity): Entry[] => {
  const m = a.metrics.filter((x): x is Entry => x !== "sessions" && x !== "performance");
  if (a.metrics.includes("performance")) for (const need of ["distance", "duration"] as const) if (!m.includes(need)) m.push(need);
  return m;
};
const ENTRY_LABEL: Record<Entry, string> = { distance: "distance", duration: "time", reps: "reps", laps: "laps", steps: "steps", count: "skips", weight: "weight" };

// Microsoft Fluent Emoji (3D), served from the fluentui-emoji repo
const fluent = (name: string) => `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/${encodeURIComponent(name)}/3D/${name.toLowerCase().replace(/ /g, "_")}_3d.png`;
const FEELS = [["Awful", fluent("Weary face")], ["Poor", fluent("Slightly frowning face")], ["Okay", fluent("Neutral face")], ["Good", fluent("Slightly smiling face")], ["Amazing", fluent("Smiling face with heart-eyes")]] as const;
const MARKS: Opt[] = [{ label: "Favorite", Icon: Star }, { label: "Personal best", Icon: Trophy }, { label: "Race day", Icon: FlagCheckered }, { label: "Milestone", Icon: Medal }];
const WITH: Opt[] = [{ label: "Solo" }, { label: "With friends" }, { label: "With family" }, { label: "With my club" }, { label: "With a coach" }];
const partOfDay = (d: Date) => { const h = d.getHours(); return h < 12 ? "Morning" : h < 17 ? "Afternoon" : h < 21 ? "Evening" : "Night"; };

type SheetId = null | "act" | "gallery" | "date" | "clock" | "dist" | "time" | "more" | "intervals" | `num:${string}`;

export default function AddActivity({ go }: { go: (r: Route) => void }) {
  const now = useMemo(() => new Date(), []);
  const [actId, setActId] = useState("run");
  const act = byId(actId);
  const [title, setTitle] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [when, setWhen] = useState(now);
  // metrics
  const [dist, setDist] = useState({ v: 0, u: "km" });
  const [time, setTime] = useState(0);
  const [n, setN] = useState<Record<string, number>>({});
  const num = (k: string) => n[k] ?? 0;
  const setNum = (k: string) => (v: number) => setN((x) => ({ ...x, [k]: v }));
  const [weightU, setWeightU] = useState("kg");
  const [intervals, setIntervals] = useState<{ reps: number; m: number }[]>([]);
  // details
  const [placeName, setPlaceName] = useState("");
  const [feel, setFeel] = useState<string | null>(null);
  const [mark, setMark] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagList, setTagList] = useState(["Easy", "Tempo", "Long", "Recovery", "Race", "Intervals", "Commute", "Trail", "Cardio", "Endurance", "Group"]);
  const [gearList, setGearList] = useState(["Nike Pegasus 41", "Salomon Speedcross 5", "Trek Domane AL 2"]);
  const [gear, setGear] = useState<string | null>(null);
  const [withWhom, setWithWhom] = useState<string | null>(null);
  const goals = [goal, ...otherGoals];
  const autoGoal = goals.find((g) => g.activity === actId)?.title ?? null;
  const [linked, setLinked] = useState<string | null | undefined>(undefined); // undefined: follow the sport
  const goalName = linked === undefined ? autoGoal : linked;
  const [notes, setNotes] = useState("");

  const [sheet, setSheet] = useState<SheetId>(null);
  const [page, setPage] = useState<null | "order">(null);
  const [actionsFor, setActionsFor] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const metricsRow = useRef<HTMLElement>(null);
  const placeRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (addWith.photos) { addWith.photos = false; setSheet("gallery"); } }, []);

  const entries = entryFor(act);
  const extras = extrasFor(act);
  const pickAct = (id: string) => { setActId(id); setSheet(null); setLinked(undefined); };

  const addMedia = (srcs: string[]) => setMedia((m) => {
    const next = [...m, ...srcs.map((src, i) => ({ id: `${Date.now()}-${i}`, src }))];
    if (!highlight && next.length) setHighlight(next[0].id);
    return next;
  });
  const removeMedia = (id: string) => setMedia((m) => {
    const next = m.filter((x) => x.id !== id);
    if (highlight === id) setHighlight(next[0]?.id ?? null);
    if (next.length < 2 && page === "order") setPage(null);
    return next;
  });
  const makeHighlight = (id: string) => { setHighlight(id); setMedia((m) => [m.find((x) => x.id === id)!, ...m.filter((x) => x.id !== id)]); };

  // values, in the order they appear
  const has: Record<Entry, boolean> = { distance: dist.v > 0, duration: time > 0, reps: num("reps") > 0, laps: num("laps") > 0, steps: num("steps") > 0, count: num("count") > 0, weight: num("weight") > 0 };
  const km = dist.u === "m" ? dist.v / 1000 : dist.v;
  const pace = dist.v > 0 && time > 0 ? time / (dist.u === "mi" ? dist.v : km) : 0;
  const paceText = pace ? `${Math.floor(pace / 60)}:${String(Math.round(pace % 60)).padStart(2, "0")}` : "";
  const paceUnit = dist.u === "mi" ? "/mi" : "/km";
  const cadUnit = act.group === "Cycling" ? "rpm" : "spm";
  const extraHas: Record<Extra, boolean> = { intervals: intervals.some((i) => i.reps > 0), hr: num("hr") > 0, cal: num("cal") > 0, pace: pace > 0, elev: num("elev") > 0, cad: num("cad") > 0 };
  const goalFilled = entries.some((e) => has[e]);
  const optionalDone = !!(title.trim() || notes || media.length || placeName || feel || mark || tags.length || gear || withWhom || extras.some((x) => x !== "pace" && extraHas[x]));
  const needs = entries.map((e) => ENTRY_LABEL[e]);
  const needsText = needs.length > 2 ? `${needs.slice(0, -1).join(", ")} or ${needs[needs.length - 1]}` : needs.join(" or ");

  // the band under the title: up to three of what was entered
  const stats: { label: string; v: string; u?: string; Icon: typeof Star }[] = [];
  if (has.distance) stats.push({ label: "Distance", v: fmtN(dist.v), u: dist.u, Icon: METRICS.distance.Icon as typeof Star });
  if (has.duration) stats.push({ label: "Duration", v: fmtTime(time), Icon: METRICS.duration.Icon as typeof Star });
  if (pace && extras.includes("pace")) stats.push({ label: "Pace", v: paceText, u: paceUnit, Icon: Gauge });
  for (const e of ["reps", "laps", "steps", "count"] as const) if (has[e]) stats.push({ label: e === "count" ? "Skips" : METRICS[e].label, v: fmtN(num(e)), Icon: METRICS[e].Icon as typeof Star });
  if (has.weight) stats.push({ label: "Body weight", v: fmtN(num("weight")), u: weightU, Icon: METRICS.weight.Icon as typeof Star });
  if (extraHas.hr) stats.push({ label: "Heart rate", v: fmtN(num("hr")), u: "bpm", Icon: Heartbeat });
  if (extraHas.cal) stats.push({ label: "Calories", v: fmtN(num("cal")), u: "kcal", Icon: Fire });

  const save = () => {
    setTried(true);
    if (goalFilled) return finish();
    if (optionalDone) return setConfirm(true);
    metricsRow.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const finish = () => { setConfirm(false); setSaved(true); setTimeout(() => go("home"), 1500); };
  const metricsErr = tried && !goalFilled && !optionalDone;

  const autoTitle = `${partOfDay(when)} ${act.name.toLowerCase()}`.replace(/^\w/, (c) => c.toUpperCase());
  const setDate = (d: Date) => { const x = new Date(d); x.setHours(when.getHours(), when.getMinutes(), 0, 0); setWhen(x > now ? now : x); };

  type IconT = typeof Star;
  const NUM: Record<string, { label: string; title: string; suffix?: string; decimals?: boolean; units?: string[]; Icon: IconT }> = {
    reps: { label: "Reps", title: "Reps", suffix: "reps", Icon: METRICS.reps.Icon as IconT },
    laps: { label: "Laps", title: "Laps", suffix: "laps", Icon: METRICS.laps.Icon as IconT },
    steps: { label: "Steps", title: "Steps", suffix: "steps", Icon: METRICS.steps.Icon as IconT },
    count: { label: "Skips", title: "Skips", suffix: "skips", Icon: METRICS.count.Icon as IconT },
    weight: { label: "Body weight", title: "Body weight", decimals: true, units: ["kg", "lb"], Icon: METRICS.weight.Icon as IconT },
    hr: { label: "Heart rate", title: "Average heart rate", suffix: "bpm", Icon: Heartbeat },
    cal: { label: "Calories", title: "Calories burned", suffix: "kcal", Icon: Fire },
    elev: { label: "Elevation gain", title: "Elevation gain", suffix: "m", Icon: Mountains },
    cad: { label: "Cadence", title: "Average cadence", suffix: cadUnit, Icon: Metronome },
  };
  const unitOf = (k: string) => (k === "weight" ? weightU : NUM[k]?.suffix);
  const openFor = (k: string) => () => setSheet(k === "distance" ? "dist" : k === "duration" ? "time" : k === "intervals" ? "intervals" : `num:${k}`);
  const clearFor = (k: string) => () => (k === "distance" ? setDist({ ...dist, v: 0 }) : k === "duration" ? setTime(0) : k === "intervals" ? setIntervals([]) : setNum(k)(0));
  const tileKeys: string[] = [...entries, ...(act.id === "weightmgmt" ? ["duration"] : [])];
  const tiles = tileKeys.map((k) => ({
    key: k, goal: (entries as string[]).includes(k), open: openFor(k),
    label: k === "distance" ? "Distance" : k === "duration" ? "Duration" : NUM[k].label,
    Icon: (k === "distance" ? METRICS.distance.Icon : k === "duration" ? METRICS.duration.Icon : NUM[k].Icon) as IconT,
    done: k === "distance" ? has.distance : k === "duration" ? has.duration : num(k) > 0,
  }));
  if (extras.length) tiles.push({ key: "more", goal: false, open: () => setSheet("more"), label: "More", Icon: DotsThree, done: extras.some((x) => x !== "pace" && extraHas[x]) });
  const added: { key: string; label: string; value: string; unit?: string; Icon: IconT; open?: () => void; clear?: () => void }[] = [];
  for (const k of tileKeys) {
    if (k === "distance" && has.distance) added.push({ key: k, label: "Distance", value: fmtN(dist.v), unit: dist.u, Icon: METRICS.distance.Icon as IconT, open: openFor(k), clear: clearFor(k) });
    else if (k === "duration" && has.duration) added.push({ key: k, label: "Duration", value: fmtTime(time), Icon: METRICS.duration.Icon as IconT, open: openFor(k), clear: clearFor(k) });
    else if (NUM[k] && num(k) > 0) added.push({ key: k, label: NUM[k].label, value: fmtN(num(k)), unit: unitOf(k), Icon: NUM[k].Icon, open: openFor(k), clear: clearFor(k) });
  }
  if (extras.includes("pace") && pace) added.push({ key: "pace", label: "Pace", value: paceText, unit: paceUnit, Icon: Gauge });
  for (const k of extras) if (NUM[k] && num(k) > 0) added.push({ key: k, label: NUM[k].label, value: fmtN(num(k)), unit: unitOf(k), Icon: NUM[k].Icon, open: openFor(k), clear: clearFor(k) });
  if (extraHas.intervals) added.push({ key: "intervals", label: "Mixed intervals", value: intervals.map((i) => `${i.reps}×${i.m || "?"}`).join(", "), unit: "m", Icon: Repeat, open: openFor("intervals"), clear: clearFor("intervals") });
  const numKey = typeof sheet === "string" && sheet.startsWith("num:") ? sheet.slice(4) : null;

  const head = (t: string, opt?: boolean) => <h2 className="h2" style={{ fontSize: 18, margin: "28px 0 12px" }}>{t}{opt && <span className="meta" style={{ fontSize: 14, fontWeight: 500, marginLeft: 6 }}>Optional</span>}</h2>;
  const chips = (label: string, opts: Opt[], isOn: (o: string) => boolean, toggle: (o: string) => void) => (
    <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {opts.map(({ label: o, Icon }) => {
        const on = isOn(o);
        return (
          <button key={o} type="button" className="chip" aria-pressed={on} onClick={() => toggle(o)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {Icon && <Icon size={16} weight={on ? "fill" : "regular"} aria-hidden />}{o}
          </button>
        );
      })}
    </div>
  );

  const hero = media[0];
  const thumbs = media.slice(1, 4);
  const more = media.length - 4;

  return (
    <>
    <div className="body" style={{ background: "#fff" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 5, background: "#fff" }}>
        <StatusBar />
        <header className="pad" style={{ paddingTop: 52, paddingBottom: 10, display: "grid", gridTemplateColumns: "44px 1fr 44px", alignItems: "center" }}>
          <button className="icon-btn" aria-label="Back" onClick={() => go("home")} style={{ border: 0, marginLeft: -10 }}><ArrowLeft size={22} /></button>
          <h1 style={{ textAlign: "center", fontSize: 17, fontWeight: 600 }}>Add activity</h1>
        </header>
      </div>

      <div className="pad" style={{ paddingTop: 6, paddingBottom: 132 }}>
        {/* photos */}
        {!hero ? (
          <button type="button" onClick={() => setSheet("gallery")} aria-label="Add photos or videos"
            style={{ position: "relative", width: "100%", height: 196, borderRadius: 20, overflow: "hidden", background: "linear-gradient(180deg, #EEF3FD 0%, #E3ECFB 100%)", display: "grid", placeItems: "center", alignContent: "center", gap: 6, padding: "0 24px" }}>
            <svg aria-hidden viewBox="0 0 340 90" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: 90 }}>
              <path d="M0 90 L0 60 L70 22 L130 55 L200 8 L270 48 L340 30 L340 90 Z" fill="#D6E2F7" />
            </svg>
            <ImageSquare size={40} color="#6B7A99" style={{ position: "relative" }} />
            <span style={{ position: "relative", fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>No photos or videos yet</span>
            <span style={{ position: "relative", fontSize: 13, color: "var(--gray)" }}>Add photos to bring your activity to life.</span>
          </button>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <button type="button" onClick={() => setActionsFor(hero.id)} aria-label="Highlight photo, options"
              style={{ position: "relative", width: "100%", height: 196, padding: 0, borderRadius: 20, overflow: "hidden" }}>
              <img src={hero.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <span style={{ position: "absolute", left: 10, top: 10 }}><HighlightTag /></span>
              <span className="num" style={{ position: "absolute", right: 10, top: 10, display: "inline-flex", alignItems: "center", gap: 5, height: 26, padding: "0 9px", borderRadius: 8, background: "rgba(11,18,32,0.55)", color: "#fff", fontSize: 12, fontWeight: 600 }}>
                <Images size={14} aria-hidden />1 / {media.length}
              </span>
            </button>
            {thumbs.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {thumbs.map((m, i) => {
                  const last = i === 2 && more > 0;
                  return (
                    <button key={m.id} type="button" onClick={() => (last ? setPage("order") : setActionsFor(m.id))} aria-label={last ? `${more} more photos, edit order` : "Photo, options"}
                      style={{ position: "relative", height: 64, padding: 0, borderRadius: 12, overflow: "hidden" }}>
                      <img src={m.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      {last && <span className="num" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(11,18,32,0.5)", color: "#fff", fontSize: 17, fontWeight: 650 }}>+{more}</span>}
                    </button>
                  );
                })}
                <button type="button" onClick={() => setSheet("gallery")} aria-label="Add more photos"
                  style={{ gridColumn: 4, height: 64, borderRadius: 12, border: "1.5px dashed #8DB4FF", background: "var(--blue-50)", color: "var(--blue)", display: "grid", placeItems: "center" }}>
                  <Plus size={22} weight="bold" />
                </button>
              </div>
            )}
            {media.length > 1 && <button type="button" className="link" style={{ justifySelf: "end", fontSize: 14 }} onClick={() => setPage("order")}>Edit order</button>}
          </div>
        )}

        {/* who, what, when, where */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
          <button type="button" onClick={() => setSheet("act")} aria-label={`Activity, ${act.name}. Change`}
            style={{ width: 64, height: 64, flex: "none", borderRadius: "50%", background: "var(--blue-50)", display: "grid", placeItems: "center" }}>
            <SportIcon Icon={act.Icon} size={30} selected />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={autoTitle} aria-label="Title" maxLength={80}
              style={{ width: "100%", border: 0, outline: "none", padding: 0, fontSize: 22, fontWeight: 650, letterSpacing: "-0.02em", color: "var(--ink)", background: "transparent" }} />
            <p className="meta num" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginTop: 4 }}>
              <CalendarBlank size={15} aria-hidden />{when.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {timeName(when)}
            </p>
            <button type="button" onClick={() => { placeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); placeRef.current?.focus({ preventScroll: true }); }} className="meta" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginTop: 4, color: placeName ? "var(--ink)" : "var(--gray)" }}>
              <MapPin size={15} weight={placeName ? "fill" : "regular"} aria-hidden />{placeName || "Add location"}
            </button>
          </div>
        </div>

        {!hero && (
          <button type="button" className="btn btn-soft" onClick={() => setSheet("gallery")} style={{ width: "100%", marginTop: 16, height: 50, gap: 8, fontSize: 15 }}>
            <Plus size={18} weight="bold" />Add photos or videos
          </button>
        )}

        {/* what was entered, at a glance */}
        <AnimatePresence initial={false}>
          {stats.length > 0 && (
            <motion.div key="stats" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(3, stats.length)}, 1fr)`, marginTop: 16, padding: "12px 4px", borderRadius: 16, background: "var(--bg)" }}>
                {stats.slice(0, 3).map((s, i) => (
                  <div key={s.label} style={{ padding: "0 12px", borderLeft: i ? "1px solid var(--line)" : 0 }}>
                    <p className="meta" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}><s.Icon size={14} aria-hidden />{s.label}</p>
                    <p className="num" style={{ fontSize: 19, fontWeight: 650, marginTop: 4, whiteSpace: "nowrap" }}>{s.v}{s.u && <span style={{ fontSize: 13, fontWeight: 500, marginLeft: 3 }}>{s.u}</span>}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* the sport */}
        <span className="flabel" style={{ marginTop: 22 }}>Activity</span>
        <button type="button" className="nf" onClick={() => setSheet("act")} aria-label={`Activity, ${act.name}. Change`} style={{ width: "100%", height: 56, padding: "0 14px", gap: 12, cursor: "pointer" }}>
          <SportIcon Icon={act.Icon} size={24} />
          <span style={{ flex: 1, textAlign: "left", fontSize: 16, fontWeight: 600 }}>{act.name}</span>
          <CaretDown size={18} color="var(--gray)" aria-hidden />
        </button>

        {/* date and time, separate */}
        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 10, marginTop: 14 }}>
          <div>
            <span className="flabel">Date</span>
            <button type="button" className="nf" onClick={() => setSheet("date")} aria-label={`Date, ${dateName(when, now)}. Change`} style={{ width: "100%", height: 52, padding: "0 12px", gap: 10, cursor: "pointer" }}>
              <CalendarBlank size={20} aria-hidden />
              <span className="num" style={{ flex: 1, textAlign: "left", fontSize: 15, fontWeight: 600, whiteSpace: "nowrap" }}>{dayShort(when, now)}</span>
            </button>
          </div>
          <div>
            <span className="flabel">Time</span>
            <button type="button" className="nf" onClick={() => setSheet("clock")} aria-label={`Time, ${timeName(when)}. Change`} style={{ width: "100%", height: 52, padding: "0 12px", gap: 10, cursor: "pointer" }}>
              <Clock size={20} aria-hidden />
              <span className="num" style={{ flex: 1, textAlign: "left", fontSize: 15, fontWeight: 600, whiteSpace: "nowrap" }}>{timeName(when)}</span>
            </button>
          </div>
        </div>

        {/* metrics from the spec: pick a type, enter it in a sheet */}
        <section ref={metricsRow}>
          {head("Choose metric type")}
          <div role="group" aria-label="Metric type" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {tiles.map((t) => (
              <button key={t.key} type="button" onClick={t.open} aria-label={t.done ? `${t.label}, added. Edit` : `Add ${t.label.toLowerCase()}`}
                style={{ position: "relative", height: 100, borderRadius: 18, display: "grid", placeItems: "center", alignContent: "center", gap: 10, padding: "0 6px", transition: "all .2s",
                  border: `1.5px solid ${t.done ? "var(--blue)" : metricsErr && t.goal ? "#fda29b" : "var(--line)"}`, background: t.done ? "var(--blue-50)" : "#fff" }}>
                {t.done && <span aria-hidden style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%", background: "var(--blue)", color: "#fff", display: "grid", placeItems: "center" }}><Check size={11} weight="bold" /></span>}
                <t.Icon size={30} weight={t.done ? "fill" : "regular"} color={t.done ? "var(--blue)" : "var(--ink)"} />
                <span style={{ fontSize: 14, fontWeight: 600, color: t.done ? "var(--blue)" : "var(--ink)", textAlign: "center", lineHeight: 1.2 }}>{t.label}</span>
              </button>
            ))}
          </div>
          {act.metrics.includes("performance") && (
            <p className="note" style={{ fontSize: 13, marginTop: 12 }}><Trophy size={16} aria-hidden style={{ flex: "none" }} />Performance and pace are worked out from your distance and time.</p>
          )}

          {head("Your metrics")}
          {added.length === 0 ? (
            <div style={{ display: "grid", placeItems: "center", gap: 8, padding: "20px 16px", borderRadius: 16, border: `1.5px dashed ${metricsErr ? "#fda29b" : "var(--line)"}`, textAlign: "center" }}>
              <Info size={24} color="var(--gray)" aria-hidden />
              <p className="meta" style={{ fontSize: 14 }}>Choose a metric type above to add your stats.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {added.map((m) => (
                <button key={m.key} type="button" disabled={!m.open} onClick={m.open} aria-label={m.open ? `${m.label}, ${m.value} ${m.unit ?? ""}. Change` : undefined}
                  style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 56, padding: "6px 14px", borderRadius: 14, border: "1px solid var(--line)", textAlign: "left", background: "#fff", opacity: 1, cursor: m.open ? "pointer" : "default" }}>
                  <m.Icon size={22} aria-hidden />
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{m.label}</span>
                  <span className="num" style={{ fontSize: 15, fontWeight: 650 }}>{m.value}{m.unit && <span style={{ fontSize: 13, fontWeight: 500, marginLeft: 3 }}>{m.unit}</span>}</span>
                  {m.open ? <CaretRight size={16} color="var(--gray)" aria-hidden /> : <span className="meta" style={{ fontSize: 12 }}>Auto</span>}
                </button>
              ))}
            </div>
          )}
          {metricsErr && fieldErr(`Add your ${needsText} to save this ${act.name.toLowerCase()}`)}
        </section>

        {head("Location", true)}
        <div style={{ position: "relative" }}>
          <MapPin size={18} color="var(--gray)" aria-hidden style={{ position: "absolute", left: 14, top: 17 }} />
          <input ref={placeRef} className="input" value={placeName} onChange={(e) => setPlaceName(e.target.value)} placeholder="Type a place, like Marina Beach" aria-label="Location" maxLength={80} style={{ paddingLeft: 42 }} />
        </div>

        {head("How did you feel?", true)}
        <div role="radiogroup" aria-label="How did you feel" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {FEELS.map(([t, src]) => {
            const on = feel === t;
            return (
              <button key={t} type="button" role="radio" aria-checked={on} onClick={() => setFeel(on ? null : t)} style={{ display: "grid", justifyItems: "center", gap: 6, padding: "4px 0" }}>
                <span style={{ width: 56, height: 56, borderRadius: "50%", display: "grid", placeItems: "center", background: on ? "var(--blue-50)" : "var(--bg)", boxShadow: on ? "inset 0 0 0 2px var(--blue)" : "none", transition: "all .2s" }}>
                  <img src={src} alt="" width={38} height={38} style={{ transform: on ? "scale(1.12)" : "none", filter: feel && !on ? "grayscale(0.6) opacity(0.7)" : "none", transition: "transform .2s var(--ease), filter .2s" }} />
                </span>
                <span style={{ fontSize: 13, fontWeight: on ? 600 : 500, color: on ? "var(--blue)" : "var(--gray)" }}>{t}</span>
              </button>
            );
          })}
        </div>

        {head("Mark this day", true)}
        {chips("Mark this day", MARKS, (o) => mark === o, (o) => setMark(mark === o ? null : o))}

        {head("Tags", true)}
        {chips("Tags", tagList.map((label) => ({ label })), (o) => tags.includes(o), (o) => setTags(tags.includes(o) ? tags.filter((x) => x !== o) : [...tags, o]))}
        <AddOwn placeholder="Add your own tag" onAdd={(t) => { if (!tagList.includes(t)) setTagList([...tagList, t]); if (!tags.includes(t)) setTags([...tags, t]); }} />

        {head("Gear", true)}
        {chips("Gear", gearList.map((label) => ({ label, Icon: Sneaker })), (o) => gear === o, (o) => setGear(gear === o ? null : o))}
        <AddOwn placeholder="Add new gear" onAdd={(g) => { setGearList((l) => (l.includes(g) ? l : [...l, g])); setGear(g); }} />

        {head("With whom", true)}
        {chips("With whom", WITH, (o) => withWhom === o, (o) => setWithWhom(withWhom === o ? null : o))}

        {head("Link to goal", true)}
        {chips("Link to goal", goals.map((g) => ({ label: g.title, Icon: Flag })), (o) => goalName === o, (o) => setLinked(goalName === o ? null : o))}

        {head("Notes", true)}
        <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it go? Add a note for yourself." aria-label="Notes" rows={4}
          style={{ height: "auto", padding: "13px 16px", lineHeight: 1.45, resize: "none", fontFamily: "inherit" }} />
      </div>

      <div style={{ position: "sticky", bottom: 0, zIndex: 5, padding: "14px 20px 28px", background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 30%)" }}>
        <button type="button" className="btn btn-blue" style={{ width: "100%" }} onClick={save}>Save activity</button>
      </div>
    </div>
    {/* overlays live outside the scrolling page, so they always sit on the screen, not the scrolled content */}

      {/* pages */}
      <AnimatePresence>
        {page === "order" && (
          <Page key="order" title="Edit order" onBack={() => setPage(null)}
            right={<button type="button" className="icon-btn" aria-label="Add photos" onClick={() => setSheet("gallery")} style={{ border: 0, marginRight: -10 }}><Plus size={22} /></button>}>
            <p className="meta pad" style={{ fontSize: 14, marginTop: 12 }}>Drag to change the order. The highlight is the photo people see first.</p>
            <Reorder.Group axis="y" values={media} onReorder={setMedia} style={{ margin: "4px 0 40px", padding: "0 20px" }}>
              {media.map((m) => <ReorderRow key={m.id} m={m} highlight={m.id === highlight} onMore={() => setActionsFor(m.id)} />)}
            </Reorder.Group>
          </Page>
        )}
      </AnimatePresence>

      {/* sheets */}
      <AnimatePresence>
        {sheet === "act" && <ActivitySheet value={actId} onPick={pickAct} onClose={() => setSheet(null)} />}
        {sheet === "gallery" && <GallerySheet have={media.map((m) => m.src)} onAdd={addMedia} onClose={() => setSheet(null)} />}
        {sheet === "date" && <DateSheet value={when} now={now} onSave={setDate} onClose={() => setSheet(null)} />}
        {sheet === "clock" && <ClockSheet value={when} now={now} onSave={setWhen} onClose={() => setSheet(null)} />}
        {sheet === "dist" && <DistanceSheet title="Distance" cta="Set distance" value={dist.v || 5} unit={dist.u} onSave={(v, u) => setDist({ v, u })} onClose={() => setSheet(null)} />}
        {sheet === "time" && <TimeSheet title="Duration" cta="Set duration" fmt="hms" value={time} onSave={setTime} onClose={() => setSheet(null)} />}
        {numKey && NUM[numKey] && (
          <NumberSheet key={numKey} title={NUM[numKey].title} label={NUM[numKey].label} suffix={NUM[numKey].suffix} decimals={NUM[numKey].decimals} units={NUM[numKey].units} unit={numKey === "weight" ? weightU : undefined}
            value={num(numKey)} onSave={(v, u) => { setNum(numKey)(v); if (numKey === "weight" && u) setWeightU(u); }} onRemove={clearFor(numKey)} onClose={() => setSheet(null)} />
        )}
        {sheet === "intervals" && <IntervalsSheet value={intervals} onSave={setIntervals} onClose={() => setSheet(null)} />}
        {sheet === "more" && (
          <Sheet id="more" title="More metrics" sub="Optional. They don't count toward a goal." onClose={() => setSheet(null)}>
            <div style={{ marginTop: 10 }}>
              {extras.map((k) => {
                const info = k === "pace" ? { label: "Pace", Icon: Gauge } : k === "intervals" ? { label: "Mixed intervals", Icon: Repeat } : NUM[k];
                const val = k === "pace" ? (pace ? `${paceText} ${paceUnit}` : "From distance and time") : k === "intervals" ? (extraHas.intervals ? `${intervals.length} set${intervals.length > 1 ? "s" : ""}` : "") : num(k) > 0 ? `${fmtN(num(k))} ${unitOf(k)}` : "";
                const auto = k === "pace";
                return (
                  <button key={k} type="button" disabled={auto} onClick={openFor(k)}
                    style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minHeight: 56, textAlign: "left", borderBottom: "1px solid var(--line)", opacity: 1, cursor: auto ? "default" : "pointer" }}>
                    <info.Icon size={24} />
                    <span style={{ flex: 1, fontSize: 16, fontWeight: 500 }}>{info.label}</span>
                    <span className="num" style={{ fontSize: 14, color: val && !(auto && !pace) ? "var(--ink)" : "var(--gray)", fontWeight: val ? 600 : 400 }}>{val || "Add"}</span>
                    {!auto && <CaretRight size={16} color="var(--gray)" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </Sheet>
        )}
        {actionsFor && (
          <MediaActions isHighlight={actionsFor === highlight} onHighlight={() => makeHighlight(actionsFor)} onDelete={() => removeMedia(actionsFor)} onClose={() => setActionsFor(null)} />
        )}
      </AnimatePresence>

      {/* only optional details are filled in: check before saving without the stats that count */}
      <AnimatePresence>
        {confirm && (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            style={{ position: "absolute", inset: 0, zIndex: 40, display: "grid", placeItems: "center", padding: 24, background: "rgba(11,18,32,0.42)" }} onClick={() => setConfirm(false)}>
            <motion.div role="alertdialog" aria-modal="true" aria-labelledby="cf-t" aria-describedby="cf-d" onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.94, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 420, damping: 32 }}
              style={{ width: "100%", borderRadius: 24, background: "#fff", padding: "22px 20px 16px", boxShadow: "0 30px 60px -20px rgba(11,18,32,0.5)" }}>
              <h2 id="cf-t" className="h2" style={{ fontSize: 19 }}>Save without your {needs.length === 1 ? needs[0] : "metrics"}?</h2>
              <p id="cf-d" className="meta" style={{ fontSize: 14, lineHeight: 1.5, marginTop: 8 }}>
                You've added the details but not your {needsText}. Without {needs.length === 1 ? "it" : "them"}, this {act.name.toLowerCase()} won't count toward {goalName ? `“${goalName}”` : "a goal"}. You can add {needs.length === 1 ? "it" : "them"} later.
              </p>
              <div style={{ display: "grid", gap: 8, marginTop: 18 }}>
                <button type="button" className="btn btn-blue" autoFocus style={{ width: "100%" }} onClick={() => { setConfirm(false); metricsRow.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Add {needs.length === 1 ? needs[0] : "metrics"}</button>
                <button type="button" className="btn btn-soft" style={{ width: "100%" }} onClick={finish}>Save anyway</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saved && (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status"
            style={{ position: "absolute", inset: 0, zIndex: 50, background: "#fff", display: "grid", placeItems: "center", alignContent: "center", gap: 14 }}>
            <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.05 }} style={{ color: "var(--blue)" }}>
              <CheckCircle size={72} weight="fill" />
            </motion.span>
            <p className="h2" style={{ fontSize: 20 }}>Activity saved</p>
            <p className="meta" style={{ fontSize: 14 }}>{title.trim() || autoTitle}, {dateName(when, now).split(",")[0]}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
