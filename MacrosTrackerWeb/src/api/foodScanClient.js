import client from "./client";

export function analyzeFood(formData) {
  return client.post("/api/FoodScan/Analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function logMeal(payload) {
  return client.post("/api/FoodScan/Log", payload);
}

export function searchFood(query) {
  return client.get("/api/FoodScan/Search", { params: { q: query } });
}
