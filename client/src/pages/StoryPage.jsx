import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Share2, Heart, Copy, Download } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import TravelAlbum from '../components/TravelAlbum.jsx';
import WeatherWidget from '../components/WeatherWidget.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function StoryPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: async () => (await api.get(`/trips/${id}`)).data.trip,
  });

  const { data: bookmarkedIds } = useQuery({
    queryKey: ['bookmarks', 'mine'],
    queryFn: async () => (await api.get('/bookmarks/mine')).data.tripIds,
    enabled: !!user,
  });
  const isBookmarked = bookmarkedIds?.includes(Number(id));

  const toggleLike = useMutation({
    mutationFn: () => api.post('/likes/toggle', { tripId: Number(id) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', id] }),
  });

  const toggleBookmark = useMutation({
    mutationFn: () => api.post('/bookmarks/toggle', { tripId: Number(id) }),
    onSuccess: (res) => {
      toast.success(res.data.bookmarked ? 'Added to favorites' : 'Removed from favorites');
      queryClient.invalidateQueries({ queryKey: ['bookmarks', 'mine'] });
    },
    onError: () => toast.error('Could not update favorites'),
  });

  const deleteTrip = useMutation({
    mutationFn: () => api.delete(`/trips/${id}`),
    onSuccess: () => {
      toast.success('Journal deleted');
      queryClient.invalidateQueries({ queryKey: ['userTrips'] });
      navigate('/dashboard');
    },
    onError: () => toast.error('Could not delete this journal'),
  });

  const duplicateTrip = useMutation({
    mutationFn: () =>
      api.post('/trips', {
        title: `${data.title} (copy)`,
        countryId: data.countryId,
        cityId: data.cityId,
        state: data.state,
        latitude: data.latitude,
        longitude: data.longitude,
        startDate: data.startDate,
        endDate: data.endDate,
        story: data.story,
        privacy: 'PRIVATE',
        coverImageUrl: data.coverImageUrl,
        budget: data.budget,
      }),
    onSuccess: (res) => {
      toast.success('Journal duplicated');
      queryClient.invalidateQueries({ queryKey: ['userTrips'] });
      navigate(`/trips/${res.data.trip.id}`);
    },
    onError: () => toast.error('Could not duplicate this journal'),
  });

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: data.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  }

  function handleDownload() {
    const lines = [
      data.title,
      `${data.city?.name ? `${data.city.name}, ` : ''}${data.country?.name || ''}`,
      new Date(data.startDate).toLocaleDateString(),
      '',
      data.story || 'No story written yet.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.replace(/[^\w\- ]/g, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Journal downloaded');
  }

  const addComment = useMutation({
    mutationFn: () => api.post('/comments', { tripId: Number(id), content: commentText }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
    },
  });

  if (isLoading) return <div className="min-h-screen bg-bg-primary flex items-center justify-center">Loading…</div>;
  if (!data) return <div className="min-h-screen bg-bg-primary flex items-center justify-center">Trip not found.</div>;

  const isOwner = user?.id === data.userId;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div
        className="h-72 md:h-96 bg-cover bg-center bg-bg-secondary relative flex items-end"
        style={{ backgroundImage: `url(${data.coverImageUrl || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=70&w=1600'})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 p-8 text-card">
          <Link to="/dashboard" className="text-sm text-card/80 hover:text-card">← Back to globe</Link>
          <h1 className="text-4xl font-display mt-2">{data.title}</h1>
          <p className="text-card/80 mt-1">
            {data.city?.name ? `${data.city.name}, ` : ''}{data.country?.name} · {new Date(data.startDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-6 flex flex-wrap items-center gap-2">
        {user && (
          <button
            onClick={() => toggleBookmark.mutate()}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium transition-colors ${
              isBookmarked ? 'border-danger text-danger bg-danger/5' : 'border-line text-ink/70 hover:bg-bg-secondary'
            }`}
          >
            <Heart size={14} fill={isBookmarked ? 'currentColor' : 'none'} /> {isBookmarked ? 'Favorited' : 'Favorite'}
          </button>
        )}
        <button onClick={handleShare} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-line text-sm font-medium text-ink/70 hover:bg-bg-secondary transition-colors">
          <Share2 size={14} /> Share
        </button>
        <button onClick={handleDownload} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-line text-sm font-medium text-ink/70 hover:bg-bg-secondary transition-colors">
          <Download size={14} /> Download
        </button>
        {user && (
          <button
            onClick={() => duplicateTrip.mutate()}
            disabled={duplicateTrip.isPending}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-line text-sm font-medium text-ink/70 hover:bg-bg-secondary transition-colors disabled:opacity-60"
          >
            <Copy size={14} /> Duplicate
          </button>
        )}
        {isOwner && (
          <>
            <Link to={`/trips/${id}/edit`} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-line text-sm font-medium text-ink/70 hover:bg-bg-secondary transition-colors">
              <Pencil size={14} /> Edit
            </Link>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-danger/40 text-sm font-medium text-danger hover:bg-danger/5 transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
          </>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 grid md:grid-cols-[1fr_280px] gap-8">
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-2xl mb-3">The story</h2>
            <p className="text-ink/80 leading-relaxed whitespace-pre-line">{data.story || 'No story written yet.'}</p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Travel scrapbook</h2>
            <TravelAlbum media={data.media} tripTitle={data.title} />
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Comments</h2>
            <div className="space-y-3 mb-4">
              {data.comments?.map((c) => (
                <div key={c.id} className="bg-card border border-line rounded-lg p-3">
                  <p className="text-sm font-medium">{c.user.name}</p>
                  <p className="text-sm text-ink/70">{c.content}</p>
                </div>
              ))}
            </div>
            {user && (
              <div className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment…"
                  className="flex-1 rounded-lg border border-line bg-card px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent-highlight"
                />
                <button
                  onClick={() => commentText.trim() && addComment.mutate()}
                  className="px-5 py-2.5 rounded-lg bg-accent-primary text-card text-sm font-medium"
                >
                  Post
                </button>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <WeatherWidget lat={data.latitude} lon={data.longitude} label={data.city?.name} />

          <div className="bg-card border border-line rounded-xl2 p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-ink/50 mb-3">Engagement</p>
            <button
              onClick={() => user && toggleLike.mutate()}
              className="w-full py-2 rounded-full border border-line text-sm font-medium hover:bg-accent-highlight/20"
            >
              ❤️ {data._count?.likes || 0} Likes
            </button>
            <p className="text-sm text-ink/60 mt-2">{data._count?.comments || 0} comments</p>
          </div>

          {data.expenses?.length > 0 && (
            <div className="bg-card border border-line rounded-xl2 p-5 shadow-card">
              <p className="text-xs uppercase tracking-wide text-ink/50 mb-3">Expenses</p>
              <ul className="text-sm space-y-1">
                {data.expenses.map((e) => (
                  <li key={e.id} className="flex justify-between">
                    <span>{e.category.name}</span>
                    <span>{e.amount} {e.currency}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this journal?"
        description={`"${data.title}" and everything in it will be permanently removed.`}
        confirmLabel="Delete journal"
        onConfirm={() => { setConfirmDelete(false); deleteTrip.mutate(); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
