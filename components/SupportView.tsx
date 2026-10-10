
import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  LifeBuoy,
  MessageCircle,
  FileText,
  Loader2,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

const FAQS = [
  {
    category: 'Verification',
    items: [
      { q: "How do I get the 'Gold Pro' badge?", a: "To earn the Gold Pro badge, you must complete both Aadhaar and PAN verification, and maintain a rating above 4.5 stars." },
      { q: "Is my Aadhaar data safe?", a: "Yes, we use UIDAI-certified 256-bit encryption. We never store your physical Aadhaar number; we only receive a verification token." }
    ]
  },
  {
    category: 'Payments',
    items: [
      { q: "When do I get paid for a job?", a: "Payments are settled instantly once the customer confirms completion. You can withdraw funds to your linked UPI ID at any time." },
      { q: "What is the service fee?", a: "Currently, LocalTrades is free for workers! We don't charge any commission during our launch phase." }
    ]
  }
];

const SupportView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Maps grounding state
  const [mapsQuery, setMapsQuery] = useState("");
  const [mapsResult, setMapsResult] = useState<{ text: string; links: { title: string; uri: string }[] } | null>(null);
  const [isMapsLoading, setIsMapsLoading] = useState(false);

  const handleAiAsk = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    const answer = await geminiService.getSupportAnswer(aiQuery);
    setAiAnswer(answer);
    setIsAiLoading(false);
  };

  const handleMapsSearch = async () => {
    if (!mapsQuery.trim()) return;
    setIsMapsLoading(true);
    
    // Get location
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const result = await geminiService.searchNearbyResources(
        mapsQuery, 
        pos.coords.latitude, 
        pos.coords.longitude
      );
      setMapsResult(result);
      setIsMapsLoading(false);
    }, () => {
      alert("Please enable location access to find nearby shops.");
      setIsMapsLoading(false);
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Support ticket created! We'll get back to you within 4 hours.");
      setContactForm({ subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col bg-gray-50 h-full animate-in fade-in duration-500 overflow-y-auto">
      {/* Support Hero */}
      <div className="p-8 bg-white border-b relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="relative z-10">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 mb-6">
            <LifeBuoy size={28} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">Support Hub</h2>
          <p className="text-gray-500 font-medium mt-3 text-sm">How can the LocalTrades team help you today?</p>
        </div>
      </div>

      <div className="p-6 space-y-8 pb-20">
        {/* Maps Grounding Section */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="flex items-center gap-2 mb-4">
             <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
               <MapPin size={18} />
             </div>
             <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Nearby Resources</h3>
          </div>
          <p className="text-sm font-bold text-gray-800 mb-6">Find real local shops (Hardware, Spare parts, etc.)</p>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search: Hardware store in Dadar..." 
                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-orange-100 transition-all font-medium text-sm"
                value={mapsQuery}
                onChange={(e) => setMapsQuery(e.target.value)}
              />
              <button 
                onClick={handleMapsSearch}
                disabled={isMapsLoading}
                className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
              >
                {isMapsLoading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
            
            {mapsResult && (
              <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 animate-in slide-in-from-top-4 duration-300">
                <p className="text-xs text-orange-900 leading-relaxed font-bold mb-4">{mapsResult.text}</p>
                <div className="space-y-2">
                  {mapsResult.links.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-orange-200 text-[10px] font-black uppercase text-orange-700 hover:bg-orange-100 transition-all"
                    >
                      <span>{link.title}</span>
                      <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Instant Assistant */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
             <Sparkles size={24} className="text-blue-600 opacity-20 group-hover:opacity-100 transition-opacity animate-pulse" />
          </div>
          <div className="flex items-center gap-2 mb-4">
             <span className="w-2 h-2 bg-blue-600 rounded-full" />
             <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Quick Platform Help</h3>
          </div>
          <p className="text-sm font-bold text-gray-800 mb-6">Aapka sawal puchiye (e.g. Verification kaise kare?)</p>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type your question..." 
                className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-sm"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
              />
              <button 
                onClick={handleAiAsk}
                disabled={isAiLoading}
                className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
              >
                {isAiLoading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
            
            {aiAnswer && (
              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 animate-in slide-in-from-top-4 duration-300">
                <p className="text-sm text-blue-900 leading-relaxed font-medium">{aiAnswer}</p>
              </div>
            )}
          </div>
        </div>

        {/* FAQs and other sections... */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Frequent Questions</h3>
            <button className="text-[10px] font-black text-blue-600 uppercase">View All</button>
          </div>
          <div className="space-y-3">
            {FAQS.map(cat => (
              <div key={cat.category} className="space-y-3">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2 mt-4">{cat.category}</p>
                {cat.items.map(item => (
                  <div key={item.q} className="bg-white border border-gray-100 rounded-[1.5rem] overflow-hidden">
                    <button 
                      onClick={() => setOpenFaq(openFaq === item.q ? null : item.q)}
                      className="w-full p-5 flex items-center justify-between text-left"
                    >
                      <span className="text-xs font-bold text-gray-900">{item.q}</span>
                      {openFaq === item.q ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {openFaq === item.q && (
                      <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                        <p className="text-xs text-gray-500 leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportView;
