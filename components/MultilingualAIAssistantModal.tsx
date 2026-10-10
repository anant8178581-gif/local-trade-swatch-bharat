import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Globe, 
  Languages, 
  RefreshCw, 
  Bot, 
  User, 
  Trash2, 
  Camera, 
  MapPin, 
  Utensils, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  FileText,
  Image as ImageIcon,
  Plus,
  Upload
} from 'lucide-react';
import { geminiService, ChatMessageContext } from '../services/geminiService';
import LiveCameraModal from './LiveCameraModal';

export interface MultilingualAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: 'hygiene' | 'nutrition' | 'general';
  userMode?: 'customer' | 'worker';
  userLocation?: string;
  onNavigateToHygiene?: () => void;
  onNavigateToNutrition?: () => void;
}

export const INDIAN_LANGUAGES = [
  { id: 'Hinglish', label: 'Hinglish', sublabel: 'Hindi + English', speechCode: 'hi-IN', flag: '🇮🇳' },
  { id: 'Hindi', label: 'हिंदी', sublabel: 'Hindi', speechCode: 'hi-IN', flag: '🇮🇳' },
  { id: 'English', label: 'English', sublabel: 'Indian English', speechCode: 'en-IN', flag: '🌐' },
  { id: 'Bengali', label: 'বাংলা', sublabel: 'Bengali', speechCode: 'bn-IN', flag: '🇮🇳' },
  { id: 'Marathi', label: 'मराठी', sublabel: 'Marathi', speechCode: 'mr-IN', flag: '🇮🇳' },
  { id: 'Telugu', label: 'తెలుగు', sublabel: 'Telugu', speechCode: 'te-IN', flag: '🇮🇳' },
  { id: 'Tamil', label: 'தமிழ்', sublabel: 'Tamil', speechCode: 'ta-IN', flag: '🇮🇳' },
  { id: 'Gujarati', label: 'ગુજરાતી', sublabel: 'Gujarati', speechCode: 'gu-IN', flag: '🇮🇳' },
  { id: 'Kannada', label: 'ಕನ್ನಡ', sublabel: 'Kannada', speechCode: 'kn-IN', flag: '🇮🇳' },
  { id: 'Malayalam', label: 'മലയാളം', sublabel: 'Malayalam', speechCode: 'ml-IN', flag: '🇮🇳' },
  { id: 'Punjabi', label: 'ਪੰਜਾਬੀ', sublabel: 'Punjabi', speechCode: 'pa-IN', flag: '🇮🇳' },
  { id: 'Odia', label: 'ଓଡ଼ିଆ', sublabel: 'Odia', speechCode: 'or-IN', flag: '🇮🇳' },
  { id: 'Urdu', label: 'اردو', sublabel: 'Urdu', speechCode: 'ur-IN', flag: '🇮🇳' }
];

interface ChatMsg {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  photoUrl?: string;
}

export const MultilingualAIAssistantModal: React.FC<MultilingualAIAssistantModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'general',
  userMode = 'customer',
  userLocation = 'Mayur Vihar, Delhi 110091',
  onNavigateToHygiene,
  onNavigateToNutrition
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Hinglish');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Photo Add-on States
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [photoPreviewLabel, setPhotoPreviewLabel] = useState<string | null>(null);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState<boolean>(false);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Quick Preset Sample Photos for Fast Testing
  const SAMPLE_AI_PHOTOS = [
    { label: 'Dirty Waste Spot', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=500&auto=format&fit=crop&q=80', prompt: 'Is dirty place ka photo MCD ko kaise bhejein?' },
    { label: 'Indian Thali Food', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80', prompt: 'Is thali mein kitni calories aur protein hai?' },
    { label: 'Stagnant Drain Water', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=500&auto=format&fit=crop&q=80', prompt: 'Yeh stagnant dengue water breeding spot hai, turant shikayat kaise karein?' }
  ];

  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setAttachedPhoto(ev.target.result as string);
          setPhotoPreviewLabel(file.name || 'Captured Photo');
          setShowPhotoMenu(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const initialGreeting = (): string => {
    if (selectedLanguage === 'Hindi') {
      return `नमस्ते! मैं आपका 'स्वच्छता और पोषण एआई साथी' हूँ। आप मुझसे किसी भी भाषा में पूछ सकते हैं - गंदी जगह की फोटो खींचकर नगर निगम (MCD) को कैसे भेजें, या अपनी डाइट चार्ट और 2,400 कैलोरी का लक्ष्य कैसे पूरा करें!`;
    }
    if (selectedLanguage === 'Bengali') {
      return `নমস্কার! আমি আপনার 'স্বচ্ছতা এবং পুষ্টি এআই সহকারী'। আপনি ময়লা জায়গার ছবি তুলে কীভাবে সরকারকে অভিযোগ পাঠাবেন বা ডায়েট চার্ট কীভাবে তৈরি করবেন তা যেকোনো ভাষায় জানতে পারেন!`;
    }
    if (selectedLanguage === 'Marathi') {
      return `नमस्कार! मी आपला 'स्वच्छता आणि पोषण एआय मित्र' आहे. घाणेरड्या जागेचा फोटो काढून महानगरपालिकेला तक्रार कशी पाठवायची किंवा डाएट चार्ट कसा बनवायचा, मला विचारा!`;
    }
    if (selectedLanguage === 'Tamil') {
      return `வணக்கம்! நான் உங்கள் தூய்மை மற்றும் ஊட்டச்சத்து AI உதவியாளர். கழிவுநீரை அரசுக்கு எவ்வாறு புகார் செய்வது அல்லது டயட் சார்ட் உருவாக்குவது குறித்து என்னிடம் கேட்கலாம்!`;
    }
    if (selectedLanguage === 'Telugu') {
      return `నమస్కారం! నేను మీ స్వచ్ఛత & పోషకాహార AI మిత్రుడిని. మురుగు నీటి ఫోటో తీసి ప్రభుత్వానికి ఎలా పంపాలి లేదా డైట్ చార్ట్ ఎలా తయారు చేయాలో అడగండి!`;
    }
    if (selectedLanguage === 'Gujarati') {
      return `નમસ્તે! હું તમારો સ્વચ્છતા અને પોષણ એઆઈ મિત્ર છું. ગંદકીનો ફોટો પાડીને સરકારને કેવી રીતે મોકલવો અથવા ડાયેટ ચાર્ટ કેવી રીતે બનાવવો તે પૂછો!`;
    }
    if (selectedLanguage === 'Punjabi') {
      return `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਸਵੱਛਤਾ ਅਤੇ ਪੋਸ਼ਣ ਏਆਈ ਮਿੱਤਰ ਹਾਂ। ਗੰਦੀ ਥਾਂ ਦੀ ਫੋਟੋ ਖਿੱਚ ਕੇ ਸਰਕਾਰ ਨੂੰ ਕਿਵੇਂ ਭੇਜਣੀ ਹੈ ਜਾਂ ਡਾਈਟ ਚਾਰਟ ਕਿਵੇਂ ਬਣਾਉਣਾ ਹੈ, ਮੈਨੂੰ ਪੁੱਛੋ!`;
    }
    if (selectedLanguage === 'Urdu') {
      return `آداب! میں آپ کا صفائی اور غذائیت کا اے آئی ساتھی ہوں۔ گندگی کی تصویر لے کر حکومت کو بھیجنے یا ڈائٹ چارٹ بنانے کے بارے میں کچھ بھی پوچھیں!`;
    }
    return `Namaste! Main hoon aapka Swachhata & Nutrition AI Mitra. Main sabhi Indian languages mein baat kar sakta hoon. Dirty place ka photo sarkar ko kaise send karein, ya apni thali ka exact calorie/diet chart kaise banayein, poochiye!`;
  };

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'msg-0',
      sender: 'assistant',
      text: initialGreeting(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Update greeting when language changes if only 1 message
  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === 'assistant') {
      setMessages([
        {
          id: 'msg-0',
          sender: 'assistant',
          text: initialGreeting(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [selectedLanguage]);

  // Scroll to bottom on message update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Stop speech when modal closes
  useEffect(() => {
    if (!isOpen && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  // Web Speech API Text-to-Speech
  const speakText = (text: string, langName: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const langConfig = INDIAN_LANGUAGES.find(l => l.id === langName);
      utterance.lang = langConfig?.speechCode || 'hi-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setIsSpeaking(false);
    }
  };

  // Web Speech API Voice Recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please type your query.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langConfig = INDIAN_LANGUAGES.find(l => l.id === selectedLanguage);
      recognition.lang = langConfig?.speechCode || 'hi-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setSpeechError(`Microphone error (${event.error}). Please type below.`);
        setTimeout(() => setSpeechError(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
      setSpeechError('Could not access microphone.');
      setTimeout(() => setSpeechError(null), 4000);
    }
  };

  const handleSendMessage = async (textToSend?: string, directPhoto?: string) => {
    const rawText = (textToSend || inputMessage).trim();
    const photoToInclude = directPhoto || attachedPhoto;
    if ((!rawText && !photoToInclude) || isProcessing) return;

    const text = rawText || (photoToInclude ? 'Please analyze this photo for me and provide full details.' : '');

    const userMsg: ChatMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      photoUrl: photoToInclude || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setAttachedPhoto(null);
    setPhotoPreviewLabel(null);
    setIsProcessing(true);

    try {
      // Build history context
      const historyContext: ChatMessageContext[] = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text
      }));

      const queryContext = photoToInclude
        ? `[User attached a photo/snapshot]: ${text}`
        : text;

      const reply = await geminiService.chatMultilingualAssistant(
        queryContext,
        historyContext,
        selectedLanguage,
        userMode === 'worker' ? 'worker' : 'customer'
      );

      const botMsg: ChatMsg = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);

      // Speak answer aloud if speech is enabled
      if (speechEnabled) {
        speakText(reply, selectedLanguage);
      }
    } catch (err) {
      console.error('Chat Assistant error:', err);
      const errorMsg: ChatMsg = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `Swachhata & Nutrition Service update: You can click the photo of any dirty spot in Column 2 to dispatch to MCD, or scan your food plate in Column 3 to calculate exact calories and generate your diet chart!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const QUICK_QUESTIONS = [
    {
      topic: 'hygiene',
      icon: <Camera size={12} className="text-red-500" />,
      label: 'Photo to Govt',
      prompt: 'गंदी जगह की फोटो खींचकर नगर निगम (MCD) को कैसे भेजें?'
    },
    {
      topic: 'hygiene',
      icon: <AlertTriangle size={12} className="text-amber-500" />,
      label: '7-Day SLA Track',
      prompt: 'How does the 7-day Government Escalation to District Collector work?'
    },
    {
      topic: 'nutrition',
      icon: <Flame size={12} className="text-teal-600" />,
      label: '2,400 kcal Goal',
      prompt: 'मजदूरों के लिए 2,400 कैलोरी और 65g प्रोटीन का ₹70 वाला डाइट चार्ट बताओ'
    },
    {
      topic: 'nutrition',
      icon: <Utensils size={12} className="text-emerald-600" />,
      label: 'Plate Calories',
      prompt: '2 रोटी, दाल और आलू की सब्जी में कितनी कैलोरी और पोषण होता है?'
    }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[250] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh] max-h-[720px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-[#0F172A] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-[#0F172A] rounded-[0.85rem] flex items-center justify-center text-amber-400">
                <Sparkles size={20} className={isProcessing ? 'animate-spin' : ''} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Swachhata & Nutrition AI Mitra
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-full">
                  ALL LANGUAGES
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Talk in your mother tongue: Report dirty places to Govt & Get exact food calories & diet charts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Speech Toggle */}
            <button
              type="button"
              onClick={() => {
                if (speechEnabled) {
                  window.speechSynthesis?.cancel();
                  setIsSpeaking(false);
                }
                setSpeechEnabled(!speechEnabled);
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                speechEnabled 
                  ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500/40 hover:bg-emerald-600/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={speechEnabled ? 'Voice Readout Enabled' : 'Voice Readout Muted'}
            >
              {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="text-[10px] hidden sm:inline">{speechEnabled ? 'Voice ON' : 'Muted'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Language Selection Ribbon (Horizontal Scrollable) */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <div className="flex items-center gap-1 text-[11px] font-black uppercase text-amber-400 flex-shrink-0 mr-1">
            <Globe size={13} />
            <span>Select Language:</span>
          </div>
          {INDIAN_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => {
                setSelectedLanguage(lang.id);
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                setIsSpeaking(false);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${
                selectedLanguage === lang.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              <span className="text-[9px] opacity-70">({lang.sublabel})</span>
            </button>
          ))}
        </div>

        {/* Live Audio / Speaking Indicator Bar */}
        {(isSpeaking || isListening) && (
          <div className="bg-gradient-to-r from-emerald-600 via-amber-500 to-orange-500 text-white px-4 py-1.5 flex items-center justify-between text-xs font-bold animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>
                {isListening ? `Listening in ${selectedLanguage}... Speak into microphone!` : `Speaking in ${selectedLanguage}...`}
              </span>
            </div>
            {isSpeaking && (
              <button
                type="button"
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setIsSpeaking(false);
                }}
                className="text-[10px] bg-black/40 hover:bg-black/60 px-2 py-0.5 rounded-md font-bold"
              >
                Stop Voice
              </button>
            )}
          </div>
        )}

        {/* Speech Error Banner if any */}
        {speechError && (
          <div className="bg-red-50 text-red-700 px-4 py-1.5 text-xs font-bold border-b border-red-200 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Chat Conversation Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-amber-400 flex items-center justify-center flex-shrink-0 shadow-xs mt-1">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] p-3.5 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-[#0F172A] text-white rounded-br-xs shadow-sm'
                    : 'bg-white border border-slate-200/90 text-slate-900 rounded-bl-xs shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1 border-b border-black/5 pb-1">
                  <span className={`text-[10px] font-black uppercase ${
                    msg.sender === 'user' ? 'text-amber-400' : 'text-slate-500'
                  }`}>
                    {msg.sender === 'user' ? 'You' : `AI Mitra (${selectedLanguage})`}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] ${msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                    {msg.sender === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.text, selectedLanguage)}
                        className="text-slate-400 hover:text-emerald-600 p-0.5"
                        title="Read this reply aloud"
                      >
                        <Volume2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {msg.photoUrl && (
                  <div className="mb-2.5 rounded-xl overflow-hidden border border-black/10 max-w-xs shadow-xs">
                    <img 
                      src={msg.photoUrl} 
                      alt="Attached Photo" 
                      className="w-full max-h-48 object-cover" 
                    />
                    <div className="p-1 bg-black/70 text-amber-300 font-mono text-[9px] px-2 flex items-center justify-between">
                      <span>📸 Attached Photo</span>
                      <span>Analyzed by AI</span>
                    </div>
                  </div>
                )}

                <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-line font-medium">
                  {msg.text}
                </p>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-xs mt-1 font-bold">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold pl-1 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-amber-400 flex items-center justify-center flex-shrink-0">
                <RefreshCw size={14} className="animate-spin" />
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
                <span>AI Mitra is analyzing photo and query in {selectedLanguage}...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-[10px] font-black uppercase text-slate-400 flex-shrink-0">
            Quick Topics:
          </span>
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q.prompt)}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold whitespace-nowrap flex items-center gap-1.5 transition-all flex-shrink-0 active:scale-95 shadow-2xs cursor-pointer"
            >
              {q.icon}
              <span>{q.label}</span>
            </button>
          ))}
        </div>

        {/* Attached Photo Preview Tray */}
        {attachedPhoto && (
          <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-200 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={attachedPhoto} 
                alt="Attached Preview" 
                className="w-11 h-11 rounded-xl object-cover border-2 border-amber-400 shadow-xs flex-shrink-0" 
              />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-amber-900 block flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-600" />
                  <span>Photo Ready for AI Analysis</span>
                </span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {photoPreviewLabel || 'Camera Photo'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachedPhoto(null);
                setPhotoPreviewLabel(null);
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-all"
              title="Remove attached photo"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Photo Selection Menu Drawer */}
        {showPhotoMenu && (
          <div className="p-3 bg-slate-900 text-white border-t border-slate-800 space-y-2.5 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Photo Add-on Options for AI Mitra:
              </span>
              <button
                type="button"
                onClick={() => setShowPhotoMenu(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPhotoMenu(false);
                  setIsLiveCameraOpen(true);
                }}
                className="py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Camera size={15} />
                <span>Click with Camera</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer active:scale-95"
              >
                <Upload size={15} className="text-teal-400" />
                <span>Upload from Files</span>
              </button>
            </div>

            {/* Quick Sample Photos */}
            <div className="pt-1 border-t border-white/10">
              <span className="text-[9px] font-bold text-slate-400 block mb-1.5">Or try a sample photo:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {SAMPLE_AI_PHOTOS.map((sp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAttachedPhoto(sp.url);
                      setPhotoPreviewLabel(sp.label);
                      setInputMessage(sp.prompt);
                      setShowPhotoMenu(false);
                    }}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-left border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <img src={sp.url} alt={sp.label} className="w-6 h-6 rounded-md object-cover flex-shrink-0" />
                    <span className="text-[10px] text-slate-200 truncate">{sp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hidden File Inputs */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoFileSelect}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoFileSelect}
        />

        {/* Chat Input & Voice Trigger Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          {/* Photo Add-on Button */}
          <button
            type="button"
            onClick={() => setShowPhotoMenu(!showPhotoMenu)}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95 flex-shrink-0 cursor-pointer border ${
              attachedPhoto
                ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Add Photo for AI Mitra (Camera or Upload)"
          >
            <Camera size={19} className={attachedPhoto ? 'text-amber-800' : 'text-slate-700'} />
          </button>

          {/* Microphone Voice Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 flex-shrink-0 cursor-pointer ${
              isListening
                ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title={isListening ? 'Click to stop listening' : `Talk in ${selectedLanguage} (Voice Input)`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={attachedPhoto ? `Ask about this photo in ${selectedLanguage}...` : `Ask in ${selectedLanguage} (or add photo)...`}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 outline-none focus:border-amber-500 focus:bg-white font-medium"
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={(!inputMessage.trim() && !attachedPhoto) || isProcessing}
            className="w-11 h-11 rounded-2xl bg-[#0F172A] hover:bg-slate-800 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md active:scale-95 flex-shrink-0 cursor-pointer"
            title="Send query to AI Mitra"
          >
            <Send size={18} className="text-amber-400" />
          </button>
        </div>

        {/* Live In-App Camera Viewfinder Modal */}
        <LiveCameraModal
          isOpen={isLiveCameraOpen}
          onClose={() => setIsLiveCameraOpen(false)}
          onCapture={(photoDataUrl) => {
            setAttachedPhoto(photoDataUrl);
            setPhotoPreviewLabel('Live Camera Snapshot');
          }}
          title="AI Mitra Camera"
          subtitle="Click photo of dirty place, food plate, or trade repair for AI analysis"
          watermarkText={`AI MITRA SNAP • ${userLocation} • ${new Date().toLocaleTimeString('en-IN')}`}
        />
      </div>
    </div>
  );
};

export default MultilingualAIAssistantModal;
