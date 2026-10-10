import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Crown, 
  Clock, 
  Percent, 
  Smartphone, 
  ChevronRight, 
  Award, 
  Rocket, 
  ArrowUpRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Worker } from '../types';
import { WORKER_SUBSCRIPTION_PLANS, PRIORITY_LISTING_CONFIG } from '../services/subscriptionService';
import UpiPaymentModal from './UpiPaymentModal';

interface WorkerSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker;
  onUpdateWorkerSubscription: (
    workerId: string, 
    plan: 'daily' | 'monthly', 
    expiresAt: string
  ) => void;
  onActivatePriorityListing: (
    workerId: string, 
    expiresAt: string
  ) => void;
}

const WorkerSubscriptionModal: React.FC<WorkerSubscriptionModalProps> = ({
  isOpen,
  onClose,
  worker,
  onUpdateWorkerSubscription,
  onActivatePriorityListing
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'monthly' | 'daily'>(
    worker.subscriptionPlan === 'daily' ? 'daily' : 'monthly'
  );
  const [activeTab, setActiveTab] = useState<'subscription' | 'priority_boost'>('subscription');
  const [upiPaymentConfig, setUpiPaymentConfig] = useState<{
    isOpen: boolean;
    amount: number;
    title: string;
    type: 'plan' | 'priority';
  }>({
    isOpen: false,
    amount: 99,
    title: 'Pro Artisan Monthly Pass (0% Commission)',
    type: 'plan'
  });
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlan = WORKER_SUBSCRIPTION_PLANS.find(p => p.id === selectedPlanId) || WORKER_SUBSCRIPTION_PLANS[0];

  const handleBuyPlan = () => {
    setUpiPaymentConfig({
      isOpen: true,
      amount: currentPlan.price,
      title: `${currentPlan.name} (${currentPlan.durationLabel})`,
      type: 'plan'
    });
  };

  const handleBuyPriorityBoost = () => {
    setUpiPaymentConfig({
      isOpen: true,
      amount: PRIORITY_LISTING_CONFIG.price,
      title: 'Priority Visibility Boost (3 Days Top Listing)',
      type: 'priority'
    });
  };

  const handlePaymentSuccess = () => {
    if (upiPaymentConfig.type === 'plan') {
      const now = new Date();
      now.setDate(now.getDate() + (selectedPlanId === 'monthly' ? 30 : 1));
      const expStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      onUpdateWorkerSubscription(worker.id, selectedPlanId, expStr);
      setSuccessToast(`🎉 ${currentPlan.name} Activated! You enjoy 0% commission till ${expStr}.`);
    } else {
      const now = new Date();
      now.setDate(now.getDate() + 3);
      const expStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      onActivatePriorityListing(worker.id, expStr);
      setSuccessToast(`🚀 Profile Boosted! You are now featured at the top of local searches & Google Map.`);
    }

    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  return (
    <>
      <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
        <div 
          className="w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
                <Crown size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black tracking-tight">Artisan Growth & Plans</h3>
                  <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    0% Commission
                  </span>
                </div>
                <p className="text-xs text-blue-200">Keep 100% of every rupee you earn from customers</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Toast Notification */}
          {successToast && (
            <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in slide-in-from-top">
              <CheckCircle2 size={16} />
              <span>{successToast}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="p-3 bg-gray-100/90 border-b border-gray-200 flex gap-2 text-xs font-black">
            <button
              onClick={() => setActiveTab('subscription')}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'subscription' 
                  ? 'bg-white text-blue-950 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Percent size={14} className="text-emerald-600" />
              <span>0% Commission Passes</span>
            </button>
            <button
              onClick={() => setActiveTab('priority_boost')}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'priority_boost' 
                  ? 'bg-white text-blue-950 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Rocket size={14} className="text-orange-500" />
              <span>Priority Listing (₹50)</span>
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gray-50/50">
            {activeTab === 'subscription' ? (
              <>
                {/* 0% Commission Hero Value Card */}
                <div className="p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 rounded-3xl border-2 border-emerald-300 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                      The Local Trades Promise
                    </span>
                    <span className="text-2xl font-black text-emerald-700">0% CUT</span>
                  </div>
                  <h4 className="text-lg font-black text-emerald-950 leading-tight">
                    Zero Commission on Every Job
                  </h4>
                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                    Unlike other aggregator apps that take 20% to 30% of your hard-earned wages, Local Trades India only charges a small flat pass. <strong>All money paid by the customer is 100% yours.</strong>
                  </p>

                  <div className="mt-2 pt-2 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-bold">
                    <span>Average Monthly Savings:</span>
                    <span className="text-emerald-800 font-black">₹4,500 - ₹8,000 Saved</span>
                  </div>
                </div>

                {/* Plan Selector Buttons */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase text-gray-400 tracking-wider block">
                    Choose Your Access Pass
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    {WORKER_SUBSCRIPTION_PLANS.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`p-4 rounded-3xl border-2 cursor-pointer transition-all relative ${
                            isSelected 
                              ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-100' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          {plan.id === 'monthly' && (
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                              Best Value
                            </span>
                          )}

                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-700">{plan.name}</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check size={12} />}
                            </div>
                          </div>

                          <div className="mt-1">
                            <span className="text-2xl font-black text-gray-950">₹{plan.price}</span>
                            <span className="text-xs text-gray-500 font-bold block">{plan.durationLabel}</span>
                          </div>

                          <p className="text-[10px] text-gray-500 mt-2 font-medium">
                            {plan.id === 'monthly' ? '₹3.3 per day • Full 30 days access' : 'Flexible 24-hr day access'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Plan Details & Included Features */}
                <div className="p-4 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-gray-900 text-xs uppercase tracking-wide">
                      What's Included in {currentPlan.name}
                    </h5>
                    <span className="text-xs font-black text-emerald-600">0% Commission</span>
                  </div>

                  <ul className="space-y-2">
                    {currentPlan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 font-medium">
                        <Check size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {worker.subscriptionActive && (
                    <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900">
                      <span>Current Active Plan:</span>
                      <span className="font-bold">Active till {worker.subscriptionExpiresAt || '30 days'}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Priority Visibility Boost Tab */
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl shadow-lg relative overflow-hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                      Priority Growth Tool
                    </span>
                    <span className="text-2xl font-black">₹50 / 3 Days</span>
                  </div>

                  <div>
                    <h4 className="text-xl font-black leading-tight">
                      Boost Profile to Top of Local Search & Google Maps
                    </h4>
                    <p className="text-xs text-white/90 mt-1 leading-relaxed">
                      Stand out from other artisans! Get placed at the very top of customer search lists and Google Map pins with an exclusive "Featured Top Pro" golden badge.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
                    <div>
                      <span className="text-lg font-black block">3x - 5x</span>
                      <span className="text-[10px] text-white/80">More Job Inquiries</span>
                    </div>
                    <div>
                      <span className="text-lg font-black block">Top #1</span>
                      <span className="text-[10px] text-white/80">Ranked in Dadar/Area</span>
                    </div>
                    <div>
                      <span className="text-lg font-black block">3 Days</span>
                      <span className="text-[10px] text-white/80">Active Duration</span>
                    </div>
                  </div>
                </div>

                {/* Mock Search Preview */}
                <div className="p-4 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-2.5">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                    How Customers Will See Your Profile
                  </span>

                  <div className="p-3 bg-amber-50/70 border-2 border-amber-300 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={worker.photoUrl} 
                          alt={worker.name} 
                          className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400"
                        />
                        <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full">
                          <Crown size={10} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-black text-gray-900 text-xs">{worker.name}</h5>
                          <span className="bg-amber-400 text-slate-950 text-[8px] font-black uppercase px-1.5 py-0.2 rounded">
                            FEATURED PRO
                          </span>
                        </div>
                        <span className="text-[11px] text-blue-700 font-bold block">{worker.skills.join(', ')}</span>
                        <span className="text-[10px] text-emerald-700 font-bold">Top Ranked Artisan in Area</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-gray-900 block">⭐ 4.9</span>
                      <span className="text-[10px] text-gray-500">1st Result</span>
                    </div>
                  </div>
                </div>

                {worker.isPriorityFeatured && (
                  <div className="p-3.5 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between text-xs text-green-900 font-bold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-600" />
                      <span>Priority Listing is Currently Active!</span>
                    </div>
                    <span>Till {worker.priorityFeaturedExpiresAt || '3 days'}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-white border-t border-gray-200 safe-bottom">
            {activeTab === 'subscription' ? (
              <button
                onClick={handleBuyPlan}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-emerald-700/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Activate {currentPlan.name} • ₹{currentPlan.price}</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleBuyPriorityBoost}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-orange-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Rocket size={16} />
                <span>Boost Profile for 3 Days • ₹{PRIORITY_LISTING_CONFIG.price}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* UPI Payment Modal Integration */}
      <UpiPaymentModal
        isOpen={upiPaymentConfig.isOpen}
        onClose={() => setUpiPaymentConfig(prev => ({ ...prev, isOpen: false }))}
        amount={upiPaymentConfig.amount}
        serviceTitle={upiPaymentConfig.title}
        workerName={worker.name}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default WorkerSubscriptionModal;
