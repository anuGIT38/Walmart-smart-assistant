import React, { useState } from "react";
import { Link } from "react-router-dom";
import WalmartHeader from "../WalmartHeader";
import SocialAuth from "./SocialAuth";
import "../../css-modules/Auth.css";
import ThemeToggle from "../ThemeToggle";
import { useFirebase } from "../../firebase";
import { Eye, EyeOff } from "lucide-react"; // You can use react-icons if preferred

export default function Signup() {
  const { signupUserWithEmailAndPassword } = useFirebase();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)) return "Medium";
    if (password.match(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/)) return "Strong";
    return "Weak";
  };

  const handleSignup = async () => {
    try {
      const user = await signupUserWithEmailAndPassword(email, password);
      console.log("✅ User created:", user);
      alert("Signup successful!");
    } catch (error) {
      console.error("❌ Signup error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="auth-page">
      <WalmartHeader />
      <ThemeToggle />
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Create account</h1>

          <div className="auth-field">
            <label>Full name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <span className={`password-strength ${getPasswordStrength(password).toLowerCase()}`}>
              {getPasswordStrength(password)}
            </span>
          </div>

          <button className="auth-button" onClick={handleSignup}>
            Sign up
          </button>

          <SocialAuth />

          <div className="auth-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
