import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ImagePlus, Loader2, X } from 'lucide-react';
import api from '../services/api';
import { uploadImage } from '../services/uploads';

const TRAVEL_STATUSES = [
  { value: 'VISITED', label: 'Visited' },
  { value: 'CURRENTLY_TRAVELLING', label: 'Currently travelling' },
  { value: 'WANT_TO_VISIT', label: 'Want to visit' },
  { value: 'BUCKET_LIST', label: 'Bucket list' },
];

export default function TripCreate() {
  const [searchParams] = useSearchParams();
  const { id: editId } = useParams(); // present only on /trips/:id/edit
  const isEditMode = !!editId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [coverPreview, setCoverPreview] = useState(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUploadPct, setCoverUploadPct] = useState(0);
  const [descLength, setDescLength] = useState(0);

  const { data: existingTrip, isLoading: loadingExisting } = useQuery({
    queryKey: ['trip', editId],
    queryFn: async () => (await api.get(`/trips/${editId}`)).data.trip,
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      title: '',
      destination: '',
      country: '',
      latitude: searchParams.get('lat') || '',
      longitude: searchParams.get('lon') || '',
      startDate: '',
      endDate: '',
      description: '',
      travelStatus: 'VISITED',
      privacy: 'PUBLIC',
      tags: '',
      budget: '',
      coverImageUrl: '',
    },
  });

  // Once the existing trip loads, replace the (empty) form defaults with
  // its real values so editing feels like a normal pre-filled form.
  useEffect(() => {
    if (!existingTrip) return;
    reset({
      title: existingTrip.title || '',
      destination: existingTrip.city?.name || '',
      country: existingTrip.country?.name || '',
      latitude: existingTrip.latitude ?? '',
      longitude: existingTrip.longitude ?? '',
      startDate: existingTrip.startDate ? existingTrip.startDate.slice(0, 10) : '',
      endDate: existingTrip.endDate ? existingTrip.endDate.slice(0, 10) : '',
      description: existingTrip.story || '',
      travelStatus: 'VISITED',
      privacy: existingTrip.privacy || 'PUBLIC',
      tags: (existingTrip.tags || []).map((t) => t.tag?.name || t.name).filter(Boolean).join(', '),
      budget: existingTrip.budget ?? '',
      coverImageUrl: existingTrip.coverImageUrl || '',
    });
    setDescLength((existingTrip.story || '').length);
  }, [existingTrip, reset]);

  const coverImageUrl = watch('coverImageUrl');

  // Creating the journal is really two writes against the existing schema:
  // a Trip row (the journal itself) and a matching TravelMarker (so the
  // globe/journey-marker system and bucket-list stats immediately reflect
  // the chosen travel status) — same pattern the click-the-globe flow
  // already uses. Both run inside one mutation so the UI only shows one
  // pending/success/error state.
  const createJournal = useMutation({
    mutationFn: async (payload) => {
      if (isEditMode) {
        const res = await api.put(`/trips/${editId}`, payload);
        return res.data.trip;
      }
      const tripRes = await api.post('/trips', payload);
      const trip = tripRes.data.trip;
      try {
        await api.post('/markers', {
          type: payload.travelStatus,
          label: payload.destination || payload.title,
          latitude: payload.latitude,
          longitude: payload.longitude,
          countryId: trip.countryId,
          cityId: trip.cityId,
        });
      } catch {
        // The journal itself saved fine; a failed marker sync shouldn't
        // block the user or look like the whole submission failed.
      }
      return trip;
    },
    onSuccess: (trip) => {
      toast.success(isEditMode ? 'Journal updated!' : 'Journal saved!');
      queryClient.invalidateQueries({ queryKey: ['userTrips'] });
      queryClient.invalidateQueries({ queryKey: ['markers'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['trip', String(trip.id)] });
      navigate(`/trips/${trip.id}`);
    },
    onError: (err) => {
      const validationErrors = err?.response?.data?.errors;
      if (validationErrors?.length) {
        validationErrors.forEach((e) => toast.error(e.message));
      } else {
        toast.error(err?.response?.data?.message || 'Could not save your journal. Please try again.');
      }
    },
  });

  async function handleCoverChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setCoverUploading(true);
    setCoverUploadPct(0);
    try {
      const { url } = await uploadImage(file, setCoverUploadPct);
      setValue('coverImageUrl', url, { shouldValidate: true });
      toast.success('Cover image uploaded');
    } catch {
      toast.error('Cover image upload failed — you can still save without one.');
      setCoverPreview(null);
    } finally {
      setCoverUploading(false);
    }
  }

  function clearCover() {
    setCoverPreview(null);
    setValue('coverImageUrl', '');
  }

  function onSubmit(data) {
    if (createJournal.isPending) return; // guards double-submit alongside the disabled button
    createJournal.mutate({
      ...data,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      budget: data.budget ? Number(data.budget) : undefined,
      tagNames: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
  }

  const saving = isSubmitting || createJournal.isPending;

  if (isEditMode && loadingExisting) {
    return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-muted">Loading journal…</div>;
  }

  return (
    <div className="min-h-screen bg-bg-primary py-16 px-6">
      <div className="max-w-2xl mx-auto bg-card border border-line rounded-xl2 shadow-soft p-10">
        <h1 className="text-3xl font-display mb-1">{isEditMode ? 'Edit your journal' : 'Create your travel journal'}</h1>
        <p className="text-ink/60 mb-8">{isEditMode ? 'Update the details of this trip.' : 'Capture the details while the memory is fresh.'}</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Field
            label="Trip title"
            error={errors.title}
            {...register('title', { required: 'Give this journal a title', maxLength: { value: 120, message: 'Keep it under 120 characters' } })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Destination (city/place)"
              error={errors.destination}
              {...register('destination', { required: 'Where did you go?' })}
            />
            <Field
              label="Country"
              error={errors.country}
              {...register('country', { required: 'Country is required' })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Latitude"
              type="number"
              step="any"
              error={errors.latitude}
              {...register('latitude', {
                required: 'Latitude is required',
                min: { value: -90, message: 'Must be between -90 and 90' },
                max: { value: 90, message: 'Must be between -90 and 90' },
              })}
            />
            <Field
              label="Longitude"
              type="number"
              step="any"
              error={errors.longitude}
              {...register('longitude', {
                required: 'Longitude is required',
                min: { value: -180, message: 'Must be between -180 and 180' },
                max: { value: 180, message: 'Must be between -180 and 180' },
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Start date"
              type="date"
              error={errors.startDate}
              {...register('startDate', { required: 'Start date is required' })}
            />
            <Field
              label="End date"
              type="date"
              error={errors.endDate}
              {...register('endDate', {
                validate: (value, formValues) =>
                  !value || !formValues.startDate || value >= formValues.startDate || 'End date must be after start date',
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Travel status</label>
              <select
                {...register('travelStatus')}
                className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-4 py-2.5 outline-none"
              >
                {TRAVEL_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Visibility</label>
              <select
                {...register('privacy')}
                className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-4 py-2.5 outline-none"
              >
                <option value="PUBLIC">Public</option>
                <option value="FRIENDS_ONLY">Friends only</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Description</label>
              <span className="text-xs text-muted">{descLength}/2000</span>
            </div>
            <textarea
              rows={5}
              maxLength={2000}
              {...register('description', {
                onChange: (e) => setDescLength(e.target.value.length),
              })}
              className="mt-1 w-full rounded-lg border border-line bg-bg-primary px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent-highlight"
              placeholder="What made this trip memorable?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Budget" type="number" min="0" step="any" error={errors.budget} {...register('budget', { min: { value: 0, message: 'Budget can’t be negative' } })} />
            <Field label="Tags" placeholder="comma, separated, tags" {...register('tags')} />
          </div>

          <Controller
            name="coverImageUrl"
            control={control}
            render={() => (
              <div>
                <label className="text-sm font-medium">Cover image</label>
                <div className="mt-1 flex items-center gap-4">
                  {coverPreview || coverImageUrl ? (
                    <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-line shrink-0">
                      <img src={coverPreview || coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={clearCover}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                        aria-label="Remove cover image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-28 h-20 rounded-lg border border-dashed border-line flex items-center justify-center text-muted shrink-0">
                      <ImagePlus size={20} />
                    </div>
                  )}

                  <label className="cursor-pointer text-sm font-medium text-accent-highlight hover:underline">
                    {coverUploading ? `Uploading… ${coverUploadPct}%` : 'Choose an image'}
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" disabled={coverUploading} />
                  </label>
                </div>
              </div>
            )}
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-full bg-accent-primary text-card font-medium shadow-card hover:bg-accent-secondary transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Saving…' : 'Save trip journal'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        {...props}
        className={`mt-1 w-full rounded-lg border bg-bg-primary px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent-highlight ${
          error ? 'border-danger' : 'border-line'
        }`}
      />
      {error && <p className="mt-1 text-xs text-danger">{error.message}</p>}
    </div>
  );
}
