import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import "../pages/Dashboard.css";

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const userName = localStorage.getItem("userName") || "User";
  const userEmail = localStorage.getItem("userEmail") || "";
  const userSettings = JSON.parse(localStorage.getItem(`userSettings_${userEmail}`) || "{}");
  const photo = (userSettings.photo && userSettings.photo.startsWith("/uploads/"))
    ? `http://localhost:8080${userSettings.photo}`
    : (userSettings.photo || "");

  const menu = [
    { label: "Dashboard", path: "/dashboard", icon: DashboardIcon },
    { label: "Transactions", path: "/transactions", icon: ListIcon },
    { label: "Reserved Transactions", path: "/reserved", icon: LockIcon },
    { label: "Statistics", path: "/statistics", icon: ChartIcon },
    { label: "AI Insights", path: "/ai", icon: RobotIcon },
    { label: "Settings", path: "/settings", icon: GearIcon },
  ];

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar" style={{ width: collapsed ? 88 : 240 }}>
        <div className="sidebar-brand">
          <div className="dashboard-logo-icon">
            <span className="dashboard-logo-e">E</span>
            <div className="dashboard-logo-bars">
              <span></span><span></span><span></span>
            </div>
          </div>
          {!collapsed && <span className="dashboard-logo-text">AI Expense Track</span>}
        </div>
        <button className="sidebar-item" onClick={() => setCollapsed(v => !v)}>
          <span>{collapsed ? "›" : "‹ Collapse"}</span>
        </button>
        <nav className="sidebar-nav">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const onClick = () => navigate(item.path);
            return (
              <button
                key={item.path}
                className={`sidebar-item ${isActive ? "active" : ""}`}
                onClick={onClick}
                title={item.label}
              >
                <Icon />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="dash-content dashboard page-container">
        <header className="dashboard-header">
          <div className="dashboard-header-container">
            <div className="dashboard-header-actions" style={{ marginLeft: "auto" }}>
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" id="profile-dropdown" className="p-0">
                  <div className="header-profile">
                    <div className="avatar">
                      {photo ? (
                        <img src={photo} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                      ) : (
                        <span>{userName?.[0]?.toUpperCase() || "U"}</span>
                      )}
                    </div>
                    <div className="profile-name">{userName}</div>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => navigate("/profile")}>Profile</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate("/settings")}>Settings</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </header>
        <main className="dashboard-main">
          <div className="dashboard-container">{children}</div>
        </main>
      </div>
    </div>
  );
}

function DashboardIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function ListIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>;
}
function LockIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function ChartIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function RobotIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M12 6V3"/></svg>;
}
function GearIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82h0A1.65 1.65 0 0 0 21 12h.09a2 2 0 1 1 0 4H21a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
