// Add gear: one page of details, with a sheet for the gear type and one for the activities it's used for.
// Built from the same parts as Add activity and onboarding: a label above each 52px field, pickers that open sheets.
import { useRef, useState } from "react";
import {
  Sneaker, Bicycle, Watch, Backpack, HardHat, Goggles, DotsThree, PersonSimpleRun, Bell, ImageSquare, Check, CaretRight, CaretDown, MagnifyingGlass,
} from "@phosphor-icons/react";
import { Sheet } from "../sheet";
import { SportIcon } from "../components";
import { activities } from "../data";
import type { Gear, GearKind } from "../entryData";
import { Page } from "./entryParts";
import { NumField } from "./Onboarding";

export const GEAR_TYPES: { kind: GearKind; name: string; hint: string; Icon: typeof Sneaker }[] = [
  { kind: "shoe", name: "Shoes", hint: "Running, trail, walking, hiking shoes", Icon: Sneaker },
  { kind: "bike", name: "Bike", hint: "Road bike, MTB, gravel bike and more", Icon: Bicycle },
  { kind: "watch", name: "Watch / GPS", hint: "Garmin, Apple Watch, COROS, Polar and more", Icon: Watch },
  { kind: "bag", name: "Bag / Pack", hint: "Running vest, hydration pack, hiking bag", Icon: Backpack },
  { kind: "helmet", name: "Helmet", hint: "Cycling, MTB, ski and more", Icon: HardHat },
  { kind: "equipment", name: "Equipment", hint: "Racket, goggles, poles, gloves and more", Icon: Goggles },
  { kind: "other", name: "Other gear", hint: "Any other gear or equipment", Icon: DotsThree },
];
const typeOf = (k: GearKind) => GEAR_TYPES.find((t) => t.kind === k)!;
// gear that wears out with distance gets a replace reminder
const TRACKS_KM = (k: GearKind) => k === "shoe" || k === "bike";
const DEFAULT_LIMIT: Partial<Record<GearKind, number>> = { shoe: 700, bike: 5000 };
const DEFAULT_USES: Partial<Record<GearKind, string[]>> = { shoe: ["run", "walk"], bike: ["cycle"] };
const TOP = ["run", "walk", "trail", "hike", "workout", "weights", "cycle", "swim"];

const head = (t: string, opt?: boolean) => (
  <h2 className="h2" style={{ fontSize: 18, margin: "28px 0 12px" }}>{t}{opt && <span className="meta" style={{ fontSize: 14, fontWeight: 500 }}> optional</span>}</h2>
);
const picker: React.CSSProperties = { width: "100%", height: 52, padding: "0 12px", gap: 10, cursor: "pointer" };

export function AddGearPage({ kind, sport, onSave, onBack }: { kind: GearKind; sport: string; onSave: (g: Gear) => void; onBack: () => void }) {
  const [type, setType] = useState<GearKind>(kind);
  const [name, setName] = useState("");
  const [uses, setUses] = useState<string[]>(() => [...new Set([sport, ...(DEFAULT_USES[kind] ?? [])])]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [nick, setNick] = useState("");
  const [notes, setNotes] = useState("");
  const [km, setKm] = useState(0);
  const [notify, setNotify] = useState(true);
  const [limit, setLimit] = useState(DEFAULT_LIMIT[kind] ?? 700);
  const [photo, setPhoto] = useState<string>();
  const [sheet, setSheet] = useState<null | "type" | "uses">(null);
  const file = useRef<HTMLInputElement>(null);
  const t = typeOf(type);
  const ok = !!name.trim() && uses.length > 0;
  const save = () => {
    if (!ok) return;
    onSave({
      id: `g-${Date.now()}`, kind: type, name: name.trim(), km, limit: TRACKS_KM(type) && notify ? limit : 0,
      img: photo ?? (type === "shoe" ? "/img/auth-shoe.png" : type === "bike" ? "/img/ride-sq.jpg" : ""), uses,
      brand: brand.trim() || undefined, model: model.trim() || undefined, nickname: nick.trim() || undefined, notes: notes.trim() || undefined,
    });
  };
  const usesText = uses.map((id) => activities.find((a) => a.id === id)?.name ?? id).join(", ");

  return (
    <>
      <Page title="Add gear" onBack={onBack} footer={<button type="button" className="btn btn-blue" style={{ width: "100%" }} disabled={!ok} onClick={save}>Save gear</button>}>
        <div className="pad" style={{ paddingTop: 16, paddingBottom: 12 }}>
          {/* photo first, the same drop box as Add activity */}
          <button type="button" onClick={() => file.current?.click()} aria-label={photo ? "Change gear photo" : "Add a photo of your gear"}
            style={{ position: "relative", width: "100%", height: 132, borderRadius: 18, overflow: "hidden", border: photo ? "1px solid var(--line)" : "1.5px dashed #8DB4FF",
              background: photo ? "var(--bg)" : "linear-gradient(180deg, #F4F7FE 0%, #EAF0FC 100%)", display: "grid", placeItems: "center", alignContent: "center", gap: 6, padding: 0 }}>
            {photo ? <img src={photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /> : <>
              <ImageSquare size={32} color="var(--blue)" />
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--blue)" }}>Add a photo</span>
              <span style={{ fontSize: 13, color: "var(--gray)" }}>Optional. Helps you tell your gear apart.</span>
            </>}
          </button>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f)); }} />

          <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
            <div>
              <span className="flabel">Gear type</span>
              <button type="button" className="nf" onClick={() => setSheet("type")} aria-label={`Gear type, ${t.name}. Change`} style={picker}>
                <SportIcon Icon={t.Icon} size={22} neutral />
                <span style={{ flex: 1, textAlign: "left", fontSize: 15, fontWeight: 600 }}>{t.name}</span>
                <CaretDown size={16} color="var(--gray)" aria-hidden />
              </button>
            </div>
            <div>
              <label className="flabel" htmlFor="gear-name">Gear name</label>
              <input id="gear-name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40}
                placeholder={type === "shoe" ? "Such as PUMA Nitro White" : type === "bike" ? "Such as Trek Domane AL 2" : "Give it a name"} />
            </div>
            <div>
              <span className="flabel">Used for</span>
              <button type="button" className="nf" onClick={() => setSheet("uses")} aria-label={`Used for, ${usesText || "nothing yet"}. Change`} style={picker}>
                <SportIcon Icon={PersonSimpleRun} size={22} neutral />
                <span style={{ flex: 1, minWidth: 0, textAlign: "left", fontSize: 15, fontWeight: uses.length ? 600 : 400, color: uses.length ? "var(--ink)" : "var(--gray)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {uses.length ? usesText : "Pick activities"}
                </span>
                {uses.length > 0 && <span className="num" style={{ flex: "none", padding: "2px 8px", borderRadius: 999, background: "var(--blue-50)", color: "var(--blue)", fontSize: 12, fontWeight: 650 }}>{uses.length}</span>}
                <CaretRight size={16} color="var(--gray)" aria-hidden />
              </button>
            </div>
          </div>

          {TRACKS_KM(type) && <>
            {head("Usage and reminder", true)}
            <div style={{ display: "grid", gap: 14 }}>
              <NumField id="gear-km" label="Distance already on it" value={km} decimals onChange={setKm} suffix="km" placeholder="0" />
              <label style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 48, cursor: "pointer" }}>
                <SportIcon Icon={Bell} size={22} selected={notify} neutral />
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 15, fontWeight: notify ? 600 : 500 }}>Remind me to replace it</span>
                  <span className="cap">When it reaches the distance below</span>
                </span>
                <input type="checkbox" role="switch" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="switch" />
              </label>
              {notify && <NumField id="gear-limit" label="Replace at" value={limit} onChange={setLimit} suffix="km" />}
            </div>
          </>}

          {head("More details", true)}
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 10 }}>
              <div><label className="flabel" htmlFor="gear-brand">Brand</label><input id="gear-brand" className="input" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="PUMA" maxLength={30} /></div>
              <div><label className="flabel" htmlFor="gear-model">Model</label><input id="gear-model" className="input" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Nitro" maxLength={30} /></div>
            </div>
            <div><label className="flabel" htmlFor="gear-nick">Nickname</label><input id="gear-nick" className="input" value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Such as White" maxLength={30} /></div>
            <div>
              <label className="flabel" htmlFor="gear-notes">Notes</label>
              <textarea id="gear-notes" className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Such as my everyday running shoe" maxLength={120}
                style={{ height: "auto", padding: "12px 16px", resize: "none" }} />
            </div>
          </div>
        </div>
      </Page>
      {sheet === "type" && <GearTypeSheet value={type} onDone={(k) => { setType(k); if (DEFAULT_LIMIT[k]) setLimit(DEFAULT_LIMIT[k]!); }} onClose={() => setSheet(null)} />}
      {sheet === "uses" && <UsedForSheet value={uses} onApply={setUses} onClose={() => setSheet(null)} />}
    </>
  );
}

// the same tick marks as the rest of the entry flow
const Radio = ({ on }: { on: boolean }) => (
  <span aria-hidden style={{ width: 24, height: 24, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", border: on ? "none" : "1.5px solid #C3C9D4", background: on ? "var(--blue)" : "#fff", color: "#fff" }}>
    {on && <Check size={13} weight="bold" />}
  </span>
);
const Box = ({ on }: { on: boolean }) => (
  <span aria-hidden style={{ width: 22, height: 22, borderRadius: 6, flex: "none", display: "grid", placeItems: "center", border: on ? "none" : "1.5px solid #C3C9D4", background: on ? "var(--blue)" : "#fff", color: "#fff" }}>
    {on && <Check size={13} weight="bold" />}
  </span>
);

function GearTypeSheet({ value, onDone, onClose }: { value: GearKind; onDone: (k: GearKind) => void; onClose: () => void }) {
  const [sel, setSel] = useState(value);
  return (
    <Sheet id="gear-type" title="Gear type" onClose={onClose} expandable>
      <div role="radiogroup" aria-label="Gear type" style={{ display: "grid", gap: 8, marginTop: 14 }}>
        {GEAR_TYPES.map(({ kind, name, hint, Icon }) => {
          const on = sel === kind;
          return (
            <button key={kind} type="button" role="radio" aria-checked={on} onClick={() => setSel(kind)}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 16, textAlign: "left", border: `1.5px solid ${on ? "var(--blue)" : "var(--line)"}`, background: on ? "var(--blue-50)" : "#fff", transition: "all .18s" }}>
              <SportIcon Icon={Icon} size={26} selected={on} neutral />
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 600, color: on ? "var(--blue)" : "var(--ink)" }}>{name}</span>
                <span className="cap">{hint}</span>
              </span>
              <Radio on={on} />
            </button>
          );
        })}
      </div>
      <button type="button" className="btn btn-blue" style={{ width: "100%", marginTop: 16 }} onClick={() => { onDone(sel); onClose(); }}>Done</button>
    </Sheet>
  );
}

function UsedForSheet({ value, onApply, onClose }: { value: string[]; onApply: (ids: string[]) => void; onClose: () => void }) {
  const [sel, setSel] = useState(value);
  const [q, setQ] = useState("");
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const term = q.trim().toLowerCase();
  const list = activities.filter((a) => !term || a.name.toLowerCase().includes(term));
  const top = TOP.map((id) => activities.find((a) => a.id === id)).filter((a): a is (typeof activities)[number] => !!a);
  return (
    <Sheet id="gear-uses" title="Used for" sub="Pick the activities you'll use this gear for." onClose={onClose} expandable
      head={
        <div style={{ position: "relative", marginTop: 12 }}>
          <MagnifyingGlass size={17} color="var(--gray)" aria-hidden style={{ position: "absolute", left: 14, top: 15 }} />
          <input type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activities" aria-label="Search activities" style={{ height: 46, paddingLeft: 40, background: "var(--bg)", borderColor: "transparent" }} />
        </div>
      }>
      {!term && (
        <>
          <p className="cap" style={{ fontSize: 12, fontWeight: 600, margin: "18px 2px 10px" }}>Your top activities</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {top.map((a) => {
              const on = sel.includes(a.id);
              return (
                <button key={a.id} type="button" aria-pressed={on} onClick={() => toggle(a.id)}
                  style={{ height: 40, padding: on ? "0 12px 0 16px" : "0 16px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: on ? 600 : 500,
                    background: on ? "var(--blue)" : "#fff", color: on ? "#fff" : "var(--ink)", border: `1px solid ${on ? "var(--blue)" : "var(--line)"}`, transition: "all .18s" }}>
                  {a.name}{on && <Check size={14} weight="bold" aria-hidden />}
                </button>
              );
            })}
          </div>
        </>
      )}
      <p className="cap" style={{ fontSize: 12, fontWeight: 600, margin: "22px 2px 4px" }}>{term ? `Results (${list.length})` : "All activities"}</p>
      <div role="group" aria-label="Activities">
        {list.map((a) => {
          const on = sel.includes(a.id);
          return (
            <button key={a.id} type="button" role="checkbox" aria-checked={on} onClick={() => toggle(a.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 56, padding: "8px 2px", borderBottom: "1px solid var(--line)", textAlign: "left" }}>
              <SportIcon Icon={a.Icon} size={24} selected={on} />
              <span style={{ flex: 1, fontSize: 15, fontWeight: on ? 600 : 500 }}>{a.name}</span>
              <Box on={on} />
            </button>
          );
        })}
        {!list.length && <p className="meta" style={{ padding: "14px 0", fontSize: 14 }}>No activity called “{q}”.</p>}
      </div>
      <div style={{ position: "sticky", bottom: -28, padding: "12px 0 0", marginTop: 8, background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 30%)" }}>
        <button type="button" className="btn btn-blue" style={{ width: "100%" }} disabled={!sel.length} onClick={() => { onApply(sel); onClose(); }}>{sel.length ? `Apply (${sel.length})` : "Pick at least one"}</button>
      </div>
    </Sheet>
  );
}
