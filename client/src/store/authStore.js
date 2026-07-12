import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Lightweight JWT payload decode — no signature verification needed here,
// this only reads the "exp" claim client-side to schedule an automatic
// logout; the server is still the source of truth for actual auth checks.
function decodeJwtExp(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

let expiryTimer = null;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setSession: (token, user) => {
        set({ token, user, isAuthenticated: true });
        get().scheduleAutoLogout(token);
      },

      // Full, secure logout: clears in-memory state (which the zustand
      // `persist` middleware immediately mirrors to localStorage), plus
      // anything we've ever put in sessionStorage, and cancels any pending
      // auto-logout timer so it doesn't fire again after a fresh login.
      logout: () => {
        clearTimeout(expiryTimer);
        set({ token: null, user: null, isAuthenticated: false });
        sessionStorage.clear();
      },

      scheduleAutoLogout: (token) => {
        clearTimeout(expiryTimer);
        const expiresAt = decodeJwtExp(token);
        if (!expiresAt) return;
        const msUntilExpiry = expiresAt - Date.now();
        if (msUntilExpiry <= 0) {
          get().logout();
          return;
        }
        expiryTimer = setTimeout(() => {
          get().logout();
          if (!window.location.pathname.startsWith('/login')) {
            window.location.assign('/login?expired=1');
          }
        }, msUntilExpiry);
      },
    }),
    {
      name: 'landmark-auth',
      onRehydrateStorage: () => (state) => {
        // On every app boot (refresh), re-arm the expiry timer for
        // whatever token survived from the last session, and log out
        // immediately if it already expired while the tab was closed.
        if (state?.token) state.scheduleAutoLogout(state.token);
      },
    }
  )
);
