import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import { ThemeProvider } from "./components/ThemeContext";
import "./css modules/Auth.css";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <ThemeProvider>
      {showSplash ? (
        <SplashScreen />
      ) : (
        <BrowserRouter>
          <Routes>
            {/* ... routes ... */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      )}
    </ThemeProvider>
  );
}

export default App;
