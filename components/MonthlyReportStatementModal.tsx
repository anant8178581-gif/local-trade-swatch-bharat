import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  IndianRupee, 
  TrendingUp, 
  Award, 
  ExternalLink,
  Copy,
  Check,
  Building2,
  Clock,
  ArrowDownLeft,
  Sparkles
} from 'lucide-react';
import { Worker } from '../types';
import { triggerPdfReportDownload, MonthlyReportData, ReportTransactionItem } from '../services/pdfReportGenerator';

export interface MonthlyReportStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker;
}

const DEFAULT_TRANSACTIONS: ReportTransactionItem[] = [
  {
    id: 'TX-OCT-9901',
    customer: 'Advait Kulkarni',
    service: 'Main Overhead Copper Line Repair & Valve Fitting',
    date: '28 Oct 2026, 02:30 PM',
    amount: 1450,
    mode: 'Direct UPI QR (GPay)',
    platformFee: 0,
    workerTakeHome: 1450,
    status: 'received',
    utr: 'UPI/426891023411'
  },
  {
    id: 'TX-OCT-9892',
    customer: 'Meera Jog',
    service: 'MCB Switchboard Rewiring & Phase Load Balancing',
    date: '27 Oct 2026, 11:15 AM',
    amount: 1250,
    mode: 'Direct UPI QR (PhonePe)',
    platformFee: 0,
    workerTakeHome: 1250,
    status: 'received',
    utr: 'UPI/426710928374'
  },
  {
    id: 'TX-OCT-9870',
    customer: 'Vikas Shah',
    service: 'Concealed Bathroom Pipe Inspection & Drain Fix',
    date: '25 Oct 2026, 04:00 PM',
    amount: 1800,
    mode: 'Direct UPI QR (Paytm)',
    platformFee: 0,
    workerTakeHome: 1800,
    status: 'received',
    utr: 'UPI/426519827364'
  },
  {
    id: 'TX-OCT-9844',
    customer: 'Preeti Deshpande',
    service: 'Kitchen Chimney & Exhaust Motor Servicing',
    date: '23 Oct 2026, 01:20 PM',
    amount: 950,
    mode: 'Direct Cash (Settled)',
    platformFee: 0,
    workerTakeHome: 950,
    status: 'received',
    utr: 'CASH/DIRECT-4412'
  },
  {
    id: 'TX-OCT-9821',
    customer: 'Kabir Singh',
    service: 'Water Pressure Booster Pump Fitting & Testing',
    date: '20 Oct 2026, 10:45 AM',
    amount: 2100,
    mode: 'Direct UPI QR (BHIM UPI)',
    platformFee: 0,
    workerTakeHome: 2100,
    status: 'received',
    utr: 'UPI/426190837465'
  },
  {
    id: 'TX-OCT-9799',
    customer: 'Suresh Nair',
    service: 'Geyser Thermostat Replacement & Safety Valve',
    date: '18 Oct 2026, 03:10 PM',
    amount: 850,
    mode: 'Direct UPI QR (GPay)',
    platformFee: 0,
    workerTakeHome: 850,
    status: 'received',
    utr: 'UPI/425981023847'
  }
];

export const MonthlyReportStatementModal: React.FC<MonthlyReportStatementModalProps> = ({
  isOpen,
  onClose,
  worker
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('October 2026');
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const monthMultiplier = selectedMonth === 'October 2026' ? 1 : selectedMonth === 'September 2026' ? 0.92 : 0.86;
  const baseEarnings = worker.lifetimeEarnings || 18450;
  const monthlyEarnings = Math.round(baseEarnings * monthMultiplier);
  const commissionSaved = Math.round(monthlyEarnings * 0.2); // 20% industry standard savings
  const completedJobsCount = Math.round(24 * monthMultiplier);
  const statementId = `LTI-STMT-${selectedMonth.slice(0, 3).toUpperCase()}2026-${worker.id.padStart(4, '0')}`;
  const generatedAt = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const reportData: MonthlyReportData = {
    worker,
    monthLabel: selectedMonth,
    statementId,
    generatedAt,
    upiId: worker.upiId || 'arjun.pro@okhdfcbank',
    planName: worker.subscriptionPlan === 'daily' ? 'Daily Flex Pass (₹10/day)' : 'Pro Monthly Pass (₹99/month)',
    totalMonthlyEarnings: monthlyEarnings,
    totalCommissionSaved: commissionSaved,
    platformCommission: 0,
    totalCompletedJobs: completedJobsCount,
    weeklyReceived: monthlyEarnings,
    weeklyPending: 0,
    dailyBars: [
      { day: 'Mon', fullDate: 'Monday', received: Math.round(monthlyEarnings * 0.15), pending: 0, jobsCount: 3 },
      { day: 'Tue', fullDate: 'Tuesday', received: Math.round(monthlyEarnings * 0.18), pending: 0, jobsCount: 4 },
      { day: 'Wed', fullDate: 'Wednesday', received: Math.round(monthlyEarnings * 0.12), pending: 0, jobsCount: 2 },
      { day: 'Thu', fullDate: 'Thursday', received: Math.round(monthlyEarnings * 0.2), pending: 0, jobsCount: 5 },
      { day: 'Fri', fullDate: 'Friday', received: Math.round(monthlyEarnings * 0.14), pending: 0, jobsCount: 3 },
      { day: 'Sat', fullDate: 'Saturday', received: Math.round(monthlyEarnings * 0.21), pending: 0, jobsCount: 5 }
    ],
    transactions: DEFAULT_TRANSACTIONS
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const filename = triggerPdfReportDownload(reportData);
    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleWhatsAppShareStatement = () => {
    const text = 
      `*📄 LOCAL TRADES INDIA - MONTHLY EARNINGS STATEMENT*\n\n` +
      `👤 *Artisan:* ${worker.name}\n` +
      `📅 *Period:* ${selectedMonth}\n` +
      `🔖 *Statement ID:* ${statementId}\n\n` +
      `💰 *Total Monthly Earnings:* ₹${monthlyEarnings.toLocaleString('en-IN')} (100% Direct Payout)\n` +
      `🎉 *Commission Saved (0% Cut):* +₹${commissionSaved.toLocaleString('en-IN')}\n` +
      `🛠️ *Completed Jobs:* ${completedJobsCount} Gigs\n` +
      `⭐ *Customer Rating:* ${worker.rating} / 5.0 (Aadhaar KYC Verified)\n\n` +
      `✅ *Bank & Tax Ready Verification:* Verified direct P2P earnings certificate via Local Trades India.\n` +
      `👉 *Verify Online:* ${window.location.origin}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopySummary = async () => {
    const summary = 
      `Local Trades India Monthly Statement (${selectedMonth})\n` +
      `Statement ID: ${statementId}\n` +
      `Artisan: ${worker.name} (${worker.skills.join(', ')})\n` +
      `Earnings: ₹${monthlyEarnings.toLocaleString('en-IN')} (100% Net)\n` +
      `Commission Saved: ₹${commissionSaved.toLocaleString('en-IN')}\n` +
      `Completed Gigs: ${completedJobsCount}\n` +
      `Status: Tax & Bank Ready • 0% Platform Commission`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#0F172A] text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Tax & Bank Ready
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {statementId}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                Monthly Financial Report Statement
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable & Scrollable Statement Body */}
        <div id="printable-monthly-report" className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-white">
          {/* Top Period Selector & Statement Metadata */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Billing Statement Period
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <Calendar size={15} className="text-slate-600" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-sm font-extrabold text-slate-900 outline-none cursor-pointer"
                  aria-label="Statement Month"
                >
                  <option value="October 2026">October 2026</option>
                  <option value="September 2026">September 2026</option>
                  <option value="August 2026">August 2026</option>
                </select>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <span className="text-[10px] text-slate-400 font-semibold block">Generated On</span>
              <span className="font-mono text-slate-700 font-bold">{generatedAt}</span>
            </div>
          </div>

          {/* Worker Passport Details Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <img
                  src={worker.photoUrl}
                  alt={worker.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-sm text-white">{worker.name}</h4>
                    <CheckCircle2 size={15} className="text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-300">
                    {worker.skills.join(' • ')} · UIDAI DigiLocker Verified
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  0% Commission Model Active
                </span>
                <span className="text-[11px] text-slate-300 block mt-1 font-mono">
                  UPI: {worker.upiId || 'arjun.pro@okhdfcbank'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Aadhaar (Masked)</span>
                <span className="font-mono font-bold text-white">{worker.aadhaarNumberMasked || 'XXXX-XXXX-6012'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">PAN (Masked)</span>
                <span className="font-mono font-bold text-white">{worker.panNumberMasked || 'BKZPD4891K'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Service Area</span>
                <span className="font-bold text-white">Mumbai Central</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Quality Rating</span>
                <span className="font-bold text-amber-400">★ {worker.rating} (Verified)</span>
              </div>
            </div>
          </div>

          {/* Core Financial Metrics (3-Grid Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase text-emerald-800 block">
                Total Monthly Earnings
              </span>
              <span className="text-xl font-black font-mono text-emerald-950 mt-1 block flex items-center">
                <IndianRupee size={18} />{monthlyEarnings.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                100% Net Take-Home Pay
              </span>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase text-amber-800 block">
                Commission Saved (0% Cut)
              </span>
              <span className="text-xl font-black font-mono text-amber-950 mt-1 block flex items-center">
                +<IndianRupee size={18} />{commissionSaved.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">
                Saved vs 20% platform cut
              </span>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 p-3.5 rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase text-blue-800 block">
                Completed Gigs
              </span>
              <span className="text-xl font-black font-mono text-blue-950 mt-1 block">
                {completedJobsCount} Gigs
              </span>
              <span className="text-[10px] text-blue-700 font-semibold mt-0.5 block">
                Zero Dispute Cancellations
              </span>
            </div>
          </div>

          {/* Itemized Transaction Ledger */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span>Completed Jobs & Payout Ledger</span>
                <span className="text-[10px] text-slate-500 font-normal">({DEFAULT_TRANSACTIONS.length} items listed)</span>
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                0% Fee Applied
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              {DEFAULT_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 truncate">{tx.service}</span>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">{tx.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 flex-wrap">
                      <span>Customer: {tx.customer}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="text-slate-700 font-mono">{tx.utr}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-mono font-black text-slate-900 block flex items-center justify-end">
                      <IndianRupee size={12} />{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 inline-block mt-0.5">
                      Received
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Declaration Note */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
            <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Tax & Income Certificate:</strong> This electronic statement certifies that payments were transacted directly between client and artisan via Aadhaar-linked UPI QR, with 0% platform intermediary commission deductions. Compliant with Indian IT Act provisions for direct gig artisan earnings.
            </div>
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer size={14} className="text-amber-400" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="py-2.5 px-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Download Direct .PDF file"
            >
              <Download size={14} />
              <span>Download .PDF</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShareStatement}
              className="py-2.5 px-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Share Statement on WhatsApp"
            >
              <Share2 size={14} />
              <span>WhatsApp Share</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              {copiedSummary ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportStatementModal;
