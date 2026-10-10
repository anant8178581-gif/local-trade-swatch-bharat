import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { 
  X, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Star, 
  Copy, 
  Check, 
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Navigation,
  Camera,
  Bell,
  Home,
  Calendar,
  User,
  HelpCircle,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { BookingRecord, BookingStatus, Review } from '../types';

interface LiveWorkerTrackerModalProps {
  booking: BookingRecord;
  onClose: () => void;
  onCancelBooking: (bookingId: string) => void;
  onCallWorker: (workerName: string) => void;
  onChatWorker: (workerName: string) => void;
  onJobComplete: (booking: BookingRecord) => void;
  onAddWorkReview?: (workerId: string, review: Review, lastPlace: string, lastPhoto: string) => void;
}

const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC9O0NwHd9EjrGwH6BEgXHFjL9L1hOykBA';

const LiveWorkerTrackerModal: React.FC<LiveWorkerTrackerModalProps> = ({
  booking,
  onClose,
  onCancelBooking,
  onCallWorker,
  onChatWorker,
  onJobComplete,
  onAddWorkReview
}) => {
  const [currentStatus, setCurrentStatus] = useState<BookingStatus>(booking.status || 'heading_to_location');
  const [etaMinutes, setEtaMinutes] = useState<number>(booking.etaMinutes || 8);
  const [distanceKm, setDistanceKm] = useState<number>(booking.distanceKm || 2.0);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [workerEnteredOtp, setWorkerEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState(false);

  // Dual-Party Map Tracking Perspective: 'customer' (tracking worker) vs 'worker' (where worker has to go & work)
  const [trackingParty, setTrackingParty] = useState<'customer' | 'worker'>('customer');

  // Simulated live moving coordinates for Worker heading toward Customer
  const [workerPos, setWorkerPos] = useState<{ lat: number; lng: number }>({
    lat: booking.workerCurrentLocation?.lat || booking.customerLocation.lat - 0.009,
    lng: booking.workerCurrentLocation?.lng || booking.customerLocation.lng - 0.008
  });

  // Post-Job / In-Modal Dynamic UPI QR Generator state
  const [showUpiQrGenerator, setShowUpiQrGenerator] = useState<boolean>(false);
  const [finalJobAmount, setFinalJobAmount] = useState<string>(String(booking.finalPrice || 1530));
  const [workerUpiId, setWorkerUpiId] = useState<string>(booking.worker.upiId || 'ramesh.plumber@okhdfcbank');
  const [qrPaymentPaid, setQrPaymentPaid] = useState<boolean>(booking.paymentStatus === 'paid');
  const [qrPaidUtr, setQrPaidUtr] = useState<string | null>(booking.upiTransactionId || null);
  const [isSimulatingQrPay, setIsSimulatingQrPay] = useState<boolean>(false);
  const [copiedUpiLink, setCopiedUpiLink] = useState<boolean>(false);

  // Geotagged Work Proof & Dual-Rating state on completion
  const [workProofPhoto, setWorkProofPhoto] = useState<string>(
    booking.worker.lastWorkPhoto || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80'
  );
  const [geotagStamp] = useState<{ lat: number; lng: number; timestamp: string }>({
    lat: booking.customerLocation.lat,
    lng: booking.customerLocation.lng,
    timestamp: new Date().toLocaleString('en-IN')
  });
  const [ratingMode, setRatingMode] = useState<'customer_to_worker' | 'worker_to_customer'>('customer_to_worker');
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual', 'High Quality', 'Polite Behavior']);
  const [reviewComment, setReviewComment] = useState<string>('Excellent work completed on time with verified GPS geotag.');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  const workerFirstName = booking.worker.name.split(' ')[0];
  const tradeUpper = (booking.serviceCategory || booking.worker.skills[0] || 'PLUMBER').toUpperCase();
  const subLabel = booking.worker.subscriptionPlan === 'monthly' ? '₹99 subscription model' : '₹10 subscription model';

  // Live movement & countdown simulation along Google Map route
  useEffect(() => {
    if (currentStatus === 'worker_assigned' || currentStatus === 'heading_to_location') {
      const interval = setInterval(() => {
        setEtaMinutes((prev) => {
          if (prev <= 1) {
            setCurrentStatus('arrived');
            setDistanceKm(0);
            setWorkerPos({
              lat: booking.customerLocation.lat,
              lng: booking.customerLocation.lng
            });
            return 0;
          }
          const next = prev - 1;
          setDistanceKm((d) => Math.max(0.1, Math.round((d - 0.25) * 10) / 10));
          // Move worker marker 20% closer to customer location on Google Map
          setWorkerPos((curr) => ({
            lat: curr.lat + (booking.customerLocation.lat - curr.lat) * 0.25,
            lng: curr.lng + (booking.customerLocation.lng - curr.lng) * 0.25
          }));
          return next;
        });
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [currentStatus, booking.customerLocation]);

  const handleStepWorkerCloser = () => {
    if (etaMinutes <= 1 || currentStatus === 'arrived') {
      setCurrentStatus('arrived');
      setEtaMinutes(0);
      setDistanceKm(0);
      setWorkerPos({
        lat: booking.customerLocation.lat,
        lng: booking.customerLocation.lng
      });
    } else {
      setEtaMinutes((p) => Math.max(1, p - 2));
      setDistanceKm((d) => Math.max(0.2, Math.round((d - 0.5) * 10) / 10));
      setWorkerPos((curr) => ({
        lat: curr.lat + (booking.customerLocation.lat - curr.lat) * 0.4,
        lng: curr.lng + (booking.customerLocation.lng - curr.lng) * 0.4
      }));
    }
  };

  const handleCopyOtp = () => {
    navigator.clipboard?.writeText(booking.otpStartCode);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleVerifyOtpAndStartJob = () => {
    if (workerEnteredOtp === booking.otpStartCode || workerEnteredOtp === '') {
      setCurrentStatus('work_in_progress');
      setOtpError(false);
    } else {
      setOtpError(true);
    }
  };

  const handleTransitionToCompleted = () => {
    setCurrentStatus('completed');
    setShowUpiQrGenerator(true);
  };

  // Dynamic UPI QR Code URI & Image
  const numericFinalPrice = Math.max(1, Number(finalJobAmount) || booking.finalPrice);
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(workerUpiId)}&pn=${encodeURIComponent(booking.worker.name)}&am=${numericFinalPrice}&cu=INR&tn=${encodeURIComponent(booking.serviceTitle || 'Trade Service')}`;
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiIntentUrl)}&color=0B2447&bgcolor=FFFFFF&margin=8`;

  const handleSimulateUpiQrPayment = (app: 'GPay' | 'PhonePe' | 'Paytm') => {
    setIsSimulatingQrPay(true);
    setTimeout(() => {
      const utr = `UPI/${Math.floor(400000000000 + Math.random() * 599999999999)}`;
      setQrPaidUtr(`${utr} (${app})`);
      setQrPaymentPaid(true);
      setIsSimulatingQrPay(false);
    }, 1000);
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitDualReview = () => {
    if (onAddWorkReview) {
      const newRev: Review = {
        id: `rev-${Date.now()}`,
        userName: ratingMode === 'customer_to_worker' ? booking.customerName : `${booking.worker.name} (Worker Review)`,
        rating: ratingStars,
        comment: `${reviewComment} [${selectedTags.join(', ')}]`,
        date: 'Just now',
        lastPlace: booking.customerLocation.formattedAddress,
        workPhoto: workProofPhoto,
        workTitle: booking.serviceTitle,
        category: booking.serviceCategory,
        completionTime: 'Completed today',
        verifiedBadge: true,
        tags: selectedTags,
        reviewType: ratingMode,
        geotag: geotagStamp
      };
      onAddWorkReview(booking.worker.id, newRev, booking.customerLocation.formattedAddress, workProofPhoto);
    }
    setReviewSubmitted(true);
  };

  const mapCenter = {
    lat: (workerPos.lat + booking.customerLocation.lat) / 2,
    lng: (workerPos.lng + booking.customerLocation.lng) / 2
  };

  const customerToWorkerTags = ['Punctual', 'High Quality', 'Polite Behavior', 'Fair Price', 'Clean Work'];
  const workerToCustomerTags = ['Prompt Payment', 'Safe Site Environment', 'Clear Instructions', 'Respectful Client'];

  return (
    <div 
      className="fixed inset-0 z-[125] bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#F4F6F9] rounded-t-[2.5rem] sm:rounded-[2.5rem] max-h-[95vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Deep Navy Curved Header matching Screenshot 2 (SERVICE TRACKING) */}
        <div className="bg-[#0B2447] text-white px-6 pt-5 pb-8 rounded-b-[2.25rem] relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-extrabold tracking-wide uppercase text-white">
                LOCALSTRADEINDIA
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {trackingParty === 'customer'
                  ? 'Customer with active booking'
                  : `Worker Route: Heading to ${booking.customerName}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUpiQrGenerator(!showUpiQrGenerator)}
                className="px-2.5 py-1.5 rounded-xl bg-[#116D6E] hover:bg-teal-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md border border-teal-400/30"
                title="Generate UPI QR for 0% Commission Payment"
              >
                <QrCode size={13} />
                <span>UPI QR</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
              >
                <Bell size={16} className="hidden" />
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Dual-Party Map Tracking Switcher (Track Both Parties on Map) */}
          <div className="mt-3 grid grid-cols-2 gap-1.5 p-1 bg-white/10 rounded-xl border border-white/10 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setTrackingParty('customer')}
              className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                trackingParty === 'customer'
                  ? 'bg-[#116D6E] text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>👤 Customer Map View</span>
            </button>
            <button
              type="button"
              onClick={() => setTrackingParty('worker')}
              className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                trackingParty === 'worker'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🛠️ Worker Work-Site Map</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 -mt-4 space-y-3.5 relative z-20">
          {/* LIVE INTERACTIVE GOOGLE MAP CARD (Matching Screenshot 2 Map Box) */}
          <div className="bg-white rounded-3xl p-2 shadow-lg border border-slate-200/90 overflow-hidden">
            <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-slate-100">
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                  style={{ width: '100%', height: '100%' }}
                  defaultCenter={mapCenter}
                  center={mapCenter}
                  defaultZoom={14}
                  mapId="DEMO_MAP_ID"
                  gestureHandling="greedy"
                  disableDefaultUI={true}
                >
                  {/* Customer Destination Marker (Where Worker Has to Go and Work) */}
                  <AdvancedMarker position={booking.customerLocation}>
                    <div className="relative flex flex-col items-center">
                      <div className="bg-[#0B2447] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md mb-1 whitespace-nowrap border border-white">
                        {trackingParty === 'worker' ? `🎯 Work Here: ${booking.customerLocation.area}` : '🏠 Customer Location'}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#0B2447] p-0.5 shadow-xl border-2 border-white flex items-center justify-center relative">
                        <img
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop"
                          alt="Customer"
                          className="w-full h-full rounded-full object-cover"
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#116D6E] border-2 border-white" />
                      </div>
                    </div>
                  </AdvancedMarker>

                  {/* Worker Live Marker with Floating Callout matching Screenshot 2 */}
                  <AdvancedMarker position={workerPos}>
                    <div className="relative flex flex-col items-center">
                      {/* Floating Callout Card matching Screenshot 2: "Ramesh (₹10 subscription model) 2km away" */}
                      <div className="bg-white rounded-2xl p-2 shadow-xl border border-slate-200 flex items-center gap-2 mb-1.5 min-w-[175px]">
                        <img
                          src={booking.worker.photoUrl}
                          alt={booking.worker.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div className="text-left leading-tight">
                          <h5 className="text-[11px] font-extrabold text-slate-900">{workerFirstName}</h5>
                          <span className="text-[9px] text-slate-500 block">({subLabel})</span>
                          <span className="text-[10px] font-bold text-[#116D6E] block">
                            {distanceKm > 0 ? `${distanceKm}km away` : 'Arrived at site'}
                          </span>
                        </div>
                      </div>

                      {/* Worker Pin Icon */}
                      <div className="w-10 h-10 rounded-full bg-[#0B2447] p-0.5 shadow-2xl border-2 border-amber-400 flex items-center justify-center relative">
                        <img
                          src={booking.worker.photoUrl}
                          alt={booking.worker.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                  </AdvancedMarker>
                </Map>
              </APIProvider>

              {/* Floating Map Controls Overlay */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-auto">
                <div className="bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl text-[10px] font-mono">
                  <span className="text-teal-300 font-bold">Worker:</span> {workerPos.lat.toFixed(4)}, {workerPos.lng.toFixed(4)}
                </div>
                {currentStatus !== 'arrived' && currentStatus !== 'work_in_progress' && currentStatus !== 'completed' && (
                  <button
                    type="button"
                    onClick={handleStepWorkerCloser}
                    className="px-2.5 py-1.5 bg-[#116D6E] hover:bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1"
                  >
                    <Navigation size={11} />
                    <span>Move Closer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Worker Destination Bar (Where Worker Has to Go and Work) */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin size={15} className="text-[#116D6E] flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">
                    {trackingParty === 'worker' ? 'Work Destination (Go Here to Work)' : 'Customer Service Location'}
                  </span>
                  <p className="font-bold text-slate-900 truncate">{booking.customerLocation.formattedAddress}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#0B2447] bg-slate-200/70 px-2 py-1 rounded-lg flex-shrink-0">
                PIN: {booking.customerLocation.pincode || '400014'}
              </span>
            </div>
          </div>

          {/* STATUS BANNER + ETA CARD matching Screenshot 2 ("PLUMBER IS EN ROUTE") */}
          <div className="bg-white rounded-3xl shadow-md border border-slate-200/90 overflow-hidden">
            {/* Dark Navy Banner */}
            <div className="bg-[#0B2447] text-white py-2.5 px-4 text-center">
              <span className="text-xs font-extrabold uppercase tracking-wider">
                {currentStatus === 'worker_assigned' && `${tradeUpper} IS CONFIRMED & DISPATCHED`}
                {currentStatus === 'heading_to_location' && `${tradeUpper} IS EN ROUTE`}
                {currentStatus === 'arrived' && `${tradeUpper} HAS ARRIVED AT WORK LOCATION`}
                {currentStatus === 'work_in_progress' && `WORK IN PROGRESS AT SITE`}
                {currentStatus === 'completed' && `JOB COMPLETED • 0% COMMISSION PAYOUT`}
              </span>
            </div>

            <div className="p-4 space-y-4">
              {/* Worker Avatar + Name ETA */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <img
                    src={booking.worker.photoUrl}
                    alt={booking.worker.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                  />
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {workerFirstName} ETA
                    </h4>
                    <p className="text-sm text-slate-600 font-medium">
                      {currentStatus === 'completed'
                        ? 'Service Completed'
                        : currentStatus === 'work_in_progress'
                        ? 'Currently working at location'
                        : etaMinutes > 0
                        ? `Arriving in ${etaMinutes} mins`
                        : 'Arrived at your doorstep'}
                    </p>
                  </div>
                </div>

                {/* OTP Pill */}
                <div className="text-right bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Start OTP</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-black text-sm text-[#0B2447] tracking-widest">
                      {booking.otpStartCode}
                    </span>
                    <button onClick={handleCopyOtp} className="text-slate-400 hover:text-slate-700">
                      {copiedOtp ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Call & Message Pill Buttons matching Screenshot 2 */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${booking.customerPhone || '+919876543210'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onCallWorker(booking.worker.name);
                  }}
                  className="py-3 px-4 bg-[#116D6E] hover:bg-[#0d5657] text-white rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Phone size={15} />
                  <span>Call {workerFirstName}</span>
                </a>

                <button
                  type="button"
                  onClick={() => onChatWorker(booking.worker.name)}
                  className="py-3 px-4 bg-[#116D6E] hover:bg-[#0d5657] text-white rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <MessageSquare size={15} />
                  <span>Message</span>
                </button>
              </div>

              {/* Action Progression Bar (Start Work / Complete Job / Generate UPI QR) */}
              {currentStatus !== 'work_in_progress' && currentStatus !== 'completed' && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={workerEnteredOtp}
                    onChange={(e) => {
                      setWorkerEnteredOtp(e.target.value);
                      setOtpError(false);
                    }}
                    placeholder={`Enter OTP (${booking.otpStartCode})`}
                    className="w-36 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-center outline-none focus:border-[#116D6E]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtpAndStartJob}
                    className="flex-1 py-2.5 px-3 bg-[#0B2447] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Verify OTP & Start Work
                  </button>
                </div>
              )}
              {otpError && <p className="text-[11px] text-red-600 font-bold">Incorrect OTP code.</p>}

              {currentStatus === 'work_in_progress' && (
                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    type="button"
                    onClick={handleTransitionToCompleted}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={16} />
                    <span>Complete Job & Generate UPI QR</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* GENERATE UPI QR FOR POST-JOB COMPLETION / DIRECT 0% COMMISSION PAYOUT */}
          {(showUpiQrGenerator || currentStatus === 'completed') && (
            <div className="bg-white rounded-3xl p-5 shadow-lg border-2 border-[#116D6E] space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#116D6E] text-white flex items-center justify-center shadow">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-slate-900 uppercase">
                        Direct Worker UPI QR
                      </h4>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                        0% CUT
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Scan with GPay, PhonePe, or Paytm to pay {booking.worker.name} directly
                    </p>
                  </div>
                </div>
              </div>

              {/* Editable Final Job Price for Dynamic QR */}
              <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Final Job Price (₹)
                  </label>
                  <input
                    type="number"
                    value={finalJobAmount}
                    onChange={(e) => setFinalJobAmount(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-base font-mono font-black text-slate-900 outline-none focus:border-[#116D6E]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Worker UPI VPA
                  </label>
                  <input
                    type="text"
                    value={workerUpiId}
                    onChange={(e) => setWorkerUpiId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#116D6E]"
                  />
                </div>
              </div>

              {/* Scannable QR Code Card */}
              <div className="bg-[#0B2447] text-white rounded-3xl p-4 text-center space-y-3">
                <div className="bg-white p-3 rounded-2xl inline-block mx-auto shadow-xl">
                  <img
                    src={dynamicQrUrl}
                    alt={`UPI QR for ₹${numericFinalPrice}`}
                    className="w-44 h-44 object-contain mx-auto"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-teal-300 font-bold block">
                    100% Direct to {booking.worker.name} • ₹0 Platform Commission
                  </span>
                  <span className="text-2xl font-black font-mono text-amber-400 mt-0.5 block">
                    ₹{numericFinalPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                {qrPaymentPaid ? (
                  <div className="p-3 bg-emerald-600/30 border border-emerald-400/50 rounded-2xl text-xs font-bold text-emerald-200 flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-300" />
                    <span>Paid Directly to Worker! {qrPaidUtr ? `(${qrPaidUtr})` : ''}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {(['GPay', 'PhonePe', 'Paytm'] as const).map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => handleSimulateUpiQrPayment(app)}
                          disabled={isSimulatingQrPay}
                          className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white flex items-center gap-1 transition-all"
                        >
                          <Smartphone size={12} className="text-teal-300" />
                          <span>Pay via {app}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(upiIntentUrl);
                        setCopiedUpiLink(true);
                        setTimeout(() => setCopiedUpiLink(false), 2000);
                      }}
                      className="text-[11px] text-slate-300 hover:text-white underline inline-flex items-center gap-1"
                    >
                      {copiedUpiLink ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedUpiLink ? 'UPI Deep Link Copied' : 'Copy UPI Deep Link'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Post-Job Completion: Geotagged Work Proof & Two-Way Rating */}
          {currentStatus === 'completed' && (
            <div className="bg-white rounded-3xl p-4 shadow-md border border-slate-200 space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Camera size={14} className="text-[#116D6E]" />
                    <span>Geotagged Work Proof & Dual Rating</span>
                  </h4>
                  <p className="text-[10px] text-emerald-700 font-bold">
                    ✓ Verified Geotagged Location: {geotagStamp.lat.toFixed(4)}, {geotagStamp.lng.toFixed(4)}
                  </p>
                </div>
              </div>

              {/* Geotagged Photo Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-32">
                <img src={workProofPhoto} alt="Geotagged Work Proof" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-xs text-white p-2 text-[10px] font-mono flex items-center justify-between">
                  <span>📍 GPS: {geotagStamp.lat.toFixed(4)}° N, {geotagStamp.lng.toFixed(4)}° E</span>
                  <span className="text-emerald-400 font-bold">{geotagStamp.timestamp}</span>
                </div>
              </div>

              {/* Two-Way Feedback Toggle: Customer-to-Worker vs Worker-to-Customer */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setRatingMode('customer_to_worker');
                    setSelectedTags(['Punctual', 'High Quality']);
                  }}
                  className={`py-1.5 rounded-lg transition-all ${
                    ratingMode === 'customer_to_worker' ? 'bg-white text-[#0B2447] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Rate Worker ({workerFirstName})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRatingMode('worker_to_customer');
                    setSelectedTags(['Prompt Payment', 'Safe Site Environment']);
                  }}
                  className={`py-1.5 rounded-lg transition-all ${
                    ratingMode === 'worker_to_customer' ? 'bg-white text-[#0B2447] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Rate Customer ({booking.customerName.split(' ')[0]})
                </button>
              </div>

              {/* Star Selector */}
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setRatingStars(st)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      size={24}
                      className={st <= ratingStars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                    />
                  </button>
                ))}
              </div>

              {/* Feedback Tags */}
              <div className="flex flex-wrap gap-1.5">
                {(ratingMode === 'customer_to_worker' ? customerToWorkerTags : workerToCustomerTags).map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        active
                          ? 'bg-[#116D6E] text-white border-[#116D6E]'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {active ? `✓ ${tag}` : tag}
                    </button>
                  );
                })}
              </div>

              {!reviewSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmitDualReview}
                  className="w-full py-3 bg-[#0B2447] hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md"
                >
                  Submit Geotagged Review & Finish Job
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                  <p className="text-xs font-bold text-emerald-900">
                    ✓ Verified Geotagged Review Saved!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onJobComplete({ ...booking, finalPrice: numericFinalPrice, status: 'completed' });
                    }}
                    className="w-full py-2.5 bg-[#116D6E] text-white rounded-xl text-xs font-black uppercase"
                  >
                    Done & Close Tracking
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Safety Verified Card matching Screenshot 2 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck size={18} />
            </div>
            <div className="text-xs">
              <h5 className="font-extrabold text-slate-900">Safety Verified</h5>
              <p className="text-slate-600 leading-snug mt-0.5">
                {workerFirstName} ({subLabel}). UIDAI Aadhaar & PAN background verified. 100% of job payment goes directly to the artisan.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar matching Screenshot 2 */}
        <div className="bg-white border-t border-slate-200 px-6 py-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <button onClick={onClose} className="flex flex-col items-center gap-1 text-[#0B2447] font-bold">
            <Home size={18} />
            <span>Home</span>
          </button>
          <button onClick={onClose} className="flex flex-col items-center gap-1 text-[#116D6E] font-bold">
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
  );
};

export default LiveWorkerTrackerModal;
