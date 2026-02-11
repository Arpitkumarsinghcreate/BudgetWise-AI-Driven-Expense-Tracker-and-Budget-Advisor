import client from "./client";

export async function fetchSettings() {
  const res = await client.get("/api/settings");
  return res.data;
}

export async function updateSettings({ data }) {
  const res = await client.put("/api/settings", data);
  return res.data;
}
