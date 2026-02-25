import client from "./client";

export async function fetchInsights({ month }) {
  const res = await client.get("/api/ai/insights", { params: { month } });
  return res.data;
}

export async function chat({ message, toneMode, month, includeGoals }) {
  const res = await client.post("/api/ai/chat", {
    message,
    toneMode,
    month,
    includeGoals,
  });
  return res.data;
}
