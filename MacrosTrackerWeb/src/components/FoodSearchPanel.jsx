import { useState, useEffect, useRef } from "react";
import { searchFood, logMeal } from "../api/foodScanClient";
import MealTypeSelector from "./MealTypeSelector";

function FoodSearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [selected, setSelected] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const [logError, setLogError] = useState(null);
  const [logSuccess, setLogSuccess] = useState(false);

  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await searchFood(query.trim());
        setResults(res.data.data ?? []);
      } catch {
        setSearchError("Search failed. Please try again.");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function handleConfirmLog() {
    if (!selected || !selectedMealType) return;
    setIsLogging(true);
    setLogError(null);
    try {
      await logMeal({
        foodName: selected.name,
        calories: selected.caloriesPerServing,
        protein: selected.proteinPerServing,
        carbs: selected.carbsPerServing,
        fat: selected.fatPerServing,
        servingSizeGrams: selected.servingSizeGrams ?? null,
        mealType: selectedMealType,
        foodScanId: null,
        localFoodItemId: selected.id,
      });
      setLogSuccess(true);
    } catch (err) {
      setLogError(err.response?.data?.message ?? "Failed to log the meal. Please try again.");
    } finally {
      setIsLogging(false);
    }
  }

  function handleReset() {
    setQuery("");
    setResults([]);
    setSelected(null);
    setSelectedMealType(null);
    setLogSuccess(false);
    setLogError(null);
    setSearchError(null);
  }

  if (logSuccess) {
    return (
      <div className="empty-state">
        <p style={{ fontSize: "1.8rem", marginBottom: "var(--sp-3)", color: "var(--success)" }}>✓</p>
        <p style={{ fontWeight: 600, fontSize: "var(--text-base)", color: "var(--text-1)", marginBottom: "var(--sp-5)" }}>
          Meal logged successfully!
        </p>
        <button type="button" className="button-secondary" onClick={handleReset}>
          Search another food
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search for a food (e.g. Koshary, Feteer)…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(null);
          setSelectedMealType(null);
        }}
        className="food-search__input"
        autoFocus
      />

      {isSearching && (
        <p className="text-muted" style={{ marginTop: "var(--sp-2)" }}>Searching…</p>
      )}

      {searchError && (
        <div className="alert alert--error">{searchError}</div>
      )}

      {!selected && results.length > 0 && (
        <div style={{ marginTop: "var(--sp-3)" }}>
          {results.map((item) => (
            <div
              key={item.id}
              className="food-result-item"
              onClick={() => {
                setSelected(item);
                setSelectedMealType(null);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelected(item)}
            >
              <div className="food-result-item__name">{item.name}</div>
              <div className="food-result-item__macros">
                <span className="food-result-item__macro">{Math.round(item.caloriesPerServing)} kcal</span>
                <span className="food-result-item__macro">P {Math.round(item.proteinPerServing)}g</span>
                <span className="food-result-item__macro">C {Math.round(item.carbsPerServing)}g</span>
                <span className="food-result-item__macro">F {Math.round(item.fatPerServing)}g</span>
                {item.servingSizeGrams && (
                  <span className="food-result-item__macro">~{item.servingSizeGrams}g</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!selected && query.trim() && !isSearching && results.length === 0 && !searchError && (
        <p className="text-muted" style={{ marginTop: "var(--sp-3)" }}>No results found for "{query}".</p>
      )}

      {selected && (
        <div style={{ marginTop: "var(--sp-5)" }}>
          <div className="food-selected-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "var(--text-base)", marginBottom: "var(--sp-1)", color: "var(--text-1)" }}>
                  {selected.name}
                </div>
                <div className="food-result-item__macros">
                  <span className="food-result-item__macro">{Math.round(selected.caloriesPerServing)} kcal</span>
                  <span className="food-result-item__macro">P {Math.round(selected.proteinPerServing)}g</span>
                  <span className="food-result-item__macro">C {Math.round(selected.carbsPerServing)}g</span>
                  <span className="food-result-item__macro">F {Math.round(selected.fatPerServing)}g</span>
                </div>
              </div>
              <button type="button" className="link-btn" onClick={() => setSelected(null)}>Change</button>
            </div>
          </div>

          <p style={{ margin: "0 0 var(--sp-3)", fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-1)" }}>
            Select meal type
          </p>
          <MealTypeSelector selected={selectedMealType} onSelect={setSelectedMealType} />

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
            <button type="button" className="button-secondary" onClick={() => setSelected(null)}>
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodSearchPanel;
