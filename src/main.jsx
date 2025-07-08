import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { FirebaseProvider } from "./firebase";
import React from "react";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./Components/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <FirebaseProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </FirebaseProvider>
    </BrowserRouter>
  </StrictMode>
);
