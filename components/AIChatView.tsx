import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Loader2, 
  ArrowLeft, 
  Trash2, 
  Brain, 
  Globe, 
  ExternalLink,
  MapPin,
  Navigation,
  Volume2,
  VolumeX,
  Languages,
  DollarSign,
  Tag,
  Compass
} from 'lucide-react';
import { geminiService, ChatMessageContext } from '../services/geminiService';
import { UserLocation } from '../types';
import { getLiveGPSLocation } from '../services/locationService';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
  links?: { title: string; uri: string }[];
  isThinking?: boolean;
}

interface AIChatViewProps {
  onBack: () => void;
  customerLocation: UserLocation;
  onUpdateLocation: (newLoc: UserLocation) => void;
  onOpenMap: () => void;
  onBookWorker?: (category: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { id: 'Hinglish', name: 'Hinglish (Hindi+English)' },
  { id: 'Hindi', name: 'हिंदी (Hindi)' },
  { id: 'English', name: 'English' },
  { id: 'Marathi', name: 'मराठी (Marathi)' },
  { id: 'Gujarati', name: 'ગુજરાતી (Gujarati)' },
  { id: 'Tamil', name: 'தமிழ் (Tamil)' },
  { id: 'Bengali', name: 'বাংলা (Bengali)' },
  { id: 'Telugu', name: 'తెలుగు (Telugu)' }
];

const AIChatView: React.FC<AIChatViewProps> = ({ 
  onBack, 
  customerLocation, 
  onUpdateLocation,
  onOpenMap,
  onBookWorker
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'bot',
      text: `Namaste! Main hoon aapka Local Trades Mitra. Aapke location (${customerLocation.area}, ${customerLocation.city}) ke aas-paas 10+ verified plumbers, electricians, aur AC technicians active hain. Bataiye kya problem solve karni hai?`,
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Hinglish');
  const [isLocating, setIsLocating] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Real GPS Auto-Locate triggered from AI Chat
  const handleAutoLocate = async () => {
    setIsLocating(true);
    try {
      const live = await getLiveGPSLocation();
      onUpdateLocation(live);
      
      const locText = `Mera current GPS location: ${live.formattedAddress} (Lat: ${live.lat.toFixed(4)}, Lng: ${live.lng.toFixed(4)}). Mere sabse nazdeek kaunsa worker hai?`;
      
      // Send as user message
      handleSendMessageWithPrompt(locText);
    } catch (err) {
      console.warn("GPS error in chat:", err);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSendMessageWithPrompt = async (textToSend: string) => {
    const userMsg = textToSend.trim();
    if (!userMsg || isLoading) return;

    const userMessageObj: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: userMsg,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessageObj]);
    setInput("");
    setIsLoading(true);

    // Format conversation history for Gemini (multi-turn context prevents repetition!)
    const history: ChatMessageContext[] = messages.slice(-6).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      text: m.text
    }));

    // Generate reply using Gemini 3.8 Flash with full memory & language instruction
    const botReplyText = await geminiService.chatWithHistory(
      history,
      userMsg,
      selectedLanguage,
      customerLocation.formattedAddress
    );

    const botMessageObj: ChatMessage = {
      id: `b-${Date.now()}`,
      role: 'bot',
      text: botReplyText,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botMessageObj]);
    setIsLoading(false);
  };

  // Text to speech (TTS) voice readout
  const handleSpeak = (msgId: string, text: string) => {
    if (!window.speechSynthesis) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedLanguage === 'Hindi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b flex flex-col gap-2.5 bg-gradient-to-r from-[#1e293b] via-[#2D4356] to-[#0f172a] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black uppercase tracking-tight leading-none">Local Trades AI Mitra</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">Multi-Language • Conversational Memory Active</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setMessages([])} 
              className="p-2 text-white/50 hover:text-white transition-all"
              title="Clear Chat"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Location & Language Bar */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
          {/* Location Auto-Locate Chip */}
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-xl text-[11px] font-medium max-w-[200px] truncate">
            <MapPin size={12} className="text-red-400 flex-shrink-0" />
            <span className="truncate">{customerLocation.area || 'Current Area'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoLocate}
              disabled={isLocating}
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-sm flex-shrink-0"
              title="Find my exact GPS location"
            >
              {isLocating ? <Loader2 size={11} className="animate-spin" /> : <Navigation size={11} />}
              <span>Auto-GPS</span>
            </button>

            <button
              onClick={onOpenMap}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[11px] font-black transition-all shadow-sm flex-shrink-0"
              title="Open Google Map"
            >
              <Compass size={11} />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Language Selection Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <Languages size={13} className="text-amber-300 flex-shrink-0 mr-1" />
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLanguage(lang.id)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                selectedLanguage === lang.id
                  ? 'bg-amber-400 text-slate-950 font-black shadow'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              m.role === 'user' ? 'bg-[#2D4356] text-white' : 'bg-amber-500 text-slate-950 font-black text-xs'
            }`}>
              {m.role === 'user' ? <User size={15} /> : <Bot size={15} />}
            </div>

            <div className="max-w-[82%] space-y-1.5">
              <div className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-[#2D4356] text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
              }`}>
                {m.text}
              </div>

              <div className="flex items-center justify-between px-1 text-[10px] text-gray-400">
                <span>{m.timestamp}</span>
                {m.role === 'bot' && (
                  <button
                    onClick={() => handleSpeak(m.id, m.text)}
                    className="p-1 text-gray-400 hover:text-gray-700 transition-all flex items-center gap-1"
                    title="Read Aloud"
                  >
                    {speakingMsgId === m.id ? (
                      <VolumeX size={13} className="text-red-500 animate-pulse" />
                    ) : (
                      <Volume2 size={13} />
                    )}
                    <span>{speakingMsgId === m.id ? 'Stop' : 'Listen'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bot size={15} />
            </div>
            <div className="bg-white border border-gray-200 p-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 className="animate-spin text-amber-600" size={16} />
              <span className="text-xs font-bold text-gray-500">AI Mitra is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Suggested Chips */}
      <div className="px-4 py-2 bg-white/80 border-t border-gray-200 flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          "📍 Auto-locate my GPS",
          "🔧 Plumber near me",
          "⚡ Electrician rate",
          "❄️ AC Service cost",
          "🤝 How to bargain?",
          "🎟️ Best coupon codes"
        ].map((chip) => (
          <button
            key={chip}
            onClick={() => {
              if (chip.includes("Auto-locate")) {
                handleAutoLocate();
              } else {
                handleSendMessageWithPrompt(chip);
              }
            }}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border border-gray-200"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="p-4 bg-white border-t border-gray-200 safe-bottom">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder={`Ask in ${selectedLanguage} (e.g. "Arjun plumber ka phone number do")...`} 
            className="flex-1 bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 outline-none transition-all font-medium text-xs text-black focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessageWithPrompt(input)}
          />
          <button 
            onClick={() => handleSendMessageWithPrompt(input)}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-all disabled:opacity-40 bg-[#2D4356] hover:bg-slate-800 text-white flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatView;
