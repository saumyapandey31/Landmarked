import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordField from '../components/PasswordField.jsx';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  async function onSubmit({ newPassword }) {
    setServerError('');
    try {
      await api.post('/auth/reset-password', { resetToken: token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setServerError(err.response?.data?.message || 'That reset link is invalid or has expired.');
    }
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Choose a new password"
      subtitle="Make it something you haven't used before."
      footer={
        <p className="text-sm text-center text-muted">
          <Link to="/login" className="text-accent-highlight font-medium hover:underline">Back to login</Link>
        </p>
      }
    >
      {!token ? (
        <p className="text-sm text-danger">
          This link is missing its reset token. Request a new one from the{' '}
          <Link to="/forgot-password" className="underline">forgot password</Link> page.
        </p>
      ) : (
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
              <p className="mt-4 font-display text-lg">Password updated!</p>
              <p className="text-sm text-muted mt-1">Taking you to login…</p>
            </motion.div>
          ) : (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <PasswordField
                label="New password"
                autoComplete="new-password"
                {...register('newPassword', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
                })}
                error={errors.newPassword?.message}
              />
              <PasswordField
                label="Confirm new password"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) => v === watch('newPassword') || 'Passwords do not match',
                })}
                error={errors.confirmPassword?.message}
              />

              {serverError && <p className="text-sm text-danger">{serverError}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-full bg-accent-primary text-white font-medium shadow-card hover:bg-accent-highlight transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Update password
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      )}
    </AuthLayout>
  );
}
