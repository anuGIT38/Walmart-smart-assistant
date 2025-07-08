import React from "react";
import walmartLogo from "../assets/walmartlogo.jpg";
import "../css modules/SplashScreen.css";

function SplashScreen() {
  return (
    <div className="splash-container">
      <img src={walmartLogo} alt="Walmart Logo" className="splash-logo" />
    </div>
  );
}

export default SplashScreen;
