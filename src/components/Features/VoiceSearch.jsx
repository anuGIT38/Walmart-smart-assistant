import React, { useState } from "react";

const VoiceSearch = () => {
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState("");

  const handleVoiceInput = () => {
    setIsListening(true);
    // Mock voice recognition
    setTimeout(() => {
      setVoiceCommand("Where is peanut butter?");
      setIsListening(false);
    }, 2000);
  };

  return (
    <div className="feature-content">
      <h3>Voice Search</h3>
      <button
        className={`voice-button ${isListening ? "listening" : ""}`}
        onClick={handleVoiceInput}
      >
        {isListening ? "🛑 Listening..." : "🎤 Tap to Speak"}
      </button>
      {voiceCommand && (
        <div className="voice-result">
          <p>You asked: "{voiceCommand}"</p>
          <p>Showing results for peanut butter...</p>
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;