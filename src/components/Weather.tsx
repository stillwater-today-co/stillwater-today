import React, { useState } from 'react'

const Weather: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate API call to NWS
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  return (
    <section className="weather-section">
      <div className="weather-header">
        <h2>Current Weather</h2>
        <button 
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="weather-content">
        {isLoading ? (
          <div className="loading-placeholder">
            <div className="loading-spinner"></div>
            <p>Fetching weather data...</p>
          </div>
        ) : (
          <div className="weather-placeholder">
            <div className="weather-main">
              <div className="weather-icon">🌤️</div>
              <div className="weather-temp">72°F</div>
              <div className="weather-condition">Partly Cloudy</div>
            </div>
            
            <div className="weather-details">
              <div className="weather-detail">
                <span className="detail-label">Feels Like</span>
                <span className="detail-value">75°F</span>
              </div>
              <div className="weather-detail">
                <span className="detail-label">Humidity</span>
                <span className="detail-value">65%</span>
              </div>
              <div className="weather-detail">
                <span className="detail-label">Wind</span>
                <span className="detail-value">8 mph NW</span>
              </div>
              <div className="weather-detail">
                <span className="detail-label">Visibility</span>
                <span className="detail-value">10 mi</span>
              </div>
            </div>

            <div className="weather-forecast">
              <h3>5-Day Forecast</h3>
              <div className="forecast-grid">
                <div className="forecast-day">
                  <div className="forecast-date">Today</div>
                  <div className="forecast-icon">🌤️</div>
                  <div className="forecast-temps">72° / 58°</div>
                </div>
                <div className="forecast-day">
                  <div className="forecast-date">Tomorrow</div>
                  <div className="forecast-icon">☀️</div>
                  <div className="forecast-temps">78° / 62°</div>
                </div>
                <div className="forecast-day">
                  <div className="forecast-date">Wed</div>
                  <div className="forecast-icon">⛅</div>
                  <div className="forecast-temps">75° / 60°</div>
                </div>
                <div className="forecast-day">
                  <div className="forecast-date">Thu</div>
                  <div className="forecast-icon">🌧️</div>
                  <div className="forecast-temps">68° / 55°</div>
                </div>
                <div className="forecast-day">
                  <div className="forecast-date">Fri</div>
                  <div className="forecast-icon">☀️</div>
                  <div className="forecast-temps">80° / 65°</div>
                </div>
              </div>
            </div>

            <div className="weather-note">
              <p>
                Weather data provided by the National Weather Service. 
                This will be connected to the NWS API for real-time Stillwater weather updates.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Weather
