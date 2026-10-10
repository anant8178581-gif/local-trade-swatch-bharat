
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, ArrowLeft, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';

const LiveVoiceSession: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState("");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Decoding raw PCM to AudioBuffer
  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(outputAudioContextRef.current.destination);

      const sessionPromise = geminiService.connectLiveVoice({
        onopen: () => {
          setIsConnecting(false);
          setIsActive(true);
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
            
            const binary = String.fromCharCode(...new Uint8Array(int16.buffer));
            const base64 = btoa(binary);
            
            sessionPromise.then((session) => {
              session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextRef.current!.destination);
        },
        onmessage: async (msg) => {
          if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            const base64 = msg.serverContent.modelTurn.parts[0].inlineData.data;
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

            const buffer = await decodeAudioData(bytes, outputAudioContextRef.current!);
            const source = outputAudioContextRef.current!.createBufferSource();
            source.buffer = buffer;
            source.connect(outputAudioContextRef.current!.destination);
            
            const start = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
            source.start(start);
            nextStartTimeRef.current = start + buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
          if (msg.serverContent?.outputTranscription) {
            setTranscription(prev => (prev + " " + msg.serverContent.outputTranscription.text).slice(-150));
          }
        },
        onerror: (e) => console.error(e),
        onclose: () => stopSession()
      });

      sessionRef.current = await sessionPromise;
    } catch (e) {
      alert("Microphone access is required for Live Voice.");
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    audioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    setIsActive(false);
    setIsConnecting(false);
    onBack();
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[150] bg-[#2D4356] flex flex-col items-center justify-between p-12 text-center text-white animate-in zoom-in duration-500">
      <div className="w-full flex justify-start">
        <button onClick={onBack} className="p-4 bg-white/10 rounded-2xl">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="relative">
          <div className={`w-48 h-48 bg-white/10 rounded-[4rem] flex items-center justify-center relative ${isActive ? 'animate-pulse' : ''}`}>
             <div className={`absolute inset-0 bg-blue-500 rounded-[4rem] blur-3xl opacity-20 ${isActive ? 'animate-[ping_3s_infinite]' : ''}`} />
             <Mic size={80} className={isActive ? 'text-blue-400' : 'text-white/40'} />
          </div>
          {isActive && (
            <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-2 rounded-xl animate-bounce">
              <Sparkles size={20} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-black tracking-tight">
            {isConnecting ? "Establishing Live Link..." : isActive ? "Listening..." : "Local Trades Native Audio"}
          </h2>
          <p className="text-blue-200 font-bold uppercase tracking-[0.3em] text-[10px]">
            {isActive ? "Real-time conversation active" : "Gemini 2.5 Native Audio Engine"}
          </p>
          {transcription && (
            <div className="max-w-xs mx-auto p-4 bg-white/5 rounded-2xl border border-white/10 italic text-sm text-white/60">
              "{transcription}..."
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-8">
        {!isActive && !isConnecting ? (
          <button 
            onClick={startSession}
            className="w-full py-6 bg-blue-600 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
          >
            Start Conversation
          </button>
        ) : (
          <div className="flex gap-6">
            <button className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center">
              <Volume2 size={32} />
            </button>
            <button 
              onClick={stopSession}
              className="w-24 h-24 bg-red-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-red-500/40 active:scale-90 transition-all"
            >
              <PhoneOff size={40} />
            </button>
            <button className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center">
              <MicOff size={32} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveVoiceSession;
