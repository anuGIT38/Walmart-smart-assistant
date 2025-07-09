import { useState, useEffect, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, ThemeContext } from "./components/ThemeContext";
import { AuthProvider, AuthContext } from "./components/AuthContext";
import SplashScreen from "./components/SplashScreen";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import HomePage from "./components/HomePage";
import "./css modules/Auth.css";
import "./css modules/HomePage.css";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {showSplash ? (
            <SplashScreen />
          ) : (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
