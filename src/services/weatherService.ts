// Weather service for National Weather Service API
// Stillwater, OK coordinates: 36.1156° N, 97.0584° W

interface NWSCurrentWeather {
  temperature: number
  temperatureUnit: string
  relativeHumidity: number
  windSpeed: string
  windDirection: string
  barometricPressure: number
  visibility: number
  textDescription: string
  icon: string
}

interface NWSForecastPeriod {
  number: number
  name: string
  startTime: string
  endTime: string
  isDaytime: boolean
  temperature: number
  temperatureUnit: string
  windSpeed: string
  windDirection: string
  icon: string
  shortForecast: string
  detailedForecast: string
}

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

// Stillwater, OK coordinates
const STILLWATER_LAT = 36.1156
const STILLWATER_LON = -97.0584

// Cache for API responses (1 hour cache)
let weatherCache: { data: WeatherData; timestamp: number } | null = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

// Convert NWS weather icons to emoji
function getWeatherEmoji(_iconUrl: string, shortForecast: string): string {
  const forecast = shortForecast.toLowerCase()
  
  if (forecast.includes('sunny') || forecast.includes('clear')) {
    return '☀️'
  } else if (forecast.includes('partly cloudy') || forecast.includes('partly sunny')) {
    return '⛅'
  } else if (forecast.includes('cloudy') || forecast.includes('overcast')) {
    return '☁️'
  } else if (forecast.includes('rain') || forecast.includes('shower')) {
    return '🌧️'
  } else if (forecast.includes('thunderstorm') || forecast.includes('storm')) {
    return '⛈️'
  } else if (forecast.includes('snow')) {
    return '🌨️'
  } else if (forecast.includes('fog') || forecast.includes('mist')) {
    return '🌫️'
  } else {
    return '🌤️' // default
  }
}

// Get grid coordinates for Stillwater, OK
async function getGridData() {
  const response = await fetch(
    `https://api.weather.gov/points/${STILLWATER_LAT},${STILLWATER_LON}`
  )
  
  if (!response.ok) {
    throw new Error(`Failed to get grid data: ${response.status}`)
  }
  
  const data = await response.json()
  return {
    gridId: data.properties.gridId,
    gridX: data.properties.gridX,
    gridY: data.properties.gridY,
    forecastUrl: data.properties.forecast,
    forecastHourlyUrl: data.properties.forecastHourly,
    observationStationsUrl: data.properties.observationStations
  }
}

// Get current weather from nearest observation station
async function getCurrentWeather(observationStationsUrl: string): Promise<NWSCurrentWeather> {
  // Get list of observation stations
  const stationsResponse = await fetch(observationStationsUrl)
  if (!stationsResponse.ok) {
    throw new Error(`Failed to get observation stations: ${stationsResponse.status}`)
  }
  
  const stationsData = await stationsResponse.json()
  
  // The stations API returns an array of station URLs in features[].id
  const firstStationUrl = stationsData.features[0]?.id
  
  if (!firstStationUrl) {
    throw new Error('No observation stations found')
  }
  
  // Extract station ID from the URL (e.g., "https://api.weather.gov/stations/KSWO" -> "KSWO")
  const stationId = firstStationUrl.split('/').pop()
  
  // Get current observations from the first station
  const observationResponse = await fetch(
    `https://api.weather.gov/stations/${stationId}/observations/latest`
  )
  
  if (!observationResponse.ok) {
    throw new Error(`Failed to get current weather: ${observationResponse.status}`)
  }
  
  const data = await observationResponse.json()
  const props = data.properties
  
  return {
    temperature: props.temperature?.value || 0,
    temperatureUnit: props.temperature?.unitCode || 'wmoUnit:degC',
    relativeHumidity: props.relativeHumidity?.value || 0,
    windSpeed: props.windSpeed?.value ? `${Math.round(props.windSpeed.value * 2.237)} mph` : '0 mph', // Convert m/s to mph
    windDirection: props.windDirection?.value ? getWindDirection(props.windDirection.value) : 'N',
    barometricPressure: props.barometricPressure?.value || 0,
    visibility: props.visibility?.value ? Math.round(props.visibility.value * 0.000621371) : 10, // Convert meters to miles
    textDescription: props.textDescription || 'Unknown',
    icon: props.icon || ''
  }
}

// Convert wind direction degrees to cardinal direction
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

// Convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9/5) + 32)
}

// Get 5-day forecast
async function getForecast(forecastUrl: string): Promise<NWSForecastPeriod[]> {
  const response = await fetch(forecastUrl)
  
  if (!response.ok) {
    throw new Error(`Failed to get forecast: ${response.status}`)
  }
  
  const data = await response.json()
  return data.properties.periods.slice(0, 10) // Get first 10 periods (5 days)
}

// Main function to fetch all weather data
export async function fetchWeatherData(forceRefresh: boolean = false): Promise<WeatherData> {
  // Check cache first (unless force refresh)
  if (!forceRefresh && weatherCache && (Date.now() - weatherCache.timestamp) < CACHE_DURATION) {
    return weatherCache.data
  }
  
  try {
    // Get grid data
    const gridData = await getGridData()
    
    // Fetch current weather and forecast in parallel
    const [currentWeather, forecast] = await Promise.all([
      getCurrentWeather(gridData.observationStationsUrl),
      getForecast(gridData.forecastUrl)
    ])
    
    // Process current weather
    const tempF = currentWeather.temperatureUnit.includes('degC') 
      ? celsiusToFahrenheit(currentWeather.temperature)
      : currentWeather.temperature
    
    // Calculate feels like (simplified - just use actual temp for now)
    const feelsLike = tempF
    
    // Process forecast into 5-day format
    const processedForecast = []
    for (let i = 0; i < Math.min(forecast.length, 10); i += 2) {
      const day = forecast[i]
      const night = forecast[i + 1]
      
      if (day) {
        processedForecast.push({
          date: i === 0 ? 'Today' : i === 2 ? 'Tomorrow' : new Date(day.startTime).toLocaleDateString('en-US', { weekday: 'short' }),
          icon: getWeatherEmoji(day.icon, day.shortForecast),
          high: `${day.temperature}°`,
          low: night ? `${night.temperature}°` : `${day.temperature - 10}°`
        })
      }
      
      if (processedForecast.length >= 5) break
    }
    
    const weatherData: WeatherData = {
      current: {
        temperature: `${tempF}°F`,
        condition: currentWeather.textDescription,
        icon: getWeatherEmoji(currentWeather.icon, currentWeather.textDescription),
        feelsLike: `${feelsLike}°F`,
        humidity: `${Math.round(currentWeather.relativeHumidity)}%`,
        wind: `${currentWeather.windSpeed} ${currentWeather.windDirection}`,
        visibility: `${currentWeather.visibility} mi`
      },
      forecast: processedForecast
    }
    
    // Cache the result
    weatherCache = {
      data: weatherData,
      timestamp: Date.now()
    }
    
    return weatherData
    
  } catch (error) {
    console.error('Weather API error:', error)
    throw new Error(`Failed to fetch weather data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Check if cached data exists and is still valid
export function hasCachedWeather(): boolean {
  return weatherCache !== null && (Date.now() - weatherCache.timestamp) < CACHE_DURATION
}

// Get cached weather data if available
export function getCachedWeather(): WeatherData | null {
  if (hasCachedWeather()) {
    return weatherCache!.data
  }
  return null
}