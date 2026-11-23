// Add gear: one page of details, with a sheet for the gear type and one for the activities it's used for.
// Built from the same parts as Add activity and onboarding: a label above each 52px field, pickers that open sheets.
import { useRef, useState } from "react";
import {
  Sneaker, Bicycle, Watch, Backpack, HardHat, Goggles, DotsThree, PersonSimpleRun, Bell, ImageSquare, Check, CaretRight, CaretDown, MagnifyingGlass, Tag, Plus,
} from "@phosphor-icons/react";
import { Sheet } from "../sheet";
import { SportIcon } from "../components";
import { activities } from "../data";
import type { Gear, GearKind } from "../entryData";
import { Page } from "./entryParts";
import { NumberSheet } from "./Onboarding";

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

const head = (t: string) => <h2 className="h2" style={{ fontSize: 18, margin: "28px 0 12px" }}>{t}</h2>;
const picker: React.CSSProperties = { width: "100%", height: 52, padding: "0 12px", gap: 10, cursor: "pointer" };

/* Shoe brands: a fixed list keeps spellings the same, so search and per-shoe counts stay clean.
   Ten worldwide and ten Indian brands; anything else is typed in as a custom brand. */
type Brand = { name: string; mark: string; color: string; logo?: string };
export const SHOE_BRANDS: { group: string; list: Brand[] }[] = [
  { group: "Popular worldwide", list: [
    { name: "Adidas", mark: "A", color: "#111827", logo: "/img/brands/adidas.svg" }, { name: "ASICS", mark: "A", color: "#1E3A8A", logo: "/img/brands/asics.png" }, { name: "Brooks", mark: "B", color: "#1D4ED8", logo: "/img/brands/brooks.png" },
    { name: "HOKA", mark: "H", color: "#1E40AF", logo: "/img/brands/hoka.png" }, { name: "New Balance", mark: "NB", color: "#B91C1C", logo: "/img/brands/newbalance.svg" }, { name: "Nike", mark: "N", color: "#111827", logo: "/img/brands/nike.png" },
    { name: "On", mark: "On", color: "#374151", logo: "/img/brands/on.svg" }, { name: "PUMA", mark: "P", color: "#111827", logo: "/img/brands/puma.png" }, { name: "Saucony", mark: "S", color: "#C2410C", logo: "/img/brands/saucony.png" },
    { name: "Skechers", mark: "S", color: "#1D4ED8", logo: "/img/brands/skechers.png" },
  ] },
  { group: "Popular in India", list: [
    { name: "Action", mark: "A", color: "#B91C1C" }, { name: "Asian", mark: "A", color: "#C2410C", logo: "/img/brands/asian.png" }, { name: "Bata Power", mark: "B", color: "#B91C1C", logo: "/img/brands/bata.png" },
    { name: "Campus", mark: "C", color: "#111827", logo: "/img/brands/campus.png" }, { name: "Lancer", mark: "L", color: "#1D4ED8" }, { name: "Liberty", mark: "L", color: "#1E3A8A", logo: "/img/brands/liberty.png" },
    { name: "Neeman's", mark: "N", color: "#4D7C0F", logo: "/img/brands/neemans.png" }, { name: "Red Tape", mark: "R", color: "#B91C1C", logo: "/img/brands/redtape.png" }, { name: "Sparx", mark: "S", color: "#C2410C" },
    { name: "Woodland", mark: "W", color: "#3F6212" },
  ] },
];
const brandOf = (name: string) => SHOE_BRANDS.flatMap((g) => g.list).find((b) => b.name === name);
function BrandMark({ name }: { name: string }) {
  const b = brandOf(name);
  const [broken, setBroken] = useState(false);
  if (b?.logo && !broken) return (
    <span aria-hidden style={{ width: 36, height: 36, borderRadius: 10, flex: "none", display: "grid", placeItems: "center", background: "#fff", border: "1px solid var(--line)", overflow: "hidden" }}>
      <img src={b.logo} alt="" width={26} height={26} onError={() => setBroken(true)} style={{ width: 26, height: 26, objectFit: "contain" }} />
    </span>
  );
  return (
    <span aria-hidden style={{ width: 36, height: 36, borderRadius: 10, flex: "none", display: "grid", placeItems: "center", background: b ? `${b.color}14` : "var(--bg)", color: b?.color ?? "var(--gray)", fontSize: (b?.mark.length ?? 1) > 1 ? 12 : 15, fontWeight: 800, letterSpacing: "-0.02em" }}>
      {b?.mark ?? name.slice(0, 1).toUpperCase()}
    </span>
  );
}
// what a replace reminder usually looks like, shown under the field
const REPLACE_HINT: Partial<Record<GearKind, string>> = {
  shoe: "Running shoes are usually replaced after 500–800 km.",
  bike: "Tyres and chains are usually checked every 3,000–5,000 km.",
};

export function AddGearPage({ kind, sport, onSave, onBack }: { kind: GearKind; sport: string; onSave: (g: Gear) => void; onBack: () => void }) {
  const [type, setType] = useState<GearKind>(kind);
  const [uses, setUses] = useState<string[]>(() => [...new Set([sport, ...(DEFAULT_USES[kind] ?? [])])]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [nick, setNick] = useState("");
  const [notes, setNotes] = useState("");
  const [km, setKm] = useState(0);
  const [notify, setNotify] = useState(true);
  const [limit, setLimit] = useState(0); // blank until they pick a distance
  const [photo, setPhoto] = useState<string>();
  const [sheet, setSheet] = useState<null | "type" | "uses" | "brand" | "km" | "limit">(null);
  const file = useRef<HTMLInputElement>(null);
  const t = typeOf(type);
  const isShoe = type === "shoe";
  // the name reads brand, model: "Nike Pegasus"; the nickname sits under it
  const name = [brand.trim(), model.trim()].filter(Boolean).join(" ");
  const ok = !!brand.trim() && !!model.trim() && uses.length > 0;
  const save = () => {
    if (!ok) return;
    onSave({
      id: `g-${Date.now()}`, kind: type, name, km, limit: TRACKS_KM(type) && notify ? limit : 0,
      img: photo ?? (type === "shoe" ? "/img/auth-shoe.png" : type === "bike" ? "/img/ride-sq.jpg" : ""), uses,
      brand: brand.trim(), model: model.trim(), nickname: nick.trim() || undefined, notes: notes.trim() || undefined,
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
              <span style={{ fontSize: 13, color: "var(--gray)" }}>Helps you tell your gear apart.</span>
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
            <div>
              {isShoe ? <>
                <span className="flabel">Brand name</span>
                <button type="button" className="nf" onClick={() => setSheet("brand")} aria-label={`Brand name, ${brand || "not picked"}. Change`} style={picker}>
                  {brand ? <BrandMark name={brand} /> : <SportIcon Icon={Tag} size={22} neutral />}
                  <span style={{ flex: 1, textAlign: "left", fontSize: 15, fontWeight: brand ? 600 : 400, color: brand ? "var(--ink)" : "var(--gray)" }}>{brand || "Pick a brand"}</span>
                  <CaretDown size={16} color="var(--gray)" aria-hidden />
                </button>
              </> : <>
                <label className="flabel" htmlFor="gear-brand">Brand name</label>
                <input id="gear-brand" className="input" value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={30}
                  placeholder={type === "bike" ? "Such as Trek" : type === "watch" ? "Such as Garmin" : "Such as Decathlon"} />
              </>}
            </div>
            <div>
              <label className="flabel" htmlFor="gear-model">Model</label>
              <input id="gear-model" className="input" value={model} onChange={(e) => setModel(e.target.value)} maxLength={30}
                placeholder={isShoe ? "Such as Pegasus 41" : type === "bike" ? "Such as Domane AL 2" : type === "watch" ? "Such as Forerunner 265" : "Such as the model name"} />
            </div>
            <div>
              <label className="flabel" htmlFor="gear-nick">Nickname</label>
              <input id="gear-nick" className="input" value={nick} onChange={(e) => setNick(e.target.value)} maxLength={30} placeholder={isShoe ? "Such as White Shoe" : "Such as Race day"} />
              {name && <p className="cap" style={{ marginTop: 6 }}>Shows as <b style={{ color: "var(--ink)", fontWeight: 600 }}>{name}</b>{nick.trim() && <> ({nick.trim()})</>}</p>}
            </div>
            <div>
              <label className="flabel" htmlFor="gear-notes">Notes</label>
              <textarea id="gear-notes" className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Such as my everyday running shoe" maxLength={120}
                style={{ height: "auto", padding: "12px 16px", resize: "none" }} />
            </div>
          </div>

          {/* the reminder is an extra, so it comes last */}
          {TRACKS_KM(type) && <>
            {head("Usage and reminder")}
            <div style={{ display: "grid", gap: 14 }}>
              <KmPick label="Distance already on it" value={km} empty="0" onOpen={() => setSheet("km")} />
              <div>
                <KmPick label="Replace at" value={limit} empty={`Such as ${(DEFAULT_LIMIT[type] ?? 700).toLocaleString("en-IN")}`} onOpen={() => setSheet("limit")} />
                {REPLACE_HINT[type] && <p className="cap" style={{ marginTop: 6 }}>{REPLACE_HINT[type]}</p>}
              </div>
              {/* the reminder switch sits last, under the distance it uses */}
              <label style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 48, cursor: limit ? "pointer" : "default", opacity: limit ? 1 : 0.5 }}>
                <SportIcon Icon={Bell} size={22} selected={notify && !!limit} neutral />
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 15, fontWeight: notify && limit ? 600 : 500 }}>Remind me to replace it</span>
                  <span className="cap">{limit ? `When it reaches ${limit.toLocaleString("en-IN")} km` : "Set a replace distance first"}</span>
                </span>
                <input type="checkbox" role="switch" checked={notify && !!limit} disabled={!limit} onChange={(e) => setNotify(e.target.checked)} className="switch" />
              </label>
            </div>
          </>}
        </div>
      </Page>
      {sheet === "type" && <GearTypeSheet value={type} onDone={(k) => { if (k !== type && (k === "shoe" || type === "shoe")) setBrand(""); setType(k); }} onClose={() => setSheet(null)} />}
      {sheet === "uses" && <UsedForSheet value={uses} onApply={setUses} onClose={() => setSheet(null)} />}
      {sheet === "km" && (
        <NumberSheet title="Distance already on it" sub="How far it has gone before you added it here." cta={km > 0 ? "Update" : "Save"} unit="km"
          value={km || (isShoe ? 100 : 1000)} min={0} max={isShoe ? 3000 : 100000} step={isShoe ? 5 : 50}
          presets={isShoe ? [0, 50, 100, 200, 300, 500] : [0, 500, 1000, 2000, 5000]}
          onSave={(v) => setKm(v)} onRemove={km > 0 ? () => { setKm(0); setSheet(null); } : undefined} onClose={() => setSheet(null)} />
      )}
      {sheet === "limit" && (
        <NumberSheet title="Replace at" sub={REPLACE_HINT[type]} cta={limit > 0 ? "Update" : "Save"} unit="km"
          value={limit || DEFAULT_LIMIT[type] || 700} min={isShoe ? 100 : 500} max={isShoe ? 2000 : 30000} step={isShoe ? 50 : 500}
          presets={isShoe ? [500, 600, 700, 800] : [3000, 5000, 8000, 10000]}
          onSave={(v) => setLimit(v)} onRemove={limit > 0 ? () => { setLimit(0); setSheet(null); } : undefined} onClose={() => setSheet(null)} />
      )}
      {sheet === "brand" && <BrandSheet value={brand} onDone={setBrand} onClose={() => setSheet(null)} />}
    </>
  );
}

// a distance field that opens the wheel sheet, like the metrics on Add activity
function KmPick({ label, value, empty, onOpen }: { label: string; value: number; empty: string; onOpen: () => void }) {
  return (
    <div>
      <span className="flabel">{label}</span>
      <button type="button" className="nf" onClick={onOpen} aria-label={`${label}, ${value ? `${value} km` : "not set"}. Change`} style={{ ...picker, padding: "0 14px" }}>
        <span className="num" style={{ flex: 1, textAlign: "left", fontSize: 16, fontWeight: value ? 600 : 400, color: value ? "var(--ink)" : "var(--gray)" }}>{value ? value.toLocaleString("en-IN") : empty}</span>
        <span className="sfx">km</span>
        <CaretDown size={16} color="var(--gray)" aria-hidden />
      </button>
    </div>
  );
}
function BrandSheet({ value, onDone, onClose }: { value: string; onDone: (b: string) => void; onClose: () => void }) {
  const known = !value || !!brandOf(value);
  const [sel, setSel] = useState(value);
  const [q, setQ] = useState("");
  const [custom, setCustom] = useState(known ? "" : value);
  const [typing, setTyping] = useState(!known);
  const term = q.trim().toLowerCase();
  const groups = SHOE_BRANDS.map((g) => ({ ...g, list: g.list.filter((b) => !term || b.name.toLowerCase().includes(term)) })).filter((g) => g.list.length);
  const pick = typing ? custom.trim() : sel;
  return (
    <Sheet id="gear-brand" title="Select brand" onClose={onClose} expandable
      head={
        <div style={{ position: "relative", marginTop: 12 }}>
          <MagnifyingGlass size={17} color="var(--gray)" aria-hidden style={{ position: "absolute", left: 14, top: 15 }} />
          <input type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brands" aria-label="Search brands" style={{ height: 46, paddingLeft: 40, background: "var(--bg)", borderColor: "transparent" }} />
        </div>
      }>
      <div role="radiogroup" aria-label="Brand">
        {groups.map((g) => (
          <div key={g.group}>
            <p className="cap" style={{ fontSize: 12, fontWeight: 600, margin: "18px 2px 2px" }}>{g.group}</p>
            {g.list.map((b) => {
              const on = !typing && sel === b.name;
              return (
                <button key={b.name} type="button" role="radio" aria-checked={on} onClick={() => { setSel(b.name); setTyping(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 56, padding: "8px 2px", borderBottom: "1px solid var(--line)", textAlign: "left" }}>
                  <BrandMark name={b.name} />
                  <span style={{ flex: 1, fontSize: 15, fontWeight: on ? 600 : 500 }}>{b.name}</span>
                  <Radio on={on} />
                </button>
              );
            })}
          </div>
        ))}
        {!groups.length && <p className="meta" style={{ padding: "16px 0 4px", fontSize: 14 }}>No brand called “{q.trim()}” in the list. Type it in below.</p>}
      </div>
      {/* brands that aren't listed */}
      {typing ? (
        <div style={{ marginTop: 18 }}>
          <label className="flabel" htmlFor="brand-custom">Custom brand</label>
          <input id="brand-custom" className="input" autoFocus value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={30} placeholder="Type the brand name" />
        </div>
      ) : (
        <button type="button" className="link" style={{ marginTop: 16 }} onClick={() => { setTyping(true); if (!custom && term) setCustom(q.trim()); }}>
          <Plus size={14} weight="bold" />Add a custom brand
        </button>
      )}
      <div style={{ position: "sticky", bottom: -28, padding: "12px 0 0", marginTop: 8, background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 30%)" }}>
        <button type="button" className="btn btn-blue" style={{ width: "100%" }} disabled={!pick} onClick={() => { onDone(pick); onClose(); }}>Done</button>
      </div>
    </Sheet>
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
