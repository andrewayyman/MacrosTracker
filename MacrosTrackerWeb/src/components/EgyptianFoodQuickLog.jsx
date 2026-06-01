import { useState, useEffect } from "react";
import { Search, Plus, Check, Sparkles, Scale, Info, Clock, CheckCircle } from "lucide-react";
import { searchFood, logMeal } from "../api/foodScanClient";

// Helper to get default meal type based on time of day
const getDefaultMealType = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 1; // Breakfast
  if (hour >= 11 && hour < 16) return 2; // Lunch
  if (hour >= 16 && hour < 21) return 3; // Dinner
  return 4; // Snack
};

// Detailed metadata for the cards
const EGYPTIAN_FOODS_METADATA = [
  {
    key: "koshary",
    displayName: "Koshary",
    arabicName: "كشري",
    query: "Koshary",
    tag: "Comfort Food / High Carb",
    description: "Egypt's national dish. Layered rice, macaroni, brown lentils, chickpeas, savory garlic-vinegar sauce, and crispy caramelized onions.",
    gradient: "linear-gradient(135deg, oklch(0.97 0.015 45) 0%, oklch(0.94 0.03 45) 100%)",
    accentColor: "oklch(0.55 0.15 45)",
    fallback: {
      id: "a0000001-0000-0000-0000-000000000001",
      name: "Koshary",
      caloriesPerServing: 560,
      proteinPerServing: 19.3,
      carbsPerServing: 98,
      fatPerServing: 10.5,
      servingSizeGrams: 350
    }
  },
  {
    key: "ful",
    displayName: "Ful Medames",
    arabicName: "فول مدمس",
    query: "Ful Medames",
    tag: "High Protein / Traditional",
    description: "Slow-cooked creamy fava beans seasoned with extra virgin olive oil, ground cumin, garlic, and fresh lemon juice. A timeless breakfast favorite.",
    gradient: "linear-gradient(135deg, oklch(0.96 0.02 85) 0%, oklch(0.92 0.04 85) 100%)",
    accentColor: "oklch(0.48 0.12 85)",
    fallback: {
      id: "a0000001-0000-0000-0000-000000000002",
      name: "Ful Medames",
      caloriesPerServing: 275,
      proteinPerServing: 18.8,
      carbsPerServing: 37.5,
      fatPerServing: 6.3,
      servingSizeGrams: 250
    }
  },
  {
    key: "taameya",
    displayName: "Ta'meya (Falafel)",
    arabicName: "طعمية",
    query: "Ta'meya",
    tag: "High Fiber / Vegetarian",
    description: "Vibrant green Egyptian falafel made from rich fava beans, fresh coriander, parsley, and leeks, coated in sesame seeds and fried to crunchy perfection.",
    gradient: "linear-gradient(135deg, oklch(0.97 0.03 145) 0%, oklch(0.93 0.05 145) 100%)",
    accentColor: "oklch(0.42 0.12 155)",
    fallback: {
      id: "a0000001-0000-0000-0000-000000000003",
      name: "Ta'meya",
      caloriesPerServing: 198,
      proteinPerServing: 7.8,
      carbsPerServing: 19.2,
      fatPerServing: 10.8,
      servingSizeGrams: 60
    }
  },
  {
    key: "baladi",
    displayName: "Baladi Bread",
    arabicName: "عيش بلدي",
    query: "Baladi Bread",
    tag: "Whole Wheat Carb",
    description: "Bran-dusted, high-temperature clay oven flatbread. The ultimate vessel and companion for dips, sandwich pockets, and traditional Egyptian spreads.",
    gradient: "linear-gradient(135deg, oklch(0.97 0.02 65) 0%, oklch(0.93 0.04 65) 100%)",
    accentColor: "oklch(0.58 0.14 72)",
    fallback: {
      id: "a0000001-0000-0000-0000-000000000013",
      name: "Baladi Bread",
      caloriesPerServing: 247.5,
      proteinPerServing: 8.1,
      carbsPerServing: 49.5,
      fatPerServing: 1.4,
      servingSizeGrams: 90
    }
  },
  {
    key: "shawarma",
    displayName: "Shawarma",
    arabicName: "شاورما",
    query: "Shawarma",
    tag: "High Protein / Savory",
    description: "Perfectly seasoned shaved meat or chicken cooked on a vertical rotisserie, mixed with fresh tomatoes, parsley, and garlic sauce.",
    gradient: "linear-gradient(135deg, oklch(0.96 0.035 30) 0%, oklch(0.92 0.06 30) 100%)",
    accentColor: "oklch(0.49 0.17 25)",
    fallback: {
      id: "a0000001-0000-0000-0000-000000000009",
      name: "Shawarma",
      caloriesPerServing: 537.5,
      proteinPerServing: 42.5,
      carbsPerServing: 30,
      fatPerServing: 27.5,
      servingSizeGrams: 250
    }
  },
  {
    key: "molokhia",
    displayName: "Molokhia",
    arabicName: "ملوخية",
    query: "Molokhia",
    tag: "Low Calorie / Nutrients",
    description: "Finely minced jute leaf broth cooked in aromatic chicken broth, finished with 'Ta'sha' (sautéed crushed garlic and ground coriander seeds).",
    gradient: "linear-gradient(135deg, oklch(0.96 0.03 160) 0%, oklch(0.92 0.05 160) 100%)",
    accentColor: "oklch(0.42 0.12 165)",
    fallback: {
      id: "a0000001-0000-0000-0000-000000000005",
      name: "Molokhia",
      caloriesPerServing: 90,
      proteinPerServing: 9,
      carbsPerServing: 10.5,
      fatPerServing: 1.2,
      servingSizeGrams: 300
    }
  },
  {
    key: "rice",
    displayName: "Egyptian Rice",
    arabicName: "أرز مصري",
    query: "Egyptian Rice",
    tag: "Energy Carb Source",
    description: "Plump, aromatic short-grain white rice steamed with vermicelli (she'reya), butter, and chicken broth. Fluffy and rich in flavor.",
    gradient: "linear-gradient(135deg, oklch(0.97 0.015 90) 0%, oklch(0.93 0.03 90) 100%)",
    accentColor: "oklch(0.52 0.08 90)",
    fallback: {
      id: "a0000001-0000-0000-0000-000000000012",
      name: "Egyptian Rice",
      caloriesPerServing: 360,
      proteinPerServing: 7,
      carbsPerServing: 70,
      fatPerServing: 6,
      servingSizeGrams: 200
    }
  },
  {
    key: "chicken",
    displayName: "Grilled Chicken",
    arabicName: "فراخ مشوية",
    query: "Grilled Chicken",
    tag: "Lean Protein / Low Carb",
    description: "Flame-grilled chicken half marinated in traditional garlic, onions, yogurt, lemon, and a subtle blend of Egyptian spices.",
    gradient: "linear-gradient(135deg, oklch(0.96 0.04 55) 0%, oklch(0.92 0.06 55) 100%)",
    accentColor: "oklch(0.58 0.14 55)",
    fallback: {
      id: "a0000001-0000-0000-0000-000000000011",
      name: "Grilled Chicken",
      caloriesPerServing: 412.5,
      proteinPerServing: 77.5,
      carbsPerServing: 0,
      fatPerServing: 9,
      servingSizeGrams: 250
    }
  },
  {
    key: "feteer",
    displayName: "Feteer Meshaltet",
    arabicName: "فطير مشلتت",
    query: "Feteer Meshaltet",
    tag: "Rich Energy Pastry",
    description: "Exquisite, flaky pastry made of numerous paper-thin layers of dough saturated with premium clarified butter. Served warm.",
    gradient: "linear-gradient(135deg, oklch(0.97 0.02 70) 0%, oklch(0.93 0.04 70) 100%)",
    accentColor: "oklch(0.60 0.15 70)",
    fallback: {
      id: "a0000001-0000-0000-0000-000000000007",
      name: "Feteer Meshaltet",
      caloriesPerServing: 540,
      proteinPerServing: 9,
      carbsPerServing: 57,
      fatPerServing: 30,
      servingSizeGrams: 150
    }
  }
];

export default function EgyptianFoodQuickLog({ onSuccess }) {
  const [foods, setFoods] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom portion multipliers: { [foodKey]: multiplier }
  const [multipliers, setMultipliers] = useState({});
  // Custom exact servings in grams: { [foodKey]: grams }
  const [customGrams, setCustomGrams] = useState({});
  // Meal types chosen per food card: { [foodKey]: mealType }
  const [mealTypes, setMealTypes] = useState({});
  // Success indicator: { [foodKey]: boolean }
  const [successLogs, setSuccessLogs] = useState({});
  // Individual loading status: { [foodKey]: boolean }
  const [isLogging, setIsLogging] = useState({});

  useEffect(() => {
    fetchEgyptianFoods();
  }, []);

  const fetchEgyptianFoods = async () => {
    setIsLoading(true);
    try {
      // Query the backend /api/FoodScan/Search in parallel for all 9 foods
      const promises = EGYPTIAN_FOODS_METADATA.map(meta => 
        searchFood(meta.query)
          .then(res => {
            const list = res?.data?.data ?? [];
            // Match exact or nearest name
            const found = list.find(f => f.name.toLowerCase().includes(meta.query.toLowerCase())) || list[0];
            return { key: meta.key, data: found || null };
          })
          .catch(() => ({ key: meta.key, data: null }))
      );

      const resolved = await Promise.all(promises);
      
      const foodMap = {};
      const initialMultipliers = {};
      const initialGrams = {};
      const initialMealTypes = {};

      resolved.forEach(item => {
        const metadataItem = EGYPTIAN_FOODS_METADATA.find(m => m.key === item.key);
        // Use backend search result if found, otherwise slide in the high-fidelity seed fallback
        const finalFood = item.data || metadataItem.fallback;
        
        foodMap[item.key] = finalFood;
        initialMultipliers[item.key] = 1.0;
        initialGrams[item.key] = Math.round(finalFood.servingSizeGrams || 100);
        initialMealTypes[item.key] = getDefaultMealType();
      });

      setFoods(foodMap);
      setMultipliers(initialMultipliers);
      setCustomGrams(initialGrams);
      setMealTypes(initialMealTypes);
    } catch (err) {
      console.error("Failed to batch search Egyptian foods", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultiplierChange = (key, value) => {
    setMultipliers(prev => ({ ...prev, [key]: value }));
    const baseServing = foods[key]?.servingSizeGrams || 100;
    setCustomGrams(prev => ({
      ...prev,
      [key]: Math.round(baseServing * value)
    }));
  };

  const handleGramChange = (key, value) => {
    const parsed = parseFloat(value);
    const validVal = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setCustomGrams(prev => ({ ...prev, [key]: validVal }));
    
    // Adjust multiplier dynamically for visual consistency
    const baseServing = foods[key]?.servingSizeGrams || 100;
    setMultipliers(prev => ({
      ...prev,
      [key]: baseServing > 0 ? validVal / baseServing : 1.0
    }));
  };

  const handleMealTypeSelect = (key, mealType) => {
    setMealTypes(prev => ({ ...prev, [key]: mealType }));
  };

  const logEgyptianMeal = async (key) => {
    const foodItem = foods[key];
    const metadata = EGYPTIAN_FOODS_METADATA.find(m => m.key === key);
    const grams = customGrams[key] ?? foodItem.servingSizeGrams;
    const mealType = mealTypes[key] ?? getDefaultMealType();

    if (grams <= 0) return;

    // Scale protein, carbs, fat, calories according to grams selected
    const factor = foodItem.servingSizeGrams > 0 ? grams / foodItem.servingSizeGrams : 1;
    const payload = {
      foodName: foodItem.name,
      calories: Math.round(foodItem.caloriesPerServing * factor * 10) / 10,
      protein: Math.round(foodItem.proteinPerServing * factor * 10) / 10,
      carbs: Math.round(foodItem.carbsPerServing * factor * 10) / 10,
      fat: Math.round(foodItem.fatPerServing * factor * 10) / 10,
      servingSizeGrams: Math.round(grams * 10) / 10,
      mealType: mealType,
      foodScanId: null,
      localFoodItemId: foodItem.id
    };

    setIsLogging(prev => ({ ...prev, [key]: true }));
    try {
      await logMeal(payload);
      
      // Trigger success animation
      setSuccessLogs(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setSuccessLogs(prev => ({ ...prev, [key]: false }));
      }, 2000);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to quick-add Egyptian food log", err);
      alert(`Error logging ${metadata.displayName}. Please try again.`);
    } finally {
      setIsLogging(prev => ({ ...prev, [key]: false }));
    }
  };

  const filteredMetadata = EGYPTIAN_FOODS_METADATA.filter(meta => 
    meta.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meta.arabicName.includes(searchQuery) ||
    meta.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="egyptian-quick-log-wrapper">
      <div className="egyptian-quick-log-header">
        <div className="egyptian-quick-log-title-area">
          <div className="egyptian-quick-log-badge">
            <Sparkles size={14} />
            <span>Pharaoh&apos;s Quick Log</span>
          </div>
          <h3 className="egyptian-quick-log-title">Egyptian Food Express</h3>
          <p className="egyptian-quick-log-subtitle">One-tap logging for local delicacies, optimized with authentic nutrient specs.</p>
        </div>

        <div className="egyptian-quick-log-search-container">
          <Search size={16} className="egyptian-search-icon" />
          <input
            type="text"
            className="egyptian-search-input"
            placeholder="Search Koshary, Ful, Falafel... or search in Arabic (كشري)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="egyptian-loading-container">
          <div className="egyptian-loading-spinner" />
          <span className="egyptian-loading-text">Fetching authentic nutrition profiles...</span>
        </div>
      ) : filteredMetadata.length === 0 ? (
        <div className="egyptian-empty-state">
          <Info size={28} className="text-muted" />
          <p>No quick-access Egyptian foods match &quot;{searchQuery}&quot;.</p>
          <span className="text-xs text-muted">Try searching in the general search tab for broader ingredients.</span>
        </div>
      ) : (
        <div className="egyptian-grid">
          {filteredMetadata.map(meta => {
            const foodItem = foods[meta.key];
            const multiplier = multipliers[meta.key] ?? 1.0;
            const grams = customGrams[meta.key] ?? Math.round(foodItem.servingSizeGrams);
            const activeMeal = mealTypes[meta.key] ?? 1;

            // Recalculated nutritional macros based on exact portions
            const factor = foodItem.servingSizeGrams > 0 ? grams / foodItem.servingSizeGrams : 1.0;
            const calculatedCals = Math.round(foodItem.caloriesPerServing * factor);
            const calculatedProtein = Math.round(foodItem.proteinPerServing * factor * 10) / 10;
            const calculatedCarbs = Math.round(foodItem.carbsPerServing * factor * 10) / 10;
            const calculatedFat = Math.round(foodItem.fatPerServing * factor * 10) / 10;

            const isItemLogging = isLogging[meta.key];
            const isItemSuccess = successLogs[meta.key];

            return (
              <div 
                key={meta.key} 
                className={`egyptian-card ${isItemSuccess ? 'egyptian-card--success' : ''}`}
                style={{ "--card-accent": meta.accentColor }}
              >
                {/* Header background card design */}
                <div className="egyptian-card__banner" style={{ background: meta.gradient }}>
                  <div className="egyptian-card__names">
                    <span className="egyptian-card__arabic">{meta.arabicName}</span>
                    <h4 className="egyptian-card__english">{meta.displayName}</h4>
                  </div>
                  <span className="egyptian-card__cals">{calculatedCals} kcal</span>
                </div>

                <div className="egyptian-card__body">
                  <span className="egyptian-card__tag">{meta.tag}</span>
                  <p className="egyptian-card__desc" title={meta.description}>{meta.description}</p>

                  {/* Nutrition Badges Grid */}
                  <div className="egyptian-card__macros">
                    <div className="egyptian-macro-badge egyptian-macro-badge--p">
                      <span className="egyptian-macro-label">Protein</span>
                      <span className="egyptian-macro-val">{calculatedProtein}g</span>
                    </div>
                    <div className="egyptian-macro-badge egyptian-macro-badge--c">
                      <span className="egyptian-macro-label">Carbs</span>
                      <span className="egyptian-macro-val">{calculatedCarbs}g</span>
                    </div>
                    <div className="egyptian-macro-badge egyptian-macro-badge--f">
                      <span className="egyptian-macro-label">Fat</span>
                      <span className="egyptian-macro-val">{calculatedFat}g</span>
                    </div>
                  </div>

                  {/* Portions & Grams Control */}
                  <div className="egyptian-card__controls">
                    <div className="egyptian-card__control-label">
                      <Scale size={11} />
                      <span>Portion Size</span>
                    </div>

                    <div className="portion-preset-buttons">
                      {[
                        { val: 0.5, label: "0.5x" },
                        { val: 1.0, label: "1.0x" },
                        { val: 1.5, label: "1.5x" },
                        { val: 2.0, label: "2.0x" }
                      ].map(preset => (
                        <button
                          key={preset.val}
                          type="button"
                          className={`portion-btn ${Math.abs(multiplier - preset.val) < 0.05 ? 'portion-btn--active' : ''}`}
                          onClick={() => handleMultiplierChange(meta.key, preset.val)}
                          disabled={isItemLogging || isItemSuccess}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="portion-gram-tuner">
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        className="portion-gram-input"
                        value={grams}
                        onChange={(e) => handleGramChange(meta.key, e.target.value)}
                        disabled={isItemLogging || isItemSuccess}
                      />
                      <span className="portion-gram-unit">grams</span>
                    </div>
                  </div>

                  {/* Meal Selector & Log Button Row */}
                  <div className="egyptian-card__footer">
                    <div className="egyptian-card__meals">
                      {[
                        { val: 1, label: "B", title: "Breakfast" },
                        { val: 2, label: "L", title: "Lunch" },
                        { val: 3, label: "D", title: "Dinner" },
                        { val: 4, label: "S", title: "Snack" }
                      ].map(m => (
                        <button
                          key={m.val}
                          type="button"
                          className={`egyptian-meal-pill ${activeMeal === m.val ? 'egyptian-meal-pill--active' : ''}`}
                          onClick={() => handleMealTypeSelect(meta.key, m.val)}
                          disabled={isItemLogging || isItemSuccess}
                          title={m.title}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className={`egyptian-log-btn ${isItemSuccess ? 'egyptian-log-btn--success' : ''}`}
                      onClick={() => logEgyptianMeal(meta.key)}
                      disabled={isItemLogging || isItemSuccess || grams <= 0}
                    >
                      {isItemSuccess ? (
                        <>
                          <CheckCircle size={14} className="animate-scale" />
                          <span>Logged!</span>
                        </>
                      ) : isItemLogging ? (
                        <>
                          <div className="egyptian-btn-spinner" />
                          <span>Logging...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Log Food</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
