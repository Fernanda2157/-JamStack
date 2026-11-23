import { useState } from 'react';
import WeatherCard from './components/WeatherCard';
import ContactForm from './components/ContactForm';
import { fetchCurrentWeather } from './services/weatherApi';
import { useWeatherSocket } from './hooks/useWeatherSocket';
import './styles/global.css';

export default function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const live = useWeatherSocket();

  async function handleFetchWeather() {
    setLoading(true);
    try {
      setWeather(await fetchCurrentWeather());
    } catch {
      alert('No se pudieron cargar los datos del clima');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-layout">
      <WeatherCard weather={weather} loading={loading} onFetchWeather={handleFetchWeather} live={live} />
      <ContactForm />
    </main>
  );
}
