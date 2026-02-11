import client from "./client";

export async function fetchMonthlyReport({ month, type = "csv" }) {
  const res = await client.get("/api/reports/monthly", {
    params: { month, type },
    responseType: "blob",
  });
  return res;
}
