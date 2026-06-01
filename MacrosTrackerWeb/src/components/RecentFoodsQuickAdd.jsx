import { useState, useEffect } from "react";
import { Search, Plus, Check, Clock, Edit2, Sparkles, Image as ImageIcon } from "lucide-react";
import { getRecentFoods } from "../api/nutritionLogClient";
import { logMeal } from "../api/foodScanClient";
import client from "../api/client";

// Get base URL for image resolution
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://localhost:7159";

// Helper to format last used dates nicely
const formatLastUsed = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  
  // Reset hours to calculate day differences accurately
  const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = nowDate - dDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Default meal type based on current hour
const getDefaultMealType = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 1; // Breakfast
  if (hour >= 11 && hour < 16) return 2; // Lunch
  if (hour >= 16 && hour < 21) return 3; // Dinner
  return 4; // Snack
};

export default function RecentFoodsQuickAdd({ onSuccess }) {
  const [recentFoods, setRecentFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom serving states per food item: { [foodId]: grams }
  const [servings, setServings] = useState({});
  // Selected meal type per food item: { [foodId]: mealTypeVal }
  const [mealTypes, setMealTypes] = useState({});
  // Logged states for success animation: { [foodId]: boolean }
  const [loggedItems, setLoggedItems] = useState({});
  // Individual loading state for button: { [foodId]: boolean }
  const [isLoggingItem, setIsLoggingItem] = useState({});

  useEffect(() => {
    loadRecentFoods();
  }, []);

  const loadRecentFoods = () => {
    setIsLoading(true);
    getRecentFoods()
      .then((data) => {
        const list = data ?? [];
        setRecentFoods(list);
        
        // Initialize servings and meal types
        const initialServings = {};
        const initialMealTypes = {};
        list.forEach(item => {
          initialServings[item.id] = item.lastServingSizeGrams > 0 ? item.lastServingSizeGrams : item.servingSizeGrams;
          initialMealTypes[item.id] = getDefaultMealType();
        });
        setServings(initialServings);
        setMealTypes(initialMealTypes);
      })
      .catch((err) => {
        console.error("Failed to load recent foods", err);
        setRecentFoods([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleServingChange = (foodId, value) => {
    const parsed = parseFloat(value);
    setServings(prev => ({
      ...prev,
      [foodId]: isNaN(parsed) || parsed < 0 ? 0 : parsed
    }));
  };

  const handleMealTypeChange = (foodId, mealType) => {
    setMealTypes(prev => ({
      ...prev,
      [foodId]: mealType
    }));
  };

  const handleQuickAdd = async (item) => {
    const foodId = item.id;
    const currentServing = servings[foodId] ?? item.servingSizeGrams;
    const currentMealType = mealTypes[foodId] ?? getDefaultMealType();

    if (currentServing <= 0) return;

    // Recalculate based on input serving size
    const factor = item.servingSizeGrams > 0 ? currentServing / item.servingSizeGrams : 1;
    const payload = {
      foodName: item.name,
      calories: Math.round(item.caloriesPerServing * factor * 10) / 10,
      protein: Math.round(item.proteinPerServing * factor * 10) / 10,
      carbs: Math.round(item.carbsPerServing * factor * 10) / 10,
      fat: Math.round(item.fatPerServing * factor * 10) / 10,
      servingSizeGrams: Math.round(currentServing * 10) / 10,
      mealType: currentMealType,
      foodScanId: null,
      localFoodItemId: item.id
    };

    setIsLoggingItem(prev => ({ ...prev, [foodId]: true }));
    try {
      await logMeal(payload);
      
      // Success animation trigger
      setLoggedItems(prev => ({ ...prev, [foodId]: true }));
      setTimeout(() => {
        setLoggedItems(prev => ({ ...prev, [foodId]: false }));
      }, 2000);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to quick-add meal", err);
      alert("Error adding food. Please try again.");
    } finally {
      setIsLoggingItem(prev => ({ ...prev, [foodId]: false }));
    }
  };

  const filteredFoods = recentFoods.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="recent-quick-add-section">
      <div className="recent-quick-add-header">
        <div className="recent-quick-add-title-box">
          <Clock size={16} className="text-accent" />
          <h3 className="recent-quick-add-title">Quick Add Recent Foods</h3>
        </div>
        
        {recentFoods.length > 0 && (
          <div className="recent-quick-add-search-wrapper">
            <Search size={14} className="recent-quick-add-search-icon" />
            <input
              type="text"
              placeholder="Search recent..."
              className="recent-quick-add-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="recent-quick-add-loading">
          <div className="recent-quick-add-spinner" />
          <span>Loading recently logged meals...</span>
        </div>
      ) : recentFoods.length === 0 ? (
        <div className="recent-quick-add-empty">
          <Sparkles size={20} className="text-muted" style={{ opacity: 0.6, marginBottom: "6px" }} />
          <span>No meals logged in the last 30 days yet.</span>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="recent-quick-add-empty">
          <span>No recent foods match "{searchQuery}"</span>
        </div>
      ) : (
        <div className="recent-quick-add-grid">
          {filteredFoods.map(item => {
            const currentServing = servings[item.id] ?? item.servingSizeGrams;
            const factor = item.servingSizeGrams > 0 ? currentServing / item.servingSizeGrams : 1;
            const calculatedCals = Math.round(item.caloriesPerServing * factor);
            const calculatedProtein = Math.round(item.proteinPerServing * factor * 10) / 10;
            const calculatedCarbs = Math.round(item.carbsPerServing * factor * 10) / 10;
            const calculatedFat = Math.round(item.fatPerServing * factor * 10) / 10;
            
            const isLogged = loggedItems[item.id];
            const isLogging = isLoggingItem[item.id];
            const selectedMeal = mealTypes[item.id] ?? 1;

            const imageUrl = item.imagePath 
              ? `${API_BASE_URL}/${item.imagePath}` 
              : null;

            return (
              <div 
                key={item.id} 
                className={`recent-food-card ${isLogged ? 'recent-food-card--success' : ''}`}
              >
                {/* Food Image or Fallback */}
                <div className="recent-food-card__img-container">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={item.name} 
                      className="recent-food-card__img"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="recent-food-card__fallback-img">
                      <ImageIcon size={18} />
                    </div>
                  )}
                  <span className="recent-food-card__time-badge">
                    {formatLastUsed(item.lastUsedAt)}
                  </span>
                </div>

                {/* Food Info */}
                <div className="recent-food-card__body">
                  <div className="recent-food-card__row">
                    <h4 className="recent-food-card__name" title={item.name}>{item.name}</h4>
                    <span className="recent-food-card__cals">{calculatedCals} kcal</span>
                  </div>

                  {/* Macros breakdown */}
                  <div className="recent-food-card__macros">
                    <span className="recent-food-macro recent-food-macro--p">P: {calculatedProtein}g</span>
                    <span className="recent-food-macro recent-food-macro--c">C: {calculatedCarbs}g</span>
                    <span className="recent-food-macro recent-food-macro--f">F: {calculatedFat}g</span>
                  </div>

                  {/* Inline controls */}
                  <div className="recent-food-card__controls">
                    {/* Serving Input */}
                    <div className="recent-food-card__serving-box">
                      <span className="recent-food-card__serving-label">Serving (g)</span>
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        className="recent-food-card__serving-input"
                        value={currentServing}
                        onChange={(e) => handleServingChange(item.id, e.target.value)}
                        disabled={isLogging || isLogged}
                      />
                    </div>

                    {/* Meal Selector Tags */}
                    <div className="recent-food-card__meals">
                      {[
                        { val: 1, label: "B" },
                        { val: 2, label: "L" },
                        { val: 3, label: "D" },
                        { val: 4, label: "S" }
                      ].map(mealOpt => (
                        <button
                          key={mealOpt.val}
                          type="button"
                          className={`recent-food-card__meal-btn ${selectedMeal === mealOpt.val ? 'recent-food-card__meal-btn--active' : ''}`}
                          onClick={() => handleMealTypeChange(item.id, mealOpt.val)}
                          disabled={isLogging || isLogged}
                          title={mealOpt.val === 1 ? "Breakfast" : mealOpt.val === 2 ? "Lunch" : mealOpt.val === 3 ? "Dinner" : "Snack"}
                        >
                          {mealOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(item)}
                    className={`recent-food-card__add-btn ${isLogged ? 'recent-food-card__add-btn--success' : ''}`}
                    disabled={isLogging || isLogged || currentServing <= 0}
                  >
                    {isLogged ? (
                      <>
                        <Check size={14} className="animate-scale" />
                        <span>Logged!</span>
                      </>
                    ) : isLogging ? (
                      <>
                        <div className="recent-food-card__btn-spinner" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>Quick Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
