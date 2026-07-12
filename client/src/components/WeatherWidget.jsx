import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function WeatherWidget({ lat, lon, label }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['weather', lat, lon],
    queryFn: async () => (await api.get('/weather', { params: { lat, lon } })).data.weather,
    enabled: lat !== undefined && lon !== undefined,
  });

  return (
    <div className="bg-card border border-line rounded-xl2 p-5 shadow-card">
      <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">Weather {label ? `· ${label}` : ''}</p>
      {isLoading && <p className="text-sm text-ink/60">Loading…</p>}
      {error && <p className="text-sm text-ink/60">Add an OpenWeather API key to enable this widget.</p>}
      {data && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-display">{Math.round(data.temperature)}°C</p>
            <p className="text-sm text-ink/60 capitalize">{data.condition}</p>
          </div>
          <div className="text-sm text-ink/60 text-right">
            <p>Humidity {data.humidity}%</p>
            <p>Wind {data.windSpeed} m/s</p>
          </div>
        </div>
      )}
    </div>
  );
}
