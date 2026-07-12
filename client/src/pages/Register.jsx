import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordField from '../components/PasswordField.jsx';

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  async function onSubmit({ name, email, password }) {
    setServerError('');
    try {
      const res = await api.post('/auth/register', { name, email, password });
      setSession(res.data.token, res.data.user);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Start your travel journal"
      subtitle="A few details and your globe is ready."
      footer={
        <p className="text-sm text-center text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-highlight font-medium hover:underline">Log in</Link>
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
            <p className="mt-4 font-display text-lg">Account created!</p>
            <p className="text-sm text-muted mt-1">Setting up your dashboard…</p>
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
              <label className="text-sm font-medium">Full name</label>
              <input
                autoComplete="name"
                {...register('name', { required: 'Name is required' })}
                className="mt-1 w-full rounded-lg border border-line bg-black/[0.03] px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent-highlight transition-shadow"
              />
              {errors.name && <p className="text-sm text-danger mt-1">{errors.name.message}</p>}
            </div>

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
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'At least 6 characters' },
              })}
              error={errors.password?.message}
            />

            <PasswordField
              label="Confirm password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === watch('password') || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />

            <label className="flex items-start gap-2 text-xs text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('terms', { required: 'Please accept the terms to continue' })}
                className="mt-0.5 rounded border-line accent-accent-primary"
              />
              I agree to the Terms of Service and Privacy Policy.
            </label>
            {errors.terms && <p className="text-sm text-danger">{errors.terms.message}</p>}

            {serverError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-danger">
                {serverError}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-accent-primary text-white font-medium shadow-card hover:bg-accent-highlight transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
