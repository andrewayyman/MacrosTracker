import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageShell from "../components/PageShell";
import MacroProgressBar from "../components/MacroProgressBar";
import TrendChart from "../components/TrendChart";
import GoalHeatmap from "../components/GoalHeatmap";
import WeeklySummaryTable from "../components/WeeklySummaryTable";
import { getDiary } from "../api/diaryClient";
import { getProgressTrends, getProgressStreaks, getWeeklySummary } from "../api/progressClient";

function getMonday(offsetWeeks) {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offsetWeeks * 7);
  return d.toISOString().slice(0, 10);
}

function ProgressPage() {
  const [activeTab, setActiveTab] = useState("today");
  const [selectedRange, setSelectedRange] = useState(7);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = getMonday(weekOffset);

  const todayQuery = useQuery({
    queryKey: ["diary-today"],
    queryFn: () => getDiary().then(r => r.data.data),
    enabled: activeTab === "today",
  });

  const trendsQuery = useQuery({
    queryKey: ["progress-trends", selectedRange],
    queryFn: () => getProgressTrends(selectedRange),
    enabled: activeTab === "trends",
  });

  const streaksQuery = useQuery({
    queryKey: ["progress-streaks"],
    queryFn: getProgressStreaks,
    enabled: activeTab === "streaks",
  });

  const weeklyQuery = useQuery({
    queryKey: ["progress-weekly", weekStart],
    queryFn: () => getWeeklySummary(weekStart),
    enabled: activeTab === "weekly",
  });

  const tabs = [
    { id: "today", label: "Today" },
    { id: "trends", label: "Trends" },
    { id: "streaks", label: "Streaks" },
    { id: "weekly", label: "Weekly" },
  ];

  return (
    <PageShell eyebrow="Analytics" title="Progress" description="Track your nutrition goals over time.">
      <div className="tab-bar">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            className={`tab-bar__btn${activeTab === t.id ? " tab-bar__btn--active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "today" && (
        <div className="tab-panel">
          {todayQuery.isLoading && <div className="spinner spinner--lg" />}
          {todayQuery.isError && <div className="alert alert--error">Failed to load today&apos;s data. Please try again.</div>}
          {todayQuery.data && (() => {
            const { dailySummary, goals } = todayQuery.data;
            if (!goals) {
              return (
                <div className="empty-state">
                  <p>Set your nutrition goals to see your progress.</p>
                  <Link to="/goal-setup" className="button-secondary">Set goals</Link>
                </div>
              );
            }
            return (
              <div className="progress-bars">
                {dailySummary.totalCalories === 0 && (
                  <p className="progress-hint">No food logged today — head to Log Food to start tracking.</p>
                )}
                <MacroProgressBar label="Calories" consumed={dailySummary.totalCalories} goal={goals.caloriesTarget} unit="kcal" />
                <MacroProgressBar label="Protein" consumed={dailySummary.totalProtein} goal={goals.proteinTarget} unit="g" />
                <MacroProgressBar label="Carbs" consumed={dailySummary.totalCarbs} goal={goals.carbsTarget} unit="g" />
                <MacroProgressBar label="Fat" consumed={dailySummary.totalFat} goal={goals.fatTarget} unit="g" />
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === "trends" && (
        <div className="tab-panel">
          <div className="range-selector">
            {[7, 30, 90].map(r => (
              <button
                key={r}
                type="button"
                className={`range-btn${selectedRange === r ? " range-btn--active" : ""}`}
                onClick={() => setSelectedRange(r)}
              >
                {r}d
              </button>
            ))}
          </div>
          {trendsQuery.isLoading && <div className="spinner spinner--lg" />}
          {trendsQuery.isError && <div className="alert alert--error">Failed to load trends. Please try again.</div>}
          {trendsQuery.data && (
            <div className="trend-charts">
              <TrendChart days={trendsQuery.data.days} metric="calories" goal={trendsQuery.data.goals?.caloriesTarget ?? null} label="Calories (kcal)" />
              <TrendChart days={trendsQuery.data.days} metric="protein" goal={trendsQuery.data.goals?.proteinTarget ?? null} label="Protein (g)" />
              <TrendChart days={trendsQuery.data.days} metric="carbs" goal={trendsQuery.data.goals?.carbsTarget ?? null} label="Carbs (g)" />
              <TrendChart days={trendsQuery.data.days} metric="fat" goal={trendsQuery.data.goals?.fatTarget ?? null} label="Fat (g)" />
            </div>
          )}
        </div>
      )}

      {activeTab === "streaks" && (
        <div className="tab-panel">
          {streaksQuery.isLoading && <div className="spinner spinner--lg" />}
          {streaksQuery.isError && <div className="alert alert--error">Failed to load streaks. Please try again.</div>}
          {streaksQuery.data && (() => {
            const { currentStreak, goalHitRate, heatmapDays, hasGoal } = streaksQuery.data;
            if (!hasGoal) {
              return (
                <div className="empty-state">
                  <p>Set your nutrition goals to start tracking your streak.</p>
                  <Link to="/goal-setup" className="button-secondary">Set goals</Link>
                </div>
              );
            }
            return (
              <>
                <div className="streak-stats">
                  <div className="streak-counter">
                    <span className="streak-counter__number">{currentStreak}</span>
                    <span className="streak-counter__label">day streak</span>
                  </div>
                  <p className="streak-hit-rate">{goalHitRate}% of logged days on goal (last 30 days)</p>
                </div>
                <GoalHeatmap days={heatmapDays} />
              </>
            );
          })()}
        </div>
      )}

      {activeTab === "weekly" && (
        <div className="tab-panel">
          {weeklyQuery.isLoading && <div className="spinner spinner--lg" />}
          {weeklyQuery.isError && <div className="alert alert--error">Failed to load weekly summary. Please try again.</div>}
          {weeklyQuery.data && (
            <WeeklySummaryTable
              summary={weeklyQuery.data}
              onPrev={() => setWeekOffset(o => o - 1)}
              onNext={() => setWeekOffset(o => o + 1)}
              isCurrentWeek={weekOffset === 0}
            />
          )}
        </div>
      )}
    </PageShell>
  );
}

export default ProgressPage;
