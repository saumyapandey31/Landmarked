import { Link } from 'react-router-dom';
import { MapPin, PenLine, ImagePlus, Map } from 'lucide-react';

export default function ContinueJourneyCard({ trip }) {
  if (!trip) {
    return (
      <div className="bg-card border border-dashed border-line rounded-xl2 p-6 h-full flex flex-col items-center justify-center text-center">
        <p className="text-sm font-medium">No journey in progress</p>
        <p className="text-xs text-ink/50 mt-1">Plan a trip to see it here.</p>
      </div>
    );
  }

  const start = new Date(trip.startDate);
  const end = trip.endDate ? new Date(trip.endDate) : start;
  const now = new Date();
  const total = Math.max(1, end - start);
  const progress = Math.min(100, Math.max(0, Math.round(((now - start) / total) * 100)));

  return (
    <div className="bg-card border border-line rounded-xl2 overflow-hidden shadow-card h-full flex flex-col">
      <p className="flex items-center gap-1.5 text-sm font-medium px-4 pt-4">
        <MapPin size={15} className="text-accent-primary" /> Continue Your Journey
      </p>

      <Link to={`/trips/${trip.id}`} className="relative mt-3 mx-4 rounded-xl2 overflow-hidden h-40 block group bg-bg-secondary">
        <div
          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform"
          style={{ backgroundImage: `url(${trip.coverImageUrl || 'https://images.unsplash.com/photo-1502786129293-79981df4e689?q=60&w=800'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-2 left-3 text-ink">
          <p className="font-display text-lg">{trip.title}</p>
          <p className="text-xs text-ink/70">
            {start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – {end.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </Link>

      <div className="px-4 mt-3">
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gold-gradient transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[11px] text-ink/50 mt-1">{progress}% Completed</p>
      </div>

      <div className="grid grid-cols-4 gap-1 px-3 py-4 mt-auto text-center">
        <QuickAction icon={Map} label="View Trip" to={`/trips/${trip.id}`} />
        <QuickAction icon={PenLine} label="Add Story" to={`/trips/${trip.id}`} />
        <QuickAction icon={ImagePlus} label="Add Photos" to={`/trips/${trip.id}`} />
        <QuickAction icon={MapPin} label="View Map" to={`/trips/${trip.id}`} />
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, to }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1 text-ink/60 hover:text-accent-primary transition-colors">
      <span className="w-9 h-9 rounded-full bg-bg-primary flex items-center justify-center">
        <Icon size={15} />
      </span>
      <span className="text-[10px]">{label}</span>
    </Link>
  );
}
