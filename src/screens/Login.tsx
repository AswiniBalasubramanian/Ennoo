import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { StatusBar, GoogleG, AuthHeader, type Route } from "../components";

type Errors = Partial<Record<"email" | "password" | "form", string>>;

export default function Login({ go }: { go: (r: Route) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter the email you signed up with.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setTimeout(() => go("home"), 700);
  };

  return (
    <div className="body" style={{ background: "var(--white)" }}>
      <StatusBar onBlue />
      <AuthHeader onBack={() => go("welcome")} />

      <form className="pad" onSubmit={submit} noValidate style={{ marginTop: -14, paddingBottom: 24, position: "relative" }}>
        <h1 className="title serif-title">Welcome back</h1>
        <p className="meta" style={{ fontSize: 15, marginTop: 8 }}>Pick up right where you left off.</p>

        <button type="button" className="btn btn-soft" style={{ width: "100%", marginTop: 20 }} onClick={() => go("home")}>
          <GoogleG size={20} /> Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
          <span className="rule" style={{ flex: 1 }} /><span className="cap">or with email</span><span className="rule" style={{ flex: 1 }} />
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div className="field">
            <label htmlFor="li-email">Email</label>
            <input id="li-email" className="input" type="email" inputMode="email" autoComplete="email" value={email}
              onChange={(e) => { setEmail(e.target.value); setResetSent(false); }} placeholder="you@example.com"
              aria-invalid={!!errors.email} aria-describedby={errors.email ? "li-email-err" : undefined} />
            {errors.email && <span id="li-email-err" className="err" role="alert">{errors.email}</span>}
          </div>
          <div className="field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label htmlFor="li-pw">Password</label>
              <button type="button" className="link" style={{ fontSize: 13 }}
                onClick={() => { if (/^\S+@\S+\.\S+$/.test(email)) { setResetSent(true); setErrors({}); } else setErrors({ email: "Enter your email first, then we'll send a reset link." }); }}>
                Forgot password?
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input id="li-pw" className="input" type={show ? "text" : "password"} autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "li-pw-err" : undefined} style={{ paddingRight: 52 }} />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: 4, top: 4, width: 42, height: 42, display: "grid", placeItems: "center", color: "var(--gray)" }}>
                {show ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span id="li-pw-err" className="err" role="alert">{errors.password}</span>}
            {resetSent && <span className="help" role="status" style={{ color: "var(--blue)" }}>Reset link sent to {email}.</span>}
          </div>
        </div>

        <motion.button type="submit" className="btn btn-blue" style={{ width: "100%", marginTop: 22 }} whileTap={{ scale: 0.98 }} disabled={busy} aria-busy={busy}>
          {busy ? <><span className="spinner" aria-hidden />Logging in</> : "Log in"}
        </motion.button>

        <p className="meta" style={{ textAlign: "center", marginTop: 16 }}>
          New to Ennoo? <button type="button" className="link" onClick={() => go("signup")}>Create an account</button>
        </p>
      </form>
    </div>
  );
}
