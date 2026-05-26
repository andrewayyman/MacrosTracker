import client from "./client";

export async function getDailyGoal() {
  const response = await client.get("/api/nutrition-goals/daily");
  return response.data;
}

export async function getSuggestedGoal() {
  const response = await client.get("/api/nutrition-goals/daily/suggested");
  return response.data;
}

export async function upsertDailyGoal(payload) {
  const response = await client.put("/api/nutrition-goals/daily", payload);
  return response.data;
}
