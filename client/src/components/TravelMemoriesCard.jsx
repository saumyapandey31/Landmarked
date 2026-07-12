import { Link } from 'react-router-dom';

export default function TravelMemoriesCard({ photos = [] }) {
  return (
    <div className="bg-card border border-line rounded-xl2 p-5 shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Travel Memories</h3>
        <Link to="/dashboard#scrapbook" className="text-xs text-accent-highlight hover:underline">Scrapbook</Link>
      </div>

      {!photos.length ? (
        <p className="text-sm text-muted flex-1 flex items-center">
          Photos you add to trips will appear here as a quick preview.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 flex-1">
          {photos.slice(0, 6).map((photo, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-cover bg-center bg-bg-secondary border border-line"
              style={{ backgroundImage: `url(${photo})` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
