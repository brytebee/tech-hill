"use client";

import React, { useState } from 'react';

const mockedCityData = {
  "New York": {
    temperature: "22°C",
    humidity: "65%",
    windSpeed: "15 km/h"
  },
  "London": {
    temperature: "18°C", 
    humidity: "72%",
    windSpeed: "12 km/h"
  },
  "Tokyo": {
    temperature: "28°C",
    humidity: "58%", 
    windSpeed: "8 km/h"
  },
  "Paris": {
    temperature: "20°C",
    humidity: "68%",
    windSpeed: "10 km/h"
  }
};


export default function WeatherApp() {
  const [input, setInput] = useState("")
  const [cityData, setCityData] = useState(null)

  const handleInput = (e) => {
    e.preventDefault();
    setInput(e.target.value)
  }

  const handleSearch = () => {
    const searchedCity = mockedCityData[input]
    setCityData(searchedCity)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif'}}>
      <h2>Weather Search</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          id="city-input"
          name="city"
          placeholder="Enter city name"
          onChange={handleInput}
          style={{ 
            padding: '8px 12px',
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <button 
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
        {cityData ? <>
          <div>Temperature: {cityData["temperature"]} </div>
          <div>Humidity: {cityData["humidity"]} </div>
          <div>Wind Speed: {cityData["windSpeed"]} </div>
        </> :
          <div>City not found!</div>
        }
      </div>
    </div>
  );
}