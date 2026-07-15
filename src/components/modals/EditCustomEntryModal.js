import { useState } from "react";
import { calcIngredientMacros, round1, sumMacros, uid } from "../../utils";
import lookupOFF, { barcodesMatch, normalizeBarcode } from "../../services/openFoodFacts";
import useCameraScanner from "../../hooks/useCameraScanner";
import CameraIcon from "../camera/CameraIcon";
import CameraOverlay from "../camera/CameraOverlay";
import BarcodeStatus from "../barcode/BarcodeStatus";

export default function EditCustomEntryModal({ entry, ingredients, onSave, onClose, confirmDelete }) {
  const [editItems, setEditItems] = useState(entry.ingredients || []);
  const [ingSearch, setIngSearch] = useState("");
  const [addingItem, setAddingItem] = useState(null);
  const [addAmt, setAddAmt] = useState("100");
  const [scanStatus, setScanStatus] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({ name: "", amount: "100", protein: "", carbs: "", fat: "" });
  const setMF = k => e => setManualForm(f => ({ ...f, [k]: e.target.value }));
  const manualCal = Math.round((+manualForm.protein || 0) * 4 + (+manualForm.carbs || 0) * 4 + (+manualForm.fat || 0) * 9);
  const libFiltered = ingredients.filter(i => i.name.toLowerCase().includes(ingSearch.toLowerCase()));
  const total = sumMacros(editItems, calcIngredientMacros);
  const updateAmt = (id, val) => setEditItems(p => p.map(x => x.id === id ? { ...x, amount: +val || 0 } : x));
  const confirmAdd = () => {
    if (!addingItem || !addAmt) return;
    setEditItems(p => [...p, { id: uid(), name: addingItem.name, p100: addingItem.p100, amount: +addAmt }]);
    setAddingItem(null); setAddAmt("100"); setIngSearch("");
  };
  const confirmManual = () => {
    if (!manualForm.name) return;
    const amt = +manualForm.amount || 100;
    const pro = +manualForm.protein || 0, carb = +manualForm.carbs || 0, fat = +manualForm.fat || 0;
    const cal = Math.round(pro * 4 + carb * 4 + fat * 9);
    const p100 = { cal: Math.round(cal * 100 / amt), protein: round1(pro * 100 / amt), carbs: round1(carb * 100 / amt), fat: round1(fat * 100 / amt) };
    setEditItems(prev => [...prev, { id: uid(), name: manualForm.name, amount: amt, p100 }]);
    setManualForm({ name: "", amount: "100", protein: "", carbs: "", fat: "" });
    setShowManual(false);
  };
  const { cameraOpen, cameraError, cameraState, capturedCode, openCamera, closeCamera, retryCode, scanAgain, videoRef } = useCameraScanner(async (val) => {
    setScanStatus("loading");
    const normalized = normalizeBarcode(val);
    const savedIngredient = ingredients.find(ingredient => barcodesMatch(ingredient.barcode, normalized));
    if (savedIngredient) {
      setScanStatus("ok");
      setAddAmt(String(savedIngredient.servingSize || 100));
      setAddingItem(savedIngredient);
      return { ok: true, reason: "ok" };
    }
    const result = await lookupOFF(normalized);
    setScanStatus(result.reason);
    if (result.ok) {
      setAddAmt(String(result.servingSize || 100));
      setAddingItem({ name: result.name, p100: result.p100, barcode: result.code });
    }
    return result;
  });

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Edit Entry <button className="icon-btn" onClick={onClose}>✕</button></div>
        {editItems.map(item => {
          const cal = Math.round(item.p100.cal * item.amount / 100);
          return (
            <div key={item.id} className="ing-chip">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "Space Mono,monospace", marginTop: 2 }}>{cal} kcal</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="number" value={item.amount} onChange={e => updateAmt(item.id, e.target.value)} style={{ width: 56, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 6px", color: "var(--text)", fontFamily: "Space Mono,monospace", fontSize: 13, textAlign: "right", outline: "none" }} />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>g</span>
                <button className="del-btn" onClick={async () => { if (await confirmDelete(item.name)) setEditItems(p => p.filter(x => x.id !== item.id)); }}>✕</button>
              </div>
            </div>
          );
        })}
        {editItems.length > 0 && (
          <div className="preview">
            <span style={{ color: "var(--muted)" }}>CAL <span style={{ color: "var(--text)" }}>{total.cal}</span></span>
            <span style={{ color: "var(--muted)" }}>PRO <span style={{ color: "var(--text)" }}>{round1(total.protein)}g</span></span>
            <span style={{ color: "var(--muted)" }}>CARB <span style={{ color: "var(--text)" }}>{round1(total.carbs)}g</span></span>
            <span style={{ color: "var(--muted)" }}>FAT <span style={{ color: "var(--text)" }}>{round1(total.fat)}g</span></span>
          </div>
        )}
        <div style={{ height: 1, background: "var(--border)", margin: "8px 0 12px" }} />
        {addingItem ? (
          <div style={{ background: "var(--card)", borderRadius: 10, padding: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{addingItem.name}</div>
            <label className="lbl">Amount (grams)</label>
            <input className="inp" type="number" placeholder="100" value={addAmt} onChange={e => setAddAmt(e.target.value)} autoFocus />
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setAddingItem(null); setAddAmt("100"); }}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={confirmAdd}>Add</button>
            </div>
          </div>
        ) : showManual ? (
          <div style={{ background: "var(--card)", borderRadius: 10, padding: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Manual Entry</div>
            <label className="lbl">Name</label>
            <input className="inp" placeholder="Ingredient name" value={manualForm.name} onChange={setMF("name")} autoFocus />
            <div className="grid2">
              <div><label className="lbl">Amount (g)</label><input className="inp" type="number" placeholder="100" value={manualForm.amount} onChange={setMF("amount")} /></div>
              <div><label className="lbl">Calories (auto)</label><input className="inp" value={manualCal ? manualCal + " kcal" : "—"} readOnly style={{ color: "var(--accent)", cursor: "default" }} /></div>
              <div><label className="lbl">Protein (g)</label><input className="inp" type="number" placeholder="0" value={manualForm.protein} onChange={setMF("protein")} /></div>
              <div><label className="lbl">Carbs (g)</label><input className="inp" type="number" placeholder="0" value={manualForm.carbs} onChange={setMF("carbs")} /></div>
              <div><label className="lbl">Fat (g)</label><input className="inp" type="number" placeholder="0" value={manualForm.fat} onChange={setMF("fat")} /></div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowManual(false); setManualForm({ name: "", amount: "100", protein: "", carbs: "", fat: "" }); }}>Cancel</button>
              <button className="btn btn-primary btn-sm" disabled={!manualForm.name} onClick={confirmManual}>Add</button>
            </div>
          </div>
        ) : (<>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input className="inp" style={{ margin: 0, flex: 1 }} placeholder="Add ingredient…" value={ingSearch} onChange={e => { setIngSearch(e.target.value); setScanStatus(null); }} />
            <button className="btn btn-ghost btn-sm" style={{ padding: "6px 10px" }} onClick={openCamera} title="Scan barcode"><CameraIcon /></button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowManual(true)}>Manual</button>
          </div>
          <BarcodeStatus status={scanStatus} />
          {ingSearch && (<div className="ing-list">
            {libFiltered.length === 0 && <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--muted)" }}>No matches</div>}
            {libFiltered.map(i => <div key={i.id} className="ing-result" onClick={() => { setAddingItem(i); setAddAmt(String(i.servingSize || 100)); setIngSearch(""); setScanStatus(null); }}>{i.name} <span style={{ color: "var(--muted)", fontSize: 11 }}>— {i.p100.cal} kcal/100g</span></div>)}
          </div>)}
        </>)}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={editItems.length === 0} onClick={() => onSave({ ...entry, name: `Custom · ${editItems.length} ingredient${editItems.length !== 1 ? "s" : ""}`, ...total, ingredients: editItems })}>Save</button>
        </div>
      </div>
      {cameraOpen && <CameraOverlay videoRef={videoRef} error={cameraError} state={cameraState} capturedCode={capturedCode} onClose={closeCamera} onRetry={retryCode} onScanAgain={scanAgain} />}
    </div>
  );
}
