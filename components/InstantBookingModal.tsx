import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Star, 
  ShieldCheck, 
  BadgeCheck, 
  Tag, 
  Sparkles, 
  Check, 
  Banknote,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Gift,
  Info,
  CreditCard,
  Smartphone,
  Home,
  Calendar,
  User,
  HelpCircle
} from 'lucide-react';
import { Worker, UserLocation, BookingRecord } from '../types';
import { validateCoupon, Coupon } from '../services/couponService';
import { getLiveGPSLocation } from '../services/locationService';
import CouponCornerModal from './CouponCornerModal';
import UpiPaymentModal from './UpiPaymentModal';

interface InstantBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker;
  customerLocation: UserLocation;
  onUpdateLocation: (newLocation: UserLocation) => void;
  onBookingConfirmed: (booking: BookingRecord) => void;
  onOpenMapToCustomise?: () => void;
}

const InstantBookingModal: React.FC<InstantBookingModalProps> = ({
  isOpen,
  onClose,
  worker,
  customerLocation,
  onUpdateLocation,
  onBookingConfirmed,
  onOpenMapToCustomise
}) => {
  // Service category & price setup (matching screenshot e.g. ₹1,500 or worker basePrice)
  const baseServicePrice = worker.basePrice || (worker.skills.includes('Plumbing') ? 1500 : worker.skills.includes('AC Repair') ? 850 : 600);
  const defaultTaskTitle = worker.skills.includes('Plumbing') 
    ? 'Faucet & Main Line Repair' 
    : worker.skills.includes('Electrical')
    ? 'MCB & Switchboard Wiring'
    : worker.skills.includes('AC Repair')
    ? 'Split AC Jet Servicing & Gas Check'
    : `${worker.skills[0] || 'Trade'} Specialist Visit`;

  const [serviceSubtitle, setServiceSubtitle] = useState<string>(defaultTaskTitle);

  // Bargain states
  const [currentQuotedPrice, setCurrentQuotedPrice] = useState<number>(baseServicePrice);
  const [bargainedPrice, setBargainedPrice] = useState<number | undefined>(undefined);
  const [isBargainingOpen, setIsBargainingOpen] = useState(false);
  const [counterOfferInput, setCounterOfferInput] = useState<string>('');
  const [bargainStatus, setBargainStatus] = useState<'idle' | 'evaluating' | 'accepted' | 'countered' | 'rejected'>('idle');
  const [workerCounterProposal, setWorkerCounterProposal] = useState<number | null>(null);
  const [workerMessage, setWorkerMessage] = useState<string>('');

  // Coupon states
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isCouponCornerOpen, setIsCouponCornerOpen] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Customer Convenience Fee (₹20 to ₹40 transparent fee per booking; ₹30 default matching screenshot)
  const [convenienceFee, setConvenienceFee] = useState<number>(30);
  const [showFeeDetails, setShowFeeDetails] = useState(false);

  // Payment states matching the 3 visual cards in the reference UI: UPI, Credit Card, Cash on Delivery
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cash'>('upi');
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Calculation of final price
  const activeRate = bargainedPrice || currentQuotedPrice;
  const finalPrice = Math.max(99, activeRate + convenienceFee - couponDiscount);

  useEffect(() => {
    setCurrentQuotedPrice(baseServicePrice);
    setServiceSubtitle(defaultTaskTitle);
    setBargainedPrice(undefined);
    setBargainStatus('idle');
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponFeedback(null);
  }, [worker, baseServicePrice, defaultTaskTitle]);

  if (!isOpen) return null;

  // Auto-locate GPS handler
  const handleAutoLocate = async () => {
    setIsLocating(true);
    try {
      const live = await getLiveGPSLocation();
      onUpdateLocation(live);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLocating(false);
    }
  };

  // Bargain negotiation logic
  const handleSendBargainOffer = (offered: number) => {
    if (offered <= 0 || offered >= activeRate) return;
    setBargainStatus('evaluating');
    setWorkerMessage(`${worker.name.split(' ')[0]} is reviewing your offer...`);

    setTimeout(() => {
      const discountPercentage = ((activeRate - offered) / activeRate) * 100;

      if (discountPercentage <= 18) {
        setBargainedPrice(offered);
        setBargainStatus('accepted');
        setWorkerMessage(`Deal Accepted! "₹${offered} chalega bhai. Done deal!"`);
      } else if (discountPercentage <= 35) {
        const compromise = Math.round(offered + (activeRate - offered) * 0.45);
        setWorkerCounterProposal(compromise);
        setBargainStatus('countered');
        setWorkerMessage(`"Bhai ₹${offered} mein material aur transport nahi baithega. Final ₹${compromise} kar lo?"`);
      } else {
        const minAcceptable = Math.round(activeRate * 0.82);
        setWorkerCounterProposal(minAcceptable);
        setBargainStatus('countered');
        setWorkerMessage(`"Yeh bahut kam hai bhai. Lowest main ₹${minAcceptable} tak a sakta hoon."`);
      }
    }, 1000);
  };

  const handleAcceptWorkerCounter = () => {
    if (workerCounterProposal) {
      setBargainedPrice(workerCounterProposal);
      setBargainStatus('accepted');
      setWorkerMessage(`Agreed on ₹${workerCounterProposal}! Worker is ready to head out.`);
    }
  };

  // Coupon Apply
  const handleApplyCoupon = (couponToApply?: Coupon) => {
    const code = couponToApply ? couponToApply.code : couponCode;
    const res = validateCoupon(code, activeRate);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.discountAmount);
      setCouponFeedback({ success: true, message: res.message });
      setCouponCode(res.coupon.code);
    } else {
      setCouponFeedback({ success: false, message: res.message });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponFeedback(null);
    setCouponCode('');
  };

  // Final confirmation
  const handleConfirmAndProceed = () => {
    if (paymentMethod === 'upi') {
      setIsUpiModalOpen(true);
    } else if (paymentMethod === 'card') {
      finalizeBooking('card', 'paid', `CARD-${Date.now().toString().slice(-6)}`);
    } else {
      finalizeBooking('cash', 'pay_on_delivery');
    }
  };

  const finalizeBooking = (
    method: 'upi_gpay' | 'upi_phonepe' | 'upi_paytm' | 'upi_custom' | 'card' | 'cash',
    status: 'paid' | 'pay_on_delivery',
    txId?: string
  ) => {
    const generatedStartOtp = String(Math.floor(1000 + Math.random() * 9000));
    
    const booking: BookingRecord = {
      id: `BK-${Date.now().toString().slice(-6)}`,
      worker,
      customerName: 'Anant Sharma',
      customerPhone: '+91 98765 43210',
      customerLocation,
      serviceCategory: worker.skills[0] || 'Plumbing',
      serviceTitle: serviceSubtitle,
      originalPrice: baseServicePrice,
      bargainedPrice,
      appliedCoupon: appliedCoupon || undefined,
      couponDiscount,
      safetyFee: convenienceFee,
      tax: 0,
      finalPrice,
      status: 'heading_to_location',
      paymentMethod: method,
      paymentStatus: status,
      upiTransactionId: txId,
      otpStartCode: generatedStartOtp,
      workerCurrentLocation: {
        lat: worker.location.lat,
        lng: worker.location.lng
      },
      etaMinutes: Math.max(5, Math.round((worker.distance || 1.5) * 5)),
      distanceKm: worker.distance || 2.0,
      createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    onBookingConfirmed(booking);
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="w-full max-w-md bg-[#F4F6F9] rounded-t-[2.5rem] sm:rounded-[2.5rem] max-h-[94vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Deep Navy Curved Header matching Screenshot 1 (BOOKING CHECKOUT) */}
          <div className="bg-[#0B2447] text-white px-6 pt-5 pb-12 rounded-b-[2.5rem] relative">
            <button 
              onClick={onClose} 
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white"
              title="Close Checkout"
            >
              <X size={18} />
            </button>

            {/* 3-Step Stepper: Confirmation -> Payment -> Track */}
            <div className="max-w-xs mx-auto mb-5 pt-1">
              <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute left-6 right-6 top-3 h-0.5 bg-slate-600 z-0" />
                <div className="absolute left-6 w-1/2 top-3 h-0.5 bg-[#116D6E] z-0" />

                {/* Step 1: Confirmation */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className="w-6 h-6 rounded-full bg-[#116D6E] text-white flex items-center justify-center shadow-md border border-teal-300/40">
                    <Check size={13} strokeWidth={3} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-200">Confirmation</span>
                </div>

                {/* Step 2: Payment */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className="w-6 h-6 rounded-full bg-[#116D6E] text-white flex items-center justify-center shadow-md ring-4 ring-teal-500/20">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-300" />
                  </div>
                  <span className="text-[11px] font-bold text-white">Payment</span>
                </div>

                {/* Step 3: Track */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className="w-6 h-6 rounded-full bg-slate-600 text-slate-300 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">Track</span>
                </div>
              </div>
            </div>

            {/* Heading: CONFIRM BOOKING: PLUMBING */}
            <h3 className="text-base font-extrabold tracking-wide uppercase text-white text-left">
              CONFIRM BOOKING: {(worker.skills[0] || 'PLUMBING').toUpperCase()}
            </h3>
          </div>

          {/* Scrollable Body with Overlapping White Card */}
          <div className="flex-1 overflow-y-auto px-5 pb-5 -mt-7 space-y-4 relative z-10">
            {/* Main Worker & Fare Summary White Card */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200/80 space-y-4">
              {/* Worker Avatar + Name + Subtitle */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img 
                      src={worker.photoUrl} 
                      alt={worker.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {worker.name.split(' ')[0]} - {worker.skills[0] || 'Plumber'}
                      </h4>
                      {worker.verified && <BadgeCheck size={16} className="text-[#116D6E]" />}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{serviceSubtitle}</p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                      0% Commission • 100% Goes to {worker.name.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itemized Price Breakdown matching screenshot */}
              <div className="border-t border-slate-100 pt-3.5 space-y-2 text-sm">
                <div className="flex justify-between items-center text-slate-700 font-medium">
                  <span>Service Fee:</span>
                  <span className="font-mono font-bold text-slate-900">₹{activeRate.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-slate-700 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span>Convenience Fee:</span>
                    <button 
                      type="button"
                      onClick={() => setShowFeeDetails(!showFeeDetails)}
                      className="text-slate-400 hover:text-slate-600"
                      title="Platform Convenience Fee Calculator (₹20-₹40)"
                    >
                      <Info size={13} />
                    </button>
                  </div>
                  <span className="font-mono font-bold text-slate-900">₹{convenienceFee}</span>
                </div>

                {showFeeDetails && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Transparent Platform Fee (₹20–₹40):</span>
                      <div className="flex gap-1">
                        {[20, 30, 40].map((feeVal) => (
                          <button
                            key={feeVal}
                            type="button"
                            onClick={() => setConvenienceFee(feeVal)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              convenienceFee === feeVal ? 'bg-[#0B2447] text-white' : 'bg-white border border-slate-200 text-slate-700'
                            }`}
                          >
                            ₹{feeVal}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p>Covers live Google Maps GPS tracking, OTP job verification, and 0% worker commission operations.</p>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-bold text-xs">
                    <span>Coupon Discount ({appliedCoupon?.code}):</span>
                    <span className="font-mono">-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-slate-900">Total</span>
                  <span className="text-xl font-black font-mono text-slate-900">
                    ₹{finalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Quick Actions: Bargain & Coupon pills */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsBargainingOpen(!isBargainingOpen)}
                  className="flex-1 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                >
                  <Sparkles size={12} className="text-amber-600" />
                  <span>{bargainedPrice ? `Bargained: ₹${bargainedPrice}` : 'Negotiate / Bargain'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCouponInput(!showCouponInput)}
                  className="flex-1 py-2 px-3 bg-teal-50 hover:bg-teal-100 text-[#116D6E] border border-teal-200 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                >
                  <Tag size={12} />
                  <span>{appliedCoupon ? `${appliedCoupon.code} (-₹${couponDiscount})` : 'Apply Coupon'}</span>
                </button>
              </div>

              {/* Expandable Bargain Box */}
              {isBargainingOpen && (
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                    <span className="font-bold text-amber-950">Counter-Offer:</span>
                    {[-100, -200, -300].map((diff) => {
                      const candidate = Math.max(250, baseServicePrice + diff);
                      return (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => handleSendBargainOffer(candidate)}
                          className="px-2.5 py-1 bg-white hover:bg-amber-100 rounded-lg border border-amber-300 font-mono font-bold text-amber-900 text-xs"
                        >
                          ₹{candidate}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={counterOfferInput}
                      onChange={(e) => setCounterOfferInput(e.target.value)}
                      placeholder="Custom offer ₹..."
                      className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendBargainOffer(Number(counterOfferInput))}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold"
                    >
                      Send
                    </button>
                  </div>
                  {workerMessage && (
                    <div className="p-2 bg-white rounded-lg border border-amber-200 text-xs font-semibold text-slate-800 flex items-center justify-between gap-2">
                      <span>{workerMessage}</span>
                      {bargainStatus === 'countered' && workerCounterProposal && (
                        <button
                          type="button"
                          onClick={handleAcceptWorkerCounter}
                          className="px-2.5 py-1 bg-[#116D6E] text-white rounded-lg text-[11px] font-bold flex-shrink-0"
                        >
                          Accept ₹{workerCounterProposal}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Expandable Coupon Box */}
              {showCouponInput && (
                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2 animate-in fade-in">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter FIRST50 or DESI20"
                      className="flex-1 bg-white border border-teal-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold uppercase outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="px-3 py-1.5 bg-[#0B2447] text-white rounded-xl text-xs font-bold"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCouponCornerOpen(true)}
                      className="px-2.5 py-1.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
                    >
                      <Gift size={14} />
                    </button>
                  </div>
                  {couponFeedback && (
                    <div className="flex items-center justify-between text-[11px] font-bold text-teal-900">
                      <span>{couponFeedback.message}</span>
                      {appliedCoupon && (
                        <button onClick={handleRemoveCoupon} className="text-red-600 underline">Remove</button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Work Destination / Where Worker Has to Go Card */}
            <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#116D6E] flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Work Location (Where Worker Will Go)
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate">{customerLocation.formattedAddress}</p>
                  <span className="text-[10px] font-mono text-slate-500">
                    GPS: {customerLocation.lat.toFixed(4)}, {customerLocation.lng.toFixed(4)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleAutoLocate}
                  disabled={isLocating}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                  title="Detect GPS"
                >
                  {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                </button>
                {onOpenMapToCustomise && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenMapToCustomise();
                      onClose();
                    }}
                    className="px-2.5 py-1.5 bg-[#0B2447] text-white rounded-xl text-[10px] font-bold"
                  >
                    Pin Map
                  </button>
                )}
              </div>
            </div>

            {/* Payment Options Section matching Screenshot 1 */}
            <div className="space-y-3 pt-1">
              <h4 className="text-sm font-extrabold text-slate-900 px-0.5">
                Payment options
              </h4>

              <div className="grid grid-cols-3 gap-3">
                {/* Option 1: UPI */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`w-full h-24 bg-white rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 p-2 shadow-sm transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-[#116D6E] ring-2 ring-teal-500/20'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-white to-emerald-600 p-0.5 shadow-xs flex items-center justify-center border border-slate-200">
                      <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center font-black text-[11px] text-slate-900 tracking-tighter">
                        UPI
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      paymentMethod === 'upi' ? 'border-[#116D6E]' : 'border-slate-400'
                    }`}
                  >
                    {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-[#116D6E]" />}
                  </button>
                </div>

                {/* Option 2: Credit Card */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full h-24 bg-white rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 p-2 shadow-sm transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#116D6E] ring-2 ring-teal-500/20'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0B2447] flex items-center justify-center">
                      <CreditCard size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-900 text-center leading-tight">Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      paymentMethod === 'card' ? 'border-[#116D6E]' : 'border-slate-400'
                    }`}
                  >
                    {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-[#116D6E]" />}
                  </button>
                </div>

                {/* Option 3: Cash on Delivery */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full h-24 bg-white rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 p-2 shadow-sm transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-[#116D6E] ring-2 ring-teal-500/20'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#116D6E] flex items-center justify-center">
                      <Banknote size={22} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 text-center leading-tight">
                      Cash on Delivery
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      paymentMethod === 'cash' ? 'border-[#116D6E]' : 'border-slate-400'
                    }`}
                  >
                    {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-[#116D6E]" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm & Pay Pill CTA Button matching Screenshot 1 */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmAndProceed}
                className="w-full py-4 bg-[#116D6E] hover:bg-[#0d5657] text-white rounded-full font-bold text-base shadow-lg shadow-teal-900/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Confirm & Pay</span>
              </button>
            </div>
          </div>

          {/* Bottom Navigation Bar matching Screenshot 1 */}
          <div className="bg-white border-t border-slate-200 px-6 py-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <button onClick={onClose} className="flex flex-col items-center gap-1 text-[#0B2447] font-bold">
              <Home size={18} />
              <span>Home</span>
            </button>
            <button onClick={onClose} className="flex flex-col items-center gap-1 hover:text-slate-800">
              <Calendar size={18} />
              <span>Bookings</span>
            </button>
            <button onClick={onClose} className="flex flex-col items-center gap-1 hover:text-slate-800">
              <User size={18} />
              <span>Account</span>
            </button>
            <button onClick={onClose} className="flex flex-col items-center gap-1 hover:text-slate-800">
              <HelpCircle size={18} />
              <span>Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Coupon Corner Modal */}
      <CouponCornerModal
        isOpen={isCouponCornerOpen}
        onClose={() => setIsCouponCornerOpen(false)}
        onApplyCoupon={(c) => handleApplyCoupon(c)}
        appliedCouponCode={appliedCoupon?.code}
        orderAmount={activeRate}
      />

      {/* UPI Gateway Modal */}
      <UpiPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        amount={finalPrice}
        serviceTitle={serviceSubtitle}
        workerName={worker.name}
        onPaymentSuccess={(details) => {
          finalizeBooking(details.method, details.status, details.transactionId);
        }}
      />
    </>
  );
};

export default InstantBookingModal;
