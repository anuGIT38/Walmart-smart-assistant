import React, { useState } from "react";
import { Link } from "react-router-dom";
import WalmartHeader from "../WalmartHeader";
import SocialAuth from "./SocialAuth";
import ThemeToggle from "../ThemeToggle";
import "../../css-modules/Auth.css";
import { useFirebase } from "../../firebase";
import { Eye, EyeOff } from "lucide-react";
export default function Login() {
  const firebase = useFirebase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const signIn = async () => {
    try {
      await firebase.signinUserWithEmailAndPassword(email, password);
      alert("Sign-in success");
    } catch (err) {
      console.error("Login error:", err.message);
      alert("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="auth-page">
      <WalmartHeader />
      <ThemeToggle />
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </span>
            </div>
          </div>

          <button className="auth-button" onClick={signIn}>
            Login
          </button>

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
