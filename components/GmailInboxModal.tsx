import React, { useState } from 'react';
import { 
  Mail, 
  ArrowLeft, 
  Star, 
  Trash2, 
  Archive, 
  MoreVertical, 
  Reply, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X
} from 'lucide-react';
import Logo from './Logo';

interface GmailInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailRecipient: string;
  otpCode: string;
  onAutoFillOtp?: (code: string) => void;
}

const GmailInboxModal: React.FC<GmailInboxModalProps> = ({
  isOpen,
  onClose,
  emailRecipient,
  otpCode,
  onAutoFillOtp
}) => {
  const [copied, setCopied] = useState(false);
  const [starred, setStarred] = useState(true);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(otpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyOtp = () => {
    if (onAutoFillOtp) {
      onAutoFillOtp(otpCode);
    }
    onClose();
  };

  const handleOpenExternalMail = () => {
    const subject = encodeURIComponent(`Local Trades India Verification Code: ${otpCode}`);
    const body = encodeURIComponent(`Your Local Trades India 6-digit OTP is ${otpCode}. Valid for 10 minutes.`);
    window.open(`mailto:${emailRecipient}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Android Gmail App Bar */}
        <div className="bg-[#EA4335] text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-all active:scale-95"
              title="Back to App"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-1.5">
              <Mail size={18} className="text-white" />
              <span className="font-bold text-sm tracking-tight">Gmail for Android</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setStarred(!starred)} 
              className="p-1.5 hover:bg-white/20 rounded-full"
            >
              <Star size={18} className={starred ? "fill-amber-300 text-amber-300" : "text-white"} />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Gmail Message Body Container */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-gray-800">
          {/* Subject Line */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-black text-gray-900 leading-snug">
                {otpCode} is your Local Trades India verification code
              </h2>
              <span className="bg-red-50 text-red-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-red-100 flex-shrink-0">
                Inbox
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold mt-1">Today, Just now (0 minutes ago)</p>
          </div>

          {/* Sender Header */}
          <div className="flex items-center justify-between border-y border-gray-100 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-md">
                LT
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-black text-gray-900">Local Trades Security</p>
                  <ShieldCheck size={14} className="text-blue-600" />
                </div>
                <p className="text-[10px] text-gray-500 font-mono">security@localtrades.in</p>
                <p className="text-[10px] text-gray-400">to {emailRecipient}</p>
              </div>
            </div>

            <button 
              onClick={handleOpenExternalMail}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              title="Open in System Email Client"
            >
              <ExternalLink size={16} />
            </button>
          </div>

          {/* Styled HTML Email Template Card */}
          <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Logo size={24} />
                <span className="text-xs font-black text-gray-900 tracking-tight">Local Trades India</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Google Verified Bridge
              </span>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed font-medium">
              We received a request to verify your account or identity with this email address (<strong>{emailRecipient}</strong>).
            </p>

            {/* OTP Code Box */}
            <div className="bg-blue-50/80 border-2 border-dashed border-blue-300 rounded-2xl p-4 text-center space-y-2">
              <span className="text-[10px] font-black uppercase text-blue-700 tracking-widest">
                One-Time Verification Code (OTP)
              </span>
              <div className="text-3xl font-black font-mono tracking-[0.25em] text-blue-950 select-all py-1">
                {otpCode}
              </div>
              <p className="text-[10px] text-blue-600 font-bold">
                Valid for 10 minutes • Do not share with anyone
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button 
                onClick={handleCopy}
                className="py-3 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>

              <button 
                onClick={handleApplyOtp}
                className="py-3 px-3 bg-[#2D4356] hover:bg-blue-900 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Check size={14} /> Auto-Fill & Verify
              </button>
            </div>

            <div className="border-t border-gray-100 pt-3 text-[10px] text-gray-400 space-y-1">
              <p>Security Alert: If you did not request this OTP, you can safely ignore this email.</p>
              <p className="font-mono text-[9px]">Ref ID: LT-AUTH-{Date.now().toString().slice(-6)} • IP: Verified Indian Gateway</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="text-[10px] font-bold">Delivered to {emailRecipient}</span>
          <button 
            onClick={onClose}
            className="text-xs font-black text-blue-600 uppercase hover:underline"
          >
            Return to App
          </button>
        </div>
      </div>
    </div>
  );
};

export default GmailInboxModal;
