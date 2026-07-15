import { fmtDate } from "../../utils";

export default function HistoryDayList({ dayData, today, targets, getMacros, editingDay, onEditingDayChange, confirmDelete, saveLogDay, onAddFood, onEditEntry }) {
  return dayData.map(({ day, entries, totals }) => {
    const percentage = Math.min((totals.cal / Math.max(targets.cal, 1)) * 100, 100);
    const overTarget = totals.cal > targets.cal;
    const isEditing = editingDay === day;

    return (
      <article
        key={day}
        id={`history-day-${day}`}
        className={`history-day-card${isEditing ? " editing" : ""}`}
        onClick={event => {
          event.stopPropagation();
          if (!isEditing) onEditingDayChange(day);
        }}
      >
        <div className="history-day-heading">
          <span className="history-day-date">{day === today ? `Today · ${fmtDate(day)}` : fmtDate(day)}</span>
          <div className="history-day-calories">
            <span className={overTarget ? "over" : ""}>
              {Math.round(totals.cal)} <small>/ {targets.cal} kcal</small>
            </span>
            {isEditing && <button type="button" className="icon-btn history-day-close" aria-label="Close day details" onClick={event => { event.stopPropagation(); onEditingDayChange(null); }}>✕</button>}
          </div>
        </div>
        <div className="history-progress" aria-label={`${Math.round(percentage)} percent of calorie target`}>
          <div className={overTarget ? "over" : ""} style={{ width: `${percentage}%` }} />
        </div>
        <div className="history-day-macros">
          <span>P <b className="protein">{Math.round(totals.protein)}g</b></span>
          <span>C <b className="carbs">{Math.round(totals.carbs)}g</b></span>
          <span>F <b className="fat">{Math.round(totals.fat)}g</b></span>
          <span className={overTarget ? "over" : "balance"}>{overTarget ? `+${Math.round(totals.cal - targets.cal)}` : `-${Math.round(targets.cal - totals.cal)}`} kcal</span>
        </div>

        {!entries.length && <div className="history-no-entries">No food logged</div>}
        {entries.map(entry => (
          <div key={entry.id} className="history-food-row editable-history-entry" onClick={event => { event.stopPropagation(); onEditEntry(day, entry); }}>
            <span>{entry.name}</span>
            <div>
              <b>{getMacros(entry).cal}</b>
              {isEditing && <button type="button" className="del-btn" aria-label={`Delete ${entry.name}`} onClick={async event => {
                event.stopPropagation();
                if (await confirmDelete(entry.name || "this food entry")) saveLogDay(day, entries.filter(item => item.id !== entry.id));
              }}>✕</button>}
            </div>
          </div>
        ))}
        {isEditing && (
          <button type="button" className="btn btn-primary btn-sm history-add-food" onClick={event => { event.stopPropagation(); onAddFood(day); }}>
            + Add Food
          </button>
        )}
      </article>
    );
  });
}
