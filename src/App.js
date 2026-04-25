import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://srhtsnoufelxirqaxoqh.supabase.co";
const SUPABASE_KEY = "sb_publishable_UYwe1Vi2ce2XVcqFMqGcDA_dDo84Exh";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STYLES = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0} html,body{height:100%;overflow:hidden}
:root{--bg:#080c0a;--surface:#0f1410;--card:#161c17;--border:#232d24;--accent:#c8f135;--accent-dim:rgba(200,241,53,0.1);--accent-glow:rgba(200,241,53,0.25);--text:#e8f0e9;--muted:#4a5e4b;--protein:#4ade80;--carbs:#60a5fa;--fat:#fb923c;--danger:#ff6b6b}
.app{background:var(--bg);height:100vh;display:flex;flex-direction:column;font-family:'Syne',sans-serif;color:var(--text);max-width:480px;margin:0 auto;overflow:hidden}
.header{padding:18px 16px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.logo{font-size:19px;font-weight:800;letter-spacing:-0.5px} .logo span{color:var(--accent)}
.icon-btn{background:none;border:none;color:var(--muted);cursor:pointer;font-size:20px;padding:4px;line-height:1;transition:color 0.2s} .icon-btn:hover{color:var(--text)}
.summary{margin:12px;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:16px}
.cal-row{display:flex;align-items:baseline;gap:8px;margin-bottom:14px}
.cal-num{font-family:'Space Mono',monospace;font-size:44px;font-weight:700;color:var(--accent);line-height:1}
.cal-sub{font-size:13px;color:var(--muted)} .cal-target{font-family:'Space Mono',monospace;font-size:13px;color:var(--muted)}
.macro-bars{display:flex;flex-direction:column;gap:9px}
.mbar-row{display:flex;align-items:center;gap:10px}
.mbar-label{font-size:10px;color:var(--muted);width:46px;text-transform:uppercase;letter-spacing:0.7px}
.mbar-bg{flex:1;height:5px;background:#2a3a2b;border-radius:3px;overflow:hidden}
.mbar-fill{height:100%;border-radius:3px;transition:width 0.4s ease}
.mbar-val{font-family:'Space Mono',monospace;font-size:10px;color:var(--text);width:70px;text-align:right}
.deficit{display:flex;justify-content:space-between;margin-top:13px;padding-top:13px;border-top:1px solid var(--border);font-family:'Space Mono',monospace;font-size:11px}
.tabs{display:flex;padding:0 12px;border-bottom:1px solid var(--border)}
.tab{flex:1;padding:11px 4px;border:none;background:none;color:var(--muted);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;letter-spacing:0.3px}
.tab.active{color:var(--accent);border-bottom-color:var(--accent)}
.content{padding:12px;padding-bottom:90px;flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch}
.sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;margin-top:6px}
.sec-title{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted)}
.log-entry{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:11px 14px;margin-bottom:7px;display:flex;align-items:center;justify-content:space-between}
.entry-name{font-size:14px;font-weight:700;margin-bottom:2px} .entry-macros{font-size:10px;color:var(--muted);font-family:'Space Mono',monospace}
.entry-cal{font-family:'Space Mono',monospace;font-size:17px;font-weight:700;color:var(--accent)}
.meal-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:7px;cursor:pointer;transition:border-color 0.2s,background 0.2s;display:flex;align-items:center;justify-content:space-between}
.meal-card:hover{border-color:var(--accent);background:var(--card)}
.meal-card-name{font-size:15px;font-weight:700;margin-bottom:4px} .meal-card-macros{font-size:10px;color:var(--muted);font-family:'Space Mono',monospace}
.meal-card-cal{font-family:'Space Mono',monospace;font-size:18px;font-weight:700;color:var(--accent);white-space:nowrap}
.fab{position:fixed;bottom:22px;right:20px;width:54px;height:54px;border-radius:50%;background:var(--accent);color:#000;border:none;font-size:26px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px var(--accent-glow);font-weight:700;transition:transform 0.2s;z-index:100;line-height:1}
.fab:hover{transform:scale(1.06)}
.btn{padding:11px 20px;border-radius:9px;border:none;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s}
.btn-primary{background:var(--accent);color:#000} .btn-primary:hover{opacity:0.88} .btn-primary:disabled{opacity:0.4;cursor:not-allowed}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border)} .btn-ghost:hover{border-color:var(--text);color:var(--text)}
.btn-sm{padding:6px 14px;font-size:12px;border-radius:7px}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.82);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:flex-end;padding:12px}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:20px;width:100%;max-height:88vh;overflow-y:auto;animation:up 0.22s ease}
@keyframes up{from{transform:translateY(36px);opacity:0}to{transform:translateY(0);opacity:1}}
.modal-title{font-size:17px;font-weight:800;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between}
.lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:5px;display:block}
.inp{width:100%;background:var(--card);border:1px solid var(--border);border-radius:9px;padding:10px 13px;color:var(--text);font-family:'Syne',sans-serif;font-size:16px;outline:none;transition:border-color 0.2s;margin-bottom:12px}
.inp:focus{border-color:var(--accent)} .inp::placeholder{color:var(--muted)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.modal-actions{display:flex;gap:8px;margin-top:16px} .modal-actions .btn{flex:1}
.empty{text-align:center;padding:44px 20px;color:var(--muted)} .empty-icon{font-size:34px;margin-bottom:10px} .empty-text{font-size:13px;line-height:1.5}
.toggle-group{display:flex;background:var(--card);border-radius:9px;padding:3px;margin-bottom:14px}
.toggle{flex:1;padding:8px;border:none;background:none;border-radius:7px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:var(--muted);cursor:pointer;transition:all 0.18s}
.toggle.active{background:var(--surface);color:var(--text)}
.ing-chip{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px 12px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;font-size:12px}
.ing-result{padding:10px 12px;border-radius:8px;cursor:pointer;font-size:13px;transition:background 0.15s;color:var(--text)} .ing-result:hover{background:var(--card)}
.ing-list{max-height:160px;overflow-y:auto;border:1px solid var(--border);border-radius:9px;margin-bottom:12px}
.preview{background:var(--accent-dim);border:1px solid rgba(200,241,53,0.18);border-radius:10px;padding:10px 14px;margin-bottom:12px;font-family:'Space Mono',monospace;font-size:11px;display:flex;justify-content:space-between}
.del-btn{background:none;border:none;color:var(--muted);cursor:pointer;font-size:15px;padding:2px 6px;line-height:1;transition:color 0.2s} .del-btn:hover{color:var(--danger)}
.serving-row{background:var(--card);border-radius:10px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between}
.serving-inp{width:70px;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-family:'Space Mono',monospace;font-size:16px;text-align:right;outline:none}
.serving-inp:focus{border-color:var(--accent)}
.tag{display:inline-flex;align-items:center;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:3px 9px;font-size:10px;font-family:'Space Mono',monospace;color:var(--muted);margin-right:5px;margin-bottom:4px}
.toast{position:fixed;top:18px;left:50%;transform:translateX(-50%);padding:8px 18px;border-radius:20px;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;z-index:999;pointer-events:none;animation:toast-in 0.2s ease;white-space:nowrap}
.toast-ok{background:var(--accent);color:#000} .toast-err{background:var(--danger);color:#fff}
@keyframes toast-in{from{opacity:0;top:8px}to{opacity:1;top:18px}}
.auth-wrap{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:24px}
.auth-box{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px;width:100%;max-width:380px}
.auth-title{font-size:22px;font-weight:800;margin-bottom:6px} .auth-sub{font-size:13px;color:var(--muted);margin-bottom:24px}`;

const uid = () => Math.random().toString(36).slice(2, 9);
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtDate = d => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
const round1 = n => Math.round(n * 10) / 10;

const DEFAULT_INGS = [
  { id: "chkdsh", name: "Honey Chilli Chicken",   p100: { cal: 135.6, protein: 17.7, carbs: 9.2,  fat: 2.6  } },
  { id: "wrice",  name: "White Rice (cooked)",     p100: { cal: 100,   protein: 1.67, carbs: 22.1, fat: 0.21 } },
  { id: "bread",  name: "Bread Slice",             p100: { cal: 133.3, protein: 6.7,  carbs: 26.7, fat: 1.7  } },
  { id: "cheese", name: "Cheese Slice",            p100: { cal: 300,   protein: 26.7, carbs: 0,    fat: 23.3 } },
  { id: "ham",    name: "Ham Slices",              p100: { cal: 150,   protein: 22.5, carbs: 2.5,  fat: 5    } },
  { id: "beefmx", name: "Beef Mix (seasoned)",     p100: { cal: 123.3, protein: 18.1, carbs: 4.3,  fat: 4.3  } },
  { id: "lcpita", name: "Low Carb Pita",           p100: { cal: 111.1, protein: 4.4,  carbs: 22.2, fat: 1.1  } },
  { id: "hclsau", name: "Honey Chilli Lime Sauce", p100: { cal: 126.7, protein: 3.3,  carbs: 11.7, fat: 7.5  } },
  { id: "pchips", name: "Protein Chips",           p100: { cal: 437.5, protein: 59.4, carbs: 15.6, fat: 15.6 } },
  { id: "pbar",   name: "Protein Bar",             p100: { cal: 241.9, protein: 45.2, carbs: 19.4, fat: 3.2  } },
];

const DEFAULT_MEALS = [
  { id: "meal1", name: "🍗 Honey Chilli Chicken + Rice", manual: null, ingredients: [{ id: "chkdsh", name: "Honey Chilli Chicken", amount: 390 }, { id: "wrice", name: "White Rice (cooked)", amount: 240 }] },
  { id: "meal2", name: "🥪 Sandwich",                    manual: null, ingredients: [{ id: "bread", name: "Bread Slice", amount: 60 }, { id: "cheese", name: "Cheese Slice", amount: 15 }, { id: "ham", name: "Ham Slices", amount: 80 }] },
  { id: "meal3", name: "🌮 Taco Beef Pita",              manual: null, ingredients: [{ id: "beefmx", name: "Beef Mix (seasoned)", amount: 116 }, { id: "cheese", name: "Cheese Slice", amount: 15 }, { id: "lcpita", name: "Low Carb Pita", amount: 45 }, { id: "hclsau", name: "Honey Chilli Lime Sauce", amount: 60 }] },
  { id: "meal4", name: "🍿 Protein Chips (1 bag)",       manual: null, ingredients: [{ id: "pchips", name: "Protein Chips", amount: 32 }] },
  { id: "meal5", name: "🍫 Protein Bar",                 manual: null, ingredients: [{ id: "pbar", name: "Protein Bar", amount: 62 }] },
];

function calcMealMacros(meal, ingredients) {
  if (meal.manual) return meal.manual;
  return meal.ingredients.reduce((acc, mi) => {
    const ing = ingredients.find(i => i.id === mi.id);
    if (!ing) return acc;
    const r = mi.amount / 100;
    return { cal: acc.cal + Math.round(ing.p100.cal * r), protein: round1(acc.protein + ing.p100.protein * r), carbs: round1(acc.carbs + ing.p100.carbs * r), fat: round1(acc.fat + ing.p100.fat * r) };
  }, { cal: 0, protein: 0, carbs: 0, fat: 0 });
}

function MacroBar({ label, val, target, color }) {
  const pct = Math.min((val / Math.max(target, 1)) * 100, 100);
  return (
    <div className="mbar-row">
      <span className="mbar-label">{label}</span>
      <div className="mbar-bg"><div className="mbar-fill" style={{ width: `${pct}%`, background: val > target ? "var(--danger)" : color }} /></div>
      <span className="mbar-val">{Math.round(val)}/{target}g</span>
    </div>
  );
}

// ── Auth Screen ───────────────────────────────────────────────
function AuthScreen({ onAuth }) {
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
        <div className="auth-title">MACRO<span style={{ color: "var(--accent)" }}>TRACK</span></div>
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

// ── Ingredient Modal ──────────────────────────────────────────
function IngredientModal({ onSave, onClose, existing }) {
  const [form, setForm] = useState(existing
    ? { name: existing.name, amount: "100", protein: existing.p100.protein, carbs: existing.p100.carbs, fat: existing.p100.fat }
    : { name: "", amount: "100", protein: "", carbs: "", fat: "" });
  const [barcode, setBarcode] = useState("");
  const [barcodeStatus, setBarcodeStatus] = useState(null);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const pro = +form.protein || 0, carb = +form.carbs || 0, fat = +form.fat || 0, amt = +form.amount || 100;
  const calcCal = Math.round(pro * 4 + carb * 4 + fat * 9);
  const factor = 100 / amt;
  const valid = form.name && (pro || carb || fat);

  const lookupBarcode = async () => {
    if (!barcode.trim()) return;
    setBarcodeStatus("loading");
    const code = barcode.trim();
    const variants = [...new Set([code, "0" + code, code.replace(/^0+/, "")])];
    for (const c of variants) {
      try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${c}.json`);
        const json = await res.json();
        if (json.status === 1) {
          const n = json.product.nutriments;
          setForm({ name: json.product.product_name || json.product.product_name_en || "", amount: "100", protein: round1(n["proteins_100g"] || 0), carbs: round1(n["carbohydrates_100g"] || 0), fat: round1(n["fat_100g"] || 0) });
          setBarcodeStatus("ok"); return;
        }
      } catch {}
    }
    setBarcodeStatus("err");
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{existing ? "Edit" : "New"} Ingredient <button className="icon-btn" onClick={onClose}>✕</button></div>
        <label className="lbl">Barcode lookup (optional)</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input className="inp" style={{ margin: 0, flex: 1 }} type="text" placeholder="e.g. 850791002000" value={barcode} onChange={e => { setBarcode(e.target.value); setBarcodeStatus(null); }} onKeyDown={e => e.key === "Enter" && lookupBarcode()} />
          <button className="btn btn-primary btn-sm" style={{ whiteSpace: "nowrap" }} onClick={lookupBarcode} disabled={barcodeStatus === "loading"}>{barcodeStatus === "loading" ? "…" : "🔍 Scan"}</button>
        </div>
        {barcodeStatus === "ok"  && <div style={{ background: "var(--accent-dim)", border: "1px solid rgba(200,241,53,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "var(--accent)" }}>✅ Found! Check fields below.</div>}
        {barcodeStatus === "err" && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "var(--danger)" }}>❌ Not found — enter manually.</div>}
        <div style={{ height: 1, background: "var(--border)", margin: "4px 0 14px" }} />
        <label className="lbl">Name</label>
        <input className="inp" placeholder="e.g. Chicken Breast" value={form.name} onChange={set("name")} />
        <label className="lbl">Amount (g)</label>
        <input className="inp" type="number" placeholder="100" value={form.amount} onChange={set("amount")} />
        <label className="lbl">Macros for {amt}g</label>
        <div className="grid2">
          <div><label className="lbl">Protein (g)</label><input className="inp" type="number" placeholder="31" value={form.protein} onChange={set("protein")} /></div>
          <div><label className="lbl">Carbs (g)</label><input className="inp" type="number" placeholder="0" value={form.carbs} onChange={set("carbs")} /></div>
          <div><label className="lbl">Fat (g)</label><input className="inp" type="number" placeholder="3.6" value={form.fat} onChange={set("fat")} /></div>
          <div><label className="lbl">Calories (auto)</label><input className="inp" value={calcCal ? calcCal + " kcal" : "—"} readOnly style={{ color: "var(--accent)", cursor: "default" }} /></div>
        </div>
        {amt !== 100 && calcCal > 0 && (
          <div className="preview">
            <span style={{ color: "var(--muted)" }}>Per 100g →</span>
            <span style={{ color: "var(--muted)" }}>CAL <span style={{ color: "var(--text)" }}>{Math.round(calcCal * factor)}</span></span>
            <span style={{ color: "var(--muted)" }}>P <span style={{ color: "var(--text)" }}>{round1(pro * factor)}g</span></span>
            <span style={{ color: "var(--muted)" }}>C <span style={{ color: "var(--text)" }}>{round1(carb * factor)}g</span></span>
            <span style={{ color: "var(--muted)" }}>F <span style={{ color: "var(--text)" }}>{round1(fat * factor)}g</span></span>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => onSave({ id: existing?.id || uid(), name: form.name, p100: { cal: Math.round(calcCal * factor), protein: round1(pro * factor), carbs: round1(carb * factor), fat: round1(fat * factor) } })}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Meal Modal ────────────────────────────────────────────────
function MealModal({ onSave, onClose, allIngredients, existing }) {
  const [name, setName] = useState(existing?.name || "");
  const [mode, setMode] = useState(existing?.manual ? "manual" : "ingredients");
  const [manual, setManual] = useState(existing?.manual || { cal: "", protein: "", carbs: "", fat: "" });
  const [mealIngs, setMealIngs] = useState(existing?.ingredients || []);
  const [search, setSearch] = useState("");
  const [addingIng, setAddingIng] = useState(null);
  const [addAmt, setAddAmt] = useState("100");
  const setM = k => e => setManual(f => ({ ...f, [k]: e.target.value }));
  const filtered = allIngredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) && !mealIngs.find(m => m.id === i.id));
  const preview = mode === "manual"
    ? { cal: +manual.cal || 0, protein: +manual.protein || 0, carbs: +manual.carbs || 0, fat: +manual.fat || 0 }
    : calcMealMacros({ ingredients: mealIngs }, allIngredients);
  const confirmAdd = () => { if (!addingIng || !addAmt) return; setMealIngs(p => [...p, { id: addingIng.id, name: addingIng.name, amount: +addAmt }]); setAddingIng(null); setAddAmt("100"); setSearch(""); };
  const valid = name && (mode === "manual" ? manual.cal : mealIngs.length > 0);
  const save = () => onSave({ id: existing?.id || uid(), name, ingredients: mode === "ingredients" ? mealIngs : [], manual: mode === "manual" ? { cal: +manual.cal, protein: +manual.protein || 0, carbs: +manual.carbs || 0, fat: +manual.fat || 0 } : null });
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{existing ? "Edit" : "New"} Meal <button className="icon-btn" onClick={onClose}>✕</button></div>
        <label className="lbl">Meal name</label>
        <input className="inp" placeholder="e.g. Honey Chilli Chicken" value={name} onChange={e => setName(e.target.value)} />
        <div className="toggle-group">
          <button className={`toggle ${mode === "ingredients" ? "active" : ""}`} onClick={() => setMode("ingredients")}>By Ingredients</button>
          <button className={`toggle ${mode === "manual" ? "active" : ""}`} onClick={() => setMode("manual")}>Manual Macros</button>
        </div>
        {mode === "ingredients" && (<>
          {mealIngs.map(mi => {
            const ing = allIngredients.find(i => i.id === mi.id);
            const r = mi.amount / 100;
            const sc = ing ? { cal: Math.round(ing.p100.cal * r), protein: round1(ing.p100.protein * r), carbs: round1(ing.p100.carbs * r), fat: round1(ing.p100.fat * r) } : null;
            return (
              <div key={mi.id} className="ing-chip" style={{ flexDirection: "column", alignItems: "stretch", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{mi.name}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent)" }}>{mi.amount}g</span>
                    <button className="del-btn" onClick={() => setMealIngs(p => p.filter(x => x.id !== mi.id))}>✕</button>
                  </span>
                </div>
                {sc && <span style={{ fontFamily: "Space Mono,monospace", fontSize: 10, color: "var(--muted)" }}>{sc.cal} kcal · P {sc.protein}g · C {sc.carbs}g · F {sc.fat}g</span>}
              </div>
            );
          })}
          {addingIng ? (
            <div style={{ background: "var(--card)", borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{addingIng.name}</div>
              <label className="lbl">Amount (grams)</label>
              <input className="inp" type="number" placeholder="100" value={addAmt} onChange={e => setAddAmt(e.target.value)} autoFocus />
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setAddingIng(null); setAddAmt("100"); }}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={confirmAdd}>Add</button>
              </div>
            </div>
          ) : (<>
            <input className="inp" placeholder="Search ingredients…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && (<div className="ing-list">
              {filtered.length === 0 && <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--muted)" }}>No matches</div>}
              {filtered.map(i => <div key={i.id} className="ing-result" onClick={() => { setAddingIng(i); setSearch(""); }}>{i.name} <span style={{ color: "var(--muted)", fontSize: 11 }}>— {i.p100.cal} kcal/100g</span></div>)}
            </div>)}
          </>)}
        </>)}
        {mode === "manual" && (<div className="grid2">
          <div><label className="lbl">Calories</label><input className="inp" type="number" placeholder="500" value={manual.cal} onChange={setM("cal")} /></div>
          <div><label className="lbl">Protein (g)</label><input className="inp" type="number" placeholder="40" value={manual.protein} onChange={setM("protein")} /></div>
          <div><label className="lbl">Carbs (g)</label><input className="inp" type="number" placeholder="50" value={manual.carbs} onChange={setM("carbs")} /></div>
          <div><label className="lbl">Fat (g)</label><input className="inp" type="number" placeholder="15" value={manual.fat} onChange={setM("fat")} /></div>
        </div>)}
        {preview.cal > 0 && (<div className="preview">
          <span style={{ color: "var(--muted)" }}>CAL <span style={{ color: "var(--text)" }}>{preview.cal}</span></span>
          <span style={{ color: "var(--muted)" }}>PRO <span style={{ color: "var(--text)" }}>{round1(preview.protein)}g</span></span>
          <span style={{ color: "var(--muted)" }}>CARB <span style={{ color: "var(--text)" }}>{round1(preview.carbs)}g</span></span>
          <span style={{ color: "var(--muted)" }}>FAT <span style={{ color: "var(--text)" }}>{round1(preview.fat)}g</span></span>
        </div>)}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={save}>Save Meal</button>
        </div>
      </div>
    </div>
  );
}

// ── Log Modal ─────────────────────────────────────────────────
function LogModal({ onSave, onClose, meals, ingredients }) {
  const [tab, setTab] = useState("saved");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [servings, setServings] = useState("1");
  const [quick, setQuick] = useState({ name: "", cal: "", protein: "", carbs: "", fat: "" });
  const setQ = k => e => setQuick(f => ({ ...f, [k]: e.target.value }));
  const mealMacros = selectedMeal ? calcMealMacros(selectedMeal, ingredients) : null;
  const s = +servings || 1;
  const scaled = mealMacros ? { cal: Math.round(mealMacros.cal * s), protein: round1(mealMacros.protein * s), carbs: round1(mealMacros.carbs * s), fat: round1(mealMacros.fat * s) } : null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Log Food <button className="icon-btn" onClick={onClose}>✕</button></div>
        <div className="toggle-group">
          <button className={`toggle ${tab === "saved" ? "active" : ""}`} onClick={() => { setTab("saved"); setSelectedMeal(null); }}>Saved Meals</button>
          <button className={`toggle ${tab === "quick" ? "active" : ""}`} onClick={() => setTab("quick")}>Quick Add</button>
        </div>
        {tab === "saved" && (<>
          {meals.length === 0 && <div className="empty"><div className="empty-icon">🍽</div><div className="empty-text">No saved meals yet.</div></div>}
          {!selectedMeal && meals.map(m => {
            const mac = calcMealMacros(m, ingredients);
            return (<div key={m.id} className="meal-card" onClick={() => setSelectedMeal(m)}>
              <div><div className="meal-card-name">{m.name}</div><div className="meal-card-macros">P {mac.protein}g · C {mac.carbs}g · F {mac.fat}g</div></div>
              <div className="meal-card-cal">{mac.cal}</div>
            </div>);
          })}
          {selectedMeal && scaled && (<>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <button className="icon-btn" style={{ fontSize: 14 }} onClick={() => setSelectedMeal(null)}>← Back</button>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{selectedMeal.name}</span>
            </div>
            <div className="serving-row">
              <span style={{ fontSize: 13 }}>Servings <span style={{ color: "var(--muted)", fontSize: 11 }}>(1 = full meal)</span></span>
              <input className="serving-inp" type="number" step="0.25" min="0.25" value={servings} onChange={e => setServings(e.target.value)} />
            </div>
            <div className="preview">
              <span style={{ color: "var(--muted)" }}>CAL <span style={{ color: "var(--text)" }}>{scaled.cal}</span></span>
              <span style={{ color: "var(--muted)" }}>PRO <span style={{ color: "var(--text)" }}>{scaled.protein}g</span></span>
              <span style={{ color: "var(--muted)" }}>CARB <span style={{ color: "var(--text)" }}>{scaled.carbs}g</span></span>
              <span style={{ color: "var(--muted)" }}>FAT <span style={{ color: "var(--text)" }}>{scaled.fat}g</span></span>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={() => onSave({ id: uid(), name: selectedMeal.name + (servings !== "1" ? ` x${servings}` : ""), ...scaled })}>Log It</button>
            </div>
          </>)}
        </>)}
        {tab === "quick" && (<>
          <label className="lbl">Name</label>
          <input className="inp" placeholder="e.g. Protein Bar" value={quick.name} onChange={setQ("name")} />
          <div className="grid2">
            <div><label className="lbl">Calories</label><input className="inp" type="number" placeholder="150" value={quick.cal} onChange={setQ("cal")} /></div>
            <div><label className="lbl">Protein (g)</label><input className="inp" type="number" placeholder="28" value={quick.protein} onChange={setQ("protein")} /></div>
            <div><label className="lbl">Carbs (g)</label><input className="inp" type="number" placeholder="12" value={quick.carbs} onChange={setQ("carbs")} /></div>
            <div><label className="lbl">Fat (g)</label><input className="inp" type="number" placeholder="2" value={quick.fat} onChange={setQ("fat")} /></div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={!quick.name || !quick.cal} onClick={() => onSave({ id: uid(), name: quick.name, cal: +quick.cal, protein: +quick.protein || 0, carbs: +quick.carbs || 0, fat: +quick.fat || 0 })}>Log It</button>
          </div>
        </>)}
      </div>
    </div>
  );
}

// ── Targets Modal ─────────────────────────────────────────────
function TargetsModal({ targets, onSave, onClose }) {
  const [form, setForm] = useState(targets);
  const set = k => e => setForm(f => ({ ...f, [k]: +e.target.value }));
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Daily Targets <button className="icon-btn" onClick={onClose}>✕</button></div>
        <div className="grid2">
          <div><label className="lbl">Calories</label><input className="inp" type="number" value={form.cal} onChange={set("cal")} /></div>
          <div><label className="lbl">Protein (g)</label><input className="inp" type="number" value={form.protein} onChange={set("protein")} /></div>
          <div><label className="lbl">Carbs (g)</label><input className="inp" type="number" value={form.carbs} onChange={set("carbs")} /></div>
          <div><label className="lbl">Fat (g)</label><input className="inp" type="number" value={form.fat} onChange={set("fat")} /></div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState("today");
  const [ingredients, setIngredients] = useState([]);
  const [meals, setMeals] = useState([]);
  const [log, setLog] = useState({});
  const [targets, setTargets] = useState({ cal: 1673, protein: 150, carbs: 155, fat: 50 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editMeal, setEditMeal] = useState(null);
  const [editIng, setEditIng] = useState(null);
  const [toast, setToast] = useState(null);
  const [editingHistoryDay, setEditingHistoryDay] = useState(null);
  const [historyLogDate, setHistoryLogDate] = useState(null);

  const showToast = (ok) => { setToast(ok ? "saved" : "error"); setTimeout(() => setToast(null), 2000); };

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Load data from Supabase
  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;
    (async () => {
      setLoading(true);
      const [{ data: ingRows }, { data: mealRows }, { data: logRows, error: logError }, { data: tgtRow }] = await Promise.all([
        supabase.from("ingredients").select("*").eq("user_id", uid),
        supabase.from("meals").select("*").eq("user_id", uid),
        supabase.from("food_log").select("*").eq("user_id", uid),
        supabase.from("targets").select("*").eq("user_id", uid).single(),
      ]);

      if (ingRows?.length) setIngredients(ingRows.map(r => r.data));
      else {
        setIngredients(DEFAULT_INGS);
        await Promise.all(DEFAULT_INGS.map(ing => supabase.from("ingredients").upsert({ id: ing.id, user_id: uid, data: ing })));
      }
      if (mealRows?.length) setMeals(mealRows.map(r => r.data));
      else {
        setMeals(DEFAULT_MEALS);
        await Promise.all(DEFAULT_MEALS.map(m => supabase.from("meals").upsert({ id: m.id, user_id: uid, data: m })));
      }

      if (logError) console.error("food_log fetch error:", logError);

      const logObj = {};
      (logRows || []).forEach(r => { logObj[r.id] = r.data || []; });

      const SEED = {
        "2026-04-21": [
          { id: "s21a", name: "🍗 Honey Chilli Chicken + Rice", cal: 769, protein: 73,   carbs: 88.9, fat: 10.6 },
          { id: "s21b", name: "🍫 Protein Bar",                  cal: 150, protein: 28,   carbs: 12,   fat: 2    },
          { id: "s21c", name: "🥪 Sandwich",                     cal: 245, protein: 26,   carbs: 18,   fat: 8.5  },
        ],
        "2026-04-22": [
          { id: "s22a", name: "🍗 Honey Chilli Chicken + Rice", cal: 769, protein: 73,   carbs: 88.9, fat: 10.6 },
          { id: "s22b", name: "🌮 Taco Beef Pita",              cal: 314, protein: 29,   carbs: 22,   fat: 13.5 },
          { id: "s22c", name: "🍿 Protein Chips (1 bag)",       cal: 140, protein: 19,   carbs: 5,    fat: 5    },
        ],
      };
      const seedUpserts = [];
      for (const [date, entries] of Object.entries(SEED)) {
        if (!logObj[date]) {
          logObj[date] = entries;
          seedUpserts.push(supabase.from("food_log").upsert({ id: date, user_id: uid, data: entries }));
        }
      }
      if (seedUpserts.length) await Promise.all(seedUpserts);

      setLog(logObj);
      if (tgtRow) setTargets(tgtRow.data);
      setLoading(false);
    })();
  }, [session]);

  const userId = session?.user?.id;

  const saveIngs = async (d) => {
    setIngredients(d);
    await Promise.all(d.map(ing => supabase.from("ingredients").upsert({ id: ing.id, user_id: userId, data: ing })));
    showToast(true);
  };
  const saveMeals = async (d) => {
    setMeals(d);
    await Promise.all(d.map(m => supabase.from("meals").upsert({ id: m.id, user_id: userId, data: m })));
    showToast(true);
  };
  const saveLog = async (d) => {
    setLog(d);
    await Promise.all(Object.entries(d).map(([dateKey, entries]) =>
      supabase.from("food_log").upsert({ id: dateKey, user_id: userId, data: entries })
    ));
    showToast(true);
  };
  const saveTgts = async (d) => {
    setTargets(d);
    await supabase.from("targets").upsert({ user_id: userId, data: d });
    showToast(true);
  };

  const today = todayStr();
  const todayLog = log[today] || [];
  const totals = todayLog.reduce((a, e) => ({ cal: a.cal + e.cal, protein: a.protein + e.protein, carbs: a.carbs + e.carbs, fat: a.fat + e.fat }), { cal: 0, protein: 0, carbs: 0, fat: 0 });
  const deficit = targets.cal - totals.cal;

  const handleLogEntry = entry => { saveLog({ ...log, [today]: [...(log[today] || []), entry] }); setModal(null); };
  const handleHistoryLogEntry = entry => { const d = historyLogDate; saveLog({ ...log, [d]: [...(log[d] || []), entry] }); setModal(null); setHistoryLogDate(null); };
  const deleteLogEntry = id => saveLog({ ...log, [today]: (log[today] || []).filter(e => e.id !== id) });
  const handleSaveMeal = meal => { saveMeals(editMeal ? meals.map(m => m.id === meal.id ? meal : m) : [...meals, meal]); setModal(null); setEditMeal(null); };
  const handleSaveIng = ing => { saveIngs(editIng ? ingredients.map(i => i.id === ing.id ? ing : i) : [...ingredients, ing]); setModal(null); setEditIng(null); };
  const deleteMeal = async id => { setMeals(p => p.filter(m => m.id !== id)); await supabase.from("meals").delete().eq("id", id); };
  const deleteIng = async id => { setIngredients(p => p.filter(i => i.id !== id)); await supabase.from("ingredients").delete().eq("id", id); };

  if (authLoading) return <div style={{ background: "#080c0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5e4b", fontFamily: "sans-serif" }}>Loading…</div>;
  if (!session) return <AuthScreen onAuth={setSession} />;
  if (loading) return <div style={{ background: "#080c0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5e4b", fontFamily: "sans-serif" }}>Loading your data…</div>;

  return (
    <>
      <style>{STYLES}</style>
      {toast && <div className={`toast ${toast === "saved" ? "toast-ok" : "toast-err"}`}>{toast === "saved" ? "💾 Saved" : "⚠️ Save failed"}</div>}
      <div className="app">
        <div style={{ flexShrink: 0 }}>
          <div className="header">
            <div className="logo">MACRO<span>TRACK</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "Space Mono,monospace", fontSize: 11, color: "var(--muted)" }}>{fmtDate(today)}</span>
              <button className="icon-btn" onClick={() => setModal("targets")}>⚙</button>
              <button className="icon-btn" style={{ fontSize: 14 }} onClick={() => supabase.auth.signOut()} title="Sign out">⏏</button>
            </div>
          </div>

          <div className="summary">
            <div className="cal-row">
              <span className="cal-num">{Math.round(totals.cal)}</span>
              <span className="cal-sub">kcal</span>
              <span className="cal-target">/ {targets.cal}</span>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ width: "100%", height: 8, background: "var(--card)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 4, background: totals.cal > targets.cal ? "var(--danger)" : "var(--accent)", width: `${Math.min((totals.cal / Math.max(targets.cal, 1)) * 100, 100)}%`, transition: "width 0.4s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontFamily: "Space Mono,monospace", fontSize: 10, color: "var(--muted)" }}>
                <span>{Math.round((totals.cal / Math.max(targets.cal, 1)) * 100)}% of goal</span>
                <span>{Math.max(targets.cal - Math.round(totals.cal), 0)} remaining</span>
              </div>
            </div>
            <div className="macro-bars">
              <MacroBar label="Protein" val={totals.protein} target={targets.protein} color="var(--protein)" />
              <MacroBar label="Carbs"   val={totals.carbs}   target={targets.carbs}   color="var(--carbs)"   />
              <MacroBar label="Fat"     val={totals.fat}     target={targets.fat}     color="var(--fat)"     />
            </div>
            <div className="deficit">
              <span style={{ color: "var(--muted)" }}>Remaining</span>
              <span style={{ color: deficit >= 0 ? "var(--accent)" : "var(--danger)" }}>{deficit >= 0 ? deficit : `+${Math.abs(deficit)}`} kcal</span>
            </div>
          </div>

          <div className="tabs">
            {["today", "meals", "ingredients", "history"].map(t => (
              <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="content" onClick={() => setEditingHistoryDay(null)}>

          {tab === "today" && (<>
            <div className="sec-hdr"><span className="sec-title">Today's Log</span></div>
            {todayLog.length === 0 && <div className="empty"><div className="empty-icon">🥗</div><div className="empty-text">Nothing logged yet.<br />Tap + to add food.</div></div>}
            {todayLog.map(e => (
              <div key={e.id} className="log-entry">
                <div><div className="entry-name">{e.name}</div><div className="entry-macros">P {e.protein}g · C {e.carbs}g · F {e.fat}g</div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="entry-cal">{e.cal}</span>
                  <button className="del-btn" onClick={() => deleteLogEntry(e.id)}>✕</button>
                </div>
              </div>
            ))}
          </>)}

          {tab === "meals" && (<>
            <div className="sec-hdr">
              <span className="sec-title">Saved Meals</span>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditMeal(null); setModal("meal"); }}>+ New</button>
            </div>
            {meals.length === 0 && <div className="empty"><div className="empty-icon">🍳</div><div className="empty-text">No meals yet.</div></div>}
            {meals.map(m => {
              const mac = calcMealMacros(m, ingredients);
              return (
                <div key={m.id} className="meal-card" onClick={() => { setEditMeal(m); setModal("meal"); }}>
                  <div style={{ flex: 1 }}>
                    <div className="meal-card-name">{m.name}</div>
                    <div className="meal-card-macros">P {mac.protein}g · C {mac.carbs}g · F {mac.fat}g</div>
                    {m.ingredients?.length > 0 && <div style={{ marginTop: 6 }}>{m.ingredients.map(mi => <span key={mi.id} className="tag">{mi.name} {mi.amount}g</span>)}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <span className="meal-card-cal">{mac.cal}</span>
                    <button className="del-btn" onClick={e => { e.stopPropagation(); deleteMeal(m.id); }}>✕</button>
                  </div>
                </div>
              );
            })}
          </>)}

          {tab === "ingredients" && (<>
            <div className="sec-hdr">
              <span className="sec-title">Ingredient Library</span>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditIng(null); setModal("ingredient"); }}>+ New</button>
            </div>
            {ingredients.length === 0 && <div className="empty"><div className="empty-icon">🥩</div><div className="empty-text">No ingredients yet.</div></div>}
            {ingredients.map(i => (
              <div key={i.id} className="log-entry">
                <div><div className="entry-name">{i.name}</div><div className="entry-macros">per 100g · P {i.p100.protein}g · C {i.p100.carbs}g · F {i.p100.fat}g</div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="entry-cal">{i.p100.cal}</span>
                  <button className="del-btn" style={{ fontSize: 13 }} onClick={() => { setEditIng(i); setModal("ingredient"); }}>✎</button>
                  <button className="del-btn" onClick={() => deleteIng(i.id)}>✕</button>
                </div>
              </div>
            ))}
          </>)}

          {tab === "history" && (() => {
            const pastDays = Object.keys(log).filter(d => d !== today).sort((a, b) => b.localeCompare(a));
            if (!pastDays.length) return <div className="empty"><div className="empty-icon">📅</div><div className="empty-text">No history yet.<br />Past days will appear here.</div></div>;
            return pastDays.map(d => {
              const entries = log[d] || [];
              const tot = entries.reduce((a, e) => ({ cal: a.cal + e.cal, protein: a.protein + e.protein, carbs: a.carbs + e.carbs, fat: a.fat + e.fat }), { cal: 0, protein: 0, carbs: 0, fat: 0 });
              const pct = Math.min((tot.cal / Math.max(targets.cal, 1)) * 100, 100);
              const over = tot.cal > targets.cal;
              const isEditing = editingHistoryDay === d;
              return (
                <div key={d} style={{ background: "var(--surface)", border: `1px solid ${isEditing ? "var(--accent)" : "var(--border)"}`, borderRadius: 14, padding: 14, marginBottom: 10, cursor: isEditing ? "default" : "pointer", transition: "border-color 0.2s" }}
                  onClick={e => { e.stopPropagation(); if (!isEditing) setEditingHistoryDay(d); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{fmtDate(d)}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "Space Mono,monospace", fontSize: 16, fontWeight: 700, color: over ? "var(--danger)" : "var(--accent)" }}>
                        {Math.round(tot.cal)} <span style={{ fontSize: 10, color: "var(--muted)" }}>/ {targets.cal} kcal</span>
                      </span>
                      {isEditing && <button className="icon-btn" style={{ fontSize: 13 }} onClick={e => { e.stopPropagation(); setEditingHistoryDay(null); }}>✕</button>}
                    </div>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "var(--card)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: over ? "var(--danger)" : "var(--accent)", transition: "width 0.4s" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Space Mono,monospace", fontSize: 10, color: "var(--muted)", marginBottom: 10 }}>
                    <span>P <span style={{ color: "var(--protein)" }}>{Math.round(tot.protein)}g</span></span>
                    <span>C <span style={{ color: "var(--carbs)" }}>{Math.round(tot.carbs)}g</span></span>
                    <span>F <span style={{ color: "var(--fat)" }}>{Math.round(tot.fat)}g</span></span>
                    <span style={{ color: over ? "var(--danger)" : "var(--accent)" }}>{over ? `+${Math.round(tot.cal - targets.cal)}` : `-${Math.round(targets.cal - tot.cal)}`} kcal</span>
                  </div>
                  {entries.map(e => (
                    <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderTop: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 12, color: "var(--text)" }}>{e.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "Space Mono,monospace", fontSize: 11, color: "var(--accent)" }}>{e.cal}</span>
                        {isEditing && <button className="del-btn" onClick={ev => { ev.stopPropagation(); const updated = { ...log, [d]: log[d].filter(x => x.id !== e.id) }; saveLog(updated); }}>✕</button>}
                      </div>
                    </div>
                  ))}
                  {isEditing && (
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 12, width: "100%" }}
                      onClick={e => { e.stopPropagation(); setHistoryLogDate(d); setModal("log"); }}>
                      + Add Food
                    </button>
                  )}
                </div>
              );
            });
          })()}
        </div>

        {tab === "today"       && <button className="fab" onClick={() => setModal("log")}>+</button>}
        {tab === "meals"       && <button className="fab" onClick={() => { setEditMeal(null); setModal("meal"); }}>+</button>}
        {tab === "ingredients" && <button className="fab" onClick={() => { setEditIng(null); setModal("ingredient"); }}>+</button>}
        {tab === "history"     && <button className="fab" onClick={() => setTab("today")}>↩</button>}

        {modal === "log"        && <LogModal meals={meals} ingredients={ingredients} onSave={historyLogDate ? handleHistoryLogEntry : handleLogEntry} onClose={() => { setModal(null); setHistoryLogDate(null); }} />}
        {modal === "meal"       && <MealModal allIngredients={ingredients} existing={editMeal} onSave={handleSaveMeal} onClose={() => { setModal(null); setEditMeal(null); }} />}
        {modal === "ingredient" && <IngredientModal existing={editIng} onSave={handleSaveIng} onClose={() => { setModal(null); setEditIng(null); }} />}
        {modal === "targets"    && <TargetsModal targets={targets} onSave={t => { saveTgts(t); setModal(null); }} onClose={() => setModal(null)} />}
      </div>
    </>
  );
}
