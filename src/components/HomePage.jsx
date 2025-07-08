import React from "react";
import walmartLogo from "../assets/walmartlogo.jpg";
import "../css modules/HomePage.css";

export default function HomePage() {
  return (
    <div className="home-container">
      <header className="header">
        <img src={walmartLogo} alt="Walmart Logo" className="header-logo" />
      </header>
    </div>
  );
}
