import React, { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import "../css modules/Auth.css";

export default function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);

  if (!setTheme) {
    console.error("ThemeContext is missing setTheme function!");
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="theme-toggle"
      aria-label={`Toggle ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? "☀️" : "🌙"}
    </button>
  );
}
