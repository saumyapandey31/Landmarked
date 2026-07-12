import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mountain } from 'lucide-react';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1600',
    quote: 'Collect memories, not just places.',
    place: 'Machu Picchu, Peru',
  },
  {
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1600',
    quote: 'Every trip becomes a chapter worth rereading.',
    place: 'Santorini, Greece',
  },
  {
    image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1600',
    quote: 'The world is a book — keep turning the page.',
    place: 'Kyoto, Japan',
  },
];

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left: cinematic slideshow */}
      <div className="hidden lg:block relative w-1/2 overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.div
            key={slide}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${SLIDES[slide].image})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/50" />

        <Link to="/" className="relative z-10 flex items-center gap-2.5 p-10">
          <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
            <Mountain size={20} className="text-gold" strokeWidth={2.2} />
          </span>
          <span className="font-display text-xl text-white">Landmarked</span>
        </Link>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-display text-3xl text-white leading-snug max-w-md">{SLIDES[slide].quote}</p>
              <p className="text-sm text-white/60 mt-3">{SLIDES[slide].place}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-1.5 mt-6">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1 rounded-full transition-all ${i === slide ? 'w-8 bg-gold' : 'w-3 bg-white/30'}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <Mountain size={20} className="text-gold" strokeWidth={2.2} />
            <span className="font-display text-lg">Landmarked</span>
          </Link>

          {eyebrow && <p className="text-xs uppercase tracking-widest text-gold font-medium mb-2">{eyebrow}</p>}
          <h1 className="text-3xl font-display">{title}</h1>
          {subtitle && <p className="text-muted text-sm mt-2">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
