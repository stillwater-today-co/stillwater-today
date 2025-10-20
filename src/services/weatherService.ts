// Weather service for National Weather Service API
// Stillwater, OK coordinates: 36.1156° N, 97.0584° W

interface NWSCurrentWeather {
  temperature: number
  temperatureUnit: string
  relativeHumidity: number | null  // CRITICAL: Humidity can be null when sensors don't provide data
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
  
  // Map and sort stations by distance
  const availableStations = stationsData.features.map((f: any) => ({
    url: f.id,
    id: f.id?.split('/').pop(),
    name: f.properties?.name,
    distance: f.properties?.distance?.value ? Math.round(f.properties.distance.value * 0.000621371) : 999
  })).sort((a: any, b: any) => a.distance - b.distance)
  
  if (availableStations.length === 0) {
    throw new Error('No observation stations found')
  }
  
  // Try stations until we find one with good temperature and wind data
  for (const station of availableStations) {
    try {
      const observationResponse = await fetch(
        `https://api.weather.gov/stations/${station.id}/observations/latest`
      )
      
      if (!observationResponse.ok) {
        continue
      }
      
      const data = await observationResponse.json()
      const props = data.properties
      
      // DEBUG: Log the full response to find humidity
      if (station.id === 'KSWO') {
        console.log('🔍 FULL KSWO RESPONSE - Looking for humidity:')
        console.log('Full properties object:', props)
        console.log('All property keys:', Object.keys(props))
        
        // Check for different humidity property names
        console.log('Checking possible humidity properties:')
        console.log('relativeHumidity:', props.relativeHumidity)
        console.log('humidity:', props.humidity)
        console.log('dewpoint:', props.dewpoint)
        console.log('dewPoint:', props.dewPoint)
        console.log('moistureContent:', props.moistureContent)
        console.log('waterVaporContent:', props.waterVaporContent)
        
        // Check if there are any properties with 'humid' in the name
        const humidityProps = Object.keys(props).filter(key => 
          key.toLowerCase().includes('humid') || 
          key.toLowerCase().includes('moisture') ||
          key.toLowerCase().includes('dew')
        )
        console.log('Properties containing humidity-related words:', humidityProps)
        
        // Log a few key properties to see structure
        console.log('Temperature structure:', props.temperature)
        console.log('Wind structure:', props.windSpeed)
        console.log('Pressure structure:', props.barometricPressure)
      }
      
      // Check if this station has essential data
      const hasTemperature = props.temperature?.value != null
      const hasWind = props.windSpeed?.value != null
      
      // If this station has good basic data, use it
      if (hasTemperature && hasWind) {
        console.log(`Using station: ${station.id} (${station.name})`)
        console.log(`Station humidity: ${props.relativeHumidity?.value || 'null'}`)
        console.log(`Station wind: ${props.windSpeed?.value} ${props.windSpeed?.unitCode}`)
        
        // Log humidity status for debugging
        if (props.relativeHumidity?.value != null) {
          console.log(`✅ Station ${station.id} has humidity: ${props.relativeHumidity.value}%`)
        } else {
          console.log(`❌ Station ${station.id} has no humidity data (will use Cushing backup)`)
        }
        
        let humidityValue = props.relativeHumidity?.value || null
        
        // Check wind unit and convert appropriately
        let windSpeed = '0 mph'
        if (props.windSpeed?.value) {
          const windUnit = props.windSpeed.unitCode
          const windValue = props.windSpeed.value
          
          console.log(`🌪️ Wind unit: ${windUnit}, value: ${windValue}`)
          
          if (windUnit === 'wmoUnit:milePerHour') {
            // Already in mph, just round it
            windSpeed = `${Math.round(windValue)} mph`
            console.log(`Wind already in mph: ${windSpeed}`)
          } else if (windUnit === 'wmoUnit:meterPerSecond') {
            // Convert from m/s to mph
            windSpeed = `${Math.round(windValue * 2.237)} mph`
            console.log(`Wind converted from m/s: ${windSpeed}`)
          } else if (windUnit === 'wmoUnit:knot') {
            // Convert from knots to mph  
            windSpeed = `${Math.round(windValue * 1.151)} mph`
            console.log(`Wind converted from knots: ${windSpeed}`)
          } else if (windUnit === 'wmoUnit:km_h-1') {
            // Convert from km/h to mph
            windSpeed = `${Math.round(windValue / 1.609)} mph`
            console.log(`Wind converted from km/h: ${windSpeed}`)
          } else {
            // Unknown unit, assume km/h since that's what we're seeing
            windSpeed = `${Math.round(windValue / 1.609)} mph`
            console.log(`Wind unit unknown (${windUnit}), assuming km/h: ${windSpeed}`)
          }
        }
        
        let windDirection = props.windDirection?.value ? getWindDirection(props.windDirection.value) : 'N'
        
        // Get humidity from Cushing if primary station doesn't have it
        if (!humidityValue) {
          console.log('Getting humidity from Cushing...')
          try {
            const cushingResponse = await fetch('https://api.weather.gov/stations/KCUH/observations/latest')
            if (cushingResponse.ok) {
              const cushingData = await cushingResponse.json()
              const cushingHumidity = cushingData.properties.relativeHumidity?.value
              if (cushingHumidity != null) {
                humidityValue = cushingHumidity
                console.log(`Got Cushing humidity: ${cushingHumidity}%`)
              }
            }
          } catch (error) {
            console.log('Failed to get Cushing humidity')
          }
        } else {
          console.log(`Using station humidity: ${humidityValue}%`)
        }
        
        return {
          temperature: props.temperature?.value || 0,
          temperatureUnit: props.temperature?.unitCode || 'wmoUnit:degC',
          relativeHumidity: humidityValue,
          windSpeed: windSpeed,
          windDirection: windDirection,
          barometricPressure: props.barometricPressure?.value || 0,
          visibility: props.visibility?.value ? Math.round(props.visibility.value * 0.000621371) : 10,
          textDescription: props.textDescription || 'Unknown',
          icon: props.icon || ''
        }
      }
      
    } catch (error) {
      // Continue to next station if this one fails
      continue
    }
  }
  
  throw new Error('No observation stations returned valid data')
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
    
    // Handle null humidity properly
    const humidityDisplay = currentWeather.relativeHumidity !== null 
      ? `${Math.round(currentWeather.relativeHumidity)}%`
      : 'N/A'
    
    const weatherData: WeatherData = {
      current: {
        temperature: `${tempF}°F`,
        condition: currentWeather.textDescription,
        icon: getWeatherEmoji(currentWeather.icon, currentWeather.textDescription),
        feelsLike: `${feelsLike}°F`,
        humidity: humidityDisplay,
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