import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { StatusBar, GoogleG, AuthHeader, type Route } from "../components";

type Errors = Partial<Record<"name" | "email" | "password", string>>;

export default function Signup({ go }: { go: (r: Route) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Add a name, even just your first one.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "That email doesn't look right.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setTimeout(() => go("onboarding"), 700);
  };

  return (
    <div className="body" style={{ background: "var(--white)" }}>
      <StatusBar onBlue />
      <AuthHeader onBack={() => go("welcome")} />

      <form className="pad" onSubmit={submit} noValidate style={{ marginTop: -14, paddingBottom: 24, position: "relative" }}>
        <h1 className="title serif-title">Create your account</h1>
        <p className="meta" style={{ fontSize: 15, marginTop: 8 }}>One minute now, every activity kept for good.</p>

        <button type="button" className="btn btn-soft" style={{ width: "100%", marginTop: 20 }} onClick={() => go("onboarding")}>
          <GoogleG size={20} /> Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
          <span className="rule" style={{ flex: 1 }} /><span className="cap">or with email</span><span className="rule" style={{ flex: 1 }} />
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div className="field">
            <label htmlFor="name">Tell us what to call you</label>
            <input id="name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kavya" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} />
            {errors.name && <span id="name-err" className="err">{errors.name}</span>}
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} />
            {errors.email && <span id="email-err" className="err">{errors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="pw">Password</label>
            <div style={{ position: "relative" }}>
              <input id="pw" className="input" type={show ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} aria-describedby="pw-help" style={{ paddingRight: 52 }} />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: 4, top: 4, width: 42, height: 42, display: "grid", placeItems: "center", color: "var(--gray)" }}>
                {show ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password ? <span id="pw-help" className="err">{errors.password}</span> : <span id="pw-help" className="help">At least 8 characters.</span>}
          </div>
        </div>

        <motion.button type="submit" className="btn btn-blue" style={{ width: "100%", marginTop: 22 }} whileTap={{ scale: 0.98 }} disabled={busy} aria-busy={busy}>
          {busy ? <><span className="spinner" aria-hidden />Creating account</> : "Create account"}
        </motion.button>
        <p className="cap" style={{ textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
          By continuing you agree to the <a href="#" style={{ color: "var(--ink)" }}>Terms</a> and <a href="#" style={{ color: "var(--ink)" }}>Privacy Policy</a>.
        </p>
        <p className="meta" style={{ textAlign: "center", marginTop: 16 }}>
          Already have an account? <button type="button" className="link" onClick={() => go("login")}>Log in</button>
        </p>
      </form>
    </div>
  );
}
