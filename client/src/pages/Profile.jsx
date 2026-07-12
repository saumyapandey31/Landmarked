import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();

  const { data: profile } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => (await api.get(`/users/${id}`)).data.user,
  });

  const { data: stats } = useQuery({
    queryKey: ['stats', id],
    queryFn: async () => (await api.get(`/users/${id}/statistics`)).data.statistics,
  });

  const { data: trips } = useQuery({
    queryKey: ['userTrips', id],
    queryFn: async () => (await api.get('/trips', { params: { userId: id } })).data.trips,
  });

  const toggleFollow = useMutation({
    mutationFn: () => api.post(`/follows/${id}/toggle`),
  });

  if (!profile) return <div className="min-h-screen bg-bg-primary flex items-center justify-center">Loading…</div>;

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div
        className="h-56 bg-cover bg-center bg-bg-secondary"
        style={{ backgroundImage: `url(${profile.coverUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=60&w=1200'})` }}
      />
      <div className="max-w-5xl mx-auto px-6 -mt-16">
        <div className="flex items-end gap-6">
          <img
            src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`}
            alt={profile.name}
            className="w-28 h-28 rounded-full border-4 border-ink shadow-soft object-cover"
          />
          <div className="pb-2">
            <h1 className="text-2xl font-display">{profile.name}</h1>
            <p className="text-ink/60 text-sm">
              {profile._count.trips} trips · {profile._count.followers} followers · {profile._count.following} following
            </p>
          </div>
          {!isOwnProfile && currentUser && (
            <button
              onClick={() => toggleFollow.mutate()}
              className="ml-auto mb-2 px-5 py-2 rounded-full bg-accent-primary text-card text-sm font-medium shadow-card"
            >
              Follow
            </button>
          )}
        </div>

        {profile.bio && <p className="mt-6 text-ink/80 max-w-2xl">{profile.bio}</p>}

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Stat label="Countries" value={stats.countriesVisited} />
            <Stat label="Cities" value={stats.citiesVisited} />
            <Stat label="Total Trips" value={stats.totalTrips} />
            <Stat label="Longest Trip" value={`${Math.round(stats.longestTrip)}d`} />
          </div>
        )}

        <h2 className="font-display text-2xl mt-12 mb-4">Trips</h2>
        <div className="grid md:grid-cols-3 gap-4 pb-16">
          {trips?.map((trip) => (
            <Link
              key={trip.id}
              to={`/trips/${trip.id}`}
              className="bg-card border border-line rounded-xl2 overflow-hidden shadow-card group"
            >
              <div
                className="h-32 bg-cover bg-center bg-bg-secondary group-hover:scale-105 transition-transform"
                style={{ backgroundImage: `url(${trip.coverImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=60&w=800'})` }}
              />
              <div className="p-4">
                <p className="font-display">{trip.title}</p>
                <p className="text-sm text-ink/60">{trip.country?.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-card border border-line rounded-xl2 p-4 text-center shadow-card">
      <p className="text-2xl font-display">{value}</p>
      <p className="text-xs text-ink/60 mt-1">{label}</p>
    </div>
  );
}
