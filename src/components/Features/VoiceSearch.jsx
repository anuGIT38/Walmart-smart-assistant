import React, { useState } from "react";
import { FaMicrophone, FaStop, FaSearch } from "react-icons/fa";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const VoiceSearch = ({ onSearch }) => {
  const [manualQuery, setManualQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  // Sample product database
  const productDatabase = [
    {
      id: 1,
      name: "Organic Peanut Butter",
      category: "Pantry",
      price: "$4.99",
    },
    { id: 2, name: "Whole Grain Bread", category: "Bakery", price: "$3.49" },
    { id: 3, name: "Almond Milk", category: "Dairy", price: "$2.99" },
    { id: 4, name: "Fresh Apples", category: "Produce", price: "$0.99/lb" },
    { id: 5, name: "Cage-Free Eggs", category: "Dairy", price: "$3.79" },
  ];

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    if (transcript.trim()) {
      handleSearch(transcript);
    }
  };

  const handleSearch = (query) => {
    setIsProcessing(true);
    // Simulate API call delay
    setTimeout(() => {
      const results = productDatabase.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      if (onSearch) onSearch(results);
      setIsProcessing(false);
    }, 800);
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualQuery.trim()) {
      handleSearch(manualQuery);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="voice-search-error">
        <p>Your browser doesn't support speech recognition.</p>
        <p>Please try Chrome, Edge, or Safari.</p>
      </div>
    );
  }

  if (!isMicrophoneAvailable) {
    return (
      <div className="voice-search-error">
        <p>Microphone access is blocked.</p>
        <p>Please allow microphone permissions in your browser settings.</p>
      </div>
    );
  }

  return (
    <div className="voice-search-container">
      <h2 className="voice-search-title">Voice Product Search</h2>

      {/* Search Input */}
      <form onSubmit={handleManualSearch} className="search-form">
        <div className="input-wrapper">
          <input
            type="text"
            value={listening ? transcript : manualQuery}
            onChange={(e) => setManualQuery(e.target.value)}
            placeholder={listening ? "Listening..." : "Speak or type to search"}
            className="search-input"
            aria-label="Search products"
          />
          <div className="voice-feedback">
            {listening && (
              <span className="listening-indicator">
                <span className="pulse-dot"></span>
                Listening...
              </span>
            )}
          </div>
        </div>

        <div className="button-group">
          <button
            type="button"
            className={`mic-button ${listening ? "listening" : ""}`}
            onClick={listening ? stopListening : startListening}
            disabled={isProcessing}
          >
            {listening ? <FaStop /> : <FaMicrophone />}
          </button>

          <button
            type="submit"
            className="search-button"
            disabled={isProcessing || (!transcript && !manualQuery.trim())}
          >
            {isProcessing ? "Searching..." : <FaSearch />}
          </button>
        </div>
      </form>

      {/* Search Results */}
      {isProcessing ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Finding products...</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="search-results">
          <h3>Results for "{listening ? transcript : manualQuery}"</h3>
          <ul className="results-list">
            {searchResults.map((product) => (
              <li key={product.id} className="result-item">
                <span className="product-name">{product.name}</span>
                <span className="product-category">{product.category}</span>
                <span className="product-price">{product.price}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (transcript || manualQuery) && !isProcessing ? (
        <div className="no-results">
          No products found for "{listening ? transcript : manualQuery}"
        </div>
      ) : null}

      <div className="feature-demo-context">
        <h3 className="demo-title">Voice-Activated Search</h3>
        <p className="demo-text">
          Speak naturally to find products and get answers:
        </p>
        <ul className="demo-features">
          <li>
            <strong>Hands-free operation</strong> while shopping
          </li>
          <li>
            <strong>Natural language queries</strong> like "Where's the organic
            milk?"
          </li>
          <li>
            <strong>Instant location mapping</strong> to AR navigation
          </li>
        </ul>
        <p className="demo-note">
          Tip: Speak clearly in a normal voice - no need to shout!
        </p>
      </div>
    </div>
  );
};

export default VoiceSearch;
