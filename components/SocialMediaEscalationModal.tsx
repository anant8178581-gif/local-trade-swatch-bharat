import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertTriangle, 
  Sparkles, 
  Download, 
  Building2, 
  Flame, 
  Users, 
  Send,
  MessageCircle,
  ThumbsUp,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';

export interface SocialMediaEscalationProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  category: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  locationAddress: string;
  pincode: string;
  gpsCoordinates: string;
  photoUrl: string;
  wardNumber?: string;
  escalationDay?: number;
  onPlatformWorkerDispatch?: () => void;
}

export const SocialMediaEscalationModal: React.FC<SocialMediaEscalationProps> = ({
  isOpen,
  onClose,
  ticketId,
  category,
  riskLevel,
  locationAddress,
  pincode,
  gpsCoordinates,
  photoUrl,
  wardNumber = 'Ward #44, East Delhi MCD',
  escalationDay = 3,
  onPlatformWorkerDispatch
}) => {
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [pressureCount, setPressureCount] = useState<number>(42);
  const [hasAmplified, setHasAmplified] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'instagram' | 'twitter' | 'whatsapp'>('instagram');

  if (!isOpen) return null;

  const daysText = escalationDay >= 7 
    ? '7+ DAYS UNCLEANED (CRITICAL SLA BREACH)' 
    : escalationDay >= 3 
    ? '3 DAYS UNCLEANED (SUPERVISORY ALERT)' 
    : 'PENDING MUNICIPAL CLEARANCE';

  // Viral caption for Instagram, Twitter and WhatsApp
  const instagramCaption = `🚨 CIVIC EMERGENCY: ${category} at ${locationAddress} (${wardNumber}, PIN ${pincode}) has been left unaddressed! 

⚠️ Swachhata Ticket #${ticketId} has reached: ${daysText}! 
Stagnant water and rotting garbage pose acute dengue & cholera risks to local residents!

Authorities tagged:
@swachhbharatgov @mcd_delhi @mohua_india @ltgovdelhi

📍 GPS: ${gpsCoordinates}
#SwachhBharatFail #MCDCleanOurWard #CleanDelhi #SwachhataApp #CitizenWatchdog #DelhiCivicCrisis #MayurVihar`;

  const twitterTweetText = encodeURIComponent(
    `🚨 URGENT: Civic biohazard uncleaned for ${escalationDay}+ days at ${locationAddress}! Ticket #${ticketId}. Mosquitoes breeding rapidly! @SwachhBharatGov @MCD_Delhi @MoHUA_India @LtGovDelhi clean our ward immediately! #SwachhBharatFail`
  );

  const whatsappShareText = encodeURIComponent(
    `*CIVIC EMERGENCY ALERT - RESIDENTS WELFARE NOTICE* 📢\n\n` +
    `Dear Neighbors, the civic hazard at *${locationAddress}* (${category}) is still UNCLEANED after ${escalationDay} days! (Swachhata Ticket: *${ticketId}*).\n\n` +
    `Please click to amplify on social media or file complaints with Ward Inspector #44:\n` +
    `📍 GPS: ${gpsCoordinates}\n` +
    `👉 Demand immediate MCD action before dengue spreads in our colony!`
  );

  const handleCopyCaption = () => {
    navigator.clipboard?.writeText(instagramCaption);
    setCopiedCaption(true);
    if (!hasAmplified) {
      setPressureCount(prev => prev + 1);
      setHasAmplified(true);
    }
    setTimeout(() => setCopiedCaption(false), 3000);
  };

  const handleOpenInstagram = () => {
    handleCopyCaption();
    window.open('https://www.instagram.com/', '_blank');
  };

  const handleOpenTwitter = () => {
    if (!hasAmplified) {
      setPressureCount(prev => prev + 1);
      setHasAmplified(true);
    }
    window.open(`https://twitter.com/intent/tweet?text=${twitterTweetText}`, '_blank');
  };

  const handleOpenWhatsApp = () => {
    if (!hasAmplified) {
      setPressureCount(prev => prev + 1);
      setHasAmplified(true);
    }
    window.open(`https://api.whatsapp.com/send?text=${whatsappShareText}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-[260] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-amber-950 text-white p-5 relative border-b-4 border-rose-500">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-black shadow-md flex-shrink-0">
              <Flame size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                  PUBLIC WHISTLEBLOWER & ACCOUNTABILITY ENGINE
                </span>
                <span className="bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[9px] font-black px-2 py-0.5 rounded-full">
                  UNCLEANED SPOT
                </span>
              </div>
              <h3 className="text-lg font-black text-white leading-tight">
                Connect to Instagram & Social Media
              </h3>
              <p className="text-xs text-slate-300">
                Put viral public pressure on Municipal Corporation (MCD) to clear this hazard immediately
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Civic Pressure Meter Card */}
          <div className="p-4 bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl border border-rose-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-rose-600" />
                <span className="text-xs font-black uppercase text-slate-900">
                  Citizen Public Pressure Meter:
                </span>
              </div>
              <span className="text-xs font-mono font-black text-rose-700 bg-white px-2.5 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                🔥 {pressureCount} Citizens Amplified
              </span>
            </div>

            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (pressureCount / 50) * 100)}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-600">
              <strong>Municipal Media Cell Policy:</strong> When public posts exceed 50 tags, municipal grievance officers are mandated to dispatch emergency sanitation squads within 4 hours!
            </p>
          </div>

          {/* Social Platform Switcher Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('instagram')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'instagram'
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📸 Instagram Story & Reel</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('twitter')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'twitter'
                  ? 'bg-sky-600 text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>𝕏 Direct Tweet</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-600 text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>💬 WhatsApp RWA</span>
            </button>
          </div>

          {/* Tab 1: Instagram Story & Reel Graphic Generator */}
          {activeTab === 'instagram' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Instagram Card Preview */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950 border-2 border-rose-500 shadow-md">
                <img
                  src={photoUrl}
                  alt="Uncleaned Spot"
                  className="w-full h-full object-cover opacity-85"
                />

                {/* Stamped Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/70 p-4 text-white flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="bg-rose-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <AlertTriangle size={11} />
                      SWACHHATA FAILURE: {daysText}
                    </span>
                    <span className="bg-black/70 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                      Ticket #{ticketId}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-white drop-shadow-md">
                      ⚠️ {category}
                    </h4>
                    <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                      📍 {locationAddress} ({gpsCoordinates})
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[9px] font-mono">
                      <span className="bg-white/20 px-2 py-0.5 rounded">@swachhbharatgov</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded">@mcd_delhi</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded">#MCDCleanOurWard</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Caption Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700">Pre-Written Viral Caption:</span>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="text-emerald-700 font-black flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {copiedCaption ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
                  </button>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-800 leading-relaxed max-h-24 overflow-y-auto">
                  {instagramCaption}
                </div>
              </div>

              {/* Instagram Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                >
                  {copiedCaption ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedCaption ? 'Caption Copied!' : 'Copy Viral Caption'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenInstagram}
                  className="py-2.5 px-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-95 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md"
                >
                  <ExternalLink size={14} />
                  <span>Open Instagram & Post</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Twitter / X Direct Whistleblower Tweet */}
          {activeTab === 'twitter' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase text-sky-900 block">
                  Official Public Tweet to MCD & Urban Ministry:
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-3 rounded-xl border border-sky-100">
                  🚨 URGENT: Civic biohazard ({category}) uncleaned for {escalationDay}+ days at {locationAddress}! Ticket #{ticketId}. Stagnant water & mosquitoes breeding rapidly! @SwachhBharatGov @MCD_Delhi @MoHUA_India @LtGovDelhi clean our ward immediately! #SwachhBharatFail
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenTwitter}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Send size={15} />
                <span>Publish Whistleblower Tweet on 𝕏</span>
              </button>
            </div>
          )}

          {/* Tab 3: WhatsApp Colony / RWA Broadcast */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase text-emerald-950 block">
                  Broadcast to Colony WhatsApp Groups & RWA:
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-3 rounded-xl border border-emerald-100">
                  📢 <strong>RESIDENTS WELFARE NOTICE:</strong> Hazard at {locationAddress} is still uncleaned ({category})! Swachhata Ticket: {ticketId}. Please amplify on social media and call Ward #44 Inspector to prevent dengue outbreak!
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <MessageCircle size={15} />
                <span>Broadcast to WhatsApp Groups</span>
              </button>
            </div>
          )}

          {/* Direct Platform Fallback Action */}
          {onPlatformWorkerDispatch && (
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Users size={14} />
                  Bypass Unresponsive Government
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                  Instant Direct Dispatch
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Tired of waiting for the municipality? You can immediately dispatch a verified platform sanitation worker from Column 1 to clear this dirty spot today with 0% commission!
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPlatformWorkerDispatch();
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Dispatch Platform Sanitation Worker (Column 1)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaEscalationModal;
