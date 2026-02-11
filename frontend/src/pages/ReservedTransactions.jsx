import { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Button, Form, Badge } from "react-bootstrap";
import { listReserved, completeReserved, revertReserved } from "../api/transactions";

export default function ReservedTransactions() {
  const userId = Number(localStorage.getItem("userId") || 0);
  const locale = (localStorage.getItem("language") === "hi") ? "hi-IN" : "en-IN";
  const dateFormat = localStorage.getItem("dateFormat") || "YYYY-MM-DD";
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const formatDate = (iso) => {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    if (dateFormat === "DD/MM/YYYY") return `${day}/${m}/${y}`;
    if (dateFormat === "MM/DD/YYYY") return `${m}/${day}/${y}`;
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    const month = new Date().toISOString().slice(0,7);
    listReserved({ month })
      .then(setTransactions)
      .catch(err => setError(err.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [userId]);

  const reservedList = useMemo(() => {
    return transactions.filter(t => t.type === "expense" && (t.status === "reserved" || t.status === "blocked"));
  }, [transactions]);

  const filtered = useMemo(() => {
    if (statusFilter === "pending") return reservedList.filter(t => t.status === "reserved" || t.status === "blocked");
    if (statusFilter === "completed") return transactions.filter(t => t.status === "completed");
    if (statusFilter === "reverted") return transactions.filter(t => t.status === "released");
    return reservedList;
  }, [reservedList, transactions, statusFilter]);

  const completeTransaction = (id) => {
    setLoading(true);
    setError("");
    const month = new Date().toISOString().slice(0,7);
    completeReserved({ id })
      .then(() => listReserved({ month }).then(setTransactions))
      .catch(err => setError(err.message || "Failed to complete"))
      .finally(() => setLoading(false));
  };

  const revertTransaction = (id) => {
    setLoading(true);
    setError("");
    const month = new Date().toISOString().slice(0,7);
    revertReserved({ id })
      .then(() => listReserved({ month }).then(setTransactions))
      .catch(err => setError(err.message || "Failed to revert"))
      .finally(() => setLoading(false));
  };

  return (
    <DashboardLayout>
      <div className="d-flex align-items-center gap-3 mb-3">
        <Form.Group>
          <Form.Label>Filter by</Form.Label>
          <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="reverted">Reverted</option>
          </Form.Select>
        </Form.Group>
      </div>

      <div className="content-card">
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {loading && <div className="text-muted small mb-2">Loading...</div>}
        <h3 className="h6 mb-3">Reserved Transactions</h3>
        <div className="transactions-list">
          {filtered.map(t => (
            <div key={t.id} className="transaction-item">
              <div className="transaction-details">
                <div className="d-flex align-items-center gap-2">
                  <div className="transaction-category">{t.category}</div>
                  {t.status === 'reserved' && <Badge bg="primary" className="rounded-pill" style={{fontSize: '0.7rem'}}>Reserved</Badge>}
                  {t.status === 'blocked' && <Badge bg="warning" className="rounded-pill" style={{fontSize: '0.7rem'}}>Blocked</Badge>}
                  {t.status === 'completed' && <Badge bg="success" className="rounded-pill" style={{fontSize: '0.7rem'}}>Completed</Badge>}
                  {t.status === 'released' && <Badge bg="secondary" className="rounded-pill" style={{fontSize: '0.7rem'}}>Reverted</Badge>}
                </div>
                <div className="transaction-date">{formatDate(t.date)}</div>
              </div>
              <div className={`transaction-amount expense`}>₹ {Number(t.amount).toLocaleString(locale)}</div>
              <div className="d-flex gap-2">
                <Button size="sm" variant="success" onClick={() => completeTransaction(t.id)}>Complete</Button>
                <Button size="sm" variant="outline-secondary" onClick={() => revertTransaction(t.id)}>Revert</Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-muted text-center">No items</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}
