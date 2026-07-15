import { useState } from "react";
import { supabase } from "../supabase";
import STYLES from "../styles";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handle = async () => {
    setLoading(true); setMsg(null);
    const fn = mode === "login" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { data, error } = await fn.call(supabase.auth, { email, password });
    setLoading(false);
    if (error) { setMsg({ err: true, text: error.message }); return; }
    if (mode === "signup" && !data.session) { setMsg({ err: false, text: "Check your email to confirm your account!" }); return; }
    onAuth(data.session);
  };

  return (
    <div className="auth-wrap">
      <style>{STYLES}</style>
      <div className="auth-box">
        <div className="logo auth-logo">MACRO<span>TRACK</span></div>
        <div className="auth-sub">{mode === "login" ? "Sign in to your account" : "Create a new account"}</div>
        <label className="lbl">Email</label>
        <input className="inp" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label className="lbl">Password</label>
        <input className="inp" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
        {msg && <div style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 12, fontSize: 12, background: msg.err ? "rgba(255,107,107,0.1)" : "var(--accent-dim)", color: msg.err ? "var(--danger)" : "var(--accent)", border: `1px solid ${msg.err ? "rgba(255,107,107,0.3)" : "rgba(200,241,53,0.3)"}` }}>{msg.text}</div>}
        <button className="btn btn-primary" style={{ width: "100%", marginBottom: 12 }} onClick={handle} disabled={loading}>{loading ? "…" : mode === "login" ? "Sign In" : "Sign Up"}</button>
        <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(null); }}>
          {mode === "login" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
