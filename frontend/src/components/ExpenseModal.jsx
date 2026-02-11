import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ExpenseModal = ({ show, handleClose, expenseToEdit, onSave, availableBalance = 0 }) => {
  const [formData, setFormData] = useState(expenseToEdit || {
    type: "expense",
    amount: "",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
    description: "",
    status: "completed", // completed | blocked
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "isFuture") {
        setFormData({
            ...formData,
            status: checked ? "blocked" : "completed"
        });
        return;
    }
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(""); // Clear error on change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    
    // Financial Discipline: Stop expenses if amount exceeds available balance
    // For edits, we need to consider the amount being returned to balance (simplification: just check against available for now, 
    // but ideally we'd add back the old amount. Let's try to be smart: effectiveBalance = availableBalance + (expenseToEdit ? expenseToEdit.amount : 0))
    if (formData.type === "expense") {
        const effectiveBalance = availableBalance + (expenseToEdit && expenseToEdit.type === 'expense' ? parseFloat(expenseToEdit.amount) : 0);
        if (amount > effectiveBalance) {
            setError(`Insufficient funds! You only have ₹${effectiveBalance.toLocaleString()} available.`);
            return;
        }
    }

    onSave({
      ...formData,
      amount: amount,
      id: expenseToEdit ? expenseToEdit.id : Date.now().toString(),
    });
    handleClose();
  };

  const expenseCategories = ["Food", "Rent", "Travel", "Shopping", "Entertainment", "Health", "Education", "Other"];
  const incomeCategories = ["Salary", "Freelance", "Investment", "Gift", "Other"];

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{expenseToEdit ? "Edit Transaction" : "Add Transaction"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio"
                label="Expense"
                name="type"
                value="expense"
                checked={formData.type === "expense"}
                onChange={handleChange}
                id="type-expense"
              />
              <Form.Check
                type="radio"
                label="Income"
                name="type"
                value="income"
                checked={formData.type === "income"}
                onChange={handleChange}
                id="type-income"
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formAmount">
            <Form.Label>Amount (₹)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formCategory">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {(formData.type === "expense" ? expenseCategories : incomeCategories).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formDate">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              max={new Date().toISOString().split("T")[0]} // Prevent future dates
            />
          </Form.Group>

          {formData.type === "expense" && (
            <Form.Group className="mb-3" controlId="formFuture">
                <Form.Check 
                    type="checkbox"
                    label="Reserve this amount for future expense"
                    name="isFuture"
                    checked={formData.status === "reserved"}
                    onChange={handleChange}
                />
                <Form.Text className="text-muted">
                    This will deduct from your balance but mark it as 'Reserved'.
                </Form.Text>
            </Form.Group>
          )}

          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {expenseToEdit ? "Update" : "Add"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ExpenseModal;
