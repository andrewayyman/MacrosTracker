# Quickstart: Daily Nutrition Log (Spec 006)

## Prerequisites

Specs 001–005 must be fully implemented and the solution must build cleanly before starting Spec 006.

- SQL Server running with all prior migrations applied.
- `LocalFoodItems` seeded (31+ Egyptian food items from `LocalFoodItemSeed.cs`).
- Backend running on the configured port (default: `https://localhost:7XXX`).
- Frontend dev server running (`npm run dev` in `MacrosTrackerWeb/`).

---

## Backend Changes

### 1. Add `GetRecentFoodsAsync` to `IFoodSearchService`

```csharp
// GymScan.Services/Features/FoodSearch/IFoodSearchService.cs
Task<ServiceResponse<List<FoodSearchResultDto>>> GetRecentFoodsAsync(Guid userId);
```

### 2. Implement in `FoodSearchService`

```csharp
// Query MealLogs for the user, filter last 30 days + LocalFoodItemId not null,
// group by LocalFoodItemId, take most recent per group, order by recency, limit 10,
// join to LocalFoodItems, map to FoodSearchResultDto.
```

### 3. Add endpoint to `FoodScanController`

```csharp
[HttpGet("RecentFoods")]
public async Task<IActionResult> GetRecentFoods()
{
    var userId = _currentUserService.GetUserId();
    var result = await _foodSearchService.GetRecentFoodsAsync(userId);
    return result.ToActionResult();
}
```

### 4. Build verification

```bash
cd MacrosTrackerAPI
dotnet build
```

No migrations required.

---

## Frontend Changes

### 1. Add `nutritionLogClient.js`

```javascript
// MacrosTrackerWeb/src/api/nutritionLogClient.js
import client from './client';
export const getRecentFoods = () => client.get('/FoodScan/RecentFoods').then(r => r.data.data);
```

### 2. Add `FoodLogConfirm.jsx` component

Confirmation screen with:
- Food name and per-serving nutrition display
- Quantity input (positive decimal, default 1)
- Real-time nutritional value recalculation as quantity changes
- `DailySummary` showing current + projected totals
- `MealTypeSelector` for meal type choice
- Confirm and Cancel buttons

### 3. Add `ManualLog.jsx` page

Two-state page:
- **State 1 (search):** `FoodSearchPanel` for text search + `Recent Foods` list above it
- **State 2 (confirm):** `FoodLogConfirm` for the selected food item

On confirm: call `logMeal()` from `foodScanClient.js`, navigate to `/history` on success.

### 4. Register route in `App.jsx`

```jsx
<Route path="/log" element={<ProtectedRoute><ManualLog /></ProtectedRoute>} />
```

### 5. Add navigation link in `PageShell.jsx`

Add "Log Food" link to `/log` alongside the existing Scan and History links.

---

## Smoke Test Checklist

1. Navigate to `/log` while authenticated → search input and "Recent Foods" section visible.
2. Type "Koshary" → results appear within 2 seconds.
3. Select "Koshary" → detail screen shows nutritional values for 1 serving.
4. Change quantity to 1.5 → all nutritional values update; projected daily totals update.
5. Select "Lunch" as meal type → confirm button enabled.
6. Tap Confirm → navigated to `/history`; "Koshary" entry visible under Lunch for today.
7. Return to `/log` → "Koshary" appears in Recent Foods list.
8. Select "Koshary" from Recent Foods → detail screen opens with quantity pre-filled.
9. Try to confirm with quantity = 0 → confirm button disabled.
10. Simulate network failure on confirm → error message with retry option shown.
