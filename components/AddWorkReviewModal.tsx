import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Camera, 
  X, 
  Check, 
  CheckCircle,
  Navigation,
  ShieldCheck,
  Upload,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { Worker, Review } from '../types';
import LiveCameraModal from './LiveCameraModal';

interface AddWorkReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker;
  onAddReview: (review: Review, updatedLastWorkPlace: string, updatedLastWorkPhoto: string) => void;
}

const SAMPLE_WORK_PHOTOS = [
  {
    category: 'Plumbing',
    url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80',
    label: 'Pipe & Valve Repair'
  },
  {
    category: 'Electrical',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    label: 'MCB Wiring Panel'
  },
  {
    category: 'Carpentry',
    url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80',
    label: 'Custom Cabinet Finish'
  }
];

const CUSTOMER_TAGS = ['Punctuality', 'Craftsmanship Quality', 'Polite Behavior', 'Zero Leaks', 'Fair Pricing'];
const WORKER_TAGS = ['Prompt UPI Payment', 'Safe Site Environment', 'Respectful Client', 'Clear Scope'];

const QUICK_COMMENTS_CUSTOMER = [
  'Remarkable craftsmanship and punctual service! Tested with zero leaks.',
  'Very polite artisan, explained everything clearly and finished on time.',
  'Great value for money. Handled difficult repair work with perfection.',
  'Thoroughly professional work, left the workspace clean and tidy.'
];

const QUICK_COMMENTS_WORKER = [
  'Respectful customer, clear job requirements and instant UPI payment!',
  'Safe site conditions and great hospitality. Pleasure to work for them.',
  'Client provided exact materials needed and gave prompt access.'
];

const AddWorkReviewModal: React.FC<AddWorkReviewModalProps> = ({
  isOpen,
  onClose,
  worker,
  onAddReview
}) => {
  const [reviewType, setReviewType] = useState<'customer_to_worker' | 'worker_to_customer'>('customer_to_worker');
  const [userName, setUserName] = useState('Anjali Sharma');
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctuality', 'Craftsmanship Quality', 'Polite Behavior']);
  const [lastPlace, setLastPlace] = useState('Oberoi Sky City, Tower C, Borivali East, Mumbai');
  const [geotagCoords, setGeotagCoords] = useState<{ lat: number; lng: number }>({
    lat: 19.2288,
    lng: 72.8541
  });
  const [workTitle, setWorkTitle] = useState('Main Water Line Replacement & Concealed Fitting');
  const [comment, setComment] = useState('Remarkable work! Finished the entire water line installation cleanly and tested for zero leaks.');
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_WORK_PHOTOS[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [customPhotoLabel, setCustomPhotoLabel] = useState<string | null>(null);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastPlace || !comment) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const timestamp = new Date().toLocaleString('en-IN');
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        userName: reviewType === 'customer_to_worker' ? (userName.trim() || 'Verified Client') : `${worker.name} (Artisan Feedback)`,
        rating,
        comment: `${comment} [${selectedTags.join(' • ')}]`,
        date: 'Just now',
        lastPlace,
        workPhoto: selectedPhoto,
        workTitle,
        category: worker.skills[0] || 'Trade Service',
        completionTime: 'Completed today',
        verifiedBadge: true,
        tags: selectedTags,
        reviewType,
        geotag: {
          lat: geotagCoords.lat,
          lng: geotagCoords.lng,
          timestamp
        }
      };

      onAddReview(newReview, lastPlace, selectedPhoto);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeotagCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLastPlace('Bandra Kurla Complex (BKC), Block G, Mumbai');
        },
        () => {
          setGeotagCoords({ lat: 19.1176, lng: 72.9060 });
          setLastPlace('Hiranandani Gardens, Powai, Mumbai');
        }
      );
    } else {
      setGeotagCoords({ lat: 19.1176, lng: 72.9060 });
      setLastPlace('Hiranandani Gardens, Powai, Mumbai');
    }
  };

  const activeTagOptions = reviewType === 'customer_to_worker' ? CUSTOMER_TAGS : WORKER_TAGS;

  return (
    <div className="fixed inset-0 z-[250] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Deep Navy Header */}
        <div className="bg-[#0B2447] text-white p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <img src={worker.photoUrl} alt={worker.name} className="w-11 h-11 rounded-full object-cover border-2 border-white/40" />
            <div>
              <h3 className="font-extrabold text-sm tracking-tight uppercase">Two-Way Feedback & Geotag Proof</h3>
              <p className="text-[11px] text-teal-300 font-semibold">Verified Geotagged Location Review</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-slate-800">
          {/* Dual-Rating Perspective Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setReviewType('customer_to_worker');
                setSelectedTags(['Punctuality', 'Craftsmanship Quality']);
              }}
              className={`py-2 rounded-xl transition-all ${
                reviewType === 'customer_to_worker' ? 'bg-[#0B2447] text-white shadow' : 'text-slate-600'
              }`}
            >
              Customer &rarr; Worker
            </button>
            <button
              type="button"
              onClick={() => {
                setReviewType('worker_to_customer');
                setSelectedTags(['Prompt UPI Payment', 'Safe Site Environment']);
              }}
              className={`py-2 rounded-xl transition-all ${
                reviewType === 'worker_to_customer' ? 'bg-[#116D6E] text-white shadow' : 'text-slate-600'
              }`}
            >
              Worker &rarr; Customer
            </button>
          </div>

          {/* Star Rating + Tags */}
          <div className="space-y-2.5 text-center bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {reviewType === 'customer_to_worker' ? `Rate ${worker.name}` : 'Rate Customer & Site Experience'}
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star 
                    size={26} 
                    className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} 
                  />
                </button>
              ))}
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {activeTagOptions.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                      isSelected
                        ? 'bg-[#116D6E] text-white border-[#116D6E]'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {isSelected ? `✓ ${tag}` : tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Geotagged Location Metadata */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <MapPin size={12} className="text-red-500" /> Verified Geotagged Location
              </label>
              <button 
                type="button" 
                onClick={handleUseCurrentLocation}
                className="text-[10px] font-bold text-[#116D6E] hover:underline flex items-center gap-0.5"
              >
                <Navigation size={10} /> Refresh GPS Geotag
              </button>
            </div>
            <input 
              type="text" 
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#116D6E]"
              value={lastPlace}
              onChange={(e) => setLastPlace(e.target.value)}
            />
            <div className="flex items-center justify-between text-[10px] font-mono bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
              <span>📍 Lat: {geotagCoords.lat.toFixed(4)}, Lng: {geotagCoords.lng.toFixed(4)}</span>
              <span className="font-bold flex items-center gap-1"><ShieldCheck size={12} /> Geotag Verified</span>
            </div>
          </div>

          {/* Geotagged Photo of Completed Work */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <Camera size={12} className="text-[#116D6E]" /> Geotagged Work Proof Photo
              </label>
              <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                {customPhotoLabel || 'Photo Selected'}
              </span>
            </div>

            {/* Active Selected Photo Preview with GPS Overlay */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-teal-600/60 aspect-video bg-slate-900 shadow-sm">
              <img
                src={selectedPhoto}
                alt="Selected work proof"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-2.5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                    GEOTAG VERIFIED
                  </span>
                  <span className="text-[10px] font-mono bg-black/70 px-2 py-0.5 rounded text-amber-300">
                    {geotagCoords.lat.toFixed(4)}° N, {geotagCoords.lng.toFixed(4)}° E
                  </span>
                </div>
                <p className="text-[10px] text-slate-200 truncate mt-1 font-medium">
                  📍 {lastPlace}
                </p>
              </div>
            </div>

            {/* Action Buttons: Direct Camera Click & Add Photo */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsLiveCameraOpen(true)}
                className="py-2.5 px-3 bg-[#116D6E] hover:bg-[#0e5859] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Open device camera directly in app"
              >
                <Camera size={15} />
                <span>Click Camera</span>
              </button>

              <label className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95">
                <Upload size={14} className="text-slate-600" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      try {
                        const { processUploadedProofFile } = await import('../services/cameraService');
                        const result = await processUploadedProofFile(file, {
                          proofMode: 'job_completion_proof',
                          workerName: worker.name,
                          locationName: lastPlace,
                          gpsCoordinates: geotagCoords,
                          watermarkText: `GEOTAGGED JOB PROOF • ${worker.name} • ${lastPlace}`
                        });
                        setSelectedPhoto(result.dataUrl);
                        setCustomPhotoUrl(result.dataUrl);
                        setCustomPhotoLabel(`${result.resolutionLabel} Upload`);
                      } catch {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            const dataUrl = ev.target.result as string;
                            setSelectedPhoto(dataUrl);
                            setCustomPhotoUrl(dataUrl);
                            setCustomPhotoLabel('Uploaded from Device');
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }
                  }}
                />
              </label>
            </div>

            {/* Or choose from standard sample work photos */}
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Or choose from trade sample photos:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_WORK_PHOTOS.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setSelectedPhoto(item.url);
                      setCustomPhotoLabel(item.label);
                    }}
                    className={`cursor-pointer rounded-xl overflow-hidden border-2 relative transition-all ${
                      selectedPhoto === item.url ? 'border-[#116D6E] ring-2 ring-teal-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={item.url} alt={item.label} className="w-full h-14 object-cover" />
                    <div className="p-1 bg-white text-[9px] font-bold text-slate-700 truncate text-center">
                      {item.label}
                    </div>
                    {selectedPhoto === item.url && (
                      <div className="absolute top-1 right-1 bg-[#116D6E] text-white rounded-full p-0.5 shadow">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Review Comment with Quick Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Detailed Review & Comment
              </label>
              <span className="text-[10px] text-slate-400 font-bold">Tap quick templates below</span>
            </div>

            {/* Quick Comment Chips */}
            <div className="flex flex-wrap gap-1">
              {(reviewType === 'customer_to_worker' ? QUICK_COMMENTS_CUSTOMER : QUICK_COMMENTS_WORKER).map((qc, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setComment(qc)}
                  className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-900 border border-slate-200 px-2 py-1 rounded-lg text-slate-700 font-medium transition-all text-left line-clamp-1"
                >
                  &ldquo;{qc.slice(0, 38)}...&rdquo;
                </button>
              ))}
            </div>

            <textarea 
              rows={2} 
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#116D6E]"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review and work feedback here..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#116D6E] hover:bg-[#0d5657] text-white rounded-full font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle size={16} />
            <span>{isSubmitting ? 'Publishing Geotagged Review...' : 'Publish Geotagged Review'}</span>
          </button>
        </form>

        {/* Live Device Camera Modal for Direct Photo Clicking */}
        <LiveCameraModal
          isOpen={isLiveCameraOpen}
          onClose={() => setIsLiveCameraOpen(false)}
          proofMode="job_completion_proof"
          workerName={worker.name}
          locationName={lastPlace}
          gpsCoordinates={geotagCoords}
          onCapture={(photoDataUrl) => {
            setSelectedPhoto(photoDataUrl);
            setCustomPhotoUrl(photoDataUrl);
            setCustomPhotoLabel('Live High-Res Snapshot');
          }}
          onCaptureResult={(res) => {
            setSelectedPhoto(res.dataUrl);
            setCustomPhotoUrl(res.dataUrl);
            setCustomPhotoLabel(`${res.resolutionLabel} Proof`);
          }}
          title="Click Job Completion Proof"
          subtitle={`High-resolution verification proof at ${lastPlace}`}
          watermarkText={`GEOTAGGED JOB PROOF • ${worker.name} • ${lastPlace} • ${new Date().toLocaleTimeString('en-IN')}`}
        />
      </div>
    </div>
  );
};

export default AddWorkReviewModal;
