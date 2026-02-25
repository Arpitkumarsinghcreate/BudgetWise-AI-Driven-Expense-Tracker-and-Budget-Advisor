import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { ProgressBar, Modal, Button, Form } from "react-bootstrap";
import { fetchInsights } from "../api/ai";
import { setBudgetTarget } from "../api/budget";

export default function AIInsights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    savingsRate: 0,
    healthScore: 0,
    monthOverMonth: "",
    warnings: [],
    suggestions: []
  });

  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  const monthStr = `${filterYear}-${String(Number(filterMonth)+1).padStart(2,"0")}`;

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchInsights({ month: monthStr })
      .then(setData)
      .catch(err => setError(err.message || "Failed to load insights"))
      .finally(() => setLoading(false));
  }, [filterMonth, filterYear, monthStr]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <DashboardLayout>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {loading && <div className="text-muted small mb-2">Loading...</div>}

      <div className="filters-section mb-4 d-flex gap-2 align-items-center bg-white p-3 rounded shadow-sm">
        <span className="fw-bold">Filter View:</span>
        <select className="form-select w-auto" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select className="form-select w-auto" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="content-card mb-3">
        <h3 className="h6 mb-2">AI Financial Health Score</h3>
        <div className="d-flex align-items-center gap-3">
          <div style={{ minWidth: 120, fontWeight: 800, fontSize: "1.5rem" }}>{data.healthScore}</div>
          <div className="flex-grow-1">
            <ProgressBar now={data.healthScore} label={`${data.healthScore}%`} />
          </div>
        </div>
        <div className="text-muted mt-2 small">
          Savings rate: {Number(data.savingsRate || 0)}% — {data.monthOverMonth || "No change"}
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <h3 className="h6 mb-2">Spending Warnings</h3>
          {Array.isArray(data.warnings) && data.warnings.length > 0 ? (
            <ul className="mb-0">
              {data.warnings.map((w, idx) => (
                <li key={idx}>{w.category}: {Number(w.percent).toFixed(2)}%</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mb-0">No category exceeds 40%</p>
          )}
        </div>
        <div className="content-card">
          <h3 className="h6 mb-2">Monthly Change</h3>
          <p className="text-muted mb-0">{data.monthOverMonth || "No change detected"}</p>
        </div>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="h6 mb-2">Budget Target Progress</h3>
          <Button variant="outline-primary" size="sm" onClick={() => { setTargetInput(String(Number(data.budgetTarget || 0))); setShowBudgetModal(true); }}>
            Set Budget Target
          </Button>
        </div>
        <div className="text-muted small">
          Target: ₹ {Number(data.budgetTarget || 0).toLocaleString("en-IN")} | Saved: ₹ {Number(data.budgetSaved || 0).toLocaleString("en-IN")} ({Number(data.budgetProgressPercent || 0)}%)
        </div>
        <ProgressBar
          now={Number(data.budgetProgressPercent || 0)}
          label={`${Number(data.budgetProgressPercent || 0)}%`}
          className="mt-2"
        />
      </div>

      <div className="content-card">
        <h3 className="h6 mb-2">Recommendations</h3>
        {Array.isArray(data.suggestions) && data.suggestions.length > 0 ? (
          <ul className="mb-0">
            {data.suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
          </ul>
        ) : (
          <p className="text-muted mb-0">No suggestions at this time</p>
        )}
      </div>

      <Modal show={showBudgetModal} onHide={() => setShowBudgetModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Set Monthly Budget Target ({months[filterMonth]} {filterYear})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Target Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="e.g., 50000"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBudgetModal(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                const amt = Number(targetInput || 0);
                await setBudgetTarget({ month: monthStr, amount: amt });
                const updated = await fetchInsights({ month: monthStr });
                setData(updated);
                setShowBudgetModal(false);
              } catch (e) {
                setError(e.message || "Failed to set budget target");
              }
            }}
          >
            Save Target
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}
