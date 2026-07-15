export default function MacroBar({ label, val, target, color }) {
  const scaleMaximum = Math.max(val, target, 1);
  const pct = Math.min((val / scaleMaximum) * 100, 100);
  const targetPct = Math.min((target / scaleMaximum) * 100, 100);
  const overTarget = val > target;

  return (
    <div className="mbar-row">
      <span className="mbar-label">{label}</span>
      <div className="mbar-bg" role="img" aria-label={`${Math.round(val)} of ${target} grams${overTarget ? ", over target" : ""}`}>
        <div className="mbar-fill" style={{ width: `${pct}%`, background: color }} />
        {overTarget && <span className="goal-marker" style={{ left: `${targetPct}%` }} aria-hidden="true" />}
      </div>
      <span className="mbar-val">{Math.round(val)}/{target}g</span>
    </div>
  );
}
