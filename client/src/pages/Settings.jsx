import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User, ShieldCheck, Palette, Bell, Lock, MonitorSmartphone,
  Loader2, Camera, Sun, Moon, Laptop,
} from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import MobileBottomNav from '../components/MobileBottomNav.jsx';
import TopBar from '../components/TopBar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import api from '../services/api';
import { uploadImage } from '../services/uploads';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
  { id: 'security', label: 'Security', icon: MonitorSmartphone },
];

export default function Settings() {
  const { user, setSession, logout } = useAuthStore();
  const [tab, setTab] = useState('profile');

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-20 lg:pb-0">
        <TopBar user={user} />

        <main className="px-4 md:px-8 py-8 max-w-4xl mx-auto">
          <h1 className="font-display text-3xl mb-1">Settings</h1>
          <p className="text-sm text-muted mb-8">Manage your profile, account, and preferences.</p>

          <div className="flex gap-6">
            <nav className="hidden md:flex flex-col gap-1 w-48 shrink-0" aria-label="Settings sections">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  aria-current={tab === id}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                    tab === id ? 'bg-accent-primary text-white font-medium' : 'text-ink/70 hover:bg-bg-secondary'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>

            <div className="md:hidden mb-2 flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium border transition-colors ${
                    tab === id ? 'bg-accent-primary text-white border-accent-primary' : 'border-line text-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 min-w-0 bg-card border border-line rounded-xl2 shadow-card p-6">
              {tab === 'profile' && <ProfileTab user={user} onSaved={(u) => setSession(useAuthStore.getState().token, u)} />}
              {tab === 'account' && <AccountTab user={user} onLogout={logout} />}
              {tab === 'appearance' && <AppearanceTab />}
              {tab === 'notifications' && <NotificationsTab />}
              {tab === 'privacy' && <PrivacyTab user={user} onSaved={(u) => setSession(useAuthStore.getState().token, u)} />}
              {tab === 'security' && <SecurityTab onLogoutAll={logout} />}
            </div>
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

function FieldRow({ label, children, hint }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

function SaveButton({ pending, children = 'Save changes' }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-primary text-white text-sm font-medium shadow-card hover:bg-accent-highlight transition-colors disabled:opacity-60"
    >
      {pending && <Loader2 size={15} className="animate-spin" />}
      {pending ? 'Saving…' : children}
    </button>
  );
}

// ---------- Profile ----------
function ProfileTab({ user, onSaved }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    country: user?.country || '',
    travelPreferences: user?.travelPreferences || '',
  });
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const save = useMutation({
    mutationFn: (payload) => api.put('/users/me', payload),
    onSuccess: (res) => {
      toast.success('Profile updated');
      onSaved(res.data.user);
    },
    onError: (err) => {
      setErrors({ username: err?.response?.status === 409 ? err.response.data.message : undefined });
      toast.error(err?.response?.data?.message || 'Could not update your profile');
    },
  });

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setAvatarUrl(url);
      toast.success('Photo uploaded');
    } catch {
      toast.error('Photo upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    save.mutate({ ...form, avatarUrl });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'Traveler')}&background=0F3D2E&color=fff`}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border border-line"
          />
          <label className="absolute -bottom-1 -right-1 bg-accent-primary text-white rounded-full p-1.5 cursor-pointer shadow-card">
            <Camera size={13} />
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={uploading} />
          </label>
        </div>
        {uploading && <p className="text-xs text-muted flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Uploading…</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FieldRow label="Full name">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-accent-highlight" required />
        </FieldRow>
        <FieldRow label="Username" hint={errors.username}>
          <input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} className={`w-full rounded-lg border bg-bg-primary px-3.5 py-2.5 outline-none ${errors.username ? 'border-danger' : 'border-line'}`} placeholder="yourname" />
        </FieldRow>
      </div>

      <FieldRow label="Email" hint="Contact support to change your email address.">
        <input value={user?.email || ''} disabled className="w-full rounded-lg border border-line bg-bg-secondary px-3.5 py-2.5 outline-none text-muted" />
      </FieldRow>

      <FieldRow label="Bio">
        <textarea rows={3} maxLength={280} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} className="w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-accent-highlight" />
      </FieldRow>

      <div className="grid sm:grid-cols-2 gap-4">
        <FieldRow label="Country">
          <input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
        </FieldRow>
        <FieldRow label="Travel preferences" hint="Comma-separated, e.g. Hiking, Food, Solo travel">
          <input value={form.travelPreferences} onChange={(e) => setForm((f) => ({ ...f, travelPreferences: e.target.value }))} className="w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
        </FieldRow>
      </div>

      <SaveButton pending={save.isPending} />
    </form>
  );
}

// ---------- Account ----------
function AccountTab({ user, onLogout }) {
  const navigate = useNavigate();
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const changePassword = useMutation({
    mutationFn: (payload) => api.put('/auth/change-password', payload),
    onSuccess: (res) => {
      toast.success('Password changed. Other devices have been signed out.');
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
      if (res.data?.token) useAuthStore.getState().setSession(res.data.token, user);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Could not change your password'),
  });

  const deleteAccount = useMutation({
    mutationFn: () => api.delete('/users/me'),
    onSuccess: () => {
      toast.success('Your account has been deleted');
      onLogout();
      navigate('/');
    },
    onError: () => toast.error('Could not delete your account'),
  });

  function handleChangePassword(e) {
    e.preventDefault();
    if (pw.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (pw.newPassword !== pw.confirmPassword) return toast.error('Passwords do not match');
    changePassword.mutate({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleChangePassword} className="space-y-4">
        <h3 className="font-display text-lg">Change password</h3>
        <FieldRow label="Current password">
          <input type="password" required value={pw.currentPassword} onChange={(e) => setPw((f) => ({ ...f, currentPassword: e.target.value }))} className="w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
        </FieldRow>
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldRow label="New password" hint="At least 8 characters">
            <input type="password" required value={pw.newPassword} onChange={(e) => setPw((f) => ({ ...f, newPassword: e.target.value }))} className="w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
          </FieldRow>
          <FieldRow label="Confirm new password">
            <input type="password" required value={pw.confirmPassword} onChange={(e) => setPw((f) => ({ ...f, confirmPassword: e.target.value }))} className="w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
          </FieldRow>
        </div>
        <SaveButton pending={changePassword.isPending}>Update password</SaveButton>
      </form>

      <div className="border-t border-line pt-8">
        <h3 className="font-display text-lg text-danger">Delete account</h3>
        <p className="text-sm text-muted mt-1 mb-3 max-w-md">
          Permanently deletes your account, journals, scrapbook, and bucket list. This can't be undone.
        </p>
        <button
          onClick={() => setConfirmDelete(true)}
          className="px-5 py-2.5 rounded-full border border-danger text-danger text-sm font-medium hover:bg-danger/5 transition-colors"
        >
          Delete my account
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your account?"
        description="This permanently removes your journals, scrapbook entries, and bucket list. This action cannot be undone."
        confirmLabel="Delete account"
        onConfirm={() => { setConfirmDelete(false); deleteAccount.mutate(); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

// ---------- Appearance ----------
function AppearanceTab() {
  const { preference, setPreference } = useThemeStore();
  const options = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <div>
      <h3 className="font-display text-lg mb-1">Theme</h3>
      <p className="text-sm text-muted mb-4">Your preference is saved and persists across sessions.</p>
      <div className="grid grid-cols-3 gap-3 max-w-sm">
        {options.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setPreference(id); toast.success(`${label} theme applied`); }}
            aria-pressed={preference === id}
            className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-sm transition-colors ${
              preference === id ? 'border-accent-primary bg-accent-highlight/10 font-medium' : 'border-line hover:bg-bg-secondary'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Notifications ----------
function NotificationsTab() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get('/users/me/settings')).data.settings,
  });

  const save = useMutation({
    mutationFn: (payload) => api.put('/users/me/settings', payload),
    onSuccess: () => {
      toast.success('Notification settings saved');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => toast.error('Could not save notification settings'),
  });

  const TOGGLES = [
    { key: 'emailNotifications', label: 'Email notifications', hint: 'Comments, likes, and activity on your journals' },
    { key: 'journalReminders', label: 'Journal reminders', hint: 'Nudges to write about a recent trip' },
    { key: 'travelReminders', label: 'Travel reminders', hint: 'Upcoming trip and bucket-list reminders' },
    { key: 'marketingEmails', label: 'Marketing emails', hint: 'Product news and occasional offers' },
  ];

  if (isLoading) return <SkeletonLines />;

  return (
    <div className="space-y-1 divide-y divide-line">
      {TOGGLES.map(({ key, label, hint }) => (
        <ToggleRow
          key={key}
          label={label}
          hint={hint}
          checked={!!settings?.[key]}
          onChange={(checked) => save.mutate({ ...settings, [key]: checked })}
        />
      ))}
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted mt-0.5">{hint}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-accent-primary' : 'bg-line'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

// ---------- Privacy ----------
function PrivacyTab({ user, onSaved }) {
  const options = [
    { value: 'PUBLIC', label: 'Public', hint: 'Anyone can see your profile and journals' },
    { value: 'FRIENDS_ONLY', label: 'Friends only', hint: 'Only people you follow back can see your journals' },
    { value: 'PRIVATE', label: 'Private', hint: 'Only you can see your profile and journals' },
  ];

  const save = useMutation({
    mutationFn: (visibility) => api.put('/users/me', { profileVisibility: visibility }),
    onSuccess: (res) => {
      toast.success('Privacy settings saved');
      onSaved(res.data.user);
    },
    onError: () => toast.error('Could not save privacy settings'),
  });

  return (
    <div>
      <h3 className="font-display text-lg mb-1">Profile visibility</h3>
      <p className="text-sm text-muted mb-4">Choose who can see your profile and public journals.</p>
      <div className="space-y-2 max-w-md">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
              user?.profileVisibility === opt.value ? 'border-accent-primary bg-accent-highlight/5' : 'border-line hover:bg-bg-secondary'
            }`}
          >
            <input
              type="radio"
              name="visibility"
              className="mt-1"
              checked={user?.profileVisibility === opt.value}
              onChange={() => save.mutate(opt.value)}
            />
            <div>
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="text-xs text-muted">{opt.hint}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

// ---------- Security ----------
function SecurityTab({ onLogoutAll }) {
  const navigate = useNavigate();
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => (await api.get('/auth/sessions')).data,
  });

  const logoutAll = useMutation({
    mutationFn: () => api.post('/auth/logout-all-devices'),
    onSuccess: () => {
      toast.success('Logged out of all devices');
      onLogoutAll();
      navigate('/login');
    },
    onError: () => toast.error('Could not log out of all devices'),
  });

  if (isLoading) return <SkeletonLines />;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-lg mb-1">Last login</h3>
        <p className="text-sm text-muted">
          {data?.lastLogin ? new Date(data.lastLogin).toLocaleString() : 'No recent login recorded'}
        </p>
      </div>

      <div>
        <h3 className="font-display text-lg mb-3">Active sessions</h3>
        {!data?.sessions?.length ? (
          <p className="text-sm text-muted">No session history yet.</p>
        ) : (
          <div className="space-y-2">
            {data.sessions.slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-line text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{s.userAgent || 'Unknown device'}</p>
                  <p className="text-xs text-muted">{new Date(s.createdAt).toLocaleString()} · {s.ipAddress || 'Unknown IP'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="font-display text-lg text-danger mb-1">Logout from all devices</h3>
        <p className="text-sm text-muted mb-3 max-w-md">
          Immediately signs you out everywhere, including this device.
        </p>
        <button
          onClick={() => setConfirmLogoutAll(true)}
          className="px-5 py-2.5 rounded-full border border-danger text-danger text-sm font-medium hover:bg-danger/5 transition-colors"
        >
          Logout everywhere
        </button>
      </div>

      <ConfirmDialog
        open={confirmLogoutAll}
        title="Logout from all devices?"
        description="You'll need to sign in again on every device, including this one."
        confirmLabel="Logout everywhere"
        onConfirm={() => { setConfirmLogoutAll(false); logoutAll.mutate(); }}
        onCancel={() => setConfirmLogoutAll(false)}
      />
    </div>
  );
}

function SkeletonLines() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-line/40 rounded-lg animate-pulse" />)}
    </div>
  );
}
