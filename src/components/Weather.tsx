import React, { useState, useEffect } from 'react'
import { fetchWeatherData, getCachedWeather, hasCachedWeather } from '../services/weatherService'

interface WeatherData {
  current: {
    temperature: string
    condition: string
    icon: string
    feelsLike: string
    humidity: string
    wind: string
    visibility: string
  }
  forecast: Array<{
    date: string
    icon: string
    high: string
    low: string
  }>
}

const Weather: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)

  // Load weather data on component mount
  useEffect(() => {
    loadWeatherData(false)
    
    // Set up hourly refresh
    const interval = setInterval(() => {
      if (!hasCachedWeather()) {
        loadWeatherData(false)
      }
    }, 60 * 60 * 1000) // 1 hour
    
    return () => clearInterval(interval)
  }, [])

  const loadWeatherData = async (forceRefresh: boolean) => {
    // Check for cached data first if not force refreshing
    if (!forceRefresh) {
      const cached = getCachedWeather()
      if (cached) {
        setWeatherData(cached)
        setError(null)
        return
      }
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const data = await fetchWeatherData(forceRefresh)
      setWeatherData(data)
      setError(null)
    } catch (err) {
      console.error('Failed to load weather:', err)
      setError(err instanceof Error ? err.message : 'Failed to load weather data')
      
      // Try to use cached data as fallback
      const cached = getCachedWeather()
      if (cached) {
        setWeatherData(cached)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadWeatherData(true) // Force refresh
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
        {error && !weatherData ? (
          <div className="weather-error">
            <div className="error-icon">⚠️</div>
            <h3>Weather Unavailable</h3>
            <p>{error}</p>
            <button className="refresh-btn" onClick={handleRefresh} disabled={isLoading}>
              Try Again
            </button>
          </div>
        ) : isLoading && !weatherData ? (
          <div className="loading-placeholder">
            <div className="loading-spinner"></div>
            <p>Fetching weather data...</p>
          </div>
        ) : weatherData ? (
          <div className="weather-placeholder">
            {error && (
              <div className="weather-error-banner">
                <span>⚠️ Using cached data: {error}</span>
              </div>
            )}
            
            <div className="weather-main">
              <div className="weather-icon">{weatherData.current.icon}</div>
              <div className="weather-temp">{weatherData.current.temperature}</div>
              <div className="weather-condition">{weatherData.current.condition}</div>
            </div>
            
            <div className="weather-details">
              <div className="weather-detail">
                <span className="detail-label">Feels Like</span>
                <span className="detail-value">{weatherData.current.feelsLike}</span>
              </div>
              <div className="weather-detail">
                <span className="detail-label">Humidity</span>
                <span className="detail-value">{weatherData.current.humidity}</span>
              </div>
              <div className="weather-detail">
                <span className="detail-label">Wind</span>
                <span className="detail-value">{weatherData.current.wind}</span>
              </div>
              <div className="weather-detail">
                <span className="detail-label">Visibility</span>
                <span className="detail-value">{weatherData.current.visibility}</span>
              </div>
            </div>

            <div className="weather-forecast">
              <h3>5-Day Forecast</h3>
              <div className="forecast-grid">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="forecast-day">
                    <div className="forecast-date">{day.date}</div>
                    <div className="forecast-icon">{day.icon}</div>
                    <div className="forecast-temps">{day.high} / {day.low}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="weather-note">
              <p>
                Weather data provided by the National Weather Service for Stillwater, Oklahoma.
                Data updates automatically every hour.
              </p>
            </div>
          </div>
        ) : (
          <div className="loading-placeholder">
            <div className="loading-spinner"></div>
            <p>Loading weather data...</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default Weather
