import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  Check, 
  Copy, 
  IndianRupee, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone, 
  Sparkles, 
  Share2, 
  ExternalLink, 
  ArrowRight, 
  Layers, 
  Banknote
} from 'lucide-react';
import { Job } from '../types';
import SvgUpiQrCode from './SvgUpiQrCode';

export interface JobPaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onMarkPaid?: (jobId: string, finalAmount: number, paymentMode: string) => void;
}

const JobPaymentQrModal: React.FC<JobPaymentQrModalProps> = ({
  isOpen,
  onClose,
  job,
  onMarkPaid
}) => {
  const initialPrice = job.finalPrice || job.price;
  const [finalPrice, setFinalPrice] = useState<number>(initialPrice);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState<boolean>(Boolean(job.paymentReceived));
  const [selectedMethod, setSelectedMethod] = useState<'qr' | 'gpay' | 'phonepe' | 'cash'>('qr');
  const [extraNote, setExtraNote] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setFinalPrice(job.finalPrice || job.price);
      setIsPaidSuccess(Boolean(job.paymentReceived));
      setCopiedUpi(false);
    }
  }, [isOpen, job.id, job.finalPrice, job.price, job.paymentReceived]);

  if (!isOpen) return null;

  const upiId = 'localtrades.pay@icici';
  const cleanTitle = job.title.replace(/[^\w\s-]/g, '').slice(0, 30);
  const upiIntentUri = `upi://pay?pa=${upiId}&pn=LocalTradesIndia&am=${finalPrice}&cu=INR&tn=${encodeURIComponent(`JOB-${job.id}-${cleanTitle}`)}`;

  const handleCopyUpi = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(upiIntentUri);
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2500);
      }
    } catch {}
  };

  const handleOpenApp = (scheme: string) => {
    const url = `${scheme}://${upiIntentUri.replace('upi://', '')}`;
    window.open(url, '_blank');
  };

  const handleConfirmPaid = (mode: string) => {
    setIsPaidSuccess(true);
    onMarkPaid?.(job.id, finalPrice, mode);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 text-white">
              <QrCode size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full">
                  Dynamic UPI QR
                </span>
                <span className="text-[10px] font-mono text-emerald-200">
                  #{job.id}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                In-Person Customer Payment
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
          {/* Success Banner if Marked Paid */}
          {isPaidSuccess ? (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-center space-y-2 animate-in zoom-in-95">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <Check size={26} strokeWidth={3} />
              </div>
              <h4 className="text-base font-black text-emerald-950">
                Payment Recorded Successfully!
              </h4>
              <p className="text-xs text-emerald-800 font-medium">
                Received ₹{finalPrice.toLocaleString('en-IN')} with 0% platform fee deduction.
              </p>
            </div>
          ) : (
            <>
              {/* Job & Customer Summary Card */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400">Target Gig</span>
                  <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    Customer: <strong className="text-slate-900">{job.customerName}</strong>
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {job.title}
                </h4>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span>📍 {job.location}</span>
                </p>
              </div>

              {/* Dynamic Amount Selector */}
              <div className="bg-gradient-to-b from-emerald-50/50 to-teal-50/30 p-4 rounded-2xl border border-emerald-200 text-center space-y-2">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                  Final Settlement Amount (0% Commission)
                </span>
                <div className="flex items-center justify-center gap-1 text-3xl font-black text-emerald-950 font-mono">
                  <span>₹</span>
                  <span>{finalPrice.toLocaleString('en-IN')}</span>
                </div>

                {/* Quick adjustments */}
                <div className="flex items-center justify-center gap-1.5 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setFinalPrice(job.price)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      finalPrice === job.price 
                        ? 'bg-emerald-700 text-white border-emerald-700' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Agreed: ₹{job.price}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFinalPrice(job.price + 150)}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  >
                    +₹150 Parts
                  </button>
                  <button
                    type="button"
                    onClick={() => setFinalPrice(job.price + 300)}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  >
                    +₹300 Extra Work
                  </button>
                </div>
              </div>

              {/* Dynamic QR Code Display */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl border-2 border-dashed border-emerald-300 shadow-xs relative">
                <div className="p-2.5 bg-white rounded-2xl shadow-inner border border-slate-100">
                  <SvgUpiQrCode upiUri={upiIntentUri} size={210} />
                </div>

                <div className="mt-2.5 text-center">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1">
                    <Smartphone size={13} className="text-emerald-600" />
                    Scan with any UPI App (GPay, PhonePe, Paytm)
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                    UPI ID: {upiId}
                  </span>
                </div>
              </div>

              {/* Instant App Pay Shortcuts */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenApp('gpay')}
                  className="py-2 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-center active:scale-95 transition-all"
                >
                  <span className="text-xs font-black text-blue-900 block">🔵 GPay</span>
                  <span className="text-[9px] text-blue-700">Open App</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenApp('phonepe')}
                  className="py-2 px-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-center active:scale-95 transition-all"
                >
                  <span className="text-xs font-black text-purple-900 block">🟣 PhonePe</span>
                  <span className="text-[9px] text-purple-700">Open App</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenApp('paytm')}
                  className="py-2 px-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl text-center active:scale-95 transition-all"
                >
                  <span className="text-xs font-black text-sky-900 block">🔷 Paytm</span>
                  <span className="text-[9px] text-sky-700">Open App</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98"
                >
                  {copiedUpi ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span>UPI Payment Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Direct UPI Intent URI</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleConfirmPaid('Direct Cash (0% cut)')}
                    className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <Banknote size={14} />
                    <span>Received Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmPaid('UPI QR Received')}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <CheckCircle2 size={14} />
                    <span>Received on UPI</span>
                  </button>
                </div>
              </div>

              {/* Zero Commission Guarantee Note */}
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-[10px] text-emerald-900 font-semibold">
                <ShieldCheck size={16} className="text-emerald-700 flex-shrink-0" />
                <span>Zero Platform Cut • Worker receives 100% of ₹{finalPrice.toLocaleString('en-IN')} straight to their ICICI/HDFC account.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPaymentQrModal;
