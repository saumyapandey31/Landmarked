import { motion } from 'framer-motion';

const MARKER_TYPES = [
  { label: 'Visited', color: '#235347', desc: 'Every place you\'ve actually stood in.' },
  { label: 'Want to Visit', color: '#E4572E', desc: 'The places on your radar, waiting.' },
  { label: 'Currently Travelling', color: '#D4AC0D', desc: 'Where you are, right now.' },
  { label: 'Bucket List', color: '#7B4FA6', desc: 'The dream destinations you\'re working toward.' },
];

export default function MarkFeatureSpotlight() {
  return (
    <section id="mark" className="relative py-28 px-6 md:px-10 bg-deep-gradient overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
        <div>
          <p className="uppercase tracking-[0.25em] text-xs text-sage font-medium mb-4">
            The signature feature
          </p>
          <h2 className="text-4xl md:text-5xl font-display text-white leading-tight">
            Click anywhere on Earth. Mark it. It's yours.
          </h2>
          <p className="mt-6 text-white/75 text-lg max-w-md">
            No forms, no menus buried three clicks deep. Tap a spot on the globe, choose what it
            means to you, and watch your travel map come alive in real time.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 max-w-md">
            {MARKER_TYPES.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-dark rounded-xl2 p-4"
              >
                <span
                  className="inline-block w-3 h-3 rounded-full mb-2"
                  style={{ backgroundColor: t.color, boxShadow: `0 0 12px ${t.color}` }}
                />
                <p className="text-white font-display text-base">{t.label}</p>
                <p className="text-white/60 text-xs mt-1">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative aspect-square rounded-full mx-auto w-full max-w-md"
          style={{
            background: 'radial-gradient(circle at 35% 30%, #235347 0%, #163832 45%, #051F20 100%)',
            boxShadow: '0 0 120px -20px rgba(35, 83, 71, 0.8), inset -20px -20px 60px rgba(5,31,32,0.6)',
          }}
        >
          {/* orbiting marker dots to suggest the interactive globe without embedding another live Cesium instance */}
          {MARKER_TYPES.map((t, i) => (
            <span
              key={t.label}
              className="absolute w-3.5 h-3.5 rounded-full animate-pulse"
              style={{
                backgroundColor: t.color,
                boxShadow: `0 0 14px ${t.color}`,
                top: `${20 + i * 18}%`,
                left: `${25 + (i % 2) * 45}%`,
              }}
            />
          ))}
          <div className="absolute inset-0 rounded-full border border-white/20" />
        </motion.div>
      </div>
    </section>
  );
}
