import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, MailCheck } from 'lucide-react';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout.jsx';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState('');
  const navigate = useNavigate();

  async function onSubmit(data) {
    try {
      const res = await api.post('/auth/forgot-password', data);
      setSent(true);
      // This project doesn't send real emails yet — the API returns the
      // reset token directly for local development. In production this
      // should be emailed instead of shown here.
      if (res.data?.resetToken) setDevToken(res.data.resetToken);
    } catch {
      setSent(true);
    }
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Reset your password"
      subtitle="We'll get you back into your journal."
      footer={
        <p className="text-sm text-center text-muted">
          Remembered it? <Link to="/login" className="text-accent-highlight font-medium hover:underline">Back to login</Link>
        </p>
      }
    >
      {sent ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-start gap-3 bg-card border border-line rounded-xl2 p-4">
            <MailCheck size={20} className="text-accent-highlight shrink-0 mt-0.5" />
            <p className="text-sm text-ink/80">If that email exists, a reset link has been sent.</p>
          </div>

          {devToken && (
            <div className="bg-gold/10 border border-gold/30 rounded-xl2 p-4 text-sm">
              <p className="text-gold font-medium mb-1">No email service is configured yet</p>
              <p className="text-ink/70 text-xs mb-3">
                For now, use this link directly to continue the reset flow.
              </p>
              <button
                onClick={() => navigate(`/reset-password?token=${devToken}`)}
                className="text-xs font-medium text-accent-highlight hover:underline break-all text-left"
              >
                Continue to reset password →
              </button>
            </div>
          )}
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              {...register('email', { required: true })}
              className="mt-1 w-full rounded-lg border border-line bg-black/[0.03] px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent-highlight transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-accent-primary text-white font-medium shadow-card hover:bg-accent-highlight transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Send reset link
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
