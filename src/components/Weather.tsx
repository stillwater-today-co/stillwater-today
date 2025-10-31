import React, { useCallback, useEffect, useState } from 'react'
import { fetchWeatherData, getCachedWeather, hasCachedWeather } from '../services/weatherService'

interface WeatherData {
  current: {
    temperature: string
    temperatureValue: number
    condition: string
    icon: string
    feelsLike: string
    feelsLikeValue: number
    humidity: string
    wind: string
    windSpeedValue: number
    visibility: string
    visibilityValue: number
  }
  forecast: Array<{
    date: string
    icon: string
    high: string
    highValue: number
    low: string
    lowValue: number
    shortForecast?: string
    detailedForecast?: string
    windSpeed?: string
    precipProbability?: number | null
  }>
}

const Weather: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial')
  const [reportDay, setReportDay] = useState<number | null>(null)

  // Show toast notification
  const showToastNotification = useCallback((message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000) // Hide after 3 seconds
  }, [])

  const loadWeatherData = useCallback(async (forceRefresh: boolean) => {
    // Always show loading when force refreshing (button click)
    if (forceRefresh) {
      setIsLoading(true)
      setError(null)
    }
    
    // Check for cached data first if not force refreshing
    if (!forceRefresh) {
      const cached = getCachedWeather()
      if (cached) {
        setWeatherData(cached)
        setError(null)
        setLastUpdated(new Date()) // Set when we load cached data
        return
      }
    }

    // Show loading for automatic refreshes too
    if (!forceRefresh) {
      setIsLoading(true)
      setError(null)
    }
    
    try {
      // Add a minimum loading time for better UX when refresh is clicked
      const minLoadTime = forceRefresh ? 500 : 0 // 500ms minimum for button clicks
      const startTime = Date.now()
      
      // Check if we have cached data before fetching
      const hadCachedData = forceRefresh && hasCachedWeather()
      
      const data = await fetchWeatherData(forceRefresh)
      
      // Ensure minimum loading time for button clicks
      if (forceRefresh) {
        const elapsed = Date.now() - startTime
        if (elapsed < minLoadTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsed))
        }
      }
      
      setWeatherData(data)
      setError(null)
      setLastUpdated(new Date())
      
      // Show toast if refresh was clicked but cached data was used
      if (forceRefresh && hadCachedData) {
        showToastNotification('Already up to date')
      }
    } catch (err) {
      console.error('Failed to load weather:', err)
      setError(err instanceof Error ? err.message : 'Failed to load weather data')
      
      // Try to use cached data as fallback
      const cached = getCachedWeather()
      if (cached) {
        setWeatherData(cached)
        if (!lastUpdated) setLastUpdated(new Date())
      }
    } finally {
      setIsLoading(false)
    }
  }, [showToastNotification, lastUpdated])

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
  }, [loadWeatherData])

  // Load unit preference from localStorage (default to imperial)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('weather_unit')
      if (stored === 'metric' || stored === 'imperial') setUnit(stored)
      else setUnit('imperial')
    } catch {
      setUnit('imperial')
    }
  }, [])

  // Persist unit when changed
  useEffect(() => {
    try {
      localStorage.setItem('weather_unit', unit)
    } catch {}
  }, [unit])

  const handleRefresh = () => {
    loadWeatherData(true) // Force refresh
  }

  return (
    <section className="weather-section">
      {/* Toast notification */}
      {showToast && (
        <div className="toast-notification">
          <span>✅ {toastMessage}</span>
        </div>
      )}
      
      <div className="weather-header">
        <div className="weather-title">
          <h2>Current Weather</h2>
          {lastUpdated && (
            <p className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className={`unit-btn`}
            onClick={() => setUnit(prev => prev === 'imperial' ? 'metric' : 'imperial')}
            title={`Switch to ${unit === 'imperial' ? 'metric system' : 'imperial system'}`}
          >
            {unit === 'imperial' ? 'Imperial system' : 'Metric system'}
          </button>

          <button 
            className={`refresh-btn ${isLoading ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <span className="refresh-icon">
              {isLoading ? '↻' : '↻'}
            </span>
            <span className="refresh-text">
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>
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
              <div className="weather-temp">
                {unit === 'imperial'
                  ? `${weatherData.current.temperatureValue}°F`
                  : `${Math.round((weatherData.current.temperatureValue - 32) * 5/9)}°C`}
              </div>
              <div className="weather-condition">{weatherData.current.condition}</div>
            </div>
            
            <div className="weather-details">
              <div className="weather-detail">
                <span className="detail-label">Feels Like</span>
                <span className="detail-value">
                  {unit === 'imperial'
                    ? `${weatherData.current.feelsLikeValue}°F`
                    : `${Math.round((weatherData.current.feelsLikeValue - 32) * 5/9)}°C`}
                </span>
              </div>
              <div className="weather-detail">
                <span className="detail-label">Humidity</span>
                <span className="detail-value">{weatherData.current.humidity}</span>
              </div>
              <div className="weather-detail">
                <span className="detail-label">Wind</span>
                <span className="detail-value">
                  {unit === 'imperial'
                    ? `${weatherData.current.windSpeedValue} mph ${weatherData.current.wind.split(' ').slice(-1)[0]}`
                    : `${Math.round(weatherData.current.windSpeedValue * 1.609)} km/h ${weatherData.current.wind.split(' ').slice(-1)[0]}`}
                </span>
              </div>
              <div className="weather-detail">
                <span className="detail-label">Visibility</span>
                <span className="detail-value">
                  {unit === 'imperial'
                    ? `${weatherData.current.visibilityValue} mi`
                    : `${Math.round(weatherData.current.visibilityValue * 1.609)} km`}
                </span>
              </div>
            </div>

            <div className="weather-forecast">
              <h3>5-Day Forecast</h3>
              <div className="forecast-grid">
                {weatherData.forecast.map((day, index) => (
                  <button
                    key={index}
                    className="forecast-day"
                    onClick={() => setReportDay(index)}
                    aria-label={`Open report for ${day.date}`}
                  >
                    <div className="forecast-date">{day.date}</div>
                    <div className="forecast-icon">{day.icon}</div>
                    <div className="forecast-temps">
                      {unit === 'imperial'
                        ? `${day.highValue}°F / ${day.lowValue}°F`
                        : `${Math.round((day.highValue - 32) * 5/9)}°C / ${Math.round((day.lowValue - 32) * 5/9)}°C`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Day report modal */}
            {reportDay !== null && (
              <div className="modal-overlay" role="dialog" aria-modal="true">
                <div className="modal">
                  <h3>{weatherData.forecast[reportDay].date} — Detailed Report</h3>
                  <p><strong>Summary:</strong> {weatherData.forecast[reportDay].shortForecast}</p>
                  {weatherData.forecast[reportDay].detailedForecast && (
                    <p><strong>Details:</strong> {weatherData.forecast[reportDay].detailedForecast}</p>
                  )}
                  <p><strong>Wind:</strong> {weatherData.forecast[reportDay].windSpeed || 'N/A'}</p>
                  <p><strong>Precipitation chance:</strong> {weatherData.forecast[reportDay].precipProbability != null ? `${weatherData.forecast[reportDay].precipProbability}%` : 'N/A'}</p>
                  <div style={{ marginTop: 12 }}>
                    <button className="primary" onClick={() => setReportDay(null)}>Close</button>
                  </div>
                </div>
              </div>
            )}

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
