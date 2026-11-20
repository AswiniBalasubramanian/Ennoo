import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "motion/react";
import {
  ArrowLeft, CaretLeft, CaretRight, MagnifyingGlass, Check, CheckCircle, Plus, Star, Trash, DotsSixVertical, DotsThree,
  CalendarBlank, Clock, ImageSquare, Images, MapPin, CaretDown, Mountains, Metronome,
  Sneaker, Heartbeat, Fire, Gauge, Bandaids, CloudRain, Trophy, Tag, User, Target, ProhibitInset, Speedometer,
} from "@phosphor-icons/react";
import { StatusBar, SportIcon, addWith, type Route } from "../components";
import { Sheet, Wheel, WheelBand } from "../sheet";
import { activities, byId, groupInfo, groupOrder, matches, goal, otherGoals, savedPlaces, type Activity, type Place } from "../data";
import { METRICS, fmtN, fmtTime } from "../metrics";
import { TimeSheet, DistanceSheet, NumberSheet, PlacePicker, AddPlaceSheet, distIcon } from "./Onboarding";
import { AddGearPage } from "./gearAdd";
import { GEAR, PEOPLE, MARK_TOP, tagsFor, type Gear, type Person } from "../entryData";
import {
  Page, DetailRow, FeelPicker, TagSheet, MarkSheet, GearCard, GearSheet, PeopleSheet, PeopleStack, peopleText, AddPersonPage,
  GoalSheet, WhyGoal, SetsRepsPage, srText, type SR, type GoalOpt,
} from "./entryParts";

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
        style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minHeight: 60, padding: "8px 2px", marginTop: 4, textAlign: "left" }}>
        <SportIcon Icon={a.Icon} size={26} selected={on} />
        <span style={{ flex: 1, fontSize: 16, fontWeight: on ? 600 : 500, color: on ? "var(--blue)" : "var(--ink)" }}>{a.name}</span>
        {on && <Check size={20} weight="bold" color="var(--blue)" aria-hidden />}
      </button>
    );
  };
  return (
    <Sheet id="act" title="Choose activity" onClose={onClose} expandable head={
      <div style={{ position: "relative", marginTop: 14 }}>
        <MagnifyingGlass size={17} color="var(--gray)" aria-hidden style={{ position: "absolute", left: 14, top: 15 }} />
        <input type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activities" aria-label="Search activities"
          style={{ height: 46, paddingLeft: 40, background: "var(--bg)", borderColor: "transparent" }} />
      </div>
    }>
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
              <h3 className="h2" style={{ fontSize: 16, margin: "24px 0 8px", paddingTop: 20, borderTop: "1px solid var(--line)" }}>{groupInfo[g].label}</h3>
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

/* ---------- Date and time, two separate fields (nothing in the future) ---------- */
const H12 = Array.from({ length: 12 }, (_, i) => String(i + 1));
const M60 = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const dateName = (d: Date, now: Date) => {
  const y = new Date(now); y.setDate(y.getDate() - 1);
  const full = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return sameDay(d, now) ? `Today, ${full}` : sameDay(d, y) ? `Yesterday, ${full}` : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
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

/* ---------- Metric input sheets ---------- */
/* ---------- What each sport records (V1 Activities & Metrics, updated): goal metrics + additional entry metrics ---------- */
type Extra = "hr" | "cal" | "pace" | "speed" | "elev" | "cad" | "weight";
const RUNS = ["run", "hillrun", "trail", "vrun"], WALKS = ["walk", "hike", "trek"];
function extrasFor(a: Activity): Extra[] {
  const id = a.id;
  if (id === "meditation") return ["weight"];
  if (id === "weightmgmt") return ["hr", "cal"];
  if (RUNS.includes(id) || WALKS.includes(id)) return ["hr", "cal", "pace", "elev", "cad", "weight", "speed"];
  if (id === "wheelchair") return ["hr", "cal", "pace", "elev", "weight", "speed"];
  if (id === "tri") return ["hr", "cal", "weight", "speed"];
  if (a.group === "Cycling") return id === "velomobile" ? ["hr", "cal", "pace", "elev", "weight", "speed"] : ["hr", "cal", "pace", "elev", "cad", "weight", "speed"];
  if (["elliptical", "swim", "row", "vrow", "skate", "rollerski"].includes(id)) return ["hr", "cal", "pace", "weight", "speed"];
  if (["kayak", "canoe", "paddle", "surf", "sail", "skateboard", "skipping"].includes(id)) return ["hr", "cal", "weight", "speed"];
  if (a.group === "Snow") return ["hr", "cal", "elev", "weight", "speed"];
  return ["hr", "cal", "weight"];
}
// goal metrics you enter for one activity: Sessions is the entry itself, Performance comes from distance and time,
// and a Reps goal is recorded as Sets & reps
type Entry = "distance" | "duration" | "sets" | "laps" | "steps" | "count" | "weight";
const entryFor = (a: Activity): Entry[] => {
  const m: Entry[] = [];
  for (const x of a.metrics) if (x !== "sessions" && x !== "performance") m.push(x === "reps" ? "sets" : x);
  if (a.metrics.includes("performance")) for (const need of ["distance", "duration"] as const) if (!m.includes(need)) m.push(need);
  return m;
};
const gearKindFor = (a: Activity): "shoe" | "bike" | null => (RUNS.includes(a.id) ? "shoe" : a.group === "Cycling" ? "bike" : null);
const partOfDay = (d: Date) => { const h = d.getHours(); return h < 12 ? "Morning" : h < 17 ? "Afternoon" : h < 21 ? "Evening" : "Night"; };
// the metric types you used last time for each sport come first next time
const LAST_KEY = "ennoo.lastMetrics";
const readLast = (): Record<string, string[]> => { try { return JSON.parse(localStorage.getItem(LAST_KEY) ?? "{}"); } catch { return {}; } };

type SheetId = null | "act" | "gallery" | "date" | "clock" | "dist" | "time" | "pace" | "more" | "tags" | "marks" | "gear" | "people" | "goal" | "loc" | "newplace" | `num:${string}`;

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
  const [sr, setSr] = useState<SR | null>(null);
  const [paceIn, setPaceIn] = useState(0);
  // details
  const [place, setPlace] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>(savedPlaces);
  const [feel, setFeel] = useState<string | null>(null);
  const [marks, setMarks] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [gearList, setGearList] = useState<Gear[]>(GEAR);
  const [gearSel, setGearSel] = useState<string | null | undefined>(undefined); // undefined: your usual gear for the sport
  const [people, setPeople] = useState<Person[]>(PEOPLE);
  const [withIds, setWithIds] = useState<string[]>([]);
  const goals: GoalOpt[] = [{ title: goal.title, activity: goal.activity, primary: true }, ...otherGoals.map((g) => ({ title: g.title, activity: g.activity }))];
  const autoGoal = goals.find((g) => g.activity === actId)?.title ?? null;
  const [linked, setLinked] = useState<string | null | undefined>(undefined); // undefined: follow the sport
  const goalName = linked === undefined ? autoGoal : linked;
  const [notes, setNotes] = useState("");
  const [lastUsed] = useState(readLast);

  const [sheet, setSheet] = useState<SheetId>(null);
  const [page, setPage] = useState<null | "order" | "sets" | "person" | "gear">(null);
  const [actionsFor, setActionsFor] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [askRemove, setAskRemove] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ label: string; restore: () => void } | null>(null);
  const undoTimer = useRef<number>(0);

  useEffect(() => { if (addWith.photos) { addWith.photos = false; setSheet("gallery"); } }, []);

  const entries = entryFor(act);
  const extras = extrasFor(act).filter((x) => !(entries as string[]).includes(x));
  const gearKind = gearKindFor(act);
  const kindGear = gearList.filter((g) => g.kind === gearKind || g.uses?.includes(actId));
  const gearId = gearSel === undefined ? kindGear[0]?.id ?? null : gearSel;
  const gearPicked = kindGear.find((g) => g.id === gearId) ?? null;
  const withList = withIds.map((id) => people.find((p) => p.id === id)!).filter(Boolean);
  const pickAct = (id: string) => { setActId(id); setSheet(null); setLinked(undefined); setGearSel(undefined); setTags((t) => t.filter((x) => tagsFor(id).includes(x) || customTags.includes(x))); };

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

  // values
  const has: Record<Entry, boolean> = { distance: dist.v > 0, duration: time > 0, sets: !!sr, laps: num("laps") > 0, steps: num("steps") > 0, count: num("count") > 0, weight: num("weight") > 0 };
  const km = dist.u === "m" ? dist.v / 1000 : dist.v;
  const per = dist.u === "mi" ? dist.v : km;
  const autoPace = dist.v > 0 && time > 0 ? time / per : 0;
  const pace = autoPace || paceIn;
  const paceText = pace ? `${Math.floor(pace / 60)}:${String(Math.round(pace % 60)).padStart(2, "0")}` : "";
  const paceUnit = dist.u === "mi" ? "/mi" : "/km";
  const speedUnit = dist.u === "mi" ? "mph" : "km/h";
  const autoSpeed = dist.v > 0 && time > 0 ? Math.round((per / (time / 3600)) * 10) / 10 : 0;
  const speed = autoSpeed || num("speed");
  const cadUnit = act.group === "Cycling" ? "rpm" : "spm";
  const goalFilled = entries.some((e) => has[e]);

  const autoTitle = `${partOfDay(when)} ${act.name.toLowerCase()}`.replace(/^\w/, (c) => c.toUpperCase());
  const setDate = (d: Date) => { const x = new Date(d); x.setHours(when.getHours(), when.getMinutes(), 0, 0); setWhen(x > now ? now : x); };

  type IconT = typeof Star;
  // each metric gets the onboarding wheel sheet: a sensible range, a start value and quick presets
  type NumDef = { label: string; title: string; suffix?: string; decimals?: boolean; units?: string[]; Icon: IconT; min: number; max: number; step?: number; start: number; presets: number[] };
  const NUM: Record<string, NumDef> = {
    laps: { label: "Laps", title: "Laps", suffix: "laps", Icon: METRICS.laps.Icon as IconT, min: 1, max: 300, start: 10, presets: [4, 8, 10, 20, 40] },
    steps: { label: "Steps", title: "Steps", suffix: "steps", Icon: METRICS.steps.Icon as IconT, min: 100, max: 60000, step: 100, start: 8000, presets: [5000, 8000, 10000, 12000, 15000] },
    count: { label: "Skips", title: "Skips", suffix: "skips", Icon: METRICS.count.Icon as IconT, min: 10, max: 10000, step: 10, start: 500, presets: [100, 300, 500, 1000, 2000] },
    weight: { label: "Body weight", title: "Body weight", decimals: true, units: ["kg", "lb"], Icon: METRICS.weight.Icon as IconT, min: 20, max: 400, start: 70, presets: [55, 65, 70, 75, 85] },
    hr: { label: "Heart rate", title: "Average heart rate", suffix: "bpm", Icon: Heartbeat, min: 40, max: 220, start: 145, presets: [120, 135, 145, 155, 165] },
    cal: { label: "Calories", title: "Calories burned", suffix: "kcal", Icon: Fire, min: 10, max: 5000, step: 10, start: 400, presets: [200, 300, 400, 600, 800] },
    elev: { label: "Elevation gain", title: "Elevation gain", suffix: "m", Icon: Mountains, min: 5, max: 5000, step: 5, start: 100, presets: [50, 100, 200, 500, 1000] },
    cad: { label: "Cadence", title: "Average cadence", suffix: cadUnit, Icon: Metronome, min: 30, max: 220, start: cadUnit === "rpm" ? 85 : 170, presets: cadUnit === "rpm" ? [70, 80, 85, 90, 100] : [160, 165, 170, 175, 180] },
    speed: { label: "Speed", title: "Average speed", suffix: speedUnit, decimals: true, Icon: Speedometer, min: 1, max: 80, start: 12, presets: [8, 10, 12, 20, 25] },
  };
  const unitOf = (k: string) => (k === "weight" ? weightU : NUM[k]?.suffix);
  const labelOf = (k: string) => (k === "distance" ? "Distance" : k === "duration" ? "Duration" : k === "sets" ? "Sets & reps" : k === "pace" ? "Pace" : NUM[k]?.label ?? k);
  const iconOf = (k: string): IconT => (k === "distance" ? distIcon(act) : k === "duration" ? METRICS.duration.Icon : k === "sets" ? METRICS.reps.Icon : k === "pace" ? Gauge : NUM[k].Icon) as IconT;
  const isAuto = (k: string) => (k === "pace" && !!autoPace) || (k === "speed" && !!autoSpeed);
  const filled = (k: string) => (k in has ? has[k as Entry] : k === "pace" ? pace > 0 : k === "speed" ? speed > 0 : num(k) > 0);
  const valueOf = (k: string): [string, string?] => k === "distance" ? [fmtN(dist.v), dist.u] : k === "duration" ? [fmtTime(time)] : k === "sets" ? [sr ? srText(sr) : ""]
    : k === "pace" ? [paceText, paceUnit] : k === "speed" ? [fmtN(speed), speedUnit] : [fmtN(num(k)), unitOf(k)];
  const openFor = (k: string) => () => {
    if (isAuto(k)) return;
    if (k === "sets") return setPage("sets");
    setSheet(k === "distance" ? "dist" : k === "duration" ? "time" : k === "pace" ? "pace" : `num:${k}`);
  };
  const clearFor = (k: string) => (k === "distance" ? setDist({ ...dist, v: 0 }) : k === "duration" ? setTime(0) : k === "sets" ? setSr(null) : k === "pace" ? setPaceIn(0) : setNum(k)(0));
  const askToRemove = (k: string) => () => { setSheet(null); setPage(null); setAskRemove(k); };
  const doRemove = (k: string) => {
    const before = { dist, time, n: { ...n }, sr, paceIn };
    clearFor(k);
    setAskRemove(null);
    window.clearTimeout(undoTimer.current);
    setUndo({ label: `${labelOf(k)} removed`, restore: () => { setDist(before.dist); setTime(before.time); setN(before.n); setSr(before.sr); setPaceIn(before.paceIn); } });
    undoTimer.current = window.setTimeout(() => setUndo(null), 5000);
  };

  // four metric types in view (the ones you used last time for this sport first), the rest under More
  const allKeys: string[] = [...entries, ...(act.id === "weightmgmt" ? ["duration"] : []), ...extras];
  const prev = (lastUsed[actId] ?? []).filter((k) => allKeys.includes(k));
  const ordered = [...prev, ...allKeys.filter((k) => !prev.includes(k))];
  const visible = ordered.slice(0, 4);
  const moreKeys = ordered.slice(4);
  const moreFilled = moreKeys.filter(filled).length;
  const boxes = ordered.filter(filled);
  const numKey = typeof sheet === "string" && sheet.startsWith("num:") ? sheet.slice(4) : null;

  const finish = () => {
    try { const all = readLast(); all[actId] = boxes.filter((k) => !isAuto(k)); localStorage.setItem(LAST_KEY, JSON.stringify(all)); } catch { /* private mode: nothing to remember */ }
    setSaved(true); setTimeout(() => go("home"), 1500);
  };

  const head = (t: string, right?: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "28px 0 12px" }}>
      <h2 className="h2" style={{ fontSize: 18 }}>{t}</h2>{right}
    </div>
  );
  const chip = (label: string, on: boolean, onClick: () => void, Icon?: IconT) => (
    <button key={label} type="button" className="chip" aria-pressed={on} onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {Icon && <Icon size={16} weight={on ? "fill" : "regular"} aria-hidden />}{label}
    </button>
  );
  const MARK_ICON: Record<string, IconT> = { Favorite: Star, "Personal best": Trophy, Injury: Bandaids, "Bad day": CloudRain };

  const hero = media[0];
  const thumbs = media.slice(1, 4);
  const more = media.length - 4;
  const tile = (k: string) => {
    const done = filled(k), Icon = iconOf(k), label = labelOf(k);
    return (
      <button key={k} type="button" onClick={openFor(k)} aria-label={done ? `${label}, added. Edit` : `Add ${label.toLowerCase()}`}
        style={{ position: "relative", height: 92, borderRadius: 16, display: "grid", placeItems: "center", alignContent: "center", gap: 8, padding: "0 4px", transition: "all .2s",
          border: `1.5px solid ${done ? "var(--blue)" : "var(--line)"}`, background: done ? "var(--blue-50)" : "#fff" }}>
        {done && <span aria-hidden style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: "50%", background: "var(--blue)", color: "#fff", display: "grid", placeItems: "center" }}><Check size={10} weight="bold" /></span>}
        <SportIcon Icon={Icon} size={26} selected={done} neutral />
        <span style={{ fontSize: 13, fontWeight: 600, color: done ? "var(--blue)" : "var(--ink)", textAlign: "center", lineHeight: 1.2 }}>{label}</span>
      </button>
    );
  };

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

      <div className="pad" style={{ paddingTop: 10, paddingBottom: 150 }}>
        {/* the sketch order: sport, title, how it went, photos, date and time, location */}
        <button type="button" className="nf" onClick={() => setSheet("act")} aria-label={`Activity, ${act.name}. Change`} style={{ width: "100%", height: 56, padding: "0 14px", gap: 12, cursor: "pointer" }}>
          <SportIcon Icon={act.Icon} size={24} />
          <span style={{ flex: 1, textAlign: "left", fontSize: 16, fontWeight: 600 }}>{act.name}</span>
          <CaretDown size={18} color="var(--gray)" aria-hidden />
        </button>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={autoTitle} aria-label={`Title. Leave it blank to use ${autoTitle}`} maxLength={80} style={{ marginTop: 12 }} />
        <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How'd it go?" aria-label="How did it go" rows={4}
          style={{ height: "auto", marginTop: 12, padding: "13px 16px", lineHeight: 1.45, resize: "none", fontFamily: "inherit" }} />

        <div style={{ marginTop: 12 }}>
        {!hero ? (
          <button type="button" onClick={() => setSheet("gallery")} aria-label="Add photos or videos"
            style={{ position: "relative", width: "100%", height: 150, borderRadius: 18, overflow: "hidden", border: "1.5px dashed #8DB4FF", background: "linear-gradient(180deg, #F4F7FE 0%, #EAF0FC 100%)", display: "grid", placeItems: "center", alignContent: "center", gap: 6, padding: "0 24px" }}>
            <ImageSquare size={34} color="var(--blue)" style={{ position: "relative" }} />
            <span style={{ position: "relative", fontSize: 15, fontWeight: 600, color: "var(--blue)" }}>Add photos or videos</span>
            <span style={{ position: "relative", fontSize: 13, color: "var(--gray)" }}>A team or group photo works well here too.</span>
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
        </div>

        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <button type="button" className="nf" onClick={() => setSheet("date")} aria-label={`Date, ${dateName(when, now)}. Change`} style={{ width: "100%", height: 52, padding: "0 12px", gap: 10, cursor: "pointer" }}>
            <SportIcon Icon={CalendarBlank} size={22} neutral />
            <span className="num" style={{ flex: 1, textAlign: "left", fontSize: 15, fontWeight: 600, whiteSpace: "nowrap" }}>{dateName(when, now)}</span>
            <CaretDown size={16} color="var(--gray)" aria-hidden />
          </button>
          <button type="button" className="nf" onClick={() => setSheet("clock")} aria-label={`Time, ${timeName(when)}. Change`} style={{ width: "100%", height: 52, padding: "0 12px", gap: 10, cursor: "pointer" }}>
            <SportIcon Icon={Clock} size={22} neutral />
            <span className="num" style={{ flex: 1, textAlign: "left", fontSize: 15, fontWeight: 600, whiteSpace: "nowrap" }}>{timeName(when)}</span>
            <CaretDown size={16} color="var(--gray)" aria-hidden />
          </button>
        </div>

        <div style={{ position: "relative", marginTop: 12 }}>
          <button type="button" className="nf" onClick={() => setSheet("loc")} aria-label={place ? `Location, ${place.name}. Change` : "Add a location"} style={{ width: "100%", height: 52, padding: "0 12px", gap: 10, cursor: "pointer" }}>
            <SportIcon Icon={MapPin} size={22} neutral />
            <span style={{ flex: 1, minWidth: 0, textAlign: "left", fontSize: 15, fontWeight: place ? 600 : 400, color: place ? "var(--ink)" : "var(--gray)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {place ? <>{place.name}{place.area && <span style={{ fontWeight: 400, color: "var(--gray)" }}> · {place.area}</span>}</> : "Location"}
            </span>
            <CaretDown size={16} color="var(--gray)" aria-hidden />
          </button>
        </div>

        {/* metrics: four types in view, the rest under More; what you add shows as boxes below */}
        <section>
          {head("Choose metric type")}
          <div role="group" aria-label="Metric type" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8 }}>
            {visible.map(tile)}
          </div>
          {moreKeys.length > 0 && (
            <button type="button" onClick={() => setSheet("more")} className="btn btn-soft" style={{ width: "100%", marginTop: 8, height: 48, justifyContent: "space-between", padding: "0 16px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><DotsThree size={22} weight="bold" aria-hidden />More metrics<span className="meta" style={{ fontSize: 13 }}>{moreKeys.length}</span></span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--blue)", fontSize: 14 }}>{moreFilled ? `${moreFilled} added` : ""}<CaretRight size={16} color="var(--gray)" aria-hidden /></span>
            </button>
          )}
          {boxes.length > 0 && (
            <>
              {head("Your metrics")}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {boxes.map((k) => {
                  const [v, u] = valueOf(k), Icon = iconOf(k), auto = isAuto(k), wide = k === "sets";
                  return (
                    <button key={k} type="button" onClick={openFor(k)} disabled={auto} aria-label={auto ? `${labelOf(k)}, ${v} ${u ?? ""}, worked out from distance and time` : `${labelOf(k)}, ${v} ${u ?? ""}. Change`}
                      style={{ gridColumn: wide ? "1 / -1" : undefined, display: "grid", gap: 6, padding: "12px 14px", borderRadius: 16, border: "1px solid var(--line)", background: "#fff", textAlign: "left", cursor: auto ? "default" : "pointer", opacity: 1 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gray)", fontSize: 13, fontWeight: 500 }}>
                        <Icon size={16} aria-hidden />{labelOf(k)}{auto && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, padding: "1px 6px", borderRadius: 6, background: "var(--bg)" }}>Auto</span>}
                      </span>
                      <span className="num" style={{ fontSize: wide ? 17 : 20, fontWeight: 650, color: "var(--ink)", lineHeight: 1.2 }}>{v}{u && <span style={{ fontSize: 13, fontWeight: 500, color: "var(--gray)", marginLeft: 4 }}>{u}</span>}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {head("How did you feel?")}
        <FeelPicker value={feel} onChange={setFeel} />

        {head("Mark this day")}
        <div role="group" aria-label="Mark this day" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[...MARK_TOP, ...marks.filter((m) => !MARK_TOP.includes(m))].map((m) => chip(m, marks.includes(m), () => setMarks(marks.includes(m) ? marks.filter((x) => x !== m) : [...marks, m]), MARK_ICON[m]))}
        </div>

        {head("Tags")}
        <DetailRow Icon={Tag} label="Tags" placeholder={`Add ${act.name.toLowerCase()} tags`} value={tags.length ? <span style={{ color: "var(--blue)" }}>{tags.join(", ")}</span> : undefined} onClick={() => setSheet("tags")} />

        {gearKind && (<>
          {head("Gear")}
          {gearPicked ? <GearCard g={gearPicked} onClick={() => setSheet("gear")} /> : <DetailRow Icon={Sneaker} label="Gear" placeholder={gearKind === "shoe" ? "Add shoes" : "Add a bike"} onClick={() => setSheet("gear")} />}
        </>)}

        {head("With whom")}
        <DetailRow label="With whom" placeholder="Add people" value={withList.length ? peopleText(withList) : undefined}
          lead={withList.length ? <PeopleStack list={withList} /> : <User size={22} color="var(--gray)" aria-hidden />} onClick={() => setSheet("people")} />

        {head("Link to goal")}
        {goalName ? (
          <button type="button" onClick={() => setSheet("goal")} aria-label={`Linked to ${goalName}. Change`}
            style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 64, padding: "10px 14px", borderRadius: 16, border: "1px solid #C7D7FE", background: "var(--blue-50)", textAlign: "left" }}>
            <Target size={24} color="var(--blue)" aria-hidden />
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{goalName}</span>
              {goalName === goal.title && <span style={{ display: "inline-block", marginTop: 4, padding: "2px 8px", borderRadius: 6, background: "#fff", color: "var(--blue)", fontSize: 12, fontWeight: 600 }}>Primary goal</span>}
            </span>
            <CaretRight size={16} color="var(--gray)" aria-hidden />
          </button>
        ) : (
          <DetailRow Icon={linked === null ? ProhibitInset : Plus} label="Link to goal" value={linked === null ? "No goal" : undefined} placeholder="Add goal (optional)" onClick={() => setSheet("goal")} />
        )}
        <WhyGoal />
      </div>

      <div style={{ position: "sticky", bottom: 0, zIndex: 5, padding: "10px 20px 28px", background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 28%)" }}>
        <button type="button" className="btn btn-blue" style={{ width: "100%" }} disabled={!goalFilled} onClick={finish}>Save activity</button>
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
        {page === "sets" && <SetsRepsPage key="sets" value={sr} sport={act.name} onSave={(v) => { setSr(v); setPage(null); }} onRemove={sr ? askToRemove("sets") : undefined} onBack={() => setPage(null)} />}
        {page === "gear" && gearKind && (
          <AddGearPage key="gear" kind={gearKind} sport={actId} onBack={() => { setPage(null); setSheet("gear"); }}
            onSave={(g) => { setGearList((l) => [...l, g]); if (g.kind === gearKind || g.uses?.includes(actId)) setGearSel(g.id); setPage(null); }} />
        )}
        {page === "person" && (
          <AddPersonPage key="person" onBack={() => { setPage(null); setSheet("people"); }}
            onSave={(name, photo) => {
              const p: Person = { id: `p-${Date.now()}`, name, photo, tint: "#475467", count: 0 };
              setPeople((l) => [p, ...l]); setWithIds((ids) => [...ids, p.id]); setPage(null); setSheet("people");
            }} />
        )}
      </AnimatePresence>

      {/* sheets */}
      <AnimatePresence>
        {sheet === "act" && <ActivitySheet value={actId} onPick={pickAct} onClose={() => setSheet(null)} />}
        {sheet === "gallery" && <GallerySheet have={media.map((m) => m.src)} onAdd={addMedia} onClose={() => setSheet(null)} />}
        {sheet === "date" && <DateSheet value={when} now={now} onSave={setDate} onClose={() => setSheet(null)} />}
        {sheet === "clock" && <ClockSheet value={when} now={now} onSave={setWhen} onClose={() => setSheet(null)} />}
        {sheet === "dist" && <DistanceSheet title="Distance" cta="Set distance" value={dist.v || 5} unit={dist.u} onSave={(v, u) => setDist({ v, u })} onRemove={dist.v > 0 ? askToRemove("distance") : undefined} onClose={() => setSheet(null)} />}
        {sheet === "time" && <TimeSheet title="Duration" cta="Set duration" fmt="hms" value={time} onSave={setTime} onRemove={time > 0 ? askToRemove("duration") : undefined} onClose={() => setSheet(null)} />}
        {sheet === "loc" && (
          <Sheet id="loc" title="Location" sub="Search places near you, or pin a new one on the map." expandable onClose={() => setSheet(null)}>
            <div style={{ marginTop: 14 }}>
              <PlacePicker noun="place" places={places} selected={place?.id} loc="on" onAskLoc={() => {}}
                onSelect={(p) => { setPlace(p); if (p) setSheet(null); }} onAdd={(p) => setPlaces((l) => [...l, p])} onNew={() => setSheet("newplace")} />
            </div>
          </Sheet>
        )}
        {sheet === "newplace" && <AddPlaceSheet noun="place" gps onClose={() => setSheet("loc")}
          onSave={(p) => { setPlaces((l) => (l.some((x) => x.id === p.id) ? l : [...l, p])); setPlace(p); setSheet(null); }} />}
        {sheet === "pace" && <TimeSheet title={`Average pace ${paceUnit}`} cta="Set pace" fmt="hms" value={paceIn || 330} onSave={setPaceIn} onRemove={paceIn > 0 ? askToRemove("pace") : undefined} onClose={() => setSheet(null)} />}
        {numKey && NUM[numKey] && (
          <NumberSheet key={numKey} title={NUM[numKey].title} cta={num(numKey) > 0 ? "Update" : "Save"} value={num(numKey) || NUM[numKey].start}
            unit={numKey === "weight" ? weightU : NUM[numKey].suffix ?? ""} units={NUM[numKey].units?.map((n) => ({ name: n, f: n === "lb" ? 0.45359 : 1 }))}
            min={NUM[numKey].min} max={NUM[numKey].max} step={NUM[numKey].step} tenths={NUM[numKey].decimals} presets={NUM[numKey].presets}
            sub={numKey === "cal" ? "An estimate is fine. Scroll, tap a preset or type it." : numKey === "weight" ? "Saved to your one weight history." : undefined}
            onSave={(v, u) => { setNum(numKey)(v); if (numKey === "weight" && u) setWeightU(u); }} onRemove={num(numKey) > 0 ? askToRemove(numKey) : undefined} onClose={() => setSheet(null)} />
        )}
        {sheet === "more" && (
          <Sheet id="more" title="More metrics" sub="Optional. Add any that you tracked." onClose={() => setSheet(null)}>
            <div style={{ marginTop: 10 }}>
              {moreKeys.map((k) => {
                const Icon = iconOf(k), auto = isAuto(k), [v, u] = valueOf(k), done = filled(k);
                return (
                  <button key={k} type="button" disabled={auto} onClick={() => { setSheet(null); openFor(k)(); }}
                    style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", minHeight: 56, textAlign: "left", borderBottom: "1px solid var(--line)", opacity: 1, cursor: auto ? "default" : "pointer" }}>
                    <Icon size={24} />
                    <span style={{ flex: 1, fontSize: 16, fontWeight: 500 }}>{labelOf(k)}</span>
                    <span className="num" style={{ fontSize: 14, color: done ? "var(--ink)" : "var(--gray)", fontWeight: done ? 600 : 400 }}>{done ? `${v} ${u ?? ""}` : "Add"}{auto && " (auto)"}</span>
                    {!auto && <CaretRight size={16} color="var(--gray)" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </Sheet>
        )}
        {sheet === "tags" && <TagSheet sport={act.name} suggested={tagsFor(actId)} value={tags} custom={customTags} onDone={(t, c) => { setTags(t); setCustomTags(c); }} onClose={() => setSheet(null)} />}
        {sheet === "marks" && <MarkSheet value={marks} onDone={setMarks} onClose={() => setSheet(null)} />}
        {sheet === "gear" && gearKind && (
          <GearSheet kind={gearKind} list={kindGear} value={gearId} onDone={setGearSel} onClose={() => setSheet(null)}
            onAdd={() => { setSheet(null); setPage("gear"); }} />
        )}
        {sheet === "people" && <PeopleSheet people={people} value={withIds} onDone={setWithIds} onNew={() => { setSheet(null); setPage("person"); }} onClose={() => setSheet(null)} />}
        {sheet === "goal" && <GoalSheet goals={goals} value={goalName} onApply={setLinked} onNewGoal={() => go("onboarding")} onClose={() => setSheet(null)} />}
        {actionsFor && (
          <MediaActions isHighlight={actionsFor === highlight} onHighlight={() => makeHighlight(actionsFor)} onDelete={() => removeMedia(actionsFor)} onClose={() => setActionsFor(null)} />
        )}
      </AnimatePresence>

      {/* removing a metric: confirm in the centre, then a short Undo */}
      <AnimatePresence>
        {askRemove && (
          <motion.div key="ask-remove" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            style={{ position: "absolute", inset: 0, zIndex: 40, display: "grid", placeItems: "center", padding: 24, background: "rgba(11,18,32,0.42)" }} onClick={() => setAskRemove(null)}>
            <motion.div role="alertdialog" aria-modal="true" aria-labelledby="rm-t" aria-describedby="rm-d" onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => { if (e.key === "Escape") setAskRemove(null); }}
              initial={{ scale: 0.94, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 420, damping: 32 }}
              style={{ width: "100%", borderRadius: 24, background: "#fff", padding: "22px 20px 16px", boxShadow: "0 30px 60px -20px rgba(11,18,32,0.5)", textAlign: "center" }}>
              <span aria-hidden style={{ width: 52, height: 52, borderRadius: "50%", background: "#FEF3F2", color: "#d92d20", display: "grid", placeItems: "center", margin: "0 auto 12px" }}><Trash size={24} /></span>
              <h2 id="rm-t" className="h2" style={{ fontSize: 19 }}>Remove {labelOf(askRemove).toLowerCase()}?</h2>
              <p id="rm-d" className="meta" style={{ fontSize: 14, lineHeight: 1.5, marginTop: 8 }}>
                This clears the <strong className="num" style={{ color: "var(--ink)" }}>{valueOf(askRemove).filter(Boolean).join(" ")}</strong> you added.{(entries as string[]).includes(askRemove) && entries.filter((e) => has[e]).length === 1 ? ` It's your only required metric, so you'll need to add another before you can save.` : ""}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 18 }}>
                <button type="button" className="btn btn-soft" autoFocus onClick={() => setAskRemove(null)}>Keep it</button>
                <button type="button" className="btn" style={{ background: "#d92d20", color: "#fff" }} onClick={() => doRemove(askRemove)}>Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {undo && (
          <motion.div key="undo" role="status" aria-live="polite" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.22 }}
            style={{ position: "absolute", left: 20, right: 20, bottom: 120, zIndex: 35, display: "flex", alignItems: "center", gap: 12, padding: "12px 12px 12px 16px", borderRadius: 16, background: "var(--ink)", color: "#fff", boxShadow: "0 18px 36px -16px rgba(11,18,32,0.5)" }}>
            <Check size={18} weight="bold" aria-hidden />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{undo.label}</span>
            <button type="button" onClick={() => { undo.restore(); setUndo(null); window.clearTimeout(undoTimer.current); }} style={{ fontSize: 14, fontWeight: 650, color: "#8DB4FF", padding: "6px 8px" }}>Undo</button>
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
