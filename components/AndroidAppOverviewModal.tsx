import React from 'react';
import { X, Trash2, Smartphone, ShieldCheck, Zap } from 'lucide-react';

interface AndroidAppOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAll: () => void;
}

const AndroidAppOverviewModal: React.FC<AndroidAppOverviewModalProps> = ({ isOpen, onClose, onClearAll }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[180] bg-gray-950/90 backdrop-blur-lg flex flex-col justify-between p-6 text-white animate-in zoom-in-95 duration-200">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Android Recent Apps</span>
        <button 
          onClick={onClose}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-300"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main App Card Carousel */}
      <div className="flex-1 flex items-center justify-center py-6">
        <div 
          onClick={onClose}
          className="w-full max-w-xs bg-white text-gray-900 rounded-[2.5rem] p-5 shadow-2xl space-y-4 border-4 border-blue-600/40 cursor-pointer transform hover:scale-105 transition-all relative overflow-hidden"
        >
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                LT
              </div>
              <span className="font-bold text-xs text-gray-800">Local Trades India</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>

          <div className="h-48 bg-gray-50 rounded-2xl p-4 flex flex-col justify-between border border-gray-100">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">Mumbai Skilled Trades Portal</span>
              <h4 className="text-sm font-bold text-gray-900">Emergency Services & Gigs</h4>
              <p className="text-[10px] text-gray-500">2-Step OTP Security • Aadhaar Verified</p>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
              <ShieldCheck size={14} className="text-blue-600" />
              <span>Android 14 Optimized</span>
            </div>
          </div>

          <p className="text-center text-xs font-bold text-blue-600">Tap to resume app</p>
        </div>
      </div>

      {/* Bottom Clear All Bar */}
      <div className="flex justify-center pb-4">
        <button 
          onClick={() => {
            onClearAll();
            onClose();
          }}
          className="px-6 py-3 bg-gray-800 hover:bg-red-900/60 text-gray-200 hover:text-red-300 border border-gray-700 hover:border-red-500 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-lg"
        >
          <Trash2 size={16} /> Clear All Apps
        </button>
      </div>
    </div>
  );
};

export default AndroidAppOverviewModal;
