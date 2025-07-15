import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../../css-modules/AIAssistant.css";

const AIAssistant = () => {
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState([]); // { sender: 'user'|'assistant', text: string, products?: [] }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const handleSend = async () => {
    if (!query.trim() || loading) return;
    setError("");
    setChat((prev) => [...prev, { sender: "user", text: query }]);
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/chat", { query });
      setChat((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: res.data.response,
          products: res.data.products || [],
        },
      ]);
    } catch (err) {
      setError("Error connecting to assistant.");
      setChat((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "Sorry, I couldn't connect to the backend.",
        },
      ]);
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <div className="ai-assistant-container">
      <h2 className="ai-title">AI Shopping Assistant</h2>
      <div className="chat-window">
        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-bubble ${
              msg.sender === "user" ? "user-bubble" : "assistant-bubble"
            }`}
          >
            {msg.sender === "assistant" ? (
              <div className="bubble-text">
                {msg.text
                  .split("\n")
                  .filter(
                    (line) =>
                      line.trim() &&
                      !line.startsWith("I'm not sure which category") &&
                      !line.startsWith("Filters applied:")
                  )
                  .map((line, i) => (
                    <div className="bubble-text" key={i}>
                      {line}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bubble-text">{msg.text}</div>
            )}
            {msg.products && msg.products.length > 0 && (
              <ul className="product-list">
                {msg.products.map((p, i) => (
                  <li key={i}>
                    <span className="product-name">{p.name}</span>{" "}
                    <span className="product-brand">({p.brand})</span>:{" "}
                    <span className="product-price">₹{p.price}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant-bubble loading-bubble">
            <div className="bubble-text">Thinking...</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="input-row">
        <input
          className="chat-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything..."
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={loading || !query.trim()}
        >
          Send
        </button>
      </div>
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
};

export default AIAssistant;
