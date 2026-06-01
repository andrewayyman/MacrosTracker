import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Camera, 
  Plus, 
  Clock, 
  Star, 
  ChevronRight, 
  UploadCloud, 
  ArrowLeft, 
  Sparkles,
  RefreshCw,
  Scale,
  AlertCircle,
  CheckCircle2,
  Beef,
  Wheat,
  Flame,
  Coffee,
  Sun,
  Sunset,
  Apple,
  Dumbbell
} from "lucide-react";

import PageShell from "../components/PageShell";
import FoodLogConfirm from "../components/FoodLogConfirm";
import MealTypeSelector from "../components/MealTypeSelector";
import RecentFoodsQuickAdd from "../components/RecentFoodsQuickAdd";
import EgyptianFoodQuickLog from "../components/EgyptianFoodQuickLog";

import { searchFood, analyzeFood, logMeal } from "../api/foodScanClient";
import { getRecentFoods } from "../api/nutritionLogClient";
import { getDiary } from "../api/diaryClient";

import "./AddMeal.css";
import "./Scan.css";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const PORTION_PRESETS = [
  { id: "plate", name: "Plate", grams: 350, icon: "🍽️", desc: "Koshary, Rice, Mahshi" },
  { id: "bowl", name: "Bowl", grams: 250, icon: "🥣", desc: "Molokhia, Soup, Shorba" },
  { id: "piece", name: "Piece", grams: 80, icon: "🧆", desc: "Kofta, Falafel, Goulash" },
  { id: "slice", name: "Slice", grams: 50, icon: "🍕", desc: "Feteer, Baladi Bread, Cake" },
  { id: "spoon", name: "Spoon", grams: 15, icon: "🥄", desc: "Rice, Ful, Dips" },
  { id: "cup", name: "Cup", grams: 200, icon: "🥛", desc: "Yogurt, Milk, Shorba" }
];

function AddMeal() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("scan"); // scan, search, recent, egyptian
  const [selectedFood, setSelectedFood] = useState(null);

  // Sync route defaults
  useEffect(() => {
    if (location.pathname === "/scan") {
      setActiveTab("scan");
    } else {
      setActiveTab("search");
    }

    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t && ["scan", "search", "recent", "egyptian"].includes(t)) {
      setActiveTab(t);
    }
  }, [location.pathname]);

  // LIVE UPDATING SIDEBAR AND PROGRESS HEADER
  const [diarySummary, setDiarySummary] = useState(null);
  const [diaryGoals, setDiaryGoals] = useState(null);

  const fetchDiaryGoals = () => {
    getDiary(new Date().toISOString().slice(0, 10))
      .then((res) => {
        const d = res.data.data;
        setDiarySummary(d?.dailySummary ?? null);
        setDiaryGoals(d?.goals ?? null);
      })
      .catch(() => {
        setDiarySummary(null);
        setDiaryGoals(null);
      });
  };

  useEffect(() => {
    fetchDiaryGoals();
  }, []);

  const handleSyncRecent = () => {
    queryClient.invalidateQueries({ queryKey: ["recent-foods"] });
    queryClient.invalidateQueries({ queryKey: ["diary"] });
    queryClient.invalidateQueries({ queryKey: ["diary-today"] });
    fetchDiaryGoals();
  };

  // --- Dynamic Suggestions generator using live values ---
  const getSmartSuggestions = () => {
    if (!diarySummary || !diaryGoals) {
      return ["Log your meals to calculate protein, carbohydrate, and fat adjustments."];
    }

    const suggestions = [];
    const proteinDiff = Math.max(0, diaryGoals.proteinTarget - diarySummary.totalProtein);
    const carbsDiff = Math.max(0, diaryGoals.carbsTarget - diarySummary.totalCarbs);
    const calDiff = Math.max(0, diaryGoals.caloriesTarget - diarySummary.totalCalories);

    if (proteinDiff > 15) {
      suggestions.push(`You're ${Math.round(proteinDiff)}g away from your protein goal. Consider adding a protein-dense snack like Greek Yogurt or Grilled Chicken.`);
    }

    if (calDiff > 150 && calDiff < 500 && proteinDiff > 10) {
      suggestions.push(`You have ${Math.round(calDiff)} kcal remaining today. A serving of Egyptian Fava Beans (Ful) is a perfect clean addition.`);
    }

    if (carbsDiff > 35) {
      suggestions.push(`You need ${Math.round(carbsDiff)}g of carbohydrates. Fuel up with Koshary or a piece of Baladi Bread.`);
    }

    if (diarySummary.totalCalories > diaryGoals.caloriesTarget) {
      suggestions.push(`You have satisfied your calorie target limit for today. Prioritize hydration and lean proteins if still active.`);
    }

    if (suggestions.length === 0) {
      suggestions.push("Sensational work! You've perfectly satisfied all of today's macronutrient targets.");
    }

    return suggestions;
  };

  // --- Tab 1: AI Scan State & Logic ---
  const fileInputRef = useRef(null);
  const [scanFile, setScanFile] = useState(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [isServiceDown, setIsServiceDown] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanTime, setScanTime] = useState("");
  
  const [quantity, setQuantity] = useState(100);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [isLoggingScan, setIsLoggingScan] = useState(false);
  const [logScanError, setLogScanError] = useState(null);
  const [logScanSuccess, setLogScanSuccess] = useState(false);

  const [selectedPortionId, setSelectedPortionId] = useState(null);
  const [portionCount, setPortionCount] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const handlePortionSelect = (preset) => {
    if (selectedPortionId === preset.id) {
      setSelectedPortionId(null);
    } else {
      setSelectedPortionId(preset.id);
      setQuantity(Math.round(preset.grams * portionCount));
    }
  };

  const adjustPortionCount = (amount) => {
    const nextCount = Math.max(0.25, portionCount + amount);
    const rounded = Math.round(nextCount * 100) / 100;
    setPortionCount(rounded);
    if (selectedPortionId) {
      const preset = PORTION_PRESETS.find(p => p.id === selectedPortionId);
      if (preset) {
        setQuantity(Math.round(preset.grams * rounded));
      }
    }
  };

  const handleQuantityChange = (val) => {
    const num = Math.max(1, Number(val));
    setQuantity(num);
    if (selectedPortionId) {
      const preset = PORTION_PRESETS.find(p => p.id === selectedPortionId);
      if (preset && Math.round(preset.grams * portionCount) !== num) {
        setSelectedPortionId(null);
      }
    }
  };

  function processFile(file) {
    setScanError(null);
    setIsServiceDown(false);
    setScanResult(null);
    setLogScanSuccess(false);
    setLogScanError(null);

    if (file.size > MAX_SIZE_BYTES) {
      setScanError("File is too large. Max 10MB.");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setScanError("Unsupported file type. Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }

    const url = URL.createObjectURL(file);
    setScanFile(file);
    setScanPreviewUrl(url);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  async function handleAnalyze() {
    if (!scanFile) return;
    setIsScanning(true);
    setScanError(null);
    setIsServiceDown(false);
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append("image", scanFile);
      const res = await analyzeFood(formData);
      const data = res.data.data;
      
      setScanResult(data);
      setQuantity(data.servingSizeGrams || 100);
      setSelectedPortionId(null);
      setPortionCount(1);
      
      const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setScanTime(`Today, ${timeString}`);
    } catch (err) {
      if (err.response?.status === 503) {
        setIsServiceDown(true);
        setScanError("AI service is temporarily offline. Please search or quick log manually.");
      } else {
        setScanError(err.response?.data?.message ?? "Analysis failed. Try again.");
      }
    } finally {
      setIsScanning(false);
    }
  }

  const scaleFactor = scanResult && scanResult.servingSizeGrams ? quantity / scanResult.servingSizeGrams : 1;
  const displayCalories = scanResult ? Math.round(scanResult.calories * scaleFactor) : 0;
  const displayProtein = scanResult ? Math.round(scanResult.protein * scaleFactor) : 0;
  const displayCarbs = scanResult ? Math.round(scanResult.carbs * scaleFactor) : 0;
  const displayFat = scanResult ? Math.round(scanResult.fat * scaleFactor) : 0;

  async function handleConfirmScanLog() {
    if (!scanResult || !selectedMealType) return;
    setIsLoggingScan(true);
    setLogScanError(null);

    try {
      await logMeal({
        foodName: scanResult.foodName,
        calories: displayCalories,
        protein: displayProtein,
        carbs: displayCarbs,
        fat: displayFat,
        servingSizeGrams: quantity,
        mealType: selectedMealType,
        foodScanId: scanResult.scanId ?? null,
        localFoodItemId: scanResult.localFoodItemId ?? null,
      });

      setLogScanSuccess(true);
      setScanResult(null);
      setScanFile(null);
      setScanPreviewUrl(null);
      setSelectedMealType(null);
      
      handleSyncRecent();
    } catch (err) {
      setLogScanError(err.response?.data?.message ?? "Failed to commit food scan.");
    } finally {
      setIsLoggingScan(false);
    }
  }

  function handleResetScan() {
    setScanResult(null);
    setSelectedMealType(null);
    setLogScanError(null);
    setLogScanSuccess(false);
    setScanError(null);
    setIsServiceDown(false);
    setScanFile(null);
    setScanPreviewUrl(null);
    setSelectedPortionId(null);
    setPortionCount(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // --- Tab 2: Search Food State & Logic ---
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await searchFood(query.trim());
        setSearchResults(res.data.data ?? []);
      } catch {
        setSearchError("Failed to search database.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Calculations for Calorie Progress Summary
  const caloriesTarget = diaryGoals?.caloriesTarget ?? 2000;
  const caloriesConsumed = diarySummary?.totalCalories ?? 0;
  const remainingCalories = Math.max(0, caloriesTarget - caloriesConsumed);
  const caloriePercent = Math.min(100, (caloriesConsumed / caloriesTarget) * 100);

  // Macros visualizer logic
  const pTarget = diaryGoals?.proteinTarget ?? 150;
  const pConsumed = diarySummary?.totalProtein ?? 0;
  const pPercent = Math.min(100, (pConsumed / pTarget) * 100);

  const cTarget = diaryGoals?.carbsTarget ?? 250;
  const cConsumed = diarySummary?.totalCarbs ?? 0;
  const cPercent = Math.min(100, (cConsumed / cTarget) * 100);

  const fTarget = diaryGoals?.fatTarget ?? 70;
  const fConsumed = diarySummary?.totalFat ?? 0;
  const fPercent = Math.min(100, (fConsumed / fTarget) * 100);

  return (
    <PageShell
      eyebrow="Console"
      title="Add Meal"
      description="Track your meals dynamically using smart AI photo scans, nutritional databases, local histories, or culturally specialized shortcuts."
    >
      {/* SECTION 1 - Calorie summary banner */}
      <div className="add-meal-header-summary">
        <div>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--text-1)" }}>
            Today's Budget Summary
          </div>
          <p className="text-muted" style={{ fontSize: "var(--text-xs)", margin: "2px 0 0 0" }}>
            Real-time balance scales instantly as new logs are confirmed.
          </p>
        </div>
        <div className="header-summary__progress-box">
          <div className="header-summary__progress-label">
            <span>{Math.round(caloriesConsumed)} kcal consumed</span>
            <span>{Math.round(remainingCalories)} kcal remaining</span>
          </div>
          <div className="header-summary__progress-bar-bg">
            <div className="header-summary__progress-bar-fill" style={{ width: `${caloriePercent}%` }} />
          </div>
        </div>
      </div>

      <div className="add-meal-container">
        
        {/* LEFT COLUMN: 4-TAB SYSTEM WORKFLOW */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
          {selectedFood ? (
            <div className="tab-fade-enter">
              <button 
                onClick={() => setSelectedFood(null)} 
                className="link-btn" 
                style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "var(--sp-4)" }}
              >
                <ArrowLeft size={16} /> Back to Search options
              </button>
              <FoodLogConfirm
                food={selectedFood.food}
                initialQuantity={selectedFood.qty}
                onCancel={() => setSelectedFood(null)}
                onSuccess={() => {
                  setSelectedFood(null);
                  handleSyncRecent();
                }}
              />
            </div>
          ) : (
            <div className="add-meal-tabs-wrapper">
              <div className="add-meal-tabs-header">
                <button 
                  className={`add-meal-tab-trigger ${activeTab === 'scan' ? 'add-meal-tab-trigger--active' : ''}`}
                  onClick={() => setActiveTab('scan')}
                >
                  <Camera size={16} /> AI Scan
                </button>
                <button 
                  className={`add-meal-tab-trigger ${activeTab === 'search' ? 'add-meal-tab-trigger--active' : ''}`}
                  onClick={() => setActiveTab('search')}
                >
                  <Search size={16} /> Search Food
                </button>
                <button 
                  className={`add-meal-tab-trigger ${activeTab === 'recent' ? 'add-meal-tab-trigger--active' : ''}`}
                  onClick={() => setActiveTab('recent')}
                >
                  <Clock size={16} /> Recent Foods
                </button>
                <button 
                  className={`add-meal-tab-trigger ${activeTab === 'egyptian' ? 'add-meal-tab-trigger--active' : ''}`}
                  onClick={() => setActiveTab('egyptian')}
                >
                  <Sparkles size={16} style={{ color: "oklch(0.55 0.12 75)" }} /> Egyptian Quick Log
                </button>
              </div>

              <div className="add-meal-tab-content">
                
                {/* TAB 1: AI SCAN MODULE */}
                {activeTab === "scan" && (
                  <div className="tab-fade-enter">
                    {/* Log Success */}
                    {logScanSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="alert alert--success"
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-5)" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <CheckCircle2 size={18} />
                          <span>Meal successfully scaled and logged!</span>
                        </div>
                        <button type="button" className="link-btn" onClick={handleResetScan} style={{ color: "var(--success)", fontWeight: 700 }}>
                          Scan Another
                        </button>
                      </motion.div>
                    )}

                    {/* Scan Errors */}
                    {scanError && (
                      <div className="alert alert--error" style={{ marginBottom: "var(--sp-4)" }}>
                        <AlertCircle size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                        <span>{scanError}</span>
                      </div>
                    )}

                    {/* Dnd Trigger */}
                    {!scanResult && !logScanSuccess && !isScanning && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {scanPreviewUrl ? (
                          <div className="scan-preview-card" style={{ border: "2px dashed var(--accent)", padding: "var(--sp-4)" }}>
                            <div className="scan-image-wrapper">
                              <img src={scanPreviewUrl} alt="Plate preview" />
                            </div>
                            <div style={{ display: "flex", gap: "var(--sp-3)", flexWrap: "wrap", marginTop: "var(--sp-4)" }}>
                              <button type="button" className="button-primary" onClick={handleAnalyze} style={{ flex: 1, minHeight: "44px" }}>
                                <Sparkles size={16} />
                                <span>Analyze Plate</span>
                              </button>
                              <button type="button" className="button-secondary" onClick={() => fileInputRef.current?.click()} style={{ minHeight: "44px" }}>
                                <RefreshCw size={16} />
                                <span>Change Photo</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`upload-card ${isDragging ? "upload-card--dragging" : ""}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDragging(false);
                              const f = e.dataTransfer.files?.[0];
                              if (f) processFile(f);
                            }}
                          >
                            <div className="upload-card__icon-wrapper">
                              <UploadCloud size={32} />
                            </div>
                            <h3 className="upload-card__title">Drag & Drop Meal Photo</h3>
                            <p className="upload-card__hint">Supports JPG, PNG, WebP (Max 10MB)</p>
                            <button type="button" className="button-primary">
                              <Camera size={16} />
                              <span>Browse / Capture</span>
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
                      </motion.div>
                    )}

                    {/* Scanning animation */}
                    {isScanning && (
                      <div className="scan-preview-card">
                        <div className="scan-image-wrapper">
                          <img src={scanPreviewUrl} alt="Scanning preview" />
                          <div className="scan-overlay-active">
                            <div className="scan-overlay-status">
                              <Sparkles size={16} className="spinner-icon" />
                              <span>AI is reading macros...</span>
                            </div>
                          </div>
                          <div className="scan-laser-line" />
                        </div>
                      </div>
                    )}

                    {/* AI Vision Results Output */}
                    {scanResult && !logScanSuccess && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="results-layout">
                        <div className="results-image-panel">
                          <div className="results-image-frame">
                            <img src={scanPreviewUrl} alt="Scanned food" />
                          </div>
                          <div className="results-image-meta">
                            <span><Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> {scanTime}</span>
                            <button type="button" className="link-btn" onClick={handleResetScan} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <RefreshCw size={10} /> Rescan
                            </button>
                          </div>
                        </div>

                        <div className="results-info-panel" style={{ padding: 0, border: "none", background: "transparent", boxShadow: "none" }}>
                          <h2 className="results-food-title" style={{ fontSize: "var(--text-lg)" }}>{scanResult.foodName}</h2>
                          <div className="confidence-badge-wrapper" style={{ marginBottom: "var(--sp-4)" }}>
                            {scanResult.resultSource === "Verified" ? (
                              <span className="ai-confidence-pill ai-confidence-pill--high">
                                <CheckCircle2 size={12} />
                                <span>Verified Nutrition</span>
                              </span>
                            ) : (
                              <span className={`ai-confidence-pill ${(scanResult.confidencePercent ?? 100) >= 70 ? "ai-confidence-pill--high" : "ai-confidence-pill--warning"}`}>
                                <Sparkles size={12} />
                                <span>AI Estimate · {scanResult.confidencePercent ?? 90}% confidence</span>
                              </span>
                            )}
                          </div>

                          <div className="stats-showcase" style={{ gap: "6px", marginBottom: "var(--sp-4)" }}>
                            <div className="calorie-hero-card" style={{ padding: "var(--sp-2) var(--sp-3)" }}>
                              <div className="calorie-hero-text">
                                <span className="calorie-hero-label" style={{ fontSize: "9px" }}>Energy</span>
                                <div style={{ display: "flex", alignItems: "baseline" }}>
                                  <span className="calorie-hero-value" style={{ fontSize: "var(--text-xl)" }}>{displayCalories}</span>
                                  <span className="calorie-hero-unit">kcal</span>
                                </div>
                              </div>
                              <Flame size={18} className="calorie-hero-icon" />
                            </div>

                            <div className="macro-stat-card macro-stat-card--protein" style={{ padding: "var(--sp-2)" }}>
                              <div className="macro-stat-card__header">
                                <span className="macro-stat-card__label" style={{ fontSize: "8px" }}>Protein</span>
                                <Beef size={10} />
                              </div>
                              <span className="macro-stat-card__val" style={{ fontSize: "var(--text-sm)" }}>{displayProtein}g</span>
                            </div>

                            <div className="macro-stat-card macro-stat-card--carbs" style={{ padding: "var(--sp-2)" }}>
                              <div className="macro-stat-card__header">
                                <span className="macro-stat-card__label" style={{ fontSize: "8px" }}>Carbs</span>
                                <Wheat size={10} />
                              </div>
                              <span className="macro-stat-card__val" style={{ fontSize: "var(--text-sm)" }}>{displayCarbs}g</span>
                            </div>

                            <div className="macro-stat-card macro-stat-card--fat" style={{ padding: "var(--sp-2)" }}>
                              <div className="macro-stat-card__header">
                                <span className="macro-stat-card__label" style={{ fontSize: "8px" }}>Fat</span>
                                <Flame size={10} />
                              </div>
                              <span className="macro-stat-card__val" style={{ fontSize: "var(--text-sm)" }}>{displayFat}g</span>
                            </div>
                          </div>

                          {scanResult.notes && (
                            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "var(--sp-2) var(--sp-3)", marginBottom: "var(--sp-4)", fontSize: "var(--text-xs)", color: "var(--text-2)", fontStyle: "italic" }}>
                              💡 {scanResult.notes}
                            </div>
                          )}

                          {/* Portion Presets */}
                          <div className="portion-helper-section" style={{ padding: "var(--sp-3)", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
                            <div className="portion-helper-header">
                              <span className="portion-helper-label" style={{ fontSize: "var(--text-xs)" }}>
                                <Scale size={12} /> Portion Presets
                              </span>
                            </div>
                            <div className="portion-grid" style={{ gap: "4px" }}>
                              {PORTION_PRESETS.map((preset) => {
                                const isActive = selectedPortionId === preset.id;
                                return (
                                  <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handlePortionSelect(preset)}
                                    className={`portion-card ${isActive ? "portion-card--active" : ""}`}
                                    style={{ padding: "var(--sp-2) var(--sp-1)" }}
                                  >
                                    <span className="portion-card__icon" style={{ fontSize: "1rem" }}>{preset.icon}</span>
                                    <span className="portion-card__name" style={{ fontSize: "10px" }}>{preset.name}</span>
                                    <span className="portion-card__grams" style={{ fontSize: "9px" }}>≈ {preset.grams}g</span>
                                  </button>
                                );
                              })}
                            </div>

                            <AnimatePresence>
                              {selectedPortionId && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="portion-multiplier-control"
                                  style={{ padding: "var(--sp-2)", gap: "var(--sp-2)", marginTop: "4px" }}
                                >
                                  <div className="multiplier-adjust-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span className="multiplier-label" style={{ fontSize: "9px" }}>Multipliers</span>
                                    <div className="multiplier-stepper">
                                      <button type="button" className="stepper-btn" onClick={() => adjustPortionCount(-0.5)} disabled={portionCount <= 0.25}>-0.5</button>
                                      <button type="button" className="stepper-btn" onClick={() => adjustPortionCount(-1)} disabled={portionCount <= 1}>-1</button>
                                      <span className="multiplier-value" style={{ fontSize: "var(--text-xs)", margin: "0 var(--sp-1)" }}>{portionCount}x</span>
                                      <button type="button" className="stepper-btn" onClick={() => adjustPortionCount(1)}>+1</button>
                                      <button type="button" className="stepper-btn" onClick={() => adjustPortionCount(0.5)}>+0.5</button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Controls */}
                          <div className="adjustment-panel" style={{ padding: "var(--sp-3)", marginBottom: "var(--sp-4)" }}>
                            <div className="adjustment-row" style={{ gap: "var(--sp-2)" }}>
                              <div className="quantity-control">
                                <label style={{ fontSize: "10px" }}>Grams</label>
                                <div className="quantity-input-wrapper">
                                  <input
                                    type="number"
                                    className="quantity-input"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(e.target.value)}
                                    min={1}
                                    style={{ minHeight: "32px", fontSize: "var(--text-sm)" }}
                                  />
                                  <span className="quantity-unit">g</span>
                                </div>
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-2)" }}>Meal Category</span>
                                <div className="premium-meal-row" style={{ gap: "3px" }}>
                                  {[
                                    { val: 1, label: "Breakfast", icon: <Coffee size={10} /> },
                                    { val: 2, label: "Lunch", icon: <Sun size={10} /> },
                                    { val: 3, label: "Dinner", icon: <Sunset size={10} /> },
                                    { val: 4, label: "Snack", icon: <Apple size={10} /> }
                                  ].map(({ val, label, icon }) => (
                                    <button
                                      key={val}
                                      type="button"
                                      onClick={() => setSelectedMealType(val)}
                                      className={`premium-meal-btn ${selectedMealType === val ? "premium-meal-btn--active" : ""}`}
                                      style={{ minHeight: "40px" }}
                                    >
                                      {icon}
                                      <span className="premium-meal-btn__label" style={{ fontSize: "7px" }}>{label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {logScanError && (
                            <div className="alert alert--error" style={{ marginBottom: "var(--sp-3)" }}>{logScanError}</div>
                          )}

                          <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                            <button
                              type="button"
                              className="button-primary"
                              onClick={handleConfirmScanLog}
                              disabled={!selectedMealType || isLoggingScan}
                              style={{ flex: 2, minHeight: "40px" }}
                            >
                              {isLoggingScan ? "Saving..." : "Add to Diary"}
                            </button>
                            <button
                              type="button"
                              className="button-secondary"
                              onClick={handleResetScan}
                              disabled={isLoggingScan}
                              style={{ flex: 1, minHeight: "40px" }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* TAB 2: SEARCH FOOD */}
                {activeTab === "search" && (
                  <div className="tab-fade-enter">
                    <input
                      type="text"
                      placeholder="Search nutritional database (e.g. Rice, Kofta, Egg)..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="food-search__input"
                      autoFocus
                    />
                    {isSearching && <p className="text-muted" style={{ marginTop: "var(--sp-2)", fontSize: "var(--text-xs)" }}>Querying cloud database...</p>}
                    {searchError && <div className="alert alert--error" style={{ marginTop: "var(--sp-2)" }}>{searchError}</div>}
                    
                    {!isSearching && query.trim() && searchResults.length === 0 && !searchError && (
                      <p className="text-muted text-sm" style={{ marginTop: "var(--sp-3)" }}>No matched suggestions. Try custom additions in Quick Log.</p>
                    )}

                    {searchResults.length > 0 && (
                      <div style={{ marginTop: "var(--sp-3)" }}>
                        {searchResults.map(item => (
                          <div key={item.id} className="log-list-item" style={{ padding: "var(--sp-3)" }} onClick={() => setSelectedFood({ food: item, qty: 1 })}>
                            <div>
                              <div className="log-list-item-title" style={{ fontSize: "var(--text-sm)", fontWeight: 700 }}>{item.name}</div>
                              <div className="log-list-item-meta" style={{ gap: "var(--sp-2)", fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>
                                <span>{Math.round(item.caloriesPerServing)} kcal</span>
                                <span>•</span>
                                <span>P: {Math.round(item.proteinPerServing)}g</span>
                                <span>C: {Math.round(item.carbsPerServing)}g</span>
                                <span>F: {Math.round(item.fatPerServing)}g</span>
                              </div>
                            </div>
                            <ChevronRight size={14} className="log-list-item-action" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: RECENT FOODS */}
                {activeTab === "recent" && (
                  <div className="tab-fade-enter">
                    <RecentFoodsQuickAdd onSuccess={handleSyncRecent} />
                  </div>
                )}

                {/* TAB 4: EGYPTIAN QUICK LOG */}
                {activeTab === "egyptian" && (
                  <div className="tab-fade-enter">
                    <EgyptianFoodQuickLog onSuccess={handleSyncRecent} />
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DYNAMIC DAILY SUMMARY & SUGGESTIONS SIDEBAR */}
        <div className="add-meal-sidebar">
          
          {/* DAILY PROGRESS WIDGET */}
          <div className="sidebar-widget">
            <h3 className="sidebar-widget__title">
              <Dumbbell size={16} style={{ color: "var(--accent)" }} /> Daily Macronutrients
            </h3>
            
            <div className="sidebar-macro-row">
              <div className="sidebar-macro-header">
                <span className="sidebar-macro-header__name">Protein</span>
                <span>{Math.round(pConsumed)}g / {pTarget}g ({Math.round(pPercent)}%)</span>
              </div>
              <div className="sidebar-macro-bar-bg">
                <div className="sidebar-macro-bar-fill sidebar-macro-bar-fill--protein" style={{ width: `${pPercent}%` }} />
              </div>
            </div>

            <div className="sidebar-macro-row">
              <div className="sidebar-macro-header">
                <span className="sidebar-macro-header__name">Carbohydrates</span>
                <span>{Math.round(cConsumed)}g / {cTarget}g ({Math.round(cPercent)}%)</span>
              </div>
              <div className="sidebar-macro-bar-bg">
                <div className="sidebar-macro-bar-fill sidebar-macro-bar-fill--carbs" style={{ width: `${cPercent}%` }} />
              </div>
            </div>

            <div className="sidebar-macro-row">
              <div className="sidebar-macro-header">
                <span className="sidebar-macro-header__name">Fat</span>
                <span>{Math.round(fConsumed)}g / {fTarget}g ({Math.round(fPercent)}%)</span>
              </div>
              <div className="sidebar-macro-bar-bg">
                <div className="sidebar-macro-bar-fill sidebar-macro-bar-fill--fat" style={{ width: `${fPercent}%` }} />
              </div>
            </div>
          </div>

          {/* SMART SUGGESTIONS WIDGET */}
          <div className="sidebar-widget">
            <h3 className="sidebar-widget__title">
              <Sparkles size={16} style={{ color: "oklch(0.55 0.12 75)" }} /> Smart Suggestions
            </h3>
            <div>
              {getSmartSuggestions().map((suggestion, idx) => (
                <div key={idx} className="suggestion-box">
                  {suggestion}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </PageShell>
  );
}

export default AddMeal;
