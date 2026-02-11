import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ProfileModal = ({ show, handleClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    contact: initialData?.contact || "",
    photo: initialData?.photo || "",
    monthlyIncome: initialData?.monthlyIncome || "",
    financialGoal: initialData?.financialGoal || "",
  });

  // Modal is re-mounted via key, so no effect needed to sync initialData

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className="d-flex align-items-center gap-3 mb-3">
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#f0f0f0",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #e5e5e5",
              }}
            >
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontWeight: 700, color: "#666" }}>
                  {(formData.name || "U")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-grow-1">
              <Form.Group controlId="formPhoto" className="mb-2">
                <Form.Label>Edit Photo</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handlePhotoChange} />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Edit Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={formData.email} readOnly />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formContact">
            <Form.Label>Edit Contact</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Enter contact number"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formMonthlyIncome">
            <Form.Label>Monthly Income Goal / Budget</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter monthly income"
              name="monthlyIncome"
              value={formData.monthlyIncome}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              This helps in calculating your savings potential.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formFinancialGoal">
            <Form.Label>Financial Goal</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="e.g. Save ₹50,000 for a vacation"
              name="financialGoal"
              value={formData.financialGoal}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ProfileModal;
