const axios = require('axios');

async function getWeather(lat, lon) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('OPENWEATHER_API_KEY not configured'), { status: 500 });
  }
  const url = `https://api.openweathermap.org/data/2.5/weather`;
  const { data } = await axios.get(url, {
    params: { lat, lon, appid: apiKey, units: 'metric' },
  });

  return {
    temperature: data.main?.temp,
    humidity: data.main?.humidity,
    windSpeed: data.wind?.speed,
    condition: data.weather?.[0]?.description,
    sunrise: data.sys?.sunrise,
    sunset: data.sys?.sunset,
  };
}

module.exports = { getWeather };
