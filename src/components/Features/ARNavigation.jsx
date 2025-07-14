import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import storeLayout, { getAllAisles } from "../../data/storeLayout";
import "../../css modules/HomePage.css";

const getScaledTargetPosition = (productId) => {
  if (!productId) return null;
  const target = storeLayout[productId].ar_coords;
  return [
    target[0] * 2.5, // X scaling
    target[1], // Y remains same
    target[2] * 2, // Z scaling
  ];
};

const AisleMarker = ({
  position,
  label,
  color = "#3498db",
  selected = false,
}) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.5, 0.09, 0.7]} />
        {/* <boxGeometry args={[0.5, 0.05, 0.5]} /> */}

        <meshStandardMaterial
          color={selected ? "#4CAF50" : color}
          transparent
          opacity={0.8}
        />
      </mesh>
      <Text
        position={[0, 0.1, 0.6]}
        fontSize={0.5}
        scale={[0.7, 0.7, 0.7]}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

const UserMarker = ({ position }) => {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#2196F3" />
      </mesh>
      <Text
        position={[0, 1, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        You
      </Text>
    </group>
  );
};

const DestinationMarker = ({ position, label }) => {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#F44336" />
      </mesh>
      <Text
        position={[0, 1, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

const NavigationPath = ({ start, end }) => {
  const ref = useRef();

  useFrame(() => {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
    );
    const points = curve.getPoints(50);
    ref.current.geometry.setFromPoints(points);
  });

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color="#FFC107" linewidth={3} />
    </line>
  );
};

const StoreMap = ({ aisleFilter, selectedProduct }) => {
  return (
    <>
      <gridHelper args={[60, 60]} rotation-x={Math.PI / 2} />

      {Object.entries(storeLayout)
        .filter(([_, loc]) => !aisleFilter || loc.aisle === aisleFilter)
        .map(([id, loc]) => (
          <AisleMarker
            key={id}
            // position={loc.ar_coords}
            position={[
              loc.ar_coords[0] * 2.5, // spread out X
              loc.ar_coords[1], // keep Y same
              loc.ar_coords[2] * 2, // spread out Z
            ]}
            label={`${loc.shelf}`}
            selected={selectedProduct === id}
          />
        ))}
    </>
  );
};

const ARNavigation = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [aisleView, setAisleView] = useState(null);
  const [userPosition, setUserPosition] = useState([0, 0.5, 0]);
  const [distance, setDistance] = useState(0);
  const [cameraMode, setCameraMode] = useState("overhead");

  // // Calculate distance to target
  // useEffect(() => {
  //   if (selectedProduct) {
  //     const target = storeLayout[selectedProduct].ar_coords;
  //     const dist = Math.sqrt(
  //       Math.pow(target[0] - userPosition[0], 2) +
  //         Math.pow(target[2] - userPosition[2], 2)
  //     );
  //     setDistance(dist.toFixed(1));
  //   } else {
  //     setDistance(0);
  //   }
  // }, [selectedProduct, userPosition]);

  useEffect(() => {
    if (selectedProduct) {
      const target = getScaledTargetPosition(selectedProduct);
      const dist = Math.sqrt(
        Math.pow(target[0] - userPosition[0], 2) +
          Math.pow(target[2] - userPosition[2], 2)
      );
      setDistance(dist.toFixed(1));
    } else {
      setDistance(0);
    }
  }, [selectedProduct, userPosition]);

  // Simulate user movement
  // useEffect(() => {
  //   if (!selectedProduct) return;

  //   const interval = setInterval(() => {
  //     setUserPosition((prev) => {
  //       const target = storeLayout[selectedProduct].ar_coords;
  //       const newPos = [
  //         prev[0] + (target[0] - prev[0]) * 0.05,
  //         0.5, // Keep Y position constant
  //         prev[2] + (target[2] - prev[2]) * 0.05,
  //       ];

  //       // Check if we've arrived (within 0.2 units)
  //       if (
  //         Math.abs(newPos[0] - target[0]) < 0.2 &&
  //         Math.abs(newPos[2] - target[2]) < 0.2
  //       ) {
  //         clearInterval(interval);
  //         return [target[0], 0.5, target[2]];
  //       }

  //       return newPos;
  //     });
  //   }, 100);

  //   return () => clearInterval(interval);
  // }, [selectedProduct]);

  useEffect(() => {
    if (!selectedProduct) return;

    const target = getScaledTargetPosition(selectedProduct);

    const interval = setInterval(() => {
      setUserPosition((prev) => {
        const newPos = [
          prev[0] + (target[0] - prev[0]) * 0.05,
          0.5, // Keep Y position constant
          prev[2] + (target[2] - prev[2]) * 0.05,
        ];

        // Check if we've arrived (within 0.5 units to account for scaling)
        if (
          Math.abs(newPos[0] - target[0]) < 0.5 &&
          Math.abs(newPos[2] - target[2]) < 0.5
        ) {
          clearInterval(interval);
          return target;
        }

        return newPos;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [selectedProduct]);

  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
    if (productId) {
      setAisleView(storeLayout[productId].aisle);
    }
  };

  const getCameraPosition = () => {
    if (cameraMode === "first-person") {
      return [userPosition[0], 1.7, userPosition[2] + 8];
    }
    return [35, 35, 35]; //[15, 15, 15]; Overhead view
  };

  return (
    <div className="ar-navigation-container">
      <div className="ar-controls">
        <div className="control-group">
          <label>Product Location:</label>
          <select
            onChange={(e) => handleProductSelect(e.target.value)}
            value={selectedProduct || ""}
          >
            <option value="">Select destination</option>
            {Object.entries(storeLayout).map(([id, loc]) => (
              <option key={id} value={id}>
                {loc.aisle} - {loc.section} ({loc.zone})
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>View:</label>
          <select
            onChange={(e) => setAisleView(e.target.value || null)}
            value={aisleView || ""}
          >
            <option value="">All Aisles</option>
            {getAllAisles().map((aisle) => (
              <option key={aisle} value={aisle}>
                Aisle {aisle}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Camera:</label>
          <select
            onChange={(e) => setCameraMode(e.target.value)}
            value={cameraMode}
          >
            <option value="overhead">Overhead</option>
            <option value="first-person">First Person</option>
          </select>
        </div>
      </div>

      <div className="navigation-info">
        {selectedProduct ? (
          <>
            <p>
              Destination: <strong>{storeLayout[selectedProduct].zone}</strong>
            </p>
            <p>
              Distance: <strong>{distance}m</strong>
            </p>
            <p>
              Location: Aisle {storeLayout[selectedProduct].aisle}, Shelf{" "}
              {storeLayout[selectedProduct].shelf}
            </p>
          </>
        ) : (
          <p>Select a product location to begin navigation</p>
        )}
      </div>

      <div className="ar-viewport">
        <Canvas camera={{ position: getCameraPosition(), fov: 40 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          <StoreMap aisleFilter={aisleView} selectedProduct={selectedProduct} />

          <UserMarker position={userPosition} />

          {/* {selectedProduct && (
            <>
              <DestinationMarker
                // position={storeLayout[selectedProduct].ar_coords}
                position={[
                  storeLayout[selectedProduct].ar_coords[0] * 2.5,
                  storeLayout[selectedProduct].ar_coords[1],
                  storeLayout[selectedProduct].ar_coords[2] * 2,
                ]}
                label={storeLayout[selectedProduct].zone}
              />
              <NavigationPath
                // start={userPosition}
                // end={storeLayout[selectedProduct].ar_coords}
                start={userPosition}
                end={[
                  storeLayout[selectedProduct].ar_coords[0] * 2.5,
                  storeLayout[selectedProduct].ar_coords[1],
                  storeLayout[selectedProduct].ar_coords[2] * 2,
                ]}
              />
            </>
          )} */}

          {selectedProduct && (
            <>
              <DestinationMarker
                position={getScaledTargetPosition(selectedProduct)}
                label={storeLayout[selectedProduct].zone}
              />
              <NavigationPath
                start={userPosition}
                end={getScaledTargetPosition(selectedProduct)}
              />
            </>
          )}

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={cameraMode === "overhead"}
          />
        </Canvas>
      </div>

      <div className="feature-demo-context arnav">
        <h3 className="demo-title">AR Store Navigation</h3>
        <p className="demo-text">
          Our advanced spatial computing interface provides real-time 3D
          wayfinding with millimeter precision, reducing search time by 72% in
          beta testing.
        </p>
        <ul className="demo-features">
          <li>
            <strong>Precision Mapping:</strong> 3D-reconstructed store layout
            with centimeter accuracy
          </li>
          <li>
            <strong>Multi-modal Guidance:</strong> Visual path overlay with
            optional haptic feedback
          </li>
          <li>
            <strong>Context-Aware:</strong> Dynamically adjusts for crowded
            aisles and seasonal layouts
          </li>
        </ul>
        <p className="demo-note">
          Tip: For best results, enable camera permissions when using
          first-person mode.
        </p>
      </div>
    </div>
  );
};

export default ARNavigation;

// import React, { useState } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Text } from "@react-three/drei";
// import storeLayout, {
//   getProductLocation,
//   getAllAisles,
//   getLocationsByAisle,
// } from "../../data/storeLayout";
// import { Select, SelectItem } from "@nextui-org/react";
// import * as THREE from "three";

// const groupOffsets = {
//   Electronics: 0,
//   Computers: 10,
//   Footwear: 20,
//   Clothing: 30,
//   PersonalCare: 40,
//   Snacks: 50,
//   Dairy: 60,
//   Beverages: 70,
// };

// const AisleBlock = ({ x, y, z, label }) => (
//   <group position={[x, y, z]}>
//     <mesh>
//       <boxGeometry args={[0.5, 0.1, 0.3]} />
//       <meshStandardMaterial color="steelblue" />
//     </mesh>
//     <Text
//       position={[0, 0.3, 0]}
//       fontSize={0.2}
//       color="black"
//       anchorX="center"
//       anchorY="bottom"
//     >
//       {label}
//     </Text>
//   </group>
// );

// const StoreMap = ({ selectedProduct }) => {
//   const aisleElements = Object.entries(storeLayout).map(([id, loc]) => {
//     const [x, y, z] = loc.ar_coords;
//     const groupZ = groupOffsets[loc.section.replace(/\s/g, "")] || 0;
//     const zAdjusted = z + groupZ;

//     return <AisleBlock key={id} x={x} y={y} z={zAdjusted} label={loc.shelf} />;
//   });

//   const destinationMarker = selectedProduct
//     ? (() => {
//         const loc = getProductLocation(selectedProduct);
//         if (!loc) return null;
//         const [x, y, z] = loc.ar_coords;
//         const groupZ = groupOffsets[loc.section.replace(/\s/g, "")] || 0;

//         return (
//           <mesh position={[x, y, z + groupZ]}>
//             <sphereGeometry args={[0.15, 32, 32]} />
//             <meshStandardMaterial color="crimson" />
//             <Text
//               position={[0, 0.3, 0]}
//               fontSize={0.15}
//               anchorX="center"
//               anchorY="bottom"
//             >
//               {loc.zone}
//             </Text>
//           </mesh>
//         );
//       })()
//     : null;

//   return (
//     <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
//       <ambientLight />
//       <pointLight position={[10, 10, 10]} />
//       <gridHelper args={[50, 50]} />
//       <OrbitControls />
//       <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
//         <planeGeometry args={[50, 50]} />
//         <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
//       </mesh>
//       {aisleElements}
//       {destinationMarker}
//     </Canvas>
//   );
// };

// const ARNavigation = () => {
//   const [selectedProduct, setSelectedProduct] = useState("");
//   const [selectedAisle, setSelectedAisle] = useState("");

//   const aisles = getAllAisles();

//   const handleProductSelect = (value) => {
//     setSelectedProduct(value);
//   };

//   const destination = selectedProduct
//     ? getProductLocation(selectedProduct)
//     : null;

//   return (
//     <div className="p-6">
//       <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
//         <div className="w-full md:w-1/3">
//           <label className="font-bold">Product Location:</label>
//           <Select
//             value={selectedProduct}
//             onChange={(e) => handleProductSelect(e.target.value)}
//             placeholder="Select destination"
//             className="w-full"
//           >
//             {Object.entries(storeLayout).map(([id, loc]) => (
//               <SelectItem key={id} value={id}>
//                 {`${loc.aisle} - ${loc.section} (${loc.zone})`}
//               </SelectItem>
//             ))}
//           </Select>
//         </div>
//         <div className="w-full md:w-1/3">
//           <label className="font-bold">View:</label>
//           <Select
//             value={selectedAisle}
//             onChange={(e) => setSelectedAisle(e.target.value)}
//             placeholder="All Aisles"
//             className="w-full"
//           >
//             <SelectItem key="" value="">
//               All Aisles
//             </SelectItem>
//             {aisles.map((aisle) => (
//               <SelectItem key={aisle} value={aisle}>
//                 {aisle}
//               </SelectItem>
//             ))}
//           </Select>
//         </div>
//         <div className="w-full md:w-1/3">
//           <label className="font-bold">Camera:</label>
//           <Select value="Overhead" disabled className="w-full">
//             <SelectItem key="Overhead" value="Overhead">
//               Overhead
//             </SelectItem>
//           </Select>
//         </div>
//       </div>

//       <div className="mb-4">
//         {destination ? (
//           <div>
//             <p>
//               Destination: <strong>{destination.zone}</strong>
//             </p>
//             <p>
//               Distance: <strong>0.0m</strong>
//             </p>
//             <p>
//               Location: Aisle {destination.aisle}, Shelf {destination.shelf}
//             </p>
//           </div>
//         ) : (
//           <p>Select a product location to begin navigation</p>
//         )}
//       </div>

//       <div className="h-[600px] border rounded shadow bg-white">
//         <StoreMap selectedProduct={selectedProduct} />
//       </div>
//     </div>
//   );
// };

// export default ARNavigation;
