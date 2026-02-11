import DashboardLayout from "../components/DashboardLayout";
import { useEffect, useState } from "react";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from "chart.js";
import { Bar } from "react-chartjs-2";
import { listByMonth } from "../api/transactions";

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function Statistics() {
  const userId = Number(localStorage.getItem("userId") || 0);
  const [monthlyExpense, setMonthlyExpense] = useState(Array(12).fill(0));
  const [monthlyIncome, setMonthlyIncome] = useState(Array(12).fill(0));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isDark = document.body.classList.contains("dark");

  useEffect(() => {
    if (!userId) {
      setError("Session missing. Please login again.");
      return;
    }
    setLoading(true);
    setError("");
    const year = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
    Promise.all(months.map(month => listByMonth({ userId, month })))
      .then(all => {
        const expenseTotals = all.map(items =>
          items
            .filter(t => t.type === "expense" && t.status !== "released")
            .reduce((sum, t) => sum + Number(t.amount), 0)
        );
        const incomeTotals = all.map(items =>
          items
            .filter(t => t.type === "income" && t.status === "completed")
            .reduce((sum, t) => sum + Number(t.amount), 0)
        );
        setMonthlyExpense(expenseTotals);
        setMonthlyIncome(incomeTotals);
      })
      .catch(err => setError(err.message || "Failed to load statistics"))
      .finally(() => setLoading(false));
  }, [userId]);

  const data = {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    datasets: [
      { label: "Monthly Income", data: monthlyIncome, backgroundColor: "#10b981" },
      { label: "Monthly Expense", data: monthlyExpense, backgroundColor: "#ef4444" }
    ]
  };
  const barOptions = {
    plugins: { legend: { labels: { color: isDark ? '#e5e7eb' : '#1f2937' } } },
    scales: {
      x: {
        ticks: { color: isDark ? '#e5e7eb' : '#374151' },
        grid: { color: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }
      },
      y: {
        ticks: { color: isDark ? '#e5e7eb' : '#374151' },
        grid: { color: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="content-card">
        <h3 className="h6 mb-3 text-center">Income vs Expense Trend (Monthly)</h3>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {loading ? (
          <div className="text-muted small">Loading...</div>
        ) : (
          <Bar data={data} options={barOptions} />
        )}
      </div>
    </DashboardLayout>
  );
}
