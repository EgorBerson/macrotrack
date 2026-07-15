import { useState } from "react";
import { calcMealMacros, normalizeIngredientName, round1, uid } from "../../utils";
import { DEFAULT_INGS } from "../../data/defaults";
import lookupOFF from "../../services/openFoodFacts";
import useCameraScanner from "../../hooks/useCameraScanner";
import CameraIcon from "../camera/CameraIcon";
import CameraOverlay from "../camera/CameraOverlay";

export default function MealModal({ onSave, onClose, allIngredients, existing, confirmDelete }) {
  const [name, setName] = useState(existing?.name || "");
  const [mode, setMode] = useState(existing?.manual ? "manual" : "ingredients");
  const [manual, setManual] = useState(existing?.manual || { cal: "", protein: "", carbs: "", fat: "" });
  const [mealIngs, setMealIngs] = useState(existing?.ingredients || []);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [addingIng, setAddingIng] = useState(null);
  const [addAmt, setAddAmt] = useState("100");
  const [barcode, setBarcode] = useState("");
  const [scanStatus, setScanStatus] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [showManualMeal, setShowManualMeal] = useState(false);
  const [manualMealForm, setManualMealForm] = useState({ name: "", amount: "100", protein: "", carbs: "", fat: "" });
  const setM = k => e => setManual(f => ({ ...f, [k]: e.target.value }));
  const setMMF = k => e => setManualMealForm(f => ({ ...f, [k]: e.target.value }));
  const manualMealCal = Math.round((+manualMealForm.protein || 0) * 4 + (+manualMealForm.carbs || 0) * 4 + (+manualMealForm.fat || 0) * 9);
  const confirmManualMeal = () => {
    if (!manualMealForm.name) return;
    const amt = +manualMealForm.amount || 100;
    const pro = +manualMealForm.protein || 0, carb = +manualMealForm.carbs || 0, fat = +manualMealForm.fat || 0;
    const cal = Math.round(pro * 4 + carb * 4 + fat * 9);
    const p100 = { cal: Math.round(cal * 100 / amt), protein: round1(pro * 100 / amt), carbs: round1(carb * 100 / amt), fat: round1(fat * 100 / amt) };
    setMealIngs(prev => [...prev, { id: uid(), name: manualMealForm.name, amount: amt, p100 }]);
    setManualMealForm({ name: "", amount: "100", protein: "", carbs: "", fat: "" });
    setShowManualMeal(false);
  };
  const availableIngredients = allIngredients.filter(ingredient =>
    ingredient?.id && ingredient?.name && !mealIngs.some(mealIngredient => mealIngredient.id === ingredient.id)
  );
  const searchTerms = normalizeIngredientName(search).split(" ").filter(Boolean);
  const filtered = availableIngredients.filter(ingredient => {
    const normalizedName = normalizeIngredientName(ingredient.name);
    return searchTerms.every(term => normalizedName.includes(term));
  });
  const macroIngredients = [...allIngredients, ...DEFAULT_INGS.filter(fallback => !allIngredients.some(item => item.id === fallback.id))];
  const preview = mode === "manual"
    ? { cal: +manual.cal || 0, protein: +manual.protein || 0, carbs: +manual.carbs || 0, fat: +manual.fat || 0 }
    : calcMealMacros({ ingredients: mealIngs }, macroIngredients);
  const confirmAdd = () => {
    if (!addingIng || !addAmt) return;
    const entry = { id: addingIng.id, name: addingIng.name, amount: +addAmt };
    if (addingIng.p100) entry.p100 = addingIng.p100;
    setMealIngs(p => [...p, entry]);
    setAddingIng(null); setAddAmt("100"); setSearch(""); setSearchOpen(false);
  };
  const valid = name && (mode === "manual" ? manual.cal : mealIngs.length > 0);
  const save = async () => {
    if (!valid) return;
    setSaveError(null);
    const result = await onSave({ id: existing?.id || uid(), name: name.trim(), ingredients: mode === "ingredients" ? mealIngs : [], manual: mode === "manual" ? { cal: +manual.cal, protein: +manual.protein || 0, carbs: +manual.carbs || 0, fat: +manual.fat || 0 } : null });
    if (result?.ok === false) setSaveError(result.message || "This meal composition is already saved.");
  };

  const lookupMealBarcode = async (value) => {
    const normalized = String(value || "").replace(/\D/g, "");
    if (!/^\d{8,14}$/.test(normalized)) {
      setScanStatus("invalid");
      return false;
    }
    setBarcode(normalized);
    setScanStatus("loading");
    const savedIngredient = allIngredients.find(ingredient => ingredient.barcode === normalized);
    if (savedIngredient) {
      setScanStatus(null);
      setAddAmt(String(savedIngredient.servingSize || 100));
      setAddingIng(savedIngredient);
      return true;
    }
    const found = await lookupOFF(normalized);
    if (found) {
      setScanStatus(null);
      setAddAmt(String(found.servingSize || 100));
      setAddingIng({ id: uid(), name: found.name, p100: found.p100, servingSize: found.servingSize });
      return true;
    }
    setScanStatus("err");
    return false;
  };

  const { cameraOpen, cameraError, cameraState, capturedCode, openCamera, closeCamera, videoRef } = useCameraScanner(lookupMealBarcode);

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
            const p100 = mi.p100 || allIngredients.find(i => i.id === mi.id)?.p100;
            const r = mi.amount / 100;
            const sc = p100 ? { cal: Math.round(p100.cal * r), protein: round1(p100.protein * r), carbs: round1(p100.carbs * r), fat: round1(p100.fat * r) } : null;
            return (
              <div key={mi.id} className="ing-chip" style={{ flexDirection: "column", alignItems: "stretch", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{mi.name}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent)" }}>{mi.amount}g</span>
                    <button className="del-btn" onClick={async () => { if (await confirmDelete(mi.name)) setMealIngs(p => p.filter(x => x.id !== mi.id)); }}>✕</button>
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
          ) : showManualMeal ? (
            <div style={{ background: "var(--card)", borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Manual Entry</div>
              <label className="lbl">Name</label>
              <input className="inp" placeholder="Ingredient name" value={manualMealForm.name} onChange={setMMF("name")} autoFocus />
              <div className="grid2">
                <div><label className="lbl">Amount (g)</label><input className="inp" type="number" placeholder="100" value={manualMealForm.amount} onChange={setMMF("amount")} /></div>
                <div><label className="lbl">Calories (auto)</label><input className="inp" value={manualMealCal ? manualMealCal + " kcal" : "—"} readOnly style={{ color: "var(--accent)", cursor: "default" }} /></div>
                <div><label className="lbl">Protein (g)</label><input className="inp" type="number" placeholder="0" value={manualMealForm.protein} onChange={setMMF("protein")} /></div>
                <div><label className="lbl">Carbs (g)</label><input className="inp" type="number" placeholder="0" value={manualMealForm.carbs} onChange={setMMF("carbs")} /></div>
                <div><label className="lbl">Fat (g)</label><input className="inp" type="number" placeholder="0" value={manualMealForm.fat} onChange={setMMF("fat")} /></div>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setShowManualMeal(false); setManualMealForm({ name: "", amount: "100", protein: "", carbs: "", fat: "" }); }}>Cancel</button>
                <button className="btn btn-primary btn-sm" disabled={!manualMealForm.name} onClick={confirmManualMeal}>Add</button>
              </div>
            </div>
          ) : (<>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input className="inp" style={{ margin: 0, flex: 1 }} placeholder="Search ingredients…" value={search} onFocus={() => setSearchOpen(true)} onChange={e => { setSearch(e.target.value); setSearchOpen(true); setScanStatus(null); }} autoComplete="off" />
              <button className="btn btn-ghost btn-sm" style={{ padding: "6px 10px" }} onClick={openCamera} title="Scan barcode"><CameraIcon /></button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setSearchOpen(false); setShowManualMeal(true); }}>Manual</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input className="inp" style={{ margin: 0, flex: 1 }} inputMode="numeric" placeholder="Enter barcode (8–14 digits)" value={barcode} onChange={e => { setBarcode(e.target.value); setScanStatus(null); }} onKeyDown={e => e.key === "Enter" && lookupMealBarcode(barcode)} />
              <button className="btn btn-primary btn-sm" onClick={() => lookupMealBarcode(barcode)} disabled={scanStatus === "loading"}>{scanStatus === "loading" ? "…" : "Lookup"}</button>
            </div>
            {scanStatus === "loading" && <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, textAlign: "center" }}>Looking up barcode…</div>}
            {scanStatus === "err" && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "var(--danger)" }}>Barcode not found — search manually.</div>}
            {scanStatus === "invalid" && <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "var(--danger)" }}>Enter the 8–14 digits printed below the barcode.</div>}
            {searchOpen && (<div className="ing-list" role="listbox" aria-label="Ingredient suggestions">
              {allIngredients.length === 0 && <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--muted)" }}>Your ingredient library is empty.</div>}
              {allIngredients.length > 0 && filtered.length === 0 && <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--muted)" }}>{searchTerms.length ? "No matches" : "All ingredients are already in this meal."}</div>}
              {filtered.map(i => <div key={i.id} className="ing-result" role="option" aria-selected="false" onClick={() => { setAddingIng(i); setAddAmt(String(i.servingSize || 100)); setSearch(""); setSearchOpen(false); setScanStatus(null); }}>{i.name} <span style={{ color: "var(--muted)", fontSize: 11 }}>— {i.p100.cal} kcal/100g</span></div>)}
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
        {saveError && <div role="alert" className="form-alert">{saveError}</div>}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={save}>Save Meal</button>
        </div>
      </div>
      {cameraOpen && <CameraOverlay videoRef={videoRef} error={cameraError} state={cameraState} capturedCode={capturedCode} onClose={closeCamera} />}
    </div>
  );
}
