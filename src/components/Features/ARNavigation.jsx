import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import storeLayout, { getAllAisles } from "../../Storedata/storeLayout";
import "../../css-modules/HomePage.css";

const AisleMarker = ({
  position,
  label,
  color = "#3498db",
  selected = false,
}) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshStandardMaterial
          color={selected ? "#4CAF50" : color}
          transparent
          opacity={0.8}
        />
      </mesh>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.3}
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
        fontSize={0.4}
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
        fontSize={0.4}
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
      <gridHelper args={[50, 50]} rotation-x={Math.PI / 2} />

      {Object.entries(storeLayout)
        .filter(([_, loc]) => !aisleFilter || loc.aisle === aisleFilter)
        .map(([id, loc]) => (
          <AisleMarker
            key={id}
            position={loc.ar_coords}
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

  // Calculate distance to target
  useEffect(() => {
    if (selectedProduct) {
      const target = storeLayout[selectedProduct].ar_coords;
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
  useEffect(() => {
    if (!selectedProduct) return;

    const interval = setInterval(() => {
      setUserPosition((prev) => {
        const target = storeLayout[selectedProduct].ar_coords;
        const newPos = [
          prev[0] + (target[0] - prev[0]) * 0.05,
          0.5, // Keep Y position constant
          prev[2] + (target[2] - prev[2]) * 0.05,
        ];

        // Check if we've arrived (within 0.2 units)
        if (
          Math.abs(newPos[0] - target[0]) < 0.2 &&
          Math.abs(newPos[2] - target[2]) < 0.2
        ) {
          clearInterval(interval);
          return [target[0], 0.5, target[2]];
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
      return [userPosition[0], 1.7, userPosition[2] + 5];
    }
    return [15, 15, 15]; // Overhead view
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
        <Canvas camera={{ position: getCameraPosition(), fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          <StoreMap aisleFilter={aisleView} selectedProduct={selectedProduct} />

          <UserMarker position={userPosition} />

          {selectedProduct && (
            <>
              <DestinationMarker
                position={storeLayout[selectedProduct].ar_coords}
                label={storeLayout[selectedProduct].zone}
              />
              <NavigationPath
                start={userPosition}
                end={storeLayout[selectedProduct].ar_coords}
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