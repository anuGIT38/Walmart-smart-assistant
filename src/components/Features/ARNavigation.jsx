import React from "react";

const ARNavigation = () => {
  return (
    <div className="feature-content">
      <h3>AR Navigation</h3>
      <div className="ar-mockup">
        <div className="store-layout">
          <div className="aisle">
            <h4>Aisle 1: Snacks</h4>
            <div className="ar-guidance">
              <div className="ar-arrow">➔</div>
              <div className="ar-product">Peanut Butter (20 ft ahead)</div>
            </div>
          </div>
          <div className="aisle">
            <h4>Aisle 4: Beverages</h4>
            <div className="ar-guidance">
              <div className="ar-arrow">➔</div>
              <div className="ar-product">Sparkling Water (50 ft ahead)</div>
            </div>
          </div>
        </div>
        <div className="ar-view-mock">
          <div className="ar-overlay">AR View Would Appear Here</div>
        </div>
      </div>
    </div>
  );
};

export default ARNavigation;
