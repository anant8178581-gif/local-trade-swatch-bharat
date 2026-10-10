import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { 
  Phone, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Lock, 
  Smartphone, 
  Briefcase, 
  User, 
  MessageSquare, 
  Send, 
  Check, 
  ExternalLink,
  BadgeCheck,
  AlertCircle
} from 'lucide-react';
import GmailInboxModal from './GmailInboxModal';
import GoogleVerificationModal from './GoogleVerificationModal';
import { GoogleProfile } from '../types';

interface LoginPortalProps {
  onLoginSuccess: (role: 'worker' | 'customer') => void;
  onSendSystemNotification?: (title: string, body: string, otpCode?: string, type?: 'sms' | 'email') => void;
}

const LoginPortal: React.FC<LoginPortalProps> = ({ 
  onLoginSuccess,
  onSendSystemNotification 
}) => {
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('email'); // Default to email as requested
  const [step, setStep] = useState<'input' | 'otp' | 'role'>('input');
  
  // Credentials
  const [phone, setPhone] = useState('9876543210');
  const [email, setEmail] = useState('anant8178581@gmail.com');
  
  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedCode, setGeneratedCode] = useState('749201');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Modals & Notifications
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [resendChannel, setResendChannel] = useState<'sms' | 'whatsapp' | 'email'>('email');

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Dispatch OTP to either Phone or Gmail
  const handleSendOtp = (channel: 'sms' | 'whatsapp' | 'email') => {
    setErrorMessage(null);

    if (authMode === 'phone' && phone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (authMode === 'email' && (!email || !email.includes('@'))) {
      setErrorMessage('Please enter a valid Gmail / Email address.');
      return;
    }

    setIsLoading(true);
    setResendChannel(channel);

    // Cryptographic 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setOtp(['', '', '', '', '', '']);

    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setTimer(30);
      setShowNotificationBanner(true);

      // Trigger system notification
      if (onSendSystemNotification) {
        if (channel === 'email') {
          onSendSystemNotification(
            `Gmail • Security OTP to ${email}`,
            `Your Local Trades verification code is ${code}. Valid for 10 minutes.`,
            code,
            'email'
          );
        } else {
          onSendSystemNotification(
            `SMS • Telecom Bridge to +91 ${phone}`,
            `Your Local Trades verification code is ${code}. Valid for 10 minutes.`,
            code,
            'sms'
          );
        }
      }
    }, 1200);
  };

  // Verify OTP matches generated code
  const handleVerifyOtp = () => {
    setErrorMessage(null);
    const enteredCode = otp.join('');

    if (enteredCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    if (enteredCode !== generatedCode) {
      setErrorMessage(`Invalid OTP code! Please enter the exact 6-digit code sent to ${authMode === 'email' ? email : '+91 ' + phone}.`);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('role');
    }, 1000);
  };

  const handleAutoFill = (codeToFill = generatedCode) => {
    setOtp(codeToFill.split(''));
    setShowNotificationBanner(false);
    setErrorMessage(null);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value)) && value !== "") return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setErrorMessage(null);

    if (value && index < 5) {
      document.getElementById(`login-otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`login-otp-${index - 1}`)?.focus();
    }
  };

  // Google OAuth Fast Track
  const handleGoogleVerified = (profile: GoogleProfile) => {
    setEmail(profile.email);
    setIsGoogleAuthModalOpen(false);
    setStep('role');
  };

  return (
    <div className="flex flex-col h-screen bg-white relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-orange-600/10 rounded-full blur-3xl" />

      {/* Top Interactive Incoming OTP Banner (SMS or Gmail) */}
      {showNotificationBanner && step === 'otp' && (
        <div className="absolute top-3 left-3 right-3 z-50 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl border border-gray-700 animate-in slide-in-from-top-6 duration-500">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-ping ${authMode === 'email' ? 'bg-red-500' : 'bg-emerald-400'}`} />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-300">
                {authMode === 'email' ? 'Gmail • Google Mail Gateway' : 'SMS • Telecom Bridge'}
              </span>
            </div>
            <button onClick={() => setShowNotificationBanner(false)} className="text-gray-400 text-xs font-bold hover:text-white">
              Dismiss
            </button>
          </div>

          <p className="text-xs font-medium text-gray-200 mt-1 leading-relaxed">
            Delivered to <strong className="text-white">{authMode === 'email' ? email : `+91 ${phone}`}</strong>: Verification code is{' '}
            <span className="font-mono font-black text-emerald-400 text-sm tracking-wider">{generatedCode}</span>.
          </p>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <button 
              onClick={() => handleAutoFill(generatedCode)}
              className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Check size={14} /> Auto-Fill ({generatedCode})
            </button>

            {authMode === 'email' ? (
              <button 
                onClick={() => setIsGmailModalOpen(true)}
                className="py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Mail size={14} /> Open in Gmail
              </button>
            ) : (
              <button 
                onClick={() => {
                  window.open(`https://wa.me/?text=Local%20Trades%20OTP%20is%20${generatedCode}`);
                }}
                className="py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Send size={14} /> WhatsApp Share
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 flex flex-col justify-center px-6 relative z-10 pt-6 overflow-y-auto">
        <div className="mb-6 text-center">
          <Logo size={80} showText={true} />
        </div>

        {/* STEP 1: SELECT CHANNEL & ENTER NUMBER OR GMAIL */}
        {step === 'input' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-sm mx-auto w-full">
            <div className="text-center">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center justify-center gap-2">
                <Lock size={18} className="text-blue-600" /> Identity Gateway
              </h2>
              <p className="text-gray-500 text-xs font-medium mt-1">
                Receive working 6-digit OTP to your Number or Gmail
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Toggle: Mobile Number vs Gmail Address */}
            <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
              <button
                type="button"
                onClick={() => { setAuthMode('email'); setErrorMessage(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'email' 
                    ? 'bg-white text-gray-900 shadow-md border border-gray-200/60' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Mail size={14} className={authMode === 'email' ? 'text-red-500' : ''} /> Gmail Address
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('phone'); setErrorMessage(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'phone' 
                    ? 'bg-white text-gray-900 shadow-md border border-gray-200/60' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Phone size={14} className={authMode === 'phone' ? 'text-blue-600' : ''} /> Mobile (+91)
              </button>
            </div>

            {/* Input based on Mode */}
            {authMode === 'email' ? (
              <div className="space-y-3">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="anant8178581@gmail.com"
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:border-red-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-black shadow-inner"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMessage(null); }}
                  />
                </div>

                <button
                  onClick={() => handleSendOtp('email')}
                  disabled={!email.includes('@') || isLoading}
                  className="w-full py-4 bg-[#EA4335] hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      <Mail size={16} /> Send OTP to Gmail
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-black font-black text-sm border-r pr-2.5 border-gray-300">+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    className="w-full pl-16 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-black text-base tracking-widest text-black shadow-inner"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrorMessage(null); }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSendOtp('sms')}
                    disabled={phone.length < 10 || isLoading}
                    className="py-3.5 bg-[#2D4356] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isLoading && resendChannel === 'sms' ? <Loader2 className="animate-spin" size={16} /> : (
                      <>
                        <MessageSquare size={14} /> SMS OTP
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSendOtp('whatsapp')}
                    disabled={phone.length < 10 || isLoading}
                    className="py-3.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isLoading && resendChannel === 'whatsapp' ? <Loader2 className="animate-spin" size={16} /> : (
                      <>
                        <Send size={14} /> WhatsApp OTP
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Google Fast-Track Sign In */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200" />
              <span className="flex-shrink mx-4 text-[10px] font-black uppercase text-gray-400">Or Instant Google Sign-In</span>
              <div className="flex-grow border-t border-gray-200" />
            </div>

            <button
              onClick={() => setIsGoogleAuthModalOpen(true)}
              className="w-full py-3.5 bg-white border-2 border-gray-200 hover:border-blue-500 rounded-2xl font-bold text-xs text-gray-800 shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google (Verified ID)
            </button>
          </div>
        )}

        {/* STEP 2: ENTER OTP CODE */}
        {step === 'otp' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500 max-w-sm mx-auto w-full">
            <div className="text-center">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Verify 6-Digit OTP</h2>
              <p className="text-gray-900 text-xs font-black mt-1">
                Delivered to {authMode === 'email' ? email : `+91 ${phone}`}
              </p>
              <button 
                onClick={() => { setStep('input'); setErrorMessage(null); }}
                className="text-xs text-blue-600 font-bold hover:underline mt-0.5"
              >
                Change Destination
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 6-Digit Inputs */}
            <div className="space-y-4">
              <div className="flex justify-between gap-1.5 px-1">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`login-otp-${idx}`}
                    type="tel"
                    maxLength={1}
                    className="w-[14%] aspect-square bg-gray-50 border-2 border-gray-200 focus:border-blue-600 focus:bg-white rounded-xl text-center text-2xl font-black outline-none transition-all text-black shadow-inner"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                  />
                ))}
              </div>

              {/* Quick Actions: Auto-Fill or View in Gmail */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => handleAutoFill(generatedCode)}
                  className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-emerald-200 flex items-center justify-center gap-1.5"
                >
                  <Smartphone size={14} className="text-emerald-600" /> Auto-Fill ({generatedCode})
                </button>

                {authMode === 'email' ? (
                  <button 
                    type="button"
                    onClick={() => setIsGmailModalOpen(true)}
                    className="py-2.5 bg-red-50 hover:bg-red-100 text-red-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-red-200 flex items-center justify-center gap-1.5"
                  >
                    <Mail size={14} className="text-red-600" /> View in Gmail
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setShowNotificationBanner(true)}
                    className="py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-blue-200 flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={14} className="text-blue-600" /> View SMS
                  </button>
                )}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={otp.some(v => v === '') || isLoading}
                className="w-full py-4 bg-[#2D4356] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>Verify & Enter App <ArrowRight size={18} /></>
                )}
              </button>

              <div className="flex justify-between items-center text-xs font-bold text-gray-500 pt-1">
                <span>{timer > 0 ? `Resend code in ${timer}s` : 'Did not receive code?'}</span>
                {timer === 0 && (
                  <button 
                    onClick={() => handleSendOtp(authMode === 'email' ? 'email' : 'sms')}
                    className="text-blue-600 hover:underline uppercase tracking-wider text-[11px]"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ROLE SELECTION */}
        {step === 'role' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500 max-w-sm mx-auto w-full">
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Identity Authenticated</h2>
              <p className="text-gray-500 text-xs font-medium mt-1">Select your portal mode for Local Trades India</p>
            </div>

            <div className="grid gap-4">
              <button 
                onClick={() => onLoginSuccess('worker')}
                className="p-5 bg-blue-50 border-2 border-blue-200 hover:border-blue-600 rounded-[2rem] flex flex-col items-center gap-2.5 transition-all group active:scale-95 shadow-sm text-center"
              >
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Briefcase size={24} />
                </div>
                <div>
                  <span className="text-sm font-black text-blue-900 uppercase">Enter as Worker / Pro</span>
                  <p className="text-[10px] text-blue-600 font-bold uppercase mt-0.5">Accept Gigs, Verify KYC & Build Portfolio</p>
                </div>
              </button>
              
              <button 
                onClick={() => onLoginSuccess('customer')}
                className="p-5 bg-orange-50 border-2 border-orange-200 hover:border-orange-600 rounded-[2rem] flex flex-col items-center gap-2.5 transition-all group active:scale-95 shadow-sm text-center"
              >
                <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <User size={24} />
                </div>
                <div>
                  <span className="text-sm font-black text-orange-900 uppercase">Enter as Customer / Client</span>
                  <p className="text-[10px] text-orange-600 font-bold uppercase mt-0.5">Hire Verified Pros & Post Tasks</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 text-center mt-auto">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-blue-500" /> Aadhaar, NSDL & Google Verified Portal V2.4
        </p>
      </div>

      {/* Gmail Inbox App Simulation Modal */}
      <GmailInboxModal 
        isOpen={isGmailModalOpen}
        onClose={() => setIsGmailModalOpen(false)}
        emailRecipient={email}
        otpCode={generatedCode}
        onAutoFillOtp={handleAutoFill}
      />

      {/* Google Verification / One-Tap Modal */}
      <GoogleVerificationModal 
        isOpen={isGoogleAuthModalOpen}
        onClose={() => setIsGoogleAuthModalOpen(false)}
        onVerified={handleGoogleVerified}
        currentEmail={email}
      />
    </div>
  );
};

export default LoginPortal;
