import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Minus, 
  Flame, 
  Beef, 
  Wheat, 
  Droplet, 
  Scale, 
  Clock, 
  Check, 
  X, 
  Sparkles,
  Info,
  Calendar,
  AlertCircle
} from "lucide-react";
import { logMeal } from "../api/foodScanClient";
import { getDiary } from "../api/diaryClient";

// Safe BASE URL for images
const API_BASE_URL = "http://localhost:5091";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function FoodLogConfirm({ food, initialQuantity = 1, onCancel, onSuccess }) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const [logError, setLogError] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);

  const [summary, setSummary] = useState(null);
  const [goals, setGoals] = useState(undefined);

  // Set default meal type based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) setSelectedMealType(1); // Breakfast
    else if (hour >= 11 && hour < 16) setSelectedMealType(2); // Lunch
    else if (hour >= 16 && hour < 21) setSelectedMealType(3); // Dinner
    else setSelectedMealType(4); // Snack

    getDiary(todayIso())
      .then((res) => {
        const d = res.data.data;
        setSummary(d?.dailySummary ?? null);
        setGoals(d?.goals ?? null);
      })
      .catch(() => {
        setSummary(null);
        setGoals(null);
      });
  }, []);

  const qty = Math.max(quantity, 0);
  const actual = {
    calories: food.caloriesPerServing * qty,
    protein: food.proteinPerServing * qty,
    carbs: food.carbsPerServing * qty,
    fat: food.fatPerServing * qty,
    servingSizeGrams: food.servingSizeGrams * qty,
  };

  // Stepper handlers
  const handleDecrement = () => {
    setQuantity(prev => Math.max(0.1, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleIncrement = () => {
    setQuantity(prev => Math.min(10.0, Math.round((prev + 0.1) * 10) / 10));
  };

  const handlePresetSelect = (preset) => {
    setQuantity(preset);
  };

  // Determine dynamic macro category tag
  const getFoodCategory = () => {
    const p = food.proteinPerServing || 0;
    const c = food.carbsPerServing || 0;
    const f = food.fatPerServing || 0;
    const total = p + c + f;
    if (total === 0) return "Verified Ingredient";
    
    // Check dominant nutrient
    const pPct = p / total;
    const cPct = c / total;
    const fPct = f / total;
    
    if (pPct > 0.35) return "High Protein";
    if (cPct > 0.5) return "Carb Resource";
    if (fPct > 0.4) return "Healthy Fats";
    return "Balanced Macros";
  };

  // Visual Macro bar splits
  const totalMacros = (actual.protein + actual.carbs + actual.fat) || 0;
  const pPct = totalMacros > 0 ? (actual.protein / totalMacros) * 100 : 0;
  const cPct = totalMacros > 0 ? (actual.carbs / totalMacros) * 100 : 0;
  const fPct = totalMacros > 0 ? (actual.fat / totalMacros) * 100 : 0;

  function buildPayload() {
    return {
      foodName: food.name,
      calories: Math.round(actual.calories || 0),
      protein: Math.round(actual.protein || 0),
      carbs: Math.round(actual.carbs || 0),
      fat: Math.round(actual.fat || 0),
      servingSizeGrams: Math.round(actual.servingSizeGrams || 0),
      mealType: selectedMealType,
      foodScanId: null,
      localFoodItemId: food.id,
    };
  }

  async function submitLog(payload) {
    setIsLogging(true);
    setLogError(null);
    try {
      await logMeal(payload);
      onSuccess();
    } catch (err) {
      setPendingPayload(payload);
      setLogError(err.response?.data?.message ?? "Failed to log meal. Please try again.");
    } finally {
      setIsLogging(false);
    }
  }

  function handleConfirm() {
    if (qty <= 0 || !selectedMealType) return;
    submitLog(buildPayload());
  }

  function handleRetry() {
    if (pendingPayload) submitLog(pendingPayload);
  }

  const hasImage = !!food.imagePath;
  const imageUrl = hasImage ? `${API_BASE_URL}/${food.imagePath}` : null;

  return (
    <div className="premium-confirm-container">
      {/* Hero section */}
      <div 
        className={`food-hero-banner ${hasImage ? "food-hero-banner--image" : ""}`}
        style={hasImage ? { backgroundImage: `url(${imageUrl})` } : {}}
      >
        <div className="food-hero-overlay" />
        <div className="food-hero-content">
          <span className="food-hero-category">
            <Sparkles size={10} style={{ marginRight: '4px' }} />
            {getFoodCategory()}
          </span>
          <h2 className="food-hero-title">{food.name}</h2>
          <div className="food-hero-subtitle">
            Base Serving: {Math.round(food.servingSizeGrams)}g · {Math.round(food.caloriesPerServing)} kcal
          </div>
        </div>
      </div>

      <div className="premium-confirm-body">
        {/* Nutrition Summary Cards */}
        <div className="premium-nutrition-grid">
          <div className="nutrition-stat-card nutrition-stat-card--calories">
            <span className="nutrition-stat-label">Energy</span>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="nutrition-stat-value">{Math.round(actual.calories || 0)}</span>
              <span className="nutrition-stat-unit">kcal</span>
            </div>
            <Flame size={12} style={{ color: 'var(--accent)', marginTop: '4px' }} />
          </div>

          <div className="nutrition-stat-card">
            <span className="nutrition-stat-label" style={{ color: 'oklch(0.550 0.160 35)' }}>Protein</span>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="nutrition-stat-value">{Math.round(actual.protein || 0)}</span>
              <span className="nutrition-stat-unit">g</span>
            </div>
            <Beef size={12} style={{ color: 'oklch(0.550 0.160 35)', marginTop: '4px' }} />
          </div>

          <div className="nutrition-stat-card">
            <span className="nutrition-stat-label" style={{ color: 'oklch(0.620 0.140 75)' }}>Carbs</span>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="nutrition-stat-value">{Math.round(actual.carbs || 0)}</span>
              <span className="nutrition-stat-unit">g</span>
            </div>
            <Wheat size={12} style={{ color: 'oklch(0.620 0.140 75)', marginTop: '4px' }} />
          </div>

          <div className="nutrition-stat-card">
            <span className="nutrition-stat-label" style={{ color: 'oklch(0.400 0.100 180)' }}>Fat</span>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="nutrition-stat-value">{Math.round(actual.fat || 0)}</span>
              <span className="nutrition-stat-unit">g</span>
            </div>
            <Droplet size={12} style={{ color: 'oklch(0.400 0.100 180)', marginTop: '4px' }} />
          </div>
        </div>

        {/* Macro split distribution */}
        {totalMacros > 0 && (
          <div className="macro-split-wrapper">
            <div className="macro-split-header">
              <span className="macro-split-title">Macro Distribution Ratio</span>
              <span className="portion-serving-info">Based on gram weight</span>
            </div>
            <div className="macro-split-bar">
              <div 
                className="macro-split-seg macro-split-seg--protein" 
                style={{ width: `${pPct}%` }}
                title={`Protein: ${Math.round(pPct)}%`}
              />
              <div 
                className="macro-split-seg macro-split-seg--carbs" 
                style={{ width: `${cPct}%` }}
                title={`Carbs: ${Math.round(cPct)}%`}
              />
              <div 
                className="macro-split-seg macro-split-seg--fat" 
                style={{ width: `${fPct}%` }}
                title={`Fat: ${Math.round(fPct)}%`}
              />
            </div>
            <div className="macro-legend">
              <div className="macro-legend-item">
                <div className="macro-legend-dot macro-legend-dot--protein" />
                <span>Protein {Math.round(pPct)}%</span>
              </div>
              <div className="macro-legend-item">
                <div className="macro-legend-dot macro-legend-dot--carbs" />
                <span>Carbs {Math.round(cPct)}%</span>
              </div>
              <div className="macro-legend-item">
                <div className="macro-legend-dot macro-legend-dot--fat" />
                <span>Fat {Math.round(fPct)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Portion Section */}
        <div className="portion-section">
          <div className="portion-label-row">
            <span className="portion-label">Portion Tuning</span>
            <span className="portion-serving-info">
              Total Weight: <span style={{ color: 'var(--text-1)', fontWeight: 700 }}>{Math.round(actual.servingSizeGrams || 0)}g</span>
            </span>
          </div>

          <div className="portion-controls-row">
            <button 
              type="button" 
              className="portion-stepper-btn" 
              onClick={handleDecrement}
              disabled={qty <= 0.1 || isLogging}
            >
              <Minus size={16} />
            </button>

            <div className="portion-input-wrapper">
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={quantity === 0 ? "" : quantity}
                onChange={(e) => setQuantity(Math.max(0, parseFloat(e.target.value) || 0))}
                className="portion-input-field"
                disabled={isLogging}
              />
              <span className="portion-input-unit">servings</span>
            </div>

            <button 
              type="button" 
              className="portion-stepper-btn" 
              onClick={handleIncrement}
              disabled={qty >= 10.0 || isLogging}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Preset Servings Chips */}
          <div className="portion-preset-chips">
            {[0.5, 1.0, 1.5, 2.0].map((presetVal) => (
              <button
                key={presetVal}
                type="button"
                className={`portion-preset-chip ${Math.abs(qty - presetVal) < 0.05 ? "portion-preset-chip--active" : ""}`}
                onClick={() => handlePresetSelect(presetVal)}
                disabled={isLogging}
              >
                {presetVal}x Serving ({Math.round(food.servingSizeGrams * presetVal)}g)
              </button>
            ))}
          </div>
        </div>

        {/* Meal Selector */}
        <div className="meal-select-section">
          <span className="meal-select-label">Assign to Meal</span>
          <div className="meal-type-row-pills">
            {[
              { val: 1, label: "🌅 Breakfast" },
              { val: 2, label: "☀️ Lunch" },
              { val: 3, label: "🌙 Dinner" },
              { val: 4, label: "🍎 Snack" }
            ].map(({ val, label }) => (
              <button
                key={val}
                type="button"
                className={`meal-type-pill-btn ${selectedMealType === val ? "meal-type-pill-btn--active" : ""}`}
                onClick={() => setSelectedMealType(val)}
                disabled={isLogging}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Impact Section */}
        {summary && (
          <div className="daily-impact-section">
            <div className="daily-impact-title">
              <Calendar size={13} className="text-accent" />
              <span>Today's Daily Target Impact Projection</span>
            </div>
            <div className="daily-impact-columns">
              <div className="daily-impact-col">
                <span className="daily-impact-subtitle">Current Budget Used</span>
                <div className="daily-impact-values">
                  <div className="daily-impact-row">
                    <span>Calories</span>
                    <span>{Math.round(summary.totalCalories)} kcal</span>
                  </div>
                  <div className="daily-impact-row daily-impact-row--sub">
                    <span>Protein</span>
                    <span>{Math.round(summary.totalProtein)}g</span>
                  </div>
                  <div className="daily-impact-row daily-impact-row--sub">
                    <span>Carbs</span>
                    <span>{Math.round(summary.totalCarbs)}g</span>
                  </div>
                  <div className="daily-impact-row daily-impact-row--sub">
                    <span>Fat</span>
                    <span>{Math.round(summary.totalFat)}g</span>
                  </div>
                </div>
              </div>

              <div className="daily-impact-col">
                <span className="daily-impact-subtitle" style={{ color: 'var(--accent)' }}>After Logging This Meal</span>
                <div className="daily-impact-values">
                  <div className="daily-impact-row">
                    <span>Calories</span>
                    <span>
                      {Math.round(summary.totalCalories + (actual.calories || 0))}
                      {goals && <span className="daily-impact-limit"> / {Math.round(goals.caloriesTarget)} kcal</span>}
                    </span>
                  </div>
                  <div className="daily-impact-row daily-impact-row--sub">
                    <span>Protein</span>
                    <span>
                      {Math.round(summary.totalProtein + (actual.protein || 0))}g
                      {goals && <span className="daily-impact-limit"> / {Math.round(goals.proteinTarget)}g</span>}
                    </span>
                  </div>
                  <div className="daily-impact-row daily-impact-row--sub">
                    <span>Carbs</span>
                    <span>
                      {Math.round(summary.totalCarbs + (actual.carbs || 0))}g
                      {goals && <span className="daily-impact-limit"> / {Math.round(goals.carbsTarget)}g</span>}
                    </span>
                  </div>
                  <div className="daily-impact-row daily-impact-row--sub">
                    <span>Fat</span>
                    <span>
                      {Math.round(summary.totalFat + (actual.fat || 0))}g
                      {goals && <span className="daily-impact-limit"> / {Math.round(goals.fatTarget)}g</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {goals === null && (
              <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-3)", display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Info size={11} />
                <span><Link to="/goal-setup" className="link-btn">Set your targets</Link> to configure tracking.</span>
              </p>
            )}
          </div>
        )}

        {/* Errors display */}
        {logError && (
          <div className="alert alert--error" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1.5)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
              <AlertCircle size={14} />
              <span>{logError}</span>
            </div>
            <button type="button" className="button-secondary btn-sm" onClick={handleRetry} disabled={isLogging} style={{ alignSelf: 'flex-start' }}>
              {isLogging ? "Retrying…" : "Try again"}
            </button>
          </div>
        )}

        {/* CTA Button Actions Row */}
        <div className="confirm-action-row">
          <button 
            type="button" 
            className="button-secondary" 
            onClick={onCancel}
            disabled={isLogging}
          >
            <X size={15} style={{ marginRight: '4px' }} />
            Cancel
          </button>
          <button
            type="button"
            className="button-primary"
            onClick={handleConfirm}
            disabled={qty <= 0 || !selectedMealType || isLogging}
          >
            <Check size={15} style={{ marginRight: '4px' }} />
            {isLogging ? "Logging…" : "Confirm & Log"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodLogConfirm;
