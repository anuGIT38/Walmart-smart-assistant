import React, { useState, useEffect, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import Webcam from "react-webcam";

// Sample product database
const productDatabase = {
  123456: {
    name: "Organic Peanut Butter",
    price: "$4.99",
    rating: "★★★★☆ (142)",
    description: "Natural peanut butter with no additives",
    alternatives: ["Almond Butter", "Cashew Butter"],
    location: "Aisle 5, Section 3",
    image: "/images/peanut-butter.jpg",
  },
  789012: {
    name: "Whole Grain Bread",
    price: "$3.49",
    rating: "★★★★★ (89)",
    description: "100% whole wheat bread",
    alternatives: ["Multigrain Bread", "Sourdough"],
    location: "Aisle 2, Section 1",
    image: "/images/bread.jpg",
  },
};

const BarcodeScanner = () => {
  const webcamRef = useRef(null);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [manualBarcode, setManualBarcode] = useState("");

  // Handle barcode scanning
  useEffect(() => {
    if (isScanning && webcamRef.current) {
      const codeReader = new BrowserQRCodeReader();
      let scanInterval;

      const startScanning = async () => {
        try {
          scanInterval = setInterval(async () => {
            try {
              const result = await codeReader.decodeFromVideoElement(
                webcamRef.current.video
              );
              if (result) {
                handleScan(result.getText());
                setIsScanning(false);
              }
            } catch (scanError) {
              // Normal when no code is detected
            }
          }, 500);
        } catch (initError) {
          setError("Failed to access camera. Please check permissions.");
          setIsScanning(false);
        }
      };

      startScanning();

      return () => {
        clearInterval(scanInterval);
      };
    }
  }, [isScanning]);

  const handleScan = (barcode) => {
    if (productDatabase[barcode]) {
      setScannedProduct(productDatabase[barcode]);
      setError(null);
    } else {
      setError("Product not found in database");
      setScannedProduct(null);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleScan(manualBarcode.trim());
    }
  };

  const videoConstraints = {
    facingMode: "environment",
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };

  return (
    <div className="barcode-scanner-container">
      <h2 className="scanner-title">Product Scanner</h2>
      {/* Camera Scanner Section */}
      <div className="scanner-section">
        {!isScanning ? (
          <button className="scan-button" onClick={() => setIsScanning(true)}>
            Start Camera Scanner
          </button>
        ) : (
          <div className="camera-container">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="camera-view"
            />
            <div className="scanner-overlay" />
            <button
              className="stop-scan-button"
              onClick={() => setIsScanning(false)}
            >
              Stop Scanning
            </button>
          </div>
        )}
      </div>
      {/* Manual Entry Section */}
      <div className="manual-entry-section">
        <h3>Or Enter Barcode Manually</h3>
        <form onSubmit={handleManualSubmit} className="manual-form">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Enter barcode number"
            className="barcode-input"
          />
          <button type="submit" className="submit-button">
            Search
          </button>
        </form>
      </div>
      {/* Error Display */}
      {error && <div className="error-message">{error}</div>}
      {/* Product Display */}
      {scannedProduct && (
        <div className="product-display">
          <div className="product-header">
            {scannedProduct.image && (
              <img
                src={scannedProduct.image}
                alt={scannedProduct.name}
                className="product-image"
              />
            )}
            <div className="product-info">
              <h3 className="product-name">{scannedProduct.name}</h3>
              <p className="product-price">{scannedProduct.price}</p>
              <p className="product-rating">{scannedProduct.rating}</p>
            </div>
          </div>
          <p className="product-description">{scannedProduct.description}</p>
          <p className="product-location">📍 {scannedProduct.location}</p>

          {scannedProduct.alternatives && (
            <div className="alternatives-section">
              <h4>Similar Products:</h4>
              <ul className="alternatives-list">
                {scannedProduct.alternatives.map((alt, index) => (
                  <li key={index}>{alt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {/*BarcodeScanner example*/}
      <div className="feature-demo-context">
        <h3 className="demo-title">Smart Product Scanner</h3>
        <p className="demo-text">
          Scan any product barcode to instantly access:
        </p>
        <ul className="demo-features">
          <li>
            <strong>Real-time pricing</strong> and promotions
          </li>
          <li>
            <strong>Customer reviews</strong> and ratings
          </li>
          <li>
            <strong>Detailed product info</strong> and alternatives
          </li>
        </ul>
        <p className="demo-note">
          Tip: Hold your phone steady about 6 inches from the barcode for best
          results.
        </p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
