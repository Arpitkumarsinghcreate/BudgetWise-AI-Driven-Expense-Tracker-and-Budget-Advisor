import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const sectionsRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    const sections = sectionsRef.current;
    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="homepage">
      {/* Header */}
      <header className={`header ${isScrolled ? "scrolled" : ""}`}>
        <div className="header-container">
          <div className="logo-container">
            <div className="logo-icon">
              <span className="logo-e">E</span>
              <div className="logo-bars">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <span className="logo-text">AI Expense Track</span>
          </div>
          <nav className="nav-links">
            <button onClick={() => scrollToSection("benefits")}>
              Benefits
            </button>
            <button onClick={() => scrollToSection("features")}>
              Features
            </button>
            <button onClick={() => scrollToSection("how-it-works")}>
              How it works
            </button>
          </nav>
          <button
            className="download-btn-header"
            onClick={() => navigate("/login")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span>Login</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Take control of your finances</h1>
          <p className="hero-subtitle">
            Spend less time worrying about your expenses and focus on becoming
            financially stable with our easy to use AI-powered expense tracker.
          </p>
          <div className="hero-buttons">
            <button
              className="download-btn-hero"
              onClick={() => navigate("/login")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span>Login</span>
            </button>
            <button
              className="signup-btn-hero"
              onClick={() => navigate("/signup")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      </section>

      {/* Phone Mockup Section */}
      <section className="phone-mockup-section">
        <div className="phone-container">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="phone-status-bar">
                <span className="phone-time">6:28</span>
                <div className="phone-icons">
                  <span className="signal-icon">📶</span>
                  <span className="wifi-icon">📶</span>
                  <span className="battery-icon">66%</span>
                </div>
              </div>
              <div className="phone-header">
                <span className="hamburger">☰</span>
                <span className="phone-title">AI Expense Track</span>
                <span className="more-options">⋮</span>
              </div>
              <div className="phone-content">
                <p className="phone-greeting">Hello, Tell us your name 👋</p>
                <div className="phone-summary">
                  <span>Summary</span>
                  <span className="phone-date">Last 30 days ⏏</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="benefits-section scroll-section"
        ref={(el) => (sectionsRef.current[0] = el)}
      >
        <div className="section-container">
          <h2 className="section-title">Why Choose AI Expense Track?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🤖</div>
              <h3>AI-Powered Insights</h3>
              <p>
                Get intelligent spending analysis and personalized financial
                recommendations
              </p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h3>Quick & Easy</h3>
              <p>Track expenses in seconds with our intuitive interface</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📊</div>
              <h3>Visual Analytics</h3>
              <p>
                Understand your spending patterns with beautiful charts and
                graphs
              </p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your financial data is encrypted and stored securely</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="features-section scroll-section"
        ref={(el) => (sectionsRef.current[1] = el)}
      >
        <div className="section-container">
          <h2 className="section-title">Powerful Features</h2>
          <div className="features-list">
            <div className="feature-item">
              <div className="feature-number">01</div>
              <div className="feature-content">
                <h3>Smart Expense Categorization</h3>
                <p>
                  Automatically categorize your expenses using AI technology
                </p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-number">02</div>
              <div className="feature-content">
                <h3>Budget Planning</h3>
                <p>Set budgets and get alerts when you're approaching limits</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-number">03</div>
              <div className="feature-content">
                <h3>Expense Reports</h3>
                <p>Generate detailed reports for any time period</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-number">04</div>
              <div className="feature-content">
                <h3>Multi-Currency Support</h3>
                <p>Track expenses in multiple currencies seamlessly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="how-it-works-section scroll-section"
        ref={(el) => (sectionsRef.current[2] = el)}
      >
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-icon">1</div>
              <h3>Sign Up</h3>
              <p>Create your account in seconds</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-icon">2</div>
              <h3>Add Expenses</h3>
              <p>Start tracking your spending</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-icon">3</div>
              <h3>Get Insights</h3>
              <p>Receive AI-powered financial insights</p>
            </div>
          </div>
          <div className="cta-section">
            <button className="cta-button" onClick={() => navigate("/signup")}>
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <div className="logo-icon">
              <span className="logo-e">E</span>
              <div className="logo-bars">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <span className="logo-text">AI Expense Track</span>
          </div>
          <div className="footer-links">
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/signup")}>Sign Up</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 AI Expense Track. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
