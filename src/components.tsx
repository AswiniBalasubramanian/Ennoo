import { motion } from "motion/react";
import { WORD } from "./wordmark";
import {
  CellSignalFull, WifiHigh, BatteryFull,
  House, MagnifyingGlass, ClockCounterClockwise, UserCircle, Plus, ArrowLeft,
} from "@phosphor-icons/react";

export type Route = "splash" | "welcome" | "login" | "signup" | "onboarding" | "pro" | "home" | "search" | "record" | "summary" | "timeline" | "profile";

export function StatusBar({ onBlue = false }: { onBlue?: boolean }) {
  return (
    <div className={`status${onBlue ? " on-blue" : ""}`} aria-hidden>
      <span className="num" style={{ letterSpacing: 0 }}>9:41</span>
      <span className="status-icons">
        <CellSignalFull size={17} weight="fill" />
        <WifiHigh size={17} weight="bold" />
        <BatteryFull size={25} weight="fill" />
      </span>
    </div>
  );
}

/* Brand assets, traced from the supplied 3.svg and Wordmark.svg. Fill follows currentColor. */
export function Mark({ size = 28, color = "var(--blue)" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="14 45 96 33" height={size * 0.34} width={size} fill={color} role="img" aria-label="Ennoo">
      <path d="M107.11,47.2c1.08,0,1.84.87,1.71,1.95l-3.08,25.1c-.15,1.24-1.18,2.27-2.37,2.49-.16.02-.31.04-.47.04h-3.26c-.61,0-1.19-.2-1.630-.57l-18.16-15.04-6.86-5.650c-.1-.08-.23-.13-.37-.14h-.18c-.47.04-.85.41-.91.87l-2.28,18.59c-.13,1.08-1.11,1.95-2.19,1.95h-2.24c-1.08,0-1.84-.87-1.71-1.95l3.09-25.13c.17-1.4,1.44-2.53,2.84-2.53h3.26c.61,0,1.18.2,1.63.57l6.88,5.67,18.02,14.9s.07.07.12.11c.13.09.3.15.48.15.47,0,.91-.38.99-.85l2.28-18.59c.13-1.08,1.11-1.95,2.19-1.95h2.24Z" />
      <path d="M56.26,72.61l-.28,2.24c-.13,1.08-1.11,1.95-2.19,1.95H17.41c-1.41,0-2.39-1.130-2.22-2.53l1.49-12.12c.29-2.37,2.32-3.22,4.68-3.22h27.58c1.26,0,2.18.87,2.05,1.95l-.28,2.27c-.14,1.06-1.28,1.93-2.53,1.93h-24.85c-.46,0-.88.34-.97.8l-.49,3.98c-.02.46.31.8.78.8h31.89c1.08,0,1.84.87,1.71,1.95Z" />
      <path d="M57.43,47.2H20.46c-1.08,0-2.06.87-2.19,1.95l-.28,2.24c-.13,1.08.63,1.950,1.71,1.95h36.96c1.08,0,2.06-.87,2.19-1.95l.28-2.24c.13-1.08-.63-1.950-1.71-1.95Z" />
    </svg>
  );
}

export function Wordmark({ width = 120, color = "var(--blue)", style }: { width?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 1920 241.81" width={width} fill={color} role="img" aria-label="Ennoo" style={style}>
      {Object.values(WORD).map((d) => <path key={d.slice(0, 12)} d={d} />)}
    </svg>
  );
}

const tabs: { id: Route; label: string; Icon: typeof House }[] = [
  { id: "home", label: "Home", Icon: House },
  { id: "search", label: "Search", Icon: MagnifyingGlass },
  { id: "timeline", label: "Timeline", Icon: ClockCounterClockwise },
  { id: "profile", label: "Profile", Icon: UserCircle },
];

export function TabBar({ route, go }: { route: Route; go: (r: Route) => void }) {
  const Tab = ({ id, label, Icon }: (typeof tabs)[number]) => {
    const on = route === id;
    return (
      <button className="tab" aria-current={on ? "page" : undefined} onClick={() => go(id)}>
        <Icon size={24} weight={on ? "fill" : "regular"} />
        {label}
      </button>
    );
  };
  return (
    <nav className="tabbar" aria-label="Main">
      {tabs.slice(0, 2).map((t) => <Tab key={t.id} {...t} />)}
      <div style={{ display: "grid", placeItems: "center" }}>
        <button className="record-fab" aria-label="Record an activity" onClick={() => go("record")}>
          <Plus size={26} weight="bold" />
        </button>
      </div>
      {tabs.slice(2).map((t) => <Tab key={t.id} {...t} />)}
    </nav>
  );
}

/* Progress ring. Track is quiet, the arc carries the splash. */
export function Ring({ p, size = 120, stroke = 10, track = "rgba(255,255,255,0.18)", id = "ring" }: {
  p: number; size?: number; stroke?: number; track?: string; id?: string;
}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ rotate: "-90deg", display: "block" }}>
      <defs><linearGradient id={id} x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#2fd4ec" /><stop offset="1" stopColor="#3ee29a" /></linearGradient></defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - Math.min(p, 1)) }} transition={{ duration: 1.3, delay: 0.15, ease: [0.65, 0, 0.35, 1] }} />
    </svg>
  );
}

/* Route map. Streets are context, the route is the story, so only the route gets the splash. */
export function RouteMap({ tone = "light", draw = true, height = 200, markers = true, route: showRoute = true, progress }: {
  tone?: "light" | "blue"; draw?: boolean; height?: number; markers?: boolean; route?: boolean; progress?: number;
}) {
  const blue = tone === "blue";
  const ground = blue ? "transparent" : "#f1f4f8";
  const street = blue ? "rgba(255,255,255,0.08)" : "#ffffff";
  const river = blue ? "rgba(255,255,255,0.07)" : "#dde8ff";
  const pill = blue ? { fill: "#ffffff", text: "#0054fb" } : { fill: "#0b1220", text: "#ffffff" };
  const path = "M40 172 C 70 140, 62 108, 98 94 S 150 102, 170 74 S 214 30, 252 42 S 300 86, 286 122 S 236 160, 206 150";
  const kms: [number, number, string][] = [[98, 94, "2"], [170, 74, "4"], [252, 42, "6"], [286, 122, "8"]];
  return (
    <svg viewBox="0 0 340 200" width="100%" height={height} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Route map, 8.4 km loop along the Adyar river" style={{ display: "block", background: ground }}>
      <defs>
        <linearGradient id={`rg-${tone}`} x1="0" x2="1"><stop offset="0" stopColor="#2fd4ec" /><stop offset="1" stopColor="#3ee29a" /></linearGradient>
      </defs>
      <g stroke={street} strokeWidth="8" fill="none" strokeLinecap="round">
        <path d="M-10 36 L 350 62" /><path d="M-10 112 L 350 138" /><path d="M-10 186 L 350 176" />
        <path d="M60 -10 L 30 220" /><path d="M140 -10 L 130 220" /><path d="M230 -10 L 220 220" /><path d="M310 -10 L 320 220" />
      </g>
      <path d="M-10 84 C 80 62, 140 130, 220 100 S 320 52, 360 72" stroke={river} strokeWidth="18" fill="none" strokeLinecap="round" />
      {showRoute && (
        <>
          <motion.path d={path} fill="none" stroke={`url(#rg-${tone})`} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
            initial={draw ? { pathLength: 0 } : false} animate={{ pathLength: progress ?? 1 }}
            transition={progress === undefined ? { duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: 0.15 } : { duration: 1, ease: "linear" }} />
          <circle cx="40" cy="172" r="6" fill={blue ? "#0054fb" : "#fff"} stroke="#2fd4ec" strokeWidth="3" />
          {progress === undefined && <circle cx="206" cy="150" r="6" fill="#3ee29a" stroke={blue ? "#0054fb" : "#fff"} strokeWidth="2" />}
          {markers && kms.map(([x, y, t], i) => (
            <motion.g key={t} initial={draw ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.2 }}>
              <circle cx={x} cy={y} r="9.5" fill={pill.fill} />
              <text x={x} y={y + 3.6} textAnchor="middle" fontSize="10" fontWeight="600" fill={pill.text} fontFamily="Inter Variable">{t}</text>
            </motion.g>
          ))}
        </>
      )}
    </svg>
  );
}

/* Google's standard "G" mark, as required by Google Sign-In branding guidelines. */
export function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/* Shared top for Login and Sign-up: a strip of the welcome photo that dissolves into the form sheet. */
export function AuthHeader({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ position: "relative", height: 196, overflow: "hidden", background: "#fff" }}>
      <img src="/img/auth-shoe.png" alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 12%" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(3,8,26,0.4) 0%, rgba(3,8,26,0) 30%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.85) 88%, #fff 96%)", bottom: -2 }} />
      <div className="pad top" style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="icon-btn on-blue" aria-label="Back" onClick={onBack}><ArrowLeft size={20} /></button>
        <Wordmark width={84} color="#fff" />
        <span style={{ width: 44 }} aria-hidden />
      </div>
    </div>
  );
}

/*
  Sport icons: ink outline + blue gradient duotone fill; the selected one goes solid blue.
  The gradient lives once in <IconDefs/>; CSS paints Phosphor's 20%-opacity duotone layer with it.
*/
export function SportIcon({ Icon, size = 24, selected = false }: { Icon: typeof House; size?: number; selected?: boolean }) {
  return selected
    ? <Icon size={size} weight="fill" color="var(--blue)" />
    : <Icon size={size} weight="duotone" className="duo-icon" />;
}

export function IconDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        <linearGradient id="duo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7DB2FF" />
          <stop offset="1" stopColor="#0054FB" />
        </linearGradient>
      </defs>
    </svg>
  );
}
