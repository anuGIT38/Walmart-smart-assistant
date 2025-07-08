import React from "react";
import googleIcon from "../../assets/google-icon.png";
import facebookIcon from "../../assets/facebook-icon.webp";
import "../../css modules/Auth.css";

export default function SocialAuth() {
  return (
    <div className="social-auth">
      <div className="social-divider">or continue with</div>
      <div className="social-buttons">
        <button className="social-button">
          <img
            src={googleIcon}
            alt="Google"
            className="social-icon"
            style={{ width: "18px", height: "18px" }}
          />
          Continue with Google
        </button>
        <button className="social-button">
          <img
            src={facebookIcon}
            alt="Facebook"
            className="social-icon"
            style={{ width: "18px", height: "18px" }}
          />
          Continue with Facebook
        </button>
      </div>
    </div>
  );
}
