import { motion } from 'framer-motion';
import { Globe2 } from 'lucide-react';

const PIN_POSITIONS = [
  { top: '18%', left: '48%', color: '#40916C' },
  { top: '30%', left: '68%', color: '#E4772E' },
  { top: '32%', left: '22%', color: '#1E6FD9' },
  { top: '58%', left: '52%', color: '#C0392B' },
];

export default function HeroGlobeCard({ user, stats, trips = [], onMarkDestination }) {
  const pins = (trips.length ? trips : [null, null, null, null]).slice(0, 4);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <section className="grid lg:grid-cols-[1fr_260px] gap-4">
      <div
        className="relative rounded-xl2 overflow-hidden shadow-soft bg-cover bg-center bg-bg-secondary min-h-[380px] globe-frame"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=70&w=1600')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/40 via-transparent to-transparent" />

        <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-between">
          <div>
            <p className="text-ink/75 text-sm">{greeting},</p>
            <h1 className="text-3xl md:text-4xl font-display text-ink mt-1">
              {user?.name?.split(' ')[0] || 'Traveler'} <span className="not-italic">🌿</span>
            </h1>
            <p className="text-ink/65 text-sm mt-2">Where will you leave your mark today?</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onMarkDestination}
              className="px-5 py-2.5 rounded-full bg-accent-primary text-white text-sm font-medium shadow-card hover:bg-accent-highlight transition-colors"
            >
              + Mark a Destination
            </motion.button>
            <a
              href="#globe"
              className="px-5 py-2.5 rounded-full glass-dark text-ink text-sm font-medium flex items-center gap-2 hover:bg-white/5 transition-colors"
            >
              <Globe2 size={15} /> Explore Globe
            </a>
          </div>
        </div>

        {pins.map((trip, i) => (
          <motion.div
            key={trip?.id || i}
            initial={{ opacity: 0, y: -10, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
            className="absolute z-10 hidden sm:block"
            style={{ top: PIN_POSITIONS[i].top, left: PIN_POSITIONS[i].left }}
          >
            <div
              className="w-14 h-14 rounded-full border-4 bg-cover bg-center bg-bg-secondary shadow-soft"
              style={{
                borderColor: PIN_POSITIONS[i].color,
                backgroundImage: `url(${trip?.coverImageUrl || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=60&w=160'})`,
              }}
            />
            <div
              className="w-3 h-3 rotate-45 -mt-1.5 mx-auto"
              style={{ backgroundColor: PIN_POSITIONS[i].color }}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
        <StatBox label="Countries Visited" value={stats?.countriesVisited ?? 0} icon="🌍" delay={0} />
        <StatBox label="Trips Completed" value={stats?.totalTrips ?? 0} icon="🧳" delay={0.05} />
        <StatBox label="Stories Captured" value={stats?.storiesCaptured ?? 0} icon="📖" delay={0.1} />
        <StatBox label="Photos & Videos" value={stats?.mediaCount ?? 0} icon="📷" delay={0.15} />
      </div>
    </section>
  );
}

function StatBox({ label, value, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -2 }}
      className="bg-card border border-line rounded-xl2 p-4 flex items-center justify-between shadow-card"
    >
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-2xl font-display mt-0.5">{value}</p>
      </div>
      <span className="text-2xl opacity-80">{icon}</span>
    </motion.div>
  );
}
