import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { getProfile, upsertProfile } from "../api/profileClient";
import { useAuthStore } from "../store/authStore";
import { parseServiceErrors } from "../utils/serviceErrors";

function ProfileSetupPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    weightKg: "",
    heightCm: "",
    age: "",
    gender: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await getProfile();
        if (!cancelled && result.data) {
          const d = result.data;
          setForm({
            firstName: d.firstName ?? "",
            lastName: d.lastName ?? "",
            weightKg: d.weightKg != null ? String(d.weightKg) : "",
            heightCm: d.heightCm != null ? String(d.heightCm) : "",
            age: d.age != null ? String(d.age) : "",
            gender: d.gender ?? "",
          });
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName || null,
        weightKg: Number(form.weightKg),
        heightCm: Number(form.heightCm),
        age: Number(form.age),
        gender: form.gender,
      };

      const result = await upsertProfile(payload);

      if (result.data) {
        setAuth(
          { ...user, setupStatus: result.data.setupStatus },
          accessToken,
          refreshToken,
        );
        navigate("/goal-setup", { replace: true });
      }
    } catch (err) {
      const parsed = parseServiceErrors(err, "Failed to save profile.");
      setErrorMessage(parsed.errorMessage);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageShell eyebrow="Loading..." title="Profile Setup" description="Fetching your current profile."><p /></PageShell>;
  }

  return (
    <PageShell
      eyebrow="Step 1 of 2"
      title="Profile Setup"
      description="Enter your body metrics so we can personalize your nutrition targets."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          First name
          <input name="firstName" value={form.firstName} onChange={handleChange} required />
          {fieldErrors.firstName && <p className="field-error">{fieldErrors.firstName}</p>}
        </label>
        <label>
          Last name
          <input name="lastName" value={form.lastName} onChange={handleChange} />
          {fieldErrors.lastName && <p className="field-error">{fieldErrors.lastName}</p>}
        </label>
        <label>
          Weight (kg)
          <input name="weightKg" type="number" step="0.1" value={form.weightKg} onChange={handleChange} required />
          {fieldErrors.weightKg && <p className="field-error">{fieldErrors.weightKg}</p>}
        </label>
        <label>
          Height (cm)
          <input name="heightCm" type="number" step="0.1" value={form.heightCm} onChange={handleChange} required />
          {fieldErrors.heightCm && <p className="field-error">{fieldErrors.heightCm}</p>}
        </label>
        <label>
          Age
          <input name="age" type="number" value={form.age} onChange={handleChange} required />
          {fieldErrors.age && <p className="field-error">{fieldErrors.age}</p>}
        </label>
        <label>
          Gender
          <select name="gender" value={form.gender} onChange={handleChange} required>
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {fieldErrors.gender && <p className="field-error">{fieldErrors.gender}</p>}
        </label>
        {errorMessage && <p className="form-error">{errorMessage}</p>}
        <button className="button-primary auth-submit" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </PageShell>
  );
}

export default ProfileSetupPage;
