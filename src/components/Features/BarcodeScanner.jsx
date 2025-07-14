import React, { useState, useEffect, useRef, useContext } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import Webcam from "react-webcam";
import ProductDetails from "./ProductDetails";
import { ThemeContext } from "../ThemeContext";

// Expanded product database
const productDatabase = {
  123456: {
    name: "Organic Peanut Butter",
    price: "$4.99",
    rating: 4.2,
    reviewCount: 142,
    reviews: [
      {
        user: "HealthyEater",
        rating: 5,
        comment: "Best peanut butter ever!",
        date: "2023-05-15",
      },
      {
        user: "MomOfTwo",
        rating: 4,
        comment: "My kids love it",
        date: "2023-04-22",
      },
    ],
    description: "Natural peanut butter with no additives",
    ingredients: ["Organic peanuts", "Sea salt"],
    nutrition: { calories: 190, fat: "16g", protein: "7g" },
    alternatives: [
      { name: "Almond Butter", ecoFriendly: true, price: "$6.49" },
      { name: "Cashew Butter", ecoFriendly: true, price: "$5.99" },
    ],
    location: "Aisle 5, Section 3",
    image: "/images/peanut-butter.jpg",
    discounts: ["Buy 2 jars, get 10% off"],
    sustainability: {
      palmOilFree: true,
      organic: true,
      packaging: "Recyclable glass jar",
    },
    warnings: [],
  },
  789012: {
    name: "Whole Grain Bread",
    price: "$3.49",
    rating: 4.8,
    reviewCount: 89,
    reviews: [
      {
        user: "BreadLover",
        rating: 5,
        comment: "Fresh and delicious",
        date: "2023-06-10",
      },
    ],
    description: "100% whole wheat bread",
    ingredients: ["Whole wheat flour", "Water", "Yeast", "Sugar", "Salt"],
    nutrition: { calories: 120, fat: "1g", protein: "5g" },
    alternatives: [
      { name: "Multigrain Bread", ecoFriendly: true, price: "$3.99" },
      { name: "Sourdough", ecoFriendly: true, price: "$4.25" },
    ],
    location: "Aisle 2, Section 1",
    image: "/images/bread.jpg",
    discounts: ["Buy 1 get 1 free on Wednesdays"],
    sustainability: {
      palmOilFree: true,
      organic: false,
      packaging: "Recyclable plastic bag",
    },
    warnings: [],
  },
  345678: {
    name: "Eco-Friendly Dish Soap",
    price: "$5.99",
    rating: 4.5,
    reviewCount: 203,
    reviews: [
      {
        user: "GreenHome",
        rating: 5,
        comment: "Cleans well and eco-friendly!",
        date: "2023-07-12",
      },
    ],
    description: "Plant-based dish soap with no harsh chemicals",
    ingredients: ["Plant-based surfactants", "Essential oils", "Water"],
    nutrition: null,
    alternatives: [
      { name: "Organic Dish Soap", ecoFriendly: true, price: "$6.49" },
      { name: "Regular Dish Soap", ecoFriendly: false, price: "$3.99" },
    ],
    location: "Aisle 7, Section 4",
    image: "/images/dish-soap.jpg",
    discounts: ["20% off with reusable bottle exchange"],
    sustainability: {
      palmOilFree: true,
      organic: true,
      packaging: "Biodegradable bottle",
    },
    warnings: [],
  },
};

const BarcodeScanner = () => {
  const webcamRef = useRef(null);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const { theme } = useContext(ThemeContext);

  const analyzeIngredients = (ingredients) => {
    const harmfulIngredients = [
      "high fructose corn syrup",
      "partially hydrogenated oils",
      "aspartame",
      "sodium laureth sulfate",
      "parabens",
    ];

    return ingredients.filter((ingredient) =>
      harmfulIngredients.includes(ingredient.toLowerCase())
    );
  };

  const handleScan = (barcode) => {
    if (productDatabase[barcode]) {
      const product = {
        ...productDatabase[barcode],
        warnings: productDatabase[barcode].ingredients
          ? analyzeIngredients(productDatabase[barcode].ingredients)
          : [],
      };
      setScannedProduct(product);
      setError(null);
    } else {
      setError("Product not found in database");
      setScannedProduct(null);
    }
  };

  useEffect(() => {
    let timeoutId;

    if (isScanning && webcamRef.current) {
      // Simulate scanning delay and pick a random product
      timeoutId = setTimeout(() => {
        const barcodes = Object.keys(productDatabase);
        const randomBarcode =
          barcodes[Math.floor(Math.random() * barcodes.length)];
        handleScan(randomBarcode);
        setIsScanning(false);
      }, 2500); // 2.5 seconds simulated scan
    }

    return () => clearTimeout(timeoutId);
  }, [isScanning]);

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
    <div className="barcode-scanner-container ${theme}">
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
            {isScanning && !scannedProduct && (
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <p> Scanning for product...</p>
                <div className="loader" />
              </div>
            )}

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
      {scannedProduct && <ProductDetails product={scannedProduct} />}

      {/* Feature Demo Context */}
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
          <li>
            <strong>Sustainability analysis</strong> and eco-friendly options
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
