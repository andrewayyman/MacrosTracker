# Research: Daily Nutrition Log (Spec 006)

## Decision 1: Recent Foods Query Strategy

**Decision**: Query `MealLogs` for the authenticated user's entries in the last 30 days where `LocalFoodItemId IS NOT NULL`, take the most recent log per distinct food item, join to `LocalFoodItems` for display data, order by most recent log timestamp, limit to 10. Return `FoodSearchResultDto` — the same shape as search results.

**Rationale**: Only meals logged from a `LocalFoodItem` can be reliably re-logged (per-100g nutritional data and a standard serving size are available). AI-scan-only entries have nutritional values recorded per that specific portion and no canonical serving size, making them unsuitable for the "select and adjust quantity" flow. The EF Core query is straightforward: group by `LocalFoodItemId`, project to the most recent row per group, join `LocalFoodItems`.

**Alternatives considered**:
- Include AI-scan-only entries (no `LocalFoodItemId`). Rejected: no canonical serving size means re-logging would silently use stale per-entry values and break the quantity adjustment flow.
- Maintain a separate `UserRecentFood` join table. Rejected: overhead not justified at v1 scale; the MealLog table is the authoritative source anyway.

---

## Decision 2: Daily Impact Preview — Client-Side Computation

**Decision**: Compute the projected daily totals entirely on the frontend. The client calls the existing `GET /api/Diary?date=today` (Spec 005) for current totals, then adds `food.nutritionPerServing × quantity` in memory. No new server endpoint is required.

**Rationale**: `DailySummaryDto` already returns `TotalCalories`, `TotalProtein`, `TotalCarbs`, `TotalFat`. `FoodSearchResultDto` already returns per-serving nutritional values. The projection is simple multiplication — adding a server round-trip per quantity adjustment would add network latency and degrade the real-time feel.

**Alternatives considered**:
- New `GET /api/NutritionLog/Preview?foodItemId=X&quantity=Y`. Rejected: a network call per quantity change (potentially every keypress) introduces perceptible lag and adds a new controller/service pair for trivial arithmetic.

---

## Decision 3: Controller Placement for Recent Foods Endpoint

**Decision**: Add `GET /api/FoodScan/RecentFoods` to the existing `FoodScanController`, delegating to a new `GetRecentFoodsAsync(userId)` method on `IFoodSearchService` / `FoodSearchService`.

**Rationale**: Recent foods is a food discovery feature — finding a food to log. This is the same domain as `GET /api/FoodScan/Search`. Placing it in the same controller keeps all food-item discovery endpoints together and avoids creating a new controller for a single endpoint.

**Alternatives considered**:
- New `NutritionLogController`. Rejected: a controller with one GET endpoint adds boilerplate with no structural benefit at v1 scope (constitution Principle V).
- Add to `DiaryController`. Rejected: the diary domain handles reading logged history, not discovering foods to add.

---

## Decision 4: Frontend Page Structure — New Page vs. Extending Scan.jsx

**Decision**: Add a new `ManualLog.jsx` page at route `/log`. Reuse existing components (`FoodSearchPanel.jsx`, `MealTypeSelector.jsx`, `DailySummary.jsx`). Add one new component — `FoodLogConfirm.jsx` — for the serving-adjustment and daily-preview confirmation screen.

**Rationale**: The AI scan flow (camera → analyze → confirm) and the manual log flow (search → select → adjust → confirm) have different entry points, different intermediary states, and different screen layouts. Merging them further into `Scan.jsx` would create a branching-logic page that grows complex. Separate pages with shared components is simpler and independently testable per story.

**Alternatives considered**:
- Third tab in `Scan.jsx`. Rejected: `Scan.jsx` already manages two tabs and two async flows. Adding a third makes it a kitchen-sink component; the manual log flow should be a first-class entry point, not a scan fallback.

---

## Decision 5: Serving Quantity UX

**Decision**: The quantity input accepts a positive decimal number representing a multiplier of the food item's standard serving size (e.g., 1 = one serving, 0.5 = half a serving, 2 = two servings). The frontend multiplies all per-serving nutritional values by this multiplier before logging.

**Rationale**: `FoodSearchResultDto` already exposes pre-computed per-serving values (`CaloriesPerServing`, etc.). Multiplying by a serving multiplier is straightforward and maps naturally to how users think ("I had 1.5 servings of rice"). The log payload (`LogMealRequest`) takes raw nutritional values, so the multiplication happens client-side before the POST.

**Alternatives considered**:
- Grams input instead of serving multiplier. Considered but deferred: requires per-100g values to be exposed in the DTO and the user to know gram weights. The serving-based model is more accessible for v1.
