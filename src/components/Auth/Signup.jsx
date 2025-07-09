import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import WalmartHeader from "../WalmartHeader";
import SocialAuth from "./SocialAuth";
import "../../css modules/Auth.css";
import ThemeToggle from "../ThemeToggle";
import { useAuth } from "../hooks/useAuth";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [passwordStrength, setPasswordStrength] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    const mediumRegex =
      /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

    if (strongRegex.test(password)) {
      setPasswordStrength("strong");
    } else if (mediumRegex.test(password)) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("weak");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Replace with actual API call
      const response = await mockSignupAPI(formData);
      login(response.user);
      navigate("/home");
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  // Mock API function
  const mockSignupAPI = ({ name, email, password }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (name && email && password) {
          resolve({
            user: {
              email,
              name,
              lastPurchase: "None yet",
            },
            token: "mock-jwt-token",
          });
        } else {
          reject(new Error("Missing required fields"));
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
          <h1 className="auth-title">Create account</h1>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Full name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span className={`password-strength ${passwordStrength}`}>
                {passwordStrength ? `${passwordStrength} password` : ""}
              </span>
            </div>

            <button type="submit" className="auth-button">
              Sign up
            </button>
          </form>

          <SocialAuth />

          <div className="auth-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
