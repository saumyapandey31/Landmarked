import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Compass, Globe2, Briefcase, Clapperboard, BookImage, Heart,
  Clock, Users, Bell, Settings, LogOut, Mountain, Crown,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const NAV_ITEMS = [
  { icon: LayoutGrid, label: 'Dashboard', to: '/dashboard' },
  { icon: Compass, label: 'Explore', to: '/explore' },
  { icon: Globe2, label: 'Globe', to: '/dashboard#globe' },
  { icon: Briefcase, label: 'My Trips', to: '/dashboard#trips' },
  { icon: Clapperboard, label: 'Stories', soon: true },
  { icon: BookImage, label: 'Scrapbook', to: '/scrapbook' },
  { icon: Heart, label: 'Bucket List', to: '/bucket-list' },
  { icon: Clock, label: 'Timeline', to: '/dashboard#timeline' },
  { icon: Users, label: 'Friends', soon: true },
];

export default function Sidebar({ notificationCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const current = location.pathname + location.hash;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-deep-gradient text-white/90 px-4 py-6">
      <Link to="/" className="flex items-center gap-2.5 px-2 mb-9">
        <span className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
          <Mountain size={17} className="text-sage" strokeWidth={2.2} />
        </span>
        <div className="leading-tight">
          <p className="font-display text-lg text-white">Landmarked</p>
          <p className="text-[10px] text-white/50">Collect memories, not just places.</p>
        </div>
      </Link>

      <nav className="space-y-0.5 flex-1">
        {NAV_ITEMS.map(({ icon: Icon, label, to, soon }) => {
          if (soon) {
            return (
              <span
                key={label}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-white/30 cursor-default"
              >
                <span className="flex items-center gap-3">
                  <Icon size={17} strokeWidth={1.8} />
                  {label}
                </span>
                <span className="text-[9px] uppercase tracking-wide border border-white/15 rounded-full px-1.5 py-0.5">Soon</span>
              </span>
            );
          }
          const active = current === to || (to === '/dashboard' && location.pathname === '/dashboard' && !location.hash);
          return (
            <Link
              key={label}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}

        <Link
          to="/dashboard#notifications"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-3">
            <Bell size={17} strokeWidth={1.8} />
            Notifications
          </span>
          {notificationCount > 0 && (
            <span className="text-[10px] bg-sage text-[#0F3D2E] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </Link>

        <Link
          to="/settings"
          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
            location.pathname === '/settings' ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-3">
            <Settings size={17} strokeWidth={1.8} />
            Settings
          </span>
        </Link>
      </nav>

      <div className="space-y-2 pt-4 mt-2 border-t border-white/10">
        <button className="w-full text-left rounded-xl p-3 border border-sage/25 bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center shrink-0">
            <Crown size={14} className="text-sage" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white">Go Premium</p>
            <p className="text-[10px] text-white/45 truncate">Unlock exclusive features</p>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/55 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut size={17} strokeWidth={1.8} />
          Logout
        </button>
      </div>
    </aside>
  );
}
