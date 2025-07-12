import React, { useState } from "react";

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

      <div className="feature-demo-context">
        <h3 className="demo-title">AI Shopping Assistant</h3>
        <p className="demo-text">Your personal Walmart shopping helper can:</p>
        <ul className="demo-features">
          <li>
            {" "}
            <strong>Answer product questions</strong> instantly
          </li>
          <li>
            {" "}
            <strong>Manage your shopping list</strong> automatically
          </li>
          <li>
            {" "}
            <strong>Suggest smart alternatives</strong> when items are out of
            stock
          </li>
        </ul>
        <p className="demo-note">
          Tip: Try asking "What's a good substitute for almond milk?"
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
