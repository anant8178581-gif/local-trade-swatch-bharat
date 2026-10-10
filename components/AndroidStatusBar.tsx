import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Bell, Shield, Smartphone } from 'lucide-react';

interface AndroidStatusBarProps {
  onOpenNotifications: () => void;
  unreadCount: number;
}

const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ onOpenNotifications, unreadCount }) => {
  const [time, setTime] = useState<string>('');
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 text-white text-[11px] px-4 py-1 flex justify-between items-center select-none z-30 font-medium tracking-wide border-b border-gray-800/80">
      {/* Left: Time & Carrier */}
      <div className="flex items-center gap-2">
        <span className="font-bold tracking-tight text-gray-100">{time || '10:42'}</span>
        <span className="text-[9px] bg-blue-600/30 text-blue-300 px-1.5 py-0.2 rounded font-black tracking-widest uppercase border border-blue-500/20">
          JIO 5G
        </span>
      </div>

      {/* Center: App notification badge */}
      <button 
        onClick={onOpenNotifications} 
        className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs transition-all active:scale-95 text-gray-300"
        title="Open Android Quick Settings & Notification Shade"
      >
        <Bell size={11} className={unreadCount > 0 ? "text-orange-400 animate-bounce" : "text-gray-400"} />
        <span className="text-[10px] font-bold">Android 14</span>
        {unreadCount > 0 && (
          <span className="w-4 h-4 bg-orange-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Right: Status Icons (VoLTE, Wifi, Signal, Battery) */}
      <div className="flex items-center gap-2 text-gray-300">
        <span className="text-[8px] font-black tracking-tighter text-emerald-400 border border-emerald-500/30 px-1 rounded">VoLTE</span>
        <Wifi size={12} className="text-gray-200" />
        <Signal size={12} className="text-gray-200" />
        <div 
          className="flex items-center gap-1 cursor-pointer" 
          onClick={() => setBatteryLevel(prev => prev > 20 ? prev - 15 : 95)}
          title="Click to toggle battery level"
        >
          <span className="text-[10px] font-bold">{batteryLevel}%</span>
          <div className="relative flex items-center">
            <Battery size={14} className={batteryLevel <= 20 ? "text-red-400" : "text-emerald-400"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AndroidStatusBar;
