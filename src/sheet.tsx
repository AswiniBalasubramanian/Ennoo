import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { X } from "@phosphor-icons/react";

/* How much of the screen the on-screen keyboard covers, so a sheet can sit just above it.
   Mobile browsers shrink the visual viewport, not the layout, when the keypad opens. */
export function useKeyboardInset() {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setInset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    vv.addEventListener("resize", update); vv.addEventListener("scroll", update); update();
    return () => { vv.removeEventListener("resize", update); vv.removeEventListener("scroll", update); };
  }, []);
  return inset;
}

/* Bottom sheet: scrim, grab handle, title, close. Escape closes it; it rides above the keypad.
   Render inside <AnimatePresence> so it slides out on close. */
export function Sheet({ id, title, sub, onClose, children }: { id: string; title: string; sub?: React.ReactNode; onClose: () => void; children: React.ReactNode }) {
  const kb = useKeyboardInset();
  return (
    <motion.div key={id} initial={{ opacity: 1 }} exit={{ opacity: 1 }} transition={{ duration: 0.3 }}
      style={{ position: "absolute", inset: 0, zIndex: 30, display: "flex", alignItems: "flex-end", paddingBottom: kb, transition: "padding-bottom .25s var(--ease)" }}>
      <motion.div aria-hidden onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        style={{ position: "absolute", inset: 0, background: "rgba(11,18,32,0.42)" }} />
      <motion.div role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 420, damping: 40 }}
        style={{ position: "relative", width: "100%", maxHeight: "92%", overflowY: "auto", background: "#fff", borderRadius: "24px 24px 0 0", padding: kb ? "10px 20px 14px" : "10px 20px 28px", boxShadow: "0 -12px 40px -20px rgba(11,18,32,0.4)" }}>
        <span aria-hidden style={{ display: "block", width: 36, height: 4, borderRadius: 2, background: "var(--line)", margin: "0 auto 12px" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 id={`${id}-title`} className="h2" style={{ fontSize: 20 }}>{title}</h2>
            {sub && <p className="meta" style={{ fontSize: 14, marginTop: 4, lineHeight: 1.45 }}>{sub}</p>}
          </div>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose} style={{ border: 0, marginRight: -10, marginTop: -6, flex: "none" }}><X size={20} weight="bold" /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* One scroll wheel: snaps row by row, the centred row is the value. Only rows near the current
   one are rendered, so even a 1–5,000 range stays light. Arrow keys step it; tapping a row picks it. */
export const ROW = 44, VISIBLE = 5, PAD = ROW * ((VISIBLE - 1) / 2);
export function Wheel({ items, index, onChange, label, big }: { items: string[]; index: number; onChange: (i: number) => void; label: string; big?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(index);
  useEffect(() => { if (ref.current) ref.current.scrollTop = index * ROW; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // follow outside changes (a preset chip, a unit switch) without fighting the user's own scroll:
  // jump instantly, and only once the rows around the new value are rendered: a smooth scroll would
  // report every row it passes, and scrolling before the re-render lets the browser re-snap to a stale row
  const pending = useRef<number | null>(null);
  useEffect(() => { if (index !== cur) { pending.current = index; setCur(index); } }, [index]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => { if (pending.current !== null && ref.current) { ref.current.scrollTop = pending.current * ROW; pending.current = null; } });
  // a tap on a row or an arrow key sets the value first, then moves the wheel to it (same path as above)
  const go = (n: number) => {
    const i = Math.max(0, Math.min(items.length - 1, n));
    pending.current = i;
    if (i !== cur) { setCur(i); onChange(i); } else if (ref.current) { ref.current.scrollTop = i * ROW; pending.current = null; }
  };
  const onScroll = () => {
    if (pending.current !== null) return;
    const i = Math.max(0, Math.min(items.length - 1, Math.round((ref.current?.scrollTop ?? 0) / ROW)));
    if (i !== cur) { setCur(i); onChange(i); }
  };
  const from = Math.max(0, cur - 30), to = Math.min(items.length, cur + 31);
  return (
    <div ref={ref} role="spinbutton" tabIndex={0} aria-label={label} aria-valuenow={cur} aria-valuetext={items[cur]}
      onScroll={onScroll} onKeyDown={(e) => { if (e.key === "ArrowUp") { e.preventDefault(); go(cur - 1); } if (e.key === "ArrowDown") { e.preventDefault(); go(cur + 1); } }}
      style={{ position: "relative", height: ROW * VISIBLE, overflowY: "auto", scrollSnapType: "y mandatory", scrollbarWidth: "none", overscrollBehavior: "contain", overflowAnchor: "none",
        WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 32%, #000 68%, transparent 100%)", maskImage: "linear-gradient(180deg, transparent 0%, #000 32%, #000 68%, transparent 100%)",
        borderRadius: 12, outlineOffset: -2 }}>
      <div style={{ height: PAD + from * ROW }} />
      {items.slice(from, to).map((t, k) => {
        const i = from + k, d = Math.abs(i - cur);
        return (
          <div key={i} onClick={() => go(i)} className="num"
            style={{ height: ROW, scrollSnapAlign: "center", display: "grid", placeItems: "center", cursor: "pointer", letterSpacing: 0, whiteSpace: "nowrap",
              fontSize: d === 0 ? (big ? 28 : 22) : big ? 20 : 17, fontWeight: d === 0 ? 650 : 500,
              color: d === 0 ? "var(--ink)" : "var(--gray)", opacity: d === 0 ? 1 : d === 1 ? 0.7 : 0.35, transition: "font-size .12s, opacity .12s" }}>
            {t}
          </div>
        );
      })}
      <div style={{ height: PAD + (items.length - to) * ROW }} />
    </div>
  );
}
/* The band behind the centred row, shared by every wheel in a sheet */
export const WheelBand = () => <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: PAD, height: ROW, borderRadius: 14, background: "var(--blue-50)" }} />;
