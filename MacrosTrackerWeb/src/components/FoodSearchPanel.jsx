import { useState, useEffect, useRef } from "react";
import { searchFood, logMeal } from "../api/foodScanClient";
import MealTypeSelector from "./MealTypeSelector";

const inputStyle = {
  width: "100%",
  minHeight: 48,
  padding: "0 16px",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.08)",
  color: "#f7f4ec",
  fontSize: "1rem",
  boxSizing: "border-box",
};

const resultItem = {
  padding: "14px 16px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  cursor: "pointer",
  marginBottom: 8,
  transition: "background 120ms",
};

const macroRow = {
  display: "flex",
  gap: 16,
  marginTop: 4,
  flexWrap: "wrap",
};

const mutedSmall = { color: "rgba(247,244,236,0.6)", fontSize: "0.82rem" };

const selectedCard = {
  padding: "18px 20px",
  borderRadius: 18,
  background: "rgba(246,197,103,0.07)",
  border: "1px solid rgba(246,197,103,0.2)",
  marginBottom: 20,
};

const linkButton = {
  background: "none",
  border: "none",
  padding: 0,
  color: "#f6c567",
  cursor: "pointer",
  textDecoration: "underline",
  font: "inherit",
  fontSize: "0.9rem",
};

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
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✓</div>
        <p style={{ margin: "0 0 20px", fontWeight: 600, fontSize: "1.1rem" }}>
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
        style={inputStyle}
        autoFocus
      />

      {isSearching && (
        <p style={{ ...mutedSmall, marginTop: 10 }}>Searching…</p>
      )}

      {searchError && (
        <p style={{ color: "#fda4af", fontSize: "0.9rem", marginTop: 10 }}>{searchError}</p>
      )}

      {!selected && results.length > 0 && (
        <div style={{ marginTop: 14 }}>
          {results.map((item) => (
            <div
              key={item.id}
              style={resultItem}
              onClick={() => {
                setSelected(item);
                setSelectedMealType(null);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelected(item)}
            >
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.name}</div>
              <div style={macroRow}>
                <span style={mutedSmall}>{Math.round(item.caloriesPerServing)} kcal</span>
                <span style={mutedSmall}>P {Math.round(item.proteinPerServing)}g</span>
                <span style={mutedSmall}>C {Math.round(item.carbsPerServing)}g</span>
                <span style={mutedSmall}>F {Math.round(item.fatPerServing)}g</span>
                {item.servingSizeGrams && (
                  <span style={mutedSmall}>~{item.servingSizeGrams}g serving</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!selected && query.trim() && !isSearching && results.length === 0 && !searchError && (
        <p style={{ ...mutedSmall, marginTop: 14 }}>No results found for "{query}".</p>
      )}

      {selected && (
        <div style={{ marginTop: 20 }}>
          <div style={selectedCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 4 }}>{selected.name}</div>
                <div style={macroRow}>
                  <span style={mutedSmall}>{Math.round(selected.caloriesPerServing)} kcal</span>
                  <span style={mutedSmall}>P {Math.round(selected.proteinPerServing)}g</span>
                  <span style={mutedSmall}>C {Math.round(selected.carbsPerServing)}g</span>
                  <span style={mutedSmall}>F {Math.round(selected.fatPerServing)}g</span>
                </div>
              </div>
              <button type="button" style={linkButton} onClick={() => setSelected(null)}>
                Change
              </button>
            </div>
          </div>

          <p style={{ margin: "0 0 12px", fontWeight: 600 }}>Select meal type</p>
          <MealTypeSelector selected={selectedMealType} onSelect={setSelectedMealType} />

          {logError && (
            <p style={{ color: "#fda4af", fontSize: "0.9rem", marginTop: 12 }}>{logError}</p>
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
