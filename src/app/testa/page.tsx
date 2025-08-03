"use client";

// import React, {ReactNode, useState} from "react";

// export default function TsToggle(): ReactNode {
//   const [toggle, setToggle] = useState<Boolean>(false);

//   const handleToggle = () => {
//     setToggle((pre: Boolean) => !pre)
//   }

//   return (
//     <div
//       style={{
//         display: "flex",
//         padding: "1rem",
//         fontFamily: "Ariel, sans-serif"
//       }}
//     >
//       <button 
//         style={{
//           fontSize: "1.5rem",
//           border: "1px solid #ccc",
//           borderRadius: "5px",
//           padding: "0.5rem 1rem",
//           minWidth: "5.5rem",
//           color: "#fff",
//           backgroundColor: toggle ? "green": "grey",
//           cursor: "pointer",
//         }}
//         arial-label={`toggle-${toggle ? "OFF" : "ON"}`}
//         onClick={handleToggle}
//         >{toggle ? "ON": "OFF"}
//       </button>
//     </div>
//   )
// }

import React, { useState } from "react";

// TypeScript interfaces for better type safety
interface ToggleProps {
  initialState?: boolean;
  onToggle?: (isOn: boolean) => void;
  labels?: {
    on: string;
    off: string;
  };
  colors?: {
    on: string;
    off: string;
  };
  disabled?: boolean;
}

// Main component with proper TypeScript typing
export default function TsToggle({
  initialState = false,
  onToggle,
  labels = { on: "ON", off: "OFF" },
  colors = { on: "#22c55e", off: "#6b7280" },
  disabled = false
}: ToggleProps) {
  const [isOn, setIsOn] = useState<boolean>(initialState);

  const handleToggle = (): void => {
    const newState = !isOn;
    setIsOn(newState);
    
    // Call optional callback with new state
    onToggle?.(newState);
  };

  // Type-safe style object
  const buttonStyle: React.CSSProperties = {
    fontSize: "1.2rem",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    padding: "0.75rem 1.5rem",
    minWidth: "100px",
    color: "#fff",
    backgroundColor: disabled 
      ? "#d1d5db" 
      : isOn 
        ? colors.on 
        : colors.off,
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease-in-out",
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <button
        style={buttonStyle}
        aria-label={`Toggle button, currently ${isOn ? labels.on : labels.off}`}
        aria-pressed={isOn}
        onClick={handleToggle}
        disabled={disabled}
        type="button"
      >
        {isOn ? labels.on : labels.off}
      </button>
      
      {/* Optional status indicator */}
      <span style={{ 
        fontSize: "1rem", 
        color: "#6b7280",
        fontWeight: "500" 
      }}>
        Status: <strong style={{ color: isOn ? colors.on : colors.off }}>
          {isOn ? labels.on : labels.off}
        </strong>
      </span>
    </div>
  );
}

// Example usage with TypeScript
export function ToggleExample() {
  const handleToggleChange = (isOn: boolean): void => {
    console.log(`Toggle is now: ${isOn ? 'ON' : 'OFF'}`);
  };

  return (
    <div>
      <h3>Basic Toggle</h3>
      <TsToggle />
      
      <h3>Custom Toggle with Callback</h3>
      <TsToggle
        initialState={true}
        onToggle={handleToggleChange}
        labels={{ on: "ACTIVE", off: "INACTIVE" }}
        colors={{ on: "#3b82f6", off: "#ef4444" }}
      />
      
      <h3>Disabled Toggle</h3>
      <TsToggle disabled={true} />
    </div>
  );
}