import { useEffect, useRef } from "react";
import { fmtDate } from "../../utils";

const WIDTH = 720;
const HEIGHT = 180;
const PLOT = { left: 58, right: 58, top: 18, bottom: 32 };
const COLORS = {
  protein: "var(--protein)",
  carbs: "var(--carbs)",
  fat: "var(--fat)",
};

const niceMaximum = (value, step) => Math.max(step, Math.ceil(value / step) * step);
const linePath = (data, xFor, yFor, key) => data
  .map((item, index) => `${index ? "L" : "M"}${xFor(index).toFixed(1)},${yFor(item.totals[key]).toFixed(1)}`)
  .join(" ");

export default function HistoryChart({ dayData, targets, today, onSelectDay }) {
  const scrollRef = useRef(null);
  const chartWidth = WIDTH - PLOT.left - PLOT.right;
  const chartHeight = HEIGHT - PLOT.top - PLOT.bottom;
  const bandWidth = chartWidth / Math.max(dayData.length, 1);
  const barWidth = Math.min(46, bandWidth * 0.52);
  const calorieMax = niceMaximum(Math.max(targets.cal || 0, ...dayData.map(item => item.totals.cal)), 500);
  const macroMax = niceMaximum(Math.max(
    targets.protein || 0,
    targets.carbs || 0,
    targets.fat || 0,
    ...dayData.flatMap(item => [item.totals.protein, item.totals.carbs, item.totals.fat]),
  ), 50);
  const xFor = index => PLOT.left + bandWidth * index + bandWidth / 2;
  const calorieY = value => PLOT.top + chartHeight - (value / calorieMax) * chartHeight;
  const macroY = value => PLOT.top + chartHeight - (value / macroMax) * chartHeight;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollLeft = container.scrollWidth - container.clientWidth;
  }, [dayData.length]);

  return (
    <div className="history-chart-card">
      <div className="history-legend" aria-label="Chart legend">
        <span><i className="legend-bar" />Calories</span>
        <span><i className="legend-bar legend-over" />Excess</span>
        <span><i style={{ background: COLORS.protein }} />Protein</span>
        <span><i style={{ background: COLORS.carbs }} />Carbs</span>
        <span><i style={{ background: COLORS.fat }} />Fat</span>
      </div>
      <p className="history-chart-hint">Tap a day on the chart to open its details.</p>
      <div className="history-chart-scroll" ref={scrollRef}>
        <svg className="history-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby="history-chart-title history-chart-description">
          <title id="history-chart-title">Calories and macros by day</title>
          <desc id="history-chart-description">Calories are shown as bars. Protein, carbohydrates and fat are shown as lines.</desc>

          {ticks.map(tick => {
            const y = PLOT.top + chartHeight * (1 - tick);
            return (
              <g key={tick}>
                <line className="history-grid-line" x1={PLOT.left} x2={WIDTH - PLOT.right} y1={y} y2={y} />
                <text className="history-axis-label" x={PLOT.left - 9} y={y + 4} textAnchor="end">{Math.round(calorieMax * tick)}</text>
                <text className="history-axis-label" x={WIDTH - PLOT.right + 9} y={y + 4}>{Math.round(macroMax * tick)}g</text>
              </g>
            );
          })}

          <text className="history-axis-title" x={PLOT.left} y={14}>kcal</text>
          <text className="history-axis-title" x={WIDTH - PLOT.right} y={14} textAnchor="end">macros</text>

          <g className="history-goals" aria-label="Daily targets">
            <line className="history-goal-line" x1={PLOT.left} x2={WIDTH - PLOT.right} y1={calorieY(targets.cal)} y2={calorieY(targets.cal)} stroke="var(--accent)" />
            <text className="history-goal-label" x={PLOT.left + 7} y={calorieY(targets.cal) - 6}>Cal goal {targets.cal}</text>
            <line className="history-goal-line" x1={PLOT.left} x2={WIDTH - PLOT.right} y1={macroY(targets.protein)} y2={macroY(targets.protein)} stroke={COLORS.protein} />
            <text className="history-goal-label" x={WIDTH - PLOT.right - 7} y={macroY(targets.protein) - 7} textAnchor="end">P {targets.protein}g</text>
            <line className="history-goal-line" x1={PLOT.left} x2={WIDTH - PLOT.right} y1={macroY(targets.carbs)} y2={macroY(targets.carbs)} stroke={COLORS.carbs} />
            <text className="history-goal-label" x={WIDTH - PLOT.right - 7} y={macroY(targets.carbs) + 14} textAnchor="end">C {targets.carbs}g</text>
            <line className="history-goal-line" x1={PLOT.left} x2={WIDTH - PLOT.right} y1={macroY(targets.fat)} y2={macroY(targets.fat)} stroke={COLORS.fat} />
            <text className="history-goal-label" x={WIDTH - PLOT.right - 7} y={macroY(targets.fat) - 7} textAnchor="end">F {targets.fat}g</text>
          </g>

          {dayData.map((item, index) => {
            const normalCalories = Math.min(item.totals.cal, targets.cal);
            const normalY = calorieY(normalCalories);
            const totalY = calorieY(item.totals.cal);
            const normalHeight = chartHeight - (normalY - PLOT.top);
            const excessHeight = Math.max(normalY - totalY, 0);
            return (
              <g key={item.day} className={item.day === today ? "today" : ""}>
                <rect
                  className="history-calorie-bar history-calorie-normal"
                  x={xFor(index) - barWidth / 2}
                  y={normalY}
                  width={barWidth}
                  height={Math.max(normalHeight, 1)}
                />
                {excessHeight > 0 && (
                  <rect
                    className="history-calorie-bar history-calorie-excess"
                    x={xFor(index) - barWidth / 2}
                    y={totalY}
                    width={barWidth}
                    height={excessHeight}
                  />
                )}
              </g>
            );
          })}

          {Object.keys(COLORS).map(key => (
            <g key={key}>
              <path className="history-macro-line" d={linePath(dayData, xFor, macroY, key)} stroke={COLORS[key]} />
              {dayData.map((item, index) => (
                <circle key={item.day} className="history-macro-point" cx={xFor(index)} cy={macroY(item.totals[key])} r="4" fill={COLORS[key]} />
              ))}
            </g>
          ))}

          {dayData.map((item, index) => {
            const label = item.day === today ? "Today" : fmtDate(item.day);
            const description = `${label}: ${Math.round(item.totals.cal)} calories, ${Math.round(item.totals.protein)} grams protein, ${Math.round(item.totals.carbs)} grams carbs, ${Math.round(item.totals.fat)} grams fat`;
            return (
              <g
                key={item.day}
                className="history-chart-day"
                role="button"
                tabIndex="0"
                aria-label={`${description}. Open day details.`}
                onClick={() => onSelectDay(item.day)}
                onKeyDown={event => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectDay(item.day);
                  }
                }}
              >
                <title>{description}</title>
                <rect x={PLOT.left + bandWidth * index} y={PLOT.top} width={bandWidth} height={chartHeight + 38} fill="transparent" />
                <text className={`history-date-label${item.day === today ? " today" : ""}`} x={xFor(index)} y={HEIGHT - 24} textAnchor="middle">{label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
