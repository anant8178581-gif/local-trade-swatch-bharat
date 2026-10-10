import React, { useState } from 'react';
import { Worker, Review } from '../types';
import { 
  Star, 
  ShieldCheck, 
  MapPin, 
  QrCode, 
  Phone, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Instagram, 
  Twitter, 
  Download,
  BadgeCheck,
  Award,
  Image as ImageIcon,
  CheckCircle,
  Plus,
  ExternalLink,
  Sparkles,
  X,
  Bike,
  Tag,
  Share2
} from 'lucide-react';
import AddWorkReviewModal from './AddWorkReviewModal';

interface Props {
  worker: Worker;
  compact?: boolean;
  isFullCard?: boolean;
  onCall?: (name: string) => void;
  onChat?: (name: string) => void;
  onBook?: (worker: Worker) => void;
  onTriggerGoogleAuth?: (worker: Worker) => void;
  onUpdateWorkerReviews?: (workerId: string, review: Review, lastPlace: string, lastPhoto: string) => void;
}

const WorkerCard: React.FC<Props> = ({ 
  worker, 
  compact, 
  isFullCard, 
  onCall, 
  onChat,
  onBook,
  onTriggerGoogleAuth,
  onUpdateWorkerReviews
}) => {
  const [showReviews, setShowReviews] = useState(false);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string; location: string } | null>(null);

  const price = worker.basePrice || (worker.skills.includes('AC Repair') ? 850 : worker.skills.includes('Electrical') ? 600 : 550);

  const handleNativeShareProfile = async () => {
    const shareUrl = `${window.location.origin}/#profile/${worker.id}`;
    const shareData = {
      title: `${worker.name} • Verified ${worker.skills[0]} Specialist`,
      text: `Hire ${worker.name} (${worker.skills.join(', ')}) on Local Trades India with 0% platform fee and verified Aadhaar KYC credentials!`,
      url: shareUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert(`✓ Public profile link for ${worker.name} copied to clipboard! Share on WhatsApp, Instagram or SMS.`);
    } catch {
      alert(`Public profile link: ${shareUrl}`);
    }
  };

  const shareToPlatform = (platform: string) => {
    const text = `Check out my verified professional profile on Local Trades India! I'm a Google & Aadhaar verified ${worker.skills[0]} expert.`;
    const url = `https://localtrades.in/verify/${worker.id}`;
    
    let shareUrl = '';
    switch(platform) {
      case 'whatsapp': shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`; break;
      case 'x': shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`; break;
      case 'instagram': 
        navigator.clipboard.writeText(url);
        alert('Profile link copied! Open Instagram to share in your bio or stories.');
        return;
    }
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  const handleReviewAdded = (review: Review, lastPlace: string, lastPhoto: string) => {
    if (onUpdateWorkerReviews) {
      onUpdateWorkerReviews(worker.id, review, lastPlace, lastPhoto);
    }
  };

  if (isFullCard) {
    return (
      <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-2xl overflow-hidden relative animate-in zoom-in duration-500 max-w-sm mx-auto">
        {/* Holographic Header */}
        <div className="h-48 bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-800 relative p-8">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center backdrop-blur-sm">
                  <Award size={14} className="text-white" />
                </div>
                <h3 className="font-black text-lg tracking-tighter leading-none">Local Trades India</h3>
              </div>
              <p className="text-[7px] font-black uppercase tracking-[0.4em] text-blue-200">National Skills Registry</p>
            </div>
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner">
               <ShieldCheck size={28} className="text-white" />
            </div>
          </div>

          <div className="absolute bottom-6 left-8 flex items-center gap-2">
             <span className="text-[12px] font-black text-black uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-white shadow-2xl">
               LT-{worker.id}-PRO
             </span>
             <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
          </div>
        </div>
        
        <div className="px-8 pb-10 -mt-20 text-center relative z-10">
          <div className="relative inline-block">
            <img src={worker.photoUrl} className="w-36 h-36 rounded-[2.5rem] object-cover mx-auto border-4 border-white shadow-2xl" alt={worker.name} />
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-2xl border-4 border-white shadow-lg">
              <BadgeCheck size={20} />
            </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mt-4 tracking-tight">{worker.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-blue-100">
              {worker.skills.join(' • ')}
            </span>
          </div>

          {/* Booking Trigger on Full Card */}
          {onBook && (
            <button
              onClick={() => onBook(worker)}
              className="mt-4 w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg transition-all"
            >
              Book {worker.name.split(' ')[0]} Now • ₹{price}
            </button>
          )}

          {/* Share */}
          <div className="mt-8 space-y-3">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Share Official Credential</p>
            <div className="flex justify-center items-center gap-2.5 flex-wrap">
              <button 
                onClick={handleNativeShareProfile} 
                className="px-3.5 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-md text-xs font-bold active:scale-95 cursor-pointer"
                title="Share Public Profile via Web Share API"
              >
                <Share2 size={15} />
                <span>Share Profile</span>
              </button>
              <button onClick={() => shareToPlatform('whatsapp')} className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-md">
                <MessageCircle size={18} />
              </button>
              <button onClick={() => shareToPlatform('instagram')} className="w-10 h-10 bg-pink-500 text-white rounded-xl flex items-center justify-center shadow-md">
                <Instagram size={18} />
              </button>
              <button onClick={() => shareToPlatform('x')} className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-md">
                <Twitter size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-4 rounded-2xl border transition-all ${
      worker.isPriorityListing 
        ? 'border-amber-300 ring-2 ring-amber-100 shadow-sm' 
        : 'border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm'
    }`}>
      {/* Priority Featured Header Ribbon */}
      {worker.isPriorityListing && (
        <div className="mb-3 px-2.5 py-1 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs font-bold text-amber-950">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-600" />
            <span>Priority Featured Pro</span>
          </div>
          <span className="text-[10px] text-amber-700 font-semibold">Top Local Match</span>
        </div>
      )}

      {/* Worker Header & Profile */}
      <div className="flex items-start gap-3.5">
        <div className="relative flex-shrink-0">
          <img 
            src={worker.photoUrl} 
            className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-xs" 
            alt={worker.name} 
          />
          {worker.verified && (
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white shadow-xs">
              <ShieldCheck size={11} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="font-extrabold text-slate-900 truncate text-base leading-tight">
              {worker.name}
            </h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleNativeShareProfile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                title="Share Profile (Web Share API)"
              >
                <Share2 size={13} />
              </button>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span className="font-mono">{worker.rating}</span>
                <span className="text-slate-600 text-[11px] font-normal">({worker.reviews ? worker.reviews.length : 12})</span>
              </div>
            </div>
          </div>

          {/* Clean Unboxed Metadata with Typographic Separators */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1 truncate">
            <span className="text-slate-700 font-semibold">{worker.skills.join(' · ')}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{worker.distance || 0.8} km</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>~{Math.max(4, Math.round((worker.distance || 1) * 5))} min ETA</span>
          </div>

          {/* Trust Verification Indicators */}
          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
            {worker.aadhaarVerified && (
              <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                <CheckCircle size={12} className="text-emerald-600" /> Aadhaar KYC
              </span>
            )}
            {worker.aadhaarVerified && worker.panVerified && (
              <span aria-hidden="true" className="text-slate-300">·</span>
            )}
            {worker.panVerified && (
              <span className="text-blue-700 font-semibold flex items-center gap-0.5">
                <BadgeCheck size={12} className="text-blue-600" /> PAN
              </span>
            )}
            <button 
              onClick={() => onTriggerGoogleAuth?.(worker)}
              className="text-slate-500 hover:text-blue-600 font-medium underline-offset-2 hover:underline ml-auto flex items-center gap-0.5 transition-colors"
              title="Verified with Google Identity Services"
            >
              <span>Identity Verified</span>
            </button>
          </div>
        </div>

        {/* Quick Communication Actions */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button 
            onClick={() => onCall?.(worker.name)}
            className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center transition-all active:scale-95"
            title="Direct Call"
          >
            <Phone size={14} />
          </button>
          <button 
            onClick={() => onChat?.(worker.name)}
            className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center transition-all active:scale-95"
            title="Live Chat"
          >
            <MessageCircle size={14} />
          </button>
        </div>
      </div>

      {/* Prominent Proof of Work Card */}
      {worker.lastWorkPlace && (
        <div className="mt-3 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
              <MapPin size={11} className="text-red-500" />
              <span>Recent Client Site:</span>
              <span className="text-slate-700 font-medium truncate">{worker.lastWorkPlace}</span>
            </span>
            {worker.lastWorkTitle && (
              <p className="text-xs text-slate-800 font-semibold truncate mt-0.5">
                {worker.lastWorkTitle}
              </p>
            )}
          </div>

          {worker.lastWorkPhoto && (
            <div 
              onClick={() => setPreviewPhoto({
                url: worker.lastWorkPhoto!,
                title: worker.lastWorkTitle || 'Completed Work',
                location: worker.lastWorkPlace || 'Mumbai'
              })}
              className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border border-slate-200 shadow-xs hover:opacity-90 transition-opacity"
              title="Click to view work photo"
            >
              <img src={worker.lastWorkPhoto} alt="Work Done" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                <ImageIcon size={12} className="text-white drop-shadow" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pricing & Booking Row */}
      {onBook && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-slate-900 font-mono">₹{price}</span>
              <span className="text-xs text-slate-600">/ job</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block">0% platform cut · Keeps 100%</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onBook(worker)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all active:scale-95"
            >
              Negotiate
            </button>
            <button
              onClick={() => onBook(worker)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Bike size={13} />
              <span>Book Pro</span>
            </button>
          </div>
        </div>
      )}

      {/* Reviews & Work History Accordion */}
      <div className="mt-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowReviews(!showReviews); }}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span>Client Reviews ({worker.reviews ? worker.reviews.length : 0})</span>
            {showReviews ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <button 
            onClick={() => setIsAddReviewOpen(true)}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <Plus size={11} />
            <span>Add Review</span>
          </button>
        </div>
        
        {showReviews && (
          <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2">
            {worker.reviews && worker.reviews.length > 0 ? (
              worker.reviews.map(review => (
                <div key={review.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900">{review.userName}</p>
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] text-emerald-700 font-semibold">Verified Customer</span>
                      </div>
                      {review.lastPlace && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-rose-500" /> Worked at: {review.lastPlace}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                      ))}
                    </div>
                  </div>

                  {review.workTitle && (
                    <span className="inline-block bg-white text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                      Task: {review.workTitle}
                    </span>
                  )}

                  <p className="text-xs text-slate-700 leading-relaxed font-normal">"{review.comment}"</p>

                  {review.workPhoto && (
                    <div className="pt-1">
                      <div 
                        onClick={() => setPreviewPhoto({
                          url: review.workPhoto!,
                          title: review.workTitle || 'Completed Work',
                          location: review.lastPlace || 'Client Site'
                        })}
                        className="relative rounded-xl overflow-hidden border border-slate-200 max-h-36 cursor-pointer group/rev"
                      >
                        <img src={review.workPhoto} alt="Review Work" className="w-full h-32 object-cover group-hover/rev:scale-105 transition-transform" />
                        <div className="absolute bottom-2 left-2 bg-slate-950/70 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                          <ImageIcon size={10} /> Photo of Work Done
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span>{review.completionTime || 'Service Complete'}</span>
                    <span>{review.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-2">
                No reviews yet. Be the first to verify work done!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Add Review & Work Photo Modal */}
      <AddWorkReviewModal 
        isOpen={isAddReviewOpen}
        onClose={() => setIsAddReviewOpen(false)}
        worker={worker}
        onAddReview={handleReviewAdded}
      />

      {/* Full Size Work Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] max-w-sm w-full overflow-hidden shadow-2xl relative border border-gray-200">
            <button 
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center transition-all"
            >
              <X size={16} />
            </button>

            <img src={previewPhoto.url} alt="Proof of Work" className="w-full h-64 object-cover" />

            <div className="p-5 space-y-2">
              <span className="text-[9px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Verified Work Proof Photo
              </span>
              <h4 className="text-base font-black text-gray-900 leading-snug">{previewPhoto.title}</h4>
              <p className="text-xs text-gray-600 flex items-center gap-1 font-medium">
                <MapPin size={12} className="text-red-500" /> Location: {previewPhoto.location}
              </p>
              <p className="text-[10px] text-emerald-600 font-bold pt-1">
                ✓ Geo-tagged & Authenticated via Local Trades India
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerCard;
