import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function UpcomingTripsCard({ trips = [] }) {
  return (
    <div className="bg-card border border-line rounded-xl2 p-5 shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Upcoming Trips</h3>
        <Link to="/trips/new" className="text-xs text-accent-highlight hover:underline">+ Plan a trip</Link>
      </div>

      {!trips.length ? (
        <p className="text-sm text-muted flex-1 flex items-center">Nothing planned yet — start a new trip journal.</p>
      ) : (
        <div className="space-y-3 flex-1">
          {trips.slice(0, 3).map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link to={`/trips/${trip.id}`} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{trip.title}</p>
                  <p className="text-xs text-muted truncate">{trip.country?.name || 'Somewhere new'}</p>
                </div>
                <span className="text-xs font-medium text-accent-secondary bg-sage/20 px-2.5 py-1 rounded-full shrink-0">
                  {new Date(trip.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
