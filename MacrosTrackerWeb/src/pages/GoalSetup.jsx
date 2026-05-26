import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { getDailyGoal, getSuggestedGoal, upsertDailyGoal } from "../api/nutritionGoalsClient";
import { useAuthStore } from "../store/authStore";
import { parseServiceErrors } from "../utils/serviceErrors";

function GoalSetupPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const [form, setForm] = useState({
    caloriesTarget: "",
    proteinGramsTarget: "",
    carbohydratesGramsTarget: "",
    fatGramsTarget: "",
  });
  const [goalSource, setGoalSource] = useState("Suggested");
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [existing, suggested] = await Promise.allSettled([
          getDailyGoal(),
          getSuggestedGoal(),
        ]);

        if (!cancelled) {
          if (existing.status === "fulfilled" && existing.value.data) {
            const d = existing.value.data;
            setForm({
              caloriesTarget: String(d.caloriesTarget),
              proteinGramsTarget: String(d.proteinGramsTarget),
              carbohydratesGramsTarget: String(d.carbohydratesGramsTarget),
              fatGramsTarget: String(d.fatGramsTarget),
            });
          } else if (suggested.status === "fulfilled" && suggested.value.data) {
            const s = suggested.value.data;
            setForm({
              caloriesTarget: String(s.caloriesTarget),
              proteinGramsTarget: String(s.proteinGramsTarget),
              carbohydratesGramsTarget: String(s.carbohydratesGramsTarget),
              fatGramsTarget: String(s.fatGramsTarget),
            });
            setGoalSource("Suggested");
          }
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setGoalSource("Custom");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      const payload = {
        caloriesTarget: Number(form.caloriesTarget),
        proteinGramsTarget: Number(form.proteinGramsTarget),
        carbohydratesGramsTarget: Number(form.carbohydratesGramsTarget),
        fatGramsTarget: Number(form.fatGramsTarget),
        goalSource,
      };

      const result = await upsertDailyGoal(payload);

      if (result.data) {
        setAuth(
          { ...user, setupStatus: "ProfileCompleted" },
          accessToken,
          refreshToken,
        );
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const parsed = parseServiceErrors(err, "Failed to save daily goal.");
      setErrorMessage(parsed.errorMessage);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageShell eyebrow="Loading..." title="Goal Setup" description="Loading your nutrition targets."><p /></PageShell>;
  }

  return (
    <PageShell
      eyebrow="Step 2 of 2"
      title="Daily Nutrition Goals"
      description="Review the suggested targets or enter your own. These will drive your daily tracking."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Calories (kcal)
          <input name="caloriesTarget" type="number" value={form.caloriesTarget} onChange={handleChange} required />
          {fieldErrors.caloriesTarget && <p className="field-error">{fieldErrors.caloriesTarget}</p>}
        </label>
        <label>
          Protein (g)
          <input name="proteinGramsTarget" type="number" step="0.1" value={form.proteinGramsTarget} onChange={handleChange} required />
          {fieldErrors.proteinGramsTarget && <p className="field-error">{fieldErrors.proteinGramsTarget}</p>}
        </label>
        <label>
          Carbohydrates (g)
          <input name="carbohydratesGramsTarget" type="number" step="0.1" value={form.carbohydratesGramsTarget} onChange={handleChange} required />
          {fieldErrors.carbohydratesGramsTarget && <p className="field-error">{fieldErrors.carbohydratesGramsTarget}</p>}
        </label>
        <label>
          Fat (g)
          <input name="fatGramsTarget" type="number" step="0.1" value={form.fatGramsTarget} onChange={handleChange} required />
          {fieldErrors.fatGramsTarget && <p className="field-error">{fieldErrors.fatGramsTarget}</p>}
        </label>
        {errorMessage && <p className="form-error">{errorMessage}</p>}
        <button className="button-primary auth-submit" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Daily Goal"}
        </button>
      </form>
    </PageShell>
  );
}

export default GoalSetupPage;
