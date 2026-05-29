import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Camera, Plus, Clock, Star, ChevronRight, UploadCloud, ArrowLeft } from "lucide-react";
import PageShell from "../components/PageShell";
import FoodLogConfirm from "../components/FoodLogConfirm";
import { searchFood, analyzeFood, logMeal } from "../api/foodScanClient";
import { getRecentFoods } from "../api/nutritionLogClient";
import MealTypeSelector from "../components/MealTypeSelector";
import "./ManualLog.css";

function LogFood() {
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState("search"); // search, scan, quick
  const [activeSideTab, setActiveSideTab] = useState("recent"); // recent, favorites
  
  const [selectedFood, setSelectedFood] = useState(null);
  
  // Search State
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const debounceRef = useRef(null);

  // Scan State
  const fileInputRef = useRef(null);
  const [scanFile, setScanFile] = useState(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);

  // Quick Add State
  const [quickAdd, setQuickAdd] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });
  const [quickAddMealType, setQuickAddMealType] = useState(null);
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickAddError, setQuickAddError] = useState(null);

  // Recent Foods State
  const [recentFoods, setRecentFoods] = useState([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  useEffect(() => {
    getRecentFoods()
      .then((data) => setRecentFoods(data ?? []))
      .catch(() => setRecentFoods([]))
      .finally(() => setIsLoadingRecent(false));
  }, []);

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
        setSearchError("Search failed. Please try again.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handleSelectFood(food, qty = 1) {
    setSelectedFood({ food, qty });
  }

  // --- Scan Handlers ---
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  }

  function processFile(file) {
    setScanError(null);
    if (file.size > 10 * 1024 * 1024) {
      setScanError("File is too large. Max 10MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setScanFile(file);
    setScanPreviewUrl(url);
  }

  async function handleAnalyze() {
    if (!scanFile) return;
    setIsScanning(true);
    setScanError(null);
    try {
      const formData = new FormData();
      formData.append("image", scanFile);
      const res = await analyzeFood(formData);
      const data = res.data.data;
      
      const mappedFood = {
        id: data.localFoodItemId,
        name: data.foodName,
        caloriesPerServing: data.calories,
        proteinPerServing: data.protein,
        carbsPerServing: data.carbs,
        fatPerServing: data.fat,
        servingSizeGrams: data.servingSizeGrams || 100
      };
      
      setSelectedFood({ food: mappedFood, qty: 1 });
      setScanFile(null);
      setScanPreviewUrl(null);
    } catch (err) {
      setScanError(err.response?.data?.message ?? "Failed to analyze. Try again.");
    } finally {
      setIsScanning(false);
    }
  }

  // --- Quick Add Handler ---
  async function handleQuickAddSubmit(e) {
    e.preventDefault();
    if (!quickAdd.name || !quickAdd.calories || !quickAddMealType) return;
    setIsQuickAdding(true);
    setQuickAddError(null);
    try {
      await logMeal({
        foodName: quickAdd.name,
        calories: Number(quickAdd.calories),
        protein: Number(quickAdd.protein) || 0,
        carbs: Number(quickAdd.carbs) || 0,
        fat: Number(quickAdd.fat) || 0,
        servingSizeGrams: null,
        mealType: quickAddMealType,
        foodScanId: null,
        localFoodItemId: null,
      });
      navigate("/history");
    } catch (err) {
      setQuickAddError("Failed to log quick add.");
    } finally {
      setIsQuickAdding(false);
    }
  }

  return (
    <PageShell
      eyebrow="Nutrition"
      title="Log Food"
      description="Track your meals quickly and effortlessly."
    >
      {selectedFood ? (
        <div className="fade-enter">
          <button 
            onClick={() => setSelectedFood(null)} 
            className="link-btn" 
            style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "var(--sp-4)" }}
          >
            <ArrowLeft size={16} /> Back to options
          </button>
          <FoodLogConfirm
            food={selectedFood.food}
            initialQuantity={selectedFood.qty}
            onCancel={() => setSelectedFood(null)}
            onSuccess={() => navigate("/history")}
          />
        </div>
      ) : (
        <div className="log-food-container">
          
          <div className="log-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="log-tabs">
              <button 
                className={`log-tab-btn ${activeMainTab === 'search' ? 'active' : ''}`}
                onClick={() => setActiveMainTab('search')}
              >
                <Search size={18} /> Search
              </button>
              <button 
                className={`log-tab-btn ${activeMainTab === 'scan' ? 'active' : ''}`}
                onClick={() => setActiveMainTab('scan')}
              >
                <Camera size={18} /> AI Scan
              </button>
              <button 
                className={`log-tab-btn ${activeMainTab === 'quick' ? 'active' : ''}`}
                onClick={() => setActiveMainTab('quick')}
              >
                <Plus size={18} /> Quick Add
              </button>
            </div>
            
            <div className="log-tab-content" style={{ flex: 1 }}>
              
              {/* SEARCH TAB */}
              {activeMainTab === "search" && (
                <div className="fade-enter">
                  <input
                    type="text"
                    placeholder="Search for a food (e.g. Koshary, Oatmeal)…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="food-search__input"
                    autoFocus
                  />
                  {isSearching && <p className="text-muted" style={{ marginTop: "var(--sp-3)" }}>Searching database…</p>}
                  {searchError && <div className="alert alert--error" style={{ marginTop: "var(--sp-3)" }}>{searchError}</div>}
                  
                  {!isSearching && query.trim() && searchResults.length === 0 && !searchError && (
                    <p className="text-muted" style={{ marginTop: "var(--sp-3)" }}>No results found. Try Quick Add.</p>
                  )}

                  {searchResults.length > 0 && (
                    <div style={{ marginTop: "var(--sp-4)" }}>
                      {searchResults.map(item => (
                        <div key={item.id} className="log-list-item" onClick={() => handleSelectFood(item)}>
                          <div>
                            <div className="log-list-item-title">{item.name}</div>
                            <div className="log-list-item-meta">
                              <span>{Math.round(item.caloriesPerServing)} kcal</span>
                              <span>•</span>
                              <span>P: {Math.round(item.proteinPerServing)}g</span>
                              <span>C: {Math.round(item.carbsPerServing)}g</span>
                              <span>F: {Math.round(item.fatPerServing)}g</span>
                            </div>
                          </div>
                          <ChevronRight size={16} className="log-list-item-action" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SCAN TAB */}
              {activeMainTab === "scan" && (
                <div className="fade-enter text-center">
                  {!scanPreviewUrl ? (
                    <div 
                      className="scan-drop-area"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                    >
                      <UploadCloud size={32} className="scan-drop-icon" />
                      <div>
                        <div className="scan-drop-title">Drag & Drop photo</div>
                        <div className="scan-drop-hint">or click to browse from device</div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <img src={scanPreviewUrl} alt="Scan preview" className="scan-preview-img" />
                      <div style={{ display: "flex", gap: "var(--sp-3)", justifyContent: "center" }}>
                        <button className="button-primary" onClick={handleAnalyze} disabled={isScanning}>
                          {isScanning ? "Analyzing…" : "Analyze Meal"}
                        </button>
                        <button className="button-secondary" onClick={() => { setScanFile(null); setScanPreviewUrl(null); }} disabled={isScanning}>
                          Retake
                        </button>
                      </div>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
                  {scanError && <div className="alert alert--error" style={{ marginTop: "var(--sp-4)" }}>{scanError}</div>}
                </div>
              )}

              {/* QUICK ADD TAB */}
              {activeMainTab === "quick" && (
                <form onSubmit={handleQuickAddSubmit} className="fade-enter">
                  <div className="quick-add-grid">
                    <div className="quick-add-full">
                      <label className="quick-add-label">Food Name</label>
                      <input required type="text" className="food-search__input" value={quickAdd.name} onChange={e => setQuickAdd({ ...quickAdd, name: e.target.value })} placeholder="e.g. Homemade Sandwich" />
                    </div>
                    <div>
                      <label className="quick-add-label">Calories (kcal)</label>
                      <input required type="number" min="0" className="food-search__input" value={quickAdd.calories} onChange={e => setQuickAdd({ ...quickAdd, calories: e.target.value })} placeholder="e.g. 350" />
                    </div>
                    <div>
                      <label className="quick-add-label">Protein (g)</label>
                      <input type="number" min="0" className="food-search__input" value={quickAdd.protein} onChange={e => setQuickAdd({ ...quickAdd, protein: e.target.value })} placeholder="0" />
                    </div>
                    <div>
                      <label className="quick-add-label">Carbs (g)</label>
                      <input type="number" min="0" className="food-search__input" value={quickAdd.carbs} onChange={e => setQuickAdd({ ...quickAdd, carbs: e.target.value })} placeholder="0" />
                    </div>
                    <div>
                      <label className="quick-add-label">Fat (g)</label>
                      <input type="number" min="0" className="food-search__input" value={quickAdd.fat} onChange={e => setQuickAdd({ ...quickAdd, fat: e.target.value })} placeholder="0" />
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "var(--sp-5)" }}>
                    <label className="quick-add-label">Meal Type</label>
                    <MealTypeSelector selected={quickAddMealType} onSelect={setQuickAddMealType} />
                  </div>

                  {quickAddError && <div className="alert alert--error" style={{ marginBottom: "var(--sp-4)" }}>{quickAddError}</div>}

                  <button type="submit" className="button-primary" style={{ width: "100%" }} disabled={isQuickAdding || !quickAddMealType}>
                    {isQuickAdding ? "Logging…" : "Log Food Quickly"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="log-card" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
            <div className="log-tabs">
              <button 
                className={`log-tab-btn ${activeSideTab === 'recent' ? 'active' : ''}`}
                onClick={() => setActiveSideTab('recent')}
              >
                <Clock size={16} /> Recent
              </button>
              <button 
                className={`log-tab-btn ${activeSideTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveSideTab('favorites')}
              >
                <Star size={16} /> Favorites
              </button>
            </div>
            <div className="log-tab-content">
              {activeSideTab === 'recent' && (
                <div className="fade-enter">
                  {isLoadingRecent ? (
                    <p className="text-muted text-sm">Loading recent foods…</p>
                  ) : recentFoods.length > 0 ? (
                    recentFoods.map(item => {
                      const qty = item.servingSizeGrams > 0 ? item.lastServingSizeGrams / item.servingSizeGrams : 1;
                      return (
                        <div key={item.id} className="log-list-item" style={{ padding: "var(--sp-2) 0" }} onClick={() => handleSelectFood(item, qty)}>
                          <div>
                            <div className="log-list-item-title" style={{ fontSize: "var(--text-sm)" }}>{item.name}</div>
                            <div className="log-list-item-meta">{Math.round(item.caloriesPerServing)} kcal</div>
                          </div>
                          <Plus size={16} className="log-list-item-action" />
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-muted text-sm text-center py-4">No recent foods found.</p>
                  )}
                </div>
              )}

              {activeSideTab === 'favorites' && (
                <div className="fade-enter text-center py-6">
                  <Star size={24} className="text-muted mx-auto mb-2 opacity-50" style={{ display: 'block' }} />
                  <p className="text-muted text-sm">Favorites coming soon.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </PageShell>
  );
}

export default LogFood;
