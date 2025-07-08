import React from "react";

export default function PasswordStrengthMeter({ password }) {
  const calculateStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length > 5) strength += 0.3;
    if (/[A-Z]/.test(password)) strength += 0.2;
    if (/[0-9]/.test(password)) strength += 0.3;
    if (/[^A-Za-z0-9]/.test(password)) strength += 0.2;
    return Math.min(strength, 1);
  };

  const strength = calculateStrength();
  const strengthText =
    strength < 0.4
      ? "Weak"
      : strength < 0.7
      ? "Fair"
      : strength < 0.9
      ? "Good"
      : "Strong";

  return (
    <div className="password-strength">
      <div
        className="strength-bar"
        style={{ "--strength": strength * 100 + "%" }}
      />
      <span className="strength-text">{strengthText}</span>
    </div>
  );
}
