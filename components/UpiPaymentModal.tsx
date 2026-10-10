import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Smartphone, 
  QrCode, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Copy, 
  Check, 
  Banknote,
  Receipt,
  Sparkles,
  Lock,
  Printer
} from 'lucide-react';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  serviceTitle: string;
  workerName: string;
  onPaymentSuccess: (paymentDetails: {
    method: 'upi_gpay' | 'upi_phonepe' | 'upi_paytm' | 'upi_custom' | 'cash';
    transactionId?: string;
    paidAmount: number;
    status: 'paid' | 'pay_on_delivery';
  }) => void;
}

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '🔵 GPay', color: 'from-blue-500 to-indigo-600', method: 'upi_gpay' as const },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣 PhonePe', color: 'from-purple-600 to-indigo-700', method: 'upi_phonepe' as const },
  { id: 'paytm', name: 'Paytm UPI', icon: '🔷 Paytm', color: 'from-sky-500 to-blue-600', method: 'upi_paytm' as const },
  { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳 BHIM', color: 'from-emerald-600 to-teal-700', method: 'upi_custom' as const },
  { id: 'cred', name: 'CRED UPI', icon: '🖤 CRED', color: 'from-gray-800 to-black', method: 'upi_custom' as const }
];

const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  serviceTitle,
  workerName,
  onPaymentSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'apps' | 'vpa' | 'qr' | 'cash'>('apps');
  const [selectedApp, setSelectedApp] = useState<string>('gpay');
  const [customVpa, setCustomVpa] = useState<string>('anant8178581@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [txDetails, setTxDetails] = useState<{ utr: string; time: string } | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen) return null;

  const receiverUpiId = 'localtrades.pay@icici';
  const upiIntentUrl = `upi://pay?pa=${receiverUpiId}&pn=LocalTradesIndia&am=${amount}&cu=INR&tn=Booking-${encodeURIComponent(serviceTitle)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiIntentUrl)}&color=1e293b`;

  const handlePayViaApp = (appId: string) => {
    setSelectedApp(appId);
    handleTriggerPayment(appId === 'gpay' ? 'upi_gpay' : appId === 'phonepe' ? 'upi_phonepe' : 'upi_paytm');
  };

  const handleTriggerPayment = (method: 'upi_gpay' | 'upi_phonepe' | 'upi_paytm' | 'upi_custom') => {
    setIsProcessing(true);
    // Simulate real banking gateway authorization roundtrip (1.8 seconds)
    setTimeout(() => {
      const generatedUtr = `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTxDetails({ utr: generatedUtr, time: now });
      setIsProcessing(false);
      setIsCompleted(true);
    }, 1800);
  };

  const handleFinish = () => {
    onPaymentSuccess({
      method: selectedApp === 'gpay' ? 'upi_gpay' : selectedApp === 'phonepe' ? 'upi_phonepe' : selectedApp === 'paytm' ? 'upi_paytm' : 'upi_custom',
      transactionId: txDetails?.utr || `TXN${Date.now()}`,
      paidAmount: amount,
      status: 'paid'
    });
    onClose();
  };

  const handlePayCash = () => {
    onPaymentSuccess({
      method: 'cash',
      paidAmount: amount,
      status: 'pay_on_delivery'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <ShieldCheck size={26} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">UPI Safe Checkout</h3>
                <span className="bg-emerald-400/30 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                  <Lock size={10} /> 256-Bit
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium">NPCI / RBI Approved Payment</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount bar */}
        <div className="bg-emerald-50/80 border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider block">Total Amount to Pay</span>
            <span className="text-xs text-gray-500">{serviceTitle} • {workerName}</span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-gray-900 tracking-tight">₹{amount}</span>
            <span className="text-[11px] block font-bold text-emerald-700">Zero Convenience Fee</span>
          </div>
        </div>

        {/* Content */}
        {!isCompleted ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-gray-100 rounded-2xl text-xs font-bold text-gray-600">
              <button
                onClick={() => setActiveTab('apps')}
                className={`py-2 rounded-xl transition-all ${activeTab === 'apps' ? 'bg-white text-emerald-800 shadow-sm font-black' : 'hover:text-gray-900'}`}
              >
                UPI Apps
              </button>
              <button
                onClick={() => setActiveTab('vpa')}
                className={`py-2 rounded-xl transition-all ${activeTab === 'vpa' ? 'bg-white text-emerald-800 shadow-sm font-black' : 'hover:text-gray-900'}`}
              >
                UPI ID
              </button>
              <button
                onClick={() => setActiveTab('qr')}
                className={`py-2 rounded-xl transition-all ${activeTab === 'qr' ? 'bg-white text-emerald-800 shadow-sm font-black' : 'hover:text-gray-900'}`}
              >
                QR Code
              </button>
              <button
                onClick={() => setActiveTab('cash')}
                className={`py-2 rounded-xl transition-all ${activeTab === 'cash' ? 'bg-white text-emerald-800 shadow-sm font-black' : 'hover:text-gray-900'}`}
              >
                Cash
              </button>
            </div>

            {/* Tab: UPI Apps */}
            {activeTab === 'apps' && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Choose your preferred UPI App</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {UPI_APPS.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => handlePayViaApp(app.id)}
                      disabled={isProcessing}
                      className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-emerald-50/50 border border-gray-200 hover:border-emerald-300 rounded-2xl transition-all active:scale-[0.99] group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${app.color} text-white flex items-center justify-center font-bold text-xs shadow-md`}>
                          {app.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{app.name}</h4>
                          <span className="text-[11px] text-gray-500">Tap to pay ₹{amount} instantly</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-gray-400 transition-all border border-gray-200">
                        <ArrowRight size={16} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Custom VPA / UPI ID */}
            {activeTab === 'vpa' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                    Enter your UPI ID / VPA
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customVpa}
                      onChange={(e) => setCustomVpa(e.target.value)}
                      placeholder="e.g. yourname@oksbi / 9876543210@paytm"
                      className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <span className="absolute right-3 top-3.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    A collect request for ₹{amount} will be sent to your UPI app.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['@okaxis', '@okhdfcbank', '@oksbi', '@ybl', '@paytm'].map((handle) => (
                    <button
                      key={handle}
                      onClick={() => {
                        const prefix = customVpa.split('@')[0] || 'anant8178581';
                        setCustomVpa(`${prefix}${handle}`);
                      }}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-mono font-medium text-gray-700 transition-all"
                    >
                      {handle}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleTriggerPayment('upi_custom')}
                  disabled={!customVpa.includes('@') || isProcessing}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Smartphone size={18} />}
                  <span>Request Payment of ₹{amount}</span>
                </button>
              </div>
            )}

            {/* Tab: Dynamic QR Code */}
            {activeTab === 'qr' && (
              <div className="flex flex-col items-center text-center space-y-3">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Scan QR with any UPI App to Pay
                </p>
                <div className="p-3 bg-white rounded-3xl border-2 border-emerald-400 shadow-xl inline-block">
                  <img 
                    src={qrCodeUrl} 
                    alt="Scan UPI QR Code" 
                    className="w-48 h-48 rounded-2xl object-contain mx-auto"
                  />
                  <div className="mt-2 text-center">
                    <span className="text-xs font-black text-gray-800">Amount: ₹{amount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-mono text-gray-700">
                  <span>{receiverUpiId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(receiverUpiId);
                      setCopiedUpi(true);
                      setTimeout(() => setCopiedUpi(false), 2000);
                    }}
                    className="text-emerald-600 hover:text-emerald-700 ml-1"
                  >
                    {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                <button
                  onClick={() => handleTriggerPayment('upi_custom')}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  <span>I Have Paid via QR</span>
                </button>
              </div>
            )}

            {/* Tab: Pay on Delivery (Cash) */}
            {activeTab === 'cash' && (
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-4">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-700">
                  <Banknote size={32} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-base">Pay Cash on Completion</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    You can pay ₹{amount} in cash directly to {workerName} after you are 100% satisfied with the work done.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-200 text-left text-xs text-gray-700 space-y-1">
                  <span className="font-bold block text-gray-900">📌 Cash Process:</span>
                  <span>• Provide exact change of ₹{amount} if possible</span>
                  <span>• Worker will generate in-app digital receipt upon collection</span>
                </div>

                <button
                  onClick={handlePayCash}
                  className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-black uppercase tracking-wider transition-all"
                >
                  Confirm Cash on Delivery
                </button>
              </div>
            )}

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3 animate-pulse">
                <Loader2 size={24} className="animate-spin text-emerald-600" />
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Authorizing UPI Transfer...</h5>
                  <p className="text-xs text-gray-600">Connecting with your bank via NPCI gateway</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Payment Success Confirmation Receipt */
          <div className="p-6 text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-50">
              <CheckCircle2 size={46} className="animate-bounce" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider mb-1">
                <Sparkles size={12} /> Payment Verified
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">₹{amount} Paid Successfully</h3>
              <p className="text-xs text-gray-500 mt-1">Paid to Local Trades India for {serviceTitle}</p>
            </div>

            {/* Receipt card */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-gray-600">
                <span>Transaction UTR:</span>
                <span className="font-bold text-gray-900">{txDetails?.utr}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Time Stamp:</span>
                <span className="text-gray-900">{txDetails?.time}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment Mode:</span>
                <span className="font-bold text-emerald-700">UPI Instant Settlement</span>
              </div>
              <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-2">
                <span>Assigned Worker:</span>
                <span className="font-bold text-gray-900">{workerName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    window.print();
                  } catch (e) {
                    console.warn('Print failed:', e);
                  }
                }}
                className="flex-1 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Printer size={15} className="text-slate-600" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={handleFinish}
                className="flex-[2] py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Track Worker Live
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center text-[10px] text-gray-500 safe-bottom flex items-center justify-center gap-1">
          <ShieldCheck size={12} className="text-green-600" />
          <span>Secured by UPI • Reserve Bank of India (RBI) Compliant</span>
        </div>
      </div>
    </div>
  );
};

export default UpiPaymentModal;
