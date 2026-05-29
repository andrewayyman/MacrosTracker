import client from "./client";

export function analyzeFood(formData) {
  return client.post("/api/FoodScan/Analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function logMeal(payload) {
  const mealTypeMap = {
    1: "Breakfast",
    2: "Lunch",
    3: "Dinner",
    4: "Snack",
  };
  const mappedMealType =
    typeof payload.mealType === "number"
      ? mealTypeMap[payload.mealType]
      : payload.mealType;

  return client.post("/api/FoodScan/Log", {
    ...payload,
    mealType: mappedMealType,
  });
}

export function searchFood(query) {
  return client.get("/api/FoodScan/Search", { params: { q: query } });
}
