import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      switch (response.status) {
        case 400:
          toast.error(response.data?.message || "Bad Request");
          break;

        case 401: {
          const authStore = useAuthStore.getState();

          if (authStore.isAuthenticated) {
            authStore.logout();

            toast.error("Your session has expired. Please log in again.");

            if (!window.location.pathname.startsWith("/login")) {
              window.location.href = "/login?expired=1";
            }
          }
          break;
        }

        case 403:
          toast.error(response.data?.message || "Access denied.");
          break;

        case 404:
          toast.error(response.data?.message || "Resource not found.");
          break;

        case 500:
          toast.error(response.data?.message || "Internal Server Error.");
          break;

        default:
          toast.error(response.data?.message || "Something went wrong.");
      }
    } else {
      toast.error("Unable to connect to the server.");
    }

    return Promise.reject(error);
  }
);

export default api;