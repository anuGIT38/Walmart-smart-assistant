import React, { useState } from "react";
import { Link } from "react-router-dom";
import WalmartHeader from "../WalmartHeader";
import ThemeToggle from "../ThemeToggle";
import "../../css-modules/Auth.css";
import { useFirebase } from "../../firebase";

export default function ForgotPassword() {
  const firebase = useFirebase();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
  e.preventDefault();
  setMessage("");
  setError("");
  setLoading(true);
  console.log("📨 Trying password reset for:", email);

  try {
    await firebase.sendPasswordResetEmail(email);
    setMessage("📩 Password reset email sent! Please check your inbox.");
  } catch (err) {
    console.error("Password reset error:", err.code, err.message);

    if (err.code === "auth/user-not-found") {
      setError("❌ No user found with this email.");
    } else if (err.code === "auth/invalid-email") {
      setError("❌ Invalid email format.");
    } else {
      setError("❌ " + err.message);
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="auth-page">
      <WalmartHeader />
      <ThemeToggle />
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Reset Your Password</h1>

          {message && <div className="auth-success">{message}</div>}
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleReset}>
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
