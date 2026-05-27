import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MealTypeSelector from "./MealTypeSelector";
import { logMeal } from "../api/foodScanClient";
import { getDiary } from "../api/diaryClient";

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

  useEffect(() => {
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

  function buildPayload() {
    return {
      foodName: food.name,
      calories: Math.round(actual.calories * 10) / 10,
      protein: Math.round(actual.protein * 10) / 10,
      carbs: Math.round(actual.carbs * 10) / 10,
      fat: Math.round(actual.fat * 10) / 10,
      servingSizeGrams: Math.round(actual.servingSizeGrams * 10) / 10,
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

  return (
    <div>
      <div className="food-selected-card">
        <div style={{ fontWeight: 700, fontSize: "var(--text-base)", marginBottom: "var(--sp-1)", color: "var(--text-1)" }}>
          {food.name}
        </div>
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-2)", marginBottom: "var(--sp-4)" }}>
          Per serving: {Math.round(food.caloriesPerServing)} kcal · P {food.proteinPerServing}g · C {food.carbsPerServing}g · F {food.fatPerServing}g · {food.servingSizeGrams}g
        </div>

        <label style={{ display: "block", marginBottom: "var(--sp-2)", fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-1)" }}>
          Servings
        </label>
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
          style={{ width: 100, marginBottom: "var(--sp-4)" }}
          className="food-search__input"
        />

        <div className="food-result-item__macros">
          <span className="food-result-item__macro">{Math.round(actual.calories)} kcal</span>
          <span className="food-result-item__macro">P {Math.round(actual.protein * 10) / 10}g</span>
          <span className="food-result-item__macro">C {Math.round(actual.carbs * 10) / 10}g</span>
          <span className="food-result-item__macro">F {Math.round(actual.fat * 10) / 10}g</span>
          <span className="food-result-item__macro">{Math.round(actual.servingSizeGrams)}g</span>
        </div>
      </div>

      {summary && (
        <div className="summary-card" style={{ marginTop: "var(--sp-4)" }}>
          <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-2)", marginBottom: "var(--sp-3)" }}>
            Daily Impact
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)", fontSize: "var(--text-sm)" }}>
            <div>
              <div style={{ color: "var(--text-2)", marginBottom: "var(--sp-1)" }}>Current</div>
              <div>{Math.round(summary.totalCalories)} kcal</div>
              <div>P {Math.round(summary.totalProtein)}g</div>
              <div>C {Math.round(summary.totalCarbs)}g</div>
              <div>F {Math.round(summary.totalFat)}g</div>
            </div>
            <div>
              <div style={{ color: "var(--text-2)", marginBottom: "var(--sp-1)" }}>After this meal</div>
              <div>
                {Math.round(summary.totalCalories + actual.calories)} kcal
                {goals && <span style={{ color: "var(--text-2)", fontSize: "var(--text-xs)" }}> / {goals.caloriesTarget}</span>}
              </div>
              <div>
                P {Math.round(summary.totalProtein + actual.protein)}g
                {goals && <span style={{ color: "var(--text-2)", fontSize: "var(--text-xs)" }}> / {goals.proteinTarget}g</span>}
              </div>
              <div>
                C {Math.round(summary.totalCarbs + actual.carbs)}g
                {goals && <span style={{ color: "var(--text-2)", fontSize: "var(--text-xs)" }}> / {goals.carbsTarget}g</span>}
              </div>
              <div>
                F {Math.round(summary.totalFat + actual.fat)}g
                {goals && <span style={{ color: "var(--text-2)", fontSize: "var(--text-xs)" }}> / {goals.fatTarget}g</span>}
              </div>
            </div>
          </div>
          {goals === null && (
            <p style={{ marginTop: "var(--sp-3)", fontSize: "var(--text-sm)", color: "var(--text-2)" }}>
              <Link to="/goal-setup" className="link-btn">Set your nutrition goals</Link> to see progress against targets.
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: "var(--sp-5)" }}>
        <p style={{ margin: "0 0 var(--sp-3)", fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-1)" }}>
          Select meal type
        </p>
        <MealTypeSelector selected={selectedMealType} onSelect={setSelectedMealType} />
      </div>

      {logError && (
        <div className="alert alert--error" style={{ marginTop: "var(--sp-3)" }}>
          {logError}
          <div style={{ marginTop: "var(--sp-2)" }}>
            <button type="button" className="button-secondary" onClick={handleRetry} disabled={isLogging}>
              {isLogging ? "Retrying…" : "Try again"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "var(--sp-3)", marginTop: "var(--sp-5)" }}>
        <button
          type="button"
          className="button-primary"
          onClick={handleConfirm}
          disabled={qty <= 0 || !selectedMealType || isLogging}
        >
          {isLogging ? "Logging…" : "Confirm & Log"}
        </button>
        <button type="button" className="button-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default FoodLogConfirm;
