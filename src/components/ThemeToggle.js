import React, { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={`theme-toggle ${theme}`}
    >
      <span className="light-icon">☀️</span>
      <span className="dark-icon">🌙</span>
    </button>
  );
}
