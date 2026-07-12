import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function resolveTheme(pref) {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return pref;
}

function applyTheme(pref) {
  document.documentElement.dataset.theme = resolveTheme(pref);
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      preference: 'system', // 'light' | 'dark' | 'system'
      setPreference: (preference) => {
        set({ preference });
        applyTheme(preference);
      },
      // Called once on app boot, and again whenever the OS theme changes
      // while preference === 'system'.
      init: () => {
        applyTheme(get().preference);
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
          if (get().preference === 'system') applyTheme('system');
        });
      },
    }),
    { name: 'landmark-theme' }
  )
);
