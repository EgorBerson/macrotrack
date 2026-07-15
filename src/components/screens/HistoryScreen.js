import { useEffect } from "react";
import HistoryDayList from "../history/HistoryDayList";

export default function HistoryScreen({ dayData, today, targets, getMacros, editingDay, onEditingDayChange, confirmDelete, saveLogDay, onAddFood, onEditEntry }) {
  useEffect(() => {
    if (!editingDay) return;
    document.getElementById(`history-day-${editingDay}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [editingDay]);

  return (
    <section className="history-screen" onClick={event => event.stopPropagation()}>
      <div className="sec-hdr history-list-heading">
        <span className="sec-title">Daily details</span>
      </div>
      <HistoryDayList
        dayData={dayData}
        today={today}
        targets={targets}
        getMacros={getMacros}
        editingDay={editingDay}
        onEditingDayChange={onEditingDayChange}
        confirmDelete={confirmDelete}
        saveLogDay={saveLogDay}
        onAddFood={onAddFood}
        onEditEntry={onEditEntry}
      />
    </section>
  );
}
