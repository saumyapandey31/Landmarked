import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Globe2, Compass, ListChecks, User } from 'lucide-react';

const ITEMS = [
  { icon: LayoutGrid, label: 'Home', to: '/dashboard' },
  { icon: Globe2, label: 'Globe', to: '/dashboard#globe' },
  { icon: Compass, label: 'Explore', to: '/explore' },
  { icon: ListChecks, label: 'Bucket', to: '/bucket-list' },
];

export default function MobileBottomNav({ user }) {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-line px-2 py-2 flex items-center justify-around">
      {ITEMS.map(({ icon: Icon, label, to }) => {
        const active = location.pathname + location.hash === to;
        return (
          <Link
            key={label}
            to={to}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium ${
              active ? 'text-accent-primary' : 'text-muted'
            }`}
          >
            <Icon size={20} strokeWidth={1.8} />
            {label}
          </Link>
        );
      })}
      <Link
        to={`/profile/${user?.id || ''}`}
        className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium text-muted"
      >
        <User size={20} strokeWidth={1.8} />
        Profile
      </Link>
    </nav>
  );
}
