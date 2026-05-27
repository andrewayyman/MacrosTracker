import client from "./client";

export async function getGoalProfile() {
  const response = await client.get("/api/user-goal-profile");
  return response.data;
}

export async function saveGoalProfile(payload) {
  const response = await client.post("/api/user-goal-profile", payload);
  return response.data;
}

export async function previewGoalCalculation(payload) {
  const response = await client.post("/api/user-goal-profile/preview", payload);
  return response.data;
}
