import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Plus, X, Trash2, Pencil, Search, CheckCircle2, Circle, Archive, Loader2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import MobileBottomNav from '../components/MobileBottomNav.jsx';
import TopBar from '../components/TopBar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];
const PRIORITY_META = {
  HIGH: { label: 'High', color: 'bg-danger/10 text-danger' },
  MEDIUM: { label: 'Medium', color: 'bg-warning/10 text-warning' },
  LOW: { label: 'Low', color: 'bg-sage/30 text-accent-primary' },
};
const CONTINENTS = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'priority', label: 'Priority' },
  { value: 'budget', label: 'Budget (low to high)' },
  { value: 'alphabetical', label: 'A → Z' },
];

export default function BucketList() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [continent, setContinent] = useState('');
  const [sort, setSort] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ['bucketList', user?.id, search, continent, sort, showArchived],
    queryFn: async () =>
      (await api.get('/bucket-list', {
        params: { userId: user.id, search, continent, sort, includeArchived: showArchived },
      })).data.items,
    enabled: !!user?.id,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['bucketList'] });

  const toggleComplete = useMutation({
    mutationFn: ({ id, isCompleted }) => api.put(`/bucket-list/${id}`, { isCompleted }),
    onSuccess: invalidate,
    onError: () => toast.error('Could not update this item'),
  });

  const archiveItem = useMutation({
    mutationFn: ({ id, isArchived }) => api.put(`/bucket-list/${id}`, { isArchived }),
    onSuccess: () => { toast.success('Updated'); invalidate(); },
    onError: () => toast.error('Could not update this item'),
  });

  const deleteItem = useMutation({
    mutationFn: (id) => api.delete(`/bucket-list/${id}`),
    onSuccess: () => { toast.success('Removed from bucket list'); invalidate(); },
    onError: () => toast.error('Could not delete this item'),
  });

  function handleDelete(item) {
    setPendingDelete(item);
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-20 lg:pb-0">
        <TopBar user={user} />

        <main className="px-4 md:px-8 py-8 max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl">Bucket list</h1>
              <p className="text-sm text-muted mt-0.5">Plan the trips you haven't taken yet.</p>
            </div>
            <button
              onClick={() => setEditingItem({})}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent-primary hover:bg-accent-highlight text-white text-sm font-medium transition-colors shadow-card"
            >
              <Plus size={15} /> Add destination
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-card border border-line rounded-xl2 p-3 shadow-card">
            <div className="flex items-center gap-2 flex-1 min-w-[180px] px-3 py-2 rounded-lg bg-bg-primary border border-line">
              <Search size={15} className="text-muted shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search destinations…" className="bg-transparent outline-none text-sm w-full" />
            </div>
            <select value={continent} onChange={(e) => setContinent(e.target.value)} className="text-sm rounded-lg border border-line bg-bg-primary px-3 py-2 outline-none">
              <option value="">All continents</option>
              {CONTINENTS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm rounded-lg border border-line bg-bg-primary px-3 py-2 outline-none">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
              <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
              Show archived
            </label>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-line/30 rounded-xl2 animate-pulse" />)}
            </div>
          ) : !items?.length ? (
            <div className="text-center py-20 border border-dashed border-line rounded-xl2 text-muted">
              Nothing here yet — add your first dream destination.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onEdit={setEditingItem}
                  onDelete={handleDelete}
                  onToggleComplete={() => toggleComplete.mutate({ id: item.id, isCompleted: !item.isCompleted })}
                  onArchive={() => archiveItem.mutate({ id: item.id, isArchived: !item.isArchived })}
                />
              ))}
            </div>
          )}
        </main>
      </div>
      <MobileBottomNav />

      {editingItem !== null && (
        <ItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={() => { setEditingItem(null); invalidate(); }}
        />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove this destination?"
        description={pendingDelete ? `"${pendingDelete.destination}" will be removed from your bucket list.` : ''}
        confirmLabel="Remove"
        onConfirm={() => { deleteItem.mutate(pendingDelete.id); setPendingDelete(null); }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function ItemRow({ item, onEdit, onDelete, onToggleComplete, onArchive }) {
  const priority = PRIORITY_META[item.priority] || PRIORITY_META.MEDIUM;
  return (
    <div className={`flex items-center gap-4 bg-card border border-line rounded-xl2 p-4 shadow-card ${item.isArchived ? 'opacity-50' : ''}`}>
      <button onClick={onToggleComplete} className="shrink-0 text-accent-primary">
        {item.isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} className="text-muted" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`font-medium ${item.isCompleted ? 'line-through text-muted' : ''}`}>{item.destination}</p>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priority.color}`}>{priority.label}</span>
          {item.isArchived && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-line text-muted">Archived</span>}
        </div>
        <p className="text-xs text-muted truncate mt-0.5">
          {[item.country, item.continent, item.bestSeason, item.travelType].filter(Boolean).join(' · ') || '—'}
          {item.estimatedBudget ? ` · ~$${Number(item.estimatedBudget).toLocaleString()}` : ''}
        </p>
        {item.notes && <p className="text-sm text-ink/70 mt-1.5 line-clamp-2">{item.notes}</p>}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onEdit(item)} className="p-2 rounded-md text-muted hover:bg-bg-secondary hover:text-ink"><Pencil size={15} /></button>
        <button onClick={onArchive} className="p-2 rounded-md text-muted hover:bg-bg-secondary hover:text-ink"><Archive size={15} /></button>
        <button onClick={() => onDelete(item)} className="p-2 rounded-md text-muted hover:bg-danger/10 hover:text-danger"><Trash2 size={15} /></button>
      </div>
    </div>
  );
}

function ItemModal({ item, onClose, onSaved }) {
  const isNew = !item?.id;
  const [form, setForm] = useState({
    destination: item?.destination || '',
    country: item?.country || '',
    continent: item?.continent || '',
    priority: item?.priority || 'MEDIUM',
    estimatedBudget: item?.estimatedBudget || '',
    bestSeason: item?.bestSeason || '',
    travelType: item?.travelType || '',
    notes: item?.notes || '',
  });
  const [errors, setErrors] = useState({});

  const saveItem = useMutation({
    mutationFn: (payload) =>
      isNew ? api.post('/bucket-list', payload) : api.put(`/bucket-list/${item.id}`, payload),
    onSuccess: () => {
      toast.success(isNew ? 'Added to bucket list' : 'Bucket list item updated');
      onSaved();
    },
    onError: (err) => {
      const validationErrors = err?.response?.data?.errors;
      if (validationErrors?.length) {
        const fieldErrors = {};
        validationErrors.forEach((e) => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      }
      toast.error(err?.response?.data?.message || 'Could not save this item');
    },
  });

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.destination.trim()) {
      setErrors({ destination: 'Destination is required' });
      return;
    }
    saveItem.mutate({
      ...form,
      estimatedBudget: form.estimatedBudget ? Number(form.estimatedBudget) : undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card border border-line rounded-xl2 shadow-soft w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl">{isNew ? 'Add a destination' : 'Edit destination'}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Destination</label>
            <input
              value={form.destination}
              onChange={(e) => set('destination', e.target.value)}
              className={`mt-1 w-full rounded-lg border bg-bg-primary px-3.5 py-2.5 outline-none ${errors.destination ? 'border-danger' : 'border-line'}`}
            />
            {errors.destination && <p className="text-xs text-danger mt-1">{errors.destination}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Country</label>
              <input value={form.country} onChange={(e) => set('country', e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium">Continent</label>
              <select value={form.continent} onChange={(e) => set('continent', e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none">
                <option value="">Select…</option>
                {CONTINENTS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none">
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Est. budget</label>
              <input type="number" min="0" value={form.estimatedBudget} onChange={(e) => set('estimatedBudget', e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium">Best season</label>
              <input value={form.bestSeason} onChange={(e) => set('bestSeason', e.target.value)} placeholder="e.g. Spring" className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Travel type</label>
            <input value={form.travelType} onChange={(e) => set('travelType', e.target.value)} placeholder="Solo, Family, Adventure…" className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
          </div>

          <button
            type="submit"
            disabled={saveItem.isPending}
            className="w-full py-3 rounded-full bg-accent-primary text-card font-medium shadow-card hover:bg-accent-secondary transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saveItem.isPending && <Loader2 size={16} className="animate-spin" />}
            {saveItem.isPending ? 'Saving…' : isNew ? 'Add to bucket list' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
