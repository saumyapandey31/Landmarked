import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function BucketListCard({ items = [], markers = [] }) {
  const list = items.length ? items : markers;
  return (
    <div className="bg-card border border-line rounded-xl2 p-5 shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Bucket List</h3>
        <Link to="/bucket-list" className="text-xs text-accent-highlight hover:underline">View all</Link>
      </div>

      {!list.length ? (
        <p className="text-sm text-muted flex-1 flex items-center">
          Add a destination to start your bucket list.
        </p>
      ) : (
        <div className="space-y-2.5 flex-1">
          {list.slice(0, 4).map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2.5 text-sm"
            >
              <Heart size={14} className="text-danger shrink-0" fill="currentColor" strokeWidth={0} />
              <span className="truncate">{m.destination || m.label || 'Unnamed destination'}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
