import { useState } from "react";

export default function EditQuickEntryModal({ entry, onSave, onClose }) {
  const [form, setForm] = useState({
    name: entry.name || "",
    cal: String(entry.cal ?? entry.calories ?? ""),
    protein: String(entry.protein ?? ""),
    carbs: String(entry.carbs ?? ""),
    fat: String(entry.fat ?? ""),
  });
  const setField = field => event => setForm(previous => ({ ...previous, [field]: event.target.value }));
  const valid = form.name.trim() && Number.isFinite(Number(form.cal)) && Number(form.cal) >= 0;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-history-food-title" onClick={event => event.stopPropagation()}>
        <div className="modal-title" id="edit-history-food-title">
          Edit Food
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <label className="lbl" htmlFor="edit-food-name">Name</label>
        <input id="edit-food-name" className="inp" value={form.name} onChange={setField("name")} />
        <div className="grid2">
          <div><label className="lbl" htmlFor="edit-food-cal">Calories</label><input id="edit-food-cal" className="inp" type="number" min="0" value={form.cal} onChange={setField("cal")} /></div>
          <div><label className="lbl" htmlFor="edit-food-protein">Protein (g)</label><input id="edit-food-protein" className="inp" type="number" min="0" value={form.protein} onChange={setField("protein")} /></div>
          <div><label className="lbl" htmlFor="edit-food-carbs">Carbs (g)</label><input id="edit-food-carbs" className="inp" type="number" min="0" value={form.carbs} onChange={setField("carbs")} /></div>
          <div><label className="lbl" htmlFor="edit-food-fat">Fat (g)</label><input id="edit-food-fat" className="inp" type="number" min="0" value={form.fat} onChange={setField("fat")} /></div>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={!valid} onClick={() => onSave({ ...entry, name: form.name.trim(), cal: Number(form.cal), protein: Number(form.protein) || 0, carbs: Number(form.carbs) || 0, fat: Number(form.fat) || 0 })}>Save</button>
        </div>
      </div>
    </div>
  );
}
