import React, { useState } from "react";

const ARNavigation = () => {
  const [userPosition, setUserPosition] = useState("entrance");

  // Store layout data
  const storeLayout = {
    entrance: {
      instructions: [
        {
          direction: "Walk straight",
          target: "Aisle 1",
          distance: "50 ft",
          arrow: "↑",
        },
        {
          direction: "Turn right",
          target: "Snacks section",
          distance: "30 ft",
          arrow: "→",
        },
      ],
      view: "Main Entrance",
      mapPosition: { x: 10, y: 90 },
    },
    aisle1: {
      instructions: [
        {
          direction: "On your right",
          target: "Peanut Butter",
          distance: "5 ft",
          arrow: "→",
        },
        {
          direction: "Ahead",
          target: "Crackers",
          distance: "15 ft",
          arrow: "↑",
        },
      ],
      view: "Aisle 1: Snacks",
      mapPosition: { x: 40, y: 50 },
    },
    checkout: {
      instructions: [
        {
          direction: "Proceed straight",
          target: "Cashiers",
          distance: "20 ft",
          arrow: "↑",
        },
      ],
      view: "Checkout Area",
      mapPosition: { x: 80, y: 10 },
    },
  };

  return (
    <div className="ar-container">
      {/* 2D Store Map */}
      <div className="store-map">
        <h4>Store Layout</h4>
        <div className="map-grid">
          {/* Map elements */}
          <div
            className="map-aisle aisle-main"
            style={{ top: "20%", left: "45%", width: "10%", height: "60%" }}
          ></div>
          <div
            className="map-aisle aisle-horizontal"
            style={{ top: "40%", left: "20%", width: "60%", height: "10%" }}
          ></div>

          {/* User position indicator */}
          <div
            className="user-position"
            style={{
              left: `${storeLayout[userPosition].mapPosition.x}%`,
              top: `${storeLayout[userPosition].mapPosition.y}%`,
            }}
          >
            <div className="user-pulse"></div>
          </div>

          {/* Location markers */}
          <div
            className="map-marker entrance"
            style={{ left: "10%", top: "90%" }}
          >
            Entrance
          </div>
          <div
            className="map-marker snacks"
            style={{ left: "40%", top: "50%" }}
          >
            Snacks
          </div>
          <div
            className="map-marker checkout"
            style={{ left: "80%", top: "10%" }}
          >
            Checkout
          </div>
        </div>
      </div>

      {/* AR Navigation Directions */}
      <div className="ar-directions">
        <h3>{storeLayout[userPosition].view}</h3>

        <div className="ar-steps">
          {storeLayout[userPosition].instructions.map((step, index) => (
            <div key={index} className="ar-step">
              <span className="ar-arrow">{step.arrow}</span>
              <div className="step-text">
                <p className="direction">{step.direction}</p>
                <p className="target">
                  {step.target}{" "}
                  <span className="distance">({step.distance})</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Controls */}
      <div className="ar-controls">
        <button onClick={() => setUserPosition("entrance")}>Entrance</button>
        <button onClick={() => setUserPosition("aisle1")}>Aisle 1</button>
        <button onClick={() => setUserPosition("checkout")}>Checkout</button>
      </div>
    </div>
  );
};

export default ARNavigation;
