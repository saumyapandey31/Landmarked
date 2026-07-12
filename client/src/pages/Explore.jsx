import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Navbar from '../components/Navbar.jsx';

export default function Explore() {
  const [query, setQuery] = useState('');

  const { data: trips, isLoading } = useQuery({
    queryKey: ['exploreTrips'],
    queryFn: async () => (await api.get('/trips')).data.trips,
  });

  const filtered = (trips || []).filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.country?.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-16">
        <h1 className="text-3xl font-display mb-2">Explore</h1>
        <p className="text-ink/60 mb-8">Discover public journals from travelers around the world.</p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by country, city, or trip title…"
          className="w-full max-w-md rounded-full border border-line bg-card px-5 py-3 outline-none focus:ring-2 focus:ring-accent-highlight mb-10"
        />

        {isLoading && <p className="text-ink/60">Loading trips…</p>}

        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((trip) => (
            <Link
              key={trip.id}
              to={`/trips/${trip.id}`}
              className="bg-card border border-line rounded-xl2 overflow-hidden shadow-card group"
            >
              <div
                className="h-40 bg-cover bg-center bg-bg-secondary group-hover:scale-105 transition-transform"
                style={{ backgroundImage: `url(${trip.coverImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=60&w=800'})` }}
              />
              <div className="p-4">
                <p className="font-display text-lg">{trip.title}</p>
                <p className="text-sm text-ink/60">{trip.country?.name} · by {trip.user.name}</p>
                <p className="text-xs text-ink/50 mt-2">❤️ {trip._count.likes} · 💬 {trip._count.comments}</p>
              </div>
            </Link>
          ))}
        </div>

        {!isLoading && filtered.length === 0 && (
          <p className="text-ink/60 mt-10">No trips match your search yet.</p>
        )}
      </div>
    </div>
  );
}
