import React, { useState } from 'react';
import { 
  Wifi, 
  Bluetooth, 
  Signal, 
  Volume2, 
  VolumeX, 
  Flashlight, 
  RotateCw, 
  MapPin, 
  Battery, 
  X, 
  Check, 
  Copy, 
  Bell, 
  Trash2, 
  ShieldCheck, 
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { AndroidNotification } from '../types';

interface AndroidQuickSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AndroidNotification[];
  onClearNotifications: () => void;
  onAutoFillOtp?: (code: string) => void;
  onOpenOtpSettings: () => void;
  onOpenAppInfo: () => void;
}

const AndroidQuickSettings: React.FC<AndroidQuickSettingsProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearNotifications,
  onAutoFillOtp,
  onOpenOtpSettings,
  onOpenAppInfo
}) => {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [data, setData] = useState(true);
  const [sound, setSound] = useState<'sound' | 'vibrate' | 'silent'>('sound');
  const [torch, setTorch] = useState(false);
  const [location, setLocation] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [batterySaver, setBatterySaver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSound = () => {
    if (sound === 'sound') setSound('vibrate');
    else if (sound === 'vibrate') setSound('silent');
    else setSound('sound');
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (onAutoFillOtp) {
      onAutoFillOtp(code);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex flex-col text-white animate-in slide-in-from-top duration-300">
      {/* Header Bar */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/90">
        <div className="flex items-center gap-2">
          <Smartphone size={18} className="text-blue-400" />
          <span className="font-black text-xs uppercase tracking-widest text-gray-200">Android 14 System Control</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-300 transition-all"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Quick Settings Grid */}
        <div className="bg-gray-900/80 border border-gray-800 p-4 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quick Settings Toggles</h3>
            <span className="text-[10px] text-emerald-400 font-bold">Local Trades Native Build</span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {/* Wifi */}
            <button 
              onClick={() => setWifi(!wifi)}
              className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                wifi ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Wifi size={20} />
              <span className="text-[9px] font-bold">Wi-Fi</span>
            </button>

            {/* Bluetooth */}
            <button 
              onClick={() => setBluetooth(!bluetooth)}
              className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                bluetooth ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Bluetooth size={20} />
              <span className="text-[9px] font-bold">Bluetooth</span>
            </button>

            {/* Mobile Data */}
            <button 
              onClick={() => setData(!data)}
              className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                data ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Signal size={20} />
              <span className="text-[9px] font-bold">5G Data</span>
            </button>

            {/* Sound */}
            <button 
              onClick={toggleSound}
              className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                sound !== 'silent' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {sound === 'sound' ? <Volume2 size={20} /> : <VolumeX size={20} />}
              <span className="text-[9px] font-bold capitalize">{sound}</span>
            </button>

            {/* Flashlight */}
            <button 
              onClick={() => setTorch(!torch)}
              className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                torch ? 'bg-amber-500 text-black shadow-lg shadow-amber-900/40' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Flashlight size={20} />
              <span className="text-[9px] font-bold">Torch</span>
            </button>

            {/* Location */}
            <button 
              onClick={() => setLocation(!location)}
              className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                location ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <MapPin size={20} />
              <span className="text-[9px] font-bold">Location</span>
            </button>

            {/* Auto rotate */}
            <button 
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                autoRotate ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <RotateCw size={20} />
              <span className="text-[9px] font-bold">Rotate</span>
            </button>

            {/* Battery saver */}
            <button 
              onClick={() => setBatterySaver(!batterySaver)}
              className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                batterySaver ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Battery size={20} />
              <span className="text-[9px] font-bold">Saver</span>
            </button>
          </div>
        </div>

        {/* Quick App Shortcut Row */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => {
              onClose();
              onOpenOtpSettings();
            }}
            className="p-4 bg-gray-900 hover:bg-gray-800 border border-blue-500/30 rounded-2xl flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-100">OTP Security</h4>
                <p className="text-[9px] text-gray-400">Settings & Logs</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-gray-500 group-hover:text-white" />
          </button>

          <button 
            onClick={() => {
              onClose();
              onOpenAppInfo();
            }}
            className="p-4 bg-gray-900 hover:bg-gray-800 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-100">Android Info</h4>
                <p className="text-[9px] text-gray-400">APK & Permissions</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-gray-500 group-hover:text-white" />
          </button>
        </div>

        {/* Notifications Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-orange-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                System Notifications ({notifications.length})
              </h3>
            </div>
            {notifications.length > 0 && (
              <button 
                onClick={onClearNotifications}
                className="text-[10px] text-gray-400 hover:text-red-400 flex items-center gap-1 font-bold"
              >
                <Trash2 size={12} /> Clear All
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="bg-gray-900/50 p-6 rounded-2xl text-center border border-gray-800">
              <p className="text-xs text-gray-500 font-medium">No new notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-2 relative"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                      {notif.type.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">{notif.time}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-100">{notif.title}</h4>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">{notif.body}</p>
                  </div>

                  {/* OTP Specific Auto-fill Action */}
                  {notif.otpCode && (
                    <div className="pt-2 flex items-center gap-2">
                      <button 
                        onClick={() => handleCopyCode(notif.otpCode!, notif.id)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/30"
                      >
                        {copiedId === notif.id ? (
                          <>
                            <Check size={14} /> Applied Code ({notif.otpCode})
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Auto-Fill Code ({notif.otpCode})
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AndroidQuickSettings;
