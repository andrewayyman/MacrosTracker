import { useState, useRef } from "react";
import PageShell from "../components/PageShell";
import ScanResultCard from "../components/ScanResultCard";
import MealTypeSelector from "../components/MealTypeSelector";
import FoodSearchPanel from "../components/FoodSearchPanel";
import { analyzeFood, logMeal } from "../api/foodScanClient";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function ScanPage() {
  const [view, setView] = useState("scan");

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [isServiceDown, setIsServiceDown] = useState(false);
  const [result, setResult] = useState(null);

  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const [logError, setLogError] = useState(null);
  const [logSuccess, setLogSuccess] = useState(false);

  const prevUrlRef = useRef(null);
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    setFileError(null);
    setAnalyzeError(null);
    setIsServiceDown(false);
    setResult(null);
    setShowLogForm(false);
    setLogSuccess(false);
    setLogError(null);

    if (f.size > MAX_SIZE_BYTES) {
      setFileError("File is too large. Maximum size is 10 MB.");
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError("Unsupported file type. Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }

    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    const url = URL.createObjectURL(f);
    prevUrlRef.current = url;
    setFile(f);
    setPreviewUrl(url);
  }

  async function handleAnalyze() {
    if (!file) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);
    setIsServiceDown(false);
    setResult(null);
    setShowLogForm(false);
    setLogSuccess(false);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await analyzeFood(formData);
      setResult(res.data.data);
    } catch (err) {
      if (err.response?.status === 503) {
        setIsServiceDown(true);
        setAnalyzeError("AI service is temporarily unavailable.");
      } else {
        setAnalyzeError(
          err.response?.data?.message ?? "Failed to analyze the image. Please try again.",
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleConfirmLog() {
    if (!result || !selectedMealType) return;
    setIsLogging(true);
    setLogError(null);

    try {
      await logMeal({
        foodName: result.foodName,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        servingSizeGrams: result.servingSizeGrams ?? null,
        mealType: selectedMealType,
        foodScanId: result.scanId ?? null,
        localFoodItemId: result.localFoodItemId ?? null,
      });
      setLogSuccess(true);
      setShowLogForm(false);
      setResult(null);
    } catch (err) {
      setLogError(
        err.response?.data?.message ?? "Failed to log the meal. Please try again.",
      );
    } finally {
      setIsLogging(false);
    }
  }

  function handleDismiss() {
    setResult(null);
    setShowLogForm(false);
    setSelectedMealType(null);
    setLogError(null);
    setLogSuccess(false);
    setAnalyzeError(null);
    setIsServiceDown(false);
    setFile(null);
    setPreviewUrl(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSearchManually() {
    setView("search");
  }

  return (
    <PageShell
      eyebrow="Core Flow"
      title="Scan a meal"
      description="Take a photo of your food to get instant calorie and macro information."
    >
      <div className="tab-row">
        <button
          type="button"
          onClick={() => setView("scan")}
          className={`tab-btn${view === "scan" ? " tab-btn--active" : ""}`}
        >
          Scan food
        </button>
        <button
          type="button"
          onClick={() => setView("search")}
          className={`tab-btn${view === "search" ? " tab-btn--active" : ""}`}
        >
          Search manually
        </button>
      </div>

      {view === "scan" && (
        <div>
          {logSuccess && (
            <div className="alert alert--success">
              Meal logged — great work!{" "}
              <button
                type="button"
                className="link-btn"
                onClick={handleDismiss}
                style={{ color: "var(--success)" }}
              >
                Scan another
              </button>
            </div>
          )}

          {!result && !logSuccess && (
            <>
              {previewUrl ? (
                <img src={previewUrl} alt="Food preview" className="preview-img" />
              ) : (
                <div
                  className="upload-area"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                >
                  <div className="upload-area__icon">📷</div>
                  <p className="upload-area__hint">Tap to select a photo or use your camera</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              {fileError && <div className="alert alert--error">{fileError}</div>}

              {analyzeError && (
                <div className="alert alert--error">
                  {analyzeError}
                  {isServiceDown && (
                    <>{" "}<button type="button" className="link-btn" onClick={handleSearchManually}>
                      Search manually instead
                    </button></>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: "var(--sp-3)", flexWrap: "wrap", marginBottom: "var(--sp-4)" }}>
                <button
                  type="button"
                  className="button-primary"
                  onClick={handleAnalyze}
                  disabled={!file || isAnalyzing}
                >
                  {isAnalyzing && <span className="spinner" />}
                  {isAnalyzing ? "Analyzing your meal…" : "Analyze"}
                </button>
                {previewUrl && (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change photo
                  </button>
                )}
              </div>

              <hr className="divider" />
              <p className="text-muted">
                Not getting good results?{" "}
                <button type="button" className="link-btn" onClick={handleSearchManually}>
                  Search manually instead
                </button>
              </p>
            </>
          )}

          {result && !logSuccess && (
            <>
              <ScanResultCard
                result={result}
                onLog={() => setShowLogForm(true)}
                onDismiss={handleDismiss}
                onSearchManually={handleSearchManually}
              />

              {showLogForm && (
                <div style={{ marginTop: "var(--sp-6)" }}>
                  <p style={{ margin: "0 0 var(--sp-3)", fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-1)" }}>
                    Select meal type
                  </p>
                  <MealTypeSelector
                    selected={selectedMealType}
                    onSelect={setSelectedMealType}
                  />

                  {logError && (
                    <div className="alert alert--error" style={{ marginTop: "var(--sp-3)" }}>{logError}</div>
                  )}

                  <div style={{ display: "flex", gap: "var(--sp-3)", marginTop: "var(--sp-5)" }}>
                    <button
                      type="button"
                      className="button-primary"
                      onClick={handleConfirmLog}
                      disabled={!selectedMealType || isLogging}
                    >
                      {isLogging ? "Logging…" : "Confirm & Log"}
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => {
                        setShowLogForm(false);
                        setSelectedMealType(null);
                        setLogError(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {view === "search" && (
        <div>
          <FoodSearchPanel />
          <hr className="divider" />
          <p className="text-muted">
            Have a photo?{" "}
            <button type="button" className="link-btn" onClick={() => setView("scan")}>
              Scan your meal instead
            </button>
          </p>
        </div>
      )}
    </PageShell>
  );
}

export default ScanPage;
