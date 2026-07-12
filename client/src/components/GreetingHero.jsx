import { motion } from 'framer-motion';

export default function GreetingHero({ name, stats }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const items = [
    { label: 'Countries visited', value: stats?.countriesVisited ?? 0 },
    { label: 'Trips completed', value: stats?.totalTrips ?? 0 },
    { label: 'Stories captured', value: stats?.storiesCaptured ?? 0 },
    { label: 'Photos & videos', value: stats?.mediaCount ?? 0 },
  ];

  return (
    <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-2">
      <div>
        <p className="text-muted text-sm">{greeting},</p>
        <h1 className="text-4xl font-display mt-1">{name?.split(' ')[0] || 'Traveler'}</h1>
        <p className="text-muted text-sm mt-2 max-w-sm">Where will you leave your mark today?</p>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-3">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <p className="text-2xl font-display text-accent-primary">{item.value}</p>
            <p className="text-xs text-muted mt-0.5 whitespace-nowrap">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
