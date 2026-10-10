import React, { useState } from 'react';
import { AppView, AndroidNotification } from '../types';
import Logo from './Logo';
import AndroidStatusBar from './AndroidStatusBar';
import AndroidNavigationBar from './AndroidNavigationBar';
import AndroidQuickSettings from './AndroidQuickSettings';
import AndroidPermissionsModal from './AndroidPermissionsModal';
import AndroidAppInfoModal from './AndroidAppInfoModal';
import AndroidAppOverviewModal from './AndroidAppOverviewModal';
import { 
  Home, 
  ClipboardList, 
  Users, 
  User, 
  PhoneCall, 
  Mic, 
  HelpCircle, 
  ShieldCheck, 
  Smartphone,
  MapPin,
  Tag,
  Sparkles,
  Bike,
  Wallet,
  Percent,
  Briefcase,
  Crown,
  Wrench,
  Radio,
  Bell,
  Building2
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  onVoiceTrigger: () => void;
  notifications: AndroidNotification[];
  onClearNotifications: () => void;
  onAutoFillOtpCode?: (code: string) => void;
  hasActiveBooking?: boolean;
  onOpenLiveTracker?: () => void;
  role?: 'worker' | 'customer';
  onToggleRole?: (role: 'worker' | 'customer') => void;
  onOpenFeeTransparency?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  setActiveView, 
  onVoiceTrigger,
  notifications,
  onClearNotifications,
  onAutoFillOtpCode,
  hasActiveBooking,
  onOpenLiveTracker,
  role = 'customer',
  onToggleRole,
  onOpenFeeTransparency
}) => {
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isAppInfoOpen, setIsAppInfoOpen] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [navMode, setNavMode] = useState<'gesture' | 'buttons'>('gesture');

  // Distinct navigation items tailored to the active persona
  const customerNavItems: { view: AppView; icon: React.ReactNode; label: string }[] = [
    { view: 'home', icon: <Home className="w-5 h-5" />, label: 'Explore' },
    { view: 'google-map', icon: <MapPin className="w-5 h-5" />, label: 'Live Map' },
    { view: 'coupon-corner', icon: <Tag className="w-5 h-5" />, label: 'Offers' },
    { view: 'ai-chat', icon: <Sparkles className="w-5 h-5" />, label: 'AI Mitra' },
    { view: 'jobs', icon: <ClipboardList className="w-5 h-5" />, label: 'Bookings' },
    { view: 'profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
  ];

  const workerNavItems: { view: AppView; icon: React.ReactNode; label: string }[] = [
    { view: 'home', icon: <Wrench className="w-5 h-5" />, label: 'Artisan Hub' },
    { view: 'jobs', icon: <Radio className="w-5 h-5" />, label: 'Job Radar' },
    { view: 'google-map', icon: <MapPin className="w-5 h-5" />, label: 'Map View' },
    { view: 'worker-wallet', icon: <Wallet className="w-5 h-5" />, label: '0% Wallet' },
    { view: 'ai-chat', icon: <Sparkles className="w-5 h-5" />, label: 'AI Mitra' },
    { view: 'profile', icon: <User className="w-5 h-5" />, label: 'Passport' },
  ];

  const navItems = role === 'worker' ? workerNavItems : customerNavItems;

  const handleNavBack = () => {
    if (activeView !== 'home') {
      setActiveView('home');
    }
  };

  const handleNavHome = () => {
    setActiveView('home');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-900 shadow-2xl overflow-hidden relative border-x border-gray-800 font-sans">
      {/* Top Android Status Bar */}
      <AndroidStatusBar 
        onOpenNotifications={() => setIsQuickSettingsOpen(true)}
        unreadCount={unreadCount}
      />

      {/* App Header Bar with Clean 3-Zone Architecture */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between z-10 shadow-sm gap-2">
        {/* Zone 1: Wordmark Brand Lockup */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <Logo size={24} />
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight">Local Trades</span>
              <span className="text-sm font-extrabold text-orange-600 tracking-tight">India</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-700 tracking-tight mt-0.5">
              0% Platform Cut
            </span>
          </div>
        </div>

        {/* Zone 2: Central Persona Switcher */}
        {onToggleRole && (
          <div className="flex bg-slate-100 p-0.5 rounded-full border border-slate-200/80 flex-shrink-0 shadow-inner">
            <button
              onClick={() => onToggleRole('customer')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight transition-all duration-150 min-h-[28px] ${
                role === 'customer' 
                  ? 'bg-blue-600 text-white shadow-sm font-extrabold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => onToggleRole('worker')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight transition-all duration-150 min-h-[28px] ${
                role === 'worker' 
                  ? 'bg-emerald-600 text-white shadow-sm font-extrabold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Worker
            </button>
          </div>
        )}

        {/* Zone 3: Actions (Fees, Tracker, SOS) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Active Booking Live Tracker */}
          {hasActiveBooking && (
            <button
              onClick={onOpenLiveTracker}
              className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 animate-bounce shadow-sm"
              title="View Live Worker Tracking"
            >
              <Bike size={12} />
              <span className="hidden sm:inline">Track</span>
            </button>
          )}

          {/* Fee Model Transparency Modal Button */}
          {onOpenFeeTransparency && (
            <button 
              onClick={onOpenFeeTransparency}
              className="h-8 px-2 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-200/80 flex items-center gap-1 text-[10px] font-bold active:scale-95 shadow-xs"
              title="Platform Pricing: Worker Subscriptions & Transparency"
            >
              <Percent size={13} className="text-emerald-700" />
              <span>Fees</span>
            </button>
          )}

          {/* SOS Emergency Trigger */}
          <button 
            onClick={() => setActiveView('sos')}
            className="h-8 px-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-[10px] font-bold border border-red-200/80 flex items-center gap-1 transition-all active:scale-95 shadow-xs"
            title="Emergency SOS"
          >
            <PhoneCall size={12} />
            <span>SOS</span>
          </button>
        </div>
      </header>

      {/* Main App Content Container */}
      <main className="flex-1 overflow-y-auto pb-16 bg-slate-50 relative">
        {children}
      </main>

      {/* Persistent Voice Assistant Button */}
      <button 
        onClick={onVoiceTrigger}
        className="fixed bottom-20 right-4 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center z-20 hover:scale-105 active:scale-95 transition-all ring-4 ring-blue-100"
        title="Hands-free Voice Navigation (Hindi & English)"
      >
        <Mic className="w-5 h-5" />
      </button>

      {/* Android Bottom Navigation Items */}
      <nav className="bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex justify-around items-center h-16 px-1 z-10 shadow-lg">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] transition-all relative ${
                isActive 
                  ? role === 'worker' ? 'text-emerald-700 font-bold' : 'text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                {item.icon}
                {isActive && (
                  <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${role === 'worker' ? 'bg-emerald-600' : 'bg-blue-600'}`} />
                )}
              </div>
              <span className="text-[10px] mt-1 font-semibold tracking-tight leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Android System Gesture/3-Button Navigation Bar */}
      <AndroidNavigationBar 
        navMode={navMode}
        onBack={handleNavBack}
        onHome={handleNavHome}
        onOverview={() => setIsOverviewOpen(true)}
        onToggleNavMode={() => setNavMode(prev => prev === 'gesture' ? 'buttons' : 'gesture')}
      />

      {/* Android System Quick Settings & Notification Shade */}
      <AndroidQuickSettings 
        isOpen={isQuickSettingsOpen}
        onClose={() => setIsQuickSettingsOpen(false)}
        notifications={notifications}
        onClearNotifications={onClearNotifications}
        onAutoFillOtp={(code) => {
          if (onAutoFillOtpCode) onAutoFillOtpCode(code);
        }}
        onOpenOtpSettings={() => setActiveView('otp-settings')}
        onOpenAppInfo={() => setIsAppInfoOpen(true)}
      />

      {/* Android Permissions Manager Sheet */}
      <AndroidPermissionsModal 
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
      />

      {/* Android App Info & APK Downloader Sheet */}
      <AndroidAppInfoModal 
        isOpen={isAppInfoOpen}
        onClose={() => setIsAppInfoOpen(false)}
        onOpenPermissions={() => setIsPermissionsOpen(true)}
      />

      {/* Android Recent Multitasking Overview */}
      <AndroidAppOverviewModal 
        isOpen={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
        onClearAll={() => {
          setIsOverviewOpen(false);
          setActiveView('home');
        }}
      />
    </div>
  );
};

export default Layout;

