import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { MagnifyingGlass, X, ClockCounterClockwise, MapPin, CaretRight, Check, SlidersHorizontal } from "@phosphor-icons/react";
import { StatusBar, SportIcon, type Route } from "../components";
import { Sheet } from "../sheet";
import { activities, entries, locations, byId, type Entry } from "../data";

const recent = ["Sea swim", "Adyar", "5K"];
const TOP_TAGS = 6;

const textHit = (e: Entry, t: string) => !t || e.title.toLowerCase().includes(t) || e.place.toLowerCase().includes(t) || byId(e.activity).name.toLowerCase().includes(t) || e.note.toLowerCase().includes(t);
const tagHit = (e: Entry, tags: string[]) => tags.every((x) => e.tags?.includes(x));
const allTags = [...new Set(entries.flatMap((e) => e.tags ?? []))];

/* How many activities each tag would show, given the words typed and the tags already picked */
function tagCounts(t: string, picked: string[]) {
  const pool = entries.filter((e) => textHit(e, t) && tagHit(e, picked));
  const n: Record<string, number> = {};
  for (const tag of allTags) n[tag] = pool.filter((e) => e.tags?.includes(tag)).length;
  return n;
}

function TagChip({ tag, count, on, onClick }: { tag: string; count: number; on: boolean; onClick: () => void }) {
  const off = !on && count === 0;
  return (
    <button type="button" aria-pressed={on} disabled={off} onClick={onClick} aria-label={`${tag}, ${count} ${count === 1 ? "activity" : "activities"}${on ? ", selected" : ""}`}
      style={{ flex: "none", height: 36, padding: on ? "0 10px 0 14px" : "0 12px 0 14px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: on ? 600 : 500,
        background: on ? "var(--blue)" : "#fff", color: on ? "#fff" : "var(--ink)", border: `1px solid ${on ? "var(--blue)" : "var(--line)"}`, opacity: off ? 0.45 : 1, transition: "all .18s" }}>
      {tag}
      <span className="num" style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 650,
        background: on ? "rgba(255,255,255,0.22)" : "var(--bg)", color: on ? "#fff" : "var(--gray)" }}>{count}</span>
      {on && <X size={13} weight="bold" aria-hidden />}
    </button>
  );
}

function TagSheet({ t, value, onApply, onClose }: { t: string; value: string[]; onApply: (tags: string[]) => void; onClose: () => void }) {
  const [sel, setSel] = useState(value);
  const [q, setQ] = useState("");
  const counts = tagCounts(t, sel);
  const term = q.trim().toLowerCase();
  const list = allTags.filter((x) => !term || x.toLowerCase().includes(term)).sort((a, b) => Number(sel.includes(b)) - Number(sel.includes(a)) || counts[b] - counts[a] || a.localeCompare(b));
  const toggle = (x: string) => setSel((s) => (s.includes(x) ? s.filter((y) => y !== x) : [...s, x]));
  const shown = entries.filter((e) => textHit(e, t) && tagHit(e, sel)).length;
  return (
    <Sheet id="search-tags" title="Filter by tags" sub="Show activities that have every tag you pick." onClose={onClose} expandable
      head={
        <div style={{ position: "relative", marginTop: 12 }}>
          <MagnifyingGlass size={17} color="var(--gray)" aria-hidden style={{ position: "absolute", left: 14, top: 15 }} />
          <input type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tags" aria-label="Search tags" style={{ height: 46, paddingLeft: 40, background: "var(--bg)", borderColor: "transparent" }} />
        </div>
      }>
      <div role="group" aria-label="Tags" style={{ marginTop: 8 }}>
        {list.map((x) => {
          const on = sel.includes(x), off = !on && counts[x] === 0;
          return (
            <button key={x} type="button" role="checkbox" aria-checked={on} disabled={off} onClick={() => toggle(x)}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 52, padding: "6px 2px", borderBottom: "1px solid var(--line)", textAlign: "left", opacity: off ? 0.45 : 1 }}>
              <span style={{ flex: 1, fontSize: 15, fontWeight: on ? 600 : 500 }}>{x}</span>
              <span className="num cap">{counts[x]}</span>
              <span aria-hidden style={{ width: 22, height: 22, borderRadius: 6, flex: "none", display: "grid", placeItems: "center", border: on ? "none" : "1.5px solid #C3C9D4", background: on ? "var(--blue)" : "#fff", color: "#fff" }}>
                {on && <Check size={13} weight="bold" />}
              </span>
            </button>
          );
        })}
        {!list.length && <p className="meta" style={{ padding: "14px 0", fontSize: 14 }}>No tag called “{q}”.</p>}
      </div>
      <div style={{ position: "sticky", bottom: -28, display: "grid", gridTemplateColumns: sel.length ? "1fr 2fr" : "1fr", gap: 8, padding: "12px 0 0", marginTop: 8, background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 30%)" }}>
        {sel.length > 0 && <button type="button" className="btn btn-soft" onClick={() => setSel([])}>Clear</button>}
        <button type="button" className="btn btn-blue" onClick={() => { onApply(sel); onClose(); }}>Show {shown} {shown === 1 ? "activity" : "activities"}</button>
      </div>
    </Sheet>
  );
}

export default function Search({ go }: { go: (r: Route) => void }) {
  const [q, setQ] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [sheet, setSheet] = useState(false);
  const t = q.trim().toLowerCase();
  const filtering = !!t || tags.length > 0;
  const hits = useMemo(() => ({
    acts: entries.filter((e) => filtering && textHit(e, t) && tagHit(e, tags)),
    places: tags.length ? [] : locations.filter((l) => t && l.name.toLowerCase().includes(t)),
  }), [t, tags, filtering]);
  const counts = useMemo(() => tagCounts(t, tags), [t, tags]);
  // picked tags first, then the busiest
  const row = [...tags, ...allTags.filter((x) => !tags.includes(x) && counts[x] > 0).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))].slice(0, Math.max(TOP_TAGS, tags.length));
  const toggle = (x: string) => setTags((s) => (s.includes(x) ? s.filter((y) => y !== x) : [...s, x]));

  return (
    <>
    <div className="body">
      <StatusBar />
      <header className="pad top">
        <h1 className="title">Search</h1>
        <div style={{ position: "relative", marginTop: 16 }}>
          <MagnifyingGlass size={18} color="var(--gray)" style={{ position: "absolute", left: 16, top: 18 }} />
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Activities, places, notes" aria-label="Search" style={{ paddingLeft: 44, paddingRight: 44 }} />
          {q && <button aria-label="Clear search" onClick={() => setQ("")} style={{ position: "absolute", right: 8, top: 7, width: 40, height: 40, display: "grid", placeItems: "center", color: "var(--gray)" }}><X size={18} /></button>}
        </div>
      </header>

      {/* tag filters: tap to narrow, the count says how many activities each would show */}
      <div role="group" aria-label="Filter by tag" style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", padding: "12px 20px 2px" }}>
        <button type="button" onClick={() => setSheet(true)} aria-label={tags.length ? `Tags, ${tags.length} selected. Change` : "All tags"}
          style={{ flex: "none", height: 36, padding: "0 12px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "var(--blue)", background: "var(--blue-50)", border: "1px solid transparent" }}>
          <SlidersHorizontal size={15} weight="bold" aria-hidden />Tags{tags.length > 0 && <span className="num">({tags.length})</span>}
        </button>
        {row.map((x) => <TagChip key={x} tag={x} count={counts[x]} on={tags.includes(x)} onClick={() => toggle(x)} />)}
      </div>

      <div className="pad" style={{ paddingBottom: 120 }}>
        {!filtering ? (
          <>
            <div className="sec"><h2 className="h2">Recent</h2><button className="link" style={{ color: "var(--gray)" }}>Clear</button></div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {recent.map((r) => <button key={r} className="chip" onClick={() => setQ(r)}><ClockCounterClockwise size={15} />{r}</button>)}
            </div>
            <div className="sec"><h2 className="h2">Browse by sport</h2></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {activities.slice(0, 12).map(({ id, name, Icon }) => (
                <button key={id} onClick={() => setQ(name)} style={{ display: "grid", justifyItems: "center", gap: 8, padding: "14px 4px", borderRadius: 18, background: "#fff", border: "1px solid var(--line)", fontSize: 12 }}>
                  <SportIcon Icon={Icon} size={26} />{name}
                </button>
              ))}
            </div>
          </>
        ) : hits.acts.length + hits.places.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 12px" }}>
            <p className="h2">{t ? `No matches for "${q}"` : "No activities have all these tags"}</p>
            <p className="meta" style={{ marginTop: 6, lineHeight: 1.5 }}>{tags.length ? "Remove a tag to see more." : "Try a sport, a place, or a word from one of your notes."}</p>
            {tags.length > 0 && <button type="button" className="link" style={{ marginTop: 12 }} onClick={() => setTags([])}>Clear tags</button>}
          </div>
        ) : (
          <>
            {hits.acts.length > 0 && (
              <>
                <div className="sec">
                  <h2 className="h2">Activities</h2>
                  {tags.length ? <button type="button" className="link" style={{ fontSize: 14 }} onClick={() => setTags([])}>Clear tags</button> : <span className="cap">{hits.acts.length}</span>}
                </div>
                <div className="card" style={{ padding: "4px 16px" }}>
                  {hits.acts.map((e, i) => {
                    const A = byId(e.activity);
                    return (
                      <button key={e.id} onClick={() => go("summary")} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "13px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                        <SportIcon Icon={A.Icon} size={20} />
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "block", fontSize: 15, fontWeight: 560 }}>{e.title}</span>
                          <span className="cap" style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.when}{e.tags?.length ? ` · ${e.tags.join(", ")}` : ""}</span>
                        </span>
                        <CaretRight size={16} color="var(--gray-2)" />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {hits.places.length > 0 && (
              <>
                <div className="sec"><h2 className="h2">Places</h2></div>
                <div className="card" style={{ padding: "4px 16px" }}>
                  {hits.places.map((l, i) => (
                    <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                      <MapPin size={20} weight="duotone" color="var(--ink)" />
                      <span style={{ flex: 1 }}><span style={{ display: "block", fontSize: 15, fontWeight: 560 }}>{l.name}</span><span className="cap">{l.count} {l.kind}</span></span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
    <AnimatePresence>
      {sheet && <TagSheet key="tags" t={t} value={tags} onApply={setTags} onClose={() => setSheet(false)} />}
    </AnimatePresence>
    </>
  );
}
