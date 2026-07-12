import { motion } from 'framer-motion';

const QUOTE = {
  text: 'The world is a book, and those who do not travel read only one page.',
  author: 'Saint Augustine',
};

export default function TravelHighlightsBar({ highlights = [] }) {
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <div className="bg-card border border-line rounded-xl2 p-5 shadow-card">
        <p className="text-sm font-medium mb-4">Your Travel Highlights</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {highlights.map((h, i) => (
            <motion.div
              key={h.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-center sm:text-left"
            >
              <p className="text-2xl mb-1">{h.icon}</p>
              <p className="font-display text-xl">{h.value}</p>
              <p className="text-[11px] text-muted">{h.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl2 p-6 flex items-center bg-cover bg-center bg-bg-secondary relative overflow-hidden min-h-[140px]"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=60&w=800')" }}
      >
        <div className="absolute inset-0 bg-deep-gradient opacity-90" />
        <p className="relative text-ink font-display text-lg leading-snug">
          “{QUOTE.text}”
          <span className="block text-xs text-muted mt-3 font-body not-italic">— {QUOTE.author}</span>
        </p>
      </div>
    </div>
  );
}
