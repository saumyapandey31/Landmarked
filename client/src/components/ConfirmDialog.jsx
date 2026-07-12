import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open, title = 'Are you sure?', description, confirmLabel = 'Delete', cancelLabel = 'Cancel',
  tone = 'danger', onConfirm, onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    function handleKey(e) {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel, onConfirm]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-line rounded-xl2 shadow-soft w-full max-w-sm p-6"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${tone === 'danger' ? 'bg-danger/10 text-danger' : 'bg-accent-highlight/10 text-accent-primary'}`}>
              <AlertTriangle size={18} />
            </div>
            <h3 id="confirm-dialog-title" className="font-display text-lg">{title}</h3>
            {description && <p className="text-sm text-muted mt-1.5">{description}</p>}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-full border border-line text-sm font-medium hover:bg-bg-secondary transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                onClick={onConfirm}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium text-white transition-colors ${
                  tone === 'danger' ? 'bg-danger hover:bg-danger/90' : 'bg-accent-primary hover:bg-accent-highlight'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
