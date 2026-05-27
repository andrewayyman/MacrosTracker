import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

function TrendChart({ days, metric, goal, label }) {
  const allEmpty = days.every(d => !d.hasData);

  return (
    <div className="trend-chart">
      <h3 className="trend-chart__title">{label}</h3>
      {allEmpty ? (
        <div className="trend-chart__empty">No data for this period</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={days} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} width={40} />
            <Tooltip
              formatter={(value) => [value, label]}
              labelFormatter={(v) => formatDate(v)}
            />
            <Bar dataKey={metric} fill="#4f86f7" radius={[3, 3, 0, 0]} />
            {goal != null && (
              <ReferenceLine y={goal} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Goal", position: "insideTopRight", fontSize: 11 }} />
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default TrendChart;
