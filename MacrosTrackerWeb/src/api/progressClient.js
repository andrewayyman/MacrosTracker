import client from "./client";

export const getProgressTrends = (range = 7) =>
  client.get(`/api/Progress/trends?range=${range}`).then(r => r.data.data);

export const getProgressStreaks = () =>
  client.get("/api/Progress/streaks").then(r => r.data.data);

export const getWeeklySummary = (weekStart) =>
  client.get(`/api/Progress/weekly${weekStart ? `?weekStart=${weekStart}` : ""}`).then(r => r.data.data);
