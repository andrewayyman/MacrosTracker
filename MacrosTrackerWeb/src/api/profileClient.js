import client from "./client";

export async function getSetupSummary() {
  const response = await client.get("/api/profile/setup");
  return response.data;
}

export async function getProfile() {
  const response = await client.get("/api/profile");
  return response.data;
}

export async function upsertProfile(payload) {
  const response = await client.put("/api/profile", payload);
  return response.data;
}
