
import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Wand2, ArrowLeft, Loader2, Download, Maximize2, Layers } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ImageSize, AspectRatio } from '../types';

const SIZES: ImageSize[] = ['1K', '2K', '4K'];
const ASPECT_RATIOS: AspectRatio[] = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

const CreativeHub: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<ImageSize>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  const checkKey = async () => {
    const active = await (window as any).aistudio.hasSelectedApiKey();
    if (!active) {
      await (window as any).aistudio.openSelectKey();
    }
    setHasKey(true);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    // Safety check for user key
    await checkKey();

    setIsGenerating(true);
    try {
      const { imageUrl } = await geminiService.generateProImage(prompt, size, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (e) {
      alert("Error generating image. Check your billing status.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300 overflow-y-auto">
      <header className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight leading-none">Creative Hub</h2>
            <p className="text-[10px] font-bold text-purple-200 uppercase tracking-widest mt-1">Nano Banana Pro</p>
          </div>
        </div>
        <Sparkles className="text-white opacity-20" />
      </header>

      <div className="p-6 space-y-8">
        {/* Output Canvas */}
        <div className="relative aspect-square bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group shadow-inner">
          {generatedImage ? (
            <>
              <img src={generatedImage} className="w-full h-full object-contain" alt="Generated" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                 <button className="p-4 bg-white rounded-2xl text-black hover:scale-110 transition-transform"><Download size={24} /></button>
                 <button className="p-4 bg-white rounded-2xl text-black hover:scale-110 transition-transform"><Maximize2 size={24} /></button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-sm text-gray-300">
                <ImageIcon size={40} />
              </div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Aapka visual yahan dikhega</p>
            </div>
          )}
          {isGenerating && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center">
               <Loader2 className="animate-spin text-purple-600 mb-4" size={48} />
               <h4 className="text-xl font-black text-gray-900 uppercase">Generating Masterpiece...</h4>
               <p className="text-xs text-gray-500 font-bold mt-2">Nano Banana Pro is processing pixels</p>
            </div>
          )}
        </div>

        {/* Configuration Controls */}
        <div className="space-y-6">
          <div className="space-y-3">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
               <Wand2 size={12} /> Visual Prompt
             </label>
             <textarea 
               placeholder="Describe your design (e.g. Modern living room with modular furniture, hyper-realistic, 8k)..." 
               className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-[1.5rem] outline-none transition-all font-medium text-sm min-h-[100px]"
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
             />
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-3">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <Layers size={12} /> Resolution
               </label>
               <div className="flex gap-2">
                 {SIZES.map(s => (
                   <button 
                     key={s} 
                     onClick={() => setSize(s)}
                     className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${size === s ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                   >
                     {s}
                   </button>
                 ))}
               </div>
             </div>
             <div className="space-y-3">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <Maximize2 size={12} /> Aspect Ratio
               </label>
               <div className="flex flex-wrap gap-2">
                 {ASPECT_RATIOS.slice(0, 4).map(ar => (
                   <button 
                     key={ar} 
                     onClick={() => setAspectRatio(ar)}
                     className={`px-3 py-2 rounded-xl text-[9px] font-black border transition-all ${aspectRatio === ar ? 'bg-purple-600 border-purple-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                   >
                     {ar}
                   </button>
                 ))}
               </div>
             </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Render Visual</>}
          </button>
          
          <p className="text-[9px] text-gray-400 text-center italic">
            *Nano Banana Pro requires a billing-enabled API key for high-quality generation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreativeHub;
