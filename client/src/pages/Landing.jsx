import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import VideoHero from '../components/VideoHero.jsx';
import MarkFeatureSpotlight from '../components/MarkFeatureSpotlight.jsx';

const FEATURES = [
  { title: 'Interactive 3D Globe', desc: 'Rotate, zoom, and fly to any place on Earth — it drifts and glows like a living planet, not a flat map.' },
  { title: 'Living Travel Journals', desc: 'Turn every trip into a story — weather, expenses, timeline, and photos woven together automatically.' },
  { title: 'The Travel Scrapbook', desc: 'A hardcover, page-turning photo album that feels like flipping through a real memory book.' },
  { title: 'A Community of Travelers', desc: 'Follow friends, discover trending destinations, and see where the world is headed next.' },
];

const DESTINATIONS = ['Kyoto, Japan', 'Santorini, Greece', 'Cusco, Peru', 'Reykjavík, Iceland'];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar transparent />
      <VideoHero />

      {/* Features */}
      <section id="features" className="py-28 px-6 md:px-10 max-w-7xl mx-auto">
        <p className="uppercase tracking-[0.25em] text-xs text-accent-secondary font-medium mb-4 text-center">
          Why Landmarked
        </p>
        <h2 className="text-3xl md:text-4xl font-display text-center mb-16 max-w-2xl mx-auto">
          Built for people who remember trips, not just visit them
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card border border-line rounded-xl2 p-8 shadow-card hover:shadow-soft hover:-translate-y-1 transition-all"
            >
              <h3 className="text-xl font-display mb-2 text-accent-primary">{f.title}</h3>
              <p className="text-ink/70">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <MarkFeatureSpotlight />

      {/* Trending Destinations */}
      <section id="destinations" className="py-28 px-6 md:px-10 bg-bg-secondary/40">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase tracking-[0.25em] text-xs text-accent-secondary font-medium mb-4">
            Trending this season
          </p>
          <h2 className="text-3xl md:text-4xl font-display mb-12">Where travelers are marking right now</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {DESTINATIONS.map((d, i) => (
              <motion.div
                key={d}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-card rounded-xl2 p-6 border border-line shadow-card hover:shadow-soft transition-shadow"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-accent-primary mb-3" />
                <p className="font-display text-lg">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stories */}
      <section id="stories" className="py-28 px-6 md:px-10 max-w-7xl mx-auto">
        <p className="uppercase tracking-[0.25em] text-xs text-accent-secondary font-medium mb-4">
          Community stories
        </p>
        <h2 className="text-3xl md:text-4xl font-display mb-12">Told by the people who lived them</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl2 p-6 border border-line shadow-card">
              <p className="text-ink/70 italic">
                "Landmarked made me actually go back and relive our Japan trip — the scrapbook feature
                is unreal."
              </p>
              <p className="mt-4 text-sm font-medium">— A Landmarked traveler</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 md:px-10 bg-deep-gradient text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ['120K+', 'Trips Logged'],
            ['190', 'Countries Explored'],
            ['3.2M', 'Photos Preserved'],
            ['45K', 'Active Travelers'],
          ].map(([num, label]) => (
            <div key={label}>
              <p className="text-4xl font-display">{num}</p>
              <p className="text-sm text-white/70 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 md:px-10 text-center">
        <h2 className="text-3xl md:text-4xl font-display mb-6">Your next trip deserves a home.</h2>
        <Link
          to="/register"
          className="inline-block px-8 py-3 rounded-full bg-accent-primary text-white font-medium shadow-soft hover:bg-accent-highlight transition-colors"
        >
          Create your travel journal
        </Link>
      </section>

      <footer className="border-t border-line py-10 px-6 md:px-10 text-center text-sm text-ink/60">
        © {new Date().getFullYear()} Landmarked. Made for travelers who remember.
      </footer>
    </div>
  );
}
