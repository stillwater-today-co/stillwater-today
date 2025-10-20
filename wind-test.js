// Quick wind test to compare with iPhone
// Run: node wind-test.js

async function testWindSpeed() {
  console.log('🌪️ WIND SPEED INVESTIGATION');
  
  try {
    // Test KSWO directly
    const response = await fetch('https://api.weather.gov/stations/KSWO/observations/latest');
    const data = await response.json();
    console.log('Full response:', JSON.stringify(data, null, 2));
    const props = data.properties;
    
    const rawWindMS = props.windSpeed?.value;
    const rawWindUnit = props.windSpeed?.unitCode;
    
    console.log('\n📊 KSWO Wind Data:');
    console.log(`Raw wind value: ${rawWindMS}`);
    console.log(`Raw wind unit: ${rawWindUnit}`);
    console.log(`Full wind object:`, props.windSpeed);
    
    if (rawWindMS) {
      console.log('\n🧮 Conversion Options:');
      console.log(`Standard (×2.237): ${Math.round(rawWindMS * 2.237)} mph`);
      console.log(`Alternative (×2.24): ${Math.round(rawWindMS * 2.24)} mph`);
      console.log(`Half factor (×1.15): ${Math.round(rawWindMS * 1.15)} mph`);
      console.log(`Direct value: ${Math.round(rawWindMS)} mph`);
      console.log(`Knots conversion: ${Math.round(rawWindMS * 1.94384)} mph`);
      
      console.log('\n📱 Comparison:');
      console.log(`Your iPhone: ~17 mph`);
      console.log(`Our current: ${Math.round(rawWindMS * 2.237)} mph`);
      console.log(`Ratio: ${((Math.round(rawWindMS * 2.237)) / 17).toFixed(2)}x higher`);
      
      // Check if it's wind gust vs sustained
      if (props.windGust?.value) {
        console.log(`\n💨 Gust data available: ${props.windGust.value} ${props.windGust.unitCode}`);
        console.log(`Gust converted: ${Math.round(props.windGust.value * 2.237)} mph`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testWindSpeed();