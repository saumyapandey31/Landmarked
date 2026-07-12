import { Link } from 'react-router-dom';

export default function TravelJournalCard({ trip }) {
  return (
    <div className="bg-card border border-line rounded-xl2 p-5 shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Travel Journal</h3>
        {trip && (
          <Link to={`/trips/${trip.id}`} className="text-xs text-accent-highlight hover:underline">Read more</Link>
        )}
      </div>

      {!trip?.story ? (
        <p className="text-sm text-muted flex-1 flex items-center">
          Add a story to one of your trips and it'll be featured here.
        </p>
      ) : (
        <Link to={`/trips/${trip.id}`} className="flex-1 flex flex-col justify-between group">
          <div>
            <p className="font-display text-base leading-snug text-ink/90 italic">
              “{trip.story.slice(0, 140)}{trip.story.length > 140 ? '…' : ''}”
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div
              className="w-10 h-10 rounded-full bg-cover bg-center bg-bg-secondary border border-line group-hover:scale-105 transition-transform"
              style={{ backgroundImage: `url(${trip.coverImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=60&w=200'})` }}
            />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{trip.title}</p>
              <p className="text-[11px] text-muted truncate">{trip.country?.name || 'Somewhere new'}</p>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
