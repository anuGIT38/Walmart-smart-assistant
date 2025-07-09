import React from "react";
import googleIcon from "../../assets/google-icon.png";
import facebookIcon from "../../assets/facebook-icon.webp";
import "../../css-modules/Auth.css";
import { useFirebase } from "../../firebase";

export default function SocialAuth() {
  const { signinWithGoogle, signinWithFacebook } = useFirebase();

  const handleGoogleSignIn = async () => {
    try {
      const user = await signinWithGoogle();
      console.log("✅ Google Sign-in success:", user);
      alert("Signed in with Google!");
    } catch (error) {
      console.error("❌ Google Sign-in error:", error.message);
      alert("Google Sign-in failed");
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const user = await signinWithFacebook();
      console.log("✅ Facebook Sign-in success:", user);
      alert(`Signed in as ${user.displayName}`);
    } catch (error) {
      console.error("❌ Facebook Sign-in error:", error.message);
      alert("Facebook Sign-in failed");
    }
  };

  return (
    <div className="social-auth">
      <div className="social-divider">or continue with</div>
      <div className="social-buttons">
        <button className="social-button" onClick={handleGoogleSignIn}>
          <img
            src={googleIcon}
            alt="Google"
            className="social-icon"
            style={{ width: "18px", height: "18px" }}
          />
          Continue with Google
        </button>
        <button className="social-button" onClick={handleFacebookSignIn}>
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
