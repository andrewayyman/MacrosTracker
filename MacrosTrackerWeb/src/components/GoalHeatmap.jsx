const STATUS_COLORS = {
  OnGoal: "#4caf50",
  OverGoal: "#f44336",
  UnderGoal: "#ff9800",
  NoData: "#e0e0e0",
};

const STATUS_LABELS = [
  { status: "OnGoal", label: "On goal" },
  { status: "OverGoal", label: "Over goal" },
  { status: "UnderGoal", label: "Under goal" },
  { status: "NoData", label: "No data" },
];

function GoalHeatmap({ days }) {
  return (
    <div className="goal-heatmap">
      <div className="goal-heatmap__grid">
        {days.map((entry) => {
          const dayNum = new Date(entry.date + "T00:00:00").getDate();
          return (
            <div
              key={entry.date}
              className="goal-heatmap__cell"
              style={{ backgroundColor: STATUS_COLORS[entry.status] ?? STATUS_COLORS.NoData }}
              title={`${entry.date}: ${entry.status} (${entry.totalCalories} kcal)`}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
      <div className="goal-heatmap__legend">
        {STATUS_LABELS.map(({ status, label }) => (
          <span key={status} className="goal-heatmap__legend-item">
            <span
              className="goal-heatmap__legend-swatch"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default GoalHeatmap;
