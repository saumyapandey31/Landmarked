import { Plus } from 'lucide-react';
import InteractiveGlobe from './InteractiveGlobe.jsx';
import CurrencyWidget from './CurrencyWidget.jsx';

const TYPE_META = {
  VISITED: { label: 'Visited', color: '#0F3D2E' },
  WANT_TO_VISIT: { label: 'Planned', color: '#2D6A4F' },
  CURRENTLY_TRAVELLING: { label: 'Current trip', color: '#F59E0B' },
  BUCKET_LIST: { label: 'Wishlist', color: '#EF4444' },
};

export default function GlobeShowcaseCard({ markers, homeCurrency, onMapClick, onMarkerClick, onMarkDestination }) {
  return (
    <section id="globe" className="scroll-mt-24 bg-card border border-line rounded-xl2 shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div>
          <h2 className="font-display text-2xl">Your world</h2>
          <p className="text-sm text-muted mt-0.5">Click anywhere on the globe to mark a place</p>
        </div>
        <button
          onClick={onMarkDestination}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent-primary hover:bg-accent-highlight text-white text-sm font-medium transition-colors shadow-card"
        >
          <Plus size={15} /> Mark a Destination
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-4 p-6 pt-4">
        <div className="h-[50vh] lg:h-[460px] rounded-xl overflow-hidden border border-line">
          <InteractiveGlobe markers={markers || []} onMapClick={onMapClick} onMarkerClick={onMarkerClick} />
        </div>
        <aside className="space-y-4">
          <CurrencyWidget homeCurrency={homeCurrency || 'USD'} />
          <div className="bg-bg-secondary border border-line rounded-xl2 p-5">
            <p className="text-xs uppercase tracking-wide text-muted mb-3">Marker legend</p>
            <div className="space-y-2">
              {Object.entries(TYPE_META).map(([key, meta]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                  {meta.label}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
