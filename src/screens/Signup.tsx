import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { play } from "cuelume";
import { CalendarBlank, CheckCircle, ShieldCheck } from "@phosphor-icons/react";
import { StatusBar, GoogleG, AuthHeader, type Route } from "../components";
import { Sheet, Wheel, WheelBand } from "../sheet";

type Gender = "Female" | "Male" | "Non-binary" | "Prefer not to say";
type Errors = Partial<Record<"name" | "dob" | "gender" | "phone", string>>;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TODAY = new Date(2026, 9, 21); // prototype "today", same as onboarding
const MIN_AGE = 13;
const YEARS = Array.from({ length: 90 }, (_, i) => TODAY.getFullYear() - MIN_AGE - i).reverse(); // oldest first
const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const fmtDob = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const ageOn = (d: Date) => TODAY.getFullYear() - d.getFullYear() - (TODAY < new Date(TODAY.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
const CODES = [{ cc: "+91", n: "IN", len: 10 }, { cc: "+1", n: "US", len: 10 }, { cc: "+44", n: "UK", len: 10 }, { cc: "+61", n: "AU", len: 9 }, { cc: "+971", n: "AE", len: 9 }];
const OTP_LEN = 6;

/* Date of birth on three wheels: day, month, year. The day list follows the month. */
function DobSheet({ value, onSave, onClose }: { value: Date | null; onSave: (d: Date) => void; onClose: () => void }) {
  const start = value ?? new Date(2000, 0, 1);
  const [y, setY] = useState(YEARS.indexOf(start.getFullYear()));
  const [m, setM] = useState(start.getMonth());
  const [d, setD] = useState(start.getDate() - 1);
  const year = YEARS[y], maxD = daysIn(year, m), day = Math.min(d, maxD - 1);
  const picked = new Date(year, m, day + 1);
  return (
    <Sheet id="dob" title="Your birthday" sub="Used for age-based stats like heart-rate zones. Never shown on your profile." onClose={onClose}>
      <div style={{ position: "relative", marginTop: 14 }}>
        <WheelBand />
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "0.8fr 1fr 1.1fr", gap: 4 }}>
          <Wheel label="Day" items={Array.from({ length: maxD }, (_, i) => String(i + 1))} index={day} onChange={setD} />
          <Wheel label="Month" items={MONTHS} index={m} onChange={setM} />
          <Wheel label="Year" items={YEARS.map(String)} index={y} onChange={setY} />
        </div>
      </div>
      <p className="cap" aria-live="polite" style={{ textAlign: "center", marginTop: 12, fontSize: 14 }}>
        <strong style={{ color: "var(--ink)" }}>{fmtDob(picked)}</strong>, {ageOn(picked)} years old
      </p>
      <button data-cuelume-tap type="button" className="btn btn-blue" style={{ width: "100%", marginTop: 14 }} onClick={() => { onSave(picked); onClose(); }}>Done</button>
    </Sheet>
  );
}

/* The one-time code: six boxes that advance as you type, take a pasted code, and step back on delete */
function OtpSheet({ phone, onVerified, onClose }: { phone: string; onVerified: () => void; onClose: () => void }) {
  const [code, setCode] = useState<string[]>(Array(OTP_LEN).fill(""));
  const [state, setState] = useState<"idle" | "busy" | "wrong" | "done">("idle");
  const [wait, setWait] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { const t = setTimeout(() => refs.current[0]?.focus(), 250); return () => clearTimeout(t); }, []);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t); }, [wait]);
  const full = code.every(Boolean);
  const verify = (c = code) => {
    if (!c.every(Boolean) || state === "busy") return;
    setState("busy");
    // prototype: any code works except 000000, which shows the wrong-code state
    setTimeout(() => {
      if (c.join("") === "000000") { setState("wrong"); play("error", { emphasis: "subtle" }); return; }
      setState("done"); play("success"); setTimeout(onVerified, 700);
    }, 800);
  };
  const put = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (state === "wrong") setState("idle");
    if (digits.length > 1) { // pasted or autofilled
      const next = [...code]; digits.slice(0, OTP_LEN - i).split("").forEach((ch, k) => (next[i + k] = ch));
      setCode(next); refs.current[Math.min(OTP_LEN - 1, i + digits.length)]?.focus();
      if (next.every(Boolean)) verify(next);
      return;
    }
    const next = [...code]; next[i] = digits; setCode(next);
    if (digits && i < OTP_LEN - 1) refs.current[i + 1]?.focus();
    if (digits && next.every(Boolean)) verify(next);
  };
  return (
    <Sheet id="otp" title="Enter the code" onClose={onClose}
      sub={<>We sent a 6-digit code to <strong className="num" style={{ color: "var(--ink)", letterSpacing: 0 }}>{phone}</strong>.</>}>
      <div role="group" aria-label="Verification code" style={{ display: "grid", gridTemplateColumns: `repeat(${OTP_LEN}, 1fr)`, gap: 8, marginTop: 20 }}>
        {code.map((v, i) => (
          <input data-cuelume-type key={i} ref={(el) => { refs.current[i] = el; }} inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} aria-label={`Digit ${i + 1}`}
            value={v} maxLength={i === 0 ? OTP_LEN : 1} disabled={state === "busy" || state === "done"} aria-invalid={state === "wrong"}
            onChange={(e) => put(i, e.target.value)} onFocus={(e) => e.target.select()}
            onKeyDown={(e) => { if (e.key === "Backspace" && !v && i > 0) refs.current[i - 1]?.focus(); if (e.key === "Enter") verify(); }}
            className="num input" style={{ height: 56, padding: 0, textAlign: "center", fontSize: 24, fontWeight: 650, letterSpacing: 0,
              borderColor: state === "done" ? "#12B76A" : v ? "var(--blue)" : undefined, background: v ? "var(--blue-50)" : "#fff" }} />
        ))}
      </div>
      <p role="status" style={{ minHeight: 20, marginTop: 12, fontSize: 14, textAlign: "center", color: state === "wrong" ? "#d92d20" : state === "done" ? "#067647" : "var(--gray)" }}>
        {state === "wrong" ? "That code didn't match. Check it and try again." : state === "done" ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><CheckCircle size={18} weight="fill" />Number verified</span>
          : wait > 0 ? <>Resend code in <span className="num" style={{ letterSpacing: 0 }}>0:{String(wait).padStart(2, "0")}</span></>
          : <button data-cuelume-tap type="button" className="link" onClick={() => { setWait(30); setCode(Array(OTP_LEN).fill("")); refs.current[0]?.focus(); }}>Resend code</button>}
      </p>
      <button data-cuelume-tap type="button" className="btn btn-blue" style={{ width: "100%", marginTop: 10 }} disabled={!full || state === "done"} aria-busy={state === "busy"} onClick={() => verify()}>
        {state === "busy" ? <><span className="spinner" aria-hidden />Verifying</> : "Verify and continue"}
      </button>
    </Sheet>
  );
}

export default function Signup({ go, onName }: { go: (r: Route) => void; onName: (name: string) => void }) {
  const [stage, setStage] = useState<"about" | "phone">("about");
  const [name, setName] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [cc, setCc] = useState(CODES[0]);
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sheet, setSheet] = useState<null | "dob" | "otp">(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const nextAbout = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Tell us what to call you.";
    if (!dob) next.dob = "Pick your birthday so we can set your age-based stats.";
    else if (ageOn(dob) < MIN_AGE) next.dob = `You need to be at least ${MIN_AGE} to use Ennoo.`;
    if (!gender) next.gender = "Pick one, or choose Prefer not to say.";
    setErrors(next);
    if (Object.keys(next).length) return void play("error", { emphasis: "subtle" });
    onName(name.trim().split(/\s+/)[0]);
    setStage("phone");
  };
  const sendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== cc.len) { setErrors({ phone: `Enter your ${cc.len}-digit mobile number.` }); return void play("error", { emphasis: "subtle" }); }
    setErrors({}); setSheet("otp");
  };
  const shownPhone = `${cc.cc} ${cc.len === 10 ? `${phone.slice(0, 5)} ${phone.slice(5)}` : phone}`;

  return (
    // sheets sit outside the scrolling page so they always cover the whole screen
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "var(--white)" }}>
    <div className="body">
      <StatusBar onBlue />
      <AuthHeader onBack={() => (stage === "phone" ? (setStage("about"), setErrors({})) : go("welcome"))} />

      <div className="pad" style={{ marginTop: -14, position: "relative" }}>
        <div role="progressbar" aria-label={`Step ${stage === "about" ? 1 : 2} of 2`} aria-valuemin={1} aria-valuemax={2} aria-valuenow={stage === "about" ? 1 : 2}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, width: 64, marginBottom: 14 }}>
          {[0, 1].map((i) => <span key={i} style={{ height: 4, borderRadius: 2, background: i === 0 || stage === "phone" ? "var(--blue)" : "var(--line)", transition: "background .3s" }} />)}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {stage === "about" ? (
          <motion.form key="about" className="pad" onSubmit={nextAbout} noValidate initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{ paddingBottom: 24 }}>
            <h1 className="title serif-title">Let's get to know you</h1>
            <p className="meta" style={{ fontSize: 15, marginTop: 8 }}>A few details to shape your goals and stats.</p>

            <div style={{ display: "grid", gap: 18, marginTop: 22 }}>
              <div className="field">
                <label htmlFor="name">What should we call you?</label>
                <input data-cuelume-type id="name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name, or a nickname" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} />
                {errors.name && <span id="name-err" className="err" role="alert">{errors.name}</span>}
              </div>
              <div className="field">
                <label htmlFor="dob">When is your birthday?</label>
                <button data-cuelume-open id="dob" type="button" className="input" onClick={() => setSheet("dob")} aria-invalid={!!errors.dob} aria-describedby={errors.dob ? "dob-err" : undefined}
                  style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", cursor: "pointer" }}>
                  <span style={{ flex: 1, color: dob ? "var(--ink)" : "var(--gray)", fontWeight: dob ? 560 : 400 }}>{dob ? fmtDob(dob) : "Pick your birthday"}</span>
                  <CalendarBlank size={20} color={dob ? "var(--ink)" : "var(--gray)"} aria-hidden />
                </button>
                {errors.dob && <span id="dob-err" className="err" role="alert">{errors.dob}</span>}
              </div>
              <div className="field">
                <span id="gender-l" style={{ fontSize: 14, fontWeight: 560 }}>How do you identify?</span>
                <div role="radiogroup" aria-labelledby="gender-l" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["Female", "Male", "Non-binary", "Prefer not to say"] as Gender[]).map((g) => {
                    const on = gender === g;
                    return (
                      <button data-cuelume-select key={g} type="button" role="radio" aria-checked={on} onClick={() => { setGender(g); setErrors((e) => ({ ...e, gender: undefined })); }}
                        style={{ height: 48, borderRadius: 14, fontSize: 15, fontWeight: on ? 600 : 500, border: `1.5px solid ${on ? "var(--blue)" : "var(--line)"}`, background: on ? "var(--blue-50)" : "#fff", color: on ? "var(--blue)" : "var(--ink)", transition: "all .2s" }}>{g}</button>
                    );
                  })}
                </div>
                {errors.gender && <span className="err" role="alert">{errors.gender}</span>}
              </div>
            </div>

            <motion.button data-cuelume-tap type="submit" className="btn btn-blue" style={{ width: "100%", marginTop: 26 }} whileTap={{ scale: 0.98 }}>Continue</motion.button>
            <p className="meta" style={{ textAlign: "center", marginTop: 16 }}>
              Already have an account? <button data-cuelume-tap data-cuelume-emphasis="subtle" type="button" className="link" onClick={() => go("login")}>Log in</button>
            </p>
          </motion.form>
        ) : (
          <motion.form key="phone" className="pad" onSubmit={sendCode} noValidate initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => phoneRef.current?.focus()} style={{ paddingBottom: 24 }}>
            <h1 className="title serif-title">{name.trim() ? `Hi ${name.trim().split(/\s+/)[0]}, add your number` : "Add your number"}</h1>
            <p className="meta" style={{ fontSize: 15, marginTop: 8 }}>We'll text you a 6-digit code to verify it. No passwords to remember.</p>

            <div className="field" style={{ marginTop: 22 }}>
              <label htmlFor="phone">Mobile number</label>
              <div className="nf" data-invalid={errors.phone ? "true" : undefined}>
                <select aria-label="Country code" value={cc.cc} onChange={(e) => { setCc(CODES.find((c) => c.cc === e.target.value) ?? CODES[0]); setPhone(""); }}
                  style={{ borderLeft: 0, borderRight: "1px solid var(--line)", order: -1 }}>
                  {CODES.map((c) => <option key={c.cc} value={c.cc}>{c.n} {c.cc}</option>)}
                </select>
                <input data-cuelume-type ref={phoneRef} id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder={cc.len === 10 ? "98765 43210" : "412 345 678"} value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, cc.len)); if (errors.phone) setErrors({}); }} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-err" : "phone-help"} style={{ letterSpacing: "0.02em" }} />
              </div>
              {errors.phone ? <span id="phone-err" className="err" role="alert">{errors.phone}</span> : <span id="phone-help" className="help" style={{ display: "flex", alignItems: "center", gap: 6 }}><ShieldCheck size={15} weight="fill" color="var(--gray)" />Only used to sign you in. We never share it.</span>}
            </div>

            <motion.button data-cuelume-tap type="submit" className="btn btn-blue" style={{ width: "100%", marginTop: 22 }} whileTap={{ scale: 0.98 }}>Continue to OTP</motion.button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
              <span className="rule" style={{ flex: 1 }} /><span className="cap">or</span><span className="rule" style={{ flex: 1 }} />
            </div>
            <button data-cuelume-tap type="button" className="btn btn-soft" style={{ width: "100%" }} onClick={() => go("onboarding")}>
              <GoogleG size={20} /> Continue with Google
            </button>
            <p className="cap" style={{ textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
              By continuing you agree to the <a href="#" style={{ color: "var(--ink)" }}>Terms</a> and <a href="#" style={{ color: "var(--ink)" }}>Privacy Policy</a>.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>

      <AnimatePresence>
        {sheet === "dob" && <DobSheet value={dob} onSave={(d) => { setDob(d); setErrors((e) => ({ ...e, dob: undefined })); }} onClose={() => setSheet(null)} />}
        {sheet === "otp" && <OtpSheet phone={shownPhone} onVerified={() => go("onboarding")} onClose={() => setSheet(null)} />}
      </AnimatePresence>
    </div>
  );
}
