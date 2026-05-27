import { Link } from "react-router-dom";

function MacroCell({ label, consumed, target }) {
  const hasGoal = target != null;
  const remaining = hasGoal ? target - consumed : null;
  const exceeded = remaining != null && remaining < 0;

  return (
    <div className="macro-cell">
      <div className="macro-cell__value">{Math.round(consumed)}g</div>
      <div className="macro-cell__label">{label}</div>
      {hasGoal && (
        <div className={`macro-cell__sub ${exceeded ? "macro-cell__sub--over" : "macro-cell__sub--ok"}`}>
          {exceeded
            ? `+${Math.abs(Math.round(remaining))}g over`
            : `${Math.round(remaining)}g left`}
        </div>
      )}
    </div>
  );
}

function DailySummary({ summary, goals }) {
  return (
    <div className="summary-card">
      <div className="summary-card__cal-label">Calories</div>
      <div className="summary-card__cal-value">{Math.round(summary.totalCalories)}</div>
      <div className="summary-card__cal-sub">
        {goals
          ? `of ${Math.round(goals.caloriesTarget)} kcal target`
          : "kcal today"}
      </div>

      <div className="macro-grid">
        <MacroCell label="Protein" consumed={summary.totalProtein} target={goals?.proteinTarget} />
        <MacroCell label="Carbs"   consumed={summary.totalCarbs}   target={goals?.carbsTarget} />
        <MacroCell label="Fat"     consumed={summary.totalFat}     target={goals?.fatTarget} />
      </div>

      {!goals && (
        <p className="summary-card__goal-link">
          <Link to="/goal-setup">Set your daily goals</Link> to track progress.
        </p>
      )}
    </div>
  );
}

export default DailySummary;
