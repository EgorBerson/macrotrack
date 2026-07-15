export default function TodayScreen({ entries, getMacros, onAdd, onEdit, onDelete }) {
  return (
    <>
      <div className="sec-hdr"><span className="sec-title">Today's Log</span></div>
      {entries.length === 0 && (
        <div className="empty">
          <button type="button" className="empty-icon empty-action" aria-label="Add food" onClick={onAdd}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="12" y1="9" x2="12" y2="15"/></svg>
          </button>
          <div className="empty-text">Nothing logged yet.<br />Tap + to add food.</div>
        </div>
      )}
      {entries.map(entry => {
        const macros = getMacros(entry);
        const canEdit = Boolean(entry.mealId || entry.ingredients);
        return (
          <div
            key={entry.id}
            className={`log-entry${canEdit ? " editable-entry" : ""}`}
            onClick={canEdit ? () => onEdit(entry) : undefined}
          >
            <div>
              <div className="entry-name">{entry.name}</div>
              <div className="entry-macros">P {macros.protein}g · C {macros.carbs}g · F {macros.fat}g</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="entry-cal">{macros.cal}</span>
              <button className="del-btn" aria-label={`Delete ${entry.name}`} onClick={event => { event.stopPropagation(); onDelete(entry.id); }}>✕</button>
            </div>
          </div>
        );
      })}
    </>
  );
}
