import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageShell from "../components/PageShell";
import { useAuthStore } from "../store/authStore";
import { getDiary } from "../api/diaryClient";
import { getProgressStreaks } from "../api/progressClient";
import { getRecentFoods } from "../api/nutritionLogClient";

function CalorieBar({ consumed, goal }) {
  if (!goal) return null;
  const pct = Math.min((consumed / goal) * 100, 100);
  const isOver = consumed > goal;
  return (
    <div className="dash-cal-bar">
      <div
        className={`dash-cal-bar__fill${isOver ? " dash-cal-bar__fill--over" : ""}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function MacroPill({ label, consumed, goal }) {
  const pct = goal > 0 ? Math.round((consumed / goal) * 100) : null;
  const isOver = goal > 0 && consumed > goal;
  return (
    <div className="dash-macro-pill">
      <span className="dash-macro-pill__label">{label}</span>
      <span className={`dash-macro-pill__value${isOver ? " dash-macro-pill__value--over" : ""}`}>
        {Math.round(consumed)}g
      </span>
      {goal > 0 && (
        <span className="dash-macro-pill__pct">{pct}%</span>
      )}
    </div>
  );
}

function TodayCard({ data }) {
  const { dailySummary: s, goals: g } = data;
  const hasGoal = !!g;
  const hasFood = s.totalCalories > 0;
  const remaining = hasGoal ? g.caloriesTarget - s.totalCalories : null;
  const isOver = remaining !== null && remaining < 0;

  return (
    <div className="dash-today-card">
      <div className="dash-today-card__header">
        <span className="dash-today-card__eyebrow">Today</span>
        <Link to="/progress" className="dash-today-card__link">Full breakdown →</Link>
      </div>

      <div className="dash-today-card__cal-row">
        <span className="dash-today-card__cal-num">
          {Math.round(s.totalCalories).toLocaleString()}
        </span>
        <span className="dash-today-card__cal-unit">
          {hasGoal ? `/ ${g.caloriesTarget.toLocaleString()} kcal` : "kcal logged"}
        </span>
      </div>

      {hasGoal && <CalorieBar consumed={s.totalCalories} goal={g.caloriesTarget} />}

      {hasGoal && hasFood && (
        <p className="dash-today-card__remaining">
          {isOver
            ? `${Math.abs(remaining).toLocaleString()} kcal over goal`
            : `${remaining.toLocaleString()} kcal remaining`}
        </p>
      )}

      {!hasFood && (
        <p className="dash-today-card__hint">No food logged yet today.</p>
      )}

      {hasFood && (
        <div className="dash-macro-row">
          <MacroPill label="Protein" consumed={s.totalProtein} goal={g?.proteinTarget ?? 0} />
          <MacroPill label="Carbs" consumed={s.totalCarbs} goal={g?.carbsTarget ?? 0} />
          <MacroPill label="Fat" consumed={s.totalFat} goal={g?.fatTarget ?? 0} />
        </div>
      )}

      {!hasGoal && (
        <p className="dash-today-card__no-goal">
          <Link to="/goal-setup">Set a nutrition goal</Link> to see your progress.
        </p>
      )}
    </div>
  );
}

function StreakCard({ data }) {
  const { currentStreak, goalHitRate, hasGoal } = data;
  if (!hasGoal) {
    return (
      <div className="dash-insight-card">
        <span className="dash-insight-card__title">Streak</span>
        <p className="dash-insight-card__empty">
          <Link to="/goal-setup">Set goals</Link> to track your streak.
        </p>
      </div>
    );
  }
  return (
    <div className="dash-insight-card">
      <span className="dash-insight-card__title">Streak</span>
      <div className="dash-streak">
        <span className="dash-streak__num">{currentStreak}</span>
        <span className="dash-streak__label">day{currentStreak !== 1 ? "s" : ""}</span>
      </div>
      <p className="dash-streak__rate">{goalHitRate}% hit rate (30d)</p>
      <Link to="/progress?tab=streaks" className="dash-insight-card__more">View heatmap →</Link>
    </div>
  );
}

function RecentFoodsCard({ data }) {
  const foods = data.slice(0, 4);
  if (foods.length === 0) {
    return (
      <div className="dash-insight-card">
        <span className="dash-insight-card__title">Recent Foods</span>
        <p className="dash-insight-card__empty">No recent foods yet.</p>
      </div>
    );
  }
  return (
    <div className="dash-insight-card">
      <span className="dash-insight-card__title">Recent Foods</span>
      <ul className="dash-recent-list">
        {foods.map((food) => (
          <li key={food.id} className="dash-recent-item">
            <span className="dash-recent-item__name">{food.name}</span>
            <span className="dash-recent-item__cal">{Math.round(food.caloriesPerServing)} kcal</span>
          </li>
        ))}
      </ul>
      <Link to="/log" className="dash-insight-card__more">Log food →</Link>
    </div>
  );
}

function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const todayQuery = useQuery({
    queryKey: ["diary-today"],
    queryFn: () => getDiary().then(r => r.data.data),
  });

  const streaksQuery = useQuery({
    queryKey: ["progress-streaks"],
    queryFn: getProgressStreaks,
  });

  const recentQuery = useQuery({
    queryKey: ["recent-foods"],
    queryFn: getRecentFoods,
  });

  return (
    <PageShell>
      <div className="dash-greeting">
        <span className="dash-greeting__eyebrow">Welcome back</span>
        <h1 className="dash-greeting__name">{user?.firstName || "there"}</h1>
        <p className="dash-greeting__sub">Here&apos;s how you&apos;re doing today.</p>
      </div>

      {/* Today at a glance */}
      {todayQuery.isLoading && <div className="dash-skeleton" />}
      {todayQuery.data && <TodayCard data={todayQuery.data} />}

      {/* Insights row */}
      <div className="dash-insights-row">
        <div className="dash-insight-col">
          {streaksQuery.isLoading && <div className="dash-insight-card dash-insight-card--loading" />}
          {streaksQuery.data && <StreakCard data={streaksQuery.data} />}
        </div>
        <div className="dash-insight-col">
          {recentQuery.isLoading && <div className="dash-insight-card dash-insight-card--loading" />}
          {recentQuery.data && <RecentFoodsCard data={recentQuery.data} />}
        </div>
      </div>

      {/* Quick actions */}
      <div className="dash-actions">
        <Link to="/scan" className="dash-action dash-action--primary">
          <span className="dash-action__label">Scan Food</span>
          <span className="dash-action__sub">Identify your meal with AI</span>
        </Link>
        <Link to="/log" className="dash-action">
          <span className="dash-action__label">Log Manually</span>
          <span className="dash-action__sub">Search and add any food item</span>
        </Link>
        <Link to="/history" className="dash-action">
          <span className="dash-action__label">Meal History</span>
          <span className="dash-action__sub">Review past days</span>
        </Link>
        <Link to="/progress" className="dash-action">
          <span className="dash-action__label">Progress</span>
          <span className="dash-action__sub">Charts, trends and streaks</span>
        </Link>
      </div>

      <div className="dash-meta">
        <Link to="/profile-setup" className="dash-meta__link">Edit profile</Link>
        <Link to="/goal-setup" className="dash-meta__link">Nutrition goals</Link>
      </div>
    </PageShell>
  );
}

export default DashboardPage;
