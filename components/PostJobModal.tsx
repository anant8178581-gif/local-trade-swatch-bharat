
import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import { geminiService } from '../services/geminiService';
import { X, Sparkles, IndianRupee, ArrowRight, Loader2 } from 'lucide-react';

interface PostJobModalProps {
  onClose: () => void;
  onPost: (job: any) => void;
}

const PostJobModal: React.FC<PostJobModalProps> = ({ onClose, onPost }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    isEmergency: false,
    price: 0
  });
  const [isEstimating, setIsEstimating] = useState(false);

  const handleEstimate = async () => {
    setIsEstimating(true);
    const estimate = await geminiService.estimateJobFairPrice(formData.category, formData.description);
    setFormData(prev => ({ ...prev, price: estimate }));
    setIsEstimating(false);
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-black text-gray-900">Post a Local Gig</h3>
          <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <p className="text-gray-500 font-medium">What type of help do you need?</p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFormData({ ...formData, category: cat.id });
                      setStep(2);
                    }}
                    className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${formData.category === cat.id ? 'border-blue-600 bg-blue-50' : 'border-gray-50 hover:border-blue-100'}`}
                  >
                    <div className={`${cat.color} p-3 rounded-2xl`}>{cat.icon}</div>
                    <span className="text-xs font-bold text-gray-700 uppercase">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <div className="space-y-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Task Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Broken pipe in kitchen" 
                  className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-bold"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Describe the issue</label>
                <textarea 
                  rows={4}
                  placeholder="Please describe exactly what needs to be done..." 
                  className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-black font-medium"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <label className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded accent-red-600"
                  checked={formData.isEmergency}
                  onChange={e => setFormData({...formData, isEmergency: e.target.checked})}
                />
                <span className="text-sm font-bold text-red-700">This is an urgent emergency</span>
              </label>
              <button 
                onClick={handleEstimate}
                disabled={!formData.title || !formData.description || isEstimating}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isEstimating ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> AI Price Estimate</>}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IndianRupee size={40} />
                </div>
                <h4 className="text-3xl font-black text-gray-900">₹{formData.price}</h4>
                <p className="text-gray-500 font-medium">Fair Market Estimate</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Service Fee</span>
                  <span className="font-bold text-gray-900">₹0 (Launch Offer)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Worker Payout</span>
                  <span className="font-bold text-gray-900">₹{formData.price}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="text-xl font-black text-blue-600">₹{formData.price}</span>
                </div>
              </div>

              <button 
                onClick={() => onPost(formData)}
                className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-100 flex items-center justify-center gap-2"
              >
                Confirm & Post Gig <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostJobModal;
