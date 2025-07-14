import React, { useState } from "react";
import "../../css-modules/HomePage.css";
const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { text: "Hi there! How can I help you today?", sender: "ai" },
  ]);
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setInput("");

    // Mock AI response
    setTimeout(() => {
      const responses = [
        "I found peanut butter in Aisle 1",
        "Try almond butter as a healthier alternative",
        "Your last purchase was organic shampoo",
        "You're near the snacks section",
      ];
      setMessages((prev) => [
        ...prev,
        {
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: "ai",
        },
      ]);
    }, 800);
  };

  return (
    <div className="feature-content">
      <h3>AI Assistant</h3>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit">→</button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
