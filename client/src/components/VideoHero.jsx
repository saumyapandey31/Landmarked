import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=70&w=1920';

export default function VideoHero() {
  return (
    <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
      {/* Background video — drop hero.mp4 into client/public/videos/ to replace the fallback image */}
      <video
        className="absolute inset-0 w-full h-full object-cover animate-[heroZoom_20s_ease-in-out_infinite_alternate]"
        autoPlay
        muted
        loop
        playsInline
        poster={FALLBACK_IMAGE}
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
        <source src="/videos/hero.webm" type="video/webm" />
      </video>

      {/* Cinematic gradient overlay for text legibility, matching the deep-green palette */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent-primary/70 via-accent-primary/30 to-accent-primary/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="uppercase tracking-[0.3em] text-xs md:text-sm text-gold font-medium mb-6"
        >
          Every place you've been. Every place you'll go.
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-medium text-white leading-[1.02] max-w-4xl"
        >
          Mark the world, one trip at a time.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 text-lg text-white/85 max-w-xl"
        >
          Drop a pin the moment a place matters to you. Landmarked turns it into a living globe,
          a travel journal, and a scrapbook worth reopening.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-10 flex items-center gap-4"
        >
          <Link
            to="/register"
            className="px-8 py-3.5 rounded-full bg-white text-accent-secondary font-medium shadow-soft hover:bg-white/90 transition-colors"
          >
            Start your journal
          </Link>
          <a
            href="#mark"
            className="px-8 py-3.5 rounded-full border border-white/40 text-white font-medium hover:bg-white/10 transition-colors"
          >
            See how marking works
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest text-white/70">Scroll</span>
        <div className="w-px h-10 bg-white/40 animate-pulse" />
      </motion.div>
    </section>
  );
}
