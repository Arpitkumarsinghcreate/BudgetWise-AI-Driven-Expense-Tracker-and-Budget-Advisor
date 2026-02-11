import { useMemo, useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Button, Form } from "react-bootstrap";
import ExpenseModal from "../components/ExpenseModal";
import { listByMonth, addTransaction } from "../api/transactions";
import { fetchMonthlyReport } from "../api/reports";

export default function Transactions() {
  const locale = (localStorage.getItem("language") === "hi") ? "hi-IN" : "en-IN";
  const dateFormat = localStorage.getItem("dateFormat") || "YYYY-MM-DD";
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState("csv");

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
    const month = new Date().toISOString().slice(0, 7);
    setLoading(true);
    setError("");
    listByMonth({ month })
      .then(setTransactions)
      .catch(err => setError(err.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const filteredStats = useMemo(() => {
    const stats = transactions.reduce((acc, t) => {
      if (t.type === "income") acc.income += Number(t.amount);
      else if (t.status !== "released") acc.expense += Number(t.amount);
      return acc;
    }, { income: 0, expense: 0 });
    const balance = stats.income - stats.expense;
    const ratio = stats.income ? Math.round((stats.expense / stats.income) * 100) : 0;
    return { ...stats, balance, ratio };
  }, [transactions]);

  const [sortBy, setSortBy] = useState("date");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");

  const categories = Array.from(new Set(transactions.map(t => t.category))).filter(Boolean);
  const sortedFiltered = useMemo(() => {
    let list = [...transactions];
    if (typeFilter !== "all") list = list.filter(t => t.type === typeFilter);
    if (categoryFilter) list = list.filter(t => t.category === categoryFilter);
    list.sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      if (sortBy === "amount") return Number(b.amount) - Number(a.amount);
      return (b.description || "").localeCompare(a.description || "");
    });
    return list;
  }, [transactions, sortBy, typeFilter, categoryFilter]);

  const openAdd = () => { setEditingTransaction(null); setShowExpenseModal(true); };
  const openEdit = (t) => { setEditingTransaction(t); setShowExpenseModal(true); };

  const downloadReport = async () => {
    const month = new Date().toISOString().slice(0, 7);
    try {
      setError("");
      setExporting(true);
      const res = await fetchMonthlyReport({ month, type: exportType });
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = exportType === "pdf" ? "pdf" : "csv";
      a.download = `transactions-${month}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Failed to generate report");
    } finally {
      setExporting(false);
    }
  };

  const handleSave = (t) => {
    setError("");
    setLoading(true);
    if (editingTransaction) {
      const next = transactions.map(x => x.id === t.id ? t : x);
      setTransactions(next);
      setLoading(false);
      setShowExpenseModal(false);
      setEditingTransaction(null);
      return;
    }
    addTransaction({ form: t })
      .then(() => listByMonth({ month: new Date().toISOString().slice(0,7) }).then(setTransactions))
      .catch(err => setError(err.message || "Failed to save"))
      .finally(() => {
        setLoading(false);
        setShowExpenseModal(false);
        setEditingTransaction(null);
      });
  };

  return (
    <DashboardLayout>
      <div className="summary-row">
        <div className="summary-card">
          <div className="summary-title">Total Income</div>
          <div className="summary-value">₹ {filteredStats.income.toLocaleString(locale)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-title">Total Expense</div>
          <div className="summary-value">₹ {filteredStats.expense.toLocaleString(locale)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-title">Net Balance</div>
          <div className="summary-value">₹ {filteredStats.balance.toLocaleString(locale)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-title">Expense Ratio</div>
          <div className="summary-value">{filteredStats.ratio}%</div>
        </div>
      </div>

      <div className="d-flex gap-2 mb-3">
        <Button variant="warning" onClick={openAdd}>Add Transaction</Button>
        <Form.Select value={exportType} onChange={e => setExportType(e.target.value)} style={{width: 'auto'}}>
          <option value="csv">CSV</option>
          <option value="pdf">PDF</option>
        </Form.Select>
        <Button variant="outline-secondary" onClick={downloadReport} disabled={exporting}>
          {exporting ? "Exporting..." : "Download Report"}
        </Button>
      </div>

      <div className="content-card">
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {loading && <div className="text-muted small mb-2">Loading...</div>}
        <div className="d-flex gap-3 align-items-end mb-3">
          <Form.Group>
            <Form.Label>Sort by</Form.Label>
            <Form.Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="description">Description</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Type</Form.Label>
            <Form.Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Category</Form.Label>
            <Form.Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="">All</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </Form.Select>
          </Form.Group>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedFiltered.map(t => (
                <tr key={t.id}>
                  <td>{formatDate(t.date)}</td>
                  <td>₹ {Number(t.amount).toLocaleString(locale)}</td>
                  <td>{t.type}</td>
                  <td>{t.category}</td>
                  <td>{t.description || "-"}</td>
                  <td>
                    <Button size="sm" variant="link" onClick={() => openEdit(t)}>Edit</Button>
                  </td>
                </tr>
              ))}
              {sortedFiltered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted">No transactions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseModal
        show={showExpenseModal}
        handleClose={() => setShowExpenseModal(false)}
        expenseToEdit={editingTransaction}
        onSave={handleSave}
        availableBalance={filteredStats.balance}
      />
    </DashboardLayout>
  );
}
