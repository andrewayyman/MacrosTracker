import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  CalendarRange
} from "lucide-react";
import { getWeeklySummary } from "../api/progressClient";

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper for Monday ISO date string in local timezone
function getMonday(offsetWeeks) {
  const d = new Date();
  // Get current day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const day = d.getDay();
  // Adjust so Monday is 0, Tuesday is 1, ..., Sunday is 6
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff + offsetWeeks * 7);
  return formatDateLocal(d);
}

function formatDateShort(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Day classification based on calorie target
const classifyDay = (totalCalories, caloriesTarget, hasData) => {
  if (!hasData || !caloriesTarget || caloriesTarget <= 0) {
    return {
      code: "NO_DATA",
      label: "No data",
      colorClass: "adherence-day-card__circle--nodata",
      icon: "⚪"
    };
  }
  
  const pct = totalCalories / caloriesTarget;
  if (pct < 0.9) {
    return {
      code: "UNDER_TARGET",
      label: "Under target",
      colorClass: "adherence-day-card__circle--under",
      icon: "🟡"
    };
  } else if (pct >= 0.9 && pct <= 1.05) {
    return {
      code: "GOAL_ACHIEVED",
      label: "Goal achieved",
      colorClass: "adherence-day-card__circle--achieved",
      icon: "🟢"
    };
  } else if (pct > 1.05 && pct <= 1.20) {
    return {
      code: "SLIGHTLY_OVER",
      label: "Slightly over target",
      colorClass: "adherence-day-card__circle--slightly-over",
      icon: "🟠"
    };
  } else {
    return {
      code: "SIGNIFICANTLY_OVER",
      label: "Significantly over target",
      colorClass: "adherence-day-card__circle--significantly-over",
      icon: "🔴"
    };
  }
};

export default function WeeklyGoalAdherence() {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = getMonday(weekOffset);

  const { data: summary, isLoading, isError, refetch } = useQuery({
    queryKey: ["progress-weekly", weekStart],
    queryFn: () => getWeeklySummary(weekStart),
  });

  const handlePrevWeek = () => setWeekOffset(prev => prev - 1);
  const handleNextWeek = () => setWeekOffset(prev => prev + 1);

  if (isLoading) {
    return (
      <div className="adherence-widget" style={{ minHeight: "260px", animation: "pulse 1.4s ease-in-out infinite" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
          <div style={{ height: "20px", width: "150px", background: "var(--surface-2)", borderRadius: "4px" }} />
          <div style={{ height: "28px", width: "120px", background: "var(--surface-2)", borderRadius: "4px" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "12px" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: "60px", background: "var(--surface-2)", borderRadius: "6px" }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px", marginTop: "20px" }}>
          {[...Array(7)].map((_, i) => (
            <div key={i} style={{ height: "80px", background: "var(--surface-2)", borderRadius: "6px" }} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="adherence-widget">
        <div className="alert alert--error" style={{ margin: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center" }}>
          <AlertCircle size={24} />
          <span>Failed to load weekly adherence analytics.</span>
          <button type="button" className="button-secondary btn--sm" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { weekEnd, days = [], hasGoal } = summary || {};

  // Empty State: Goal not setup
  if (!hasGoal) {
    return (
      <div className="adherence-widget">
        <div className="adherence-widget__header">
          <div className="adherence-widget__title-area">
            <span className="premium-card__icon"><CalendarRange size={18} /></span>
            <h2 className="adherence-widget__title">Weekly Goal Adherence</h2>
          </div>
        </div>
        <div style={{ textAlign: "center", padding: "30px 10px" }}>
          <AlertCircle size={36} style={{ color: "var(--warning)", marginBottom: "12px", opacity: 0.8 }} />
          <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-2)", marginBottom: "4px" }}>
            Calorie Goals Not Found
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "16px", maxWidth: "340px", marginLeft: "auto", marginRight: "auto" }}>
            To track your weekly goal adherence and see premium insights, set up your nutrition goals first.
          </p>
          <Link to="/goal-setup" className="button-primary btn--sm" style={{ height: "32px", minHeight: "auto", display: "inline-flex" }}>
            Set Daily Calorie Target
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const trackedDaysList = days.filter(d => d.hasData && d.caloriesTarget > 0);
  const daysTracked = trackedDaysList.length;
  
  let goalAchievedCount = 0;
  let bestDay = null;
  let bestDeviation = Infinity;
  let challengingDay = null;
  let maxDeviation = -1;

  trackedDaysList.forEach(day => {
    const classification = classifyDay(day.totalCalories, day.caloriesTarget, true);
    if (classification.code === "GOAL_ACHIEVED") {
      goalAchievedCount++;
    }
    
    // Deviation as percentage difference
    const deviation = Math.abs((day.totalCalories / day.caloriesTarget) - 1);
    
    if (deviation < bestDeviation) {
      bestDeviation = deviation;
      bestDay = day;
    }
    
    if (deviation > maxDeviation) {
      maxDeviation = deviation;
      challengingDay = day;
    }
  });

  const adherencePct = daysTracked > 0 ? Math.round((goalAchievedCount / daysTracked) * 100) : 0;
  
  const getDisplayDayInfo = (dayObj) => {
    if (!dayObj) return "—";
    const pct = Math.round((dayObj.totalCalories / dayObj.caloriesTarget) * 100);
    return `${dayObj.dayName} (${pct}%)`;
  };

  return (
    <div className="adherence-widget">
      {/* Widget Header with Nav */}
      <div className="adherence-widget__header">
        <div className="adherence-widget__title-area">
          <span className="premium-card__icon" style={{ background: "var(--accent-subtle)", color: "var(--accent)", padding: "6px", borderRadius: "var(--radius-sm)", display: "inline-flex" }}>
            <CalendarRange size={16} />
          </span>
          <h2 className="adherence-widget__title">Weekly Goal Adherence</h2>
        </div>
        <div className="adherence-widget__nav">
          <button 
            type="button" 
            className="adherence-widget__nav-btn" 
            onClick={handlePrevWeek}
            aria-label="Previous Week"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="adherence-widget__range">
            {formatDateShort(weekStart)} – {formatDateShort(weekEnd)}
          </span>
          <button 
            type="button" 
            className="adherence-widget__nav-btn" 
            onClick={handleNextWeek}
            disabled={weekOffset === 0}
            aria-label="Next Week"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Analytics Stats Grid */}
      <div className="adherence-stats">
        <div className="adherence-stat-card">
          <span className="adherence-stat-card__label">Adherence</span>
          <span className="adherence-stat-card__val" style={{ color: adherencePct >= 80 ? "var(--success)" : adherencePct >= 50 ? "var(--warning)" : "var(--text-1)" }}>
            {daysTracked > 0 ? `${adherencePct}%` : "—"}
          </span>
          <span className="adherence-stat-card__desc">
            {goalAchievedCount} of {daysTracked} days hit
          </span>
        </div>
        <div className="adherence-stat-card">
          <span className="adherence-stat-card__label">Days Tracked</span>
          <span className="adherence-stat-card__val">{daysTracked} / 7</span>
          <span className="adherence-stat-card__desc">Logged days</span>
        </div>
        <div className="adherence-stat-card">
          <span className="adherence-stat-card__label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Trophy size={11} style={{ color: "var(--warning)" }} /> Best Day
          </span>
          <span className="adherence-stat-card__val" style={{ fontSize: bestDay ? "var(--text-sm)" : "var(--text-lg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {bestDay ? bestDay.dayName : "—"}
          </span>
          <span className="adherence-stat-card__desc">
            {bestDay ? `${Math.round(bestDay.totalCalories)} kcal (${Math.round((bestDay.totalCalories / bestDay.caloriesTarget) * 100)}%)` : "No data logged"}
          </span>
        </div>
        <div className="adherence-stat-card">
          <span className="adherence-stat-card__label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Activity size={11} style={{ color: "var(--error)" }} /> Challenging
          </span>
          <span className="adherence-stat-card__val" style={{ fontSize: challengingDay ? "var(--text-sm)" : "var(--text-lg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {challengingDay ? challengingDay.dayName : "—"}
          </span>
          <span className="adherence-stat-card__desc">
            {challengingDay ? `${Math.round(challengingDay.totalCalories)} kcal (${Math.round((challengingDay.totalCalories / challengingDay.caloriesTarget) * 100)}%)` : "No data logged"}
          </span>
        </div>
      </div>

      {/* Visual Weekly Day Columns */}
      <div className="adherence-days-grid">
        {days.map((day) => {
          const classification = classifyDay(day.totalCalories, day.caloriesTarget, day.hasData);
          const percent = day.hasData && day.caloriesTarget > 0 ? Math.round((day.totalCalories / day.caloriesTarget) * 100) : 0;
          return (
            <div key={day.date} className="adherence-day-card" title={`${day.dayName}: ${classification.label} (${percent}%)`}>
              <span className="adherence-day-card__name">{day.dayName.slice(0, 3)}</span>
              <div className={`adherence-day-card__circle ${classification.colorClass}`} aria-label={classification.label}>
                {classification.icon}
              </div>
              <span className="adherence-day-card__cal">
                {day.hasData ? `${Math.round(day.totalCalories)}` : "—"}
              </span>
              <span className="adherence-day-card__target">
                {day.hasData ? `/${day.caloriesTarget}` : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Color Code Legend */}
      <div className="adherence-legend">
        <div className="adherence-legend-item">
          <span className="adherence-legend-swatch" style={{ background: "var(--success)" }} />
          <span>Achieved (90-105%)</span>
        </div>
        <div className="adherence-legend-item">
          <span className="adherence-legend-swatch" style={{ background: "var(--warning)" }} />
          <span>Slightly Over (105-120%)</span>
        </div>
        <div className="adherence-legend-item">
          <span className="adherence-legend-swatch" style={{ background: "var(--error)" }} />
          <span>Significantly Over (&gt;120%)</span>
        </div>
        <div className="adherence-legend-item">
          <span className="adherence-legend-swatch" style={{ background: "oklch(0.700 0.100 90)" }} />
          <span>Under Target (&lt;90%)</span>
        </div>
        <div className="adherence-legend-item">
          <span className="adherence-legend-swatch" style={{ border: "1px dashed var(--border-strong)" }} />
          <span>No Data</span>
        </div>
      </div>
    </div>
  );
}
