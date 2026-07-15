import { fmtDate } from "../utils";
import MacroBar from "./MacroBar";
import HistoryChart from "./history/HistoryChart";

const TABS = ["today", "meals", "ingredients", "history"];

export default function DashboardHeader({ today, totals, targets, deficit, tab, historyDayData, onSelectHistoryDay, onTabChange, onOpenTargets, onSignOut }) {
  const caloriesOverTarget = totals.cal > targets.cal;
  const calorieScaleMaximum = Math.max(totals.cal, targets.cal, 1);
  const calorieFillPct = Math.min((totals.cal / calorieScaleMaximum) * 100, 100);
  const calorieTargetPct = Math.min((targets.cal / calorieScaleMaximum) * 100, 100);

  return (
    <div style={{ flexShrink: 0 }}>
      <div className="header">
        <div className="logo">MACRO<span>TRACK</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "Space Mono,monospace", fontSize: 11, color: "var(--muted)" }}>{fmtDate(today)}</span>
          <button className="icon-btn" onClick={onOpenTargets} aria-label="Daily targets">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <button className="icon-btn" style={{ fontSize: 14 }} onClick={onSignOut} title="Sign out">⏏</button>
        </div>
      </div>

      {tab === "history" ? (
        <div className="summary history-summary">
          <HistoryChart dayData={[...historyDayData].reverse()} targets={targets} today={today} onSelectDay={onSelectHistoryDay} />
        </div>
      ) : (
      <div className="summary">
        <div className="cal-row">
          <span className={`cal-num${caloriesOverTarget ? " over" : ""}`}>{Math.round(totals.cal)}</span>
          <span className="cal-sub">kcal</span>
          <span className="cal-target">/ {targets.cal}</span>
        </div>
        <div className="cal-progress-wrap">
          <div className="cal-progress" role="img" aria-label={`${Math.round(totals.cal)} of ${targets.cal} calories${caloriesOverTarget ? ", over target" : ""}`}>
            <div className={`cal-progress-fill${caloriesOverTarget ? " over" : ""}`} style={{ width: `${calorieFillPct}%` }} />
            {caloriesOverTarget && <span className="goal-marker calorie-goal-marker" style={{ left: `${calorieTargetPct}%` }} aria-hidden="true" />}
          </div>
          <div className="cal-progress-caption">
            <span>{Math.round((totals.cal / Math.max(targets.cal, 1)) * 100)}% of goal</span>
            <span>{Math.max(targets.cal - Math.round(totals.cal), 0)} remaining</span>
          </div>
        </div>
        <div className="macro-bars">
          <MacroBar label="Protein" val={totals.protein} target={targets.protein} color="var(--protein)" />
          <MacroBar label="Carbs" val={totals.carbs} target={targets.carbs} color="var(--carbs)" />
          <MacroBar label="Fat" val={totals.fat} target={targets.fat} color="var(--fat)" />
        </div>
        <div className="deficit">
          <span style={{ color: "var(--muted)" }}>Remaining</span>
          <span style={{ color: deficit >= 0 ? "var(--accent)" : "var(--danger)" }}>{deficit >= 0 ? deficit : `+${Math.abs(deficit)}`} kcal</span>
        </div>
      </div>
      )}

      <div className="tabs">
        {TABS.map(item => (
          <button key={item} className={`tab ${tab === item ? "active" : ""}`} onClick={() => onTabChange(item)}>
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
