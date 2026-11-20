// Add gear: one page of details, with a sheet for the gear type and one for the activities it's used for.
import { useRef, useState } from "react";
import {
  Sneaker, Bicycle, Watch, Backpack, HardHat, Goggles, DotsThree, Stack, PersonSimpleRun, Tag, NotePencil, Bell, Image as ImageIcon,
  Check, CaretRight, MagnifyingGlass, Mountains, Sparkle,
} from "@phosphor-icons/react";
import { Sheet } from "../sheet";
import { activities } from "../data";
import type { Gear, GearKind } from "../entryData";
import { Page } from "./entryParts";

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

function Box({ Icon, label, req, opt, right, children, onClick }: { Icon: typeof Sneaker; label: string; req?: boolean; opt?: boolean; right?: React.ReactNode; children?: React.ReactNode; onClick?: () => void }) {
  const inner = (
    <>
      <span aria-hidden style={{ width: 40, height: 40, borderRadius: 12, background: "var(--bg)", display: "grid", placeItems: "center", flex: "none", color: "var(--ink)" }}><Icon size={20} /></span>
      <span style={{ flex: 1, minWidth: 0, display: "grid", gap: 2 }}>
        <span style={{ fontSize: 15, fontWeight: 650 }}>{label}{req && <span style={{ color: "#D92D20" }}> *</span>}{opt && <span style={{ fontWeight: 400, color: "var(--gray)" }}> (Optional)</span>}</span>
        {children}
      </span>
      {right}
    </>
  );
  const style: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 12px", borderRadius: 16, border: "1px solid var(--line)", background: "#fff", textAlign: "left" };
  return onClick ? <button type="button" onClick={onClick} style={style}>{inner}</button> : <label style={style}>{inner}</label>;
}
const fieldStyle: React.CSSProperties = { width: "100%", border: 0, outline: "none", padding: 0, fontSize: 15, background: "transparent", color: "var(--ink)" };

export function AddGearPage({ kind, sport, onSave, onBack }: { kind: GearKind; sport: string; onSave: (g: Gear) => void; onBack: () => void }) {
  const [type, setType] = useState<GearKind>(kind);
  const [name, setName] = useState("");
  const [uses, setUses] = useState<string[]>(() => [...new Set([sport, ...(DEFAULT_USES[kind] ?? [])])]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [nick, setNick] = useState("");
  const [notes, setNotes] = useState("");
  const [km, setKm] = useState("");
  const [notify, setNotify] = useState(true);
  const [limit, setLimit] = useState(String(DEFAULT_LIMIT[kind] ?? 700));
  const [photo, setPhoto] = useState<string>();
  const [sheet, setSheet] = useState<null | "type" | "uses">(null);
  const file = useRef<HTMLInputElement>(null);
  const t = typeOf(type);
  const ok = !!name.trim() && uses.length > 0;
  const save = () => {
    if (!ok) return;
    onSave({
      id: `g-${Date.now()}`, kind: type, name: name.trim(), km: Number(km) || 0, limit: TRACKS_KM(type) && notify ? Number(limit) || 0 : 0,
      img: photo ?? (type === "shoe" ? "/img/auth-shoe.png" : type === "bike" ? "/img/ride-sq.jpg" : ""), uses, brand: brand.trim() || undefined, model: model.trim() || undefined,
      nickname: nick.trim() || undefined, notes: notes.trim() || undefined,
    });
  };
  const usesText = uses.map((id) => activities.find((a) => a.id === id)?.name ?? id).join(", ");

  return (
    <>
      <Page title="Add gear" onBack={onBack} footer={<button type="button" className="btn btn-blue" style={{ width: "100%" }} disabled={!ok} onClick={save}>Save gear</button>}>
        <div className="pad" style={{ paddingTop: 18, paddingBottom: 12, display: "grid", gap: 10 }}>
          <div style={{ marginBottom: 6 }}>
            <h1 className="h2" style={{ fontSize: 22 }}>Tell us about your gear</h1>
            <p className="meta" style={{ fontSize: 14, marginTop: 4, lineHeight: 1.45 }}>Add the details and choose which activities you'll use it for.</p>
          </div>

          <Box Icon={t.Icon} label="Gear type" req onClick={() => setSheet("type")} right={<span style={{ color: "var(--blue)", fontWeight: 600, fontSize: 15 }}>{t.name}</span>}>
            <span className="cap">Choose the type of gear</span>
          </Box>
          <Box Icon={Stack} label="Gear name" req>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={type === "shoe" ? "Such as PUMA Nitro White" : type === "bike" ? "Such as Trek Domane AL 2" : "Give it a name"} aria-label="Gear name" maxLength={40} style={fieldStyle} />
          </Box>
          <Box Icon={PersonSimpleRun} label="Used for" req onClick={() => setSheet("uses")}
            right={uses.length ? <span style={{ flex: "none", padding: "4px 10px", borderRadius: 999, background: "var(--blue-50)", color: "var(--blue)", fontSize: 13, fontWeight: 600 }}>{uses.length} selected</span> : <CaretRight size={16} color="var(--gray)" />}>
            <span className="cap" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{uses.length ? usesText : "Pick the activities you'll use it for"}</span>
          </Box>
          <Box Icon={Mountains} label="Brand" opt><input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Such as PUMA" aria-label="Brand" maxLength={30} style={fieldStyle} /></Box>
          <Box Icon={Tag} label="Model" opt><input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Such as Nitro" aria-label="Model" maxLength={30} style={fieldStyle} /></Box>
          <Box Icon={Sparkle} label="Nickname" opt><input value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Such as White" aria-label="Nickname" maxLength={30} style={fieldStyle} /></Box>
          <Box Icon={NotePencil} label="Notes" opt><input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Such as my everyday running shoe" aria-label="Notes" maxLength={80} style={fieldStyle} /></Box>

          {TRACKS_KM(type) && (
            <div style={{ padding: "12px 14px", borderRadius: 16, background: "var(--blue-50)" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <span aria-hidden style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", flex: "none" }}><Bell size={20} /></span>
                <span>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 650 }}>Usage and reminder <span style={{ fontWeight: 400, color: "var(--gray)" }}>(Optional)</span></span>
                  <span className="cap">Track distance and get a reminder to replace it.</span>
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 12, marginTop: 12 }}>
                <label style={{ display: "grid", gap: 4 }}>
                  <span style={{ fontSize: 13, color: "#344054" }}>Current distance</span>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <input className="num" inputMode="decimal" value={km} onChange={(e) => setKm(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" aria-label="Current distance in km" style={{ ...fieldStyle, width: 70, fontSize: 20, fontWeight: 650 }} />
                    <span style={{ fontSize: 15, fontWeight: 600 }}>km</span>
                  </span>
                </label>
                <span aria-hidden style={{ background: "#C7D7FE" }} />
                <div style={{ display: "grid", gap: 4 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#344054", cursor: "pointer" }}>
                    <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--blue)" }} />Notify me at
                  </label>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 4, opacity: notify ? 1 : 0.4 }}>
                    <input className="num" inputMode="numeric" disabled={!notify} value={limit} onChange={(e) => setLimit(e.target.value.replace(/[^0-9]/g, ""))} aria-label="Reminder distance in km" style={{ ...fieldStyle, width: 70, fontSize: 20, fontWeight: 650 }} />
                    <span style={{ fontSize: 15, fontWeight: 600 }}>km</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          <Box Icon={ImageIcon} label="Photo" opt onClick={() => file.current?.click()}
            right={photo ? <img src={photo} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }} /> : <CaretRight size={16} color="var(--gray)" />}>
            <span className="cap">{photo ? "Tap to change it" : "Add a photo of your gear"}</span>
          </Box>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f)); }} />
        </div>
      </Page>
      {sheet === "type" && <GearTypeSheet value={type} onDone={(k) => { setType(k); if (DEFAULT_LIMIT[k]) setLimit(String(DEFAULT_LIMIT[k])); }} onClose={() => setSheet(null)} />}
      {sheet === "uses" && <UsedForSheet value={uses} onApply={setUses} onClose={() => setSheet(null)} />}
    </>
  );
}

function Radio({ on }: { on: boolean }) {
  return (
    <span aria-hidden style={{ width: 24, height: 24, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", border: on ? "none" : "1.5px solid #C3C9D4", background: on ? "var(--blue)" : "#fff" }}>
      {on && <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fff" }} />}
    </span>
  );
}

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
              <Icon size={26} aria-hidden color={on ? "var(--blue)" : "var(--ink)"} />
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 16, fontWeight: 650 }}>{name}</span>
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
    <Sheet id="gear-uses" title="Used for" onClose={onClose} expandable
      head={
        <div style={{ position: "relative", marginTop: 12 }}>
          <MagnifyingGlass size={17} color="var(--gray)" aria-hidden style={{ position: "absolute", left: 14, top: 15 }} />
          <input type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activities" aria-label="Search activities" style={{ height: 46, paddingLeft: 40, background: "var(--bg)", borderColor: "transparent" }} />
        </div>
      }>
      {!term && (
        <>
          <h3 className="h2" style={{ fontSize: 16, margin: "18px 0 10px" }}>Your top activities</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingBottom: 16, borderBottom: "1px solid var(--line)" }}>
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
      <h3 className="h2" style={{ fontSize: 16, margin: "18px 0 4px" }}>{term ? `Results (${list.length})` : "All activities"}</h3>
      <div role="group" aria-label="Activities">
        {list.map((a) => {
          const on = sel.includes(a.id);
          return (
            <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 50, borderBottom: "1px solid var(--line)", cursor: "pointer" }}>
              <span style={{ flex: 1, fontSize: 15, fontWeight: on ? 600 : 400 }}>{a.name}</span>
              <input type="checkbox" checked={on} onChange={() => toggle(a.id)} style={{ width: 22, height: 22, accentColor: "var(--blue)" }} />
            </label>
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
