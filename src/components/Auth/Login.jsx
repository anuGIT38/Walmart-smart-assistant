import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import WalmartHeader from "../WalmartHeader";
import SocialAuth from "./SocialAuth";
import ThemeToggle from "../ThemeToggle";
import "../../css modules/Auth.css";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Replace with actual API call
      const response = await mockLoginAPI(email, password);
      login(response.user);
      navigate("/home");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  // Mock API function
  const mockLoginAPI = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          resolve({
            user: {
              email,
              name: "Demo User",
              lastPurchase: "Organic Shampoo",
            },
            token: "mock-jwt-token",
          });
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 500);
    });
  };

  return (
    <div className="auth-page">
      <WalmartHeader />
      <ThemeToggle />
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
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

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-button">
              Login
            </button>
          </form>

          <Link to="/forgot-password" className="forgot-password">
            Forgot password?
          </Link>

          <SocialAuth />

          <div className="auth-footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
