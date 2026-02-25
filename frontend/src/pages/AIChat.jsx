import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { chat } from "../api/ai";

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("Professional");
  const [includeGoals, setIncludeGoals] = useState(true);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (!input.trim()) return;
    const userMsg = { id: `${Date.now()}-${Math.random()}`, role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError("");
    try {
      const res = await chat({ message: input, toneMode: tone, month, includeGoals });
      const aiMsg = { id: `${Date.now()}-${Math.random()}`, role: "assistant", content: res.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setError(e.message || "Chat failed");
    } finally {
      setLoading(false);
      setInput("");
    }
  }

  return (
    <DashboardLayout>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="bg-white p-3 rounded shadow-sm mb-3 d-flex gap-2 align-items-center">
        <select className="form-select w-auto" value={tone} onChange={e => setTone(e.target.value)}>
          <option>Strict</option>
          <option>Friendly</option>
          <option>Professional</option>
        </select>
        <label className="form-check-label d-flex align-items-center gap-2">
          <input type="checkbox" className="form-check-input" checked={includeGoals} onChange={e => setIncludeGoals(e.target.checked)} />
          Include goals
        </label>
        <input className="form-control w-auto" value={month} onChange={e => setMonth(e.target.value)} placeholder="YYYY-MM" />
      </div>
      <div className="bg-white p-3 rounded shadow-sm" style={{minHeight: 300}}>
        {messages.length === 0 && <div className="text-muted">Start a conversation with BudgetWise Assistant</div>}
        {messages.map((m, i) => (
          <div key={m.id || i} className={`mb-2 ${m.role === "user" ? "text-end" : ""}`}>
            <div className={`d-inline-block p-2 rounded ${m.role === "user" ? "bg-primary text-white" : "bg-light"}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="d-flex gap-2 mt-3">
        <input className="form-control" value={input} onChange={e => setInput(e.target.value)} placeholder="Type your message" onKeyDown={e => { if (e.key === "Enter") send(); }} />
        <button className="btn btn-primary" onClick={send} disabled={loading}>{loading ? "Sending..." : "Send"}</button>
      </div>
    </DashboardLayout>
  );
}
