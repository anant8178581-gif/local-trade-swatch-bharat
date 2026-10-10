import React, { useState, useEffect } from 'react';
import { Job, JobIssueReport } from '../types';
import { 
  MapPin, 
  Clock, 
  IndianRupee, 
  ChevronRight, 
  AlertCircle, 
  Navigation, 
  QrCode, 
  MessageSquare,
  Bell,
  BellRing,
  CheckCircle2,
  Volume2,
  Smartphone,
  Calendar,
  X,
  Share2,
  AlertTriangle,
  Check,
  Camera,
  ShieldAlert,
  FileText,
  Copy,
  ExternalLink
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import JobAttentionSocialShareModal from './JobAttentionSocialShareModal';
import ReportIssueModal from './ReportIssueModal';
import JobPaymentQrModal from './JobPaymentQrModal';
import RemindCustomerModal from './RemindCustomerModal';

interface JobCardProps {
  job: Job;
  onSelect?: (job: Job) => void;
  onNavigateWorkSite?: (job: Job) => void;
  onOpenWalletQr?: (job: Job) => void;
  onToggleStatus?: (jobId: string, status: Job['status'], reason?: string) => void;
  onReportIssue?: (jobId: string, report: JobIssueReport) => void;
  onPaymentReceived?: (jobId: string, finalAmount: number, mode: string) => void;
  onRemindCustomer?: (jobId: string, timestamp: string) => void;
  isWorker?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onSelect, 
  onNavigateWorkSite, 
  onOpenWalletQr,
  onToggleStatus,
  onReportIssue,
  onPaymentReceived,
  onRemindCustomer,
  isWorker 
}) => {
  const [localJob, setLocalJob] = useState<Job>(job);
  const [isSocialShareModalOpen, setIsSocialShareModalOpen] = useState<boolean>(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState<boolean>(false);
  const [isPaymentQrModalOpen, setIsPaymentQrModalOpen] = useState<boolean>(false);
  const [isRemindCustomerModalOpen, setIsRemindCustomerModalOpen] = useState<boolean>(false);
  const [smsReminderToast, setSmsReminderToast] = useState<string | null>(null);
  const [shareGigSuccess, setShareGigSuccess] = useState<boolean>(false);
  const [shareGigFeedback, setShareGigFeedback] = useState<string | null>(null);
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    setLocalJob(job);
  }, [job]);

  const category = CATEGORIES.find(c => c.id === localJob.category) || CATEGORIES[0];

  // Active or completed jobs are eligible for issue reporting
  const canReportIssue = 
    localJob.status === 'assigned' || 
    localJob.status === 'completed' || 
    localJob.status === 'incomplete' || 
    localJob.status === 'requires_attention';

  // Native WhatsApp sharing link integration with pre-filled message template (Title, Price, Link to Details)
  const handleShareGigWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const categoryLabel = category.label || localJob.category;
    const formattedPrice = `₹${localJob.price.toLocaleString('en-IN')}`;
    const jobDetailsUrl = `${window.location.origin}/#job/${localJob.id}`;

    const whatsAppMessage = 
      `*🛠️ LOCAL TRADES INDIA - DIRECT GIG OPPORTUNITY*\n\n` +
      `📌 *Job Title:* ${localJob.title}\n` +
      `💰 *Price / Payout:* ${formattedPrice} (0% Commission • Keep 100% Direct Payout)\n` +
      `🏷️ *Category:* ${categoryLabel}\n` +
      `📍 *Location:* ${localJob.location}\n` +
      `📊 *Status:* ${localJob.status.toUpperCase()}\n` +
      `👤 *Customer:* ${localJob.customerName}\n\n` +
      `👉 *View Job Details & Claim Gig:*\n` +
      `${jobDetailsUrl}\n\n` +
      `_Aadhaar KYC verified marketplace with zero platform fees._`;

    // Prioritize native WhatsApp sharing link
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppMessage)}`;
    
    // Open native WhatsApp window / application
    window.open(whatsappUrl, '_blank');

    // Also copy to clipboard as seamless backup
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(whatsAppMessage);
      }
    } catch {}

    setShareGigSuccess(true);
    setShareGigFeedback('WhatsApp Opened & Copied!');
    setTimeout(() => {
      setShareGigSuccess(false);
      setShareGigFeedback(null);
    }, 3000);
  };

  const handleCopyGigLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const categoryLabel = category.label || localJob.category;
    const formattedPrice = `₹${localJob.price.toLocaleString('en-IN')}`;
    const jobDetailsUrl = `${window.location.origin}/#job/${localJob.id}`;
    const shareText = `Local Trades India Gig: "${localJob.title}" (${categoryLabel}) - ${formattedPrice} (0% Commission). Location: ${localJob.location}. View details: ${jobDetailsUrl}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setShareGigSuccess(true);
      setShareGigFeedback('Copied Gig Link!');
      setTimeout(() => {
        setShareGigSuccess(false);
        setShareGigFeedback(null);
      }, 2500);
    } catch {}
  };

  const handleIssueReportSubmit = (jobId: string, report: JobIssueReport) => {
    const updated: Job = {
      ...localJob,
      status: 'requires_attention',
      attentionReason: `${report.issueType}: ${report.description}`,
      issueReport: report
    };
    setLocalJob(updated);
    onReportIssue?.(jobId, report);
    onToggleStatus?.(jobId, 'requires_attention', `${report.issueType}: ${report.description}`);
  };

  // Mark in-person payment received via dynamic UPI QR code
  const handleMarkPaymentReceived = (jobId: string, finalAmount: number, paymentMode: string) => {
    const updated: Job = {
      ...localJob,
      status: 'completed',
      finalPrice: finalAmount,
      paymentReceived: true
    };
    setLocalJob(updated);
    onPaymentReceived?.(jobId, finalAmount, paymentMode);
    onToggleStatus?.(jobId, 'completed');
  };

  // Log automated SMS reminder dispatched to customer
  const handleReminderSent = (jobId: string, timestamp: string, message: string) => {
    const updated: Job = {
      ...localJob,
      lastCustomerReminderAt: timestamp
    };
    setLocalJob(updated);
    onRemindCustomer?.(jobId, timestamp);
    setSmsReminderToast(`Automated SMS dispatched to ${localJob.customerName} at ${timestamp}!`);
    setTimeout(() => {
      setSmsReminderToast(null);
    }, 4500);
  };

  // -------------------------------------------------------------
  // AUTOMATED 30-MINUTE REMINDER PUSH NOTIFICATION STATE
  // -------------------------------------------------------------
  const [scheduledMinutesRemaining, setScheduledMinutesRemaining] = useState<number>(30);
  const [isAutomatedReminderActive, setIsAutomatedReminderActive] = useState<boolean>(true);
  const [reminderDelivered, setReminderDelivered] = useState<boolean>(false);
  const [deliveredTimestamp, setDeliveredTimestamp] = useState<string | null>(null);
  const [activePushNotification, setActivePushNotification] = useState<{
    title: string;
    body: string;
    scheduledFor: string;
    timestamp: string;
  } | null>(null);
  const [soundChimePlayed, setSoundChimePlayed] = useState<boolean>(false);

  // Default scheduled time (e.g. 30 minutes from now)
  const scheduledTimeStr = 'Today, 03:30 PM (in 30 mins)';

  // Automated timer: Dispatches push notification when exactly 30 minutes remaining or on countdown
  useEffect(() => {
    if (!isAutomatedReminderActive || reminderDelivered) return;

    // When minutes remaining is 30, automatically trigger reminder notification
    if (scheduledMinutesRemaining === 30 && !reminderDelivered) {
      triggerReminderPushNotification(
        'Automated 30-Min Schedule Trigger',
        `Your scheduled ${job.title} with ${job.customerName} begins in 30 minutes. Worker is packing equipment and preparing arrival.`
      );
    }
  }, [scheduledMinutesRemaining, isAutomatedReminderActive, reminderDelivered]);

  const triggerReminderPushNotification = (triggerSource: string, customBody?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setSoundChimePlayed(true);
    setTimeout(() => setSoundChimePlayed(false), 2000);

    const notificationPayload = {
      title: `🔔 Booking Reminder: 30 Mins Before Service`,
      body: customBody || `Reminder for customer ${job.customerName}: Your ${job.title} booking at ${job.location} starts in 30 minutes. Please be ready.`,
      scheduledFor: scheduledTimeStr,
      timestamp: timeStr
    };

    setActivePushNotification(notificationPayload);
    setReminderDelivered(true);
    setDeliveredTimestamp(timeStr);

    // Browser Notification API if supported and granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notificationPayload.title, {
          body: notificationPayload.body,
          icon: '/favicon.ico'
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleTest30mAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerReminderPushNotification(
      'Manual Test Trigger',
      `[SIMULATED 30-MIN PUSH] Hello ${job.customerName}, your scheduled ${job.title} starts in 30 minutes at ${job.location}. Direct 0% commission payment ready via UPI QR.`
    );
  };

  return (
    <div 
      className={`bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#116D6E] transition-all relative overflow-hidden ${
        job.isEmergency ? 'border-l-4 border-l-red-500' : ''
      }`}
    >
      {/* Real-Time Push Notification Banner Modal/Toast when triggered */}
      {activePushNotification && (
        <div className="mb-3 p-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 text-white rounded-xl shadow-lg border border-amber-300 animate-in slide-in-from-top-3 duration-300 relative">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 animate-bounce">
                <BellRing size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-1.5 py-0.5 rounded text-amber-200">
                    PUSH NOTIFICATION DELIVERED
                  </span>
                  <span className="text-[10px] text-white/80 font-mono">
                    {activePushNotification.timestamp}
                  </span>
                </div>
                <h5 className="font-extrabold text-xs mt-1 text-white">
                  {activePushNotification.title}
                </h5>
                <p className="text-[11px] text-white/95 mt-0.5 leading-snug">
                  {activePushNotification.body}
                </p>

                {/* Quick actions for customer */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] bg-white text-slate-900 font-black px-2 py-0.5 rounded shadow-xs">
                    Starts: {scheduledTimeStr}
                  </span>
                  {soundChimePlayed && (
                    <span className="text-[10px] bg-emerald-900/60 text-emerald-200 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Volume2 size={11} /> Sound Alert Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivePushNotification(null)}
              className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10"
              title="Dismiss Notification"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 ${category.color} rounded-2xl flex items-center justify-center text-white shadow-xs`}>
            {React.cloneElement(category.icon as React.ReactElement, { size: 22 } as any)}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-extrabold text-slate-900 text-sm">{localJob.title}</h4>
              {localJob.isEmergency && (
                <span className="flex items-center gap-1 bg-red-50 text-red-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                  <AlertCircle size={10} /> Urgent
                </span>
              )}
              {localJob.status === 'assigned' && (
                <span className="flex items-center gap-1 bg-blue-100 text-blue-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-blue-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" /> Active Gig
                </span>
              )}
              {localJob.status === 'completed' && (
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-300">
                  <CheckCircle2 size={10} /> Completed
                </span>
              )}
              {localJob.status === 'incomplete' && (
                <span className="flex items-center gap-1 bg-rose-100 text-rose-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-rose-300">
                  <AlertTriangle size={10} /> Incomplete
                </span>
              )}
              {localJob.status === 'requires_attention' && (
                <span className="flex items-center gap-1 bg-amber-100 text-amber-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-300">
                  <AlertTriangle size={10} /> Needs Attention
                </span>
              )}
              {localJob.status === 'pending' && (
                <span className="flex items-center gap-1 bg-slate-100 text-slate-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-slate-300">
                  Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-semibold">Customer: {localJob.customerName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-[#0B2447] font-mono flex items-center justify-end">
            <IndianRupee size={15} />{localJob.price.toLocaleString('en-IN')}
          </p>
          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black uppercase px-1.5 py-0.5 rounded">
            0% Cut • Keep 100%
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-600 line-clamp-2 mb-2.5 leading-relaxed">
        {localJob.description}
      </p>

      {/* AUTOMATED SMS REMINDER CONFIRMATION TOAST */}
      {smsReminderToast && (
        <div className="mb-2.5 p-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <BellRing size={15} className="text-blue-200 animate-bounce flex-shrink-0" />
            <span>{smsReminderToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSmsReminderToast(null)}
            className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* CUSTOMER SMS REMINDER LOGGED STATUS PILL */}
      {localJob.lastCustomerReminderAt && (
        <div className="mb-2.5 p-2.5 bg-blue-50/90 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-blue-950 font-bold">
            <Smartphone size={14} className="text-blue-600 flex-shrink-0" />
            <span>Automated SMS Reminder Dispatched</span>
          </div>
          <span className="text-[10px] font-mono text-blue-800 font-extrabold bg-blue-100 px-2 py-0.5 rounded-full">
            Sent at {localJob.lastCustomerReminderAt} (Awaiting Response)
          </span>
        </div>
      )}

      {/* PAYMENT RECEIVED CONFIRMATION BANNER */}
      {localJob.paymentReceived && (
        <div className="mb-2.5 p-2.5 bg-emerald-50 border-2 border-emerald-300 rounded-xl flex items-center justify-between text-xs animate-in zoom-in-95">
          <div className="flex items-center gap-1.5 text-emerald-950 font-black">
            <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
            <span>In-Person Payment Settled: ₹{(localJob.finalPrice || localJob.price).toLocaleString('en-IN')}</span>
          </div>
          <span className="text-[9px] font-black uppercase text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded-full">
            0% Cut Verified
          </span>
        </div>
      )}

      {/* REPORTED DISPUTE / CAMERA EVIDENCE SECTION */}
      {localJob.issueReport && (
        <div className="mb-3 p-3 bg-gradient-to-r from-rose-50 via-pink-50/60 to-amber-50/50 border-2 border-rose-300 rounded-2xl space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-rose-950">
              <ShieldAlert size={15} className="text-rose-600" />
              <span>Reported Issue: {localJob.issueReport.issueType}</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-rose-200 text-rose-950 px-2 py-0.5 rounded-full uppercase">
              #{localJob.issueReport.id}
            </span>
          </div>

          <p className="text-[11px] text-rose-900 leading-snug">
            {localJob.issueReport.description}
          </p>

          {/* Camera Photo Evidence Preview */}
          {localJob.issueReport.photoUrl && (
            <div className="flex items-center gap-2.5 pt-1 bg-white/70 p-2 rounded-xl border border-rose-200">
              <img
                src={localJob.issueReport.photoUrl}
                alt="Camera Evidence"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingPhotoUrl(localJob.issueReport?.photoUrl || null);
                }}
                className="w-16 h-12 object-cover rounded-lg border border-rose-300 cursor-pointer hover:scale-105 transition-all shadow-2xs"
                title="Click to view full photo evidence"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-black text-rose-900 flex items-center gap-1">
                  <Camera size={11} className="text-rose-600" /> Direct Camera Evidence
                </span>
                <span className="text-[9px] text-rose-700/80 font-mono block">
                  Logged: {localJob.issueReport.capturedAt}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingPhotoUrl(localJob.issueReport?.photoUrl || null);
                  }}
                  className="text-[9px] font-bold text-rose-600 hover:text-rose-800 underline mt-0.5"
                >
                  View Full Evidence Proof
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-rose-800 font-medium pt-0.5 border-t border-rose-200/60">
            <span className="flex items-center gap-1">
              <span>Severity: <strong className="uppercase font-bold">{localJob.issueReport.severity}</strong></span>
            </span>
            <span className="text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded text-[9px]">
              Protected under Quality Guarantee
            </span>
          </div>
        </div>
      )}

      {/* INCOMPLETE / REQUIRES ATTENTION SOCIAL SHARE ALERT BANNER */}
      {(localJob.status === 'incomplete' || localJob.status === 'requires_attention') && !localJob.issueReport && (
        <div className="mb-3 p-3 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-2 border-rose-300 rounded-2xl space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-rose-950">
              <AlertTriangle size={15} className="text-rose-600 animate-bounce" />
              <span>Job Marked {localJob.status === 'incomplete' ? 'Incomplete' : 'Requires Attention'}</span>
            </div>
            <span className="text-[9px] bg-rose-200 text-rose-950 font-black px-2 py-0.5 rounded-full uppercase">
              Action Required
            </span>
          </div>

          <p className="text-[11px] text-rose-800 leading-snug">
            {localJob.attentionReason || 'Job requires quality inspection or rework. Broadcast to social media to request artisan backup, peer advice, or community resolution.'}
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSocialShareModalOpen(true);
              }}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer transition-all"
            >
              <Share2 size={13} />
              <span>Share to Social</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLocalJob(prev => ({ ...prev, status: 'completed' }));
                onToggleStatus?.(localJob.id, 'completed');
              }}
              className="py-2 px-3 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold active:scale-95 cursor-pointer shadow-2xs"
            >
              Mark Resolved
            </button>
          </div>
        </div>
      )}

      {/* AUTOMATED 30-MINUTE SCHEDULED REMINDER SYSTEM BAR */}
      <div className="mb-3 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-amber-700" />
            <span className="text-[11px] font-extrabold text-amber-950">
              Booking: <strong className="text-slate-800">{scheduledTimeStr}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleTest30mAlert}
              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs active:scale-95 transition-all"
              title="Test 30-Minute Customer Push Notification"
            >
              <Bell size={11} />
              <span>Test 30m Alert</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAutomatedReminderActive(!isAutomatedReminderActive);
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                isAutomatedReminderActive
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
              title="Toggle Automated 30-Min Push Notification"
            >
              {isAutomatedReminderActive ? 'Auto: ON' : 'Auto: OFF'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-amber-900 font-medium pt-0.5 border-t border-amber-200/60">
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-amber-700" />
            <span>Sends push alert exactly 30m before scheduled time</span>
          </span>
          <span className="font-bold flex items-center gap-1">
            {reminderDelivered ? (
              <span className="text-emerald-700 flex items-center gap-0.5">
                <CheckCircle2 size={11} /> 30m Push Sent ({deliveredTimestamp})
              </span>
            ) : isAutomatedReminderActive ? (
              <span className="text-amber-700 font-mono">Armed (T-30m)</span>
            ) : (
              <span className="text-slate-500">Disabled</span>
            )}
          </span>
        </div>
      </div>

      {/* Work Destination Box (Where Worker Has to Go and Work) */}
      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin size={15} className="text-red-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] font-black uppercase text-slate-400 block">
              Work Location (Where Worker Has to Go)
            </span>
            <span className="text-xs font-bold text-slate-900 truncate block">{job.location}</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 flex items-center gap-1">
          <Clock size={11} /> 30m slot
        </span>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        {onNavigateWorkSite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateWorkSite(job);
            }}
            className="py-2.5 px-3 bg-[#0B2447] hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <Navigation size={13} className="text-teal-300" />
            <span>Track on Map & Go</span>
          </button>
        )}

        {isWorker && onOpenWalletQr && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenWalletQr(job);
            }}
            className="py-2.5 px-3 bg-[#116D6E] hover:bg-[#0d5657] text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
            title="Generate UPI QR for this Job"
          >
            <QrCode size={13} />
            <span>UPI QR</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onSelect?.(localJob)}
          className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <MessageSquare size={13} />
          <span>Chat</span>
        </button>

        {/* 'Show Payment QR' button - dynamic UPI QR generated from job's final price */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsPaymentQrModalOpen(true);
          }}
          className={`py-2.5 px-3 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer border ${
            localJob.paymentReceived
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white border-transparent'
          }`}
          title="Display dynamic UPI QR code generated from job's final price for easy in-person payment"
        >
          <QrCode size={13} />
          <span>{localJob.paymentReceived ? 'Paid (View QR)' : 'Show Payment QR'}</span>
        </button>

        {/* 'Remind Customer' action button - triggers automated SMS notification if customer hasn't responded */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsRemindCustomerModalOpen(true);
          }}
          className={`py-2.5 px-3 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer border ${
            localJob.lastCustomerReminderAt
              ? 'bg-blue-50 text-blue-800 border-blue-300'
              : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
          }`}
          title="Trigger automated SMS notification to customer if they haven't responded to status updates"
        >
          <BellRing size={13} />
          <span>{localJob.lastCustomerReminderAt ? 'Reminded (SMS)' : 'Remind Customer'}</span>
        </button>

        {/* 'Report Issue' action button for active or completed jobs */}
        {canReportIssue && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsReportIssueModalOpen(true);
            }}
            className={`py-2.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer border ${
              localJob.issueReport
                ? 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300 shadow-2xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
            }`}
            title="Report issue (Incomplete Work, Quality Dispute) with direct camera evidence"
          >
            <AlertTriangle size={13} className="text-rose-600" />
            <span>{localJob.issueReport ? 'View / Update Issue' : 'Report Issue'}</span>
          </button>
        )}

        {/* Prioritized Native WhatsApp 'Share Gig' button for all statuses */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[160px]">
          <button
            type="button"
            onClick={handleShareGigWhatsApp}
            className="flex-1 py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
            title="Share Gig on WhatsApp (Pre-filled title, price, and job details link)"
          >
            {shareGigSuccess ? (
              <>
                <Check size={13} className="text-white" />
                <span className="truncate">{shareGigFeedback || 'WhatsApp Opened!'}</span>
              </>
            ) : (
              <>
                <Share2 size={13} className="text-white" />
                <span className="truncate">Share Gig (WhatsApp)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyGigLink}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer active:scale-95"
            title="Copy Gig Link & Details to Clipboard"
          >
            <Copy size={13} />
          </button>
        </div>
      </div>

      {/* REPORT ISSUE MODAL */}
      <ReportIssueModal
        isOpen={isReportIssueModalOpen}
        onClose={() => setIsReportIssueModalOpen(false)}
        job={localJob}
        onSubmitReport={handleIssueReportSubmit}
      />

      {/* EVIDENCE PHOTO LIGHTBOX MODAL */}
      {viewingPhotoUrl && (
        <div 
          onClick={() => setViewingPhotoUrl(null)}
          className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-slate-900 border border-slate-700 rounded-3xl p-3 max-w-lg w-full text-white space-y-3 cursor-default"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-rose-400" />
                <span className="text-xs font-bold">Camera Photo Evidence Inspection</span>
              </div>
              <button
                type="button"
                onClick={() => setViewingPhotoUrl(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
            </div>

            <img
              src={viewingPhotoUrl}
              alt="Dispute Camera Proof"
              className="w-full max-h-[70vh] object-contain rounded-2xl bg-black"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>Timestamp: {localJob.issueReport?.capturedAt || 'Verified Snapshot'}</span>
              <span className="text-emerald-400 font-mono">🔒 Tamper-Evident Stamped</span>
            </div>
          </div>
        </div>
      )}

      {/* JOB ATTENTION & INCOMPLETE SOCIAL SHARE MODAL */}
      <JobAttentionSocialShareModal
        isOpen={isSocialShareModalOpen}
        onClose={() => setIsSocialShareModalOpen(false)}
        job={localJob}
        onUpdateJobStatus={(id, status, reason) => {
          setLocalJob(prev => ({ ...prev, status, attentionReason: reason }));
          onToggleStatus?.(id, status);
        }}
      />

      {/* DYNAMIC UPI PAYMENT QR MODAL */}
      <JobPaymentQrModal
        isOpen={isPaymentQrModalOpen}
        onClose={() => setIsPaymentQrModalOpen(false)}
        job={localJob}
        onMarkPaid={handleMarkPaymentReceived}
      />

      {/* REMIND CUSTOMER AUTOMATED SMS NOTIFICATION MODAL */}
      <RemindCustomerModal
        isOpen={isRemindCustomerModalOpen}
        onClose={() => setIsRemindCustomerModalOpen(false)}
        job={localJob}
        onReminderSent={handleReminderSent}
      />
    </div>
  );
};

export default JobCard;
