import { useState } from "react";
import { calcIngredientMacros, calcMealMacros, round1, scaleMacros, sumMacros, uid } from "../../utils";
import { DEFAULT_INGS } from "../../data/defaults";
import lookupOFF from "../../services/openFoodFacts";
import useCameraScanner from "../../hooks/useCameraScanner";
import CameraIcon from "../camera/CameraIcon";
import CameraOverlay from "../camera/CameraOverlay";

export default function LogModal({ onSave, onClose, meals, ingredients, confirmDelete }) {
  const [tab, setTab] = useState("saved");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [servings, setServings] = useState("1");
  const [quick, setQuick] = useState({ name: "", cal: "", protein: "", carbs: "", fat: "" });
  const [logItems, setLogItems] = useState([]);
  const [ingSearch, setIngSearch] = useState("");
  const [addingItem, setAddingItem] = useState(null);
  const [addAmt, setAddAmt] = useState("100");
  const [barcode, setBarcode] = useState("");
  const [scanStatus, setScanStatus] = useState(null);
  const [showManualLog, setShowManualLog] = useState(false);
  const [manualLogForm, setManualLogForm] = useState({ name: "", amount: "100", protein: "", carbs: "", fat: "" });
  const setQ = k => e => setQuick(f => ({ ...f, [k]: e.target.value }));
  const setMLF = k => e => setManualLogForm(f => ({ ...f, [k]: e.target.value }));
  const manualLogCal = Math.round((+manualLogForm.protein || 0) * 4 + (+manualLogForm.carbs || 0) * 4 + (+manualLogForm.fat || 0) * 9);
  const confirmManualLog = () => {
    if (!manualLogForm.name) return;
    const amt = +manualLogForm.amount || 100;
    const pro = +manualLogForm.protein || 0, carb = +manualLogForm.carbs || 0, fat = +manualLogForm.fat || 0;
    const cal = Math.round(pro * 4 + carb * 4 + fat * 9);
    const p100 = { cal: Math.round(cal * 100 / amt), protein: round1(pro * 100 / amt), carbs: round1(carb * 100 / amt), fat: round1(fat * 100 / amt) };
    setLogItems(prev => [...prev, { id: uid(), name: manualLogForm.name, amount: amt, p100 }]);
    setManualLogForm({ name: "", amount: "100", protein: "", carbs: "", fat: "" });
    setShowManualLog(false);
  };
  const macroIngredients = [...ingredients, ...DEFAULT_INGS.filter(fallback => !ingredients.some(item => item.id === fallback.id))];
  const mealMacros = selectedMeal ? calcMealMacros(selectedMeal, macroIngredients) : null;
  const s = Number(servings);
  const validServings = Number.isFinite(s) && s > 0;
  const scaled = mealMacros ? scaleMacros(mealMacros, validServings ? s : 0) : null;
  const libFiltered = ingredients.filter(i => i.name.toLowerCase().includes(ingSearch.toLowerCase()));
  const ingTotal = sumMacros(logItems, calcIngredientMacros);
  const confirmLogItem = () => {
    if (!addingItem || !addAmt) return;
    setLogItems(p => [...p, { id: uid(), name: addingItem.name, p100: addingItem.p100, amount: +addAmt }]);
    setAddingItem(null); setAddAmt("100"); setIngSearch("");
  };

  const lookupLogBarcode = async (value) => {
    const normalized = String(value || "").replace(/\D/g, "");
    if (!/^\d{8,14}$/.test(normalized)) {
      setScanStatus("invalid");
      return false;
    }
    setBarcode(normalized);
    setScanStatus("loading");
    const savedIngredient = ingredients.find(ingredient => ingredient.barcode === normalized);
    if (savedIngredient) {
      setScanStatus(null);
      setAddAmt(String(savedIngredient.servingSize || 100));
      setAddingItem(savedIngredient);
      return true;
    }
    const found = await lookupOFF(normalized);
    if (found) {
      setScanStatus(null);
      setAddAmt(String(found.servingSize || 100));
      setAddingItem({ name: found.name, p100: found.p100, servingSize: found.servingSize });
      return true;
    }
    setScanStatus("err");
    return false;
  };

  const { cameraOpen, cameraError, cameraState, capturedCode, openCamera, closeCamera, videoRef } = useCameraScanner(lookupLogBarcode);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Log Food <button className="icon-btn" onClick={onClose}>✕</button></div>
        <div className="toggle-group">
          <button className={`toggle ${tab === "saved" ? "active" : ""}`} onClick={() => { setTab("saved"); setSelectedMeal(null); }}>Saved Meals</button>
          <button className={`toggle ${tab === "ingredients" ? "active" : ""}`} onClick={() => setTab("ingredients")}>Ingredients</button>
          <button className={`toggle ${tab === "quick" ? "active" : ""}`} onClick={() => setTab("quick")}>Quick Add</button>
        </div>
        {tab === "saved" && (<>
          {meals.length === 0 && <div className="empty"><div className="empty-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><line x1="8" y1="12" x2="16" y2="12"/></svg></div><div className="empty-text">No saved meals yet.</div></div>}
          {!selectedMeal && meals.map(m => {
            const mac = calcMealMacros(m, macroIngredients);
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
              <button className="btn btn-primary" disabled={!validServings} onClick={() => onSave({ id: uid(), mealId: selectedMeal.id, servings: s, name: selectedMeal.name + (servings !== "1" ? ` x${servings}` : ""), ...scaled })}>Log It</button>
            </div>
          </>)}
        </>)}
        {tab === "ingredients" && (<>
          {addingItem ? (
            <div style={{ background: "var(--card)", borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{addingItem.name}</div>
              <label className="lbl">Amount (grams)</label>
              <input className="inp" type="number" placeholder="100" value={addAmt} onChange={e => setAddAmt(e.target.value)} autoFocus />
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setAddingItem(null); setAddAmt("100"); }}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={confirmLogItem}>Add</button>
              </div>
            </div>
          ) : showManualLog ? (
            <div style={{ background: "var(--card)", borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Manual Entry</div>
              <label className="lbl">Name</label>
              <input className="inp" placeholder="Ingredient name" value={manualLogForm.name} onChange={setMLF("name")} autoFocus />
              <div className="grid2">
                <div><label className="lbl">Amount (g)</label><input className="inp" type="number" placeholder="100" value={manualLogForm.amount} onChange={setMLF("amount")} /></div>
                <div><label className="lbl">Calories (auto)</label><input className="inp" value={manualLogCal ? manualLogCal + " kcal" : "—"} readOnly style={{ color: "var(--accent)", cursor: "default" }} /></div>
                <div><label className="lbl">Protein (g)</label><input className="inp" type="number" placeholder="0" value={manualLogForm.protein} onChange={setMLF("protein")} /></div>
                <div><label className="lbl">Carbs (g)</label><input className="inp" type="number" placeholder="0" value={manualLogForm.carbs} onChange={setMLF("carbs")} /></div>
                <div><label className="lbl">Fat (g)</label><input className="inp" type="number" placeholder="0" value={manualLogForm.fat} onChange={setMLF("fat")} /></div>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setShowManualLog(false); setManualLogForm({ name: "", amount: "100", protein: "", carbs: "", fat: "" }); }}>Cancel</button>
                <button className="btn btn-primary btn-sm" disabled={!manualLogForm.name} onClick={confirmManualLog}>Add</button>
              </div>
            </div>
          ) : (<>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input className="inp" style={{ margin: 0, flex: 1 }} placeholder="Search ingredients…" value={ingSearch} onChange={e => { setIngSearch(e.target.value); setScanStatus(null); }} />
              <button className="btn btn-ghost btn-sm" style={{ padding: "6px 10px" }} onClick={openCamera} title="Scan barcode"><CameraIcon /></button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowManualLog(true)}>Manual</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input className="inp" style={{ margin: 0, flex: 1 }} inputMode="numeric" placeholder="Enter barcode (8–14 digits)" value={barcode} onChange={e => { setBarcode(e.target.value); setScanStatus(null); }} onKeyDown={e => e.key === "Enter" && lookupLogBarcode(barcode)} />
              <button className="btn btn-primary btn-sm" onClick={() => lookupLogBarcode(barcode)} disabled={scanStatus === "loading"}>{scanStatus === "loading" ? "…" : "Lookup"}</button>
            </div>
            {scanStatus === "loading" && <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, textAlign: "center" }}>Looking up barcode…</div>}
            {scanStatus === "err" && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "var(--danger)" }}>Barcode not found — search manually.</div>}
            {scanStatus === "invalid" && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "var(--danger)" }}>Enter the 8–14 digits printed below the barcode.</div>}
            {ingSearch && (<div className="ing-list">
              {libFiltered.length === 0 && <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--muted)" }}>No matches</div>}
              {libFiltered.map(i => <div key={i.id} className="ing-result" onClick={() => { setAddingItem(i); setAddAmt(String(i.servingSize || 100)); setIngSearch(""); setScanStatus(null); }}>{i.name} <span style={{ color: "var(--muted)", fontSize: 11 }}>— {i.p100.cal} kcal/100g</span></div>)}
            </div>)}
          </>)}
          {logItems.map(item => {
            const cal = Math.round(item.p100.cal * item.amount / 100);
            return (
              <div key={item.id} className="ing-chip">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "Space Mono,monospace", marginTop: 2 }}>{item.amount}g · {cal} kcal</div>
                </div>
                <button className="del-btn" onClick={async () => { if (await confirmDelete(item.name)) setLogItems(p => p.filter(x => x.id !== item.id)); }}>✕</button>
              </div>
            );
          })}
          {logItems.length > 0 && (
            <div className="preview">
              <span style={{ color: "var(--muted)" }}>CAL <span style={{ color: "var(--text)" }}>{ingTotal.cal}</span></span>
              <span style={{ color: "var(--muted)" }}>PRO <span style={{ color: "var(--text)" }}>{round1(ingTotal.protein)}g</span></span>
              <span style={{ color: "var(--muted)" }}>CARB <span style={{ color: "var(--text)" }}>{round1(ingTotal.carbs)}g</span></span>
              <span style={{ color: "var(--muted)" }}>FAT <span style={{ color: "var(--text)" }}>{round1(ingTotal.fat)}g</span></span>
            </div>
          )}
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={logItems.length === 0} onClick={() => onSave({ id: uid(), name: `Custom · ${logItems.length} ingredient${logItems.length !== 1 ? "s" : ""}`, ...ingTotal, ingredients: logItems })}>Log It</button>
          </div>
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
      {cameraOpen && <CameraOverlay videoRef={videoRef} error={cameraError} state={cameraState} capturedCode={capturedCode} onClose={closeCamera} />}
    </div>
  );
}
