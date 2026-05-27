import client from "./client";

export const getRecentFoods = () => client.get("/api/FoodScan/RecentFoods").then((r) => r.data.data);
