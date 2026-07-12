import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const wasAuthenticated = useAuthStore.getState().isAuthenticated;
      useAuthStore.getState().logout();
      // Only bounce to /login (and only once) if the user actually had a
      // session that just got invalidated — an anonymous 401 on a public
      // page (e.g. optionalAuth routes) shouldn't force a redirect.
      if (wasAuthenticated && !window.location.pathname.startsWith('/login')) {
        toast.error('Your session has expired. Please log in again.');
        window.location.assign('/login?expired=1');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
