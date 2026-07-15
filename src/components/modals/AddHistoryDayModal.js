import { useMemo, useState } from "react";
import { dateKey, validateNewHistoryDay } from "../../utils";

const previousDate = day => {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return dateKey(date);
};

const findFirstAvailableDay = (today, existingDays) => {
  const existing = new Set(existingDays);
  let candidate = previousDate(today);
  while (existing.has(candidate)) candidate = previousDate(candidate);
  return candidate;
};

export default function AddHistoryDayModal({ today, existingDays, onSave, onClose }) {
  const defaultDay = useMemo(() => findFirstAvailableDay(today, existingDays), [today, existingDays]);
  const [day, setDay] = useState(defaultDay);
  const [error, setError] = useState("");
  const latestAllowedDay = previousDate(today);

  const save = async () => {
    const validationError = validateNewHistoryDay(day, today, existingDays);
    if (validationError) return setError(validationError);
    const result = await onSave(day);
    if (!result?.ok) setError(result?.message || "Could not add this day.");
  };

  return (
    <div className="overlay confirm-overlay" onClick={onClose}>
      <div className="modal history-date-modal" role="dialog" aria-modal="true" aria-labelledby="add-history-day-title" onClick={event => event.stopPropagation()}>
        <div className="modal-title" id="add-history-day-title">
          Add History Day
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <label className="lbl" htmlFor="history-day-date">Date</label>
        <input id="history-day-date" className="inp" type="date" max={latestAllowedDay} value={day} onChange={event => { setDay(event.target.value); setError(""); }} />
        {error && <div className="field-error history-date-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={save}>Add Food</button>
        </div>
      </div>
    </div>
  );
}
