import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  KeyRound, 
  History, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  ArrowLeft, 
  Lock, 
  MessageSquare, 
  PhoneCall, 
  Send, 
  Check, 
  X, 
  Copy, 
  Loader2, 
  Clock, 
  ChevronRight, 
  ShieldAlert, 
  SlidersHorizontal,
  Mail,
  BadgeCheck
} from 'lucide-react';
import { OtpSettings, OtpHistoryLog } from '../types';
import GmailInboxModal from './GmailInboxModal';

interface OtpSettingsViewProps {
  onBack: () => void;
  onSendTestOtpNotification?: (code: string, type?: 'sms' | 'email') => void;
}

const INITIAL_OTP_SETTINGS: OtpSettings = {
  phone: '98765 43210',
  email: 'anant8178581@gmail.com',
  isPhoneVerified: true,
  isEmailVerified: true,
  requireOtpForLogin: true,
  requireOtpForGigs: true,
  requireOtpForPayouts: true,
  requireOtpForProfileChanges: false,
  preferredChannel: 'email',
  autoFillSms: true,
  otpExpirySeconds: 60,
  twoFactorEnabled: true,
};

const INITIAL_LOGS: OtpHistoryLog[] = [
  {
    id: 'log-1',
    action: 'Gmail Login Verification',
    recipient: 'anant8178581@gmail.com',
    channel: 'Gmail / Email',
    timestamp: 'Today, 10:35 AM',
    status: 'Verified',
    ipAddress: '192.168.1.42 (Android 14)',
    location: 'Mumbai, MH'
  },
  {
    id: 'log-2',
    action: 'Bank Payout Auth',
    recipient: '+91 98765 43210',
    channel: 'SMS',
    timestamp: 'Yesterday, 04:12 PM',
    status: 'Verified',
    ipAddress: '192.168.1.42 (Android 14)',
    location: 'Mumbai, MH'
  },
  {
    id: 'log-3',
    action: 'Emergency SOS Dispatch',
    recipient: '+91 98765 43210',
    channel: 'WhatsApp',
    timestamp: '11 Aug, 02:15 PM',
    status: 'Verified',
    ipAddress: '192.168.1.42 (Android 14)',
    location: 'Mumbai, MH'
  }
];

const OtpSettingsView: React.FC<OtpSettingsViewProps> = ({ onBack, onSendTestOtpNotification }) => {
  const [settings, setSettings] = useState<OtpSettings>(INITIAL_OTP_SETTINGS);
  const [logs, setLogs] = useState<OtpHistoryLog[]>(INITIAL_LOGS);
  
  // Test OTP simulator state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testTargetChannel, setTestTargetChannel] = useState<'email' | 'sms'>('email');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState(['', '', '', '', '', '']);
  const [testState, setTestState] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'success' | 'failed'>('idle');
  const [countdown, setCountdown] = useState(60);
  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);

  // Phone/Email editing state
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState('');

  const handleToggle = (key: keyof OtpSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTriggerTestOtp = (channel: 'email' | 'sms') => {
    setTestTargetChannel(channel);
    setIsTestModalOpen(true);
    setTestState('sending');
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);
    setInputOtp(['', '', '', '', '', '']);

    setTimeout(() => {
      setTestState('sent');
      setCountdown(settings.otpExpirySeconds);
      if (onSendTestOtpNotification) {
        onSendTestOtpNotification(randomCode, channel);
      }
    }, 1200);
  };

  const handleVerifyTestOtp = () => {
    const entered = inputOtp.join('');
    setTestState('verifying');
    setTimeout(() => {
      if (entered === generatedOtp) {
        setTestState('success');
        // Add to history log
        const newLog: OtpHistoryLog = {
          id: `log-${Date.now()}`,
          action: testTargetChannel === 'email' ? 'Gmail OTP Simulator Check' : 'SMS OTP Simulator Check',
          recipient: testTargetChannel === 'email' ? settings.email || 'anant8178581@gmail.com' : `+91 ${settings.phone}`,
          channel: testTargetChannel === 'email' ? 'Gmail / Email' : 'SMS',
          timestamp: 'Just now',
          status: 'Verified',
          ipAddress: '127.0.0.1 (Android App)',
          location: 'Mumbai Hub'
        };
        setLogs([newLog, ...logs]);
      } else {
        setTestState('failed');
      }
    }, 1200);
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    if (isNaN(Number(val)) && val !== '') return;
    const newOtp = [...inputOtp];
    newOtp[index] = val.slice(-1);
    setInputOtp(newOtp);

    if (val && index < 5) {
      document.getElementById(`test-otp-${index + 1}`)?.focus();
    }
  };

  const handleAutoFillCode = () => {
    if (generatedOtp.length === 6) {
      setInputOtp(generatedOtp.split(''));
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#2D4356] text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={onBack}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-blue-400" size={24} /> OTP & 2FA Security
            </h2>
            <p className="text-xs text-blue-200 mt-0.5 font-medium">
              Android SMS & Gmail Verification Gateway
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Gmail Status Card */}
        <div className="bg-white rounded-[2rem] p-5 border border-gray-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-50 text-[#EA4335] rounded-2xl flex items-center justify-center font-bold">
                <Mail size={24} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-gray-900 text-sm truncate max-w-[180px]">{settings.email}</h3>
                  <BadgeCheck size={14} className="text-blue-600 flex-shrink-0" />
                </div>
                <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Verified Google Account
                </p>
              </div>
            </div>

            <button 
              onClick={() => handleTriggerTestOtp('email')}
              className="px-3 py-1.5 bg-[#EA4335] hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-sm active:scale-95 transition-all flex items-center gap-1"
            >
              <Send size={12} /> Test Gmail
            </button>
          </div>
        </div>

        {/* Primary Mobile Status Card */}
        <div className="bg-white rounded-[2rem] p-5 border border-gray-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">+91 {settings.phone}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    Verified Number
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleTriggerTestOtp('sms')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm active:scale-95 transition-all flex items-center gap-1"
            >
              <Send size={12} /> Test SMS
            </button>
          </div>
        </div>

        {/* Preferred OTP Channel */}
        <div className="bg-white rounded-[2rem] p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-blue-500" /> Default Delivery Destination
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'email', label: 'Gmail OTP', icon: Mail, color: 'red' },
              { id: 'sms', label: 'SMS OTP', icon: MessageSquare, color: 'blue' },
              { id: 'whatsapp', label: 'WhatsApp', icon: Send, color: 'emerald' },
            ].map((ch) => {
              const Icon = ch.icon;
              const isSelected = settings.preferredChannel === ch.id;
              return (
                <button 
                  key={ch.id}
                  onClick={() => setSettings({ ...settings, preferredChannel: ch.id as any })}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm' 
                      : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:bg-white'
                  }`}
                >
                  <Icon size={18} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
                  <span className="text-[11px] font-bold">{ch.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Rule Toggles */}
        <div className="bg-white rounded-[2rem] p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Lock size={14} className="text-indigo-500" /> 2-Step OTP Verification Rules
          </h3>

          <div className="divide-y divide-gray-100">
            {[
              { key: 'requireOtpForLogin', label: 'Require OTP for Account Login', sub: 'Protects account access on new devices' },
              { key: 'requireOtpForGigs', label: 'OTP for Emergency Gigs & Job Acceptance', sub: 'Verifies worker/customer before gig lock' },
              { key: 'requireOtpForPayouts', label: 'OTP for Wallet Withdrawals & Transfers', sub: 'Security authorization for banking transactions' },
              { key: 'requireOtpForProfileChanges', label: 'OTP for Profile & Aadhaar Edits', sub: 'Prevents unauthorized identity modifications' },
              { key: 'autoFillSms', label: 'Android SMS Retriever Auto-Fill', sub: 'Automatically detects incoming SMS OTP codes' },
            ].map((item) => {
              const isChecked = !!settings[item.key as keyof OtpSettings];
              return (
                <div key={item.key} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">{item.label}</h4>
                    <p className="text-[9px] text-gray-400 font-medium mt-0.5">{item.sub}</p>
                  </div>

                  <button 
                    onClick={() => handleToggle(item.key as keyof OtpSettings)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors relative flex items-center ${
                      isChecked ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                        isChecked ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Log / History */}
        <div className="bg-white rounded-[2rem] p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <History size={14} className="text-emerald-500" /> OTP Dispatch Audit Log
            </h3>
            <span className="text-[10px] text-gray-400 font-bold">{logs.length} Events</span>
          </div>

          <div className="space-y-2.5">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-800">{log.action}</span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {log.status}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>{log.channel} • {log.recipient}</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test OTP Simulator Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl space-y-5 relative border border-gray-100">
            <button 
              onClick={() => setIsTestModalOpen(false)}
              className="absolute top-5 right-5 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-all"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-1">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                <KeyRound size={28} />
              </div>
              <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Test OTP Dispatch</h3>
              <p className="text-xs text-gray-500 font-medium">
                Sent to {testTargetChannel === 'email' ? settings.email : `+91 ${settings.phone}`}
              </p>
            </div>

            {testState === 'sending' && (
              <div className="py-6 text-center space-y-2">
                <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
                <p className="text-xs font-bold text-gray-600">
                  Dispatching OTP via {testTargetChannel === 'email' ? 'Google Mail Gateway' : 'Telecom Bridge'}...
                </p>
              </div>
            )}

            {(testState === 'sent' || testState === 'verifying' || testState === 'failed') && (
              <div className="space-y-4">
                {/* Auto Fill & View Banner */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Delivered Code</span>
                    <p className="text-lg font-black font-mono tracking-widest text-blue-950">{generatedOtp}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={handleAutoFillCode}
                      className="px-2.5 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-sm"
                    >
                      Auto-Fill
                    </button>
                    {testTargetChannel === 'email' && (
                      <button 
                        onClick={() => setIsGmailModalOpen(true)}
                        className="px-2.5 py-1.5 bg-[#EA4335] text-white rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-sm flex items-center gap-1"
                      >
                        <Mail size={12} /> Inbox
                      </button>
                    )}
                  </div>
                </div>

                {/* 6 Digit Input */}
                <div className="flex justify-between gap-1.5">
                  {inputOtp.map((digit, idx) => (
                    <input 
                      key={idx}
                      id={`test-otp-${idx}`}
                      type="tel"
                      maxLength={1}
                      className="w-[15%] aspect-square bg-gray-50 border-2 border-gray-200 focus:border-blue-600 focus:bg-white rounded-xl text-center text-xl font-black outline-none transition-all text-black"
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    />
                  ))}
                </div>

                {testState === 'failed' && (
                  <p className="text-xs font-bold text-red-600 text-center">
                    Incorrect code! Please check code or auto-fill.
                  </p>
                )}

                <button 
                  onClick={handleVerifyTestOtp}
                  disabled={inputOtp.some(d => d === '') || testState === 'verifying'}
                  className="w-full py-4 bg-[#2D4356] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  {testState === 'verifying' ? <Loader2 className="animate-spin" size={18} /> : 'Verify Code'}
                </button>
              </div>
            )}

            {testState === 'success' && (
              <div className="py-4 text-center space-y-3 animate-in zoom-in duration-300">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900">OTP Verified Successfully!</h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Delivery confirmed to {testTargetChannel === 'email' ? settings.email : `+91 ${settings.phone}`}.
                  </p>
                </div>
                <button 
                  onClick={() => setIsTestModalOpen(false)}
                  className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gmail Inbox Simulator */}
      <GmailInboxModal 
        isOpen={isGmailModalOpen}
        onClose={() => setIsGmailModalOpen(false)}
        emailRecipient={settings.email || 'anant8178581@gmail.com'}
        otpCode={generatedOtp}
        onAutoFillOtp={handleAutoFillCode}
      />
    </div>
  );
};

export default OtpSettingsView;
