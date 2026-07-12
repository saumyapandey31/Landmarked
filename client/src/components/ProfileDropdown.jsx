import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, LayoutDashboard, Settings, HelpCircle, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function ProfileDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const itemRefs = useRef([]);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const items = [
    { label: 'Profile', icon: User, to: `/profile/${user?.id || ''}` },
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Settings', icon: Settings, to: '/settings' },
    { label: 'Help', icon: HelpCircle, to: '/help' },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  function handleMenuKeyDown(e, index) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      itemRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      itemRefs.current[index - 1]?.focus();
    }
  }

  function handleLogout() {
    logout();
    setOpen(false);
    toast.success("You've been logged out");
    navigate('/login');
  }

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-1 rounded-full hover:bg-bg-secondary transition-colors"
      >
        <img
          src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Traveler')}&background=0F3D2E&color=fff`}
          alt={user?.name}
          className="w-9 h-9 rounded-full object-cover border border-line"
        />
        <div className="hidden sm:block leading-tight text-left">
          <p className="text-sm font-medium">{user?.name || 'Traveler'}</p>
          <p className="text-xs text-muted">View profile</p>
        </div>
        <ChevronDown size={16} className={`text-muted ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-card border border-line rounded-xl2 shadow-soft py-2 z-50"
          >
            {items.map(({ label, icon: Icon, to }, i) => (
              <Link
                key={label}
                ref={(el) => (itemRefs.current[i] = el)}
                to={to}
                role="menuitem"
                onClick={() => setOpen(false)}
                onKeyDown={(e) => handleMenuKeyDown(e, i)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors"
              >
                <Icon size={16} className="text-muted" />
                {label}
              </Link>
            ))}
            <div className="h-px bg-line my-1.5" />
            <button
              ref={(el) => (itemRefs.current[items.length] = el)}
              role="menuitem"
              onClick={handleLogout}
              onKeyDown={(e) => handleMenuKeyDown(e, items.length)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors"
            >
              <LogOut size={16} />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
