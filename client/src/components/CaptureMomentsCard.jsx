import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function CaptureMomentsCard() {
  const navigate = useNavigate();

  return (
    <div
      className="relative rounded-xl2 overflow-hidden shadow-card border border-line min-h-[220px] flex flex-col justify-end p-6 bg-cover bg-center bg-bg-secondary"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=70&w=900')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
      <div className="relative">
        <p className="font-display text-2xl leading-tight">Capture Beautiful Moments</p>
        <p className="text-sm text-white/70 mt-2 max-w-xs">
          Upload photos, videos and create stories from your incredible journeys.
        </p>
        <button
          onClick={() => navigate('/trips/new')}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-primary hover:bg-accent-highlight text-white text-sm font-medium transition-colors shadow-card"
        >
          <Plus size={16} /> Create Story
        </button>
      </div>
    </div>
  );
}
