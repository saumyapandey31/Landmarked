import { motion } from 'framer-motion';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function TravelStreakCard({ streak = 0, activeDays = [] }) {
  // activeDays: array of 7 booleans for this week, Monday-first. Falls back
  // to lighting up the most recent `streak` days when no explicit log exists.
  const days = activeDays.length === 7
    ? activeDays
    : DAY_LABELS.map((_, i) => i >= 7 - Math.min(streak, 7));

  return (
    <div className="rounded-xl2 p-4 bg-card-glass border border-line shadow-card">
      <p className="text-xs font-medium text-ink/70 flex items-center gap-1.5">
        <span className="text-base">🔥</span> Travel Streak
      </p>
      <p className="font-display text-2xl mt-1">
        {streak} <span className="text-sm font-body font-normal text-muted">days in a row</span>
      </p>

      <div className="grid grid-cols-7 gap-1.5 mt-3">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="text-center">
            <p className="text-[9px] text-muted mb-1">{label}</p>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`w-full aspect-square rounded-md flex items-center justify-center text-[10px] ${
                days[i] ? 'bg-accent-primary text-white' : 'bg-white/5 text-transparent'
              }`}
            >
              {days[i] ? '✓' : ''}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
