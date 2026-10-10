import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  RotateCw, 
  AlertTriangle, 
  CheckCircle2, 
  Upload, 
  ShieldAlert, 
  FileText, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  IndianRupee, 
  MapPin, 
  Wrench,
  Clock,
  ShieldCheck,
  AlertOctagon,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { Job, JobIssueReport } from '../types';
import { CATEGORIES } from '../constants';

export interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onSubmitReport: (jobId: string, report: JobIssueReport) => void;
}

export type IssueType = 'Incomplete Work' | 'Quality Dispute' | 'Pricing Discrepancy' | 'Property Damage' | 'Worker Conduct' | 'Other';

const ISSUE_TYPE_OPTIONS: { id: IssueType; label: string; desc: string; icon: string }[] = [
  { 
    id: 'Incomplete Work', 
    label: 'Incomplete Work', 
    desc: 'Artisan left before completing all agreed tasks or parts', 
    icon: '⏳' 
  },
  { 
    id: 'Quality Dispute', 
    label: 'Quality Dispute', 
    desc: 'Work does not meet trade standards, leaks, faulty joints or fittings', 
    icon: '⚠️' 
  },
  { 
    id: 'Pricing Discrepancy', 
    label: 'Pricing Discrepancy', 
    desc: 'Disagreement on final charges, unauthorized add-on costs', 
    icon: '💸' 
  },
  { 
    id: 'Property Damage', 
    label: 'Property Damage', 
    desc: 'Accidental breakage or collateral damage to property during service', 
    icon: '💥' 
  },
  { 
    id: 'Worker Conduct', 
    label: 'Worker Conduct', 
    desc: 'Unprofessional behavior, safety violation, or tardiness', 
    icon: '🛑' 
  },
  { 
    id: 'Other', 
    label: 'Other Issue', 
    desc: 'Miscellaneous issue requiring platform dispute review', 
    icon: '📋' 
  }
];

const QUICK_PROMPTS: Record<IssueType, string[]> = {
  'Incomplete Work': [
    'Work stopped halfway and artisan left site',
    'Main fitting done but connecting pipes not joined',
    'Switchboard wired but faceplates not installed',
    'Left without running pressure/flow testing'
  ],
  'Quality Dispute': [
    'Joint leaking under water pressure',
    'MCB sparks/trips when heavy appliance turned on',
    'Cabinet hinges misaligned and door won\'t close',
    'Tile work uneven and adhesive exposed'
  ],
  'Pricing Discrepancy': [
    'Artisan demanded extra cash beyond agreed app price',
    'Charged for spare parts without providing bill/receipt',
    'Dispute regarding visit inspection charges'
  ],
  'Property Damage': [
    'Scratch or crack on bathroom floor tile during drilling',
    'Adjacent pipe dented while fitting main valve',
    'Debris left scattered in living area'
  ],
  'Worker Conduct': [
    'Artisan arrived over 2 hours late without notification',
    'Unsafe electrical practice observed without safety gear',
    'Refused to clean work area after completion'
  ],
  'Other': [
    'Warranty follow-up required for recent service',
    'Need urgent supervisor visit and verification'
  ]
};

const RESOLUTION_OPTIONS = [
  'Free Artisan Rework / Return Visit',
  'Platform Dispute Mediation',
  'Price Adjustment / Partial Refund',
  'Reassign Alternative Certified Artisan'
];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  job,
  onSubmitReport
}) => {
  const [issueType, setIssueType] = useState<IssueType>(
    job.issueReport?.issueType || 'Incomplete Work'
  );
  const [description, setDescription] = useState<string>(
    job.issueReport?.description || job.attentionReason || ''
  );
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>(
    job.issueReport?.severity || 'medium'
  );
  const [desiredResolution, setDesiredResolution] = useState<string>(
    job.issueReport?.desiredResolution || 'Free artisan rework / return visit'
  );
  
  // One-tap Accelerated Dispute Mediation Suggestions state
  const [selectedOneTap, setSelectedOneTap] = useState<string | null>(null);
  const [rescheduleSlot, setRescheduleSlot] = useState<string>('Tomorrow, 10:00 AM (Morning)');
  const [partialRefundValue, setPartialRefundValue] = useState<number>(Math.round(job.price * 0.3) || 300);
  const [isCustomRefund, setIsCustomRefund] = useState<boolean>(false);
  const [customRefundInput, setCustomRefundInput] = useState<string>('');
  const [acceleratedBadgeToast, setAcceleratedBadgeToast] = useState<string | null>(null);

  const handleSelectOneTapResolution = (type: 'reschedule' | 'refund' | 'rework' | 'reassign' | 'mediation') => {
    setSelectedOneTap(type);
    if (type === 'reschedule') {
      const res = `Reschedule appointment (${rescheduleSlot})`;
      setDesiredResolution(res);
      setAcceleratedBadgeToast('⚡ Reschedule Resolution Armed - Artisan will receive priority time-slot request');
      setDescription(prev => prev ? (prev.includes('Proposed:') ? prev : `${prev}\n[Proposed Resolution: Reschedule appointment to ${rescheduleSlot}]`) : `Requesting to reschedule appointment to ${rescheduleSlot}.`);
    } else if (type === 'refund') {
      const refundAmt = isCustomRefund && Number(customRefundInput) > 0 ? Number(customRefundInput) : partialRefundValue;
      const res = `Refund partial amount (₹${refundAmt.toLocaleString('en-IN')})`;
      setDesiredResolution(res);
      setAcceleratedBadgeToast(`⚡ Partial Refund of ₹${refundAmt.toLocaleString('en-IN')} Armed - Payout held in escrow`);
      setDescription(prev => prev ? (prev.includes('Proposed:') ? prev : `${prev}\n[Proposed Resolution: Refund partial amount of ₹${refundAmt} from agreed ₹${job.price}]`) : `Requesting partial refund of ₹${refundAmt} due to incomplete work/dispute.`);
    } else if (type === 'rework') {
      setDesiredResolution('Free artisan rework / return visit');
      setAcceleratedBadgeToast('⚡ Free Rework Armed - Artisan required to revisit and rectify with 0% extra fee');
      setDescription(prev => prev ? (prev.includes('Proposed:') ? prev : `${prev}\n[Proposed Resolution: Free artisan revisit and rework]`) : `Requesting free revisit to complete unfinished work.`);
    } else if (type === 'reassign') {
      setDesiredResolution('Assign alternative certified artisan');
      setAcceleratedBadgeToast('⚡ Alternative Artisan Armed - Next verified specialist dispatched');
    } else if (type === 'mediation') {
      setDesiredResolution('Platform supervisor mediation call (within 15m)');
      setAcceleratedBadgeToast('⚡ Supervisor Mediation Armed - Desk will call client and artisan in 15 mins');
    }
    setTimeout(() => setAcceleratedBadgeToast(null), 4000);
  };

  const handleUpdateRescheduleSlot = (slot: string) => {
    setRescheduleSlot(slot);
    setDesiredResolution(`Reschedule appointment (${slot})`);
  };

  const handleUpdateRefundPreset = (amount: number) => {
    setIsCustomRefund(false);
    setPartialRefundValue(amount);
    setDesiredResolution(`Refund partial amount (₹${amount.toLocaleString('en-IN')})`);
  };
  
  // Camera State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(
    job.issueReport?.photoUrl || null
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedReport, setSubmittedReport] = useState<JobIssueReport | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const category = CATEGORIES.find(c => c.id === job.category) || CATEGORIES[0];

  // Stop camera when modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setIsCameraActive(false);
      setSubmittedReport(null);
    }
  }, [isOpen]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    stopCamera();
    setCameraError(null);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Camera video play error:', e));
      }
    } catch (err: any) {
      console.warn('Direct camera start error:', err);
      setCameraError(err.message || 'Camera permission denied or camera unavailable. Please upload a photo or grant camera permission.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleToggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Draw frame
        ctx.drawImage(video, 0, 0, width, height);

        // Stamp watermarking banner for dispute audit proof
        const bannerH = Math.max(50, Math.floor(height * 0.1));
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, height - bannerH, width, bannerH);

        // Accent line
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(0, height - bannerH, width, 3);

        const now = new Date();
        const timestamp = now.toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'medium'
        });

        // Watermark text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(13, Math.floor(bannerH * 0.3))}px monospace`;
        ctx.fillText(`🚨 EVIDENCE: ${issueType.toUpperCase()} • ${job.title}`, 16, height - bannerH + Math.floor(bannerH * 0.4));

        ctx.fillStyle = '#FBBF24';
        ctx.font = `${Math.max(11, Math.floor(bannerH * 0.24))}px monospace`;
        ctx.fillText(`📅 ${timestamp} • 📍 ${job.location}`, 16, height - bannerH + Math.floor(bannerH * 0.8));

        const snapUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPhotoDataUrl(snapUrl);
        stopCamera();
        setIsCameraActive(false);
      }
    } catch (err: any) {
      console.error('Failed to snap photo:', err);
      setCameraError('Failed to capture snapshot. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setPhotoDataUrl(result);
        stopCamera();
        setIsCameraActive(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !photoDataUrl) {
      alert('Please provide an issue description or snap a photo for evidence.');
      return;
    }

    setIsSubmitting(true);

    const report: JobIssueReport = {
      id: `ISS-${Math.floor(100000 + Math.random() * 900000)}`,
      issueType,
      description: description.trim(),
      photoUrl: photoDataUrl || undefined,
      capturedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      severity,
      status: 'open',
      desiredResolution,
      reportedBy: job.customerName || 'Customer'
    };

    setTimeout(() => {
      onSubmitReport(job.id, report);
      setSubmittedReport(report);
      setIsSubmitting(false);
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 px-5 py-4 text-white flex items-start justify-between relative flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-sm flex-shrink-0">
              <AlertTriangle size={22} className="text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 text-amber-200 px-2 py-0.5 rounded-full">
                  Dispute & Quality Assurance
                </span>
                <span className="text-[10px] font-bold text-white/80">
                  Status: {job.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                Report Issue with Job
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Success Screen after submission */}
          {submittedReport ? (
            <div className="py-4 space-y-4 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Ticket #{submittedReport.id} Created
                </span>
                <h4 className="text-lg font-extrabold text-slate-900 mt-2">
                  Issue Successfully Reported
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  Your dispute regarding <strong>{submittedReport.issueType}</strong> has been logged. Our quality mediation desk and the assigned artisan have been notified.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Job Title</span>
                  <span className="font-extrabold text-slate-900 truncate max-w-[200px]">{job.title}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Reported Issue</span>
                  <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {submittedReport.issueType}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Severity</span>
                  <span className="font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {submittedReport.severity}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Desired Outcome</span>
                  <span className="font-bold text-slate-800">{submittedReport.desiredResolution}</span>
                </div>
                {submittedReport.photoUrl && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[11px] text-slate-500 font-bold block mb-1">
                      Attached Camera Photo Evidence
                    </span>
                    <img 
                      src={submittedReport.photoUrl} 
                      alt="Dispute Evidence" 
                      className="w-full h-36 object-cover rounded-xl border border-slate-300 shadow-xs" 
                    />
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-left">
                <ShieldCheck size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-snug">
                  <strong>Zero-Commission Fair Protection:</strong> Payout remains safeguarded while this ticket is under inspection. You will receive an SMS/WhatsApp status update within 30 minutes.
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-[#0B2447] hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
              >
                Done & Return to Gig
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Job Reference Banner */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-9 h-9 ${category.color} text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs`}>
                    {category.icon}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-black text-slate-900 truncate">{job.title}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                      <span>{category.label}</span>
                      <span>•</span>
                      <span>Customer: {job.customerName}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-black text-[#0B2447] font-mono flex items-center justify-end">
                    <IndianRupee size={12} />{job.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] font-bold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {job.status}
                  </span>
                </div>
              </div>

              {/* Step 1: Select Issue Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-900 flex items-center justify-between">
                  <span>1. Select Issue Type *</span>
                  <span className="text-[10px] text-slate-500 font-normal">Choose category</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ISSUE_TYPE_OPTIONS.map((opt) => {
                    const isSelected = issueType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setIssueType(opt.id);
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                          isSelected
                            ? 'bg-rose-50/80 border-rose-500 text-rose-950 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="text-base leading-none">{opt.icon}</span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block leading-tight">{opt.label}</span>
                          <span className="text-[10px] text-slate-500 line-clamp-1 leading-snug mt-0.5">
                            {opt.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Camera Photo Evidence Capture */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Camera size={14} className="text-rose-600" />
                    <span>2. Direct Camera Photo Evidence</span>
                  </label>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Required for fast dispute
                  </span>
                </div>

                {/* Camera Viewfinder / Preview Container */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-900 text-white min-h-[190px] flex flex-col items-center justify-center p-2">
                  {/* Shutter flash effect */}
                  {shutterFlash && (
                    <div className="absolute inset-0 bg-white z-30 transition-opacity duration-200" />
                  )}

                  {/* Active Live Video Stream */}
                  {isCameraActive ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        autoPlay
                        className="w-full h-56 object-cover rounded-xl bg-black"
                      />

                      {/* Viewfinder Target Reticle Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                        <div className="w-48 h-36 border-2 border-white/60 rounded-xl border-dashed relative">
                          <span className="absolute top-1 left-2 text-[9px] font-mono text-white/80 bg-black/50 px-1 rounded">
                            ALIGN DEFECT / INCOMPLETE WORK
                          </span>
                        </div>
                      </div>

                      {/* Camera Controls Bar */}
                      <div className="absolute bottom-3 left-0 right-0 px-4 flex items-center justify-between z-20">
                        <button
                          type="button"
                          onClick={handleToggleCameraFacing}
                          className="p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md cursor-pointer active:scale-95 transition-all"
                          title="Flip camera"
                        >
                          <RotateCw size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={handleSnapPhoto}
                          disabled={isCapturing}
                          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all border-2 border-white"
                        >
                          <Camera size={16} />
                          <span>{isCapturing ? 'Snapping...' : 'Snap Evidence'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            stopCamera();
                            setIsCameraActive(false);
                          }}
                          className="p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md cursor-pointer"
                          title="Cancel Camera"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : photoDataUrl ? (
                    /* Captured Photo Preview */
                    <div className="relative w-full">
                      <img
                        src={photoDataUrl}
                        alt="Captured Evidence"
                        className="w-full h-56 object-cover rounded-xl"
                      />
                      <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <CheckCircle2 size={11} /> Evidence Photo Attached
                      </div>

                      <div className="absolute bottom-2 right-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera(cameraFacing)}
                          className="px-3 py-1.5 bg-black/75 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1 backdrop-blur-md shadow-md cursor-pointer transition-all"
                        >
                          <RefreshCw size={12} />
                          <span>Retake Camera</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPhotoDataUrl(null)}
                          className="p-1.5 bg-rose-600/80 hover:bg-rose-700 text-white rounded-xl backdrop-blur-md shadow-md cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Inactive State: Buttons to Launch Camera or Upload */
                    <div className="py-6 px-4 text-center space-y-3">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                        <Camera size={28} />
                      </div>
                      <div>
                        <h6 className="text-xs font-bold text-white">
                          Take a photo directly via device camera
                        </h6>
                        <p className="text-[11px] text-slate-300 mt-0.5 max-w-xs mx-auto">
                          Capture clear photo evidence of unfinished fittings, leaks, damage, or equipment for dispute audit.
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => startCamera('environment')}
                          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          <Camera size={14} />
                          <span>Open Live Camera</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                        >
                          <Upload size={13} />
                          <span>Upload File</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {cameraError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                    <AlertOctagon size={15} className="text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Step 3: Detailed Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-900 flex items-center justify-between">
                  <span>3. Issue Description & Notes *</span>
                  <span className="text-[10px] text-slate-500 font-normal">Min 10 characters</span>
                </label>

                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue clearly (e.g. Which valves are leaking, what parts remain uninstalled, or why the work is disputed)..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:border-rose-500 focus:bg-white transition-all resize-none"
                />

                {/* Quick Prompts */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">
                    Quick suggestions for {issueType}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS[issueType].map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setDescription(prev => prev ? `${prev}. ${prompt}` : prompt);
                        }}
                        className="text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-900 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer"
                      >
                        + {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 4: One-Tap Resolution Suggestions (Accelerated Dispute Mediation) */}
              <div className="space-y-2 bg-gradient-to-br from-amber-50/70 via-rose-50/40 to-slate-50 p-3.5 rounded-2xl border-2 border-amber-300/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={15} className="text-amber-600 animate-spin" />
                    <label className="text-xs font-black text-slate-900">
                      4. One-Tap Resolution Suggestions
                    </label>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Accelerated Mediation
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-snug">
                  Choose a 1-tap fast resolution to propose immediate settlement terms to the artisan without protracted back-and-forth.
                </p>

                {/* One-Tap Action Buttons Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Option 1: Reschedule appointment */}
                  <button
                    type="button"
                    onClick={() => handleSelectOneTapResolution('reschedule')}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                      selectedOneTap === 'reschedule'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white hover:bg-blue-50/60 border-slate-200 text-slate-800'
                    }`}
                  >
                    <Clock size={16} className={`flex-shrink-0 mt-0.5 ${selectedOneTap === 'reschedule' ? 'text-white' : 'text-blue-600'}`} />
                    <div className="min-w-0">
                      <span className="text-xs font-black block leading-tight">Reschedule appointment</span>
                      <span className={`text-[10px] line-clamp-1 block mt-0.5 ${selectedOneTap === 'reschedule' ? 'text-blue-100' : 'text-slate-500'}`}>
                        Propose priority rework time slot
                      </span>
                    </div>
                  </button>

                  {/* Option 2: Refund partial amount */}
                  <button
                    type="button"
                    onClick={() => handleSelectOneTapResolution('refund')}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                      selectedOneTap === 'refund'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white hover:bg-emerald-50/60 border-slate-200 text-slate-800'
                    }`}
                  >
                    <IndianRupee size={16} className={`flex-shrink-0 mt-0.5 ${selectedOneTap === 'refund' ? 'text-white' : 'text-emerald-600'}`} />
                    <div className="min-w-0">
                      <span className="text-xs font-black block leading-tight">Refund partial amount</span>
                      <span className={`text-[10px] line-clamp-1 block mt-0.5 ${selectedOneTap === 'refund' ? 'text-emerald-100' : 'text-slate-500'}`}>
                        Settle difference for uncompleted item
                      </span>
                    </div>
                  </button>

                  {/* Option 3: Free artisan rework */}
                  <button
                    type="button"
                    onClick={() => handleSelectOneTapResolution('rework')}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                      selectedOneTap === 'rework'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white hover:bg-rose-50/60 border-slate-200 text-slate-800'
                    }`}
                  >
                    <Wrench size={16} className={`flex-shrink-0 mt-0.5 ${selectedOneTap === 'rework' ? 'text-white' : 'text-rose-600'}`} />
                    <div className="min-w-0">
                      <span className="text-xs font-black block leading-tight">Free rework visit</span>
                      <span className={`text-[10px] line-clamp-1 block mt-0.5 ${selectedOneTap === 'rework' ? 'text-rose-100' : 'text-slate-500'}`}>
                        Return to site & fix at 0% fee
                      </span>
                    </div>
                  </button>

                  {/* Option 4: Alternative artisan */}
                  <button
                    type="button"
                    onClick={() => handleSelectOneTapResolution('reassign')}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                      selectedOneTap === 'reassign'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white hover:bg-purple-50/60 border-slate-200 text-slate-800'
                    }`}
                  >
                    <ShieldCheck size={16} className={`flex-shrink-0 mt-0.5 ${selectedOneTap === 'reassign' ? 'text-white' : 'text-purple-600'}`} />
                    <div className="min-w-0">
                      <span className="text-xs font-black block leading-tight">Assign other artisan</span>
                      <span className={`text-[10px] line-clamp-1 block mt-0.5 ${selectedOneTap === 'reassign' ? 'text-purple-100' : 'text-slate-500'}`}>
                        Switch technician under guarantee
                      </span>
                    </div>
                  </button>
                </div>

                {/* Sub-Selection: Reschedule Slot Selection */}
                {selectedOneTap === 'reschedule' && (
                  <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                    <span className="text-[10px] font-bold text-blue-900 block">
                      Choose preferred reschedule time slot:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        'Tonight, 06:30 PM (Evening)',
                        'Tomorrow, 10:00 AM (Morning)',
                        'Tomorrow, 03:00 PM (Afternoon)',
                        'Saturday, 11:00 AM (Weekend)'
                      ].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleUpdateRescheduleSlot(slot)}
                          className={`p-2 rounded-xl text-[10px] font-bold text-left transition-all cursor-pointer ${
                            rescheduleSlot === slot
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-white hover:bg-blue-100 text-blue-950 border border-blue-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Selection: Partial Refund Preset Selection */}
                {selectedOneTap === 'refund' && (
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-900">
                        Select proposed refund amount (Job total: ₹{job.price.toLocaleString('en-IN')}):
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: 'Flat ₹200', val: 200 },
                        { label: `25% (₹${Math.round(job.price * 0.25)})`, val: Math.round(job.price * 0.25) },
                        { label: `50% (₹${Math.round(job.price * 0.5)})`, val: Math.round(job.price * 0.5) },
                        { label: `75% (₹${Math.round(job.price * 0.75)})`, val: Math.round(job.price * 0.75) }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleUpdateRefundPreset(preset.val)}
                          className={`p-2 rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer ${
                            !isCustomRefund && partialRefundValue === preset.val
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom Refund input toggle */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCustomRefund(!isCustomRefund)}
                        className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                      >
                        {isCustomRefund ? 'Use presets' : 'Enter custom refund amount'}
                      </button>

                      {isCustomRefund && (
                        <div className="flex items-center gap-1.5 flex-1">
                          <span className="text-xs font-mono font-bold text-emerald-900">₹</span>
                          <input
                            type="number"
                            value={customRefundInput}
                            onChange={(e) => {
                              setCustomRefundInput(e.target.value);
                              if (Number(e.target.value) > 0) {
                                setDesiredResolution(`Refund partial amount (₹${Number(e.target.value).toLocaleString('en-IN')})`);
                              }
                            }}
                            placeholder="Enter amount"
                            className="w-full p-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Live Toast Confirmation when one-tap is selected */}
                {acceleratedBadgeToast && (
                  <div className="p-2 bg-amber-100 border border-amber-300 rounded-xl text-[11px] font-extrabold text-amber-950 flex items-center gap-1.5 animate-in fade-in duration-200">
                    <CheckCircle2 size={13} className="text-amber-700 flex-shrink-0" />
                    <span>{acceleratedBadgeToast}</span>
                  </div>
                )}
              </div>

              {/* Step 5: Severity & Desired Resolution Confirmation */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-900 block">
                    5. Severity
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['low', 'medium', 'high'] as const).map((sev) => {
                      const isSel = severity === sev;
                      return (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setSeverity(sev)}
                          className={`py-1.5 text-[10px] font-black uppercase rounded-xl border transition-all cursor-pointer ${
                            isSel
                              ? sev === 'high'
                                ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                                : sev === 'medium'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                                : 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {sev}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-900 block">
                    6. Active Desired Outcome
                  </label>
                  <input
                    type="text"
                    value={desiredResolution}
                    onChange={(e) => setDesiredResolution(e.target.value)}
                    placeholder="Selected resolution"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || (!description.trim() && !photoDataUrl)}
                  className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 ${
                    isSubmitting || (!description.trim() && !photoDataUrl)
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 hover:from-rose-500 hover:to-amber-600 text-white'
                  }`}
                >
                  <AlertTriangle size={15} />
                  <span>{isSubmitting ? 'Submitting Dispute...' : 'Submit Issue & Evidence'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportIssueModal;
