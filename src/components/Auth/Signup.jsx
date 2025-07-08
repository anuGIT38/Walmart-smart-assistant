import React from "react";
import { Link } from "react-router-dom";
import WalmartHeader from "../WalmartHeader";
import SocialAuth from "./SocialAuth";
import "../../css modules/Auth.css";
import ThemeToggle from "../ThemeToggle";

export default function Signup() {
  return (
    <div className="auth-page">
      <WalmartHeader />
      <ThemeToggle />
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Create account</h1>

          <div className="auth-field">
            <label>Full name</label>
            <input type="text" placeholder="Enter your full name" />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input type="password" placeholder="Create a password" />
            <span className="password-strength weak">Weak</span>
          </div>

          <button className="auth-button">Sign up</button>

          <SocialAuth />

          <div className="auth-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
