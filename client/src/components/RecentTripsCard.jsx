import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function RecentTripsCard({ trips = [] }) {
  return (
    <div className="bg-card border border-line rounded-xl2 p-5 shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Recent Trips</h3>
        <Link to="/dashboard#trips" className="text-xs text-accent-highlight hover:underline">View all</Link>
      </div>

      {!trips.length ? (
        <p className="text-sm text-muted flex-1 flex items-center">Your completed trips will show up here.</p>
      ) : (
        <div className="space-y-3 flex-1">
          {trips.slice(0, 3).map((trip, i) => (
            <motion.div key={trip.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Link to={`/trips/${trip.id}`} className="flex items-center gap-3 group">
                <div
                  className="w-14 h-14 rounded-lg bg-cover bg-center bg-bg-secondary shrink-0 border border-line group-hover:scale-105 transition-transform"
                  style={{ backgroundImage: `url(${trip.coverImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=60&w=300'})` }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{trip.title}</p>
                  <p className="text-xs text-muted truncate">
                    {trip.country?.name || 'Somewhere new'} · {new Date(trip.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
