import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Target, 
  Flame, 
  Award, 
  Activity, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  Info, 
  Beef, 
  Wheat, 
  Pizza, 
  TrendingUp, 
  User, 
  Ruler, 
  Scale, 
  ShieldAlert, 
  Check, 
  HelpCircle, 
  Sliders,
  TrendingDown,
  Clock,
  ThumbsUp,
  BrainCircuit
} from "lucide-react";
import PageShell from "../components/PageShell";
import { getGoalProfile, saveGoalProfile, previewGoalCalculation } from "../api/userGoalProfileClient";
import { getDailyGoal, getSuggestedGoal, upsertDailyGoal } from "../api/nutritionGoalsClient";
import { getProgressStreaks, getProgressTrends } from "../api/progressClient";
import { parseServiceErrors } from "../utils/serviceErrors";
import "./MyGoal.css";

const GOAL_LABELS = {
  LoseWeightSlow: "Lose weight — slow (~0.25 kg/week)",
  LoseWeightModerate: "Lose weight — moderate (~0.5 kg/week)",
  LoseWeightAggressive: "Lose weight — aggressive (~0.75 kg/week)",
  Maintain: "Maintain current weight",
  GainMuscleLean: "Gain muscle — lean (~0.25 kg/week)",
  GainMuscleStandard: "Gain muscle — standard (~0.5 kg/week)",
};

const ACTIVITY_LABELS = {
  Sedentary: "Sedentary (desk job, no structured exercise)",
  LightlyActive: "Lightly active (exercise 1–3 days/week)",
  ModeratelyActive: "Moderately active (exercise 3–5 days/week)",
  VeryActive: "Very active (hard exercise 6–7 days/week)",
  ExtraActive: "Extra active (hard exercise + physical job)",
};

const GOAL_OPTIONS = [
  { value: "LoseWeightSlow", label: "Lose weight — slow pace (~0.25 kg/week)" },
  { value: "LoseWeightModerate", label: "Lose weight — moderate pace (~0.5 kg/week)" },
  { value: "LoseWeightAggressive", label: "Lose weight — aggressive pace (~0.75 kg/week)" },
  { value: "Maintain", label: "Maintain current weight" },
  { value: "GainMuscleLean", label: "Gain muscle — lean pace (~0.25 kg/week)" },
  { value: "GainMuscleStandard", label: "Gain muscle — standard pace (~0.5 kg/week)" },
];

const ACTIVITY_OPTIONS = [
  { value: "Sedentary", label: "Sedentary — desk job, no structured exercise" },
  { value: "LightlyActive", label: "Lightly active — light exercise 1–3 days/week" },
  { value: "ModeratelyActive", label: "Moderately active — moderate exercise 3–5 days/week" },
  { value: "VeryActive", label: "Very active — hard exercise 6–7 days/week" },
  { value: "ExtraActive", label: "Extra active — hard exercise + physical job" },
];

const FIELD_RANGES = {
  ageYears: { min: 15, max: 100, label: "Age must be between 15 and 100." },
  weightKg: { min: 30, max: 350, label: "Weight must be between 30 and 350 kg." },
  heightCm: { min: 100, max: 250, label: "Height must be between 100 and 250 cm." },
};

function MyGoalPage() {
  const navigate = useNavigate();
  
  // Tab State: "overview" or "edit"
  const [activeTab, setActiveTab] = useState("overview");
  
  // Goal Profile and Streak States
  const [profile, setProfile] = useState(null);
  const [streaks, setStreaks] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  // Custom Nutrition Targets State
  const [dailyGoal, setDailyGoal] = useState(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customSaving, setCustomSaving] = useState(false);
  const [customForm, setCustomForm] = useState({
    caloriesTarget: "",
    proteinGramsTarget: "",
    carbohydratesGramsTarget: "",
    fatGramsTarget: ""
  });

  // Interactive Slider State (weeks to reach goal)
  const [timelineWeeks, setTimelineWeeks] = useState(8);
  
  // Editing State
  const [form, setForm] = useState({
    biologicalSex: "",
    ageYears: "",
    weightKg: "",
    heightCm: "",
    activityLevel: "",
    goalType: "",
  });
  
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const previewTimerRef = useRef(null);

  // Initial Data Fetch
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    let cancelled = false;
    try {
      const result = await getGoalProfile();
      if (!cancelled && result?.data) {
        const d = result.data;
        setProfile(d);
        setForm({
          biologicalSex: d.biologicalSex ?? "",
          ageYears: String(d.ageYears ?? ""),
          weightKg: String(d.weightKg ?? ""),
          heightCm: String(d.heightCm ?? ""),
          activityLevel: d.activityLevel ?? "",
          goalType: d.goalType ?? "",
        });
        setNotFound(false);
      }
    } catch (err) {
      if (!cancelled && err.response?.status === 404) {
        setNotFound(true);
      }
    }

    try {
      const [streakData, trendData] = await Promise.all([
        getProgressStreaks(),
        getProgressTrends(7)
      ]);
      if (!cancelled && streakData) {
        setStreaks(streakData);
      }
      if (!cancelled && trendData) {
        setTrends(trendData);
      }
    } catch {
      // Fail silently for progress stats
    }

    try {
      const dailyGoalResult = await getDailyGoal();
      if (!cancelled && dailyGoalResult?.data) {
        setDailyGoal(dailyGoalResult.data);
        const isCustom = dailyGoalResult.data.goalSource === "Custom";
        setIsCustomMode(isCustom);
        if (isCustom) {
          setCustomForm({
            caloriesTarget: Math.round(dailyGoalResult.data.caloriesTarget) ?? "",
            proteinGramsTarget: Math.round(dailyGoalResult.data.proteinGramsTarget) ?? "",
            carbohydratesGramsTarget: Math.round(dailyGoalResult.data.carbohydratesGramsTarget) ?? "",
            fatGramsTarget: Math.round(dailyGoalResult.data.fatGramsTarget) ?? ""
          });
        }
      }
    } catch {
      // Fail silently for daily goals
    }

    if (!cancelled) setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form filled validation for calculations preview
  const allFieldsFilled = useMemo(() => {
    return (
      form.biologicalSex &&
      form.ageYears !== "" &&
      form.weightKg !== "" &&
      form.heightCm !== "" &&
      form.activityLevel &&
      form.goalType
    );
  }, [form]);

  // Real-time calculation preview debouncer
  useEffect(() => {
    if (!allFieldsFilled) {
      setPreview(null);
      return;
    }

    const localErrors = collectRangeErrors(form);
    if (Object.keys(localErrors).length > 0) {
      setPreview(null);
      return;
    }

    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(async () => {
      setPreviewing(true);
      try {
        const result = await previewGoalCalculation({
          biologicalSex: form.biologicalSex,
          ageYears: Number(form.ageYears),
          weightKg: Number(form.weightKg),
          heightCm: Number(form.heightCm),
          activityLevel: form.activityLevel,
          goalType: form.goalType,
        });
        if (result?.data) setPreview(result.data);
      } catch {
        setPreview(null);
      } finally {
        setPreviewing(false);
      }
    }, 350);

    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [form, allFieldsFilled]);

  // Form Input Change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setErrorMessage("");
  };

  // Submit Goal setup / update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    const rangeErrors = collectRangeErrors(form);
    if (Object.keys(rangeErrors).length > 0) {
      setFieldErrors(rangeErrors);
      setSaving(false);
      return;
    }
    setFieldErrors({});

    try {
      const result = await saveGoalProfile({
        biologicalSex: form.biologicalSex,
        ageYears: Number(form.ageYears),
        weightKg: Number(form.weightKg),
        heightCm: Number(form.heightCm),
        activityLevel: form.activityLevel,
        goalType: form.goalType,
      });
      if (result?.data) {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
        await loadData(true); // reload silent
        setActiveTab("overview"); // switch back
      }
    } catch (err) {
      const parsed = parseServiceErrors(err, "Failed to save goal settings.");
      setErrorMessage(parsed.errorMessage);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSaving(false);
    }
  };

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    setCustomForm((prev) => ({ ...prev, [name]: value }));
  };

  const customTotalCals = useMemo(() => {
    const p = Number(customForm.proteinGramsTarget) || 0;
    const c = Number(customForm.carbohydratesGramsTarget) || 0;
    const f = Number(customForm.fatGramsTarget) || 0;
    return Math.round((p * 4) + (c * 4) + (f * 9));
  }, [customForm]);

  const handleSaveCustomGoals = async (e) => {
    e.preventDefault();
    setCustomSaving(true);
    try {
      const result = await upsertDailyGoal({
        caloriesTarget: Number(customForm.caloriesTarget),
        proteinGramsTarget: Number(customForm.proteinGramsTarget),
        carbohydratesGramsTarget: Number(customForm.carbohydratesGramsTarget),
        fatGramsTarget: Number(customForm.fatGramsTarget),
        goalSource: "Custom"
      });
      if (result?.data) {
        setDailyGoal(result.data);
        setIsCustomMode(true);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      }
    } catch (err) {
      console.error("Failed to save custom goals", err);
    } finally {
      setCustomSaving(false);
    }
  };

  const handleResetToCalculated = async () => {
    if (!window.confirm("Are you sure you want to revert to Auto Calculated targets? Your custom inputs will be lost.")) return;
    setCustomSaving(true);
    try {
      const suggestedResult = await getSuggestedGoal();
      if (suggestedResult?.data) {
        const result = await upsertDailyGoal({
          caloriesTarget: suggestedResult.data.caloriesTarget,
          proteinGramsTarget: suggestedResult.data.proteinGramsTarget,
          carbohydratesGramsTarget: suggestedResult.data.carbohydratesGramsTarget,
          fatGramsTarget: suggestedResult.data.fatGramsTarget,
          goalSource: "Calculated"
        });
        if (result?.data) {
          setDailyGoal(result.data);
          setIsCustomMode(false);
          setCustomForm({
            caloriesTarget: "",
            proteinGramsTarget: "",
            carbohydratesGramsTarget: "",
            fatGramsTarget: ""
          });
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 4000);
        }
      }
    } catch (err) {
      console.error("Failed to reset goals", err);
    } finally {
      setCustomSaving(false);
    }
  };

  // Interactive timeline weight target estimator calculations
  const timelineEstimation = useMemo(() => {
    if (!profile) return null;
    const rate = getWeeklyRate(profile.goalType);
    const weightChange = rate * timelineWeeks;
    const initialWeight = profile.weightKg;
    const estimatedWeight = initialWeight + weightChange;
    return {
      change: weightChange,
      target: estimatedWeight,
      rate: Math.abs(rate),
      direction: rate < 0 ? "loss" : rate > 0 ? "gain" : "maintain"
    };
  }, [profile, timelineWeeks]);

  // Macro calorie split percentages
  const macroSplit = useMemo(() => {
    if (!profile) return null;
    const proteinCal = Math.round(profile.dailyProteinGrams * 4);
    const carbsCal = Math.round(profile.dailyCarbsGrams * 4);
    const fatCal = Math.round(profile.dailyFatGrams * 9);
    const sumCal = proteinCal + carbsCal + fatCal;
    return {
      proteinPct: Math.round((proteinCal / sumCal) * 100),
      carbsPct: Math.round((carbsCal / sumCal) * 100),
      fatPct: Math.round((fatCal / sumCal) * 100),
      proteinCal,
      carbsCal,
      fatCal
    };
  }, [profile]);

  if (loading) {
    return (
      <PageShell eyebrow="Loading..." title="My Goal" description="Loading your personalized fitness strategy.">
        <div className="skeleton-dashboard">
          <div className="skeleton-box skeleton-header" />
          <div className="skeleton-box skeleton-widget" />
          <div className="skeleton-box skeleton-row" />
        </div>
      </PageShell>
    );
  }

  // Goal not configured empty state (only show if not currently editing/setting up)
  if ((notFound || !profile) && activeTab !== "edit") {
    return (
      <PageShell eyebrow="My Goal" title="Personal Goals" description="Plan your physical transformations.">
        <div className="mygoal-empty-panel">
          <div className="mygoal-empty-icon-ring">
            <Target size={36} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 className="mygoal-empty-title">Activate Nutrition Targets</h2>
            <p className="mygoal-empty-desc">
              Answer a few questions about your height, weight, activity and goal. We&apos;ll configure a premium macro and calorie roadmap tailored specifically for you.
            </p>
          </div>
          <button 
            className="button-primary" 
            type="button" 
            onClick={() => {
              setActiveTab("edit");
              setNotFound(false);
            }}
          >
            Configure Goal Profile
          </button>
        </div>
      </PageShell>
    );
  }

  // Formatted labels safely accessed with check for profile
  const goalLabel = profile ? (GOAL_LABELS[profile.goalType] ?? profile.goalType) : "";
  const activityLabel = profile ? (ACTIVITY_LABELS[profile.activityLevel] ?? profile.activityLevel) : "";
  const rationale = profile ? buildRationale(profile) : "";
  const adjustmentLabel = profile
    ? (profile.calorieAdjustment >= 0 ? `+${profile.calorieAdjustment}` : `${profile.calorieAdjustment}`)
    : "";

  // SVG circular target ring calculations safely fallback
  const consumedCal = 0; // standard display is target
  const targetCal = profile?.dailyCaloriesTarget ?? 2000;
  const ringRadius = 70;
  const ringCircumference = 2 * Math.PI * ringRadius;
  // Make the ring filled initially as target preview
  const ringDashoffset = 0; 

  // Smart insights recommendations dynamically generated
  const smartRecommendations = profile ? getSmartRecommendations(profile, streaks, trends) : [];

  // High-level goal category badge safely fallback
  const goalCategory = profile ? getGoalCategory(profile.goalType) : { label: "Goal Setup", badgeClass: "maintain" };

  return (
    <PageShell
      eyebrow="My Goal"
      title="Nutrition Strategy"
      description="View, calibrate, and track your daily nutrition roadmap."
    >
      <div className="mygoal-container">
        <div className="mygoal-glow-orb" />

        {/* Success Alert Toast */}
        {showSuccessToast && (
          <div className="mygoal-success-banner">
            <Check size={18} />
            <span>Success! Your physical profile and nutrition goals have been updated.</span>
          </div>
        )}

        {/* Header Tabs Navigation */}
        <nav className="mygoal-tabs">
          <button
            type="button"
            className={`mygoal-tab-btn${activeTab === "overview" ? " mygoal-tab-btn--active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Activity size={16} />
            <span>Active Goal Overview</span>
            {activeTab === "overview" && <span className="mygoal-tab-btn__indicator" />}
          </button>
          <button
            type="button"
            className={`mygoal-tab-btn${activeTab === "edit" ? " mygoal-tab-btn--active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            <Sliders size={16} />
            <span>Adjust Goal Settings</span>
            {activeTab === "edit" && <span className="mygoal-tab-btn__indicator" />}
          </button>
        </nav>

        {/* Tab 1: OVERVIEW & INSIGHTS */}
        {activeTab === "overview" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)', position: 'relative', zIndex: 1 }}>
            
            {/* Custom Targets Toggle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--sp-2)' }}>
              <div className="mygoal-segmented-control" style={{ background: 'var(--surface-2)', padding: '6px', borderRadius: 'var(--radius-lg)', display: 'inline-flex', gap: '6px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                <button
                  type="button"
                  className={`btn-segment ${!isCustomMode ? "active" : ""}`}
                  onClick={() => setIsCustomMode(false)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: !isCustomMode ? 'var(--surface)' : 'transparent',
                    color: !isCustomMode ? 'var(--text-1)' : 'var(--text-2)',
                    fontWeight: !isCustomMode ? '600' : '400',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: !isCustomMode ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.2s ease',
                    fontSize: '13px'
                  }}
                >
                  <BrainCircuit size={16} />
                  <span>Auto Calculated Goals</span>
                </button>
                <button
                  type="button"
                  className={`btn-segment ${isCustomMode ? "active" : ""}`}
                  onClick={() => {
                    setIsCustomMode(true);
                    if (!customForm.caloriesTarget) {
                      setCustomForm({
                        caloriesTarget: Math.round(dailyGoal?.caloriesTarget ?? profile?.dailyCaloriesTarget) ?? "",
                        proteinGramsTarget: Math.round(dailyGoal?.proteinGramsTarget ?? profile?.dailyProteinGrams) ?? "",
                        carbohydratesGramsTarget: Math.round(dailyGoal?.carbohydratesGramsTarget ?? profile?.dailyCarbsGrams) ?? "",
                        fatGramsTarget: Math.round(dailyGoal?.fatGramsTarget ?? profile?.dailyFatGrams) ?? ""
                      });
                    }
                  }}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isCustomMode ? 'var(--surface)' : 'transparent',
                    color: isCustomMode ? 'var(--text-1)' : 'var(--text-2)',
                    fontWeight: isCustomMode ? '600' : '400',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: isCustomMode ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.2s ease',
                    fontSize: '13px'
                  }}
                >
                  <Sliders size={16} />
                  <span>Custom Goals</span>
                </button>
              </div>
            </div>

            {isCustomMode ? (
              <article className="mygoal-card">
                <div className="mygoal-card__header">
                  <div className="mygoal-card__title-group">
                    <div className="mygoal-card__icon-box">
                      <Sliders size={18} />
                    </div>
                    <h4 className="mygoal-card__title">Custom Nutrition Targets</h4>
                  </div>
                </div>
                
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', marginBottom: 'var(--sp-4)', lineHeight: 1.5 }}>
                  Override the AI calculated targets with your own custom macro splits. Ensure your total calories align with your individual goals.
                </p>

                <form onSubmit={handleSaveCustomGoals} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                  <div className="mygoal-form-grid">
                    <div className="mygoal-input-group">
                      <label className="mygoal-input-label">
                        <Flame size={13} />
                        <span>Daily Calories (kcal)</span>
                      </label>
                      <input
                        type="number"
                        name="caloriesTarget"
                        value={customForm.caloriesTarget}
                        onChange={handleCustomChange}
                        className="mygoal-form-input"
                        required
                        min="500"
                        max="10000"
                        step="1"
                      />
                    </div>
                    <div className="mygoal-input-group">
                      <label className="mygoal-input-label">
                        <Beef size={13} />
                        <span>Protein (g)</span>
                      </label>
                      <input
                        type="number"
                        name="proteinGramsTarget"
                        value={customForm.proteinGramsTarget}
                        onChange={handleCustomChange}
                        className="mygoal-form-input"
                        required
                        min="0"
                        max="1000"
                        step="1"
                      />
                    </div>
                    <div className="mygoal-input-group">
                      <label className="mygoal-input-label">
                        <Wheat size={13} />
                        <span>Carbohydrates (g)</span>
                      </label>
                      <input
                        type="number"
                        name="carbohydratesGramsTarget"
                        value={customForm.carbohydratesGramsTarget}
                        onChange={handleCustomChange}
                        className="mygoal-form-input"
                        required
                        min="0"
                        max="1000"
                        step="1"
                      />
                    </div>
                    <div className="mygoal-input-group">
                      <label className="mygoal-input-label">
                        <Pizza size={13} />
                        <span>Fats (g)</span>
                      </label>
                      <input
                        type="number"
                        name="fatGramsTarget"
                        value={customForm.fatGramsTarget}
                        onChange={handleCustomChange}
                        className="mygoal-form-input"
                        required
                        min="0"
                        max="1000"
                        step="1"
                      />
                    </div>
                  </div>

                  <div style={{ padding: 'var(--sp-4)', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-1)', fontWeight: '600' }}>Macro Calorie Verification</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-2)' }}>4 kcal/g Protein & Carbs, 9 kcal/g Fat</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: '700', fontSize: 'var(--text-lg)', color: Math.abs(customTotalCals - customForm.caloriesTarget) > 50 ? 'var(--warning)' : 'var(--success)' }}>
                        {customTotalCals} kcal
                      </span>
                      {Math.abs(customTotalCals - customForm.caloriesTarget) > 50 && (
                        <div style={{ fontSize: '11px', color: 'var(--warning)', marginTop: '2px' }}>Differs from target</div>
                      )}
                    </div>
                  </div>

                  <div className="mygoal-form-actions" style={{ marginTop: 'var(--sp-2)' }}>
                    <button type="submit" className="button-primary" disabled={customSaving} style={{ flex: 1 }}>
                      {customSaving ? "Saving..." : "Save Custom Targets"}
                    </button>
                    <button type="button" className="button-secondary" onClick={handleResetToCalculated} disabled={customSaving}>
                      Reset to Calculated
                    </button>
                  </div>
                </form>
              </article>
            ) : (
              <>
            {/* Warning Banner if Calorie Minimum floor applied */}
            {profile.isCalorieMinimumApplied && (
              <div className="mygoal-notice-bar">
                <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Health Floor Safe-guard Applied:</strong> Your daily calorie target was automatically adjusted upward to <strong>{profile.dailyCaloriesTarget} kcal/day</strong> (safe recommended minimum baseline for your biological sex). Fat loss remains effective, but metabolic safety comes first.
                </div>
              </div>
            )}

            {/* Plan Hero Card (Goal Overview) */}
            <article className="mygoal-card mygoal-card--hero">
              <div className="mygoal-plan-hero">
                <div className="mygoal-hero-text">
                  <span className={`mygoal-pill-badge mygoal-pill-badge--${goalCategory.badgeClass}`}>
                    <Target size={12} />
                    <span>{goalCategory.label}</span>
                  </span>
                  <h3 className="mygoal-hero-title">{goalLabel}</h3>
                  <p className="mygoal-hero-description">{rationale}</p>
                  
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-sm)', color: 'var(--text-1)', fontWeight: '600' }}>
                      <Scale size={16} className="text-3" />
                      <span>{profile.weightKg} kg</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', fontWeight: '400' }}>Current</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-sm)', color: 'var(--text-1)', fontWeight: '600' }}>
                      <TrendingUp size={16} className="text-3" />
                      <span>{Math.abs(getWeeklyRate(profile.goalType))} kg/wk</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', fontWeight: '400' }}>Target Rate</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-sm)', color: 'var(--text-2)', fontWeight: '500' }}>
                      <User size={14} className="text-3" />
                      <span>{profile.biologicalSex} · {profile.ageYears} yrs · {profile.heightCm} cm</span>
                    </div>
                  </div>
                </div>

                <div className="mygoal-hero-visual">
                  <div className="mygoal-cal-ring-container">
                    <svg className="mygoal-cal-ring-svg" width="170" height="170">
                      <circle
                        className="mygoal-cal-ring-bg"
                        cx="85"
                        cy="85"
                        r={ringRadius}
                      />
                      <circle
                        className="mygoal-cal-ring-fill"
                        cx="85"
                        cy="85"
                        r={ringRadius}
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringDashoffset}
                      />
                    </svg>
                    <div className="mygoal-cal-ring-text">
                      <span className="mygoal-cal-ring-val">{Math.round(profile.dailyCaloriesTarget)}</span>
                      <span className="mygoal-cal-ring-lbl">Target kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Macro Targets split Grid */}
            <section className="mygoal-macros-grid">
              {/* Protein Card */}
              <div className="mygoal-macro-card">
                <div className="mygoal-macro-header">
                  <span className="mygoal-macro-name">
                    <span className="mygoal-macro-bullet mygoal-macro-bullet--protein" />
                    Protein
                  </span>
                  <span className="mygoal-macro-percentage">{macroSplit?.proteinPct}% kcal</span>
                </div>
                <div className="mygoal-macro-value-group">
                  <span className="mygoal-macro-g-val">{Math.round(profile.dailyProteinGrams)} g</span>
                  <span className="mygoal-macro-cal-val">{macroSplit?.proteinCal} kcal / day</span>
                </div>
                <div className="premium-macro-bar" style={{ marginTop: 'auto' }}>
                  <div className="premium-macro-bar__track" style={{ height: '4px', background: 'var(--surface-3)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div className="premium-macro-bar__fill premium-macro-bar__fill--protein" style={{ width: '100%', height: '100%', background: 'var(--macro-protein, oklch(0.609 0.176 250.9))' }} />
                  </div>
                </div>
              </div>

              {/* Carbs Card */}
              <div className="mygoal-macro-card">
                <div className="mygoal-macro-header">
                  <span className="mygoal-macro-name">
                    <span className="mygoal-macro-bullet mygoal-macro-bullet--carbs" />
                    Carbohydrates
                  </span>
                  <span className="mygoal-macro-percentage">{macroSplit?.carbsPct}% kcal</span>
                </div>
                <div className="mygoal-macro-value-group">
                  <span className="mygoal-macro-g-val">{Math.round(profile.dailyCarbsGrams)} g</span>
                  <span className="mygoal-macro-cal-val">{macroSplit?.carbsCal} kcal / day</span>
                </div>
                <div className="premium-macro-bar" style={{ marginTop: 'auto' }}>
                  <div className="premium-macro-bar__track" style={{ height: '4px', background: 'var(--surface-3)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div className="premium-macro-bar__fill premium-macro-bar__fill--carbs" style={{ width: '100%', height: '100%', background: 'var(--macro-carbs, oklch(0.580 0.140 72))' }} />
                  </div>
                </div>
              </div>

              {/* Fat Card */}
              <div className="mygoal-macro-card">
                <div className="mygoal-macro-header">
                  <span className="mygoal-macro-name">
                    <span className="mygoal-macro-bullet mygoal-macro-bullet--fat" />
                    Healthy Fats
                  </span>
                  <span className="mygoal-macro-percentage">{macroSplit?.fatPct}% kcal</span>
                </div>
                <div className="mygoal-macro-value-group">
                  <span className="mygoal-macro-g-val">{Math.round(profile.dailyFatGrams)} g</span>
                  <span className="mygoal-macro-cal-val">{macroSplit?.fatCal} kcal / day</span>
                </div>
                <div className="premium-macro-bar" style={{ marginTop: 'auto' }}>
                  <div className="premium-macro-bar__track" style={{ height: '4px', background: 'var(--surface-3)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div className="premium-macro-bar__fill premium-macro-bar__fill--fat" style={{ width: '100%', height: '100%', background: 'var(--macro-fat, oklch(0.490 0.170 25))' }} />
                  </div>
                </div>
              </div>
            </section>
              </>
            )}

            {/* Goal Progress & Motivation Center */}
            <article className="mygoal-card">
              <div className="mygoal-card__header">
                <div className="mygoal-card__title-group">
                  <div className="mygoal-card__icon-box">
                    <Award size={18} />
                  </div>
                  <h4 className="mygoal-card__title">Goal Progress & Motivation</h4>
                </div>
              </div>

              {streaks && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                  {/* Dynamic Motivational Message */}
                  <div style={{ background: 'var(--surface-2)', padding: 'var(--sp-4)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--accent)' }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-1)', fontWeight: '600', lineHeight: 1.5 }}>
                      {streaks.currentStreak > 0 
                        ? `You've logged meals and hit your targets for ${streaks.currentStreak} consecutive days. Keep this momentum going to reach your goal weight.`
                        : `Every transformation starts with day one. Log your first meal today to kickstart your progress.`}
                    </p>
                  </div>

                  <div className="mygoal-scorecard">
                    <div className="mygoal-scorecard-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="mygoal-score-icon-box mygoal-score-icon-box--streak" style={{ width: '32px', height: '32px' }}>
                          <Flame size={16} />
                        </div>
                        <span className="mygoal-score-label">Current Streak</span>
                      </div>
                      <span className="mygoal-score-value" style={{ fontSize: 'var(--text-2xl)' }}>{streaks.currentStreak} <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', fontWeight: '500' }}>days</span></span>
                      {(() => {
                        const nextMilestone = [3, 7, 14, 21, 30, 50, 100].find(m => m > streaks.currentStreak) || streaks.currentStreak + 10;
                        const daysLeft = nextMilestone - streaks.currentStreak;
                        return (
                          <div style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '4px' }}>
                            Only <strong>{daysLeft}</strong> more days to reach your {nextMilestone}-day consistency milestone.
                          </div>
                        );
                      })()}
                    </div>

                    <div className="mygoal-scorecard-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="mygoal-score-icon-box mygoal-score-icon-box--rate" style={{ width: '32px', height: '32px' }}>
                          <ThumbsUp size={16} />
                        </div>
                        <span className="mygoal-score-label">30-Day Adherence</span>
                      </div>
                      <span className="mygoal-score-value" style={{ fontSize: 'var(--text-2xl)' }}>{streaks.goalHitRate}%</span>
                      <div className="premium-macro-bar" style={{ width: '100%', marginTop: '4px' }}>
                        <div className="premium-macro-bar__track" style={{ height: '4px', background: 'var(--surface-3)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${streaks.goalHitRate}%`, height: '100%', background: 'var(--success)' }} />
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '4px' }}>
                        {streaks.goalHitRate >= 80 ? "Excellent consistency! You are on track." : "Aim for 80%+ adherence to see reliable physical changes."}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </article>

            {/* Goal Progress Section placeholder - Timeline Removed */}

            {/* Smart Recommendations Section */}
            <article className="mygoal-card">
              <div className="mygoal-card__header">
                <div className="mygoal-card__title-group">
                  <div className="mygoal-card__icon-box">
                    <Sparkles size={18} />
                  </div>
                  <h4 className="mygoal-card__title">AI Smart Coach Recommendations</h4>
                </div>
              </div>

              <div className="mygoal-rec-grid">
                {smartRecommendations.map((rec, index) => (
                  <div key={index} className="mygoal-rec-card">
                    <div className="mygoal-rec-icon-box">
                      {rec.icon}
                    </div>
                    <div className="mygoal-rec-content">
                      <span className="mygoal-rec-title">{rec.title}</span>
                      <span className="mygoal-rec-desc">{rec.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Calculations Explanation Section */}
            <section style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-4)' }}>
              <button
                type="button"
                className="mygoal-calc-toggle"
                onClick={() => setShowBreakdown((v) => !v)}
              >
                <HelpCircle size={14} />
                <span>{showBreakdown ? "Hide scientific calculation breakdown" : "How was this plan calculated?"}</span>
              </button>

              {showBreakdown && (
                <div style={{ animation: 'mygoal-fadeIn 0.2s var(--ease-out)' }}>
                  <ol className="mygoal-calc-steps">
                    <li>
                      <strong>Basal Metabolic Rate (BMR):</strong> Mifflin-St Jeor formula calculates your daily resting energy consumption at <strong>{Math.round(profile.calculatedBmr)} kcal</strong>. This represents calories burned just by staying alive.
                    </li>
                    <li>
                      <strong>Total Daily Energy Expenditure (TDEE):</strong> Factoring in your exercise activity multiplier, your estimated energy maintenance level is <strong>{Math.round(profile.calculatedTdee)} kcal</strong>. Consuming exactly this amount supports bodyweight equilibrium.
                    </li>
                    <li>
                      <strong>Goal Target Calibrations:</strong> Applying the adjustments for <strong>{goalLabel}</strong> ({adjustmentLabel} kcal deficit/surplus) results in your final target of <strong>{profile.dailyCaloriesTarget} kcal/day</strong>.
                    </li>
                    <li>
                      <strong>Macro-Nutrient Partitioning Rules:</strong> 
                      <ul>
                        <li>Protein set to {profile.goalType.includes("Lose") ? "2.0g" : profile.goalType.includes("Gain") ? "2.2g" : "1.6g"} per kg of bodyweight to maintain physical structure and support recovery.</li>
                        <li>Fats set to 30% of calorie targets (clamped with a safe physiological floor of 0.5g/kg).</li>
                        <li>Carbohydrates absorb the remaining calorie capacity to maintain intense energy reserves.</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              )}
            </section>

          </div>
        )}

        {/* Tab 2: ADJUST GOAL SETTINGS */}
        {activeTab === "edit" && (
          <div className="mygoal-edit-layout">
            
            {/* Form Column */}
            <section className="mygoal-edit-form-area">
              <form className="mygoal-card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '800', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '8px' }}>
                  Calibrate Physical Metrics
                </h3>

                <div className="mygoal-form-grid">
                  {/* Sex Selection */}
                  <div className="mygoal-input-group">
                    <label className="mygoal-input-label">
                      <User size={13} />
                      <span>Biological Sex</span>
                    </label>
                    <select 
                      name="biologicalSex" 
                      value={form.biologicalSex} 
                      onChange={handleChange} 
                      className="mygoal-form-select" 
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {fieldErrors.biologicalSex && <p className="field-error">{fieldErrors.biologicalSex}</p>}
                  </div>

                  {/* Age Input */}
                  <div className="mygoal-input-group">
                    <label className="mygoal-input-label">
                      <Clock size={13} />
                      <span>Age (Years)</span>
                    </label>
                    <input 
                      name="ageYears" 
                      type="number" 
                      min="15" 
                      max="100" 
                      value={form.ageYears} 
                      onChange={handleChange} 
                      className="mygoal-form-input" 
                      placeholder="e.g. 28"
                      required 
                    />
                    {fieldErrors.ageYears && <p className="field-error">{fieldErrors.ageYears}</p>}
                  </div>

                  {/* Weight Input */}
                  <div className="mygoal-input-group">
                    <label className="mygoal-input-label">
                      <Scale size={13} />
                      <span>Current Weight (Kg)</span>
                    </label>
                    <input 
                      name="weightKg" 
                      type="number" 
                      step="0.1" 
                      min="30" 
                      max="350" 
                      value={form.weightKg} 
                      onChange={handleChange} 
                      className="mygoal-form-input" 
                      placeholder="e.g. 78.5"
                      required 
                    />
                    {fieldErrors.weightKg && <p className="field-error">{fieldErrors.weightKg}</p>}
                  </div>

                  {/* Height Input */}
                  <div className="mygoal-input-group">
                    <label className="mygoal-input-label">
                      <Ruler size={13} />
                      <span>Height (Cm)</span>
                    </label>
                    <input 
                      name="heightCm" 
                      type="number" 
                      step="0.1" 
                      min="100" 
                      max="250" 
                      value={form.heightCm} 
                      onChange={handleChange} 
                      className="mygoal-form-input" 
                      placeholder="e.g. 175"
                      required 
                    />
                    {fieldErrors.heightCm && <p className="field-error">{fieldErrors.heightCm}</p>}
                  </div>
                </div>

                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '800', borderBottom: '1px solid var(--border)', paddingBottom: '12px', margin: '12px 0 8px 0' }}>
                  Choose Activity & Nutrition Target
                </h3>

                <div className="mygoal-input-group">
                  <label className="mygoal-input-label">
                    <Activity size={13} />
                    <span>Physical Activity Level</span>
                  </label>
                  <select 
                    name="activityLevel" 
                    value={form.activityLevel} 
                    onChange={handleChange} 
                    className="mygoal-form-select" 
                    required
                  >
                    <option value="">Select...</option>
                    {ACTIVITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {fieldErrors.activityLevel && <p className="field-error">{fieldErrors.activityLevel}</p>}
                </div>

                <div className="mygoal-input-group" style={{ marginTop: '4px' }}>
                  <label className="mygoal-input-label">
                    <Target size={13} />
                    <span>Primary Weight Goal</span>
                  </label>
                  <select 
                    name="goalType" 
                    value={form.goalType} 
                    onChange={handleChange} 
                    className="mygoal-form-select" 
                    required
                  >
                    <option value="">Select...</option>
                    {GOAL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {fieldErrors.goalType && <p className="field-error">{fieldErrors.goalType}</p>}
                </div>

                {errorMessage && (
                  <div className="mygoal-notice-bar mygoal-notice-bar--error" style={{ marginTop: '12px' }}>
                    <ShieldAlert size={16} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="mygoal-form-actions">
                  <button 
                    className="button-primary" 
                    type="submit" 
                    disabled={saving}
                    style={{ flex: 1 }}
                  >
                    {saving ? "Re-calculating..." : "Save Goal Profile"}
                  </button>
                  <button 
                    className="button-secondary" 
                    type="button" 
                    onClick={() => setActiveTab("overview")}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>

            {/* Live Preview Column */}
            <aside className="mygoal-edit-preview-area">
              <div className="mygoal-preview-card">
                <div className="mygoal-preview-header">
                  <BrainCircuit size={20} className="text-accent" />
                  <span className="mygoal-preview-title">Real-Time Plan Preview</span>
                </div>

                {preview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'mygoal-fadeIn 0.25s' }}>
                    
                    {preview.isCalorieMinimumApplied && (
                      <div className="mygoal-notice-bar" style={{ padding: '8px 12px', fontSize: '11px' }}>
                        <ShieldAlert size={14} style={{ flexShrink: 0 }} />
                        <span>Calorie target raised to safe physiological minimum of {preview.dailyCaloriesTarget} kcal.</span>
                      </div>
                    )}

                    <div className="mygoal-preview-grid">
                      <div className="mygoal-preview-item" style={{ gridColumn: 'span 2', background: 'var(--surface-2)', border: '1px solid var(--border-strong)' }}>
                        <span className="mygoal-preview-val" style={{ fontSize: 'var(--text-3xl)', color: 'var(--accent)' }}>
                          {Math.round(preview.dailyCaloriesTarget)}
                        </span>
                        <span className="mygoal-preview-lbl"> kcal / day</span>
                      </div>
                      
                      <div className="mygoal-preview-item">
                        <span className="mygoal-preview-val">{Math.round(preview.dailyProteinGrams)}g</span>
                        <span className="mygoal-preview-lbl">Protein</span>
                      </div>

                      <div className="mygoal-preview-item">
                        <span className="mygoal-preview-val">{Math.round(preview.dailyCarbsGrams)}g</span>
                        <span className="mygoal-preview-lbl">Carbs</span>
                      </div>

                      <div className="mygoal-preview-item" style={{ gridColumn: 'span 2' }}>
                        <span className="mygoal-preview-val">{Math.round(preview.dailyFatGrams)}g</span>
                        <span className="mygoal-preview-lbl">Fats</span>
                      </div>
                    </div>

                    <div className="mygoal-preview-bmr-tdee">
                      <div>Calculated BMR: <strong>{Math.round(preview.calculatedBmr)} kcal</strong></div>
                      <div>TDEE (Maintenance): <strong>{Math.round(preview.calculatedTdee)} kcal</strong></div>
                      <div>Goal Calorie Offset: <strong>{preview.calorieAdjustment >= 0 ? `+${preview.calorieAdjustment}` : preview.calorieAdjustment} kcal</strong></div>
                    </div>

                  </div>
                ) : previewing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '12px' }}>
                    <div className="spinner spinner--md" />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', fontWeight: '600' }}>
                      Re-calculating biological algorithms...
                    </span>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 'var(--text-xs)', padding: '40px 20px', lineHeight: 1.5 }}>
                    Enter all metric parameters (Sex, Age, Weight, Height, Activity, Goal) to view your dynamic mathematical breakdown.
                  </div>
                )}
              </div>
            </aside>

          </div>
        )}

      </div>
    </PageShell>
  );
}

// Helpers
function getWeeklyRate(goalType) {
  switch (goalType) {
    case "LoseWeightSlow": return -0.25;
    case "LoseWeightModerate": return -0.50;
    case "LoseWeightAggressive": return -0.75;
    case "GainMuscleLean": return 0.25;
    case "GainMuscleStandard": return 0.50;
    default: return 0.0;
  }
}

function getGoalCategory(goalType) {
  if (goalType.includes("Lose")) {
    return { label: "Fat Loss Phase", badgeClass: "lose" };
  } else if (goalType.includes("Gain")) {
    return { label: "Muscle Gain Phase", badgeClass: "gain" };
  }
  return { label: "Maintenance Phase", badgeClass: "maintain" };
}

function buildRationale(profile) {
  switch (profile.goalType) {
    case "LoseWeightSlow":
    case "LoseWeightModerate":
    case "LoseWeightAggressive":
      return `An energy deficit of ${Math.abs(profile.calorieAdjustment)} kcal/day below your daily energy expenditure level (${Math.round(profile.calculatedTdee)} kcal) supports consistent fat oxidation, while an elevated protein target preservation protects skeletal muscle mass.`;
    case "Maintain":
      return `These targets align directly with your bodyweight energy expenditure (${Math.round(profile.calculatedTdee)} kcal/day). Consuming this daily split preserves physical homeostatic balance.`;
    case "GainMuscleLean":
    case "GainMuscleStandard":
      return `A surplus of ${profile.calorieAdjustment} kcal/day above your maintenance baseline (${Math.round(profile.calculatedTdee)} kcal), integrated with a high protein target, provides the positive nitrogen balance essential for skeletal muscle hypertrophy.`;
    default:
      return "";
  }
}

function getSmartRecommendations(profile, streaks, trends) {
  const isLoss = profile.goalType.includes("Lose");
  const isGain = profile.goalType.includes("Gain");
  
  const recs = [];

  // 1. Streak / Adherence Insights (Motivation)
  if (streaks) {
    if (streaks.currentStreak >= 3) {
      recs.push({
        icon: <Flame size={18} />,
        title: "Consistency Unlocked",
        desc: `You've stayed within your calorie target for ${streaks.currentStreak} consecutive days. Keep this consistency to reach your weight goal faster.`
      });
    } else if (streaks.goalHitRate < 50 && streaks.goalHitRate > 0) {
      recs.push({
        icon: <Calendar size={18} />,
        title: "Build Your Routine",
        desc: "Your 30-day adherence is below 50%. Focus on logging your meals every day this week, even if you go slightly over targets, to build the habit."
      });
    }
  }

  // 2. Trends / Macro Insights (Data-driven)
  if (trends && trends.days && trends.days.length > 0) {
    const dataDays = trends.days.filter(d => d.hasData);
    if (dataDays.length > 0) {
      const avgProtein = dataDays.reduce((sum, d) => sum + d.protein, 0) / dataDays.length;
      const proteinDiff = profile.dailyProteinGrams - avgProtein;

      if (proteinDiff >= 15) {
        recs.push({
          icon: <Beef size={18} />,
          title: "Protein Gap Detected",
          desc: `You're consistently missing your protein target by ~${Math.round(proteinDiff)}g. Adding a serving of Greek yogurt, eggs, or whey isolate could close this gap and protect muscle tissue.`
        });
      } else if (proteinDiff <= 0 && avgProtein > 0) {
        recs.push({
          icon: <Check size={18} />,
          title: "Protein Target Mastered",
          desc: `Excellent! You are consistently hitting your ${Math.round(profile.dailyProteinGrams)}g protein target. This provides optimal structural support for your physical goals.`
        });
      }

      const avgCalories = dataDays.reduce((sum, d) => sum + d.calories, 0) / dataDays.length;
      const calDiff = avgCalories - profile.dailyCaloriesTarget;
      
      if (isLoss && calDiff > 150) {
        recs.push({
          icon: <Activity size={18} />,
          title: "Calorie Surplus Warning",
          desc: `Over the last ${dataDays.length} logged days, you're averaging ~${Math.round(calDiff)} kcal over your target. Try reducing liquid calories or snack sizes to return to a deficit.`
        });
      } else if (isGain && calDiff < -150) {
        recs.push({
          icon: <TrendingUp size={18} />,
          title: "Increase Caloric Intake",
          desc: `You are averaging ~${Math.round(Math.abs(calDiff))} kcal below your hypertrophy surplus target. Consider adding dense foods like nuts, olive oil, or whole milk.`
        });
      }
    }
  }

  // 3. Fallback generic, but specific to goal phase
  if (recs.length < 3) {
    if (isLoss && !recs.find(r => r.title === "High-Volume Glycogen Support")) {
      recs.push({
        icon: <Wheat size={18} />,
        title: "High-Volume Satiety",
        desc: "To manage hunger during a calorie deficit, prioritize high-volume fibers like brown rice, oats, and leafy greens. They ensure maximum satiety without excessive calories."
      });
    } else if (isGain && !recs.find(r => r.title === "Progressive Overload")) {
      recs.push({
        icon: <TrendingUp size={18} />,
        title: "Hypertrophy Progression",
        desc: "Combined with this nutritional surplus, ensure progressive overload during your weight training. Track strength gains along with bodyweight targets for clean lean tissue accumulation."
      });
    } else if (!isLoss && !isGain && !recs.find(r => r.title === "Dietary Variety")) {
      recs.push({
        icon: <Pizza size={18} />,
        title: "Dietary Variety and Balance",
        desc: "With balanced maintenance targets, enjoy nutritional flexibility. Allocate fat allowances for cognitive performance through flaxseeds, walnuts, and fatty fish."
      });
    }
  }

  return recs.slice(0, 3); // Max 3 cards so it's not overwhelming
}

function collectRangeErrors(form) {
  const errors = {};
  for (const [name, range] of Object.entries(FIELD_RANGES)) {
    const v = Number(form[name]);
    if (form[name] !== "" && (Number.isNaN(v) || v < range.min || v > range.max)) {
      errors[name] = range.label;
    }
  }
  return errors;
}

export default MyGoalPage;
