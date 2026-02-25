const BASE_URL = "http://localhost:8080/api/budget";

export async function setBudgetTarget({ month, amount }) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Session expired. Please log in again.");
  }
  const res = await fetch(`${BASE_URL}/target?month=${encodeURIComponent(month)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to set budget target");
  }
  return data;
}
