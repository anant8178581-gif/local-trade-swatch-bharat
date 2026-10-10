import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  Printer, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Building2, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Phone
} from 'lucide-react';

export interface GovtSwachhataReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  category: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  locationAddress: string;
  pincode: string;
  gpsCoordinates: string;
  photoUrl: string;
  wardNumber?: string;
  timestamp?: string;
  onTrackTimeline?: () => void;
  onOpenSocialEscalation?: () => void;
}

export const GovtSwachhataReceiptModal: React.FC<GovtSwachhataReceiptProps> = ({
  isOpen,
  onClose,
  ticketId,
  category,
  riskLevel,
  locationAddress,
  pincode,
  gpsCoordinates,
  photoUrl,
  wardNumber = 'Ward #44, East Delhi MCD',
  timestamp = new Date().toLocaleString('en-IN'),
  onTrackTimeline,
  onOpenSocialEscalation
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyTicket = () => {
    navigator.clipboard?.writeText(ticketId);
    setCopied(true);
    setToastMessage('✓ Ticket ID copied to clipboard!');
    setTimeout(() => {
      setCopied(false);
      setToastMessage(null);
    }, 3000);
  };

  // Generate official print-ready HTML slip
  const getPrintableSlipHtml = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Swachhata_Grievance_Receipt_${ticketId}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; background: #fff; }
    .slip { max-width: 680px; margin: 0 auto; border: 2px solid #0f172a; border-radius: 12px; padding: 24px; }
    .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 14px; margin-bottom: 16px; }
    .top-badge { font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #047857; text-transform: uppercase; }
    .title { font-size: 22px; font-weight: 900; margin: 6px 0; color: #0f172a; }
    .sub { font-size: 12px; color: #475569; }
    .ticket-box { background: #0f172a; color: #fbbf24; padding: 8px 16px; border-radius: 8px; font-family: monospace; font-size: 18px; font-weight: 900; display: inline-block; margin: 10px 0; }
    .alert { background: #ecfdf5; border-left: 4px solid #10b981; padding: 8px 12px; font-size: 12px; color: #065f46; font-weight: 700; margin-bottom: 16px; }
    .photo-area { text-align: center; margin: 14px 0; }
    .photo-area img { max-width: 100%; max-height: 240px; border-radius: 8px; border: 1px solid #cbd5e1; object-fit: cover; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
    th, td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: left; }
    th { background: #f8fafc; color: #475569; font-weight: 700; width: 35%; }
    .footer { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 16px; border-top: 1px dashed #94a3b8; font-size: 11px; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="slip">
    <div class="header">
      <div class="top-badge">GOVERNMENT OF INDIA • SWACHH BHARAT MISSION (URBAN)</div>
      <div class="title">Civic Hazard Grievance Acknowledgment Slip</div>
      <div class="sub">Delhi Municipal Corporation (MCD) • Citizen Watchdog Registry</div>
      <div class="ticket-box">TICKET #${ticketId}</div>
    </div>
    <div class="alert">
      ✓ COMPLAINT TRANSMITTED TO WARD SANITARY INSPECTOR • 7-DAY STATUTORY SLA ACTIVE
    </div>
    <div class="photo-area">
      <img src="${photoUrl}" alt="Hazard Proof" />
      <div style="font-family: monospace; font-size: 10px; color: #64748b; margin-top: 4px;">
        GPS: ${gpsCoordinates} | Filed: ${timestamp}
      </div>
    </div>
    <table>
      <tr><th>Ticket Reference ID</th><td style="font-family: monospace; font-weight: 800; color: #047857;">${ticketId}</td></tr>
      <tr><th>Hazard Category</th><td>${category}</td></tr>
      <tr><th>Risk Priority Level</th><td style="color: ${riskLevel === 'High' ? '#dc2626' : '#d97706'}; font-weight: 800;">${riskLevel} Priority Civic Biohazard</td></tr>
      <tr><th>Street Landmark</th><td>${locationAddress} (PIN: ${pincode})</td></tr>
      <tr><th>Designated Ward</th><td>${wardNumber}</td></tr>
      <tr><th>Assigned Sanitary Official</th><td>Shri Rajesh Sharma (Ward Sanitation Inspector)</td></tr>
      <tr><th>Statutory SLA Window</th><td>72h Ward Inspection • Day 7 Automatic District Collector Escalation</td></tr>
    </table>
    <div class="footer">
      <div>
        <strong>STAMPED & VERIFIED BY MCD CENTRAL GRIEVANCE SYSTEM</strong><br />
        <span style="color: #64748b;">Local Trades India Citizen Watchdog Platform</span>
      </div>
      <div style="text-align: right;">
        <strong>SBM SLA: 7 DAYS GUARANTEE</strong><br />
        <span style="color: #64748b;">Auto-Escalation to Municipal Commissioner</span>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const handlePrint = () => {
    try {
      // Direct window.print() will trigger the media print query
      window.print();
      setToastMessage('✓ Print dialog opened! Select your printer or choose "Save as PDF".');
    } catch (err) {
      console.warn('Direct print error, trying fallback:', err);
      try {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(getPrintableSlipHtml());
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => printWindow.print(), 300);
          setToastMessage('✓ Print window opened! Select printer or Save as PDF.');
        } else {
          handleDownloadSlip();
        }
      } catch (e2) {
        handleDownloadSlip();
      }
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDownloadSlip = () => {
    const htmlContent = getPrintableSlipHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Swachhata_Receipt_${ticketId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage('✓ Official Grievance Receipt downloaded! Open in any browser to print or save as PDF.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div 
      className="fixed inset-0 z-[240] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Official Header */}
        <div className="bg-[#0F172A] text-white p-5 relative border-b-4 border-emerald-500">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md flex-shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  GOVERNMENT OF INDIA • SWACHH BHARAT MISSION
                </span>
              </div>
              <h3 className="text-lg font-black text-white leading-tight">
                Civic Hazard Grievance Receipt
              </h3>
              <p className="text-xs text-slate-300">
                Official Municipal Transmission & Citizen Watchdog Filing
              </p>
            </div>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Success Banner */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 size={22} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                TRANSMITTED TO MUNICIPAL CORPORATION (MCD)
              </h4>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                Your geotagged photograph, exact GPS coordinates, and hazard category have been recorded in the central municipal grievance registry.
              </p>
            </div>
          </div>

          {/* Ticket ID Strip */}
          <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
                OFFICIAL SWACHHATA TICKET NO.
              </span>
              <span className="text-lg font-black font-mono tracking-wider text-amber-400">
                {ticketId}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyTicket}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy Ticket'}</span>
            </button>
          </div>

          {/* Photo & Watermarked Location Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 shadow-inner">
            <img
              src={photoUrl}
              alt="Dirty Place Report"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 text-white">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-amber-300 font-bold">📍 {gpsCoordinates}</span>
                <span className="text-slate-300">{timestamp}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  riskLevel === 'High' ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
                }`}>
                  {riskLevel} Risk Hazard
                </span>
                <span className="text-xs font-bold text-white truncate">
                  {category}
                </span>
              </div>
            </div>
          </div>

          {/* Key Dispatch Details Grid */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-start justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Assigned Jurisdiction:</span>
              <span className="font-black text-slate-900 text-right">{wardNumber}</span>
            </div>

            <div className="flex items-start justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Designated Sanitary Officer:</span>
              <span className="font-bold text-slate-900 text-right">Shri Rajesh Sharma (Ward Inspector)</span>
            </div>

            <div className="flex items-start justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500 font-medium">Hazard Street Address:</span>
              <span className="font-mono text-slate-800 text-right max-w-[65%]">{locationAddress} ({pincode})</span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500 font-medium">Statutory SLA Guaranteed:</span>
              <span className="font-black text-emerald-700 text-right">7 Days Max Resolution</span>
            </div>
          </div>

          {/* Escalation Policy Guarantee & Social Media Connect */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black">
                <AlertTriangle size={14} className="text-amber-600" />
                <span>Automated 7-Day Municipal Escalation Guarantee</span>
              </div>
              <span className="text-[9px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                SLA Protected
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              If the ward sanitation team fails to clean this location within 7 days, this ticket will automatically escalate to the <strong>Municipal Commissioner & District Magistrate</strong>.
            </p>

            {onOpenSocialEscalation && (
              <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-700">
                  Spot not cleaned? Mobilize public pressure:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSocialEscalation();
                  }}
                  className="py-1 px-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-[10px] uppercase tracking-wider rounded-lg shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <Share2 size={11} />
                  <span>Amplify on Instagram & 𝕏</span>
                </button>
              </div>
            )}
          </div>

          {/* Toast Notification if any */}
          {toastMessage && (
            <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-700" />
                {toastMessage}
              </span>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Print Official Slip"
            >
              <Printer size={14} className="text-slate-600" />
              <span>Print Receipt</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSlip}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Save HTML/PDF Receipt to Device"
            >
              <Download size={14} className="text-emerald-600" />
              <span className="hidden sm:inline">Download Slip</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onTrackTimeline?.();
              }}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Track 7-Day Escalation</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* DEDICATED PRINTABLE SWACHHATA RECEIPT CONTAINER (VISIBLE ONLY DURING window.print()) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #swachhata-printable-receipt-slip, #swachhata-printable-receipt-slip * {
            visibility: visible !important;
          }
          #swachhata-printable-receipt-slip {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: #ffffff !important;
            color: #0f172a !important;
            z-index: 99999999 !important;
          }
        }
      `}</style>

      <div id="swachhata-printable-receipt-slip" className="hidden print:block font-sans text-slate-900 bg-white p-6 max-w-2xl mx-auto border-2 border-slate-900 rounded-2xl">
        <div className="text-center border-b-2 border-emerald-600 pb-3 mb-4">
          <div className="text-xs font-black tracking-widest text-emerald-800 uppercase">
            GOVERNMENT OF INDIA • SWACHH BHARAT MISSION (URBAN)
          </div>
          <h1 className="text-2xl font-black text-slate-950 mt-1">
            Civic Hazard Grievance Acknowledgment Slip
          </h1>
          <p className="text-xs text-slate-600">
            Delhi Municipal Corporation (MCD) • Citizen Watchdog Registry
          </p>
          <div className="inline-block bg-slate-950 text-amber-400 font-mono font-black text-lg px-4 py-1.5 rounded-lg mt-2">
            TICKET #{ticketId}
          </div>
        </div>

        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-950 font-bold text-xs mb-4">
          ✓ COMPLAINT TRANSMITTED TO WARD SANITARY INSPECTOR • 7-DAY STATUTORY SLA ACTIVE
        </div>

        <div className="text-center my-4">
          <img src={photoUrl} alt="Hazard Proof" className="max-h-56 mx-auto rounded-lg border border-slate-300 object-cover" />
          <div className="font-mono text-[10px] text-slate-500 mt-1">
            GPS: {gpsCoordinates} • Filed: {timestamp}
          </div>
        </div>

        <table className="w-full text-xs border-collapse mt-3">
          <tbody>
            <tr className="border-b border-slate-200">
              <th className="py-2 px-3 text-left bg-slate-100 text-slate-700 font-bold w-1/3">Ticket Reference ID</th>
              <td className="py-2 px-3 font-mono font-black text-emerald-800">{ticketId}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <th className="py-2 px-3 text-left bg-slate-100 text-slate-700 font-bold">Hazard Category</th>
              <td className="py-2 px-3">{category}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <th className="py-2 px-3 text-left bg-slate-100 text-slate-700 font-bold">Risk Priority Level</th>
              <td className={`py-2 px-3 font-bold ${riskLevel === 'High' ? 'text-red-700' : 'text-amber-700'}`}>
                {riskLevel} Priority Civic Biohazard
              </td>
            </tr>
            <tr className="border-b border-slate-200">
              <th className="py-2 px-3 text-left bg-slate-100 text-slate-700 font-bold">Street Landmark</th>
              <td className="py-2 px-3">{locationAddress} (PIN: {pincode})</td>
            </tr>
            <tr className="border-b border-slate-200">
              <th className="py-2 px-3 text-left bg-slate-100 text-slate-700 font-bold">Designated Jurisdiction</th>
              <td className="py-2 px-3">{wardNumber}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <th className="py-2 px-3 text-left bg-slate-100 text-slate-700 font-bold">Assigned Official</th>
              <td className="py-2 px-3">Shri Rajesh Sharma (Ward Sanitation Inspector)</td>
            </tr>
            <tr className="border-b border-slate-200">
              <th className="py-2 px-3 text-left bg-slate-100 text-slate-700 font-bold">Statutory SLA Window</th>
              <td className="py-2 px-3 font-bold text-slate-900">72h Ward Inspection • Day 7 Automatic District Collector Escalation</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-4 mt-4 border-t border-dashed border-slate-300">
          <div>
            <strong>STAMPED & VERIFIED BY MCD CENTRAL GRIEVANCE SYSTEM</strong><br />
            <span>Local Trades India Citizen Watchdog Platform</span>
          </div>
          <div className="text-right">
            <strong>SBM SLA: 7 DAYS GUARANTEE</strong><br />
            <span>Auto-Escalation to Municipal Commissioner</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovtSwachhataReceiptModal;
