import { Link } from "react-router-dom";
import "./AuthLayout.css";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      {/* Header */}
      <header className="auth-header">
        <Link to="/" className="auth-logo-container">
          <div className="auth-logo-icon">
            <span className="auth-logo-e">E</span>
            <div className="auth-logo-bars">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <span className="auth-logo-text">AI Expense Track</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="auth-container">
        <div className="auth-content">
          {children}
        </div>
        
        {/* Decorative Elements */}
        <div className="auth-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>
    </div>
  );
}
