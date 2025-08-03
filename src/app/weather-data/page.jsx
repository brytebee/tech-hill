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
  const [input, setInput] = useState("");
  const [cityData, setCityData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [notFoundCities, setNotFoundCities] = useState([]);
  const [currentCity, setCurrentCity] = useState("");

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const handleSearch = () => {
    // Validate input
    if (!input.trim()) {
      return;
    }

    const trimmedInput = input.trim();
    setHasSearched(true);
    setCurrentCity(trimmedInput);

    // Case-insensitive search
    const foundCity = Object.keys(mockedCityData).find(
      city => city.toLowerCase() === trimmedInput.toLowerCase()
    );

    if (foundCity) {
      setCityData(mockedCityData[foundCity]);
    } else {
      setCityData(null);
      // Track cities that weren't found (avoid duplicates)
      setNotFoundCities(prev => 
        prev.includes(trimmedInput) ? prev : [...prev, trimmedInput]
      );
    }

    // Clear input after search
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setCityData(null);
    setHasSearched(false);
    setCurrentCity("");
    setInput("");
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '500px' }}>
      <h2>Weather Search</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          id="city-input"
          name="city"
          placeholder="Enter city name"
          value={input}
          onChange={handleInput}
          onKeyPress={handleKeyPress}
          style={{ 
            padding: '8px 12px',
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '200px'
          }}
        />
        <button 
          onClick={handleSearch}
          disabled={!input.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: input.trim() ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            marginRight: '10px'
          }}
        >
          Search
        </button>
        {hasSearched && (
          <button 
            onClick={handleClear}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Weather Display */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
        {hasSearched ? (
          cityData ? (
            <>
              <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>
                Weather for {currentCity}
              </h3>
              <div style={{ lineHeight: '1.6' }}>
                <div><strong>Temperature:</strong> {cityData.temperature}</div>
                <div><strong>Humidity:</strong> {cityData.humidity}</div>
                <div><strong>Wind Speed:</strong> {cityData.windSpeed}</div>
              </div>
            </>
          ) : (
            <div style={{ color: '#dc3545', fontWeight: 'bold' }}>
              City not found: "{currentCity}"
            </div>
          )
        ) : (
          <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
            Enter a city name and click Search to view weather data
          </div>
        )}
      </div>

      {/* Available Cities */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Available Cities:</h4>
        <div style={{ fontSize: '14px', color: '#6c757d' }}>
          {Object.keys(mockedCityData).join(', ')}
        </div>
      </div>

      {/* Cities Not Found */}
      {notFoundCities.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 10px 0', color: '#dc3545' }}>
            Cities Not Found ({notFoundCities.length}):
          </h4>
          <div style={{ fontSize: '14px', color: '#dc3545' }}>
            {notFoundCities.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}