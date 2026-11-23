export default function WeatherCard({ weather, loading, onFetchWeather }) {
  return (
    <section className="weather-card max-w-sm w-full space-y-4 text-center">
      <h1 className="text-xl font-bold text-sky-400">Jamstack Weather — Quito</h1>
      <p className="text-sm text-slate-400">
        Static markup + client JavaScript consuming an external weather API.
      </p>

      <button
        type="button"
        onClick={onFetchWeather}
        className="w-full py-2 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 font-semibold cursor-pointer"
      >
        {loading ? "Loading..." : "Get Weather"}
      </button>

      {weather && (
        <div className="pt-2 space-y-1">
          <p className="text-2xl font-bold">{weather.temperature_2m} °C</p>
          <p className="text-sm text-slate-300">
            Wind: {weather.wind_speed_10m} km/h
          </p>
        </div>
      )}
    </section>
  );
}