import { motion } from 'framer-motion';

export default function AchievementCard({ title, description, xp, imageUrl }) {
  if (!title) return null;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="relative rounded-xl2 overflow-hidden shadow-card border border-line min-h-[128px] flex flex-col justify-end p-4 bg-cover bg-center bg-bg-secondary"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
      <div className="relative">
        <p className="text-[10px] uppercase tracking-wide text-gold font-medium">New Achievement</p>
        <p className="font-display text-base leading-tight mt-0.5">{title}</p>
        <p className="text-[11px] text-white/70 mt-0.5">{description}</p>
        <span className="inline-block mt-2 text-[11px] font-semibold text-accent-highlight">+{xp} XP</span>
      </div>
    </motion.div>
  );
}
