"use client";

import React, { useState } from "react";

// TypeScript interfaces for better type safety
interface ColorOption {
  value: string;
  label: string;
  textColor?: string; // For optimal contrast
}

interface ColorDropdownProps {
  initialColor?: string;
  onColorChange?: (color: string) => void;
}

export default function ColorDropdown({ 
  initialColor = "", 
  onColorChange 
}: ColorDropdownProps = {}) {
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);

  // Color options with optimal text colors for contrast
  const colorOptions: ColorOption[] = [
    { value: "", label: "---Choose a color---", textColor: "#333" },
    { value: "white", label: "White", textColor: "#333" },
    { value: "red", label: "Red", textColor: "#fff" },
    { value: "green", label: "Green", textColor: "#fff" },
    { value: "blue", label: "Blue", textColor: "#fff" },
    { value: "yellow", label: "Yellow", textColor: "#333" },
    { value: "purple", label: "Purple", textColor: "#fff" },
    { value: "orange", label: "Orange", textColor: "#fff" },
    { value: "pink", label: "Pink", textColor: "#333" },
    { value: "gray", label: "Gray", textColor: "#fff" },
  ];

  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
    
    // Call optional callback
    onColorChange?.(newColor);
  };

  // Get current color option for styling
  const currentColorOption = colorOptions.find(option => option.value === selectedColor);
  const backgroundColor = selectedColor || "#f8f9fa";
  const textColor = currentColorOption?.textColor || "#333";

  return (
    <div 
      style={{
        backgroundColor: backgroundColor,
        minHeight: "100vh",
        color: textColor,
        padding: "2rem",
        transition: "all 0.3s ease-in-out",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1.5rem", color: textColor }}>
          Color Background Selector
        </h2>
        
        <div style={{ marginBottom: "2rem" }}>
          <label 
            htmlFor="color-dropdown" 
            style={{ 
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "1.1rem",
              fontWeight: "600",
              color: textColor
            }}
          >
            Choose a background color:
          </label>
          
          <select 
            name="color-dropdown" 
            id="color-dropdown"
            value={selectedColor}
            onChange={handleColorChange}
            style={{
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              border: "2px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "#fff",
              color: "#333",
              cursor: "pointer",
              minWidth: "200px",
              outline: "none",
              transition: "border-color 0.2s ease-in-out"
            }}
            onFocus={(e) => e.target.style.borderColor = "#007bff"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          >
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Current selection display */}
        {selectedColor && (
          <div style={{
            padding: "1rem",
            border: `2px solid ${textColor}`,
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            color: "#333",
            marginBottom: "2rem"
          }}>
            <strong>Current Selection:</strong> {currentColorOption?.label}
            <br />
            <strong>Background Color:</strong> {selectedColor}
            <br />
            <strong>Text Color:</strong> {textColor}
          </div>
        )}

        {/* Sample content to show text contrast */}
        <div style={{ lineHeight: "1.6" }}>
          <h3 style={{ color: textColor, marginBottom: "1rem" }}>
            Sample Content
          </h3>
          <p style={{ color: textColor, marginBottom: "1rem" }}>
            This is sample text to demonstrate how the text color automatically 
            adjusts for optimal contrast against different background colors.
          </p>
          <p style={{ color: textColor }}>
            The component ensures accessibility by choosing appropriate text colors 
            that maintain readability across all background options.
          </p>
        </div>
      </div>
    </div>
  );
}

// Example usage component
export function ColorDropdownExample() {
  const handleColorChange = (color: string): void => {
    console.log(`Background color changed to: ${color}`);
  };

  return (
    <div>
      <ColorDropdown 
        initialColor="blue"
        onColorChange={handleColorChange}
      />
    </div>
  );
}