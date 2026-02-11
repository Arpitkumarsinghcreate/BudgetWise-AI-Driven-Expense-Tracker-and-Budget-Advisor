import client from "./client";

function mapTransaction(t) {
  return {
    id: t.id,
    type: String(t.type || "").toLowerCase(),
    amount: Number(t.amount),
    category: t.category || "",
    description: t.description || "",
    date: t.date,
    status: t.status === "PENDING" ? "reserved" : t.status === "REVERTED" ? "released" : "completed",
  };
}

export async function addTransaction({ form }) {
  const body = {
    type: (form.type || "expense").toUpperCase(),
    amount: Number(form.amount),
    category: form.category || "Other",
    description: form.description || "",
    date: form.date,
    reserved: form.type === "expense" ? (form.status && form.status !== "completed") : false,
  };
  const res = await client.post("/api/transactions", body);
  return mapTransaction(res.data);
}

export async function listByMonth({ month }) {
  const res = await client.get("/api/transactions", { params: { month } });
  const items = res.data;
  return Array.isArray(items) ? items.map(mapTransaction) : [];
}

export async function listReserved({ month }) {
  const qs = month ? `?month=${encodeURIComponent(month)}` : "";
  const res = await client.get(`/api/transactions/reserved${qs}`);
  const items = res.data;
  return Array.isArray(items) ? items.map(mapTransaction) : [];
}

export async function completeReserved({ id }) {
  const res = await client.post(`/api/transactions/${id}/complete`);
  return mapTransaction(res.data);
}

export async function revertReserved({ id }) {
  const res = await client.post(`/api/transactions/${id}/revert`);
  return mapTransaction(res.data);
}
