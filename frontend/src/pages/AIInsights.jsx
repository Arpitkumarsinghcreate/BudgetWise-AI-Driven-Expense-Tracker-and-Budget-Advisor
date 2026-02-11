import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { ProgressBar } from "react-bootstrap";
import { fetchInsights } from "../api/ai";

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

  useEffect(() => {
    setLoading(true);
    setError("");
    const monthStr = `${filterYear}-${String(Number(filterMonth)+1).padStart(2,"0")}`;
    fetchInsights({ month: monthStr })
      .then(setData)
      .catch(err => setError(err.message || "Failed to load insights"))
      .finally(() => setLoading(false));
  }, [filterMonth, filterYear]);

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
        <h3 className="h6 mb-2">Recommendations</h3>
        {Array.isArray(data.suggestions) && data.suggestions.length > 0 ? (
          <ul className="mb-0">
            {data.suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
          </ul>
        ) : (
          <p className="text-muted mb-0">No suggestions at this time</p>
        )}
      </div>
    </DashboardLayout>
  );
}
