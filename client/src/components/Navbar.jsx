import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar({ transparent = false }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8">
      <nav
        className={`max-w-6xl mx-auto flex items-center justify-between rounded-full px-4 md:px-6 py-3 transition-colors ${
          transparent ? 'glass-dark' : 'glass'
        }`}
      >
        <Link
          to="/"
          className={`font-display text-xl tracking-tight ${transparent ? 'text-white' : 'text-accent-primary'}`}
        >
          Landmarked
        </Link>

        <div className={`hidden md:flex items-center gap-7 text-sm font-medium ${transparent ? 'text-white/80' : 'text-ink/80'}`}>
          <a href="#features" className="hover:opacity-70 transition-opacity">Features</a>
          <a href="#mark" className="hover:opacity-70 transition-opacity">Mark Destinations</a>
          <a href="#destinations" className="hover:opacity-70 transition-opacity">Destinations</a>
          <Link to="/explore" className="hover:opacity-70 transition-opacity">Explore</Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2 rounded-full bg-accent-primary text-white text-sm font-medium shadow-card hover:bg-accent-highlight transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className={`hidden sm:inline text-sm font-medium hover:opacity-70 transition-opacity ${transparent ? 'text-white' : 'text-ink'}`}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-full bg-accent-primary text-white text-sm font-medium shadow-card hover:bg-accent-highlight transition-colors"
              >
                Start marking
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
