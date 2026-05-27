const STATUS_ICONS = {
  OnGoal: "✅",
  OverGoal: "🔴",
  UnderGoal: "🟡",
  NoData: "⬜",
};

function formatDateShort(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

function WeeklySummaryTable({ summary, onPrev, onNext, isCurrentWeek }) {
  const { weekStart, weekEnd, days, weeklyTotal, weeklyGoal, hasGoal } = summary;

  return (
    <div className="weekly-summary">
      <div className="weekly-summary__nav">
        <button type="button" className="button-secondary btn--sm" onClick={onPrev}>
          ← Prev
        </button>
        <span className="weekly-summary__range">
          {formatDateShort(weekStart)} – {formatDateShort(weekEnd)}
        </span>
        <button type="button" className="button-secondary btn--sm" onClick={onNext} disabled={isCurrentWeek}>
          Next →
        </button>
      </div>

      <table className="weekly-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Logged (kcal)</th>
            {hasGoal && <th>Goal (kcal)</th>}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <td>{day.dayName}</td>
              <td>{day.hasData ? Math.round(day.totalCalories) : "—"}</td>
              {hasGoal && <td>{day.caloriesTarget > 0 ? day.caloriesTarget : "—"}</td>}
              <td>{STATUS_ICONS[day.status] ?? "⬜"}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td><strong>Week Total</strong></td>
            <td><strong>{Math.round(weeklyTotal)} kcal</strong></td>
            {hasGoal && <td><strong>{Math.round(weeklyGoal)} kcal</strong></td>}
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default WeeklySummaryTable;
