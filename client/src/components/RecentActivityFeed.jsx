import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ICONS = {
  LIKE: '❤️',
  COMMENT: '💬',
  FOLLOW: '👋',
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 3600) return `${Math.max(1, Math.round(diff / 60))}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export default function RecentActivityFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data.notifications,
  });

  return (
    <div className="bg-card border border-line rounded-xl2 p-4 shadow-card h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">Recent Activity</p>
        <Link to="/dashboard#notifications" className="text-xs text-accent-highlight hover:underline">View all</Link>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full skeleton shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-3/4 rounded skeleton" />
                <div className="h-2 w-1/3 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <p className="text-xs text-muted">
          Nothing yet — activity shows up here when people like, comment on, or follow you.
        </p>
      )}

      <div className="space-y-3">
        {data?.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3"
          >
            <img
              src={n.actor?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(n.actor?.name || '?')}`}
              alt=""
              className="w-8 h-8 rounded-full object-cover mt-0.5 border border-line"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-ink/80">
                <span className="font-medium text-ink">{n.actor?.name || 'Someone'}</span> {n.message}
              </p>
              <p className="text-[10px] text-muted mt-0.5">{timeAgo(n.createdAt)}</p>
            </div>
            <span className="text-sm">{ICONS[n.type] || '🔔'}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
