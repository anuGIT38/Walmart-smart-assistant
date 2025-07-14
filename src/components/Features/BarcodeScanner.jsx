import React, { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import "../../css-modules/BarcodeScan.css";

const products = {
  1: {
    id: "31",
    name: "Bru Gold Instant Coffee 100g",
    brand: "Bru",
    price: 275,
    category: "beverage",
    features: "Smooth and strong flavor",
    tags: ["coffee", "instant", "strong"],
  },
  2: {
    id: "22",
    name: "Mad Angles",
    brand: "Bingo",
    price: 25,
    category: "snacks",
    features: "Tangy tomato flavor",
    tags: ["tangy", "processed", "budget"],
  },
};

export default function BarcodeScan() {
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState("");
  const [scannedProductId, setScannedProductId] = useState(null);

  useEffect(() => {
    let timer;
    if (scanning) {
      timer = setTimeout(() => {
        setScanning(false);
        setScannedResult("Scanned after 5 seconds");
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [scanning]);

  const handleScanStart = (productId) => {
    setScannedProductId(productId);
    setScanning(true);
    setScannedResult(""); // Clear previous result
  };

  const handleDetected = (result) => {
    // You could match barcode here if needed
    setScanning(false);
    setScannedResult("Scanned early");
  };

  return (
    <div className="barcode-scan-wrapper">
      <h2 className="scanner-heading">Barcode Scanner</h2>

      <div className="scanner-box">
        {!scanning ? (
          <>
            <p className="scanner-instruction">Point camera at barcode</p>
            <div className="scanner-buttons">
              <button
                className="scanner-btn"
                onClick={() => handleScanStart(1)}
              >
                Scan Product 1
              </button>
              <button
                className="scanner-btn"
                onClick={() => handleScanStart(2)}
              >
                Scan Product 2
              </button>
            </div>
          </>
        ) : (
          <div className="scanner-camera-container">
            <p className="scanning-text">📷 Scanning...</p>
            <BarcodeScannerComponent
              width={250}
              height={150}
              onUpdate={(err, result) => {
                if (result) handleDetected(result.text);
              }}
            />
            <button
              className="close-btn"
              onClick={() => {
                setScanning(false);
                setScannedProductId(null); // ✅ clear product on cancel
              }}
            >
              ✖ Cancel
            </button>
          </div>
        )}
      </div>

      {!scanning && scannedProductId && (
        <div className="product-info">
          <h3>{products[scannedProductId].name}</h3>
          <p>
            <strong>Brand:</strong> {products[scannedProductId].brand}
          </p>
          <p>
            <strong>Price:</strong> ₹{products[scannedProductId].price}
          </p>
          <p>
            <strong>Category:</strong> {products[scannedProductId].category}
          </p>
          <p>
            <strong>Features:</strong> {products[scannedProductId].features}
          </p>
          <p>
            <strong>Tags:</strong> {products[scannedProductId].tags.join(", ")}
          </p>
        </div>
      )}


      {/* Feature Demo Section */}
<div className="feature-demo-context">
  <h3 className="demo-title">Smart Product Scanner</h3>
  <p className="demo-text">
    Scan any product barcode to instantly access:
  </p>
  <ul className="demo-features">
    <li><strong>Real-time pricing</strong> and promotions</li>
    <li><strong>Customer reviews</strong> and ratings</li>
    <li><strong>Detailed product info</strong> and alternatives</li>
  </ul>
  <p className="demo-note">
    Tip: Hold your phone steady about 6 inches from the barcode for best results.
  </p>
</div>

    </div>
  );
}
