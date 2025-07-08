import React from "react";
import { useNavigate } from "react-router-dom";

export default function SocialLogins({ setUser }) {
  const navigate = useNavigate();

  const handleMockLogin = (provider) => {
    // Mock social login
    setUser({ email: `${provider}@example.com` });
    navigate("/home");
  };

  return (
    <div className="social-logins">
      <p className="divider">or continue with</p>
      <button
        className="social-button google"
        onClick={() => handleMockLogin("google")}
      >
        Continue with Google
      </button>
      <button
        className="social-button facebook"
        onClick={() => handleMockLogin("facebook")}
      >
        Continue with Facebook
      </button>
    </div>
  );
}
