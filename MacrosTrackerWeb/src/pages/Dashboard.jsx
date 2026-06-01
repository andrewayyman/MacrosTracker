import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Flame, 
  Droplets, 
  Scale, 
  Sparkles, 
  Camera, 
  Search, 
  Trash2, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  Minus, 
  Calendar,
  ChevronRight,
  Info,
  Beef,
  Wheat,
  Pizza,
  Sliders
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import PageShell from "../components/PageShell";
import { useAuthStore } from "../store/authStore";
import { getDiary, deleteDiaryEntry } from "../api/diaryClient";
import { getProgressStreaks, getProgressTrends } from "../api/progressClient";
import { getProfile, upsertProfile } from "../api/profileClient";
import { getGoalProfile } from "../api/userGoalProfileClient";
import { generateRecommendation } from "../utils/aiCoach";
import { StreakAchievements } from "../components/StreakAchievements";
import WeeklyGoalAdherence from "../components/WeeklyGoalAdherence";
import RecentFoodsQuickAdd from "../components/RecentFoodsQuickAdd";

// Helpers
function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatChartDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // States for Water & Weight
  const [waterCups, setWaterCups] = useState(0);
  const [inputWeight, setInputWeight] = useState("");
  const [showWeightToast, setShowWeightToast] = useState(false);

  // Formatted date string for local water tracking key
  const todayStr = new Date().toISOString().split("T")[0];
  const waterKey = `water_logged_${todayStr}`;

  // Load water intake from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(waterKey);
    if (saved) {
      setWaterCups(parseInt(saved, 10));
    } else {
      setWaterCups(0);
    }
  }, [waterKey]);

  // Queries
  const todayQuery = useQuery({
    queryKey: ["diary-today"],
    queryFn: () => getDiary().then((r) => r.data.data),
  });

  const streaksQuery = useQuery({
    queryKey: ["progress-streaks"],
    queryFn: getProgressStreaks,
  });

  const trendsQuery = useQuery({
    queryKey: ["progress-trends-7"],
    queryFn: () => getProgressTrends(7),
  });

  const profileQuery = useQuery({
    queryKey: ["profile-details"],
    queryFn: () => getProfile().then((r) => r.data),
  });

  const goalProfileQuery = useQuery({
    queryKey: ["goal-profile"],
    queryFn: () => getGoalProfile().then((r) => r.data).catch((err) => {
      if (err.response?.status === 404) return null;
      throw err;
    }),
  });

  // Prefill input weight once profile query completes
  useEffect(() => {
    if (profileQuery.data?.weightKg) {
      setInputWeight(profileQuery.data.weightKg.toString());
    }
  }, [profileQuery.data]);

  // Deletion Mutation for Food Entries
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDiaryEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary-today"] });
      queryClient.invalidateQueries({ queryKey: ["progress-trends-7"] });
    },
  });

  // Weight Update Mutation
  const weightMutation = useMutation({
    mutationFn: (newWeight) => {
      const currentProfile = profileQuery.data || {};
      const payload = {
        firstName: currentProfile?.firstName || user?.firstName || "there",
        lastName: currentProfile?.lastName || user?.lastName || "",
        weightKg: parseFloat(newWeight),
        heightCm: currentProfile?.heightCm || 175,
        age: currentProfile?.age || 25,
        gender: currentProfile?.gender || "Male",
      };
      return upsertProfile(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-details"] });
      setShowWeightToast(true);
      setTimeout(() => setShowWeightToast(false), 3000);
    },
  });

  // Handler for saving water
  const handleWaterChange = (newVal) => {
    const clamped = Math.max(0, Math.min(16, newVal));
    setWaterCups(clamped);
    localStorage.setItem(waterKey, clamped.toString());
  };

  // Handler for saving weight
  const handleWeightSubmit = (e) => {
    e.preventDefault();
    if (!inputWeight || isNaN(parseFloat(inputWeight))) return;
    weightMutation.mutate(inputWeight);
  };

  // Loading Skeleton
  const isLoading = todayQuery.isLoading || streaksQuery.isLoading || profileQuery.isLoading || trendsQuery.isLoading || goalProfileQuery.isLoading;

  if (isLoading) {
    return (
      <PageShell>
        <div className="skeleton-dashboard">
          <div className="skeleton-box skeleton-header" />
          <div className="skeleton-box skeleton-chart" />
          <div className="skeleton-box skeleton-widget" />
          <div className="skeleton-box skeleton-row" />
          <div className="skeleton-box skeleton-row" />
        </div>
      </PageShell>
    );
  }

  // Data mapping
  const diaryData = todayQuery.data || { dailySummary: {}, mealGroups: [] };
  const summary = diaryData.dailySummary || { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 };
  const goal = diaryData.goals || null;
  const goalProfile = goalProfileQuery.data || null;

  const currentWeight = profileQuery.data?.weightKg || user?.weightKg || 80;

  // Calorie Ring Calculations
  const consumedCal = Math.round(summary.totalCalories || 0);
  const targetCal = goal?.caloriesTarget || goalProfile?.dailyCaloriesTarget || 2000;
  const calPct = Math.min((consumedCal / targetCal) * 100, 100);
  const remainingCal = targetCal - consumedCal;
  const isCalOver = remainingCal < 0;

  // SVG Ring values
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calPct / 100) * circumference;

  // Macro progress bars
  const pConsumed = Math.round(summary.totalProtein || 0);
  const pTarget = Math.round(goal?.proteinTarget || goalProfile?.dailyProteinGrams || 120);
  const pPct = pTarget > 0 ? Math.min((pConsumed / pTarget) * 100, 100) : 0;
  const pOver = pConsumed > pTarget;

  const cConsumed = Math.round(summary.totalCarbs || 0);
  const cTarget = Math.round(goal?.carbsTarget || goalProfile?.dailyCarbsGrams || 200);
  const cPct = cTarget > 0 ? Math.min((cConsumed / cTarget) * 100, 100) : 0;
  const cOver = cConsumed > cTarget;

  const fConsumed = Math.round(summary.totalFat || 0);
  const fTarget = Math.round(goal?.fatTarget || goalProfile?.dailyFatGrams || 70);
  const fPct = fTarget > 0 ? Math.min((fConsumed / fTarget) * 100, 100) : 0;
  const fOver = fConsumed > fTarget;

  // Active Streak details
  const currentStreak = streaksQuery.data?.currentStreak ?? 0;
  const hitRate = Math.round(streaksQuery.data?.goalHitRate ?? 0);

  // Generate dynamic AI Coach recommendations
  const recommendation = generateRecommendation({
    consumedCal,
    targetCal,
    pConsumed,
    pTarget,
    cConsumed,
    cTarget,
    fConsumed,
    fTarget,
    currentStreak,
    goalType: goalProfile?.goalType || null,
    waterCups,
    isGoalProfileLoading: goalProfileQuery.isLoading,
    isGoalProfileError: goalProfileQuery.isError,
    hasGoalProfile: !!goalProfile
  });

  // Map recommendation icon to Lucide icon components
  const IconComponent = (() => {
    switch (recommendation.icon) {
      case "Sparkles": return Sparkles;
      case "Sliders": return Sliders;
      case "Camera": return Camera;
      case "Beef": return Beef;
      case "Flame": return Flame;
      case "Wheat": return Wheat;
      case "Pizza": return Pizza;
      case "Droplets": return Droplets;
      case "CheckCircle2": return CheckCircle2;
      case "Info": return Info;
      default: return Sparkles;
    }
  })();

  // Set type-specific styling
  const typeStyles = (() => {
    switch (recommendation.type) {
      case "warning":
        return {
          iconBg: "oklch(0.490 0.170 25 / 0.1)",
          iconColor: "var(--error)",
          glowColor: "linear-gradient(90deg, var(--error) 0%, var(--warning) 100%)",
        };
      case "success":
        return {
          iconBg: "var(--accent-subtle)",
          iconColor: "var(--success)",
          glowColor: "linear-gradient(90deg, var(--success) 0%, var(--accent) 100%)",
        };
      case "tip":
      case "info":
        return {
          iconBg: "var(--accent-subtle)",
          iconColor: "var(--accent)",
          glowColor: "var(--ai-glow)",
        };
      case "setup":
        return {
          iconBg: "oklch(0.580 0.140 72 / 0.1)",
          iconColor: "var(--warning)",
          glowColor: "linear-gradient(90deg, var(--warning) 0%, oklch(0.64 0.2 300) 100%)",
        };
      default:
        return {
          iconBg: "var(--accent-subtle)",
          iconColor: "var(--accent)",
          glowColor: "var(--ai-glow)",
        };
    }
  })();
  // 7-day calories trend mapping
  const chartDays = trendsQuery.data?.Days || [];
  const chartGoals = Math.round(trendsQuery.data?.Goals?.caloriesTarget || targetCal);

  return (
    <PageShell>
      <div className="premium-dash-grid">
        
        {/* Modern Interactive Greeting */}
        <section className="premium-greeting">
          <div className="premium-greeting__info">
            <span className="eyebrow" style={{ marginBottom: '4px' }}>Welcome back</span>
            <h1 className="premium-greeting__title">{profileQuery.data?.firstName || user?.firstName || "there"}</h1>
            <p className="premium-greeting__sub">Here is your daily fitness and macro roadmap at a glance.</p>
          </div>
          <div className="premium-greeting__date">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
          </div>
        </section>

        {/* AI Health Coach Banner */}
        <section className="ai-recommendations-card">
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: typeStyles.glowColor,
              zIndex: 2
            }}
          />
          <div 
            className="ai-recommendations-card__icon-wrapper"
            style={{
              background: typeStyles.iconBg,
              color: typeStyles.iconColor
            }}
          >
            <IconComponent size={24} />
          </div>
          <div className="ai-recommendations-card__content">
            <h3 className="ai-recommendations-card__headline">{recommendation.headline}</h3>
            <p className="ai-recommendations-card__text">{recommendation.text}</p>
            {recommendation.actionLink && (
              <div style={{ marginTop: '12px' }}>
                <Link 
                  to={recommendation.actionLink} 
                  className="btn-modern-primary"
                  style={{ 
                    fontSize: '12px', 
                    padding: '8px 16px', 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: 'var(--radius-md)',
                    minHeight: 'auto',
                    height: '32px'
                  }}
                >
                  <span>{recommendation.actionText}</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Widgets reordered - Adherence & Quick Add moved below Daily Progress */}

        {/* Circular Calories Widget */}
        <section className="premium-card calorie-circle-card">
          <div className="premium-card__header">
            <div className="premium-card__title-area">
              <span className="premium-card__icon"><Flame size={18} /></span>
              <h2 className="premium-card__title">Calories Progress</h2>
            </div>
            <Link to="/progress" className="premium-card__link">Analysis</Link>
          </div>

          <div className="calorie-progress-layout">
            <div className="calorie-circle-wrapper">
              <svg className="calorie-circle-svg" width="160" height="160">
                <circle
                  className="calorie-circle-bg"
                  cx="80"
                  cy="80"
                  r={radius}
                />
                <circle
                  className={`calorie-circle-fill${isCalOver ? " calorie-circle-fill--over" : ""}`}
                  cx="80"
                  cy="80"
                  r={radius}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="calorie-circle-text-container">
                <span className="calorie-circle-val">{consumedCal}</span>
                <span className="calorie-circle-label">kcal</span>
              </div>
            </div>

            <div className="calorie-details-grid">
              <div className="calorie-detail-item">
                <span className="calorie-detail-item__label">
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                  Target Goal
                </span>
                <span className="calorie-detail-item__val">{targetCal} kcal</span>
              </div>
              <div className="calorie-detail-item">
                <span className="calorie-detail-item__label">
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: isCalOver ? 'var(--error)' : 'var(--text-3)' }} />
                  {isCalOver ? "Over Limit" : "Remaining"}
                </span>
                <span className="calorie-detail-item__val" style={{ color: isCalOver ? 'var(--error)' : 'inherit' }}>
                  {Math.abs(remainingCal)} kcal
                </span>
              </div>
              <div className="calorie-detail-item">
                <span className="calorie-detail-item__label">
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-3)' }} />
                  Streak Hit Rate
                </span>
                <span className="calorie-detail-item__val">{hitRate}% ({currentStreak}d streak)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Macros Progress Card */}
        <section className="premium-card macros-card">
          <div className="premium-card__header">
            <div className="premium-card__title-area">
              <span className="premium-card__icon"><Pizza size={18} /></span>
              <h2 className="premium-card__title">Macros Breakdown</h2>
            </div>
            <Link to="/my-goal" className="premium-card__link">Edit Goals</Link>
          </div>

          <div className="macros-container">
            {/* Protein */}
            <div className="premium-macro-bar">
              <div className="premium-macro-bar__header">
                <span className="premium-macro-bar__name">
                  <span className="premium-macro-bar__name-icon premium-macro-bar__name-icon--protein">
                    <Beef size={12} />
                  </span>
                  Protein
                </span>
                <span className="premium-macro-bar__values">
                  {Math.round(pConsumed)}g / {pTarget}g ({Math.round(pPct)}%)
                </span>
              </div>
              <div className="premium-macro-bar__track">
                <div 
                  className={`premium-macro-bar__fill premium-macro-bar__fill--protein${pOver ? " premium-macro-bar__fill--over" : ""}`}
                  style={{ width: `${pPct}%` }}
                />
              </div>
            </div>

            {/* Carbohydrates */}
            <div className="premium-macro-bar">
              <div className="premium-macro-bar__header">
                <span className="premium-macro-bar__name">
                  <span className="premium-macro-bar__name-icon premium-macro-bar__name-icon--carbs">
                    <Wheat size={12} />
                  </span>
                  Carbs
                </span>
                <span className="premium-macro-bar__values">
                  {Math.round(cConsumed)}g / {cTarget}g ({Math.round(cPct)}%)
                </span>
              </div>
              <div className="premium-macro-bar__track">
                <div 
                  className={`premium-macro-bar__fill premium-macro-bar__fill--carbs${cOver ? " premium-macro-bar__fill--over" : ""}`}
                  style={{ width: `${cPct}%` }}
                />
              </div>
            </div>

            {/* Fats */}
            <div className="premium-macro-bar">
              <div className="premium-macro-bar__header">
                <span className="premium-macro-bar__name">
                  <span className="premium-macro-bar__name-icon premium-macro-bar__name-icon--fat">
                    <Flame size={12} />
                  </span>
                  Fat
                </span>
                <span className="premium-macro-bar__values">
                  {Math.round(fConsumed)}g / {fTarget}g ({Math.round(fPct)}%)
                </span>
              </div>
              <div className="premium-macro-bar__track">
                <div 
                  className={`premium-macro-bar__fill premium-macro-bar__fill--fat${fOver ? " premium-macro-bar__fill--over" : ""}`}
                  style={{ width: `${fPct}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Water Hydration Intake Tracker */}
        <section className="premium-card water-intake-card">
          <div className="premium-card__header">
            <div className="premium-card__title-area">
              <span className="premium-card__icon"><Droplets size={18} /></span>
              <h2 className="premium-card__title">Hydration Tracker</h2>
            </div>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-3)" }}>Goal: 8 cups</span>
          </div>

          <div className="water-content">
            <div className="water-visual-container">
              <div 
                className="water-visual-fill" 
                style={{ height: `${Math.min((waterCups / 8) * 100, 100)}%` }}
              >
                {waterCups > 0 && <div className="water-visual-wave" />}
              </div>
            </div>

            <div className="water-text-display">
              <span className="water-amount">{waterCups} <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-2)" }}>/ 8 cups</span></span>
              <span className="water-target-label">{waterCups * 250} ml logged today</span>
            </div>

            <div className="water-grid-cups">
              {[...Array(8)].map((_, i) => (
                <button
                  key={i}
                  className={`water-cup-btn${i < waterCups ? " water-cup-btn--active" : ""}`}
                  onClick={() => handleWaterChange(i + 1 === waterCups ? i : i + 1)}
                  aria-label={`Log ${i + 1} cup of water`}
                >
                  <Droplets size={14} fill={i < waterCups ? "currentColor" : "none"} />
                </button>
              ))}
            </div>

            <div className="water-quick-actions">
              <button className="water-btn-adjust" onClick={() => handleWaterChange(waterCups - 1)}>
                <Minus size={14} />
                <span>Remove</span>
              </button>
              <button className="water-btn-adjust" onClick={() => handleWaterChange(waterCups + 1)}>
                <Plus size={14} />
                <span>Add Cup</span>
              </button>
            </div>
          </div>
        </section>

        {/* Quick Actions Panel */}
        <section className="premium-card quick-actions-card">
          <div className="premium-card__header">
            <div className="premium-card__title-area">
              <span className="premium-card__icon"><Sparkles size={18} style={{ color: "var(--accent)" }} /></span>
              <h2 className="premium-card__title">Smart Shortcuts</h2>
            </div>
          </div>
          <div className="quick-actions-grid">
            <Link to="/scan" className="action-card-premium action-card-premium--highlight">
              <div className="action-card-premium__icon-box">
                <Camera size={20} />
              </div>
              <div className="action-card-premium__text">
                <span className="action-card-premium__label">AI Scan Plate</span>
                <span className="action-card-premium__sub">Instant nutrition scan</span>
              </div>
              <ChevronRight size={16} style={{ marginLeft: "auto", color: "var(--accent)" }} />
            </Link>

            <Link to="/log" className="action-card-premium">
              <div className="action-card-premium__icon-box">
                <Search size={20} />
              </div>
              <div className="action-card-premium__text">
                <span className="action-card-premium__label">Log Food Manually</span>
                <span className="action-card-premium__sub">Search database items</span>
              </div>
              <ChevronRight size={16} style={{ marginLeft: "auto", color: "var(--text-3)" }} />
            </Link>

            <Link to="/log?tab=egyptian" className="action-card-premium" style={{ border: '1px solid oklch(0.85 0.05 75)' }}>
              <div className="action-card-premium__icon-box" style={{ background: 'oklch(0.94 0.03 75)', color: 'oklch(0.55 0.12 75)' }}>
                <Sparkles size={20} />
              </div>
              <div className="action-card-premium__text">
                <span className="action-card-premium__label">Egyptian Express</span>
                <span className="action-card-premium__sub">Koshary, Ful & Falafel quick log</span>
              </div>
              <ChevronRight size={16} style={{ marginLeft: "auto", color: "oklch(0.55 0.12 75)" }} />
            </Link>
          </div>
        </section>

        {/* Streak Achievements Widget */}
        <section className="premium-card streak-achievements-widget-card">
          <div className="premium-card__header">
            <div className="premium-card__title-area">
              <span className="premium-card__icon"><Flame size={18} /></span>
              <h2 className="premium-card__title">Streak Milestones</h2>
            </div>
            <Link to="/progress?tab=streaks" className="premium-card__link">All Badges</Link>
          </div>
          <StreakAchievements currentStreak={currentStreak} isCompact={true} />
        </section>

        {/* Weight Log Tracker Widget */}
        <section className="premium-card weight-stats-card">
          <div className="premium-card__header">
            <div className="premium-card__title-area">
              <span className="premium-card__icon"><Scale size={18} /></span>
              <h2 className="premium-card__title">Weight Log</h2>
            </div>
            <Link to="/progress?tab=trends" className="premium-card__link">History</Link>
          </div>

          <div className="weight-content">
            <div className="weight-row-main">
              <div className="weight-badge">
                <span className="weight-val">{parseFloat(currentWeight).toFixed(1)}</span>
                <span className="weight-unit">kg current</span>
              </div>
              <span className="weight-change-indicator weight-change-indicator--neutral">
                <Info size={12} />
                <span>Steady</span>
              </span>
            </div>

            <form onSubmit={handleWeightSubmit} className="weight-log-form">
              <label htmlFor="dashboard-weight-input" style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-2)" }}>
                Log Today&apos;s Weight:
              </label>
              <div className="weight-input-wrapper">
                <input
                  id="dashboard-weight-input"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 82.5"
                  className="weight-input"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={weightMutation.isPending}
                  className="weight-input-btn"
                >
                  {weightMutation.isPending ? "..." : "Save"}
                </button>
              </div>
              
              {showWeightToast && (
                <div className="weight-success-toast">
                  <CheckCircle2 size={12} />
                  <span>Weight updated successfully!</span>
                </div>
              )}
            </form>
          </div>
        </section>



        {/* Today's Meals Section */}
        <section className="premium-card today-meals-card">
          <div className="premium-card__header">
            <div className="premium-card__title-area">
              <span className="premium-card__icon"><CheckCircle2 size={18} /></span>
              <h2 className="premium-card__title">Today&apos;s Meal Logs</h2>
            </div>
            <Link to="/history" className="premium-card__link">Log History</Link>
          </div>

          {diaryData.mealGroups?.length === 0 || diaryData.mealGroups?.every(g => g.entries.length === 0) ? (
            <div style={{ textAlign: "center", padding: "40px 0", background: "var(--surface-2)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)" }}>
              <Pizza size={40} style={{ color: "var(--text-3)", marginBottom: "12px", opacity: 0.7 }} />
              <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-2)", marginBottom: "4px" }}>No meals logged yet today.</p>
              <p style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "16px" }}>Keep track of your nutrient intake to hit your targets.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <Link to="/scan" className="btn-modern-primary" style={{ fontSize: '12px', padding: '8px 16px' }}>Scan with AI</Link>
                <Link to="/log" className="btn-modern-secondary" style={{ fontSize: '12px', padding: '8px 16px' }}>Search Manually</Link>
              </div>
            </div>
          ) : (
            <div className="meals-list">
              {diaryData.mealGroups.map((group) => {
                if (group.entries.length === 0) return null;
                return (
                  <div key={group.mealType || group.MealType} className="meal-type-group">
                    <div className="meal-type-group__header">
                      <span className="meal-type-group__name">
                        {group.mealType || group.MealType}
                      </span>
                      <span className="meal-type-group__cal">
                        {Math.round(group.groupCalories ?? group.GroupCalories ?? 0)} kcal
                      </span>
                    </div>
                    <div>
                      {group.entries.map((entry) => {
                        const entryId = entry.id || entry.Id;
                        const foodName = entry.foodName || entry.FoodName || "";
                        const calories = entry.calories || entry.Calories || 0;
                        const protein = entry.protein || entry.Protein || 0;
                        const carbs = entry.carbs || entry.Carbs || 0;
                        const fat = entry.fat || entry.Fat || 0;
                        const servingGrams = entry.servingSizeGrams || entry.ServingSizeGrams || null;

                        return (
                        <div key={entryId} className="meal-entry-row">
                          <div className="meal-entry-info">
                            <span className="meal-entry-name">{foodName}</span>
                            <div className="meal-entry-meta">
                              {servingGrams && (
                                <span style={{ fontWeight: "600" }}>{Math.round(servingGrams)}g</span>
                              )}
                              <span className="meal-entry-macro-badge meal-entry-macro-badge--p">
                                P: {Math.round(protein)}g
                              </span>
                              <span className="meal-entry-macro-badge meal-entry-macro-badge--c">
                                C: {Math.round(carbs)}g
                              </span>
                              <span className="meal-entry-macro-badge meal-entry-macro-badge--f">
                                F: {Math.round(fat)}g
                              </span>
                            </div>
                          </div>
                          <div className="meal-entry-right">
                            <span className="meal-entry-cal">{Math.round(calories)} kcal</span>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete "${foodName}"?`)) {
                                  deleteMutation.mutate(entryId);
                                }
                              }}
                              className="meal-entry-delete"
                              disabled={deleteMutation.isPending}
                              aria-label={`Delete log ${foodName}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Add Recent Foods Widget */}
        <section className="premium-card" style={{ gridColumn: "span 12", padding: "var(--sp-5)" }}>
          <RecentFoodsQuickAdd onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["diary-today"] });
            queryClient.invalidateQueries({ queryKey: ["progress-trends-7"] });
          }} />
        </section>

        {/* Weekly Goal Adherence Widget */}
        <section style={{ gridColumn: "span 12" }}>
          <WeeklyGoalAdherence />
        </section>

      </div>
    </PageShell>
  );
}
