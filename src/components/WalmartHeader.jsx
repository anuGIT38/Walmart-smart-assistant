import React from "react";
import logo from "../assets/walmartlogo.jpg";

export default function WalmartHeader() {
  return (
    <header className="walmart-header">
      <img src={logo} alt="Walmart" className="walmart-logo" />
    </header>
  );
}
