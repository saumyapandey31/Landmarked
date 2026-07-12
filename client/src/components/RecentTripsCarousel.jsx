import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function RecentTripsCarousel({ trips = [] }) {
  const trackRef = useRef(null);

  function scrollBy(dir) {
    trackRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  }

  return (
    <div className="bg-card border border-line rounded-xl2 p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Recent Trips</p>
        <div className="flex items-center gap-2">
          <Link to="/dashboard#trips" className="text-xs text-accent-highlight hover:underline mr-1">View all</Link>
          <button onClick={() => scrollBy(-1)} className="w-7 h-7 rounded-full border border-line flex items-center justify-center hover:bg-white/5 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => scrollBy(1)} className="w-7 h-7 rounded-full border border-line flex items-center justify-center hover:bg-white/5 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {!trips.length ? (
        <div className="text-center text-xs text-muted py-10 border border-dashed border-line rounded-xl">
          Your completed trips will show up here.
        </div>
      ) : (
        <div ref={trackRef} className="flex gap-4 overflow-x-auto scrollbar-none pb-1 snap-x">
          {trips.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={`/trips/${trip.id}`}
                className="block w-44 shrink-0 snap-start rounded-xl overflow-hidden border border-line group bg-bg-secondary"
              >
                <div className="h-28 overflow-hidden">
                  <div
                    className="h-full w-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundImage: `url(${trip.coverImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=60&w=600'})` }}
                  />
                </div>
                <div className="p-3">
                  <p className="font-display text-sm truncate">{trip.title}</p>
                  <p className="text-[11px] text-muted mt-0.5 truncate">
                    {trip.country?.name || 'Somewhere new'} · {new Date(trip.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {trip.rating ? (
                    <p className="flex items-center gap-1 text-[11px] text-gold mt-1.5">
                      <Star size={11} fill="currentColor" strokeWidth={0} /> {trip.rating.toFixed(1)}
                    </p>
                  ) : null}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
