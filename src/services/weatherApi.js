const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchCurrentWeather(latitude = -0.1807, longitude = -78.4678) {
  const endpoint = `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Weather API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.current;
}