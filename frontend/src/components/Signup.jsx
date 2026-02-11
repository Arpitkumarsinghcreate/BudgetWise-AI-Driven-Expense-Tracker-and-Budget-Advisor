import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import "./Auth.css";
import { signupInit, signupVerify, loginToken } from "../api/auth";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState("");
  const [apiError, setApiError] = useState("");

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Email validation
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(
        emailRegex.test(value) ? "" : "Please enter a valid email address"
      );
    }

    // Password match validation
    if (name === "confirmPassword") {
      setPasswordError(
        value !== formData.password ? "Passwords do not match" : ""
      );
    }

    if (name === "password") {
      setPasswordError(
        formData.confirmPassword && value !== formData.confirmPassword
          ? "Passwords do not match"
          : ""
      );
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Block submit if validation errors exist
    if (emailError || passwordError) return;

    // 🔐 NEW RULE: Password should not contain user's name
    const nameParts = formData.name.toLowerCase().split(" ");
    const passwordLower = formData.password.toLowerCase();

    const containsName = nameParts.some(
      (part) => part && passwordLower.includes(part)
    );

    if (containsName) {
      setPasswordError("Password should not contain your name");
      return;
    }

    setApiError("");
    setIsLoading(true);
    try {
      await signupInit({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setStep("otp");
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setApiError("Enter the 6-digit OTP");
      return;
    }
    setApiError("");
    setIsLoading(true);
    try {
      await signupVerify({ email: formData.email, otp });
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", formData.name);
      localStorage.setItem("userEmail", formData.email);
      try {
        const { token } = await loginToken({ email: formData.email, password: formData.password });
        if (token) localStorage.setItem("authToken", token);
      } catch { void 0; }
      navigate("/dashboard");
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-container">
        <div className="auth-header-content">
          <h1 className="auth-title">Create your account🚀</h1>
          <p className="auth-subtitle">
            Let AI help you track & optimize your expenses
          </p>
        </div>

        {step === "form" && (
        <form onSubmit={handleSignup} className="auth-form" noValidate>
          {/* NAME */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
              autoComplete="email"
            />
            {emailError && <p className="auth-error">{emailError}</p>}
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-group">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="form-input has-icon"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="password-input-group">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="form-input has-icon"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {passwordError && (
              <p className="auth-error">{passwordError}</p>
            )}
          </div>

          {/* TERMS */}
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox-input" required />
              <span>
                I agree to the{" "}
                <Link to="#" className="auth-link-inline">
                  Terms & Conditions
                </Link>
              </span>
            </label>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className={`auth-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
          {apiError && <p className="auth-error" style={{ marginTop: "0.75rem" }}>{apiError}</p>}
        </form>
        )}
        {step === "otp" && (
          <form onSubmit={handleVerify} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="otp" className="form-label">
                Enter OTP sent to {formData.email}
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                className="form-input"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                pattern="^\\d{6}$"
              />
            </div>
            {apiError && <p className="auth-error">{apiError}</p>}
            <button
              type="submit"
              className={`auth-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span>Or continue with</span>
        </div>

        <div className="social-buttons">
          <button type="button" className="social-button">
            Google
          </button>
        </div>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
