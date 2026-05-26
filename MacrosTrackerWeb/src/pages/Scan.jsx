import { useState, useRef } from "react";
import PageShell from "../components/PageShell";
import ScanResultCard from "../components/ScanResultCard";
import MealTypeSelector from "../components/MealTypeSelector";
import FoodSearchPanel from "../components/FoodSearchPanel";
import { analyzeFood, logMeal } from "../api/foodScanClient";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const previewImg = {
  width: "100%",
  maxHeight: 280,
  objectFit: "cover",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.1)",
  display: "block",
  marginBottom: 16,
};

const uploadArea = {
  padding: "28px 24px",
  border: "2px dashed rgba(255,255,255,0.16)",
  borderRadius: 18,
  textAlign: "center",
  cursor: "pointer",
  marginBottom: 16,
};

const hiddenInput = { display: "none" };

const spinnerStyle = {
  display: "inline-block",
  width: 20,
  height: 20,
  border: "2px solid rgba(255,255,255,0.15)",
  borderTopColor: "#f6c567",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
  marginRight: 10,
  verticalAlign: "middle",
};

const errorBox = {
  padding: "12px 16px",
  borderRadius: 12,
  background: "rgba(253,164,175,0.1)",
  border: "1px solid rgba(253,164,175,0.25)",
  color: "#fda4af",
  fontSize: "0.9rem",
  marginBottom: 16,
};

const successBox = {
  padding: "16px 20px",
  borderRadius: 14,
  background: "rgba(134,239,172,0.1)",
  border: "1px solid rgba(134,239,172,0.25)",
  color: "#86efac",
  fontWeight: 600,
  marginBottom: 20,
  textAlign: "center",
};

const divider = {
  margin: "28px 0",
  borderColor: "rgba(255,255,255,0.1)",
};

const linkButton = {
  background: "none",
  border: "none",
  padding: 0,
  color: "#f6c567",
  cursor: "pointer",
  textDecoration: "underline",
  font: "inherit",
};

const muted = { color: "rgba(247,244,236,0.65)", fontSize: "0.9rem" };

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
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <PageShell
        eyebrow="Core Flow"
        title="Scan a meal"
        description="Take a photo of your food to get instant calorie and macro information."
      >
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => setView("scan")}
            className={view === "scan" ? "button-primary" : "button-secondary"}
            style={{ fontSize: "0.9rem", minHeight: 40, padding: "0 18px" }}
          >
            Scan food
          </button>
          <button
            type="button"
            onClick={() => setView("search")}
            className={view === "search" ? "button-primary" : "button-secondary"}
            style={{ fontSize: "0.9rem", minHeight: 40, padding: "0 18px" }}
          >
            Search manually
          </button>
        </div>

        {view === "scan" && (
          <div>
            {logSuccess && (
              <div style={successBox}>
                Meal logged ✓ — great work!{" "}
                <button type="button" style={{ ...linkButton, color: "#86efac" }} onClick={handleDismiss}>
                  Scan another
                </button>
              </div>
            )}

            {!result && !logSuccess && (
              <>
                {previewUrl ? (
                  <img src={previewUrl} alt="Food preview" style={previewImg} />
                ) : (
                  <div
                    style={uploadArea}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  >
                    <div style={{ fontSize: "2.4rem", marginBottom: 8 }}>📷</div>
                    <p style={{ ...muted, margin: 0 }}>
                      Tap to select a photo or use your camera
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={hiddenInput}
                  onChange={handleFileChange}
                />

                {fileError && <div style={errorBox}>{fileError}</div>}

                {analyzeError && (
                  <div style={errorBox}>
                    {analyzeError}
                    {isServiceDown && (
                      <>
                        {" "}
                        <button type="button" style={linkButton} onClick={handleSearchManually}>
                          Search manually instead
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                  <button
                    type="button"
                    className="button-primary"
                    onClick={handleAnalyze}
                    disabled={!file || isAnalyzing}
                    style={{ opacity: !file || isAnalyzing ? 0.5 : 1 }}
                  >
                    {isAnalyzing && <span style={spinnerStyle} />}
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

                <hr style={divider} />
                <p style={muted}>
                  Not getting good results?{" "}
                  <button type="button" style={linkButton} onClick={handleSearchManually}>
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
                  <div style={{ marginTop: 24 }}>
                    <p style={{ margin: "0 0 12px", fontWeight: 600 }}>Select meal type</p>
                    <MealTypeSelector
                      selected={selectedMealType}
                      onSelect={setSelectedMealType}
                    />

                    {logError && (
                      <p style={{ color: "#fda4af", fontSize: "0.9rem", marginTop: 12 }}>
                        {logError}
                      </p>
                    )}

                    <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                      <button
                        type="button"
                        className="button-primary"
                        onClick={handleConfirmLog}
                        disabled={!selectedMealType || isLogging}
                        style={{ opacity: !selectedMealType || isLogging ? 0.5 : 1 }}
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
            <hr style={divider} />
            <p style={muted}>
              Have a photo?{" "}
              <button type="button" style={linkButton} onClick={() => setView("scan")}>
                Scan your meal instead
              </button>
            </p>
          </div>
        )}
      </PageShell>
    </>
  );
}

export default ScanPage;
