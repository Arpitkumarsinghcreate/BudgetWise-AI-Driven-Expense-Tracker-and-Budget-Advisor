import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Button, Form } from "react-bootstrap";
import { fetchProfile, updateProfile, uploadPhoto } from "../api/users";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail") || "";
  const initial = JSON.parse(localStorage.getItem(`userSettings_${email}`) || "{}");
  const [form, setForm] = useState({
    name: localStorage.getItem("userName") || initial.name || "User",
    email,
    contact: initial.contact || "",
    bio: initial.bio || "",
    photo: initial.photo || "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchProfile()
      .then(p => {
        const toAbsolute = (url) => (url && url.startsWith("/uploads/")) ? `http://localhost:8080${url}` : url;
        const next = {
          name: p.name || form.name,
          email: p.email || email,
          contact: p.contact || "",
          bio: p.bio || "",
          photo: toAbsolute(p.profileImageUrl) || "",
        };
        setForm(next);
        localStorage.setItem(`userSettings_${email}`, JSON.stringify({ ...initial, ...next }));
        if (next.name) localStorage.setItem("userName", next.name);
      })
      .catch(err => setError(err.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    uploadPhoto({ file })
      .then(p => {
        const toAbsolute = (url) => (url && url.startsWith("/uploads/")) ? `http://localhost:8080${url}` : url;
        const next = { ...form, photo: toAbsolute(p.profileImageUrl) || form.photo };
        setForm(next);
        localStorage.setItem(`userSettings_${email}`, JSON.stringify({ ...initial, ...next }));
      })
      .catch(err => setError(err.message || "Failed to upload"))
      .finally(() => setSaving(false));
  };

  const save = () => {
    setSaving(true);
    setError("");
    updateProfile({ data: { name: form.name, contact: form.contact, bio: form.bio } })
      .then(p => {
        const toAbsolute = (url) => (url && url.startsWith("/uploads/")) ? `http://localhost:8080${url}` : url;
        const next = {
          name: p.name,
          email: p.email,
          contact: p.contact || "",
          bio: p.bio || "",
          photo: toAbsolute(p.profileImageUrl) || form.photo,
        };
        setForm(next);
        localStorage.setItem(`userSettings_${email}`, JSON.stringify({ ...initial, ...next }));
        localStorage.setItem("userName", next.name);
        navigate("/dashboard");
      })
      .catch(err => setError(err.message || "Failed to save"))
      .finally(() => setSaving(false));
  };

  return (
    <DashboardLayout>
      <div className="content-card">
        <h3 className="h6 mb-3">Profile</h3>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {loading && <div className="text-muted small mb-2">Loading...</div>}
        <div className="d-flex align-items-center gap-3 mb-3">
          <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: "1px solid #e5e5e5" }}>
            {form.photo ? (
              <img src={form.photo} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div className="avatar" style={{ width: "100%", height: "100%" }}>
                <span>{form.name?.[0]?.toUpperCase() || "U"}</span>
              </div>
            )}
          </div>
          <div className="flex-grow-1">
            <Form.Group>
              <Form.Label>Change Photo</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={onPhoto} />
            </Form.Group>
          </div>
        </div>
        <div className="d-grid gap-3">
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" value={form.name} onChange={onChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control value={form.email} readOnly />
          </Form.Group>
          <Form.Group>
            <Form.Label>Contact</Form.Label>
            <Form.Control name="contact" value={form.contact} onChange={onChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Bio</Form.Label>
            <Form.Control as="textarea" rows={3} name="bio" value={form.bio} onChange={onChange} />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
