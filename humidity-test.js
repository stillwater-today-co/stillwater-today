// Test script to debug humidity issue directly
// Run with: node humidity-test.js

const STILLWATER_LAT = 36.1156;
const STILLWATER_LON = -97.0584;

async function testHumidityIssue() {
  console.log('🔍 CRITICAL HUMIDITY INVESTIGATION - Direct API Test');
  
  try {
    // Step 1: Get grid data
    console.log('\n📍 Step 1: Getting grid data for Stillwater...');
    const gridResponse = await fetch(`https://api.weather.gov/points/${STILLWATER_LAT},${STILLWATER_LON}`);
    const gridData = await gridResponse.json();
    console.log('Grid data received:', {
      gridId: gridData.properties.gridId,
      gridX: gridData.properties.gridX,
      gridY: gridData.properties.gridY
    });
    
    // Step 2: Get observation stations
    console.log('\n🏪 Step 2: Getting observation stations...');
    const stationsResponse = await fetch(gridData.properties.observationStations);
    const stationsData = await stationsResponse.json();
    
    const stations = stationsData.features.map(f => ({
      id: f.id?.split('/').pop(),
      name: f.properties?.name,
      distance: f.properties?.distance?.value ? Math.round(f.properties.distance.value * 0.000621371) : 999
    })).sort((a, b) => a.distance - b.distance);
    
    console.log(`Found ${stations.length} stations:`);
    stations.slice(0, 5).forEach((station, index) => {
      console.log(`  ${index + 1}. ${station.id} (${station.name}) - ${station.distance} miles`);
    });
    
    // Step 3: Test first 3 stations for humidity
    console.log('\n🧪 Step 3: Testing stations for humidity data...');
    const testStations = stations.slice(0, 3);
    
    for (const station of testStations) {
      try {
        console.log(`\n🏢 Testing ${station.id} (${station.name})...`);
        const obsResponse = await fetch(`https://api.weather.gov/stations/${station.id}/observations/latest`);
        
        if (!obsResponse.ok) {
          console.log(`❌ ${station.id}: HTTP ${obsResponse.status}`);
          continue;
        }
        
        const obsData = await obsResponse.json();
        const props = obsData.properties;
        
        console.log(`📊 ${station.id} Data Analysis:`);
        console.log(`  Temperature: ${props.temperature?.value ? `${props.temperature.value}°C` : 'NULL'}`);
        console.log(`  Wind: ${props.windSpeed?.value ? `${props.windSpeed.value} m/s` : 'NULL'}`);
        console.log(`  Humidity Raw Object:`, props.relativeHumidity);
        console.log(`  Humidity Value: ${props.relativeHumidity?.value !== undefined ? `${props.relativeHumidity.value}%` : 'NULL/UNDEFINED'}`);
        console.log(`  Humidity Type: ${typeof props.relativeHumidity?.value}`);
        console.log(`  Pressure: ${props.barometricPressure?.value ? `${props.barometricPressure.value} Pa` : 'NULL'}`);
        console.log(`  Timestamp: ${props.timestamp}`);
        console.log(`  Text Description: ${props.textDescription || 'NULL'}`);
        
        // Check if humidity exists in any form
        if (props.relativeHumidity) {
          console.log(`  🔍 Humidity object keys:`, Object.keys(props.relativeHumidity));
          console.log(`  🔍 Full humidity object:`, JSON.stringify(props.relativeHumidity, null, 2));
        }
        
      } catch (error) {
        console.log(`❌ ${station.id} Error:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('🚨 CRITICAL ERROR:', error);
  }
}

// Run the test
testHumidityIssue().then(() => {
  console.log('\n✅ Humidity investigation complete');
}).catch(error => {
  console.error('🚨 Investigation failed:', error);
});