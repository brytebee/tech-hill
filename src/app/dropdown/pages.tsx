"use client";

import React, {SyntheticEvent, useState} from "react";

export default function ColorDropDown(){
  const [color, setColor] = useState("white")
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const newColor = e.target.value;
    setColor(newColor)
  }

  return (
    <div style={{
      backgroundColor: color,
      minHeight: "100vh",
      color: "black",
      fontSize: "1.3rem"
    }}>
      <label htmlFor="color-dropdown">Choose a background Color: </label>

      <select name="dropdown" id="color-dropdown" style={{backgroundColor: "gray", color: "black", borderRadius: "3px"}} onChange={handleSelect}>
        <option value="white">---Choose color---</option>
        <option value="red">Red</option>
        <option value="green">Green</option>
        <option value="blue">Blue</option>
      </select>
    </div>
  )
}