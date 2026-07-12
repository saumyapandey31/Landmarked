import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function TripTimeline({ trips = [] }) {
  const sorted = [...trips].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  if (!sorted.length) {
    return (
      <div className="bg-card border border-dashed border-line rounded-xl2 p-8 text-center text-muted text-sm">
        Your journeys will appear here in chronological order once you log a trip.
      </div>
    );
  }

  return (
    <div className="bg-card border border-line rounded-xl2 p-5 md:p-6 shadow-card">
      <div className="relative pl-6 border-l border-line space-y-6">
        {sorted.map((trip, i) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: Math.min(i, 6) * 0.05 }}
            className="relative"
          >
            <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-accent-primary border-2 border-bg-primary shadow-[0_0_0_3px_rgba(64,145,108,0.25)]" />
            <Link to={`/trips/${trip.id}`} className="flex gap-4 group">
              <div
                className="w-16 h-16 rounded-lg bg-cover bg-center bg-bg-secondary shrink-0 border border-line group-hover:scale-105 transition-transform"
                style={{ backgroundImage: `url(${trip.coverImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=60&w=400'})` }}
              />
              <div className="min-w-0">
                <p className="text-xs text-gold font-medium">
                  {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </p>
                <p className="font-display text-base mt-0.5 truncate">{trip.title}</p>
                <p className="text-xs text-muted truncate">{trip.country?.name || 'Somewhere new'}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
