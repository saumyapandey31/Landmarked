import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ScrapbookPreviewCard({ trip }) {
  return (
    <div className="bg-card border border-line rounded-xl2 p-4 shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Trip Scrapbook</p>
        <Link to="/scrapbook" className="text-xs text-accent-highlight hover:underline">View all</Link>
      </div>

      {!trip ? (
        <div className="flex-1 flex items-center justify-center text-center text-xs text-muted py-10 border border-dashed border-line rounded-xl">
          Create your first trip to unlock the scrapbook.
        </div>
      ) : (
        <motion.div whileHover={{ y: -2 }} className="relative flex-1">
          <Link
            to={`/trips/${trip.id}`}
            className="relative flex-1 rounded-xl2 overflow-hidden p-5 min-h-[220px] block shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
            style={{ background: 'linear-gradient(135deg, #f4ecd8 0%, #ece0c4 100%)' }}
          >
            <p className="font-display text-lg text-brown">{trip.title}</p>
            <p className="text-[11px] text-brown/70 mt-1">
              {new Date(trip.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <p className="text-xs text-brown/80 italic mt-3 max-w-[60%] line-clamp-3">
              {trip.story ? `"${trip.story.slice(0, 90)}${trip.story.length > 90 ? '…' : ''}"` : 'Every corner has a story to tell.'}
            </p>

            {trip.media?.[0] && (
              <div
                className="absolute bottom-4 right-4 w-24 h-16 rounded-md shadow-md bg-cover bg-center bg-sand rotate-3 border-4 border-white"
                style={{ backgroundImage: `url(${trip.media[0].url})` }}
              />
            )}
            {trip.media?.[1] && (
              <div
                className="absolute bottom-10 right-16 w-16 h-20 rounded-md shadow-md bg-cover bg-center bg-sand -rotate-6 border-4 border-white"
                style={{ backgroundImage: `url(${trip.media[1].url})` }}
              />
            )}

            {/* stitched binding edge, evokes a notebook spine */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-brown/10 border-r border-dashed border-brown/20" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
