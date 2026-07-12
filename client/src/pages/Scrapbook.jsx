import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Plus, X, Trash2, Pencil, Search, LayoutGrid, Rows3, Clock, ImagePlus,
  ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import MobileBottomNav from '../components/MobileBottomNav.jsx';
import TopBar from '../components/TopBar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import api from '../services/api';
import { uploadImages } from '../services/uploads';
import { useAuthStore } from '../store/authStore';

const VIEW_MODES = [
  { id: 'grid', icon: LayoutGrid, label: 'Grid' },
  { id: 'masonry', icon: Rows3, label: 'Masonry' },
  { id: 'timeline', icon: Clock, label: 'Timeline' },
];

export default function Scrapbook() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [year, setYear] = useState('');
  const [view, setView] = useState('grid');
  const [editingEntry, setEditingEntry] = useState(null); // null = closed, {} = new
  const [lightbox, setLightbox] = useState(null); // { images, index }
  const [pendingDelete, setPendingDelete] = useState(null);

  const { data: entries, isLoading } = useQuery({
    queryKey: ['scrapbook', user?.id, search, country, year],
    queryFn: async () =>
      (await api.get('/scrapbook', { params: { userId: user.id, search, country, year } })).data.entries,
    enabled: !!user?.id,
  });

  const countries = useMemo(
    () => [...new Set((entries || []).map((e) => e.country).filter(Boolean))].sort(),
    [entries]
  );
  const years = useMemo(
    () => [...new Set((entries || []).map((e) => e.travelDate && new Date(e.travelDate).getFullYear()).filter(Boolean))].sort((a, b) => b - a),
    [entries]
  );

  const deleteEntry = useMutation({
    mutationFn: (id) => api.delete(`/scrapbook/${id}`),
    onSuccess: () => {
      toast.success('Scrapbook entry deleted');
      queryClient.invalidateQueries({ queryKey: ['scrapbook'] });
    },
    onError: () => toast.error('Could not delete this entry'),
  });

  function handleDelete(entry) {
    setPendingDelete(entry);
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-20 lg:pb-0">
        <TopBar user={user} />

        <main className="px-4 md:px-8 py-8 max-w-6xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl">Scrapbook</h1>
              <p className="text-sm text-muted mt-0.5">Every trip, pinned to a page.</p>
            </div>
            <button
              onClick={() => setEditingEntry({})}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent-primary hover:bg-accent-highlight text-white text-sm font-medium transition-colors shadow-card"
            >
              <Plus size={15} /> New entry
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-card border border-line rounded-xl2 p-3 shadow-card">
            <div className="flex items-center gap-2 flex-1 min-w-[180px] px-3 py-2 rounded-lg bg-bg-primary border border-line">
              <Search size={15} className="text-muted shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entries…"
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="text-sm rounded-lg border border-line bg-bg-primary px-3 py-2 outline-none">
              <option value="">All countries</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="text-sm rounded-lg border border-line bg-bg-primary px-3 py-2 outline-none">
              <option value="">All years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <div className="flex items-center gap-1 bg-bg-primary border border-line rounded-lg p-1">
              {VIEW_MODES.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  title={label}
                  className={`p-1.5 rounded-md transition-colors ${view === id ? 'bg-accent-primary text-white' : 'text-muted hover:text-ink'}`}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <SkeletonGrid />
          ) : !entries?.length ? (
            <div className="text-center py-20 border border-dashed border-line rounded-xl2 text-muted">
              No scrapbook entries yet — capture your first memory.
            </div>
          ) : view === 'timeline' ? (
            <TimelineView entries={entries} onEdit={setEditingEntry} onDelete={handleDelete} onOpenLightbox={setLightbox} />
          ) : (
            <div className={view === 'masonry' ? 'columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'}>
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onEdit={setEditingEntry} onDelete={handleDelete} onOpenLightbox={setLightbox} />
              ))}
            </div>
          )}
        </main>
      </div>
      <MobileBottomNav />

      {editingEntry !== null && (
        <EntryModal
          entry={editingEntry}
          userId={user?.id}
          onClose={() => setEditingEntry(null)}
          onSaved={() => {
            setEditingEntry(null);
            queryClient.invalidateQueries({ queryKey: ['scrapbook'] });
          }}
        />
      )}

      {lightbox && <Lightbox {...lightbox} onClose={() => setLightbox(null)} />}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this entry?"
        description={pendingDelete ? `"${pendingDelete.title}" and its photos will be permanently removed.` : ''}
        confirmLabel="Delete entry"
        onConfirm={() => { deleteEntry.mutate(pendingDelete.id); setPendingDelete(null); }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function EntryCard({ entry, onEdit, onDelete, onOpenLightbox }) {
  const cover = entry.images?.[0];
  return (
    <div className="bg-card border border-line rounded-xl2 shadow-card overflow-hidden break-inside-avoid">
      <button
        onClick={() => cover && onOpenLightbox({ images: entry.images, index: 0 })}
        className="w-full aspect-[4/3] bg-sand-light bg-cover bg-center block"
        style={cover ? { backgroundImage: `url(${cover.url})` } : undefined}
      >
        {!cover && <div className="w-full h-full flex items-center justify-center text-muted"><ImagePlus size={22} /></div>}
      </button>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium truncate">{entry.title}</p>
            <p className="text-xs text-muted truncate">
              {[entry.city || entry.location, entry.country].filter(Boolean).join(', ') || '—'}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onEdit(entry)} className="p-1.5 rounded-md text-muted hover:bg-bg-secondary hover:text-ink"><Pencil size={14} /></button>
            <button onClick={() => onDelete(entry)} className="p-1.5 rounded-md text-muted hover:bg-danger/10 hover:text-danger"><Trash2 size={14} /></button>
          </div>
        </div>
        {entry.caption && <p className="text-sm text-ink/70 mt-2 line-clamp-2">{entry.caption}</p>}
        {entry.images?.length > 1 && (
          <p className="text-[11px] text-muted mt-2">+{entry.images.length - 1} more photo{entry.images.length > 2 ? 's' : ''}</p>
        )}
      </div>
    </div>
  );
}

function TimelineView({ entries, onEdit, onDelete, onOpenLightbox }) {
  const groups = useMemo(() => {
    const byYear = {};
    entries.forEach((e) => {
      const y = e.travelDate ? new Date(e.travelDate).getFullYear() : 'Undated';
      byYear[y] = byYear[y] || [];
      byYear[y].push(e);
    });
    return Object.entries(byYear).sort((a, b) => (b[0] === 'Undated' ? -1 : a[0] === 'Undated' ? 1 : b[0] - a[0]));
  }, [entries]);

  return (
    <div className="space-y-10">
      {groups.map(([yr, items]) => (
        <div key={yr}>
          <h2 className="font-display text-xl mb-4 flex items-center gap-3">
            {yr}
            <span className="flex-1 h-px bg-line" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} onOpenLightbox={onOpenLightbox} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Lightbox({ images, index, onClose }) {
  const [i, setI] = useState(index);
  const image = images[i];
  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-6" onClick={onClose}>
      <button onClick={onClose} className="absolute top-5 right-5 text-white/80 hover:text-white"><X size={26} /></button>
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setI((i - 1 + images.length) % images.length); }}
          className="absolute left-5 text-white/80 hover:text-white"
        >
          <ChevronLeft size={30} />
        </button>
      )}
      <img src={image.url} alt={image.caption || ''} onClick={(e) => e.stopPropagation()} className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg" />
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setI((i + 1) % images.length); }}
          className="absolute right-5 text-white/80 hover:text-white"
        >
          <ChevronRight size={30} />
        </button>
      )}
      {image.caption && <p className="absolute bottom-8 text-white/80 text-sm">{image.caption}</p>}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-card border border-line rounded-xl2 overflow-hidden animate-pulse">
          <div className="aspect-[4/3] bg-line/40" />
          <div className="p-4 space-y-2">
            <div className="h-3.5 w-2/3 bg-line/40 rounded" />
            <div className="h-3 w-1/3 bg-line/40 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EntryModal({ entry, userId, onClose, onSaved }) {
  const isNew = !entry?.id;
  const [title, setTitle] = useState(entry?.title || '');
  const [caption, setCaption] = useState(entry?.caption || '');
  const [location, setLocation] = useState(entry?.location || '');
  const [country, setCountry] = useState(entry?.country || '');
  const [city, setCity] = useState(entry?.city || '');
  const [travelDate, setTravelDate] = useState(entry?.travelDate ? entry.travelDate.slice(0, 10) : '');
  const [images, setImages] = useState(entry?.images || []); // [{url, caption}]
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const saveEntry = useMutation({
    mutationFn: (payload) =>
      isNew ? api.post('/scrapbook', payload) : api.put(`/scrapbook/${entry.id}`, payload),
    onSuccess: () => {
      toast.success(isNew ? 'Scrapbook entry created' : 'Scrapbook entry updated');
      onSaved();
    },
    onError: (err) => {
      const validationErrors = err?.response?.data?.errors;
      if (validationErrors?.length) {
        const fieldErrors = {};
        validationErrors.forEach((e) => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      }
      toast.error(err?.response?.data?.message || 'Could not save this entry');
    },
  });

  async function handleFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await uploadImages(files);
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      toast.error('Some images failed to upload');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }
    saveEntry.mutate({
      title, caption, location, country, city,
      travelDate: travelDate || undefined,
      images: images.map((img) => ({ url: img.url, caption: img.caption })),
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-line rounded-xl2 shadow-soft w-full max-w-xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl">{isNew ? 'New scrapbook entry' : 'Edit entry'}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1 w-full rounded-lg border bg-bg-primary px-3.5 py-2.5 outline-none ${errors.title ? 'border-danger' : 'border-line'}`}
            />
            {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium">Country</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Location detail</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Shibuya Crossing" className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium">Travel date</label>
              <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Memory / caption</label>
            <textarea rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-3.5 py-2.5 outline-none" />
          </div>

          <div>
            <label className="text-sm font-medium">Photos</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              className={`mt-1 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${dragOver ? 'border-accent-highlight bg-accent-highlight/5' : 'border-line'}`}
            >
              {uploading ? (
                <p className="text-sm text-muted flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Uploading…</p>
              ) : (
                <p className="text-sm text-muted">
                  Drag & drop images here, or{' '}
                  <label className="text-accent-highlight cursor-pointer hover:underline">
                    browse
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                  </label>
                </p>
              )}
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {images.map((img, i) => (
                  <div key={img.url + i} className="relative aspect-square rounded-lg overflow-hidden border border-line group">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saveEntry.isPending || uploading}
            className="w-full py-3 rounded-full bg-accent-primary text-card font-medium shadow-card hover:bg-accent-secondary transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saveEntry.isPending && <Loader2 size={16} className="animate-spin" />}
            {saveEntry.isPending ? 'Saving…' : isNew ? 'Add to scrapbook' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
