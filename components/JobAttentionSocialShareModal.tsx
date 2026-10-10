import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook, 
  MessageCircle, 
  Copy, 
  Check, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Wrench, 
  User, 
  CheckCircle2,
  Send,
  ExternalLink
} from 'lucide-react';
import { Job } from '../types';

export interface JobAttentionSocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onUpdateJobStatus?: (jobId: string, newStatus: Job['status'], reason?: string) => void;
}

export const JobAttentionSocialShareModal: React.FC<JobAttentionSocialShareModalProps> = ({
  isOpen,
  onClose,
  job,
  onUpdateJobStatus
}) => {
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [issueNote, setIssueNote] = useState<string>(
    job.attentionReason || 'Work left incomplete / needs urgent expert artisan review.'
  );
  const [currentStatus, setCurrentStatus] = useState<Job['status']>(job.status);

  if (!isOpen) return null;

  const statusLabel = currentStatus === 'incomplete' 
    ? 'Job Incomplete' 
    : currentStatus === 'requires_attention' 
    ? 'Requires Urgent Attention' 
    : 'Pending Review';

  // Social Share Texts
  const shareTitle = `⚠️ Trade Alert: ${job.title} ${statusLabel}`;
  const shareText = `Trade Job Alert on Local Trades India: "${job.title}" at ${job.location} requires urgent attention/remediation.\nReason: ${issueNote}\nSeeking peer artisan advice and platform resolution assistance.\n#LocalTradesIndia #TradeDispute #WorkQuality #ArtisanCommunity`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`⚠️ Trade Job Alert: "${job.title}" (${job.category}) at ${job.location} requires attention! Note: ${issueNote.slice(0, 70)}... #LocalTradesIndia #JobDispute`)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`*⚠️ TRADE JOB ALERT: ${statusLabel.toUpperCase()}*\n\nJob: *${job.title}*\nLocation: ${job.location}\nAmount: ₹${job.price}\nClient: ${job.customerName}\n\n*Issue / Attention Reason:*\n${issueNote}\n\nAssistance requested on Local Trades India platform.`)}`;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedCaption(true);
      setToastMessage('✓ Formatted social caption copied to clipboard!');
      setTimeout(() => {
        setCopiedCaption(false);
        setToastMessage(null);
      }, 3500);
    } catch (e) {
      console.warn('Clipboard failed:', e);
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: shareTitle,
      text: shareText,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setToastMessage('✓ Shared via native Web Share!');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    handleCopyCaption();
  };

  const handleOpenInstagram = () => {
    handleCopyCaption();
    window.open('https://www.instagram.com', '_blank');
  };

  const handleStatusChange = (newStatus: Job['status']) => {
    setCurrentStatus(newStatus);
    if (onUpdateJobStatus) {
      onUpdateJobStatus(job.id, newStatus, issueNote);
    }
    setToastMessage(`✓ Job status updated to "${newStatus.replace('_', ' ').toUpperCase()}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-[270] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-rose-800 to-slate-900 text-white p-5 relative border-b-4 border-amber-400">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 flex items-center justify-center font-black shadow-md flex-shrink-0 animate-pulse">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-200 bg-amber-950/40 px-2 py-0.5 rounded-full">
                  JOB ESCALATION & RESOLUTION
                </span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white">
                  {statusLabel}
                </span>
              </div>
              <h3 className="text-lg font-black text-white leading-tight mt-0.5">
                Share to Social for Community Attention
              </h3>
              <p className="text-xs text-amber-100">
                Broadcast incomplete work to Instagram, LinkedIn, Facebook & trade groups
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Job Overview Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block font-mono">
                  JOB ID: #{job.id} • {job.category.toUpperCase()}
                </span>
                <h4 className="text-sm font-black text-slate-900 leading-tight">
                  {job.title}
                </h4>
              </div>
              <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl flex-shrink-0">
                ₹{job.price}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600 text-xs">
              <MapPin size={13} className="text-rose-500 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600 text-xs">
              <User size={13} className="text-blue-500 flex-shrink-0" />
              <span>Customer: <strong>{job.customerName}</strong></span>
            </div>
          </div>

          {/* Job Status Quick Actions */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
              Update Job Status:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange('incomplete')}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all font-bold text-xs cursor-pointer ${
                  currentStatus === 'incomplete'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ⚠️ Incomplete
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('requires_attention')}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all font-bold text-xs cursor-pointer ${
                  currentStatus === 'requires_attention'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                🚨 Attention Needed
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('completed')}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all font-bold text-xs cursor-pointer ${
                  currentStatus === 'completed'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ✓ Resolved
              </button>
            </div>
          </div>

          {/* Incomplete / Attention Reason Note */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
              Attention / Dispute Note (Included in Social Share):
            </label>
            <textarea
              rows={2}
              value={issueNote}
              onChange={(e) => setIssueNote(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium outline-none focus:border-amber-500"
              placeholder="Describe what needs attention or why the job is incomplete..."
            />
          </div>

          {/* Share to Social Media Channels */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Share2 size={16} className="text-amber-400" />
                <span className="font-black text-xs uppercase tracking-wider">
                  Direct Share to Social Channels
                </span>
              </div>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                Multi-Platform
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Instagram */}
              <button
                type="button"
                onClick={handleOpenInstagram}
                className="py-2.5 px-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Instagram size={15} />
                <span>Instagram</span>
              </button>

              {/* LinkedIn */}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-[#0A66C2] hover:bg-[#084e96] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
              >
                <Linkedin size={15} />
                <span>LinkedIn</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-[#1877F2] hover:bg-[#0d65d9] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
              >
                <Facebook size={15} />
                <span>Facebook</span>
              </a>

              {/* Twitter / 𝕏 */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-black hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 border border-slate-700"
              >
                <Twitter size={15} />
                <span>𝕏 (Twitter)</span>
              </a>
            </div>

            {/* WhatsApp Contractor Group */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <MessageCircle size={15} />
              <span>Broadcast to WhatsApp Trade / Client Group</span>
            </a>
          </div>

          {/* Formatted Text Preview & Copy */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold">
              <span>Pre-Composed Post Copy:</span>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-bold"
              >
                {copiedCaption ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copiedCaption ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <p className="font-mono text-[11px] text-slate-700 whitespace-pre-line leading-relaxed bg-white p-2 rounded-xl border border-slate-200">
              {shareText}
            </p>
          </div>

          {/* Toast */}
          {toastMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleNativeShare}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Share2 size={14} className="text-amber-400" />
            <span>Native Share</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobAttentionSocialShareModal;
