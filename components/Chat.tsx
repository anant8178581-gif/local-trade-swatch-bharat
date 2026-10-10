import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Languages, 
  Phone, 
  CheckCheck, 
  X, 
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  ShieldCheck,
  Bot,
  User,
  Loader2,
  Sparkles
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them' | 'bot';
  timestamp: string;
  languageBadge?: string;
}

const LANGUAGES = [
  'Auto-Detect',
  'Hinglish',
  'Hindi (हिंदी)',
  'English',
  'Marathi (मराठी)',
  'Tamil (தமிழ்)',
  'Telugu (తెలుగు)',
  'Bengali (বাংলা)'
];

const Chat: React.FC<{ name: string; onClose: () => void; initialCall?: boolean }> = ({ name, onClose, initialCall = false }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'bot-1', 
      text: `Namaste! I am the Multi-Lingual Worker Voice Assistant for ${name}. Type or speak in Hindi, Hinglish, English, Tamil, Telugu, Marathi, or Bengali! How can ${name.split(' ')[0]} help you today?`, 
      sender: 'bot', 
      timestamp: 'Just now',
      languageBadge: 'Multi-Lingual AI'
    }
  ]);
  const [input, setInput] = useState("");
  const [selectedLang, setSelectedLang] = useState<string>('Auto-Detect');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCalling, setIsCalling] = useState(initialCall);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isDirect, setIsDirect] = useState(false);
  const [isWorkerResponding, setIsWorkerResponding] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isCalling) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const detectLanguageLabel = (text: string): string => {
    if (selectedLang !== 'Auto-Detect') return selectedLang;
    if (/[\u0900-\u097F]/.test(text)) return 'Hindi / Marathi';
    if (/[\u0B80-\u0BFF]/.test(text)) return 'Tamil';
    if (/[\u0C00-\u0C7F]/.test(text)) return 'Telugu';
    if (/[\u0980-\u09FF]/.test(text)) return 'Bengali';
    const lower = text.toLowerCase();
    if (lower.includes('bhai') || lower.includes('kya') || lower.includes('kitna') || lower.includes('kab') || lower.includes('paani') || lower.includes('kaam')) {
      return 'Hinglish';
    }
    return 'English / Hinglish';
  };

  const handleVoiceDictation = () => {
    setIsVoiceListening(true);
    setTimeout(() => {
      setIsVoiceListening(false);
      setInput('Bhai kitchen pipe leak ho raha hai, kab tak aaoge? Location map pe bheja hai.');
    }, 1500);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    const detectedLang = detectLanguageLabel(userMsg);

    const newMessage: Message = {
      id: Date.now().toString(),
      text: userMsg,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      languageBadge: detectedLang
    };
    setMessages(prev => [...prev, newMessage]);
    setInput("");

    setIsWorkerResponding(true);

    if (!isDirect) {
      const botResponse = await geminiService.getWorkerIntermediaryResponse(name, ["Plumbing", "Electrical"], userMsg);
      setIsWorkerResponding(false);
      
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        languageBadge: `Translated (${detectedLang})`
      };
      setMessages(prev => [...prev, reply]);
    } else {
      setTimeout(() => {
        setIsWorkerResponding(false);
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          text: `Haan ji, main aapki live Google Map location dekh raha hoon. 10 minute mein pahunch raha hoon, kaam 0% commission pe direct UPI QR se ho jayega!`,
          sender: 'them',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          languageBadge: 'Direct Worker Reply'
        };
        setMessages(prev => [...prev, reply]);
      }, 1600);
    }
  };

  const connectDirectly = () => {
    setIsDirect(true);
    setMessages(prev => [...prev, {
      id: `system-connect-${Date.now()}`,
      text: `Connected directly with ${name}. Live GPS location shared.`,
      sender: 'bot',
      timestamp: 'Now'
    }]);
  };

  const translateLastMessage = async () => {
    setIsTranslating(true);
    const lastMsg = messages[messages.length - 1];
    const target = selectedLang === 'Auto-Detect' ? 'Hindi' : selectedLang;
    const translatedText = await geminiService.translateMessage(lastMsg.text, target);
    const updatedMessages = [...messages];
    updatedMessages[updatedMessages.length - 1] = {
      ...lastMsg,
      text: `${lastMsg.text}\n\n🌐 [${target}]: ${translatedText}`
    };
    setMessages(updatedMessages);
    setIsTranslating(false);
  };

  if (isCalling) {
    return (
      <div className="fixed inset-0 z-[150] bg-[#0B2447] flex flex-col items-center justify-between p-10 text-center text-white animate-in zoom-in duration-300">
        <div className="space-y-3 pt-8">
          <div className="w-28 h-28 bg-[#116D6E] rounded-full mx-auto flex items-center justify-center shadow-2xl border-4 border-white/20 relative overflow-hidden">
            <span className="text-4xl font-black">{name[0]}</span>
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-4">{name}</h2>
          <p className="text-teal-300 font-black uppercase tracking-widest text-xs">
            Direct Artisan Voice Call • {formatDuration(callDuration)}
          </p>
          <a
            href="tel:+919876543210"
            className="inline-block text-[11px] font-bold text-amber-300 underline mt-1"
          >
            Dial via Carrier (`tel:+919876543210`)
          </a>
        </div>

        <div className="w-full max-w-xs bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/15 flex flex-col items-center gap-6">
          <div className="flex justify-around w-full">
            <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}>
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center">
              <Volume2 size={24} />
            </button>
          </div>
          <button onClick={() => setIsCalling(false)} className="w-18 h-18 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-2xl">
            <PhoneOff size={28} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F4F6F9] animate-in slide-in-from-bottom-8 duration-300">
      {/* Deep Navy Header */}
      <div className="px-4 py-3.5 bg-[#0B2447] text-white sticky top-0 z-10 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white">
              <X size={20} />
            </button>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#116D6E] flex items-center justify-center text-white font-black text-base border border-white/30">
                {name[0]}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0B2447] rounded-full" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-tight">{name}</h3>
              <div className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-teal-300" />
                <p className="text-[10px] font-bold text-teal-300">
                  {isWorkerResponding ? 'Worker is responding...' : isDirect ? 'Direct Artisan Chat' : 'Worker Voice Assistant (Multi-Lingual)'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href="tel:+919876543210"
              onClick={(e) => {
                e.preventDefault();
                setIsCalling(true);
              }}
              className="p-2.5 bg-[#116D6E] hover:bg-teal-600 text-white rounded-xl shadow-sm flex items-center gap-1 text-xs font-bold"
              title="Direct Call Worker"
            >
              <Phone size={15} />
            </a>
            {!isDirect && (
              <button 
                onClick={connectDirectly}
                className="bg-amber-400 text-slate-950 px-2.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm"
              >
                Direct Chat
              </button>
            )}
          </div>
        </div>

        {/* Multi-Lingual Language Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setSelectedLang(lang)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                selectedLang === lang
                  ? 'bg-[#116D6E] text-white border border-teal-300/40'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-xs text-xs font-medium leading-relaxed whitespace-pre-line ${
              m.sender === 'me' 
                ? 'bg-[#116D6E] text-white rounded-tr-none' 
                : m.sender === 'bot'
                ? 'bg-[#0B2447] text-white rounded-tl-none'
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
            }`}>
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-[9px] font-black uppercase tracking-wider opacity-75 flex items-center gap-1">
                  {m.sender === 'bot' && <Bot size={11} className="text-teal-300" />}
                  {m.sender === 'them' && <User size={11} className="text-emerald-600" />}
                  {m.sender === 'me' ? 'You' : m.sender === 'bot' ? 'AI Voice Assistant' : name}
                </span>
                {m.languageBadge && (
                  <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-white/15">
                    {m.languageBadge}
                  </span>
                )}
              </div>
              {m.text}
            </div>
            <div className="flex items-center gap-1 mt-1 px-1">
              <span className="text-[9px] font-bold text-slate-400">{m.timestamp}</span>
              {m.sender === 'me' && <CheckCheck size={12} className="text-[#116D6E]" />}
            </div>
          </div>
        ))}

        {/* "Worker is responding..." Live Indicator */}
        {isWorkerResponding && (
          <div className="flex flex-col items-start animate-in fade-in duration-200">
            <div className="bg-white text-slate-900 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-xs flex items-center gap-2.5">
              <Loader2 className="animate-spin text-[#116D6E]" size={15} />
              <span className="text-xs font-bold text-slate-700">
                Worker is responding...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Input Bar with Translate & Voice Input */}
      <div className="p-3.5 bg-white safe-bottom border-t border-slate-200">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={translateLastMessage}
            disabled={isTranslating}
            className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all"
            title="Translate Last Message"
          >
            <Languages size={19} className={isTranslating ? 'animate-spin text-[#116D6E]' : ''} />
          </button>

          <button
            type="button"
            onClick={handleVoiceDictation}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              isVoiceListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-teal-50 text-[#116D6E] hover:bg-teal-100'
            }`}
            title="Voice Input (Speak in Hindi/English/Regional)"
          >
            <Mic size={19} />
          </button>
          
          <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2">
            <input 
              type="text" 
              placeholder={isVoiceListening ? "Listening to your voice..." : `Message ${name.split(' ')[0]} in any language...`} 
              className="flex-1 bg-transparent outline-none text-xs font-semibold text-slate-900"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>

          <button 
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isWorkerResponding}
            className="w-11 h-11 bg-[#116D6E] hover:bg-[#0d5657] text-white rounded-2xl shadow-md flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
