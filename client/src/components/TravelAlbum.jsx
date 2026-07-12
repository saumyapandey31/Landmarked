import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A hardcover scrapbook-style photo album.
 * `media` is an array of { url, caption } trip media items, grouped two-per-page (left/right).
 */
export default function TravelAlbum({ media = [], tripTitle }) {
  const [opened, setOpened] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  // Preload all photos once the album mounts, so flipping pages never shows
  // a blank tile mid-animation — this was the main cause of "janky" scrapbook loads.
  useEffect(() => {
    media.forEach((item) => {
      if (!item?.url) return;
      const img = new Image();
      img.src = item.url;
    });
  }, [media]);

  const pages = [];
  for (let i = 0; i < media.length; i += 2) {
    pages.push([media[i], media[i + 1]]);
  }

  if (!media.length) {
    return (
      <div className="rounded-xl2 border border-line bg-card p-10 text-center text-ink/60">
        No photos yet — add some to unlock the travel scrapbook.
      </div>
    );
  }

  if (!opened) {
    return (
      <button
        onClick={() => setOpened(true)}
        className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-xl2 shadow-soft overflow-hidden group"
        style={{
          background: 'linear-gradient(135deg, #3b2a1a 0%, #5a4130 60%, #3b2a1a 100%)',
        }}
      >
        <div className="absolute inset-4 border-2 border-[#c9a86a]/60 rounded-lg flex items-center justify-center">
          <span className="font-display text-2xl text-[#e8dcc0] tracking-wide text-center px-6">
            {tripTitle || 'Travel Memories'}
          </span>
        </div>
        <span className="absolute bottom-4 right-4 text-xs text-[#e8dcc0]/70 group-hover:text-[#e8dcc0] transition-colors">
          Tap to open →
        </span>
      </button>
    );
  }

  const [left, right] = pages[pageIndex] || [];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative bg-[#3b2a1a] rounded-xl2 shadow-soft p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pageIndex}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-3 bg-[#f4ecd8] rounded-lg p-4 min-h-[360px]"
          >
            <AlbumPage item={left} />
            <AlbumPage item={right} />
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndex === 0}
            className="px-4 py-2 rounded-full bg-[#e8dcc0] text-[#3b2a1a] text-sm font-medium disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-[#e8dcc0] text-sm">
            Page {pageIndex + 1} of {pages.length}
          </span>
          <button
            onClick={() => setPageIndex((p) => Math.min(pages.length - 1, p + 1))}
            disabled={pageIndex === pages.length - 1}
            className="px-4 py-2 rounded-full bg-[#e8dcc0] text-[#3b2a1a] text-sm font-medium disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

function AlbumPage({ item }) {
  if (!item) return <div />;
  return (
    <div className="relative bg-white p-2 pb-8 shadow-md rotate-[-1deg] rounded-sm">
      <img
        src={item.url}
        alt={item.caption || ''}
        loading="lazy"
        decoding="async"
        className="w-full h-40 object-cover rounded-sm bg-sand"
      />
      {item.caption && (
        <p className="absolute bottom-1 left-2 right-2 text-xs font-display text-[#3b2a1a] truncate">
          {item.caption}
        </p>
      )}
    </div>
  );
}
