import client from "./client";

export async function fetchInsights({ month }) {
  const res = await client.get("/api/ai/insights", { params: { month } });
  return res.data;
}
