import client from "./client";

export async function setBudgetTarget({ month, amount }) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Session expired. Please log in again.");
  }

  const res = await client.put(
    `/api/budget/target?month=${encodeURIComponent(month)}`,
    { amount },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}
