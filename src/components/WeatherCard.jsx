export default function WeatherCard({ weather, loading, onFetchWeather, live }) {
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

      {/* Sección nueva: datos en vivo por WebSocket */}
      <div className="pt-4 border-t border-slate-700 space-y-1">
        <p className="text-sm text-slate-400">
          En vivo (WebSocket):{" "}
          <span className="font-bold text-emerald-400">{live.estado}</span>
        </p>
        <p className="text-sm text-slate-400">
          Usuarios conectados: {live.usuarios}
        </p>

        {live.clima && (
          <>
            <p className="text-2xl font-bold">{live.clima.temperature_2m} °C</p>
            <p className="text-sm text-slate-300">
              Wind: {live.clima.wind_speed_10m} km/h
            </p>
            <p className="text-xs text-slate-500">
              Última consulta: {new Date(live.clima.consultado).toLocaleTimeString()}
            </p>
          </>
        )}
      </div>
    </section>
  );
}