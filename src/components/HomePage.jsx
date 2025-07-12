import React, { useContext, useState } from "react";
import { ThemeContext } from "./ThemeContext";
import { useAuth } from "./hooks/useAuth";
import "../css modules/HomePage.css";
import logo from "../assets/walmartlogo.jpg";
import ARNavigation from "./Features/ARNavigation";
import BarcodeScanner from "./Features/BarcodeScanner";
import AIAssistant from "./Features/AIAssistant";
import VoiceSearch from "./Features/VoiceSearch";

const HomePage = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [activeFeature, setActiveFeature] = useState("ar");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { logout } = useAuth();

  // Mock user data
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com",
    lastPurchase: "Organic Shampoo",
  });

  const [editUsername, setEditUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.name || "");

  const handleUsernameUpdate = () => {
    // Update username logic here
    setUser({ ...user, name: newUsername });
    setEditUsername(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className={`home-page ${theme}`}>
      {/* Header Section */}

      <header className="app-header">
        {/* Walmart Logo - Left */}
        <div className="header-logo">
          <img src={logo} alt="Walmart" className="walmart-logo" />
        </div>

        {/* Right Side Controls */}
        <div className="header-controls">
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "☀️" : "🌙"}
          </button>

          <div className="user-controls">
            <button
              className="user-icon"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              👤
            </button>

            {userMenuOpen && (
              <div className="user-menu">
                {editUsername ? (
                  <div className="username-edit">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      autoFocus
                    />
                    <button onClick={handleUsernameUpdate}>Save</button>
                    <button onClick={() => setEditUsername(false)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h3 onClick={() => setEditUsername(true)}>
                    {user?.name || "Guest"}
                  </h3>
                )}

                <div className="user-activity">
                  <h4>Recent Activity</h4>
                  <ul>
                    <li>Viewed Peanut Butter</li>
                    <li>Purchased Organic Shampoo</li>
                    <li>Searched for Snacks</li>
                  </ul>
                </div>

                <div className="menu-actions">
                  <button className="menu-button">Account Settings</button>
                  <button className="menu-button" onClick={logout}>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Features Grid */}
      <div className="features-grid">
        <button
          className={`feature-card ${activeFeature === "ar" ? "active" : ""}`}
          onClick={() => setActiveFeature("ar")}
        >
          🏷️ AR Navigation
        </button>

        <button
          className={`feature-card ${activeFeature === "scan" ? "active" : ""}`}
          onClick={() => setActiveFeature("scan")}
        >
          📷 Barcode Scan
        </button>

        <button
          className={`feature-card ${
            activeFeature === "voice" ? "active" : ""
          }`}
          onClick={() => setActiveFeature("voice")}
        >
          🎤 Voice Search
        </button>

        <button
          className={`feature-card ${activeFeature === "chat" ? "active" : ""}`}
          onClick={() => setActiveFeature("chat")}
        >
          💬 AI Assistant
        </button>
      </div>

      {/* Active Feature Display Area */}
      <div className="feature-display">
        {activeFeature === "ar" && <ARNavigation />}
        {activeFeature === "scan" && <BarcodeScanner />}
        {activeFeature === "voice" && <VoiceSearch />}
        {activeFeature === "chat" && <AIAssistant />}
      </div>

      {/* AI Purchase Suggestions (will appear based on location) */}
      {/* <AISuggestions user={user} /> */}
    </div>
  );
};

// // Placeholder components (we'll implement these next)
// const ARNavigation = () => (
//   <div className="feature-content">AR Navigation UI coming soon</div>
// );
// const BarcodeScanner = () => (
//   <div className="feature-content">Barcode Scanner UI coming soon</div>
// );
// const VoiceSearch = () => (
//   <div className="feature-content">Voice Search UI coming soon</div>
// );
// const AIAssistant = () => (
//   <div className="feature-content">AI Chat UI coming soon</div>
// );
// const AISuggestions = ({ user }) => (
//   <div className="ai-suggestion">
//     <p>
//       Hey {user.name}! You're near the shampoo aisle. Last time you bought{" "}
//       {user.lastPurchase}.
//     </p>
//   </div>
// );

export default HomePage;
