import { Mountain, MapPin, Globe2 } from 'lucide-react';

// Illustrative — derived from real counts rather than a dedicated
// achievements table, since the backend doesn't expose one yet
// (the Prisma schema has Achievement/UserAchievement tables, but no
// route reads or writes them).
export default function AchievementsCard({ countriesVisited = 0, tripsCompleted = 0 }) {
  const badges = [
    { icon: MapPin, label: 'First Trip', earned: tripsCompleted >= 1 },
    { icon: Globe2, label: 'Explorer', earned: countriesVisited >= 3 },
    { icon: Mountain, label: 'Globetrotter', earned: countriesVisited >= 5 },
  ];

  return (
    <div className="bg-card border border-line rounded-xl2 p-5 shadow-card h-full">
      <h3 className="font-display text-lg mb-4">Achievements</h3>
      <div className="space-y-3">
        {badges.map(({ icon: Icon, label, earned }) => (
          <div key={label} className="flex items-center gap-3">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${earned ? 'bg-accent-primary/10 text-accent-primary' : 'bg-bg-secondary text-muted'}`}>
              <Icon size={15} strokeWidth={1.8} />
            </span>
            <p className={`text-sm ${earned ? 'text-ink' : 'text-muted'}`}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
