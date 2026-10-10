import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Camera, 
  CheckCircle, 
  Check, 
  Loader2, 
  Fingerprint, 
  AlertCircle, 
  Smartphone, 
  BadgeCheck, 
  Award,
  ArrowRight,
  ArrowLeft,
  Crown,
  Zap,
  User
} from 'lucide-react';
import { 
  validateAadhaarVerhoeff, 
  validatePanCard, 
  SAMPLE_AADHAAR_NUMBERS, 
  SAMPLE_PAN_CARDS 
} from '../services/kycValidator';
import UpiPaymentModal from './UpiPaymentModal';
import LiveCameraModal from './LiveCameraModal';
import { CapturedPhotoResult } from '../services/cameraService';

interface Props {
  onComplete: () => void;
  onSendSystemNotification?: (title: string, body: string, otpCode?: string) => void;
}

const TRADE_SKILLS = [
  'Plumber & Pipe Fitter',
  'Electrician & Wireman',
  'Carpenter & Woodwork',
  'Painter & Waterproofing',
  'AC & Appliance Technician',
  'Daily-Wage Construction Laborer'
];

const VerificationFlow: React.FC<Props> = ({ onComplete, onSendSystemNotification }) => {
  // 3 main onboarding tabs matching Screenshot 3: 'details' -> 'verification' -> 'plan'
  const [activeTab, setActiveTab] = useState<'details' | 'verification' | 'plan'>('details');

  // Step 1: Details state
  const [fullName, setFullName] = useState<string>('Arjun Deshmukh');
  const [tradeSkill, setTradeSkill] = useState<string>('Plumber & Pipe Fitter');
  const [primarySkillsEnabled, setPrimarySkillsEnabled] = useState<boolean>(true);
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 98765 43210');
  const [profilePhoto, setProfilePhoto] = useState<string>(
    'https://images.unsplash.com/photo-1540560485458-3473b307985c?w=400&h=400&fit=crop'
  );
  const [onboardingFeePaid, setOnboardingFeePaid] = useState<boolean>(false);
  const [isOnboardingUpiOpen, setIsOnboardingUpiOpen] = useState<boolean>(false);

  // Step 2: Identity, Aadhaar, PAN, Phone OTP & Gmail Verification state
  const [aadhaar, setAadhaar] = useState<string>('3675 9834 6012');
  const [pan, setPan] = useState<string>('BKZPD4891K');
  const [aadhaarVerified, setAadhaarVerified] = useState<boolean>(true);
  const [panVerified, setPanVerified] = useState<boolean>(true);
  const [gmailVerified, setGmailVerified] = useState<boolean>(true);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState<boolean>(true);
  const [isVerifyingKyc, setIsVerifyingKyc] = useState<boolean>(false);
  const [kycError, setKycError] = useState<string | null>(null);

  // Step 3: Flat Subscription Tier & Priority Listing state
  const [selectedPlan, setSelectedPlan] = useState<'daily' | 'monthly'>('monthly');
  const [priorityBoost, setPriorityBoost] = useState<boolean>(true);
  const [isPlanUpiOpen, setIsPlanUpiOpen] = useState<boolean>(false);

  // Native High-Res Camera Capture State for Worker Verification
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [cameraCaptureTarget, setCameraCaptureTarget] = useState<'profile_photo' | 'id_doc'>('profile_photo');
  const [aadhaarPhotoProof, setAadhaarPhotoProof] = useState<string | null>(null);
  const [kycPhotoResult, setKycPhotoResult] = useState<CapturedPhotoResult | null>(null);

  const handleCyclePhoto = () => {
    setCameraCaptureTarget('profile_photo');
    setIsCameraModalOpen(true);
  };

  const handleRunKycVerification = () => {
    const rawAadhaar = aadhaar.replace(/\s+/g, '');
    if (!validateAadhaarVerhoeff(rawAadhaar)) {
      setKycError('Invalid UIDAI Aadhaar checksum. Use one of the verified sample numbers below.');
      return;
    }
    const panCheck = validatePanCard(pan);
    if (!panCheck.isValid) {
      setKycError(panCheck.message || 'Invalid PAN format.');
      return;
    }

    setKycError(null);
    setIsVerifyingKyc(true);
    setTimeout(() => {
      setAadhaarVerified(true);
      setPanVerified(true);
      setGmailVerified(true);
      setPhoneOtpVerified(true);
      setIsVerifyingKyc(false);
      onSendSystemNotification?.(
        'Identity & PAN Verification Complete',
        `UIDAI Aadhaar (${aadhaar.slice(-4)}) & NSDL PAN (${pan}) verified for ${fullName}.`
      );
      setActiveTab('plan');
    }, 900);
  };

  const totalPlanAmount = (selectedPlan === 'monthly' ? 99 : 10) + (priorityBoost ? 50 : 0);

  return (
    <div className="max-w-md mx-auto min-h-full flex flex-col bg-[#F4F6F9] pb-20 animate-in fade-in duration-300">
      {/* Deep Navy Curved Header matching Screenshot 3 (REGISTRATION / ONBOARDING) */}
      <div className="bg-[#0B2447] text-white px-6 pt-6 pb-16 rounded-b-[3rem] relative text-center shadow-lg">
        <h2 className="text-lg font-extrabold tracking-wide uppercase text-left mb-4">
          COMPLETE PROFILE.
        </h2>

        {/* 3-Step Progress Bar: Details -> Verification -> Plan */}
        <div className="max-w-xs mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-6 right-6 top-2.5 h-0.5 bg-slate-600 z-0" />
            <div 
              className="absolute left-6 top-2.5 h-0.5 bg-[#116D6E] z-0 transition-all duration-300"
              style={{ width: activeTab === 'details' ? '0%' : activeTab === 'verification' ? '45%' : '85%' }}
            />

            {/* Step 1: Details */}
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className="flex flex-col items-center gap-1.5 z-10"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'details' || onboardingFeePaid
                  ? 'bg-[#116D6E] text-white ring-4 ring-teal-500/20'
                  : 'bg-slate-600 text-slate-300'
              }`}>
                <div className="w-2 h-2 rounded-full bg-teal-200" />
              </div>
              <span className={`text-[11px] ${activeTab === 'details' ? 'font-bold text-white' : 'text-slate-300'}`}>
                Details
              </span>
            </button>

            {/* Step 2: Verification */}
            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              className="flex flex-col items-center gap-1.5 z-10"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'verification' || (aadhaarVerified && panVerified)
                  ? 'bg-[#116D6E] text-white ring-4 ring-teal-500/20'
                  : 'bg-slate-600 text-slate-300'
              }`}>
                <div className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
              <span className={`text-[11px] ${activeTab === 'verification' ? 'font-bold text-white' : 'text-slate-300'}`}>
                Verification
              </span>
            </button>

            {/* Step 3: Plan */}
            <button
              type="button"
              onClick={() => setActiveTab('plan')}
              className="flex flex-col items-center gap-1.5 z-10"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'plan'
                  ? 'bg-[#116D6E] text-white ring-4 ring-teal-500/20'
                  : 'bg-slate-600 text-slate-300'
              }`}>
                <div className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
              <span className={`text-[11px] ${activeTab === 'plan' ? 'font-bold text-white' : 'text-slate-300'}`}>
                Plan
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlapping Centered Avatar Box with Camera Icon matching Screenshot 3 */}
      <div className="-mt-12 flex justify-center relative z-20 mb-4">
        <div 
          onClick={handleCyclePhoto}
          className="w-24 h-24 rounded-2xl bg-slate-100 border-4 border-white shadow-xl relative cursor-pointer group overflow-visible"
          title="Tap to change profile photo"
        >
          <img
            src={profilePhoto}
            alt="Worker Avatar"
            className="w-full h-full rounded-xl object-cover"
          />
          <button
            type="button"
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-700 text-white border-2 border-white flex items-center justify-center shadow-md group-hover:bg-[#116D6E] transition-all"
          >
            <Camera size={14} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-6 space-y-4">
        {/* TAB 1: DETAILS & ONE-TIME ONBOARDING FEE (Matching Screenshot 3) */}
        {activeTab === 'details' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name (as per ID)"
                className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 shadow-xs outline-none focus:border-[#116D6E] transition-all"
              />
            </div>

            <div>
              <select
                value={tradeSkill}
                onChange={(e) => setTradeSkill(e.target.value)}
                className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 shadow-xs outline-none focus:border-[#116D6E] transition-all"
              >
                {TRADE_SKILLS.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Mobile Number (for OTP & Direct Calls)"
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 shadow-xs outline-none focus:border-[#116D6E] transition-all"
              />
            </div>

            {/* Select Primary Skills Toggle matching Screenshot 3 */}
            <div className="flex items-center justify-between py-2 px-1">
              <div>
                <span className="text-sm font-extrabold text-slate-900 block">
                  Select Primary Skills <span className="font-normal text-slate-600">to</span>
                </span>
                <span className="text-xs text-slate-500">
                  Receive hyper-local GPS job alerts (0% commission)
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPrimarySkillsEnabled(!primarySkillsEnabled)}
                className={`w-14 h-8 rounded-full p-1 transition-all duration-200 flex items-center ${
                  primarySkillsEnabled ? 'bg-[#116D6E] justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Prominent Teal Pill CTA Button: Upload ID Verification (₹150 Fee) */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => setIsOnboardingUpiOpen(true)}
                className="w-full py-4 px-6 bg-[#116D6E] hover:bg-[#0d5657] text-white rounded-full shadow-lg shadow-teal-900/20 active:scale-[0.99] transition-all flex flex-col items-center justify-center"
              >
                <span className="text-sm font-extrabold tracking-tight">
                  {onboardingFeePaid ? '✓ ID Verification Fee Paid (₹150)' : 'Upload ID Verification (₹150 Fee)'}
                </span>
                <span className="text-[11px] text-teal-100 font-medium">
                  One-Time Onboarding Fee • Zero Commission Forever
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('verification')}
                className="w-full py-2.5 text-xs font-bold text-[#0B2447] hover:underline flex items-center justify-center gap-1"
              >
                <span>Proceed to Aadhaar, PAN & OAuth Verification</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: IDENTITY, PAN CARD, PHONE OTP & GMAIL VERIFICATION */}
        {activeTab === 'verification' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">
                  Identity & PAN Trust Verification
                </h3>
                <p className="text-[11px] text-slate-500">
                  UIDAI Aadhaar, NSDL PAN, Phone OTP & Google OAuth
                </p>
              </div>
              <ShieldCheck className="text-[#116D6E]" size={22} />
            </div>

            {kycError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{kycError}</span>
              </div>
            )}

            {/* UIDAI Aadhaar Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  UIDAI 12-Digit Aadhaar Number
                </label>
                {aadhaarVerified && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ✓ UIDAI Verified
                  </span>
                )}
              </div>
              <input
                type="text"
                value={aadhaar}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 12);
                  const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
                  setAadhaar(formatted);
                }}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900 outline-none focus:border-[#116D6E]"
              />
              <div className="flex gap-1.5 flex-wrap">
                {SAMPLE_AADHAAR_NUMBERS.slice(0, 2).map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAadhaar(s.number)}
                    className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded"
                  >
                    Sample: {s.number}
                  </button>
                ))}
              </div>
            </div>

            {/* PAN Card Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Income Tax PAN Card Number
                </label>
                {panVerified && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ✓ NSDL Active
                  </span>
                )}
              </div>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase().slice(0, 10))}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900 uppercase outline-none focus:border-[#116D6E]"
              />
              <div className="flex gap-1.5 flex-wrap">
                {SAMPLE_PAN_CARDS.slice(0, 2).map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPan(p.number)}
                    className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded"
                  >
                    {p.number}
                  </button>
                ))}
              </div>
            </div>

            {/* Dual Auth Status: Phone OTP + Gmail OAuth */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2">
                <Smartphone size={15} className="text-emerald-700 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-black text-emerald-950 block">Phone OTP</span>
                  <span className="text-[9px] text-emerald-700 font-bold">✓ Verified</span>
                </div>
              </div>
              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2">
                <BadgeCheck size={15} className="text-blue-700 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-black text-blue-950 block">Gmail OAuth</span>
                  <span className="text-[9px] text-blue-700 font-bold">✓ Linked</span>
                </div>
              </div>
            </div>

            {/* Aadhaar / PAN Physical Document High-Res Photo Proof */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <Camera size={12} className="text-[#116D6E]" />
                  Aadhaar / ID Card High-Res Proof
                </span>
                {aadhaarPhotoProof ? (
                  <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    ✓ High-Res Captured
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 font-bold">Tamper-Evident EXIF</span>
                )}
              </div>

              {aadhaarPhotoProof && (
                <div className="relative rounded-xl overflow-hidden aspect-[16/9] border border-slate-200 bg-slate-900">
                  <img src={aadhaarPhotoProof} alt="Aadhaar High-Res Proof" className="w-full h-full object-cover" />
                  <div className="absolute bottom-1.5 right-1.5 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/40">
                    {kycPhotoResult?.verificationHash || 'KYC-VERIFIED'}
                  </div>
                  <div className="absolute top-1.5 left-1.5 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-amber-300">
                    {kycPhotoResult?.resolutionLabel || 'High-Res Optical'}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setCameraCaptureTarget('id_doc');
                  setIsCameraModalOpen(true);
                }}
                className="w-full py-2.5 px-3 bg-[#116D6E] hover:bg-[#0e5859] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Camera size={14} />
                <span>{aadhaarPhotoProof ? 'Re-Click ID Card with Camera' : 'Click Aadhaar / PAN Photo Directly'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleRunKycVerification}
              disabled={isVerifyingKyc}
              className="w-full py-3.5 bg-[#116D6E] hover:bg-[#0d5657] text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
            >
              {isVerifyingKyc ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              <span>{isVerifyingKyc ? 'Verifying with UIDAI & NSDL...' : 'Verify Identity & Continue to Plan'}</span>
            </button>
          </div>
        )}

        {/* TAB 3: FLAT SUBSCRIPTION TIER & PRIORITY LISTING */}
        {activeTab === 'plan' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                0% COMMISSION MODEL
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                Select Flat Subscription Tier
              </h3>
              <p className="text-xs text-slate-500">
                Keep 100% of every job payout. No percentage cuts ever.
              </p>
            </div>

            {/* Tier Cards: ₹99/month vs ₹10/day */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedPlan('monthly')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all relative ${
                  selectedPlan === 'monthly'
                    ? 'border-[#116D6E] bg-teal-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="bg-[#0B2447] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                  POPULAR
                </span>
                <div className="text-xl font-black font-mono text-slate-900 mt-1.5">₹99<span className="text-xs font-normal">/mo</span></div>
                <span className="text-xs font-bold text-slate-800 block">Pro Monthly Pass</span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">0% Commission • 30 Days</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan('daily')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  selectedPlan === 'daily'
                    ? 'border-[#116D6E] bg-teal-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="bg-amber-100 text-amber-900 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                  FLEXIBLE
                </span>
                <div className="text-xl font-black font-mono text-slate-900 mt-1.5">₹10<span className="text-xs font-normal">/day</span></div>
                <span className="text-xs font-bold text-slate-800 block">Daily Wage Pass</span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">0% Commission • 24 Hrs</span>
              </button>
            </div>

            {/* Optional Priority Visibility Listing (₹50 / 3 days) */}
            <div 
              onClick={() => setPriorityBoost(!priorityBoost)}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                priorityBoost ? 'border-amber-400 bg-amber-50/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold flex-shrink-0">
                  <Zap size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Priority Visibility Listing (+₹50)</h4>
                  <p className="text-[10px] text-slate-600">Top search & Google Map placement for 3 days</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                priorityBoost ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-400 bg-white'
              }`}>
                {priorityBoost && <Check size={13} strokeWidth={3} />}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setIsPlanUpiOpen(true)}
                className="w-full py-4 bg-[#116D6E] hover:bg-[#0d5657] text-white rounded-full font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                Activate Pass (₹{totalPlanAmount}) & Complete Setup
              </button>
              <button
                type="button"
                onClick={onComplete}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Save & Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stepper Navigation matching Screenshot 3 */}
      <div className="mt-6 bg-white border-t border-slate-200 px-8 py-3 flex items-center justify-between text-xs font-semibold text-slate-500">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'details' ? 'text-[#0B2447] font-extrabold' : ''}`}
        >
          <ArrowLeft size={16} />
          <span>Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verification')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'verification' ? 'text-[#0B2447] font-extrabold' : ''}`}
        >
          <ArrowRight size={16} />
          <span>Verification</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plan')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'plan' ? 'text-[#0B2447] font-extrabold' : ''}`}
        >
          <ArrowRight size={16} />
          <span>Plan</span>
        </button>
      </div>

      {/* UPI Modal for ₹150 One-Time Onboarding Fee */}
      <UpiPaymentModal
        isOpen={isOnboardingUpiOpen}
        onClose={() => setIsOnboardingUpiOpen(false)}
        amount={150}
        serviceTitle="One-Time Artisan ID Verification & Onboarding Fee"
        workerName={fullName}
        onPaymentSuccess={() => {
          setOnboardingFeePaid(true);
          setIsOnboardingUpiOpen(false);
          onSendSystemNotification?.(
            'One-Time Onboarding Fee Paid (₹150)',
            'Your ID verification fee is confirmed. 0% platform commission unlocked!'
          );
          setActiveTab('verification');
        }}
      />

      {/* UPI Modal for Plan Subscription */}
      <UpiPaymentModal
        isOpen={isPlanUpiOpen}
        onClose={() => setIsPlanUpiOpen(false)}
        amount={totalPlanAmount}
        serviceTitle={`${selectedPlan === 'monthly' ? '₹99/mo Pro Pass' : '₹10/day Flex Pass'}${priorityBoost ? ' + Priority Boost' : ''}`}
        workerName={fullName}
        onPaymentSuccess={() => {
          setIsPlanUpiOpen(false);
          onSendSystemNotification?.(
            'Zero-Commission Pass Activated!',
            `Your ${selectedPlan} pass is active. You keep 100% of all job earnings.`
          );
          onComplete();
        }}
      />

      {/* High-Resolution Live Camera Modal for Worker Verification */}
      <LiveCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        proofMode="worker_verification"
        workerName={fullName}
        title={cameraCaptureTarget === 'profile_photo' ? 'Worker Facial KYC Capture' : 'Click Aadhaar / PAN Card'}
        subtitle={cameraCaptureTarget === 'profile_photo' 
          ? 'Capture high-resolution portrait with clear face visibility' 
          : 'Capture physical ID card with clear text and Verhoeff numbers'}
        watermarkText={`WORKER KYC VERIFIED • ${fullName} • UIDAI ${aadhaar.slice(-4)} • ${new Date().toLocaleTimeString('en-IN')}`}
        onCapture={(photoDataUrl) => {
          if (cameraCaptureTarget === 'profile_photo') {
            setProfilePhoto(photoDataUrl);
          } else {
            setAadhaarPhotoProof(photoDataUrl);
          }
        }}
        onCaptureResult={(res) => {
          setKycPhotoResult(res);
        }}
      />
    </div>
  );
};

export default VerificationFlow;
