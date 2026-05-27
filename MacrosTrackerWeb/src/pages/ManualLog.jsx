import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import FoodLogConfirm from "../components/FoodLogConfirm";
import { searchFood } from "../api/foodScanClient";
import { getRecentFoods } from "../api/nutritionLogClient";

function ManualLog() {
  const navigate = useNavigate();
  const [view, setView] = useState("search");
  const [selectedFood, setSelectedFood] = useState(null);
  const [initialQuantity, setInitialQuantity] = useState(1);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [recentFoods, setRecentFoods] = useState([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  const debounceRef = useRef(null);

  useEffect(() => {
    getRecentFoods()
      .then((data) => setRecentFoods(data ?? []))
      .catch(() => setRecentFoods([]))
      .finally(() => setIsLoadingRecent(false));
  }, []);

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

  function handleSelectFood(food, qty = 1) {
    setSelectedFood(food);
    setInitialQuantity(qty);
    setView("confirm");
  }

  function handleCancel() {
    setView("search");
    setSelectedFood(null);
  }

  function handleSuccess() {
    navigate("/history");
  }

  return (
    <PageShell
      eyebrow="Nutrition"
      title="Log Food"
      description="Search for a food to log it to your diary."
    >
      {view === "search" && (
        <div>
          {isLoadingRecent && <div className="spinner" />}

          {!isLoadingRecent && recentFoods.length > 0 && (
            <div style={{ marginBottom: "var(--sp-5)" }}>
              <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-2)", marginBottom: "var(--sp-2)" }}>
                Recent Foods
              </p>
              {recentFoods.map((item) => {
                const qty = item.servingSizeGrams > 0
                  ? item.lastServingSizeGrams / item.servingSizeGrams
                  : 1;
                return (
                  <div
                    key={item.id}
                    className="food-result-item"
                    onClick={() => handleSelectFood(item, qty)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSelectFood(item, qty)}
                  >
                    <div className="food-result-item__name">{item.name}</div>
                    <div className="food-result-item__macros">
                      <span className="food-result-item__macro">{Math.round(item.caloriesPerServing)} kcal per serving</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <input
            type="text"
            placeholder="Search for a food (e.g. Koshary, Feteer)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="food-search__input"
            autoFocus={recentFoods.length === 0}
          />

          {isSearching && (
            <p className="text-muted" style={{ marginTop: "var(--sp-2)" }}>Searching…</p>
          )}

          {searchError && (
            <div className="alert alert--error">{searchError}</div>
          )}

          {!isSearching && query.trim() && results.length === 0 && !searchError && (
            <p className="text-muted" style={{ marginTop: "var(--sp-3)" }}>
              No results found. Try different keywords or use the{" "}
              <Link to="/scan" className="link-btn">Scan page</Link>.
            </p>
          )}

          {results.length > 0 && (
            <div style={{ marginTop: "var(--sp-3)" }}>
              {results.map((item) => (
                <div
                  key={item.id}
                  className="food-result-item"
                  onClick={() => handleSelectFood(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleSelectFood(item)}
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
        </div>
      )}

      {view === "confirm" && selectedFood && (
        <FoodLogConfirm
          food={selectedFood}
          initialQuantity={initialQuantity}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      )}
    </PageShell>
  );
}

export default ManualLog;
