import { useState, useEffect } from "react";
import { Button, Badge, Modal, Form } from "react-bootstrap";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Pie, Doughnut, Line } from 'react-chartjs-2';
import "./Dashboard.css";
import ProfileModal from "../components/ProfileModal";
import ExpenseModal from "../components/ExpenseModal";
import DashboardLayout from "../components/DashboardLayout";
import { listByMonth } from "../api/transactions";
import { fetchSummary } from "../api/dashboard";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default function Dashboard() {
  
  // User Info
  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "User");
  const [userEmail] = useState(() => localStorage.getItem("userEmail") || "");
  const locale = (localStorage.getItem("language") === "hi") ? "hi-IN" : "en-IN";
  
  // Data State
  const [transactions, setTransactions] = useState(() => {
    const email = localStorage.getItem("userEmail");
    return email ? JSON.parse(localStorage.getItem(`transactions_${email}`) || "[]") : [];
  });
  const [userProfile, setUserProfile] = useState(() => {
    const email = localStorage.getItem("userEmail");
    const base = email ? JSON.parse(localStorage.getItem(`userSettings_${email}`) || "{}") : {};
    return {
      name: localStorage.getItem("userName") || base.name || "User",
      email: email || base.email || "",
      contact: base.contact || "",
      photo: base.photo || "",
      monthlyIncome: base.monthlyIncome || "",
      financialGoal: base.financialGoal || "",
    };
  });
  
  // Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [expenseModalKey, setExpenseModalKey] = useState(0);
  const [profileModalKey] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const isDark = document.body.classList.contains("dark");

  // Filters
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    reservedBalance: 0,
    dailyTrend: [],
    categoryBreakdown: {}
  });

  useEffect(() => {
    const handleScroll = () => {};
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const effective = theme === "system"
      ? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    document.body.classList.toggle("dark", effective === "dark");
  }, [theme]);

  useEffect(() => {
    const monthStr = `${filterYear}-${String(Number(filterMonth)+1).padStart(2,"0")}`;
    setLoading(true);
    setError("");
    Promise.all([
      listByMonth({ month: monthStr }),
      fetchSummary({ month: monthStr })
    ])
      .then(([items, s]) => {
        setTransactions(items);
        setSummary({
          totalIncome: Number(s.totalIncome || 0),
          totalExpense: Number(s.totalExpense || 0),
          balance: Number(s.balance || 0),
          reservedBalance: Number(s.reservedBalance || 0),
          dailyTrend: Array.isArray(s.dailyTrend) ? s.dailyTrend : [],
          categoryBreakdown: s.categoryBreakdown || {}
        });
      })
      .catch(err => setError(err.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [filterMonth, filterYear]);

  // Derived Data (Filtered)
  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth().toString() === filterMonth && d.getFullYear().toString() === filterYear;
  });

  const stats = {
    totalIncome: summary.totalIncome,
    totalExpenses: summary.totalExpense,
    reservedAmount: summary.reservedBalance,
    balance: summary.balance
  };

  // Chart Data
  const incomeVsExpenseData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: [stats.totalIncome, stats.totalExpenses],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: ['#059669', '#dc2626'],
        borderWidth: 1,
      },
    ],
  };
  const pieOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: isDark ? '#e5e7eb' : '#1f2937' } } }
  };

  // Process category data (array -> map)
  const expenseCategoriesList = Array.isArray(summary.categoryBreakdown) ? summary.categoryBreakdown : [];
  const expenseCategories = expenseCategoriesList.reduce((acc, item) => {
    const key = item.category || "";
    const val = Number(item.amount || 0);
    if (key) acc[key] = (acc[key] || 0) + val;
    return acc;
  }, {});

  const categoryData = {
    labels: Object.keys(expenseCategories),
    datasets: [
      {
        data: Object.values(expenseCategories),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8AC926', '#1982C4'
        ],
        borderWidth: 1,
      },
    ],
  };

  const uniqueExpenseDays = Array.isArray(summary.dailyTrend) ? summary.dailyTrend.filter(d => Number(d.expense || 0) > 0).length : 0;
  const averageDailySpend = uniqueExpenseDays > 0 ? Math.round(stats.totalExpenses / uniqueExpenseDays) : 0;
  const remainingBudget = userProfile.monthlyIncome ? Math.max(0, Number(userProfile.monthlyIncome) - stats.totalExpenses) : 0;
  const topCategory = Object.keys(expenseCategories).sort((a, b) => (expenseCategories[b] || 0) - (expenseCategories[a] || 0))[0] || "—";

  const trendLabels = Array.isArray(summary.dailyTrend) ? summary.dailyTrend.map(p => String(new Date(p.date).getDate())) : [];
  const trendDataValues = Array.isArray(summary.dailyTrend) ? summary.dailyTrend.map(p => Number(p.expense || 0)) : [];
  const trendData = {
    labels: trendLabels.map(d => d.toString()),
    datasets: [
      {
        label: 'Daily Spend',
        data: trendDataValues,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.2)',
        tension: 0.3,
      }
    ]
  };
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
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

  // Handlers

  const handleSaveProfile = (data) => {
    const merged = { ...userProfile, ...data };
    setUserProfile(merged);
    localStorage.setItem(`userSettings_${userEmail}`, JSON.stringify(merged));
    if (data.name) {
      localStorage.setItem("userName", data.name);
      setUserName(data.name);
    }
  };

  const handleSaveTransaction = (transaction) => {
    let newTransactions;
    if (editingTransaction) {
      newTransactions = transactions.map(t => t.id === transaction.id ? transaction : t);
    } else {
      newTransactions = [transaction, ...transactions];
    }
    setTransactions(newTransactions);
    localStorage.setItem(`transactions_${userEmail}`, JSON.stringify(newTransactions));
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      const newTransactions = transactions.filter(t => t.id !== id);
      setTransactions(newTransactions);
      localStorage.setItem(`transactions_${userEmail}`, JSON.stringify(newTransactions));
    }
  };

  const handleCompleteTransaction = (id) => {
    const newTransactions = transactions.map(t => 
      t.id === id ? { ...t, status: 'completed' } : t
    );
    setTransactions(newTransactions);
    localStorage.setItem(`transactions_${userEmail}`, JSON.stringify(newTransactions));
  };

  const handleReleaseTransaction = (id) => {
    const newTransactions = transactions.map(t => 
      t.id === id ? { ...t, status: 'released' } : t
    );
    setTransactions(newTransactions);
    localStorage.setItem(`transactions_${userEmail}`, JSON.stringify(newTransactions));
  };

  const openAddExpense = () => {
    setEditingTransaction(null);
    setExpenseModalKey(prev => prev + 1);
    setShowExpenseModal(true);
  };

  const openEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setExpenseModalKey(prev => prev + 1);
    setShowExpenseModal(true);
  };

  // Helper for Month Names
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Generate Years (Last 5 years)
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <>
      <ProfileModal 
        key={profileModalKey}
        show={showProfileModal} 
        handleClose={() => setShowProfileModal(false)} 
        initialData={userProfile}
        onSave={handleSaveProfile}
      />
      <ExpenseModal
        key={expenseModalKey}
        show={showExpenseModal}
        handleClose={() => setShowExpenseModal(false)}
        expenseToEdit={editingTransaction}
        onSave={handleSaveTransaction}
        availableBalance={stats.balance}
      />
      <DashboardLayout>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {loading && <div className="text-muted small mb-2">Loading...</div>}
        <div className="welcome-section d-flex justify-content-between align-items-center">
          <div>
            <h1 className="welcome-title">Hello, {userName} 👋</h1>
            <p className="welcome-subtitle">
              {userProfile.financialGoal ? `Goal: ${userProfile.financialGoal}` : "Set a financial goal to stay motivated!"}
            </p>
          </div>
        </div>

        <div className="filters-section mb-4 d-flex gap-2 align-items-center bg-white p-3 rounded shadow-sm">
          <span className="fw-bold">Filter View:</span>
          <select 
            className="form-select w-auto" 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select 
            className="form-select w-auto" 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="stats-grid">
          <div className="stat-card income-card">
            <div className="stat-card-header">
              <div className="stat-icon income-icon">
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>₹</span>
              </div>
              <span className="stat-label">Total Income</span>
            </div>
            <div className="stat-value income-value">₹ {stats.totalIncome.toLocaleString(locale)}</div>
            {userProfile.monthlyIncome && (
              <div className="stat-change positive">
                Target: ₹ {Number(userProfile.monthlyIncome).toLocaleString()}
              </div>
            )}
          </div>

          <div className="stat-card expense-card">
            <div className="stat-card-header">
              <div className="stat-icon expense-icon">
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>₹</span>
              </div>
              <span className="stat-label">Total Expenses</span>
            </div>
            <div className="stat-value expense-value">₹ {stats.totalExpenses.toLocaleString(locale)}</div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div className="stat-card-header">
              <div className="stat-icon" style={{ background: '#ede9fe', color: '#8b5cf6' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <span className="stat-label">Reserved Balance</span>
            </div>
            <div className="stat-value reserved-value">₹ {Math.abs(stats.reservedAmount).toLocaleString(locale)}</div>
          </div>

          <div className="stat-card balance-card">
            <div className="stat-card-header">
              <div className="stat-icon balance-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="6" x2="12" y2="12"></line>
                  <line x1="12" y1="12" x2="16" y2="12"></line>
                </svg>
              </div>
              <span className="stat-label">Balance</span>
            </div>
            <div className="stat-value balance-value">₹ {stats.balance.toLocaleString(locale)}</div>
          </div>
        </div>

        <div className="summary-row">
          <div className="summary-card">
            <div className="summary-title">Total Expenses</div>
            <div className="summary-value">₹ {stats.totalExpenses.toLocaleString(locale)}</div>
            <div className="summary-ai">AI: You spent {topCategory !== '—' ? 'more in ' + topCategory : 'more this period'}.</div>
          </div>
          <div className="summary-card">
            <div className="summary-title">Top Category</div>
            <div className="summary-value">{topCategory}</div>
            <div className="summary-ai">AI: {topCategory !== '—' ? 'This category drives most costs.' : 'No dominant category yet.'}</div>
          </div>
          <div className="summary-card">
            <div className="summary-title">Avg Daily Spend</div>
            <div className="summary-value">₹ {averageDailySpend.toLocaleString(locale)}</div>
            <div className="summary-ai">AI: Track daily spend to control peaks.</div>
          </div>
          <div className="summary-card">
            <div className="summary-title">Remaining Budget</div>
            <div className="summary-value">₹ {remainingBudget.toLocaleString(locale)}</div>
            <div className="summary-ai">AI: Stay under your monthly target.</div>
          </div>
        </div>

        <div className="charts-section">
          <div className="row mb-4">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="content-card p-3 h-100">
                <h3 className="h6 mb-3 text-center">Income vs Expense</h3>
                <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                  {stats.totalIncome > 0 || stats.totalExpenses > 0 ? (
                    <Pie data={incomeVsExpenseData} options={pieOptions} />
                  ) : (
                    <p className="text-muted text-center my-auto">No data to display</p>
                  )}
                </div>
                <div className="chart-ai">AI: Expenses relative to income this month.</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="content-card p-3 h-100">
                <h3 className="h6 mb-3 text-center">Category-wise Expenses</h3>
                <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                  {Object.keys(expenseCategories).length > 0 ? (
                    <Doughnut data={categoryData} options={pieOptions} />
                  ) : (
                    <p className="text-muted text-center my-auto">No expenses to display</p>
                  )}
                </div>
                <div className="chart-ai">AI: Distribution highlights spending hotspots.</div>
              </div>
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-12">
              <div className="content-card p-3">
                <h3 className="h6 mb-3 text-center">Daily Spending Trend</h3>
                <div style={{ height: '260px' }}>
                  {trendLabels.length > 0 ? (
                    <Line data={trendData} options={lineOptions} />
                  ) : (
                    <p className="text-muted text-center my-auto">No trend data</p>
                  )}
                </div>
                <div className="chart-ai">AI: Spending pattern across the month.</div>
              </div>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="empty-state-large">
            <p className="empty-main">You have no expenses in this month!</p>
            <div className="ai-tip-card">
              <div className="tip-title">AI Tip</div>
              <div className="tip-text">Add your first expense to unlock insights and budgeting suggestions.</div>
              <Button variant="outline-primary" size="sm" onClick={openAddExpense} className="mt-2">Add Expense</Button>
            </div>
          </div>
        ) : (
          <div className="content-grid">
            <div className="content-card transactions-card">
              <div className="card-header">
                <h2 className="card-title">Recent Transactions ({months[filterMonth]} {filterYear})</h2>
              </div>
              <div className="transactions-list">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((expense) => (
                    <div key={expense.id} className="transaction-item">
                      <div className="transaction-icon">
                        {expense.type === "income" ? (
                          <div className="icon-bg income-bg">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        ) : (
                          <div className="icon-bg expense-bg">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="transaction-details">
                        <div className="d-flex align-items-center gap-2">
                          <div className="transaction-category">{expense.category}</div>
                          {(expense.status === 'reserved' || expense.status === 'blocked') && <Badge bg="primary" className="rounded-pill" style={{fontSize: '0.7rem'}}>Reserved</Badge>}
                          {expense.status === 'released' && <Badge bg="secondary" className="rounded-pill" style={{fontSize: '0.7rem'}}>Released</Badge>}
                          {expense.type === 'expense' && (
                            <Badge bg="warning" text="dark" className="rounded-pill" style={{fontSize: '0.7rem'}}>
                              {expense.amount > averageDailySpend * 2 ? 'Unusual' : (expense.amount > 1000 ? 'High Spend' : 'Recurring')}
                            </Badge>
                          )}
                        </div>
                        <div className="transaction-date">
                          {new Date(expense.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          {expense.description && <span className="text-muted ms-2 small">({expense.description})</span>}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <div className={`transaction-amount ${expense.type === "income" ? "income" : (expense.status === 'released' ? "text-muted text-decoration-line-through" : "expense")}`}>
                          {expense.type === "income" ? "+" : "-"}₹ {expense.amount.toLocaleString()}
                        </div>
                        <div className="transaction-actions d-flex align-items-center">
                          {(expense.status === 'reserved' || expense.status === 'blocked') && (
                            <>
                              <Button variant="link" size="sm" className="p-0 me-2 text-success" title="Complete Transaction" onClick={() => handleCompleteTransaction(expense.id)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </Button>
                              <Button variant="link" size="sm" className="p-0 me-2 text-secondary" title="Release Amount" onClick={() => handleReleaseTransaction(expense.id)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                </svg>
                              </Button>
                            </>
                          )}
                          <Button variant="link" size="sm" className="p-0 me-2" onClick={() => openEditTransaction(expense)} disabled={expense.status === 'released' || (expense.status === 'completed' && expense.type === 'expense')}>
                            Edit
                          </Button>
                          <Button variant="link" size="sm" className="p-0 text-danger" onClick={() => handleDeleteTransaction(expense.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p className="empty-text">No transactions found for this period</p>
                    <Button variant="outline-primary" size="sm" onClick={openAddExpense} className="mt-2">
                      Add New Transaction
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Side panel removed per requirement */}
          </div>
        )}

        <Modal show={showSettingsModal} onHide={() => setShowSettingsModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Theme</Form.Label>
                <div className="d-flex gap-3">
                  <Form.Check
                    type="radio"
                    id="theme-light"
                    name="theme"
                    label="Light"
                    checked={theme === "light"}
                    onChange={() => setTheme("light")}
                  />
                  <Form.Check
                    type="radio"
                    id="theme-dark"
                    name="theme"
                    label="Dark"
                    checked={theme === "dark"}
                    onChange={() => setTheme("dark")}
                  />
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSettingsModal(false)}>Close</Button>
            <Button variant="primary" onClick={() => { localStorage.setItem("theme", theme); setShowSettingsModal(false); }}>Save</Button>
          </Modal.Footer>
        </Modal>
      </DashboardLayout>
    </>
  );
}
