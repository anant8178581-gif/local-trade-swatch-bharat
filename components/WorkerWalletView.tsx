import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Crown, 
  Zap, 
  Award, 
  ArrowDownLeft, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  X,
  BarChart3,
  Clock,
  Banknote,
  FileText,
  Printer,
  Calendar,
  Briefcase
} from 'lucide-react';
import { Worker } from '../types';
import SvgUpiQrCode from './SvgUpiQrCode';
import { triggerPdfReportDownload, MonthlyReportData } from '../services/pdfReportGenerator';

interface WorkerWalletViewProps {
  worker: Worker;
  onOpenSubscriptionModal: () => void;
  onBackToHub?: () => void;
}

export interface DailyEarningBar {
  day: string;
  fullDate: string;
  received: number;
  pending: number;
  jobsCount: number;
}

interface WalletTransaction {
  id: string;
  customer: string;
  service: string;
  date: string;
  amount: number;
  mode: string;
  platformFee: number;
  workerTakeHome: number;
  status: 'received' | 'pending';
  utr?: string;
}

const INITIAL_DAILY_EARNINGS: DailyEarningBar[] = [
  { day: 'Mon', fullDate: 'Monday', received: 1450, pending: 350, jobsCount: 3 },
  { day: 'Tue', fullDate: 'Tuesday', received: 1800, pending: 0, jobsCount: 3 },
  { day: 'Wed', fullDate: 'Wednesday', received: 1250, pending: 600, jobsCount: 4 },
  { day: 'Thu', fullDate: 'Thursday', received: 2100, pending: 450, jobsCount: 4 },
  { day: 'Fri', fullDate: 'Friday', received: 1650, pending: 300, jobsCount: 3 },
  { day: 'Sat', fullDate: 'Saturday', received: 2400, pending: 500, jobsCount: 5 },
  { day: 'Today', fullDate: 'Today (Sun)', received: 1600, pending: 850, jobsCount: 3 }
];

const WorkerWalletView: React.FC<WorkerWalletViewProps> = ({
  worker,
  onOpenSubscriptionModal,
  onBackToHub
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedReportMonth, setSelectedReportMonth] = useState<string>('October 2026');
  const [showPdfReportModal, setShowPdfReportModal] = useState<boolean>(false);
  const [lastDownloadedFile, setLastDownloadedFile] = useState<string | null>(null);

  // Payment Overview Bar Chart State (Daily Earnings categorized by 'Received' vs 'Pending')
  const [dailyBars, setDailyBars] = useState<DailyEarningBar[]>(INITIAL_DAILY_EARNINGS);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6); // Default to 'Today'
  const [chartMode, setChartMode] = useState<'grouped' | 'stacked'>('grouped');
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'received' | 'pending'>('all');

  // Dynamic UPI QR Generator State
  const [showQrGenerator, setShowQrGenerator] = useState(true);
  const [qrAmount, setQrAmount] = useState<string>('500');
  const [qrServiceNote, setQrServiceNote] = useState<string>('Faucet & Main Pipe Repair');
  const [qrCustomerName, setQrCustomerName] = useState<string>('Rohan Sharma');
  const [workerUpiId, setWorkerUpiId] = useState<string>(worker.upiId || 'arjun.pro@okhdfcbank');
  const [isQrModalFullscreen, setIsQrModalFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [simulatingScan, setSimulatingScan] = useState(false);
  const [scanSuccessBanner, setScanSuccessBanner] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<WalletTransaction[]>([
    {
      id: 'tx-101',
      customer: 'Advait Kulkarni',
      service: 'Main Overhead Line Pipe Fitting',
      date: 'Today, 2:30 PM',
      amount: 950,
      mode: 'Direct UPI QR (GPay)',
      platformFee: 0,
      workerTakeHome: 950,
      status: 'received',
      utr: 'UPI/426891023411'
    },
    {
      id: 'tx-105',
      customer: 'Suresh Nair',
      service: 'Bathroom Mixer & Concealed Valve',
      date: 'Today, 12:15 PM',
      amount: 850,
      mode: 'Awaiting UPI QR / Cash Settlement',
      platformFee: 0,
      workerTakeHome: 850,
      status: 'pending'
    },
    {
      id: 'tx-102',
      customer: 'Meera Jog',
      service: 'MCB Switchboard & Wiring',
      date: 'Today, 10:00 AM',
      amount: 650,
      mode: 'Direct Cash Pay',
      platformFee: 0,
      workerTakeHome: 650,
      status: 'received'
    },
    {
      id: 'tx-106',
      customer: 'Deepak Verma',
      service: 'Water Tank Float Valve Fix',
      date: 'Saturday',
      amount: 500,
      mode: 'Pending Customer Scan',
      platformFee: 0,
      workerTakeHome: 500,
      status: 'pending'
    },
    {
      id: 'tx-103',
      customer: 'Vikas Shah',
      service: 'Kitchen Plumbing & Valve Seal',
      date: 'Saturday',
      amount: 1200,
      mode: 'Direct UPI QR (PhonePe)',
      platformFee: 0,
      workerTakeHome: 1200,
      status: 'received',
      utr: 'UPI/426519827364'
    },
    {
      id: 'tx-104',
      customer: 'Preeti Deshpande',
      service: 'Emergency Drain Unclog',
      date: 'Friday',
      amount: 850,
      mode: 'Direct UPI QR (Paytm)',
      platformFee: 0,
      workerTakeHome: 850,
      status: 'received',
      utr: 'UPI/426190837465'
    }
  ]);

  // Compute totals for Payment Overview
  const totalWeeklyReceived = dailyBars.reduce((sum, d) => sum + d.received, 0);
  const totalWeeklyPending = dailyBars.reduce((sum, d) => sum + d.pending, 0);
  const maxDailyValue = Math.max(
    ...dailyBars.map((d) =>
      chartMode === 'stacked' ? d.received + d.pending : Math.max(d.received, d.pending)
    ),
    2500
  );

  const selectedDay = dailyBars[selectedDayIndex] || dailyBars[dailyBars.length - 1];

  const extraEarned = transactions
    .filter((t) => t.status === 'received')
    .reduce((acc, tx) => acc + tx.workerTakeHome, 0) - 3650;

  const earnings = Math.max(worker.lifetimeEarnings || 18450, (worker.lifetimeEarnings || 18450) + extraEarned);
  const commissionSaved = Math.round(earnings * 0.2);
  const planName = worker.subscriptionPlan === 'daily' ? 'Daily Flex Pass (₹10/day)' : 'Pro Monthly Pass (₹99/month)';
  const expiresAt = worker.subscriptionExpiresAt || '25 Oct 2026';
  const isBoosted = worker.isPriorityFeatured ?? true;

  const numericAmount = Math.max(1, Number(qrAmount) || 0);
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(workerUpiId)}&pn=${encodeURIComponent(worker.name)}&am=${numericAmount}&cu=INR&tn=${encodeURIComponent(qrServiceNote || 'Trade Service')}`;

  const handleCopyUpiLink = () => {
    navigator.clipboard?.writeText(upiIntentUri);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Mark Paid via GPay / PhonePe / Direct Cash or Add Pending
  const handleRecordPayment = (
    methodLabel: 'GPay' | 'PhonePe' | 'Direct Cash',
    targetStatus: 'received' | 'pending' = 'received'
  ) => {
    if (numericAmount <= 0) return;
    setSimulatingScan(true);
    setTimeout(() => {
      const newUtr = targetStatus === 'received' && methodLabel !== 'Direct Cash'
        ? `UPI/${Math.floor(400000000000 + Math.random() * 599999999999)}`
        : undefined;

      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        customer: qrCustomerName.trim() || 'Verified Customer',
        service: qrServiceNote.trim() || `${worker.skills[0]} Service`,
        date: 'Just now',
        amount: numericAmount,
        mode: targetStatus === 'received'
          ? methodLabel === 'Direct Cash'
            ? 'Direct Cash (0% Cut)'
            : `Direct UPI QR (${methodLabel})`
          : `Pending (${methodLabel})`,
        platformFee: 0,
        workerTakeHome: numericAmount,
        status: targetStatus,
        utr: newUtr
      };

      setTransactions((prev) => [newTx, ...prev]);

      // Update Today's Bar in Payment Overview Chart!
      setDailyBars((prev) =>
        prev.map((bar, idx) => {
          if (idx === prev.length - 1) {
            return {
              ...bar,
              received: targetStatus === 'received' ? bar.received + numericAmount : bar.received,
              pending: targetStatus === 'pending' ? bar.pending + numericAmount : bar.pending,
              jobsCount: bar.jobsCount + 1
            };
          }
          return bar;
        })
      );
      setSelectedDayIndex(dailyBars.length - 1);
      setSimulatingScan(false);
      setIsQrModalFullscreen(false);

      if (targetStatus === 'received') {
        setScanSuccessBanner(
          `₹${numericAmount.toLocaleString('en-IN')} marked as RECEIVED via ${methodLabel}! (0% Commission • 100% Worker Payout)`
        );
      } else {
        setScanSuccessBanner(
          `₹${numericAmount.toLocaleString('en-IN')} added to Today's PENDING queue. Collect anytime via QR!`
        );
      }
      setTimeout(() => setScanSuccessBanner(null), 5000);
    }, 600);
  };

  // Settle a specific day's pending amount into Received
  const handleSettleDayPending = (dayIdx: number) => {
    const targetDay = dailyBars[dayIdx];
    if (!targetDay || targetDay.pending <= 0) return;

    const settledAmount = targetDay.pending;
    setDailyBars((prev) =>
      prev.map((bar, idx) =>
        idx === dayIdx
          ? { ...bar, received: bar.received + bar.pending, pending: 0 }
          : bar
      )
    );

    // Also mark any pending transactions in the ledger if settling Today
    if (dayIdx === dailyBars.length - 1) {
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.status === 'pending' && tx.date.includes('Today')
            ? { ...tx, status: 'received', mode: 'Direct UPI QR (Settled)', utr: `UPI/${Math.floor(400000000000 + Math.random() * 599999999999)}` }
            : tx
        )
      );
    }

    setScanSuccessBanner(
      `₹${settledAmount.toLocaleString('en-IN')} pending from ${targetDay.fullDate} marked as RECEIVED! (0% Cut)`
    );
    setTimeout(() => setScanSuccessBanner(null), 4500);
  };

  // Settle an individual pending transaction from the ledger
  const handleSettleSingleTransaction = (txId: string) => {
    const targetTx = transactions.find((t) => t.id === txId);
    if (!targetTx || targetTx.status === 'received') return;

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              status: 'received',
              mode: 'Direct UPI QR (GPay Settled)',
              utr: `UPI/${Math.floor(400000000000 + Math.random() * 599999999999)}`
            }
          : t
      )
    );

    // Move amount from Pending to Received in Today's bar
    setDailyBars((prev) =>
      prev.map((bar, idx) => {
        if (idx === prev.length - 1) {
          const deduct = Math.min(bar.pending, targetTx.workerTakeHome);
          return {
            ...bar,
            received: bar.received + targetTx.workerTakeHome,
            pending: Math.max(0, bar.pending - deduct)
          };
        }
        return bar;
      })
    );

    setScanSuccessBanner(
      `₹${targetTx.workerTakeHome.toLocaleString('en-IN')} from ${targetTx.customer} marked as RECEIVED!`
    );
    setTimeout(() => setScanSuccessBanner(null), 4000);
  };

  const totalCompletedJobs7d = dailyBars.reduce((acc, b) => acc + b.jobsCount, 0);
  const monthMultiplier =
    selectedReportMonth === 'October 2026'
      ? 1
      : selectedReportMonth === 'September 2026'
      ? 0.92
      : 0.86;

  const monthlyReportEarnings = Math.round(earnings * monthMultiplier);
  const monthlyReportCommissionSaved = Math.round(monthlyReportEarnings * 0.2);
  const monthlyReportCompletedJobs = Math.max(
    totalCompletedJobs7d,
    Math.round((totalCompletedJobs7d + 12) * monthMultiplier)
  );

  const buildMonthlyReportPayload = (): MonthlyReportData => {
    const cleanMonthCode = selectedReportMonth.slice(0, 3).toUpperCase() + '2026';
    return {
      worker,
      monthLabel: selectedReportMonth,
      statementId: `LTI-FIN-${cleanMonthCode}-${worker.id.slice(-3).toUpperCase()}`,
      generatedAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      upiId: workerUpiId,
      planName,
      totalMonthlyEarnings: monthlyReportEarnings,
      totalCommissionSaved: monthlyReportCommissionSaved,
      platformCommission: 0,
      totalCompletedJobs: monthlyReportCompletedJobs,
      weeklyReceived: totalWeeklyReceived,
      weeklyPending: totalWeeklyPending,
      dailyBars,
      transactions
    };
  };

  /**
   * Uses browser window.print() to generate a clean, formatted PDF document
   * (Users select "Save as PDF" or Print in the browser dialog)
   */
  const handlePrintPdfReport = () => {
    setDownloadSuccess(true);
    setScanSuccessBanner(
      `Opening Print / Save as PDF dialog for ${selectedReportMonth}... Select "Save as PDF" to download.`
    );
    // Ensure printable section is ready and invoke print
    setTimeout(() => {
      window.print();
    }, 150);
    setTimeout(() => setDownloadSuccess(false), 3500);
    setTimeout(() => setScanSuccessBanner(null), 5000);
  };

  /**
   * Direct instant .pdf file download fallback
   */
  const handleDownloadDirectPdfFile = () => {
    const reportData = buildMonthlyReportPayload();
    const filename = triggerPdfReportDownload(reportData);
    setDownloadSuccess(true);
    setLastDownloadedFile(filename);
    setScanSuccessBanner(
      `Downloaded PDF: ${filename} • Total: ₹${monthlyReportEarnings.toLocaleString('en-IN')} | Saved: ₹${monthlyReportCommissionSaved.toLocaleString('en-IN')}`
    );
    setTimeout(() => setDownloadSuccess(false), 4000);
    setTimeout(() => setScanSuccessBanner(null), 6000);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (ledgerFilter === 'all') return true;
    return tx.status === ledgerFilter;
  });

  return (
    <div className="pb-24 max-w-lg mx-auto bg-[#F8FAFC] min-h-full animate-in fade-in duration-300">
      {/* Deep Slate Navy Header (#0F172A) */}
      <div className="bg-[#0F172A] text-white px-5 pt-5 pb-10 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
              LOCAL TRADES INDIA • 0% CUT WALLET
            </span>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2 mt-0.5">
              <Wallet className="text-amber-400" size={22} />
              <span>0% Fee Financial Hub</span>
            </h2>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <button
              type="button"
              onClick={handlePrintPdfReport}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
              title="Download / Print Formatted Monthly PDF Report (window.print)"
            >
              <Printer size={14} />
              <span>Download PDF Report</span>
            </button>
            <button
              type="button"
              onClick={() => setIsQrModalFullscreen(true)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg border border-emerald-400/30 active:scale-95 transition-all"
            >
              <QrCode size={14} />
              <span>Show QR</span>
            </button>
            {onBackToHub && (
              <button
                onClick={onBackToHub}
                className="px-2.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
              >
                Hub
              </button>
            )}
          </div>
        </div>

        {/* 0% Fee Financial Dashboard Metrics */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] font-bold text-slate-300 uppercase block">Total Earned</span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">
              ₹{earnings.toLocaleString('en-IN')}
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">100% Worker Keep</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] font-bold text-slate-300 uppercase block">Platform Cut</span>
            <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
              ₹0 (0%)
            </span>
            <span className="text-[9px] text-slate-300 font-medium">0% Fee Guarantee</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] font-bold text-amber-300 uppercase block">Fees Saved</span>
            <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
              ₹{commissionSaved.toLocaleString('en-IN')}
            </span>
            <span className="text-[9px] text-slate-300 font-medium">vs 25% Aggregators</span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-5 space-y-4 relative z-10">
        {/* Live Payment Notification Banner */}
        {scanSuccessBanner && (
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={22} className="flex-shrink-0 text-amber-300" />
              <p className="text-xs font-bold leading-snug">{scanSuccessBanner}</p>
            </div>
            <button onClick={() => setScanSuccessBanner(null)} className="text-white/80 hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}

        {/* =====================================================================
            MONTHLY FINANCIAL SUMMARY & DOWNLOAD PDF REPORT CARD
           ===================================================================== */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-900/10 shadow-md space-y-3.5">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-sm font-black">
                <FileText size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Monthly Financial Statement
                  </h3>
                  <span className="bg-amber-100 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-full">
                    TAX & BANK READY
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Formatted monthly summary of earnings, 0% fee savings & completed jobs
                </p>
              </div>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <Calendar size={12} className="text-slate-500" />
              <select
                value={selectedReportMonth}
                onChange={(e) => setSelectedReportMonth(e.target.value)}
                className="bg-transparent text-[11px] font-black text-slate-800 outline-none cursor-pointer"
                aria-label="Select Report Month"
              >
                <option value="October 2026">October 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
              </select>
            </div>
          </div>

          {/* 3-Column Monthly Preview Metrics */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-[9px] font-extrabold uppercase text-slate-400 block">
                Monthly Earnings
              </span>
              <span className="text-sm font-black font-mono text-slate-900 mt-0.5 block">
                ₹{monthlyReportEarnings.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-emerald-600 font-bold">100% Net Payout</span>
            </div>

            <div className="border-x border-slate-200/80 px-2">
              <span className="text-[9px] font-extrabold uppercase text-slate-400 block">
                Commission Saved
              </span>
              <span className="text-sm font-black font-mono text-amber-600 mt-0.5 block">
                ₹{monthlyReportCommissionSaved.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-slate-500 font-semibold">₹0 Platform Cut</span>
            </div>

            <div className="pl-1">
              <span className="text-[9px] font-extrabold uppercase text-slate-400 block">
                Completed Jobs
              </span>
              <span className="text-sm font-black font-mono text-slate-900 mt-0.5 block">
                {monthlyReportCompletedJobs} Jobs
              </span>
              <span className="text-[9px] text-emerald-600 font-bold">{worker.rating}★ Avg Rating</span>
            </div>
          </div>

          {/* Action Buttons: Download PDF Report & Preview Formatted Statement */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={handlePrintPdfReport}
              className="flex-1 py-3 px-4 bg-[#0F172A] hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
              title="Download / Print Formatted Monthly PDF Report (window.print)"
            >
              <Printer size={16} className="text-amber-400" />
              <span>
                {downloadSuccess
                  ? `Printing / Saving as PDF (${selectedReportMonth})...`
                  : `Download PDF Report (${selectedReportMonth})`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDirectPdfFile}
              className="py-3 px-3.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
              title="Download direct .PDF file"
            >
              <Download size={15} className="text-amber-600" />
              <span>Direct .PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPdfReportModal(true)}
              className="py-3 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
            >
              <FileText size={15} className="text-emerald-600" />
              <span>Preview</span>
            </button>
          </div>

          {lastDownloadedFile && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
              <span className="font-bold truncate">
                ✓ Saved: <span className="font-mono">{lastDownloadedFile}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPdfReportModal(true)}
                className="text-emerald-700 font-black underline ml-2 flex-shrink-0"
              >
                View Report
              </button>
            </div>
          )}
        </div>

        {/* =====================================================================
            PAYMENT OVERVIEW VISUALIZATION (DAILY EARNINGS BAR CHART: RECEIVED VS PENDING)
           ===================================================================== */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-emerald-400 flex items-center justify-center shadow-sm">
                <BarChart3 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Payment Overview
                  </h3>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-full">
                    7-DAY LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Daily earnings categorized by Received vs Pending status
                </p>
              </div>
            </div>

            {/* Grouped vs Stacked Bar Toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setChartMode('grouped')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartMode === 'grouped'
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Side-by-Side
              </button>
              <button
                type="button"
                onClick={() => setChartMode('stacked')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartMode === 'stacked'
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Stacked
              </button>
            </div>
          </div>

          {/* Received vs Pending Summary KPI Pills */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">
                    Received (7d)
                  </span>
                </div>
                <span className="text-lg font-black font-mono text-emerald-800 block mt-0.5">
                  ₹{totalWeeklyReceived.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  Settled via UPI / Cash
                </span>
              </div>
              <CheckCircle2 size={20} className="text-emerald-600 opacity-80" />
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-950">
                    Pending (7d)
                  </span>
                </div>
                <span className="text-lg font-black font-mono text-amber-900 block mt-0.5">
                  ₹{totalWeeklyPending.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-800 font-semibold">
                  Awaiting QR / COD
                </span>
              </div>
              <Clock size={20} className="text-amber-600 opacity-80" />
            </div>
          </div>

          {/* Interactive Daily Bar Chart Canvas */}
          <div className="pt-2 pb-1 px-2 bg-slate-50/90 rounded-2xl border border-slate-200/80">
            {/* Y-Axis Reference Scale */}
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-1 mb-1">
              <span>Max: ₹{maxDailyValue.toLocaleString('en-IN')}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-600 font-sans font-bold">
                  <span className="w-2 h-2 rounded-xs bg-[#10B981] inline-block" /> Received
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-sans font-bold">
                  <span className="w-2 h-2 rounded-xs bg-[#F59E0B] inline-block" /> Pending
                </span>
              </div>
            </div>

            {/* 7-Day Columns */}
            <div className="h-44 flex items-end justify-between gap-2 pt-4 pb-2 px-1 border-b border-slate-200 relative">
              {/* Horizontal Grid Lines */}
              <div className="absolute inset-x-1 top-4 border-t border-dashed border-slate-200/80 pointer-events-none" />
              <div className="absolute inset-x-1 top-1/2 border-t border-dashed border-slate-200/80 pointer-events-none" />

              {dailyBars.map((item, idx) => {
                const isSelected = idx === selectedDayIndex;
                const receivedHeightPct = Math.min(100, Math.max(8, Math.round((item.received / maxDailyValue) * 100)));
                const pendingHeightPct = item.pending > 0
                  ? Math.min(100, Math.max(8, Math.round((item.pending / maxDailyValue) * 100)))
                  : 0;

                return (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`flex-1 h-full flex flex-col justify-end items-center group relative rounded-xl p-1 transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 ring-1 ring-emerald-500/40'
                        : 'hover:bg-slate-200/50'
                    }`}
                    title={`${item.fullDate}: Received ₹${item.received} | Pending ₹${item.pending}`}
                  >
                    {/* Value Tooltip on Selected Day */}
                    {isSelected && (
                      <div className=" -top-3 bg-[#0F172A] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10 mb-1">
                        ₹{item.received + item.pending}
                      </div>
                    )}

                    {/* Bars Container */}
                    {chartMode === 'grouped' ? (
                      <div className="w-full flex-1 flex items-end justify-center gap-1 px-0.5">
                        {/* Received Bar */}
                        <div
                          style={{ height: `${receivedHeightPct}%` }}
                          className="w-3 sm:w-3.5 bg-gradient-to-t from-[#059669] to-[#10B981] rounded-t-md shadow-xs transition-all duration-500 group-hover:brightness-110"
                        />
                        {/* Pending Bar */}
                        <div
                          style={{ height: `${pendingHeightPct}%` }}
                          className={`w-3 sm:w-3.5 rounded-t-md transition-all duration-500 ${
                            item.pending > 0
                              ? 'bg-gradient-to-t from-amber-500 to-amber-400 shadow-xs'
                              : 'h-1 bg-slate-200'
                          }`}
                        />
                      </div>
                    ) : (
                      <div className="w-full flex-1 flex flex-col justify-end items-center px-1">
                        {/* Stacked Pending on Top */}
                        {item.pending > 0 && (
                          <div
                            style={{ height: `${pendingHeightPct}%` }}
                            className="w-4 sm:w-5 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-md transition-all duration-500"
                          />
                        )}
                        {/* Stacked Received on Bottom */}
                        <div
                          style={{ height: `${receivedHeightPct}%` }}
                          className={`w-4 sm:w-5 bg-gradient-to-t from-[#059669] to-[#10B981] transition-all duration-500 ${
                            item.pending === 0 ? 'rounded-t-md' : ''
                          }`}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* X-Axis Day Labels */}
            <div className="flex items-center justify-between gap-2 pt-2 px-1">
              {dailyBars.map((item, idx) => {
                const isSelected = idx === selectedDayIndex;
                return (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`flex-1 text-center py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                      isSelected
                        ? 'bg-[#0F172A] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Detailed Inspection & 1-Tap Pending Settlement */}
          <div className="p-3.5 rounded-2xl bg-[#0F172A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-white">
                  {selectedDay.fullDate} Breakdown
                </span>
                <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  {selectedDay.jobsCount} Jobs
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-emerald-400 font-bold">
                  Received: ₹{selectedDay.received.toLocaleString('en-IN')}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-400 font-bold">
                  Pending: ₹{selectedDay.pending.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {selectedDay.pending > 0 ? (
              <button
                type="button"
                onClick={() => handleSettleDayPending(selectedDayIndex)}
                className="px-3.5 py-2 bg-[#10B981] hover:bg-[#059669] text-slate-950 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                <CheckCircle2 size={14} />
                <span>Mark ₹{selectedDay.pending} Received</span>
              </button>
            ) : (
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={14} /> All Settled (₹0 Pending)
              </span>
            )}
          </div>
        </div>

        {/* =====================================================================
            DIRECT DYNAMIC SVG UPI QR CODE GENERATOR
           ===================================================================== */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500/20 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#10B981] text-slate-950 flex items-center justify-center shadow-sm font-black">
                <QrCode size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Direct Dynamic UPI QR Generator
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                    0% CUT
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Renders instant SVG UPI QR with final job price & worker VPA
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowQrGenerator(!showQrGenerator)}
              className="text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all"
            >
              {showQrGenerator ? 'Hide QR' : 'Open QR'}
            </button>
          </div>

          {showQrGenerator && (
            <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
              {/* Final Price Input + Quick Amount Presets */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Agreed Final Job Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={qrAmount}
                    onChange={(e) => setQrAmount(e.target.value)}
                    placeholder="500"
                    className="w-full pl-9 pr-24 py-3 bg-slate-50 border-2 border-slate-200 focus:border-[#10B981] focus:bg-white rounded-2xl text-xl font-mono font-black text-slate-900 outline-none transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg">
                    Keep 100%
                  </span>
                </div>

                {/* Quick Preset Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 mr-1">Quick Chips:</span>
                  {['250', '350', '450', '500', '850', '1500'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setQrAmount(amt)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                        qrAmount === amt
                          ? 'bg-[#0F172A] text-white border-[#0F172A]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Note & Worker VPA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Job / Service Description
                  </label>
                  <input
                    type="text"
                    value={qrServiceNote}
                    onChange={(e) => setQrServiceNote(e.target.value)}
                    placeholder="e.g. Faucet Repair"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    Worker Direct VPA (UPI ID)
                  </label>
                  <input
                    type="text"
                    value={workerUpiId}
                    onChange={(e) => setWorkerUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>

              {/* Dynamic SVG UPI QR Code Box */}
              <div className="bg-[#0F172A] rounded-3xl p-5 text-white text-center space-y-3 shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-400 border-b border-white/10 pb-2.5">
                  <span>LOCAL TRADES INDIA • DIRECT SVG UPI QR</span>
                  <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">0% FEE</span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl inline-block mx-auto shadow-2xl border-4 border-emerald-500/40">
                  <SvgUpiQrCode upiUri={upiIntentUri} size={176} />
                </div>

                <div>
                  <p className="text-xs text-slate-300 font-medium">Scan with GPay, PhonePe, Paytm or BHIM</p>
                  <h4 className="text-base font-black text-white mt-0.5">{worker.name}</h4>
                  <p className="text-[11px] font-mono text-emerald-400">{workerUpiId}</p>
                </div>

                <div className="bg-white/10 rounded-2xl py-2 px-4 inline-flex items-center gap-2 border border-white/15">
                  <span className="text-xs text-slate-200 font-semibold">Agreed Job Amount:</span>
                  <span className="text-2xl font-black font-mono text-amber-400">
                    ₹{numericAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Simulated Payment Buttons ("Mark Paid via GPay / PhonePe / Direct Cash") */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Simulate Instant Customer Settlement (Updates Bar Chart):
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRecordPayment('GPay', 'received')}
                      disabled={simulatingScan}
                      className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md"
                    >
                      <Smartphone size={14} />
                      <span>Mark Paid via GPay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRecordPayment('PhonePe', 'received')}
                      disabled={simulatingScan}
                      className="py-2.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-black flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md"
                    >
                      <Smartphone size={14} />
                      <span>Mark Paid via PhonePe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRecordPayment('Direct Cash', 'received')}
                      disabled={simulatingScan}
                      className="py-2.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-[11px] font-black flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md"
                    >
                      <Banknote size={14} />
                      <span>Mark Paid via Cash</span>
                    </button>
                  </div>
                </div>

                {/* Secondary Actions: Add as Pending or Copy UPI Link */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyUpiLink}
                    className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedLink ? 'UPI URI Copied' : 'Copy UPI Deep Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRecordPayment('GPay', 'pending')}
                    disabled={simulatingScan}
                    className="py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Clock size={13} />
                    <span>Log as Pending (₹{numericAmount})</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pass & Boost Pass System */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Pass & Boost Pass System (0% Commission)
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Crown size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-emerald-950">{planName}</h4>
                  <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[10px] text-emerald-800 mt-0.5">
                  Valid till: <strong>{expiresAt}</strong> • 0% Platform Commission
                </p>
              </div>
            </div>

            <button
              onClick={onOpenSubscriptionModal}
              className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs"
            >
              Switch Pass
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Zap size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-amber-950">Priority Map Boost (₹50/3 days)</h4>
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${isBoosted ? 'bg-amber-500 text-slate-950' : 'bg-gray-200 text-gray-700'}`}>
                    {isBoosted ? 'ACTIVE (★ TOP)' : 'INACTIVE'}
                  </span>
                </div>
                <p className="text-[10px] text-amber-800 mt-0.5">
                  Top placement in local searches & map radar
                </p>
              </div>
            </div>

            <button
              onClick={onOpenSubscriptionModal}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-xs"
            >
              {isBoosted ? 'Extend' : 'Boost ₹50'}
            </button>
          </div>
        </div>

        {/* Categorized Transaction Ledger (All / Received / Pending) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Job Payout Ledger ({filteredTransactions.length})
              </h3>
              <span className="text-[10px] text-emerald-600 font-bold">
                Direct Customer Payments • ₹0 Platform Deduction
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[10px] font-bold">
              {(['all', 'received', 'pending'] as const).map((statusFilter) => (
                <button
                  key={statusFilter}
                  type="button"
                  onClick={() => setLedgerFilter(statusFilter)}
                  className={`px-2.5 py-1 rounded-lg uppercase transition-all ${
                    ledgerFilter === statusFilter
                      ? 'bg-[#0F172A] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {statusFilter}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                    tx.status === 'received'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {tx.status === 'received' ? <ArrowDownLeft size={16} /> : <Clock size={16} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-slate-900 truncate">{tx.customer}</h5>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${
                        tx.status === 'received'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {tx.service} • <span className="text-slate-400">{tx.date}</span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-slate-600 font-semibold bg-slate-100 px-1.5 py-0.2 rounded">
                        {tx.mode}
                      </span>
                      {tx.utr && (
                        <span className="text-[9px] font-mono text-slate-400">{tx.utr}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono flex-shrink-0">
                  <span className={`text-sm font-black block ${
                    tx.status === 'received' ? 'text-emerald-700' : 'text-amber-600'
                  }`}>
                    {tx.status === 'received' ? '+' : ''}₹{tx.workerTakeHome.toLocaleString('en-IN')}
                  </span>
                  {tx.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => handleSettleSingleTransaction(tx.id)}
                      className="mt-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-[9px] rounded-md shadow-xs"
                    >
                      Mark Received
                    </button>
                  ) : (
                    <span className="text-[9px] text-slate-400">Cut: ₹0</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowPdfReportModal(true)}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <FileText size={13} />
              <span>Preview Statement</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintPdfReport}
                className="text-[11px] font-black text-amber-600 hover:text-amber-700 flex items-center gap-1"
                title="Print or Save as PDF using browser"
              >
                <Printer size={13} />
                <span>Print / Save as PDF</span>
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleDownloadDirectPdfFile}
                className="text-[11px] font-black text-emerald-700 hover:underline flex items-center gap-1"
              >
                <Download size={13} />
                <span>{downloadSuccess ? 'Downloaded!' : 'Download .PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          FORMATTED MONTHLY FINANCIAL REPORT (PDF PREVIEW & DOWNLOAD MODAL)
         ===================================================================== */}
      {showPdfReportModal && (
        <div
          className="fixed inset-0 z-[230] bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setShowPdfReportModal(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* PDF Document Header Bar */}
            <div className="bg-[#0F172A] text-white px-5 py-4 flex items-center justify-between border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                  LOCAL TRADES INDIA • CERTIFIED 0% FEE STATEMENT
                </span>
                <h3 className="text-base sm:text-lg font-black mt-0.5 flex items-center gap-2">
                  <FileText size={18} className="text-amber-400" />
                  <span>Monthly Earnings & Savings Report ({selectedReportMonth})</span>
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowPdfReportModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Formatted A4-Style Report Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-slate-800 bg-[#F8FAFC]">
              {/* Artisan Identity & Statement Metadata */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">{worker.name}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck size={11} /> KYC & PAN Verified
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium">
                    Trade: <strong className="text-slate-700">{worker.skills.join(', ')}</strong> • Direct UPI:{' '}
                    <span className="font-mono text-emerald-700 font-bold">{workerUpiId}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Active Pass: <strong>{planName}</strong>
                  </p>
                </div>

                <div className="sm:text-right space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Statement ID</span>
                  <span className="font-mono font-bold text-slate-900 block">
                    LTI-FIN-{selectedReportMonth.slice(0, 3).toUpperCase()}2026-{worker.id.slice(-3).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    0% Commission Verified
                  </span>
                </div>
              </div>

              {/* 4-Column Executive Financial Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-emerald-50/90 border border-emerald-200 p-3 rounded-2xl">
                  <span className="text-[9px] font-black uppercase text-emerald-800 block">
                    Total Earnings
                  </span>
                  <span className="text-lg font-black font-mono text-slate-900 mt-0.5 block">
                    ₹{monthlyReportEarnings.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] text-emerald-700 font-bold">100% Direct Payout</span>
                </div>

                <div className="bg-amber-50/90 border border-amber-200 p-3 rounded-2xl">
                  <span className="text-[9px] font-black uppercase text-amber-900 block">
                    Commission Saved
                  </span>
                  <span className="text-lg font-black font-mono text-amber-700 mt-0.5 block">
                    ₹{monthlyReportCommissionSaved.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] text-amber-800 font-bold">vs 20-25% Apps</span>
                </div>

                <div className="bg-white border border-slate-200 p-3 rounded-2xl">
                  <span className="text-[9px] font-black uppercase text-slate-500 block">
                    Platform Cut
                  </span>
                  <span className="text-lg font-black font-mono text-emerald-600 mt-0.5 block">
                    ₹0 (0%)
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold">Zero Middleman Cut</span>
                </div>

                <div className="bg-white border border-slate-200 p-3 rounded-2xl">
                  <span className="text-[9px] font-black uppercase text-slate-500 block">
                    Completed Jobs
                  </span>
                  <span className="text-lg font-black font-mono text-slate-900 mt-0.5 block">
                    {monthlyReportCompletedJobs} Jobs
                  </span>
                  <span className="text-[9px] text-emerald-700 font-bold">{worker.rating}★ Client Rating</span>
                </div>
              </div>

              {/* Section 1: 7-Day Payment Overview Breakdown (Received vs Pending) */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs font-black uppercase tracking-wider">
                  <span>1. Daily Earnings Summary (Received vs Pending)</span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    7-Day Total: ₹{(totalWeeklyReceived + totalWeeklyPending).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[10px] font-black uppercase">
                        <th className="py-2 px-3">Day</th>
                        <th className="py-2 px-3">Jobs</th>
                        <th className="py-2 px-3 text-emerald-700">Received (₹)</th>
                        <th className="py-2 px-3 text-amber-700">Pending (₹)</th>
                        <th className="py-2 px-3 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {dailyBars.map((bar) => (
                        <tr key={bar.day} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-sans font-bold text-slate-900">{bar.fullDate}</td>
                          <td className="py-2 px-3 text-slate-600">{bar.jobsCount}</td>
                          <td className="py-2 px-3 font-bold text-emerald-700">
                            ₹{bar.received.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 font-bold text-amber-600">
                            {bar.pending > 0 ? `₹${bar.pending.toLocaleString('en-IN')}` : '₹0'}
                          </td>
                          <td className="py-2 px-3 text-right font-black text-slate-900">
                            ₹{(bar.received + bar.pending).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Completed Jobs & Direct Payout Record */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs font-black uppercase tracking-wider">
                  <span>2. Completed Jobs & Direct Payout Record</span>
                  <span className="text-amber-400 text-[10px]">0% Platform Deduction</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[10px] font-black uppercase">
                        <th className="py-2 px-3">Customer & Job</th>
                        <th className="py-2 px-3">Mode / UTR</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Worker Keep</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{tx.customer}</div>
                            <div className="text-[10px] text-slate-500">
                              {tx.service} • {tx.date}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="text-[11px] font-semibold text-slate-700">{tx.mode}</div>
                            {tx.utr && <div className="text-[9px] font-mono text-slate-400">{tx.utr}</div>}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                tx.status === 'received'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                            ₹{tx.workerTakeHome.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer with Download PDF & Print Buttons */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handlePrintPdfReport}
                className="py-3 px-5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Printer size={15} className="text-amber-400" />
                <span>Print / Save as PDF (window.print)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadDirectPdfFile}
                className="py-3 px-6 bg-[#10B981] hover:bg-[#059669] text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Download size={16} />
                <span>Download .PDF File ({selectedReportMonth})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Customer-Facing SVG QR Modal */}
      {isQrModalFullscreen && (
        <div className="fixed inset-0 z-[220] bg-[#0F172A]/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 text-center">
            <div className="bg-[#0F172A] text-white p-5 relative">
              <button
                onClick={() => setIsQrModalFullscreen(false)}
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X size={18} />
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                LOCAL TRADES INDIA • 0% COMMISSION
              </span>
              <h3 className="text-lg font-black mt-1">{worker.name}</h3>
              <p className="text-xs text-slate-300">{worker.skills.join(' • ')} Specialist</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-white rounded-3xl border-4 border-[#10B981] shadow-xl inline-block">
                <SvgUpiQrCode upiUri={upiIntentUri} size={210} />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block">Total Payable to Worker</span>
                <span className="text-3xl font-black font-mono text-slate-900">
                  ₹{numericAmount.toLocaleString('en-IN')}
                </span>
                <p className="text-xs text-emerald-700 font-bold mt-1">
                  ✓ 100% goes directly to {worker.name.split(' ')[0]}'s bank account
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRecordPayment('GPay', 'received')}
                  disabled={simulatingScan}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase shadow-md"
                >
                  GPay
                </button>
                <button
                  onClick={() => handleRecordPayment('PhonePe', 'received')}
                  disabled={simulatingScan}
                  className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black uppercase shadow-md"
                >
                  PhonePe
                </button>
                <button
                  onClick={() => handleRecordPayment('Direct Cash', 'received')}
                  disabled={simulatingScan}
                  className="py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[11px] font-black uppercase shadow-md"
                >
                  Cash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          DEDICATED PRINTABLE MONTHLY REPORT (TRIGGERED VIA window.print())
          Formatted specifically for clean, professional A4 / Letter PDF generation
         ===================================================================== */}
      <div id="printable-monthly-report" className="hidden print:block bg-white text-slate-900 p-8 font-sans">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-black tracking-widest uppercase text-emerald-700 block">
                LOCAL TRADES INDIA • 0% COMMISSION MARKETPLACE
              </span>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
                MONTHLY FINANCIAL STATEMENT & EARNINGS REPORT
              </h1>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Certified Monthly Summary of Earnings, Commission Savings, and Completed Job History
              </p>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="font-bold text-slate-900 block">STATEMENT ID:</span>
              <span className="text-slate-600 block">
                LTI-FIN-{selectedReportMonth.slice(0, 3).toUpperCase()}2026-{worker.id.slice(-3).toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Issued: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Worker Credentials Card */}
        <div className="border border-slate-300 rounded-xl p-4 mb-6 bg-slate-50 flex justify-between items-center text-xs">
          <div>
            <h2 className="text-base font-black text-slate-950">{worker.name}</h2>
            <p className="text-slate-700 font-medium">
              Primary Trade: <strong>{worker.skills.join(', ')}</strong> • Direct UPI VPA:{' '}
              <strong className="text-emerald-700">{workerUpiId}</strong>
            </p>
            <p className="text-slate-500 mt-0.5">
              Active Tier: <strong>{planName}</strong> • Phone: {worker.phone}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-300">
              ✓ Verified Identity & PAN
            </span>
            <p className="text-[11px] text-slate-600 mt-1">
              Statement Period: <strong>{selectedReportMonth}</strong>
            </p>
          </div>
        </div>

        {/* Executive Summary Metrics Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6 text-xs">
          <div className="border-2 border-emerald-600 rounded-xl p-3 bg-emerald-50/50">
            <span className="text-[10px] font-black uppercase text-emerald-800 block">Total Earnings</span>
            <span className="text-xl font-black font-mono text-slate-950 mt-1 block">
              ₹{monthlyReportEarnings.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold">100% Retained by Worker</span>
          </div>

          <div className="border-2 border-amber-500 rounded-xl p-3 bg-amber-50/50">
            <span className="text-[10px] font-black uppercase text-amber-800 block">Commission Saved</span>
            <span className="text-xl font-black font-mono text-amber-900 mt-1 block">
              ₹{monthlyReportCommissionSaved.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-amber-700 font-bold">vs 20-25% Aggregators</span>
          </div>

          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50">
            <span className="text-[10px] font-black uppercase text-slate-600 block">Platform Commission</span>
            <span className="text-xl font-black font-mono text-emerald-600 mt-1 block">
              ₹0 (0%)
            </span>
            <span className="text-[10px] text-slate-500 font-medium">0% Fee Guarantee</span>
          </div>

          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50">
            <span className="text-[10px] font-black uppercase text-slate-600 block">Completed Jobs</span>
            <span className="text-xl font-black font-mono text-slate-950 mt-1 block">
              {monthlyReportCompletedJobs} Jobs
            </span>
            <span className="text-[10px] text-slate-600 font-bold">{worker.rating}★ Verified Client Rating</span>
          </div>
        </div>

        {/* Section 1: Daily Earnings Breakdown Table */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 border-b pb-1">
            1. Daily Earnings Breakdown (Received vs Pending Status)
          </h3>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                <th className="py-1.5 px-3">Day</th>
                <th className="py-1.5 px-3">Jobs Completed</th>
                <th className="py-1.5 px-3 text-emerald-800">Received (Settled via UPI/Cash)</th>
                <th className="py-1.5 px-3 text-amber-800">Pending Settlement</th>
                <th className="py-1.5 px-3 text-right">Daily Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {dailyBars.map((bar) => (
                <tr key={bar.day}>
                  <td className="py-1.5 px-3 font-sans font-bold text-slate-900">{bar.fullDate}</td>
                  <td className="py-1.5 px-3 text-slate-600">{bar.jobsCount} Jobs</td>
                  <td className="py-1.5 px-3 text-emerald-700 font-bold">₹{bar.received.toLocaleString('en-IN')}</td>
                  <td className="py-1.5 px-3 text-amber-700 font-bold">
                    {bar.pending > 0 ? `₹${bar.pending.toLocaleString('en-IN')}` : '₹0 (Settled)'}
                  </td>
                  <td className="py-1.5 px-3 text-right font-black text-slate-900">
                    ₹{(bar.received + bar.pending).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-black border-t-2 border-slate-300">
                <td className="py-2 px-3 font-sans">7-Day Total</td>
                <td className="py-2 px-3">{totalCompletedJobs7d} Jobs</td>
                <td className="py-2 px-3 text-emerald-800">₹{totalWeeklyReceived.toLocaleString('en-IN')}</td>
                <td className="py-2 px-3 text-amber-800">₹{totalWeeklyPending.toLocaleString('en-IN')}</td>
                <td className="py-2 px-3 text-right">₹{(totalWeeklyReceived + totalWeeklyPending).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Completed Job History for Current Worker */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 border-b pb-1">
            2. Completed Job History for Current Worker ({transactions.length} Verified Jobs)
          </h3>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                <th className="py-1.5 px-3">Date</th>
                <th className="py-1.5 px-3">Customer Name</th>
                <th className="py-1.5 px-3">Service Details</th>
                <th className="py-1.5 px-3">Payment Mode / Reference</th>
                <th className="py-1.5 px-3">Platform Fee</th>
                <th className="py-1.5 px-3 text-right">Net Payout (100%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{tx.date}</td>
                  <td className="py-2 px-3 font-bold text-slate-900">{tx.customer}</td>
                  <td className="py-2 px-3 text-slate-700">{tx.service}</td>
                  <td className="py-2 px-3 text-[11px]">
                    <span className="font-medium text-slate-800">{tx.mode}</span>
                    {tx.utr && <span className="block font-mono text-[10px] text-slate-500">{tx.utr}</span>}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-700">₹0 (0%)</td>
                  <td className="py-2 px-3 text-right font-mono font-black text-slate-950">
                    ₹{tx.workerTakeHome.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legal Sign-Off & Official Footnote */}
        <div className="border-t-2 border-slate-900 pt-4 text-[10px] text-slate-600 flex justify-between items-center">
          <div>
            <p className="font-bold text-slate-800">
              LOCAL TRADES INDIA • DIRECT-TO-WORKER ZERO-COMMISSION MARKETPLACE
            </p>
            <p className="mt-0.5">
              This document certifies that {worker.name} collected 100% of agreed customer payments directly via UPI / Cash with 0% platform deductions.
            </p>
            <p className="text-slate-500 mt-0.5">
              Valid as authentic proof of artisan income for bank verification, personal/equipment loans, and self-employed tax records.
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-4 font-mono">
            <span className="border border-emerald-700 text-emerald-800 px-3 py-1.5 rounded-lg font-bold uppercase inline-block">
              ✓ OFFICIALLY CERTIFIED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerWalletView;
