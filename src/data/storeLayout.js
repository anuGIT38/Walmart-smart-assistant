const storeLayout = {
  // Electronics - Right side (positive X)
  1: {
    aisle: "A12",
    section: "Electronics",
    shelf: "E3",
    ar_coords: [10.0, 2.1, 4.0],
    zone: "Mobile Phones",
  },
  2: {
    aisle: "A12",
    section: "Electronics",
    shelf: "E2",
    ar_coords: [10.0, 1.6, 4.0],
    zone: "Mobile Phones",
  },
  3: {
    aisle: "A12",
    section: "Electronics",
    shelf: "E1",
    ar_coords: [10.0, 1.1, 4.0],
    zone: "Mobile Phones",
  },
  4: {
    aisle: "A12",
    section: "Electronics",
    shelf: "E4",
    ar_coords: [10.0, 2.6, 4.0],
    zone: "Mobile Phones",
  },

  // Computers - Left side (negative X)
  5: {
    aisle: "B7",
    section: "Computers",
    shelf: "C2",
    ar_coords: [-7.0, 1.5, 4.0],
    zone: "Laptops",
  },
  6: {
    aisle: "B7",
    section: "Computers",
    shelf: "C1",
    ar_coords: [-7.0, 1.0, 4.0],
    zone: "Laptops",
  },
  7: {
    aisle: "B7",
    section: "Computers",
    shelf: "C3",
    ar_coords: [-7.0, 2.0, 4.0],
    zone: "Laptops",
  },

  // Footwear - Right side, further back (higher Z)
  8: {
    aisle: "C4",
    section: "Footwear",
    shelf: "F2",
    ar_coords: [4.0, 1.5, 8.0],
    zone: "Sports Shoes",
  },
  9: {
    aisle: "C4",
    section: "Footwear",
    shelf: "F3",
    ar_coords: [4.0, 2.0, 8.0],
    zone: "Sports Shoes",
  },

  // Clothing - Left side
  10: {
    aisle: "D2",
    section: "Clothing",
    shelf: "J1",
    ar_coords: [-2.0, 0.9, 3.0],
    zone: "Men's Jeans",
  },
  11: {
    aisle: "D2",
    section: "Clothing",
    shelf: "J2",
    ar_coords: [-2.0, 1.4, 3.0],
    zone: "Men's Jeans",
  },
  12: {
    aisle: "D2",
    section: "Clothing",
    shelf: "J3",
    ar_coords: [-2.0, 1.9, 3.0],
    zone: "Men's Jeans",
  },
  13: {
    aisle: "D2",
    section: "Clothing",
    shelf: "J4",
    ar_coords: [-2.0, 2.4, 3.0],
    zone: "Men's Jeans",
  },

  // Personal Care - Right side
  14: {
    aisle: "E5",
    section: "Personal Care",
    shelf: "H3",
    ar_coords: [5.0, 1.8, 5.0],
    zone: "Hair Care",
  },
  15: {
    aisle: "E5",
    section: "Personal Care",
    shelf: "H4",
    ar_coords: [5.0, 2.3, 5.0],
    zone: "Hair Care",
  },
  16: {
    aisle: "E5",
    section: "Personal Care",
    shelf: "H2",
    ar_coords: [5.0, 1.3, 5.0],
    zone: "Hair Care",
  },
  17: {
    aisle: "E5",
    section: "Personal Care",
    shelf: "H1",
    ar_coords: [5.0, 0.8, 5.0],
    zone: "Hair Care",
  },
  18: {
    aisle: "E5",
    section: "Personal Care",
    shelf: "H5",
    ar_coords: [5.0, 2.8, 5.0],
    zone: "Hair Care",
  },

  // Snacks - Left side
  19: {
    aisle: "F3",
    section: "Snacks",
    shelf: "S2",
    ar_coords: [-3.0, 1.5, 6.0],
    zone: "Chips & Crisps",
  },
  20: {
    aisle: "F3",
    section: "Snacks",
    shelf: "S1",
    ar_coords: [-3.0, 1.0, 6.0],
    zone: "Chips & Crisps",
  },
  21: {
    aisle: "F3",
    section: "Snacks",
    shelf: "S3",
    ar_coords: [-3.0, 2.0, 6.0],
    zone: "Chips & Crisps",
  },
  22: {
    aisle: "F3",
    section: "Snacks",
    shelf: "S4",
    ar_coords: [-3.0, 2.5, 6.0],
    zone: "Chips & Crisps",
  },

  // Dairy - Center right
  23: {
    aisle: "G1",
    section: "Dairy",
    shelf: "D2",
    ar_coords: [1.5, 1.5, 4.0],
    zone: "Milk & Cream",
  },
  24: {
    aisle: "G1",
    section: "Dairy",
    shelf: "D1",
    ar_coords: [1.5, 1.0, 4.0],
    zone: "Milk & Cream",
  },
  25: {
    aisle: "G1",
    section: "Dairy",
    shelf: "D3",
    ar_coords: [1.5, 2.0, 4.0],
    zone: "Milk & Cream",
  },

  // Beverages - Left side
  26: {
    aisle: "I2",
    section: "Beverages",
    shelf: "V2",
    ar_coords: [-8.0, 1.5, 2.0],
    zone: "Juices",
  },
  27: {
    aisle: "I2",
    section: "Beverages",
    shelf: "V2",
    ar_coords: [-8.0, 2.0, 2.0],
    zone: "Juices",
  },

  // Tea & Coffee - Right side
  28: {
    aisle: "K4",
    section: "Beverages",
    shelf: "T4",
    ar_coords: [9.0, 2.1, 7.0],
    zone: "Tea & Coffee",
  },
  29: {
    aisle: "K4",
    section: "Beverages",
    shelf: "T5",
    ar_coords: [9.0, 2.6, 7.0],
    zone: "Tea & Coffee",
  },
  30: {
    aisle: "K4",
    section: "Beverages",
    shelf: "C1",
    ar_coords: [9.0, 1.1, 7.0],
    zone: "Tea & Coffee",
  },
  31: {
    aisle: "K4",
    section: "Beverages",
    shelf: "C2",
    ar_coords: [9.0, 1.6, 7.0],
    zone: "Tea & Coffee",
  },
};

// Helper functions
export const getProductLocation = (productId) => {
  return storeLayout[productId] || null;
};

export const getAllAisles = () => {
  return Object.values(storeLayout).reduce((acc, location) => {
    if (!acc.includes(location.aisle)) {
      acc.push(location.aisle);
    }
    return acc;
  }, []);
};

export const getLocationsByAisle = (aisle) => {
  return Object.values(storeLayout).filter((loc) => loc.aisle === aisle);
};

export default storeLayout;
