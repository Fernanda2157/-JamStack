import { useState } from "react";
import WeatherCard from "./components/WeatherCard";
import { fetchCurrentWeather } from "./services/weatherApi";
import "./styles/global.css";

export default function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleFetchWeather() {
    setLoading(true);
    try {
      const currentWeather = await fetchCurrentWeather();
      setWeather(currentWeather);
    } catch {
      alert("Unable to load weather data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <WeatherCard
        weather={weather}
        loading={loading}
        onFetchWeather={handleFetchWeather}
      />
    </main>
  );
}