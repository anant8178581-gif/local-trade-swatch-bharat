import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Smartphone, 
  Clock, 
  Check, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  BellRing, 
  ExternalLink, 
  Phone, 
  Sparkles
} from 'lucide-react';
import { Job } from '../types';

export interface RemindCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onReminderSent?: (jobId: string, timestamp: string, message: string) => void;
}

const RemindCustomerModal: React.FC<RemindCustomerModalProps> = ({
  isOpen,
  onClose,
  job,
  onReminderSent
}) => {
  const customerPhone = job.customerPhone || '+91 98201 44521';
  const cleanPhone = customerPhone.replace(/[^\d+]/g, '');
  const jobDetailsUrl = `${window.location.origin}/#job/${job.id}`;

  const defaultTemplates = [
    {
      id: 'status_update',
      label: 'Status Update Awaiting Response',
      text: `[Local Trades India] Hi ${job.customerName}, your artisan updated your service "${job.title}" to ${job.status.toUpperCase()}. Please check details and confirm: ${jobDetailsUrl}`
    },
    {
      id: 'arrival',
      label: 'Artisan On-Site / At Worksite',
      text: `[Local Trades India] Hi ${job.customerName}, your skilled artisan has arrived at ${job.location} for "${job.title}". Please provide entry or call to coordinate.`
    },
    {
      id: 'completion_payment',
      label: 'Work Completed & Final Settlement',
      text: `[Local Trades India] Hi ${job.customerName}, your booking "${job.title}" has been completed (₹${job.finalPrice || job.price}). Please review quality and scan the worker's UPI QR for 0% fee settlement: ${jobDetailsUrl}`
    },
    {
      id: 'requires_attention',
      label: 'Action Required on Pending Update',
      text: `[Local Trades India] Urgent: Hi ${job.customerName}, your service "${job.title}" requires your input regarding: "${job.attentionReason || 'Recent status update'}". Please reply promptly: ${jobDetailsUrl}`
    }
  ];

  // Select initial template based on job status
  const initialTemplateId = 
    job.status === 'completed' 
      ? 'completion_payment' 
      : job.status === 'requires_attention' || job.status === 'incomplete' 
      ? 'requires_attention' 
      : 'status_update';

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId);
  const selectedTemplate = defaultTemplates.find(t => t.id === selectedTemplateId) || defaultTemplates[0];
  const [customMessage, setCustomMessage] = useState<string>(selectedTemplate.text);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const initId = 
        job.status === 'completed' 
          ? 'completion_payment' 
          : job.status === 'requires_attention' || job.status === 'incomplete' 
          ? 'requires_attention' 
          : 'status_update';
      setSelectedTemplateId(initId);
      const tmpl = defaultTemplates.find(t => t.id === initId);
      if (tmpl) setCustomMessage(tmpl.text);
      setSentSuccess(false);
      setCopiedText(false);
    }
  }, [isOpen, job.id, job.status, job.title, job.customerName, job.finalPrice, job.price]);

  // Update custom message when template changes
  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = defaultTemplates.find(t => t.id === id);
    if (tmpl) {
      setCustomMessage(tmpl.text);
    }
  };

  if (!isOpen) return null;

  const handleSendSms = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Construct native SMS URI
    // Modern mobile OS: iOS uses &body, Android uses ?body
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    const smsUri = `sms:${cleanPhone}${separator}body=${encodeURIComponent(customMessage)}`;

    // Trigger SMS application
    window.location.href = smsUri;

    // Log notification in callback
    onReminderSent?.(job.id, timestamp, customMessage);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1800);
  };

  const handleSendWhatsApp = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone.replace('+', '')}&text=${encodeURIComponent(customMessage)}`;
    window.open(waUrl, '_blank');
    onReminderSent?.(job.id, timestamp, customMessage);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1800);
  };

  const handleCopySms = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(customMessage);
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
      }
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
              <BellRing size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-400 text-blue-950 px-2 py-0.5 rounded-full">
                  Automated SMS
                </span>
                <span className="text-[10px] font-mono text-blue-200">
                  {job.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                Remind Customer via SMS
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {sentSuccess ? (
            <div className="p-5 bg-blue-50 border-2 border-blue-300 rounded-2xl text-center space-y-2 animate-in zoom-in-95">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <Check size={26} strokeWidth={3} />
              </div>
              <h4 className="text-base font-black text-blue-950">
                Automated SMS Triggered!
              </h4>
              <p className="text-xs text-blue-800 font-medium">
                Notification dispatched to {job.customerName} ({customerPhone}).
              </p>
            </div>
          ) : (
            <>
              {/* Notice why worker is reminding */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                  <AlertCircle size={14} className="text-amber-600" />
                  <span>Customer Hasn't Responded to Updates</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Send an instant automated SMS to <strong>{job.customerName}</strong> to speed up approval, verify completion, or coordinate access at the worksite.
                </p>
              </div>

              {/* Customer Phone Header */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-500" />
                  <span className="font-bold text-slate-800">{job.customerName}</span>
                </div>
                <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  {customerPhone}
                </span>
              </div>

              {/* Template selector pills */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                  Select Automated Message Template
                </label>
                <div className="space-y-1.5">
                  {defaultTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleSelectTemplate(template.id)}
                      className={`w-full p-2.5 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${
                        selectedTemplateId === template.id
                          ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate pr-2">{template.label}</span>
                      {selectedTemplateId === template.id && (
                        <CheckCircle2 size={15} className="text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable SMS Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    SMS Notification Preview
                  </label>
                  <button
                    type="button"
                    onClick={handleCopySms}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {copiedText ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl font-mono text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none"
                  placeholder="Type automated SMS notification..."
                />
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleSendSms}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  <Send size={14} />
                  <span>Send Automated SMS Directly</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer"
                >
                  <MessageSquare size={14} />
                  <span>Also Ping on WhatsApp</span>
                </button>
              </div>

              <div className="text-center text-[10px] text-slate-400">
                <span>Direct carrier SMS rates may apply • Automated gateway log synchronized</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemindCustomerModal;
