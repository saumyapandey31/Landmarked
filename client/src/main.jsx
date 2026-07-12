import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { useThemeStore } from './store/themeStore';
import './index.css';

useThemeStore.getState().init();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0F3D2E',
              color: '#FAF9F7',
              borderRadius: '9999px',
              padding: '10px 18px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 10px 30px -12px rgba(15, 61, 46, 0.4)',
            },
            success: { iconTheme: { primary: '#3E8F68', secondary: '#FAF9F7' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#FAF9F7' } },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
