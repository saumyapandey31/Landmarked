import { Crown } from 'lucide-react';

export default function GoPremiumCard() {
  return (
    <button className="w-full text-left rounded-xl2 p-4 border border-gold/30 bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex items-center gap-3">
      <span className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center shrink-0 shadow-gold">
        <Crown size={16} className="text-[#1B4332]" strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gold-light">Go Premium</p>
        <p className="text-[11px] text-ink/50 truncate">Unlock exclusive features</p>
      </div>
    </button>
  );
}
