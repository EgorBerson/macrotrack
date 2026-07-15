import { useState } from "react";
import { calcMealMacros, round1, scaleMacros } from "../../utils";

const getInitialServings = entry => {
  const stored = Number(entry?.servings);
  if (Number.isFinite(stored) && stored > 0) return stored;

  const nameMatch = String(entry?.name || "").match(/ x(\d+(?:\.\d+)?)$/);
  const fromName = Number(nameMatch?.[1]);
  return Number.isFinite(fromName) && fromName > 0 ? fromName : 1;
};

export default function EditServingModal({ entry, meal, ingredients, onSave, onClose }) {
  const initialServings = getInitialServings(entry);
  const [servings, setServings] = useState(String(initialServings));
  const amount = Number(servings);
  const valid = Number.isFinite(amount) && amount > 0;
  const baseMacros = meal
    ? calcMealMacros(meal, ingredients)
    : scaleMacros(entry, 1 / initialServings);
  const scaled = scaleMacros(baseMacros, valid ? amount : 0);
  const baseName = meal?.name || String(entry.name || "Meal").replace(/ x\d+(?:\.\d+)?$/, "");

  const save = () => {
    if (!valid) return;
    onSave({
      ...entry,
      name: `${baseName}${amount === 1 ? "" : ` x${amount}`}`,
      servings: amount,
      ...scaled,
    });
  };

  return (
    <div className="overlay confirm-overlay" onClick={onClose}>
      <div className="modal serving-modal" role="dialog" aria-modal="true" aria-labelledby="edit-serving-title" onClick={event => event.stopPropagation()}>
        <div className="modal-title" id="edit-serving-title">
          Edit Portion
          <button className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div className="serving-meal-name">{baseName}</div>
        <div className="serving-row">
          <label htmlFor="today-serving-size">Portion size</label>
          <div className="serving-field">
            <input
              id="today-serving-size"
              className="serving-inp"
              type="number"
              min="0.1"
              step="0.25"
              inputMode="decimal"
              value={servings}
              onChange={event => setServings(event.target.value)}
              autoFocus
            />
            <span>×</span>
          </div>
        </div>
        {!valid && <div className="field-error">Enter a portion size greater than zero.</div>}
        <div className="preview">
          <span style={{ color: "var(--muted)" }}>CAL <span style={{ color: "var(--text)" }}>{round1(scaled.cal)}</span></span>
          <span style={{ color: "var(--muted)" }}>PRO <span style={{ color: "var(--text)" }}>{round1(scaled.protein)}g</span></span>
          <span style={{ color: "var(--muted)" }}>CARB <span style={{ color: "var(--text)" }}>{round1(scaled.carbs)}g</span></span>
          <span style={{ color: "var(--muted)" }}>FAT <span style={{ color: "var(--text)" }}>{round1(scaled.fat)}g</span></span>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}
