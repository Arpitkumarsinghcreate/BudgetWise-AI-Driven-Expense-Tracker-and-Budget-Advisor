import client from "./client";

export async function fetchSummary({ month }) {
  const res = await client.get("/api/dashboard/summary", { params: { month } });
  return res.data;
}
