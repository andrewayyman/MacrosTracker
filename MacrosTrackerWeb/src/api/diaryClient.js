import client from "./client";

export function getDiary(date) {
  const params = date ? { date } : {};
  return client.get("/api/Diary", { params });
}

export function deleteDiaryEntry(id) {
  return client.delete(`/api/Diary/entries/${id}`);
}
