import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordField from '../components/PasswordField.jsx';

const REMEMBER_KEY = 'landmarked_remembered_email';

export default function Login() {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [remember, setRemember] = useState(true);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) setValue('email', saved);
  }, [setValue]);

  async function onSubmit(data) {
    setServerError('');
    try {
      const res = await api.post('/auth/login', data);

      if (remember) localStorage.setItem(REMEMBER_KEY, data.email);
      else localStorage.removeItem(REMEMBER_KEY);

      setSession(res.data.token, res.data.user);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to your journal"
      subtitle="Pick up your travel story right where you left off."
      footer={
        <p className="text-sm text-center text-muted">
          New to Landmarked?{' '}
          <Link to="/register" className="text-accent-highlight font-medium hover:underline">Create an account</Link>
        </p>
      }
    >
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
              <CheckCircle2 size={52} className="text-accent-highlight" />
            </motion.div>
            <p className="mt-4 font-display text-lg">Welcome back!</p>
            <p className="text-sm text-muted mt-1">Taking you to your dashboard…</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                })}
                className="mt-1 w-full rounded-lg border border-line bg-black/[0.03] px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent-highlight transition-shadow"
              />
              {errors.email && <p className="text-sm text-danger mt-1">{errors.email.message}</p>}
            </div>

            <PasswordField
              label="Password"
              autoComplete="current-password"
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message}
            />

            {serverError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-danger">
                {serverError}
              </motion.p>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-line accent-accent-primary"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-accent-highlight hover:underline">Forgot password?</Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-accent-primary text-white font-medium shadow-card hover:bg-accent-highlight transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
