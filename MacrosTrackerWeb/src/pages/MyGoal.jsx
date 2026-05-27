import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { getGoalProfile } from "../api/userGoalProfileClient";

const GOAL_LABELS = {
  LoseWeightSlow: "Lose weight — slow pace (~0.25 kg/week)",
  LoseWeightModerate: "Lose weight — moderate pace (~0.5 kg/week)",
  LoseWeightAggressive: "Lose weight — aggressive pace (~0.75 kg/week)",
  Maintain: "Maintain current weight",
  GainMuscleLean: "Gain muscle — lean (~0.25 kg/week)",
  GainMuscleStandard: "Gain muscle — standard (~0.5 kg/week)",
};

const ACTIVITY_LABELS = {
  Sedentary: "Sedentary",
  LightlyActive: "Lightly active",
  ModeratelyActive: "Moderately active",
  VeryActive: "Very active",
  ExtraActive: "Extra active",
};

function MyGoalPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await getGoalProfile();
        if (!cancelled && result?.data) {
          setProfile(result.data);
        }
      } catch (err) {
        if (!cancelled && err.response?.status === 404) {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <PageShell eyebrow="Loading..." title="My Goal" description="Loading your nutrition plan.">
        <p />
      </PageShell>
    );
  }

  if (notFound || !profile) {
    return (
      <PageShell eyebrow="My Goal" title="No goal set yet" description="Set your goal to get a personalised nutrition plan.">
        <button className="button-primary" type="button" onClick={() => navigate("/goal-setup")}>
          Set up your goal
        </button>
      </PageShell>
    );
  }

  const goalLabel = GOAL_LABELS[profile.goalType] ?? profile.goalType;
  const activityLabel = ACTIVITY_LABELS[profile.activityLevel] ?? profile.activityLevel;
  const rationale = buildRationale(profile);
  const adjustmentLabel = profile.calorieAdjustment >= 0
    ? `+${profile.calorieAdjustment}`
    : `${profile.calorieAdjustment}`;

  return (
    <PageShell
      eyebrow="My Goal"
      title="Your Nutrition Plan"
      description={goalLabel}
    >
      {profile.isCalorieMinimumApplied && (
        <div className="goal-warning">
          Your calorie target has been raised to the safe minimum of {profile.dailyCaloriesTarget} kcal/day.
        </div>
      )}

      <div className="goal-target-grid">
        <div className="goal-target-card">
          <span className="goal-target-card__value">{profile.dailyCaloriesTarget}</span>
          <span className="goal-target-card__label">kcal / day</span>
        </div>
        <div className="goal-target-card">
          <span className="goal-target-card__value">{profile.dailyProteinGrams} g</span>
          <span className="goal-target-card__label">Protein</span>
        </div>
        <div className="goal-target-card">
          <span className="goal-target-card__value">{profile.dailyCarbsGrams} g</span>
          <span className="goal-target-card__label">Carbs</span>
        </div>
        <div className="goal-target-card">
          <span className="goal-target-card__value">{profile.dailyFatGrams} g</span>
          <span className="goal-target-card__label">Fat</span>
        </div>
      </div>

      <p className="goal-rationale">{rationale}</p>

      <div className="goal-actions">
        <Link className="button-primary" to="/goal-setup">Edit Goal</Link>
      </div>

      <section className="goal-breakdown">
        <button
          type="button"
          className="button-link goal-breakdown__toggle"
          onClick={() => setShowBreakdown((v) => !v)}
          aria-expanded={showBreakdown}
        >
          {showBreakdown ? "Hide" : "How was this calculated?"}
        </button>

        {showBreakdown && (
          <ol className="goal-breakdown__steps">
            <li>Your BMR (base metabolic rate): {Math.round(profile.calculatedBmr)} kcal</li>
            <li>With activity level <strong>{activityLabel}</strong>: {Math.round(profile.calculatedTdee)} kcal (TDEE)</li>
            <li>Goal adjustment (<strong>{goalLabel}</strong>): {adjustmentLabel} kcal</li>
            <li>Daily target: <strong>{profile.dailyCaloriesTarget} kcal</strong></li>
            {profile.isCalorieMinimumApplied && (
              <li className="goal-breakdown__note">
                A safe minimum floor was applied — the raw calculation fell below the recommended {profile.biologicalSex === "Male" ? "1500" : "1200"} kcal/day floor for your biological sex.
              </li>
            )}
          </ol>
        )}
      </section>
    </PageShell>
  );
}

function buildRationale(profile) {
  switch (profile.goalType) {
    case "LoseWeightSlow":
    case "LoseWeightModerate":
    case "LoseWeightAggressive":
      return `A calorie deficit of ${Math.abs(profile.calorieAdjustment)} kcal/day below your maintenance level (${Math.round(profile.calculatedTdee)} kcal) supports steady fat loss while higher protein helps preserve lean mass.`;
    case "Maintain":
      return `These targets match your estimated maintenance calories (${Math.round(profile.calculatedTdee)} kcal/day) with balanced macros.`;
    case "GainMuscleLean":
    case "GainMuscleStandard":
      return `A calorie surplus of ${profile.calorieAdjustment} kcal/day above your maintenance level (${Math.round(profile.calculatedTdee)} kcal) with elevated protein supports muscle growth.`;
    default:
      return "";
  }
}

export default MyGoalPage;
