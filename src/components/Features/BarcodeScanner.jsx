import React, { useState } from "react";

const productDatabase = {
  123456: {
    name: "Organic Peanut Butter",
    price: "$4.99",
    rating: "★★★★☆ (142)",
    description: "Natural peanut butter with no additives",
    alternatives: ["Almond Butter", "Cashew Butter"],
  },
  789012: {
    name: "Whole Grain Bread",
    price: "$3.49",
    rating: "★★★★★ (89)",
    description: "100% whole wheat bread",
    alternatives: ["Multigrain Bread", "Sourdough"],
  },
};

const BarcodeScanner = () => {
  const [scannedProduct, setScannedProduct] = useState(null);

  const handleScan = (barcode) => {
    setScannedProduct(productDatabase[barcode] || null);
  };

  return (
    <div className="feature-content">
      <h3>Barcode Scanner</h3>
      <div className="scanner-mock">
        <div className="scanner-view">
          <p>Point camera at barcode</p>
          <div className="scanner-buttons">
            <button onClick={() => handleScan("123456")}>Scan Product 1</button>
            <button onClick={() => handleScan("789012")}>Scan Product 2</button>
          </div>
        </div>
        {scannedProduct && (
          <div className="product-details">
            <h4>{scannedProduct.name}</h4>
            <p>Price: {scannedProduct.price}</p>
            <p>Rating: {scannedProduct.rating}</p>
            <p>{scannedProduct.description}</p>
            {scannedProduct.alternatives && (
              <div className="alternatives">
                <p>Try also: {scannedProduct.alternatives.join(", ")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
