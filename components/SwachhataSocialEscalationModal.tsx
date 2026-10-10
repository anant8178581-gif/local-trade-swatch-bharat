import React, { useState, useRef } from 'react';
import { 
  X, 
  Share2, 
  Instagram, 
  Twitter, 
  MessageCircle, 
  Download, 
  Copy, 
  Check, 
  AlertTriangle, 
  MapPin, 
  Building2, 
  ExternalLink, 
  CheckCircle2, 
  Flame, 
  Clock, 
  ShieldAlert,
  Send,
  PhoneCall
} from 'lucide-react';

export interface SwachhataSocialEscalationProps {
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
  daysOverdue?: number;
  initialCleanlinessStatus?: 'not_cleaned' | 'cleaned';
  onStatusChange?: (status: 'not_cleaned' | 'cleaned') => void;
}

export const SwachhataSocialEscalationModal: React.FC<SwachhataSocialEscalationProps> = ({
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
  daysOverdue = 4,
  initialCleanlinessStatus = 'not_cleaned',
  onStatusChange
}) => {
  const [cleanlinessStatus, setCleanlinessStatus] = useState<'not_cleaned' | 'cleaned'>(initialCleanlinessStatus);
  const [overdueDays, setOverdueDays] = useState<number>(daysOverdue);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [copiedTweet, setCopiedTweet] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  // Instagram Caption text with official authorities & viral civic hashtags
  const instagramCaption = `🚨 SWACHH BHARAT CITIZEN ESCALATION: CLEANLINESS NOT DONE! 🚨

Despite official Grievance Ticket #${ticketId}, this biohazard remains UNCLEANED for ${overdueDays} days with zero action from ward sanitation!

🦟 Severe risk of Dengue, Malaria vector breeding and toxic sludge in residential area.
📍 Location: ${locationAddress} (PIN: ${pincode})
📌 GPS Coordinates: ${gpsCoordinates}
🏛️ Authority: ${wardNumber} • Sanitary Inspector In-Charge

We demand immediate municipal cleanup and accountability!

Tagging authorities for urgent intervention:
@swachhbharatgov @mygovindia @mcd_delhi @delhigovt @mohua_india

#SwachhBharat #FixMyWard #MCDDelhi #CleanIndia #CitizenWatchdog #CivicAction #DelhiSanitation #StopVectorDiseases`;

  // Twitter / X tweet text (max 280 chars formatted)
  const tweetText = `🚨 URGENT: Cleanliness NOT DONE in ${wardNumber}!
Ticket #${ticketId} is ${overdueDays} days OVERDUE. Severe biohazard & vector breeding at ${locationAddress.slice(0, 35)}... (GPS: ${gpsCoordinates}).
Pls intervene @MCD_Delhi @SwachhBharatGov @MoHUA_India @LtGovDelhi! #FixMyWard #SwachhBharat`;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(instagramCaption);
      setCopiedCaption(true);
      setToastMessage('✓ Instagram viral caption & hashtags copied! Ready to paste into your Post/Story.');
      setTimeout(() => {
        setCopiedCaption(false);
        setToastMessage(null);
      }, 4000);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const handleCopyTweet = async () => {
    try {
      await navigator.clipboard.writeText(tweetText);
      setCopiedTweet(true);
      setToastMessage('✓ Tweet text copied with official handles!');
      setTimeout(() => {
        setCopiedTweet(false);
        setToastMessage(null);
      }, 3000);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  // Direct connect with Instagram
  const handleOpenInstagram = () => {
    handleCopyCaption();
    // Try opening Instagram deep link or web
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = 'instagram://camera';
      setTimeout(() => {
        window.open('https://www.instagram.com', '_blank');
      }, 1000);
    } else {
      window.open('https://www.instagram.com', '_blank');
    }
  };

  // Native Web Share API to share the story directly to social apps
  const handleNativeShare = async () => {
    const shareData = {
      title: `🚨 Swachhata Violation: ${category} Uncleaned!`,
      text: `Cleanliness has NOT been done for ticket #${ticketId} at ${locationAddress}! Overdue by ${overdueDays} days. Demanding urgent MCD action. #SwachhBharat`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setToastMessage('✓ Shared to social platform via native Web Share!');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Web Share failed:', err);
        }
      }
    }
    // Fallback: Copy Instagram caption
    handleCopyCaption();
  };

  // Direct connect with Twitter / 𝕏
  const handleOpenTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  // Direct connect with WhatsApp
  const handleOpenWhatsApp = () => {
    const waText = `🚨 *URGENT SWACHHATA CITIZEN ALERT: CLEANLINESS NOT DONE!*
The dirty place at *${locationAddress}* has NOT been cleared for *${overdueDays} days*!
Ticket ID: *#${ticketId}*
GPS: ${gpsCoordinates}
Ward: ${wardNumber}

Neighbors & RWA Members, please re-tweet and call the MCD Helpline 155304 to demand immediate municipal cleanup!`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');
  };

  // Direct connect with Facebook
  const handleOpenFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`Cleanliness NOT done at ${locationAddress}! Ticket #${ticketId} is ${overdueDays} days overdue. #SwachhBharat`)}`;
    window.open(fbUrl, '_blank');
  };

  // Render & download an official Instagram Story 9:16 graphic
  const handleDownloadStoryImage = () => {
    setIsGeneratingStory(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGeneratingStory(false);
      return;
    }

    // Draw background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, '#0F172A');
    bgGrad.addColorStop(0.3, '#1E1B4B');
    bgGrad.addColorStop(0.7, '#311018');
    bgGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Header badge
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(60, 80, 960, 100);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ CITIZEN WATCHDOG ALERT: CLEANLINESS NOT DONE ⚠️', 540, 145);

    // Title
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '900 52px sans-serif';
    ctx.fillText('MUNICIPAL SANITATION SLA BREACHED', 540, 240);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '32px sans-serif';
    ctx.fillText(`${wardNumber} • Central Swachhata Watchdog`, 540, 290);

    // Load photo onto canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photoUrl;
    img.onload = () => {
      // Photo frame
      ctx.drawImage(img, 60, 330, 960, 860);

      // Watermark overlay on image
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(60, 1090, 960, 100);
      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`📍 GPS: ${gpsCoordinates}`, 80, 1145);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#EF4444';
      ctx.fillText(`TICKET #${ticketId} • ${overdueDays} DAYS UNCLEANED`, 1000, 1145);

      // Details card
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(60, 1220, 960, 420);

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🚨 Hazard: ${category}`, 100, 1280);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = '30px sans-serif';
      ctx.fillText(`📍 Location: ${locationAddress}`, 100, 1340);
      ctx.fillText(`📮 PIN: ${pincode} • ${wardNumber}`, 100, 1390);

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(`⏱️ Status: Ward Sanitation Failed to Act (${overdueDays} Days Overdue)`, 100, 1440);

      ctx.fillStyle = '#38BDF8';
      ctx.font = '28px sans-serif';
      ctx.fillText(`Cc: @swachhbharatgov @mygovindia @mcd_delhi #SwachhBharat #FixMyWard`, 100, 1500);

      // Call to action banner at bottom
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(60, 1680, 960, 140);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 38px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SHARE TO INSTAGRAM • DEMAND CLEANLINESS NOW!', 540, 1765);

      // Trigger download
      const link = document.createElement('a');
      link.download = `Swachhata_Instagram_Escalation_${ticketId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsGeneratingStory(false);
      setToastMessage('✓ Instagram Story card downloaded! Open Instagram and post to Stories.');
      setTimeout(() => setToastMessage(null), 4000);
    };

    img.onerror = () => {
      setIsGeneratingStory(false);
      setToastMessage('✓ Ready to share! Copy caption and open Instagram.');
      setTimeout(() => setToastMessage(null), 3000);
    };
  };

  return (
    <div 
      className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Urgent Alert Header */}
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 text-white p-5 relative border-b-4 border-amber-400">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-red-700 flex items-center justify-center font-black shadow-md flex-shrink-0 animate-pulse">
              <ShieldAlert size={26} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-200 bg-red-950/40 px-2 py-0.5 rounded-full">
                  CITIZEN WATCHDOG ESCALATION HUB
                </span>
              </div>
              <h3 className="text-lg font-black text-white leading-tight mt-0.5">
                Cleanliness Not Done? Escalate on Social Media
              </h3>
              <p className="text-xs text-rose-100">
                Direct connect with Instagram, 𝕏, WhatsApp & Local Ward Authorities
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">

          {/* Cleanliness Status Selector */}
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                Verify Physical Cleanliness On-Site:
              </span>
              <span className="font-mono text-amber-400 font-bold text-xs">
                Ticket #{ticketId}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCleanlinessStatus('not_cleaned');
                  onStatusChange?.('not_cleaned');
                }}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  cleanlinessStatus === 'not_cleaned'
                    ? 'bg-red-600 text-white border-red-400 shadow-md font-black ring-2 ring-red-400/30'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                }`}
              >
                <AlertTriangle size={18} className={cleanlinessStatus === 'not_cleaned' ? 'text-white' : 'text-red-400'} />
                <span className="text-xs font-black uppercase">⚠️ NOT Cleaned (Overdue)</span>
                <span className="text-[10px] opacity-80">Ignored by Ward Sanitation</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCleanlinessStatus('cleaned');
                  onStatusChange?.('cleaned');
                }}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  cleanlinessStatus === 'cleaned'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-black ring-2 ring-emerald-400/30'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                }`}
              >
                <CheckCircle2 size={18} className={cleanlinessStatus === 'cleaned' ? 'text-white' : 'text-emerald-400'} />
                <span className="text-xs font-black uppercase">✓ Cleaned & Resolved</span>
                <span className="text-[10px] opacity-80">Sanitation team cleared spot</span>
              </button>
            </div>

            {/* Overdue Days Adjuster */}
            {cleanlinessStatus === 'not_cleaned' && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-300">Days Unresolved by Municipality:</span>
                <div className="flex items-center gap-1">
                  {[2, 4, 7, 10].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setOverdueDays(d)}
                      className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition-all ${
                        overdueDays === d
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Photo Preview with Overdue Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-950 shadow-inner group">
            <img 
              src={photoUrl} 
              alt="Dirty Place Report Proof" 
              className="w-full h-full object-cover"
            />
            {cleanlinessStatus === 'not_cleaned' ? (
              <div className="absolute inset-0 bg-red-950/30 flex flex-col justify-between p-3 pointer-events-none">
                <div className="self-start px-3 py-1 bg-red-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl shadow-lg border border-red-400 flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-300 animate-bounce" />
                  <span>SLA BREACHED: {overdueDays} DAYS OVERDUE</span>
                </div>
                <div className="bg-black/85 backdrop-blur-md p-2.5 rounded-xl text-white space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-amber-300">
                    <span>📍 {gpsCoordinates}</span>
                    <span>{wardNumber}</span>
                  </div>
                  <p className="text-xs font-bold truncate text-slate-200">{locationAddress}</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center p-4">
                <div className="bg-emerald-600 text-white px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-2 shadow-2xl">
                  <CheckCircle2 size={20} />
                  <span>MARKED AS CLEANED & RESOLVED</span>
                </div>
              </div>
            )}
          </div>

          {cleanlinessStatus === 'not_cleaned' ? (
            <>
              {/* PRIMARY ESCALATION: DIRECT CONNECT WITH INSTAGRAM */}
              <div className="p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 rounded-2xl border-2 border-pink-300 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md flex-shrink-0">
                      <Instagram size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-pink-950 tracking-wide flex items-center gap-1.5">
                        <span>Direct Connect to Instagram</span>
                        <span className="text-[9px] bg-pink-200 text-pink-900 font-extrabold px-1.5 py-0.5 rounded-full">
                          High Virality
                        </span>
                      </h4>
                      <p className="text-[11px] text-pink-800">
                        Post to Stories / Feed to shame ward inaction & alert local citizens
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instagram Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenInstagram}
                    className="py-2.5 px-3 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <Instagram size={15} />
                    <span>Copy Caption & Open Instagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadStoryImage}
                    disabled={isGeneratingStory}
                    className="py-2.5 px-3 bg-white hover:bg-pink-100 text-pink-900 border border-pink-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Download size={14} className="text-pink-600" />
                    <span>{isGeneratingStory ? 'Rendering Card...' : 'Download Story Graphic'}</span>
                  </button>
                </div>

                {/* Pre-formatted caption box preview */}
                <div className="p-2.5 bg-white/80 rounded-xl border border-pink-200 text-[11px] font-mono text-slate-700 space-y-1 relative">
                  <div className="flex items-center justify-between text-[10px] text-pink-700 font-sans font-bold border-b border-pink-100 pb-1">
                    <span>Pre-Formatted Caption with Official Tags:</span>
                    <button
                      type="button"
                      onClick={handleCopyCaption}
                      className="text-pink-600 hover:text-pink-800 flex items-center gap-0.5 font-bold cursor-pointer"
                    >
                      {copiedCaption ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedCaption ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="line-clamp-2 leading-relaxed text-slate-600">
                    {instagramCaption}
                  </p>
                </div>
              </div>

              {/* SECONDARY SOCIAL PLATFORMS: 𝕏 / TWITTER & WHATSAPP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 𝕏 / Twitter Card */}
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold border border-slate-700">
                        <Twitter size={14} />
                      </div>
                      <span className="font-bold text-xs">Tag MCD on 𝕏</span>
                    </div>
                    <span className="text-[9px] text-amber-400 font-mono">@MCD_Delhi</span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    Auto-tags Swachh Bharat & Delhi Lt. Governor with location coordinates.
                  </p>

                  <button
                    type="button"
                    onClick={handleOpenTwitter}
                    className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Send size={13} />
                    <span>Tweet to Authorities</span>
                  </button>
                </div>

                {/* WhatsApp Community Mobilizer */}
                <div className="p-3.5 bg-emerald-950 text-white rounded-2xl border border-emerald-800 space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <MessageCircle size={14} />
                      </div>
                      <span className="font-bold text-xs">Rally Ward WhatsApp</span>
                    </div>
                    <span className="text-[9px] text-emerald-300 font-mono">RWA Mobilizer</span>
                  </div>

                  <p className="text-[11px] text-emerald-200 leading-snug">
                    Send urgent alert to your society/ward group to flood the municipal helpline.
                  </p>

                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Share2 size={13} />
                    <span>Broadcast on WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Direct Government Hotline Emergency Contacts */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-3 text-amber-950">
                <div className="flex items-center gap-2">
                  <PhoneCall size={16} className="text-amber-700 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">MCD Central Swachhata Hotline</span>
                    <span className="text-[10px] text-amber-800">Toll-free 155304 • Direct Ward #44 Escalation</span>
                  </div>
                </div>
                <a
                  href="tel:155304"
                  className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center gap-1 transition-all active:scale-95"
                >
                  <PhoneCall size={12} />
                  <span>Call 155304</span>
                </a>
              </div>
            </>
          ) : (
            /* Cleaned Confirmation State */
            <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-300 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4 className="text-base font-black text-emerald-950 uppercase">
                  Location Marked as Cleaned!
                </h4>
                <p className="text-xs text-emerald-800 mt-1 max-w-sm mx-auto">
                  Thank you for keeping our neighborhood clean! We have updated the Swachhata Watchdog registry for Ticket #{ticketId}.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Close & Return to Dashboard
              </button>
            </div>
          )}

          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleNativeShare}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Use Native Web Share API to share with any app"
          >
            <Share2 size={14} className="text-amber-400" />
            <span>Native Web Share</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Done / Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwachhataSocialEscalationModal;
