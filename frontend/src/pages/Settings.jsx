import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Button, Form, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { fetchSettings, updateSettings } from "../api/settings";

export default function Settings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("general");
  const userId = Number(localStorage.getItem("userId") || 0);
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // No immediate effects on selection; apply only on Save

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError("");
    fetchSettings({ userId })
      .then(s => {
        setDateFormat(s.dateFormat || "YYYY-MM-DD");
        const t = (s.themeMode || "LIGHT").toLowerCase();
        setTheme(t);
        localStorage.setItem("dateFormat", s.dateFormat || "YYYY-MM-DD");
        localStorage.setItem("theme", t);
      })
      .catch(err => setError(err.message || "Failed to load settings"))
      .finally(() => setLoading(false));
  }, [userId]);

  const saveGeneral = () => {
    setLoading(true);
    setError("");
    updateSettings({ userId, data: { dateFormat } })
      .then(s => {
        localStorage.setItem("dateFormat", s.dateFormat || dateFormat);
      })
      .catch(err => setError(err.message || "Failed to save general settings"))
      .finally(() => setLoading(false));
  };

  const saveAppearance = () => {
    setLoading(true);
    setError("");
    const themeMode = theme.toUpperCase();
    updateSettings({ userId, data: { themeMode } })
      .then(s => {
        const savedTheme = (s.themeMode || themeMode).toLowerCase();
        setTheme(savedTheme);
        const effective = savedTheme;
        document.body.classList.toggle("dark", effective === "dark");
        localStorage.setItem("theme", savedTheme);
      })
      .catch(err => setError(err.message || "Failed to save appearance"))
      .finally(() => setLoading(false));
  };

  return (
    <DashboardLayout>
      <div className="content-card">
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {loading && <div className="text-muted small mb-2">Saving...</div>}
        <div className="d-flex">
          <Nav variant="pills" className="flex-column me-3">
            <Nav.Item>
              <Nav.Link active={tab === "general"} onClick={() => setTab("general")}>General</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link active={tab === "appearance"} onClick={() => setTab("appearance")}>Appearance</Nav.Link>
            </Nav.Item>
          </Nav>

          <div className="flex-grow-1">
            {tab === "general" && (
              <div>
                <h3 className="h6 mb-3">General Settings</h3>
                <div className="d-flex gap-3">
                  <Form.Group>
                    <Form.Label>Date Format</Form.Label>
                    <Form.Select value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="mt-3 d-flex gap-2">
                  <Button variant="primary" onClick={saveGeneral}>Save Changes</Button>
                  <Button variant="outline-secondary" onClick={() => navigate("/profile")}>Profile</Button>
                </div>
              </div>
            )}

            {tab === "appearance" && (
              <div>
                <h3 className="h6 mb-3">Appearance Settings</h3>
                <div className="d-flex gap-3 align-items-end">
                  <Form.Group>
                    <Form.Label>Theme Mode</Form.Label>
                    <Form.Select value={theme} onChange={e => setTheme(e.target.value)}>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="mt-3">
                  <Button variant="primary" onClick={saveAppearance}>Save</Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
