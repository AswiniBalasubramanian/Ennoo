import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, PencilSimpleLine, MapPin } from "@phosphor-icons/react";
import { StatusBar, SportIcon, type Route } from "../components";
import { entries, byId, type Entry } from "../data";

const filters = ["All", "run", "cycle", "swim", "yoga", "stairs"] as const;

function Item({ e, go, first }: { e: Entry; go: (r: Route) => void; first: boolean }) {
  const A = byId(e.activity);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 12 }}>
      {/* Rail: the timeline itself */}
      <div style={{ position: "relative", display: "grid", justifyItems: "center" }}>
        <span style={{ position: "absolute", top: first ? 18 : 0, bottom: 0, width: 2, background: "var(--line)" }} />
        <span style={{ position: "relative", marginTop: 14, width: 28, height: 28, borderRadius: "50%", background: "#fff", border: "1px solid var(--line)", color: "var(--blue)", display: "grid", placeItems: "center" }}><SportIcon Icon={A.Icon} size={16} /></span>
      </div>
      <article className="card" style={{ overflow: "hidden", marginBottom: 14 }}>
        <button onClick={() => go("summary")} style={{ display: "block", width: "100%", textAlign: "left" }}>
          {e.photo && <img src={e.photo} alt="" style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />}
          <div style={{ padding: "14px 16px 0" }}>
            <p className="cap">{e.when}</p>
            <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 2 }}>{e.title}</h3>
            <div className="num" style={{ display: "flex", gap: 18, marginTop: 10, letterSpacing: 0 }}>
              {[e.distance, e.duration, e.pace].filter(Boolean).map((v) => <span key={v} style={{ fontSize: 15, fontWeight: 600 }}>{v}</span>)}
            </div>
            <p className="cap" style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}><MapPin size={12} weight="fill" />{e.place}</p>
          </div>
        </button>
        <div style={{ padding: "12px 16px 16px" }}>
          {e.note
            ? <p style={{ fontSize: 14, lineHeight: 1.5, paddingLeft: 12, borderLeft: "2px solid var(--blue)" }}>{e.note}</p>
            : <button className="link" onClick={() => go("summary")}><PencilSimpleLine size={15} />Add a note</button>}
        </div>
      </article>
    </div>
  );
}

export default function Timeline({ go }: { go: (r: Route) => void }) {
  const [f, setF] = useState<(typeof filters)[number]>("All");
  const list = entries.filter((e) => f === "All" || e.activity === f);

  return (
    <div className="body">
      <StatusBar />
      <header className="pad top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="title">Timeline</h1>
          <p className="meta" style={{ marginTop: 4 }}>October, 5 activities so far</p>
        </div>
        <button className="icon-btn" aria-label="Filter and sort"><SlidersHorizontal size={20} /></button>
      </header>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "18px 20px 6px", scrollbarWidth: "none" }}>
        {filters.map((x) => <button key={x} className="chip" aria-pressed={f === x} onClick={() => setF(x)}>{x === "All" ? "All" : byId(x).name}</button>)}
      </div>
      <div className="pad" style={{ paddingTop: 14, paddingBottom: 120 }}>
        <AnimatePresence mode="wait">
          <motion.div key={f} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {list.map((e, i) => <Item key={e.id} e={e} go={go} first={i === 0} />)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
