import { useCallback, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { TabBar, Wordmark, IconDefs, type Route } from "./components";
import Splash from "./screens/Splash";
import Welcome from "./screens/Welcome";
import Signup from "./screens/Signup";
import Login from "./screens/Login";
import Onboarding, { type Profile as ProfileData } from "./screens/Onboarding";
import Home from "./screens/Home";
import Pro from "./screens/Pro";
import Search from "./screens/Search";
import Record from "./screens/Record";
import Summary from "./screens/Summary";
import Timeline from "./screens/Timeline";
import Profile from "./screens/Profile";

const screens: { id: Route; name: string; note: string }[] = [
  { id: "splash", name: "Splash", note: "Launch" },
  { id: "welcome", name: "Welcome", note: "First open" },
  { id: "login", name: "Log in", note: "Returning member" },
  { id: "signup", name: "Create account", note: "Sign up" },
  { id: "onboarding", name: "Onboarding", note: "4 steps" },
  { id: "pro", name: "Ennoo Pro", note: "Plans and trial" },
  { id: "home", name: "Home", note: "Goal and week" },
  { id: "search", name: "Search", note: "Find anything" },
  { id: "record", name: "Record", note: "Live tracking" },
  { id: "summary", name: "Activity", note: "After a session" },
  { id: "timeline", name: "Timeline", note: "History" },
  { id: "profile", name: "Profile", note: "You" },
];
const withTabs: Route[] = ["home", "search", "timeline", "profile"];

export default function App() {
  // #onboarding-3 opens a specific onboarding step (handy for review links)
  const [obStep] = useState(() => Math.max(0, Number(location.hash.match(/onboarding-(\d)/)?.[1] ?? 1) - 1));
  // Every load starts on the splash. A screen in the URL (e.g. #home) is where the splash hands off to.
  const [after] = useState<Route>(() => {
    const h = location.hash.slice(1).replace(/-\d$/, "") as Route;
    return screens.some((s) => s.id === h) && h !== "splash" ? h : "welcome";
  });
  const [route, setRoute] = useState<Route>("splash");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const go = useCallback((r: Route) => { setRoute(r); history.replaceState(null, "", `#${r}`); }, []);
  const [handedOff, setHandedOff] = useState(false);
  const leaveSplash = useCallback((r: Route) => {
    // first splash goes to the deep-linked screen; any later splash (from the screen list) goes to Welcome
    go(handedOff ? r : after);
    setHandedOff(true);
  }, [go, after, handedOff]);

  const view = {
    splash: <Splash go={leaveSplash} />,
    welcome: <Welcome go={go} />,
    login: <Login go={go} />,
    signup: <Signup go={go} />,
    onboarding: <Onboarding go={go} initialStep={obStep} onDone={(p) => { setProfile(p); go("pro"); }} />,
    pro: <Pro go={go} />,
    home: <Home go={go} profile={profile} />,
    search: <Search go={go} />,
    record: <Record go={go} />,
    summary: <Summary go={go} />,
    timeline: <Timeline go={go} />,
    profile: <Profile go={go} profile={profile} />,
  }[route];

  return (
    <MotionConfig reducedMotion="user">
      <IconDefs />
      <main className="stage">
        <aside className="stage-side">
          <Wordmark width={132} />
          <p>Interactive prototype. Tap through the phone, or jump to any screen. Finishing onboarding shows Home as a new member; "I already have an account" shows a returning one.</p>
          <nav className="screen-list" aria-label="Screens">
            {screens.map((s) => (
              <button key={s.id} aria-current={route === s.id} onClick={() => { if (s.id === "home") setProfile(null); go(s.id); }}>
                <span>{s.name}</span><span>{s.note}</span>
              </button>
            ))}
          </nav>
        </aside>
        <div className="phone">
          <div className="screen">
            <div className="island" aria-hidden />
            <AnimatePresence mode="popLayout">
              <motion.div key={route} style={{ position: "absolute", inset: 0 }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                {view}
              </motion.div>
            </AnimatePresence>
            {withTabs.includes(route) && <TabBar route={route} go={go} />}
          </div>
        </div>
      </main>
    </MotionConfig>
  );
}
