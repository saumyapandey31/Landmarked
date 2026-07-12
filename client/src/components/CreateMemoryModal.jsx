import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reverseGeocode } from '../utils/geocode';

const TYPES = [
  { value: 'VISITED', label: 'Visited', color: '#2E7D32', emoji: '✅' },
  { value: 'WANT_TO_VISIT', label: 'Planned', color: '#1E6FD9', emoji: '📍' },
  { value: 'CURRENTLY_TRAVELLING', label: 'Current Trip', color: '#E4772E', emoji: '✈️' },
  { value: 'BUCKET_LIST', label: 'Wishlist', color: '#C0392B', emoji: '💫' },
];

const MOODS = ['🤩 Amazing', '😊 Happy', '😌 Peaceful', '🥾 Adventurous', '😴 Relaxing'];

/**
 * Click-anywhere-to-mark flow:
 * 1. User clicks the globe → we reverse geocode the coordinates automatically
 *    (no manual lat/lon entry).
 * 2. User picks a marker type.
 * 3. If "Visited", a minimal form appears (date, mood, photo) and saving
 *    creates both the TravelMarker AND a Trip journal in one step, against
 *    the existing /markers and /trips APIs — no backend changes.
 */
export default function CreateMemoryModal({ position, onClose, onSaveMarker, onSaveMemory, saving }) {
  const [place, setPlace] = useState(null);
  const [loadingPlace, setLoadingPlace] = useState(false);
  const [type, setType] = useState('VISITED');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mood, setMood] = useState(MOODS[0]);
  const [photo, setPhoto] = useState('');

  useEffect(() => {
    if (!position) return;
    setPlace(null);
    setLoadingPlace(true);
    reverseGeocode(position.lat, position.lon).then((result) => {
      setPlace(result);
      setLoadingPlace(false);
    });
  }, [position]);

  if (!position) return null;

  function handleSave() {
    if (type === 'VISITED') {
      onSaveMemory({
        title: place?.label || 'New memory',
        latitude: position.lat,
        longitude: position.lon,
        startDate: date,
        notes: mood,
        coverImageUrl: photo || undefined,
        privacy: 'PUBLIC',
        markerLabel: place?.label,
      });
    } else {
      onSaveMarker({
        type,
        label: place?.label,
        latitude: position.lat,
        longitude: position.lon,
      });
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-accent-primary/40 backdrop-blur-sm flex items-center justify-center z-50 px-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-xl2 shadow-soft w-full max-w-md overflow-hidden"
        >
          <div className="bg-deep-gradient px-6 py-5 text-white">
            <p className="text-xs uppercase tracking-widest text-gold mb-1">New landmark</p>
            {loadingPlace ? (
              <div className="h-7 w-40 bg-white/10 rounded animate-pulse" />
            ) : (
              <h3 className="font-display text-2xl">{place?.label}</h3>
            )}
            <p className="text-xs text-white/60 mt-1">
              {position.lat.toFixed(3)}, {position.lon.toFixed(3)}
            </p>
          </div>

          <div className="p-6">
            <p className="text-sm font-medium mb-2">What is this place to you?</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                    type === t.value ? 'border-accent-primary bg-accent-highlight/10' : 'border-line'
                  }`}
                >
                  <span>{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {type === 'VISITED' && (
                <motion.div
                  key="memory-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-ink/60">Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-line bg-black/[0.03] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-highlight"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink/60">Mood</label>
                      <select
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-line bg-black/[0.03] px-3 py-2 text-sm outline-none"
                      >
                        {MOODS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink/60">Photo URL (optional)</label>
                    <input
                      value={photo}
                      onChange={(e) => setPhoto(e.target.value)}
                      placeholder="Paste a cover photo link"
                      className="mt-1 w-full rounded-lg border border-line bg-black/[0.03] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-highlight"
                    />
                  </div>
                  <p className="text-xs text-ink/50">
                    This creates a full trip journal you can keep building on later.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-line text-sm font-medium">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loadingPlace}
                className="flex-1 py-2.5 rounded-full bg-accent-primary text-white text-sm font-medium shadow-card hover:bg-accent-highlight transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving…' : type === 'VISITED' ? 'Create memory' : 'Add marker'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
