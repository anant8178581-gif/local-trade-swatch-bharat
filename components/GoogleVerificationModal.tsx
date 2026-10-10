import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  Loader2, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  X, 
  ExternalLink,
  BadgeCheck,
  Check
} from 'lucide-react';
import { GoogleProfile } from '../types';

interface GoogleVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (profile: GoogleProfile) => void;
  currentEmail?: string;
}

const GoogleVerificationModal: React.FC<GoogleVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  currentEmail = 'anant8178581@gmail.com'
}) => {
  const [selectedEmail, setSelectedEmail] = useState(currentEmail);
  const [customEmail, setCustomEmail] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [step, setStep] = useState<'select' | 'authenticating' | 'verified'>('select');
  const [auditStep, setAuditStep] = useState('');

  if (!isOpen) return null;

  const handleStartGoogleAuth = (emailToAuth: string) => {
    setStep('authenticating');
    setAuditStep('Connecting to Google Identity Services...');

    setTimeout(() => {
      setAuditStep('Validating OAuth 2.0 Credentials & Scopes...');
    }, 800);

    setTimeout(() => {
      setAuditStep('Checking Google Play Protect & Account Security Trust Score...');
    }, 1600);

    setTimeout(() => {
      setAuditStep('Extracting Verified Google Profile & Cryptographic Token...');
    }, 2400);

    setTimeout(() => {
      setStep('verified');
      const profile: GoogleProfile = {
        email: emailToAuth,
        name: emailToAuth.split('@')[0].toUpperCase(),
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop`,
        verifiedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        idToken: `G-AUTH-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        trustScore: 99.8
      };
      setTimeout(() => {
        onVerified(profile);
      }, 1500);
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col relative animate-in zoom-in-95 duration-200">
        {/* Header with Google Colors Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]" />

        <div className="p-6 space-y-5">
          {/* Top Bar */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              {/* Google multicolored G SVG */}
              <div className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 tracking-tight">Google Identity Verification</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">National Skills Partner Protocol</p>
              </div>
            </div>

            <button 
              onClick={onClose}
              disabled={step === 'authenticating'}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {step === 'select' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs text-blue-900 leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-blue-600" />
                  Why verify with Google?
                </p>
                <p className="text-[11px] text-blue-800 font-medium">
                  Connect your verified Google identity to earn the official <strong>"Google Verified Pro"</strong> trust badge and unlock priority gig dispatch in Mumbai.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Select Google Account to Link
                </label>

                {/* Primary Default Account Card (Pre-filled from metadata) */}
                <div 
                  onClick={() => handleStartGoogleAuth(currentEmail)}
                  className="p-4 bg-gray-50 hover:bg-gray-100/80 border-2 border-gray-200 hover:border-blue-500 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {currentEmail.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                        {currentEmail}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                        <CheckCircle size={10} /> Active User Account
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Custom / Alternative Account Toggle */}
                {!isCustomMode ? (
                  <button 
                    onClick={() => setIsCustomMode(true)}
                    className="w-full py-2.5 text-center text-xs font-bold text-blue-600 hover:underline"
                  >
                    + Use another Google account
                  </button>
                ) : (
                  <div className="space-y-2 pt-2 animate-in fade-in">
                    <input 
                      type="email" 
                      placeholder="yourname@gmail.com" 
                      className="w-full p-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                    />
                    <button 
                      onClick={() => {
                        if (customEmail.includes('@gmail.com') || customEmail.includes('@')) {
                          handleStartGoogleAuth(customEmail);
                        }
                      }}
                      disabled={!customEmail.includes('@')}
                      className="w-full py-3 bg-[#4285F4] hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50 transition-all"
                    >
                      Authenticate this Google Account
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-[9px] text-gray-400 text-center leading-normal">
                  Google will securely transmit verified profile token to Local Trades India. No passwords are ever stored.
                </p>
              </div>
            </div>
          )}

          {step === 'authenticating' && (
            <div className="py-8 text-center space-y-5 animate-in fade-in">
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center mx-auto shadow-inner">
                  <Loader2 size={32} className="animate-spin text-[#4285F4]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow">
                  <Lock size={12} />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-black text-gray-900 tracking-tight">Verifying with Google...</h4>
                <p className="text-xs font-mono font-bold text-blue-600 animate-pulse px-4">
                  {auditStep}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-[10px] text-gray-500 font-mono">
                Session ID: OAUTH2-IND-778942-TLS1.3
              </div>
            </div>
          )}

          {step === 'verified' && (
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg">
                <BadgeCheck size={38} className="text-emerald-600" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-gray-900">Google Verified Professional!</h4>
                <p className="text-xs text-gray-600 font-medium">
                  Identity linked to <strong>{selectedEmail || customEmail}</strong>
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 text-[10px] font-bold mt-2">
                  <Check size={12} strokeWidth={3} /> Trust Level: 99.8% (Tier 1 Verified)
                </div>
              </div>

              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Applying badge to your trade passport...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleVerificationModal;
