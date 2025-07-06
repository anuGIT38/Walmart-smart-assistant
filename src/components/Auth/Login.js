import React from "react";
import { Link } from "react-router-dom";
import WalmartHeader from "../WalmartHeader";
import SocialAuth from "./SocialAuth";
import ThemeToggle from "../ThemeToggle";
import "../../css modules/Auth.css";

export default function Login() {
  return (
    <div className="auth-page">
      <WalmartHeader />
      <ThemeToggle />
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>

          <div className="auth-field">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" />
          </div>

          <button className="auth-button">Login</button>
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
