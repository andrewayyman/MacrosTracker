import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { getGoalProfile, saveGoalProfile, previewGoalCalculation } from "../api/userGoalProfileClient";
import { useAuthStore } from "../store/authStore";
import { parseServiceErrors } from "../utils/serviceErrors";

const ACTIVITY_OPTIONS = [
  { value: "Sedentary", label: "Sedentary — desk job, no structured exercise" },
  { value: "LightlyActive", label: "Lightly active — light exercise 1–3 days/week" },
  { value: "ModeratelyActive", label: "Moderately active — moderate exercise 3–5 days/week" },
  { value: "VeryActive", label: "Very active — hard exercise 6–7 days/week" },
  { value: "ExtraActive", label: "Extra active — hard exercise + physical job" },
];

const GOAL_OPTIONS = [
  { value: "LoseWeightSlow", label: "Lose weight — slow (~0.25 kg/week)" },
  { value: "LoseWeightModerate", label: "Lose weight — moderate (~0.5 kg/week)" },
  { value: "LoseWeightAggressive", label: "Lose weight — aggressive (~0.75 kg/week)" },
  { value: "Maintain", label: "Maintain current weight" },
  { value: "GainMuscleLean", label: "Gain muscle — lean (~0.25 kg/week)" },
  { value: "GainMuscleStandard", label: "Gain muscle — standard (~0.5 kg/week)" },
];

const FIELD_RANGES = {
  ageYears: { min: 15, max: 100, label: "Age must be between 15 and 100." },
  weightKg: { min: 30, max: 350, label: "Weight must be between 30 and 350 kg." },
  heightCm: { min: 100, max: 250, label: "Height must be between 100 and 250 cm." },
};

function GoalSetupPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const [form, setForm] = useState({
    biologicalSex: user?.gender === "Female" ? "Female" : user?.gender === "Male" ? "Male" : "",
    ageYears: user?.age != null ? String(user.age) : "",
    weightKg: user?.weightKg != null ? String(user.weightKg) : "",
    heightCm: user?.heightCm != null ? String(user.heightCm) : "",
    activityLevel: "",
    goalType: "",
  });
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const previewTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const existing = await getGoalProfile();
        if (!cancelled && existing?.data) {
          const d = existing.data;
          setHasExistingProfile(true);
          setForm({
            biologicalSex: d.biologicalSex ?? "",
            ageYears: String(d.ageYears ?? ""),
            weightKg: String(d.weightKg ?? ""),
            heightCm: String(d.heightCm ?? ""),
            activityLevel: d.activityLevel ?? "",
            goalType: d.goalType ?? "",
          });
        }
      } catch {
        // 404 — no profile yet; keep pre-populated values from user store
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

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
        const result = await previewGoalCalculation(buildPayload(form));
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setErrorMessage("");
  };

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
      const result = await saveGoalProfile(buildPayload(form));
      if (result?.data) {
        if (user) {
          setAuth(
            { ...user, setupStatus: "ProfileCompleted" },
            accessToken,
            refreshToken,
          );
        }
        navigate(hasExistingProfile ? "/my-goal" : "/dashboard", { replace: true });
      }
    } catch (err) {
      const parsed = parseServiceErrors(err, "Failed to save goal profile.");
      setErrorMessage(parsed.errorMessage);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(hasExistingProfile ? "/my-goal" : "/dashboard");
  };

  if (loading) {
    return (
      <PageShell eyebrow="Loading..." title="Goal Setup" description="Preparing your nutrition planner.">
        <p />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow={hasExistingProfile ? "Edit goal" : "Step 2 of 2"}
      title={hasExistingProfile ? "Edit Your Goal" : "Set Your Nutrition Goal"}
      description="Answer a few questions and we'll calculate a personalised daily calorie and macro plan."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Biological sex
          <select name="biologicalSex" value={form.biologicalSex} onChange={handleChange} required>
            <option value="">Select…</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {fieldErrors.biologicalSex && <p className="field-error">{fieldErrors.biologicalSex}</p>}
        </label>

        <label>
          Age (years)
          <input name="ageYears" type="number" min="15" max="100" value={form.ageYears} onChange={handleChange} required />
          {fieldErrors.ageYears && <p className="field-error">{fieldErrors.ageYears}</p>}
        </label>

        <label>
          Weight (kg)
          <input name="weightKg" type="number" step="0.1" min="30" max="350" value={form.weightKg} onChange={handleChange} required />
          {fieldErrors.weightKg && <p className="field-error">{fieldErrors.weightKg}</p>}
        </label>

        <label>
          Height (cm)
          <input name="heightCm" type="number" step="0.1" min="100" max="250" value={form.heightCm} onChange={handleChange} required />
          {fieldErrors.heightCm && <p className="field-error">{fieldErrors.heightCm}</p>}
        </label>

        <label>
          Activity level
          <select name="activityLevel" value={form.activityLevel} onChange={handleChange} required>
            <option value="">Select…</option>
            {ACTIVITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {fieldErrors.activityLevel && <p className="field-error">{fieldErrors.activityLevel}</p>}
        </label>

        <label>
          Goal
          <select name="goalType" value={form.goalType} onChange={handleChange} required>
            <option value="">Select…</option>
            {GOAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {fieldErrors.goalType && <p className="field-error">{fieldErrors.goalType}</p>}
        </label>

        {preview && (
          <div className="goal-preview">
            <h3 className="goal-preview__title">Your calculated plan</h3>
            {preview.isCalorieMinimumApplied && (
              <p className="goal-preview__notice">
                Your calorie target was raised to the safe minimum of {preview.dailyCaloriesTarget} kcal/day.
              </p>
            )}
            <ul className="goal-preview__grid">
              <li><strong>{preview.dailyCaloriesTarget}</strong> kcal</li>
              <li><strong>{preview.dailyProteinGrams}</strong> g protein</li>
              <li><strong>{preview.dailyCarbsGrams}</strong> g carbs</li>
              <li><strong>{preview.dailyFatGrams}</strong> g fat</li>
            </ul>
            <p className="goal-preview__intermediate">
              BMR: {Math.round(preview.calculatedBmr)} kcal · TDEE: {Math.round(preview.calculatedTdee)} kcal ·
              Adjustment: {preview.calorieAdjustment >= 0 ? `+${preview.calorieAdjustment}` : preview.calorieAdjustment} kcal
            </p>
          </div>
        )}

        {previewing && !preview && <p className="goal-preview__loading">Calculating…</p>}

        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <div className="auth-form__actions">
          <button className="button-primary auth-submit" type="submit" disabled={saving}>
            {saving ? "Saving..." : hasExistingProfile ? "Save Changes" : "Save Goal"}
          </button>
          <button className="button-secondary" type="button" onClick={handleCancel} disabled={saving}>
            Cancel
          </button>
        </div>
      </form>
    </PageShell>
  );
}

function buildPayload(form) {
  return {
    biologicalSex: form.biologicalSex,
    ageYears: Number(form.ageYears),
    weightKg: Number(form.weightKg),
    heightCm: Number(form.heightCm),
    activityLevel: form.activityLevel,
    goalType: form.goalType,
  };
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

export default GoalSetupPage;
