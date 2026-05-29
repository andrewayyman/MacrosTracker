import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  Scale,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  Beef,
  Wheat,
  Flame,
  Search,
  Clock,
  Coffee,
  Sun,
  Sunset,
  Apple
} from "lucide-react";

import PageShell from "../components/PageShell";
import FoodSearchPanel from "../components/FoodSearchPanel";
import { analyzeFood, logMeal } from "../api/foodScanClient";
import { getRecentFoods } from "../api/nutritionLogClient";
import "./Scan.css";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function ScanPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState("scan");

  // File Upload State
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [isServiceDown, setIsServiceDown] = useState(false);
  const [result, setResult] = useState(null);
  const [scanTime, setScanTime] = useState("");

  // Adjustment & Logging State
  const [quantity, setQuantity] = useState(100);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const [logError, setLogError] = useState(null);
  const [logSuccess, setLogSuccess] = useState(false);

  const prevUrlRef = useRef(null);
  const fileInputRef = useRef(null);

  // Query: Scan/Log History Shortcut
  const { data: recentFoods } = useQuery({
    queryKey: ["recent-foods"],
    queryFn: getRecentFoods,
    staleTime: 5000,
  });

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  // Process File Selection
  function processFile(f) {
    if (!f) return;

    setFileError(null);
    setAnalyzeError(null);
    setIsServiceDown(false);
    setResult(null);
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

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    processFile(f);
  }

  // Drag & Drop Handlers
  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    processFile(f);
  }

  // API Call: Analyze food
  async function handleAnalyze() {
    if (!file) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);
    setIsServiceDown(false);
    setResult(null);
    setLogSuccess(false);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await analyzeFood(formData);
      
      const data = res.data.data;
      setResult(data);
      setQuantity(data.servingSizeGrams || 100);
      
      // Save scan timestamp
      const timeString = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
      setScanTime(`Today, ${timeString}`);
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

  // Real-time macro scaling based on serving size adjustments
  const scaleFactor = result && result.servingSizeGrams ? quantity / result.servingSizeGrams : 1;
  const displayCalories = result ? Math.round(result.calories * scaleFactor) : 0;
  const displayProtein = result ? Math.round(result.protein * scaleFactor) : 0;
  const displayCarbs = result ? Math.round(result.carbs * scaleFactor) : 0;
  const displayFat = result ? Math.round(result.fat * scaleFactor) : 0;

  // API Call: Log meal
  async function handleConfirmLog() {
    if (!result || !selectedMealType) return;
    setIsLogging(true);
    setLogError(null);

    try {
      await logMeal({
        foodName: result.foodName,
        calories: displayCalories,
        protein: displayProtein,
        carbs: displayCarbs,
        fat: displayFat,
        servingSizeGrams: quantity,
        mealType: selectedMealType,
        foodScanId: result.scanId ?? null,
        localFoodItemId: result.localFoodItemId ?? null,
      });

      setLogSuccess(true);
      setResult(null);
      setFile(null);
      setPreviewUrl(null);
      setSelectedMealType(null);
      
      // Invalidate queries to refresh history widgets
      queryClient.invalidateQueries({ queryKey: ["recent-foods"] });
      queryClient.invalidateQueries({ queryKey: ["diary"] });
      queryClient.invalidateQueries({ queryKey: ["diary-today"] });
    } catch (err) {
      setLogError(
        err.response?.data?.message ?? "Failed to log the meal. Please try again.",
      );
    } finally {
      setIsLogging(false);
    }
  }

  // Dismiss scan or reset
  function handleDismiss() {
    setResult(null);
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
      eyebrow="AI Nutrition"
      title="Scan Food"
      description="Upload or capture a meal image and let AI analyze calories and macros instantly."
    >
      <div className="scan-container">
        {/* Custom Premium Tab Controls */}
        <div className="scan-tabs">
          <button
            type="button"
            onClick={() => setView("scan")}
            className={`scan-tab-btn${view === "scan" ? " scan-tab-btn--active" : ""}`}
          >
            <Camera size={16} />
            <span>Scan Plate with AI</span>
          </button>
          <button
            type="button"
            onClick={() => setView("search")}
            className={`scan-tab-btn${view === "search" ? " scan-tab-btn--active" : ""}`}
          >
            <Search size={16} />
            <span>Search Manually</span>
          </button>
        </div>

        {view === "scan" && (
          <div>
            {/* Success Notification Alert */}
            {logSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert--success"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-6)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle2 size={18} />
                  <span>Meal successfully logged — excellent tracking!</span>
                </div>
                <button
                  type="button"
                  className="link-btn"
                  onClick={handleDismiss}
                  style={{ color: "var(--success)", fontWeight: 700, textDecoration: "none" }}
                >
                  Scan Another
                </button>
              </motion.div>
            )}

            {/* Error notifications */}
            {fileError && (
              <div className="alert alert--error" style={{ marginBottom: "var(--sp-4)" }}>
                <AlertCircle size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                <span>{fileError}</span>
              </div>
            )}

            {analyzeError && (
              <div className="alert alert--error" style={{ marginBottom: "var(--sp-4)" }}>
                <AlertCircle size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                <span>{analyzeError}</span>
                {isServiceDown && (
                  <>
                    {" "}
                    <button type="button" className="link-btn" onClick={handleSearchManually} style={{ fontWeight: 600 }}>
                      Search manually instead
                    </button>
                  </>
                )}
              </div>
            )}

            {/* 1. Initial State: Upload / Drag & Drop Card */}
            {!result && !logSuccess && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {previewUrl ? (
                  /* Image Selected Preview Card */
                  <div className="scan-preview-card">
                    <div className="scan-image-wrapper">
                      <img src={previewUrl} alt="Meal preview" />
                    </div>
                    
                    <div style={{ display: "flex", gap: "var(--sp-3)", flexWrap: "wrap", marginTop: "var(--sp-4)" }}>
                      <button
                        type="button"
                        className="button-primary"
                        onClick={handleAnalyze}
                        style={{ flex: 1, minHeight: "46px" }}
                      >
                        <Sparkles size={16} />
                        <span>Analyze Meal</span>
                      </button>
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ minHeight: "46px" }}
                      >
                        <RefreshCw size={16} />
                        <span>Change Photo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drag & Drop Upload Zone Card */
                  <div
                    className={`upload-card${isDragging ? " upload-card--dragging" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="upload-card__icon-wrapper">
                      <Upload size={32} />
                    </div>
                    <h3 className="upload-card__title">Drag and drop your food photo here</h3>
                    <p className="upload-card__hint">
                      Supports JPEG, PNG, WebP or GIF (Max 10MB)
                    </p>
                    <button type="button" className="button-primary upload-card__btn">
                      <Camera size={16} />
                      <span>Browse or Take Photo</span>
                    </button>
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

                <div style={{ textAlign: "center", marginTop: "var(--sp-6)" }}>
                  <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
                    Not getting good results?{" "}
                    <button type="button" className="link-btn" onClick={handleSearchManually}>
                      Search manually instead
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* 2. Loading State: Actively Scanning UI */}
            {isAnalyzing && (
              <div className="scan-preview-card">
                <div className="scan-image-wrapper">
                  <img src={previewUrl} alt="Scanning preview" />
                  <div className="scan-overlay-active">
                    <div className="scan-overlay-status">
                      <Sparkles size={16} className="spinner-icon" />
                      <span>AI is analyzing your plate...</span>
                    </div>
                  </div>
                  <div className="scan-laser-line" />
                </div>
                
                <div className="spinner-container" style={{ marginTop: "var(--sp-5)", minHeight: "44px" }}>
                  <span className="pulse-circle" />
                  <span className="text-muted" style={{ fontWeight: 600 }}>Calculating calories and macros...</span>
                </div>
              </div>
            )}

            {/* 3. Success State: AI Analysis Results Card */}
            {result && !logSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="results-layout"
              >
                {/* Left Panel: Food Image Preview */}
                <div className="results-image-panel">
                  <div className="results-image-frame">
                    <img src={previewUrl} alt="Analyzed meal" />
                  </div>
                  <div className="results-image-meta">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} />
                      Scanned: {scanTime}
                    </span>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={handleDismiss}
                      style={{ fontSize: "var(--text-xs)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "2px" }}
                    >
                      <RefreshCw size={10} />
                      Rescan
                    </button>
                  </div>
                </div>

                {/* Right Panel: AI Analysis Stats */}
                <div className="results-info-panel">
                  <div className="results-header-row">
                    <div>
                      <h2 className="results-food-title">{result.foodName}</h2>
                      <div className="confidence-badge-wrapper">
                        {result.resultSource === "Verified" ? (
                          <span className="ai-confidence-pill ai-confidence-pill--high">
                            <CheckCircle2 size={12} />
                            <span>Verified Local Data</span>
                          </span>
                        ) : (
                          <span className={`ai-confidence-pill ${(result.confidencePercent ?? 100) >= 70 ? "ai-confidence-pill--high" : "ai-confidence-pill--warning"}`}>
                            <Sparkles size={12} />
                            <span>
                              AI Estimate · {result.confidencePercent ?? "?"}% confidence
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stat Cards for Calories and Macros */}
                  <div className="stats-showcase">
                    <div className="calorie-hero-card">
                      <div className="calorie-hero-text">
                        <span className="calorie-hero-label">Total Energy</span>
                        <div style={{ display: "flex", alignItems: "baseline" }}>
                          <span className="calorie-hero-value">{displayCalories}</span>
                          <span className="calorie-hero-unit">kcal</span>
                        </div>
                      </div>
                      <Flame size={28} className="calorie-hero-icon" />
                    </div>

                    {/* Protein */}
                    <div className="macro-stat-card macro-stat-card--protein">
                      <div className="macro-stat-card__header">
                        <span className="macro-stat-card__label">Protein</span>
                        <Beef size={14} className="macro-stat-card__icon" />
                      </div>
                      <span className="macro-stat-card__val">{displayProtein}g</span>
                    </div>

                    {/* Carbs */}
                    <div className="macro-stat-card macro-stat-card--carbs">
                      <div className="macro-stat-card__header">
                        <span className="macro-stat-card__label">Carbs</span>
                        <Wheat size={14} className="macro-stat-card__icon" />
                      </div>
                      <span className="macro-stat-card__val">{displayCarbs}g</span>
                    </div>

                    {/* Fats */}
                    <div className="macro-stat-card macro-stat-card--fat">
                      <div className="macro-stat-card__header">
                        <span className="macro-stat-card__label">Fat</span>
                        <Flame size={14} className="macro-stat-card__icon" />
                      </div>
                      <span className="macro-stat-card__val">{displayFat}g</span>
                    </div>
                  </div>

                  {result.notes && (
                    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "var(--sp-3) var(--sp-4)", marginBottom: "var(--sp-5)", fontSize: "var(--text-sm)", color: "var(--text-2)", fontStyle: "italic" }}>
                      💡 {result.notes}
                    </div>
                  )}

                  {/* Adjustments Panel (quantity & meal type) */}
                  <div className="adjustment-panel">
                    <h3 className="adjustment-title">
                      <Scale size={16} />
                      <span>Adjust & select meal</span>
                    </h3>

                    <div className="adjustment-row">
                      {/* Serving size modifier */}
                      <div className="quantity-control">
                        <label htmlFor="serving-size-input">Quantity (Grams)</label>
                        <div className="quantity-input-wrapper">
                          <input
                            id="serving-size-input"
                            type="number"
                            className="quantity-input"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                            min={1}
                            max={5000}
                          />
                          <span className="quantity-unit">g</span>
                        </div>
                      </div>

                      {/* Meal Selector */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-2)" }}>
                          Meal Type
                        </span>
                        <div className="premium-meal-row">
                          {[
                            { val: 1, label: "Breakfast", icon: <Coffee size={14} /> },
                            { val: 2, label: "Lunch", icon: <Sun size={14} /> },
                            { val: 3, label: "Dinner", icon: <Sunset size={14} /> },
                            { val: 4, label: "Snack", icon: <Apple size={14} /> }
                          ].map(({ val, label, icon }) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setSelectedMealType(val)}
                              className={`premium-meal-btn${selectedMealType === val ? " premium-meal-btn--active" : ""}`}
                            >
                              {icon}
                              <span className="premium-meal-btn__label">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {logError && (
                    <div className="alert alert--error" style={{ marginBottom: "var(--sp-4)" }}>
                      <AlertCircle size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                      <span>{logError}</span>
                    </div>
                  )}

                  {/* Actions CTAs */}
                  <div style={{ display: "flex", gap: "var(--sp-3)" }}>
                    <button
                      type="button"
                      className="button-primary"
                      onClick={handleConfirmLog}
                      disabled={!selectedMealType || isLogging}
                      style={{ flex: 2, minHeight: "46px" }}
                    >
                      {isLogging ? (
                        <>
                          <span className="spinner" />
                          <span>Logging meal...</span>
                        </>
                      ) : (
                        <span>Add to Daily Log</span>
                      )}
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={handleDismiss}
                      disabled={isLogging}
                      style={{ flex: 1, minHeight: "46px" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. Scan History Shortcut Section */}
            {!result && !isAnalyzing && recentFoods && recentFoods.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="recent-scans-section"
              >
                <div className="recent-scans-header">
                  <h3 className="recent-scans-title">
                    <Clock size={18} style={{ color: "var(--accent)" }} />
                    <span>Recent Scans</span>
                  </h3>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => (window.location.href = "/history")}
                    style={{ fontSize: "var(--text-xs)", display: "inline-flex", alignItems: "center", gap: "2px", textDecoration: "none" }}
                  >
                    <span>Full History</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="recent-scans-grid">
                  {recentFoods.slice(0, 3).map((item) => (
                    <div key={item.id} className="recent-scan-card">
                      <div>
                        <div className="recent-scan-name" title={item.name}>{item.name}</div>
                        <div className="recent-scan-calories">{Math.round(item.caloriesPerServing)} kcal</div>
                      </div>
                      <div className="recent-scan-macros">
                        P: {Math.round(item.proteinPerServing)}g · C: {Math.round(item.carbsPerServing)}g · F: {Math.round(item.fatPerServing)}g
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        )}

        {view === "search" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "var(--sp-6)", boxShadow: "var(--shadow-sm)" }}
          >
            <FoodSearchPanel />
            <hr className="divider" style={{ margin: "var(--sp-6) 0 var(--sp-4)" }} />
            <p className="text-muted" style={{ textAlign: "center", fontSize: "var(--text-sm)" }}>
              Have a photo of your meal?{" "}
              <button type="button" className="link-btn" onClick={() => setView("scan")} style={{ fontWeight: 600 }}>
                Scan with AI instead
              </button>
            </p>
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}

export default ScanPage;
