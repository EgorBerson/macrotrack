import { useState } from "react";

export default function TargetsModal({ targets, onSave, onClose }) {
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
