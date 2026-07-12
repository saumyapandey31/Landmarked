import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = forwardRef(function PasswordField({ label, error, className = '', ...props }, ref) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="relative mt-1">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className="w-full rounded-lg border border-line bg-black/[0.03] px-4 py-2.5 pr-11 outline-none focus:ring-2 focus:ring-accent-highlight transition-shadow"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70 transition-colors"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && <p className="text-sm text-danger mt-1">{error}</p>}
    </div>
  );
});

export default PasswordField;
