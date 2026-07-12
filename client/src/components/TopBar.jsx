import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Bell, CloudSun, Moon, Sun } from 'lucide-react';
import api from '../services/api';
import { useThemeStore } from '../store/themeStore';
import ProfileDropdown from './ProfileDropdown.jsx';

export default function TopBar({ user, weatherLocation, notificationCount = 0 }) {
  const navigate = useNavigate();
  const { preference, setPreference } = useThemeStore();
  const isDark = document.documentElement.dataset.theme === 'dark';

  const { data: weather } = useQuery({
    queryKey: ['weather', weatherLocation?.lat, weatherLocation?.lon],
    queryFn: async () => (await api.get('/weather', { params: { lat: weatherLocation.lat, lon: weatherLocation.lon } })).data.weather,
    enabled: !!weatherLocation,
    staleTime: 15 * 60 * 1000,
    retry: false,
  });

  return (
    <header className="sticky top-0 z-30 glass px-4 md:px-8 py-4 flex items-center gap-3 md:gap-4">
      <div className="flex-1 max-w-md flex items-center gap-2 bg-black/[0.03] border border-line rounded-full px-4 py-2.5">
        <Search size={16} className="text-muted shrink-0" aria-hidden="true" />
        <input
          aria-label="Search destinations, trips or places"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              navigate(`/explore?q=${encodeURIComponent(e.currentTarget.value)}`);
            }
          }}
          placeholder="Search destinations, trips or places..."
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted min-w-0"
        />
      </div>

      <div className="flex-1" />

      {weather && (
        <div className="hidden md:flex items-center gap-2 text-sm shrink-0">
          <CloudSun size={22} className="text-accent-secondary" strokeWidth={1.6} />
          <div className="leading-tight">
            <p className="font-medium">{Math.round(weather.temperature)}°C</p>
            <p className="text-[11px] text-muted">{weatherLocation?.label}</p>
          </div>
        </div>
      )}

      <button
        onClick={() => setPreference(isDark ? 'light' : 'dark')}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="hidden sm:flex p-2.5 rounded-full text-ink/70 hover:bg-bg-secondary transition-colors shrink-0"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <button
        aria-label={`Notifications${notificationCount ? `, ${notificationCount} unread` : ''}`}
        className="relative p-2.5 rounded-full hover:bg-bg-secondary transition-colors shrink-0"
      >
        <Bell size={19} className="text-ink/70" />
        {notificationCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-warning text-white text-[10px] font-semibold flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </button>

      <ProfileDropdown user={user} />
    </header>
  );
}
