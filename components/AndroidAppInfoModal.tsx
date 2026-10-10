import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle, 
  ShieldCheck, 
  X, 
  HardDrive, 
  Cpu, 
  Sparkles,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface AndroidAppInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPermissions: () => void;
}

const AndroidAppInfoModal: React.FC<AndroidAppInfoModalProps> = ({ isOpen, onClose, onOpenPermissions }) => {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleSimulateApkDownload = () => {
    setDownloadProgress(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        setDownloadProgress(100);
        setIsDownloaded(true);
        clearInterval(interval);
      } else {
        setDownloadProgress(current);
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl space-y-6 relative border border-gray-100">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-all"
        >
          <X size={16} />
        </button>

        {/* App Banner */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[1.75rem] mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-200 border-4 border-white">
            <Smartphone size={38} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Local Trades India</h3>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-0.5">
              Android APK Release v2.4.0
            </p>
          </div>
        </div>

        {/* App Technical Details */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2.5 text-xs font-medium">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Package Name</span>
            <span className="font-mono font-bold text-gray-800">com.localtrades.india</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">APK Size</span>
            <span className="font-bold text-gray-800">18.4 MB (Universal APK)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Target SDK</span>
            <span className="font-bold text-gray-800">Android 14 (API 34)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Security Signature</span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              SHA-256 Verified
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => {
              onClose();
              onOpenPermissions();
            }}
            className="w-full py-3.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <ShieldCheck size={16} /> Manage Android Permissions
          </button>

          {isDownloaded ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-black text-xs uppercase tracking-wider">
                <CheckCircle size={16} /> APK Download Ready
              </div>
              <p className="text-[10px] text-emerald-600">
                LocalTrades_v2.4.0.apk saved to Android Downloads folder.
              </p>
            </div>
          ) : downloadProgress !== null ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin text-blue-600" /> Downloading APK...</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300" 
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <button 
              onClick={handleSimulateApkDownload}
              className="w-full py-4 bg-[#2D4356] hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Download size={16} /> Download Native Android APK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AndroidAppInfoModal;
