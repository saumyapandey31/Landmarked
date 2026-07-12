import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { totalDistanceTraveled } from '../utils/distance';

import Sidebar from '../components/Sidebar.jsx';
import MobileBottomNav from '../components/MobileBottomNav.jsx';
import TopBar from '../components/TopBar.jsx';
import GreetingHero from '../components/GreetingHero.jsx';
import GlobeShowcaseCard from '../components/GlobeShowcaseCard.jsx';
import RecentTripsCard from '../components/RecentTripsCard.jsx';
import UpcomingTripsCard from '../components/UpcomingTripsCard.jsx';
import TravelJournalCard from '../components/TravelJournalCard.jsx';
import BucketListCard from '../components/BucketListCard.jsx';
import TravelMemoriesCard from '../components/TravelMemoriesCard.jsx';
import RecentActivityFeed from '../components/RecentActivityFeed.jsx';
import TravelStatisticsCard from '../components/TravelStatisticsCard.jsx';
import AchievementsCard from '../components/AchievementsCard.jsx';
import QuoteCard from '../components/QuoteCard.jsx';
import ScrapbookPreviewCard from '../components/ScrapbookPreviewCard.jsx';
import TripTimeline from '../components/TripTimeline.jsx';
import CreateMemoryModal from '../components/CreateMemoryModal.jsx';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [pendingPosition, setPendingPosition] = useState(null);

  // Makes the sidebar links actually work: React Router doesn't auto-scroll
  // to an anchor when only the hash changes on the same route, so we do it
  // ourselves whenever the hash changes.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [location.hash]);

  const { data: markers } = useQuery({
    queryKey: ['markers'],
    queryFn: async () => (await api.get('/markers')).data.markers,
  });

  const { data: trips } = useQuery({
    queryKey: ['userTrips', user?.id],
    queryFn: async () => (await api.get('/trips', { params: { userId: user.id } })).data.trips,
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ['stats', user?.id],
    queryFn: async () => (await api.get(`/users/${user.id}/statistics`)).data.statistics,
    enabled: !!user?.id,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data.notifications,
  });

  const { data: scrapbookEntries } = useQuery({
    queryKey: ['scrapbook', user?.id],
    queryFn: async () => (await api.get('/scrapbook', { params: { userId: user.id } })).data.entries,
    enabled: !!user?.id,
  });

  const { data: bucketListItems } = useQuery({
    queryKey: ['bucketList', user?.id],
    queryFn: async () => (await api.get('/bucket-list', { params: { userId: user.id } })).data.items,
    enabled: !!user?.id,
  });

  const createMarker = useMutation({
    mutationFn: (payload) => api.post('/markers', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markers'] });
      setPendingPosition(null);
    },
  });

  const createMemory = useMutation({
    mutationFn: async (payload) => {
      await api.post('/markers', {
        type: 'VISITED',
        label: payload.markerLabel,
        latitude: payload.latitude,
        longitude: payload.longitude,
      });
      return api.post('/trips', payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['markers'] });
      queryClient.invalidateQueries({ queryKey: ['userTrips'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setPendingPosition(null);
      navigate(`/trips/${res.data.trip.id}`);
    },
  });

  const enrichedStats = useMemo(() => {
    const storiesCaptured = (trips || []).filter((t) => t.story?.trim().length > 0).length;
    const mediaCount = (trips || []).reduce((sum, t) => sum + (t.media?.length || 0) + (t.videos?.length || 0), 0);
    return { ...stats, storiesCaptured, mediaCount };
  }, [trips, stats]);

  const recentTrips = useMemo(() => {
    const now = new Date();
    return (trips || [])
      .filter((t) => new Date(t.startDate) <= now)
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }, [trips]);

  const upcomingTrips = useMemo(() => {
    const now = new Date();
    return (trips || [])
      .filter((t) => new Date(t.startDate) > now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [trips]);

  const latestJournalTrip = useMemo(
    () => recentTrips.find((t) => t.story?.trim().length > 0) || recentTrips[0],
    [recentTrips]
  );

  const bucketMarkers = useMemo(() => (markers || []).filter((m) => m.type === 'BUCKET_LIST'), [markers]);

  const memoryPhotos = useMemo(
    () => (trips || []).flatMap((t) => (t.media || []).map((m) => m.url)).slice(0, 12),
    [trips]
  );

  const currentOrUpcomingTrip = useMemo(() => {
    const now = new Date();
    const inProgress = (trips || []).find((t) => new Date(t.startDate) <= now && (!t.endDate || new Date(t.endDate) >= now));
    if (inProgress) return inProgress;
    return upcomingTrips[0];
  }, [trips, upcomingTrips]);

  const weatherLocation = currentOrUpcomingTrip
    ? {
        lat: currentOrUpcomingTrip.latitude,
        lon: currentOrUpcomingTrip.longitude,
        label: [currentOrUpcomingTrip.city?.name, currentOrUpcomingTrip.country?.name].filter(Boolean).join(', ') || currentOrUpcomingTrip.title,
      }
    : null;

  const travelStats = useMemo(() => ([
    { label: 'Distance traveled', value: `${totalDistanceTraveled(trips || []).toLocaleString()} km` },
    { label: 'Photos & videos', value: enrichedStats.mediaCount },
    { label: 'Places explored', value: (markers || []).length },
    { label: 'Countries visited', value: stats?.countriesVisited ?? 0 },
    { label: 'Scrapbook entries', value: (scrapbookEntries || []).length },
    { label: 'Bucket list items', value: (bucketListItems || []).filter((i) => !i.isArchived).length },
  ]), [trips, markers, stats, enrichedStats, scrapbookEntries, bucketListItems]);

  const unreadCount = (notifications || []).filter((n) => !n.isRead).length;

  function handleMarkerClick(marker) {
    if (marker.type === 'VISITED') {
      const trip = (trips || []).find(
        (t) => Math.abs(t.latitude - marker.latitude) < 0.01 && Math.abs(t.longitude - marker.longitude) < 0.01
      );
      if (trip) navigate(`/trips/${trip.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <Sidebar notificationCount={unreadCount} />

      <div className="flex-1 min-w-0 pb-20 lg:pb-0">
        <TopBar user={user} notificationCount={unreadCount} weatherLocation={weatherLocation} />

        <main className="px-4 md:px-8 py-8 space-y-10 max-w-7xl mx-auto">
          <GreetingHero name={user?.name} stats={enrichedStats} />

          <GlobeShowcaseCard
            markers={markers}
            homeCurrency={user?.homeCurrency}
            onMapClick={setPendingPosition}
            onMarkerClick={handleMarkerClick}
            onMarkDestination={() => setPendingPosition({ lat: 20, lon: 0 })}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <RecentTripsCard trips={recentTrips} />
            <UpcomingTripsCard trips={upcomingTrips} />
            <TravelJournalCard trip={latestJournalTrip} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <BucketListCard items={bucketListItems} markers={bucketMarkers} />
            <TravelMemoriesCard photos={memoryPhotos} />
            <RecentActivityFeed />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <TravelStatisticsCard stats={travelStats} />
            <AchievementsCard countriesVisited={stats?.countriesVisited ?? 0} tripsCompleted={stats?.totalTrips ?? 0} />
            <QuoteCard />
          </div>

          {/* Deeper sections, reached via the sidebar */}
          <section id="trips" className="scroll-mt-24 pt-4">
            <div className="flex items-center justify-between mb-4">
              <SectionHeading title="Trip journals" />
              <Link to="/trips/new" className="text-sm font-medium text-accent-highlight hover:underline shrink-0">
                + New trip journal
              </Link>
            </div>
            {trips?.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            ) : (
              <EmptyState text="No trip journals yet — click the globe to create your first memory." />
            )}
          </section>

          <section id="timeline" className="scroll-mt-24">
            <SectionHeading title="Timeline" subtitle="Your journeys, in order" />
            <TripTimeline trips={trips || []} />
          </section>

          <section id="scrapbook" className="scroll-mt-24">
            <div className="flex items-center justify-between mb-4">
              <SectionHeading title="Scrapbook" subtitle="Every trip becomes a hardcover chapter" />
              <Link to="/scrapbook" className="text-sm font-medium text-accent-highlight hover:underline shrink-0">
                Open scrapbook →
              </Link>
            </div>
            <ScrapbookPreviewCard trip={recentTrips[0]} />
          </section>

          <section id="bucket-list" className="scroll-mt-24">
            <div className="flex items-center justify-between mb-4">
              <SectionHeading title="Bucket list" />
              <Link to="/bucket-list" className="text-sm font-medium text-accent-highlight hover:underline shrink-0">
                Manage bucket list →
              </Link>
            </div>
            {bucketListItems?.length || bucketMarkers.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(bucketListItems?.length ? bucketListItems : bucketMarkers).slice(0, 8).map((item) => (
                  <motion.div key={item.id} whileHover={{ y: -3 }} className="bg-card border border-line rounded-xl2 p-5 shadow-card">
                    <span className="w-2.5 h-2.5 rounded-full inline-block mb-2 bg-danger" />
                    <p className="font-display">{item.destination || item.label || 'Unnamed destination'}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState text="Add a destination to start your bucket list." />
            )}
          </section>

          <section id="notifications" className="scroll-mt-24 pb-4">
            <SectionHeading title="Notifications" />
            <div className="bg-card border border-line rounded-xl2 p-5 shadow-card max-w-lg">
              <RecentActivityFeed />
            </div>
          </section>
        </main>
      </div>

      <MobileBottomNav user={user} />

      <CreateMemoryModal
        position={pendingPosition}
        saving={createMarker.isPending || createMemory.isPending}
        onClose={() => setPendingPosition(null)}
        onSaveMarker={(payload) => createMarker.mutate(payload)}
        onSaveMemory={(payload) => createMemory.mutate(payload)}
      />
    </div>
  );
}

function SectionHeading({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-2xl">{title}</h2>
      {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
    </div>
  );
}

function TripCard({ trip }) {
  return (
    <Link
      to={`/trips/${trip.id}`}
      className="bg-card border border-line rounded-xl2 overflow-hidden shadow-card hover:shadow-soft hover:-translate-y-1 transition-all group"
    >
      <div
        className="h-36 bg-cover bg-center bg-bg-secondary group-hover:scale-105 transition-transform"
        style={{ backgroundImage: `url(${trip.coverImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=60&w=800'})` }}
      />
      <div className="p-4">
        <p className="font-display">{trip.title}</p>
        <p className="text-sm text-muted">{trip.country?.name || 'Somewhere new'} · {new Date(trip.startDate).toLocaleDateString()}</p>
      </div>
    </Link>
  );
}

function EmptyState({ text }) {
  return (
    <div className="bg-card border border-dashed border-line rounded-xl2 p-8 text-center text-muted text-sm">
      {text}
    </div>
  );
}
