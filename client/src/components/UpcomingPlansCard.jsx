import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const BADGE_STYLES = {
  Planned: 'bg-accent-primary/20 text-accent-highlight',
  'Bucket List': 'bg-gold/15 text-gold',
};

export default function UpcomingPlansCard({ items = [] }) {
  return (
    <div className="bg-card border border-line rounded-xl2 p-4 shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Upcoming Plans</p>
        <Link to="/dashboard#trips" className="text-xs text-accent-highlight hover:underline">View all</Link>
      </div>

      {!items.length ? (
        <div className="flex-1 flex items-center justify-center text-center text-xs text-muted py-8 border border-dashed border-line rounded-xl">
          Plan a trip or add a wishlist marker to see it here.
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {items.slice(0, 3).map((item, i) => (
            <motion.div
              key={`${item.badge}-${item.id}`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link to={item.to} className="flex items-center gap-3 group">
                <div
                  className="w-14 h-14 rounded-lg bg-cover bg-center bg-bg-secondary shrink-0 border border-line group-hover:scale-105 transition-transform"
                  style={{ backgroundImage: `url(${item.image || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=60&w=200'})` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-[11px] text-muted truncate">{item.subtitle}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-1 rounded-full shrink-0 ${BADGE_STYLES[item.badge] || 'bg-white/10 text-ink/70'}`}>
                  {item.badge}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <Link
        to="/trips/new"
        className="mt-4 block text-center py-2.5 rounded-full bg-accent-primary hover:bg-accent-highlight text-white text-sm font-medium transition-colors"
      >
        + Plan a New Trip
      </Link>
    </div>
  );
}
