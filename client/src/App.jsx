import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TripCreate from './pages/TripCreate.jsx';
import StoryPage from './pages/StoryPage.jsx';
import Profile from './pages/Profile.jsx';
import Explore from './pages/Explore.jsx';

// Lazy-loaded: heavier, less-frequently-entered pages don't need to be in
// the initial bundle.
const Scrapbook = lazy(() => import('./pages/Scrapbook.jsx'));
const BucketList = lazy(() => import('./pages/BucketList.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PageFallback() {
  return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-muted">Loading…</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/new"
        element={
          <ProtectedRoute>
            <TripCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:id/edit"
        element={
          <ProtectedRoute>
            <TripCreate />
          </ProtectedRoute>
        }
      />
      <Route path="/trips/:id" element={<StoryPage />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/explore" element={<Explore />} />
      <Route
        path="/scrapbook"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <Scrapbook />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bucket-list"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <BucketList />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <Settings />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
