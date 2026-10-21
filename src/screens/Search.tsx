import { useMemo, useState } from "react";
import { MagnifyingGlass, X, ClockCounterClockwise, MapPin, CaretRight } from "@phosphor-icons/react";
import { StatusBar, SportIcon, type Route } from "../components";
import { activities, entries, locations, byId } from "../data";

const recent = ["Sea swim", "Adyar", "5K"];

export default function Search({ go }: { go: (r: Route) => void }) {
  const [q, setQ] = useState("");
  const t = q.trim().toLowerCase();
  const hits = useMemo(() => ({
    acts: entries.filter((e) => t && (e.title.toLowerCase().includes(t) || e.place.toLowerCase().includes(t) || byId(e.activity).name.toLowerCase().includes(t))),
    places: locations.filter((l) => t && l.name.toLowerCase().includes(t)),
  }), [t]);

  return (
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

      <div className="pad" style={{ paddingBottom: 120 }}>
        {!t ? (
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
            <p className="h2">No matches for "{q}"</p>
            <p className="meta" style={{ marginTop: 6, lineHeight: 1.5 }}>Try a sport, a place, or a word from one of your notes.</p>
          </div>
        ) : (
          <>
            {hits.acts.length > 0 && (
              <>
                <div className="sec"><h2 className="h2">Activities</h2><span className="cap">{hits.acts.length}</span></div>
                <div className="card" style={{ padding: "4px 16px" }}>
                  {hits.acts.map((e, i) => {
                    const A = byId(e.activity);
                    return (
                      <button key={e.id} onClick={() => go("summary")} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "13px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                        <SportIcon Icon={A.Icon} size={20} />
                        <span style={{ flex: 1 }}><span style={{ display: "block", fontSize: 15, fontWeight: 560 }}>{e.title}</span><span className="cap">{e.when}</span></span>
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
                      <MapPin size={20} weight="fill" color="var(--blue)" />
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
  );
}
