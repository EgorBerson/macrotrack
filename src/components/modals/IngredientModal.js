import { useState } from "react";
import { round1, uid } from "../../utils";
import lookupOFF, { normalizeBarcode, productToEditableForm, validateBarcode } from "../../services/openFoodFacts";
import useCameraScanner from "../../hooks/useCameraScanner";
import CameraIcon from "../camera/CameraIcon";
import CameraOverlay from "../camera/CameraOverlay";
import BarcodeStatus from "../barcode/BarcodeStatus";

export default function IngredientModal({ onSave, onClose, existing }) {
  const [form, setForm] = useState(existing
    ? { name: existing.name, amount: "100", protein: existing.p100.protein, carbs: existing.p100.carbs, fat: existing.p100.fat }
    : { name: "", amount: "100", protein: "", carbs: "", fat: "" });
  const [barcode, setBarcode] = useState(existing?.barcode || "");
  const [barcodeStatus, setBarcodeStatus] = useState(null);
  const [barcodeMissingFields, setBarcodeMissingFields] = useState([]);
  const [reportedCalories, setReportedCalories] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const pro = +form.protein || 0, carb = +form.carbs || 0, fat = +form.fat || 0, amt = +form.amount || 100;
  const calcCal = Math.round(pro * 4 + carb * 4 + fat * 9);
  const factor = 100 / amt;
  const completeNumber = value => value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;
  const macrosComplete = [form.protein, form.carbs, form.fat].every(completeNumber);
  const valid = Boolean(form.name.trim()) && Number(form.amount) > 0 && macrosComplete;
  const remainingMissingFields = barcodeMissingFields.filter(field => field === "name" ? !form.name.trim() : !completeNumber(form[field]));
  const displayedBarcodeStatus = barcodeStatus === "incomplete_data" && remainingMissingFields.length === 0 ? "ok" : barcodeStatus;

  const save = async () => {
    if (!valid) return;
    setSaveError(null);
    const normalizedBarcode = normalizeBarcode(barcode);
    const barcodeValidation = normalizedBarcode ? validateBarcode(normalizedBarcode) : { ok: true };
    if (!barcodeValidation.ok) {
      setBarcodeStatus(barcodeValidation.reason);
      return;
    }
    const result = await onSave({
      id: existing?.id || uid(),
      name: form.name.trim(),
      barcode: normalizedBarcode || null,
      servingSize: amt,
      p100: { cal: Math.round(calcCal * factor), protein: round1(pro * factor), carbs: round1(carb * factor), fat: round1(fat * factor) },
    });
    if (result?.ok === false) setSaveError(result.message || "This ingredient already exists.");
  };

  const lookupBarcode = async (code) => {
    const validation = validateBarcode(code);
    const normalizedCode = normalizeBarcode(code);
    setBarcode(normalizedCode);
    if (!validation.ok) {
      setBarcodeStatus(validation.reason);
      return validation;
    }
    setBarcodeStatus("loading");
    const result = await lookupOFF(normalizedCode);
    setBarcodeStatus(result.reason);
    setBarcodeMissingFields(result.missingFields || []);
    setReportedCalories(result.partial ? result.p100?.cal ?? null : null);
    if (result.ok || result.partial) {
      setForm(productToEditableForm(result));
    }
    return result;
  };

  const { cameraOpen, cameraError, cameraState, capturedCode, openCamera, closeCamera, retryCode, scanAgain, videoRef } = useCameraScanner(val => {
    setBarcode(val);
    return lookupBarcode(val);
  });

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{existing ? "Edit" : "New"} Ingredient <button className="icon-btn" onClick={onClose}>✕</button></div>
        <label className="lbl">Barcode lookup (optional)</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input className="inp" style={{ margin: 0, flex: 1 }} type="text" inputMode="numeric" placeholder="e.g. 049000042566" value={barcode} onChange={e => { setBarcode(e.target.value.replace(/\D/g, "")); setBarcodeStatus(null); setBarcodeMissingFields([]); setReportedCalories(null); }} onKeyDown={e => e.key === "Enter" && lookupBarcode(barcode)} />
          <button className="btn btn-ghost btn-sm" style={{ whiteSpace: "nowrap", padding: "6px 10px" }} onClick={openCamera} title="Scan barcode with camera"><CameraIcon /></button>
          <button className="btn btn-primary btn-sm" style={{ whiteSpace: "nowrap" }} onClick={() => lookupBarcode(barcode)} disabled={barcodeStatus === "loading"}>{barcodeStatus === "loading" ? "…" : "Lookup"}</button>
        </div>
        <BarcodeStatus status={displayedBarcodeStatus} missingFields={remainingMissingFields} reportedCalories={reportedCalories} barcode={barcode} />
        <div style={{ height: 1, background: "var(--border)", margin: "4px 0 14px" }} />
        <label className="lbl">Name</label>
        <input className={`inp ${remainingMissingFields.includes("name") ? "incomplete-field" : ""}`} placeholder="e.g. Chicken Breast" value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setSaveError(null); }} />
        {saveError && <div role="alert" style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "var(--danger)", lineHeight: 1.4 }}>{saveError}</div>}
        <label className="lbl">Amount (g)</label>
        <input className="inp" type="number" placeholder="100" value={form.amount} onChange={set("amount")} />
        <label className="lbl">Macros for {amt}g</label>
        <div className="grid2">
          <div><label className="lbl">Protein (g)</label><input className={`inp ${remainingMissingFields.includes("protein") ? "incomplete-field" : ""}`} type="number" min="0" placeholder="31" value={form.protein} onChange={set("protein")} /></div>
          <div><label className="lbl">Carbs (g)</label><input className={`inp ${remainingMissingFields.includes("carbs") ? "incomplete-field" : ""}`} type="number" min="0" placeholder="0" value={form.carbs} onChange={set("carbs")} /></div>
          <div><label className="lbl">Fat (g)</label><input className={`inp ${remainingMissingFields.includes("fat") ? "incomplete-field" : ""}`} type="number" min="0" placeholder="3.6" value={form.fat} onChange={set("fat")} /></div>
          <div><label className="lbl">Calories (auto)</label><input className="inp" value={macrosComplete ? calcCal + " kcal" : "—"} readOnly style={{ color: "var(--accent)", cursor: "default" }} /></div>
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
          <button className="btn btn-primary" disabled={!valid} onClick={save}>Save</button>
        </div>
      </div>
      {cameraOpen && <CameraOverlay videoRef={videoRef} error={cameraError} state={cameraState} capturedCode={capturedCode} onClose={closeCamera} onRetry={retryCode} onScanAgain={scanAgain} />}
    </div>
  );
}
