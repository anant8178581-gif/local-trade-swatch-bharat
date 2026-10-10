import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Crown, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  HelpCircle, 
  ArrowRight, 
  Check, 
  Percent, 
  Users, 
  MapPin, 
  Zap,
  DollarSign
} from 'lucide-react';
import { WORKER_SUBSCRIPTION_PLANS, PRIORITY_LISTING_CONFIG, CUSTOMER_CONVENIENCE_FEE, ONBOARDING_SETUP_FEE } from '../services/subscriptionService';

interface FeeTransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWorkerSubscription?: () => void;
}

const FeeTransparencyModal: React.FC<FeeTransparencyModalProps> = ({
  isOpen,
  onClose,
  onOpenWorkerSubscription
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'worker' | 'customer'>('all');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[220] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              100% Transparent
            </span>
            <span className="text-emerald-300 text-xs font-bold">Zero Hidden Fees</span>
          </div>

          <h2 className="text-xl font-black tracking-tight">
            How Local Trades India Works
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Fair pricing for Indian skilled artisans and customers. The 0% commission revolution.
          </p>

          {/* Persona Filter Tabs */}
          <div className="flex bg-white/10 p-1 rounded-xl mt-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'all' ? 'bg-white text-slate-950 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              All 4 Pillars
            </button>
            <button
              onClick={() => setActiveTab('worker')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'worker' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              Artisan / Worker Fees
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'customer' ? 'bg-blue-600 text-white shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              Customer Fees
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Comparison Banner */}
          <div className="bg-emerald-50 border-2 border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                The Core Difference
              </span>
              <p className="text-xs font-bold text-emerald-950 mt-0.5">
                Aggregator apps charge <span className="text-red-600 line-through">20% to 30% commission</span>. We take <strong className="text-emerald-700">0% commission</strong>. Artisans keep 100% of customer payments!
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md">
              0% Cut
            </div>
          </div>

          {/* Pillar 1: Worker Subscriptions (Primary Driver) */}
          {(activeTab === 'all' || activeTab === 'worker') && (
            <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl tracking-wider">
                Pillar 1 • Primary Driver
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Crown size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    Worker Subscriptions (0% Commission)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Low-cost access pass so workers keep 100% of their money.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-200">
                  <span className="text-[10px] font-black uppercase text-emerald-700 block">Pro Monthly Pass</span>
                  <div className="text-base font-black text-gray-900 font-mono mt-0.5">₹99 <span className="text-[10px] text-gray-500 font-normal">/ month</span></div>
                  <p className="text-[10px] text-gray-600 mt-1 leading-snug">Unlimited bookings, verified badge, 0% platform commission.</p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-200">
                  <span className="text-[10px] font-black uppercase text-blue-700 block">Daily Flex Pass</span>
                  <div className="text-base font-black text-gray-900 font-mono mt-0.5">₹10 <span className="text-[10px] text-gray-500 font-normal">/ day</span></div>
                  <p className="text-[10px] text-gray-600 mt-1 leading-snug">Pay only when working. 24-hr access for part-time artisans.</p>
                </div>
              </div>

              <div className="text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-lg font-medium flex items-center gap-1.5">
                <Check size={14} className="text-emerald-600 flex-shrink-0" />
                <span>Major Selling Point: No cuts on labor, tips, or material expenses!</span>
              </div>
            </div>
          )}

          {/* Pillar 2: Customer Convenience Fee */}
          {(activeTab === 'all' || activeTab === 'customer') && (
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl tracking-wider">
                Pillar 2 • Customer Safety
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    Customer Convenience Fee: ₹20 – ₹40
                  </h3>
                  <p className="text-xs text-gray-500">
                    Charged only when a customer books a service (default: ₹29).
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-gray-500 block">What this tiny fee covers:</span>
                <div className="space-y-1 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-blue-600 flex-shrink-0" />
                    <span><strong>UIDAI Aadhaar & DigiLocker:</strong> Real identity verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-blue-600 flex-shrink-0" />
                    <span><strong>Live GPS & SOS:</strong> Real-time worker tracking & emergency response</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-blue-600 flex-shrink-0" />
                    <span><strong>Damage Protection:</strong> Up to ₹10,000 workmanship warranty</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pillar 3: One-Time Onboarding Fee */}
          {(activeTab === 'all' || activeTab === 'worker') && (
            <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl tracking-wider">
                Pillar 3 • Verification
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Award size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    One-Time Onboarding Fee: ₹150 – ₹300 (₹199)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Paid once by new workers when joining and completing KYC.
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                Covers the upfront cost of biometric liveness check, DigiLocker UIDAI verification, and prevents fake or fraudulent profiles from joining the network. Paid once for lifetime verified membership.
              </p>
            </div>
          )}

          {/* Pillar 4: Priority Visibility Listings */}
          {(activeTab === 'all' || activeTab === 'worker') && (
            <div className="bg-white border-2 border-purple-200 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl tracking-wider">
                Pillar 4 • Optional Boost
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Zap size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    Priority Visibility Listings: ₹50 / 3 Days
                  </h3>
                  <p className="text-xs text-gray-500">
                    Optional paid booster for artisans who want urgent gigs.
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>⭐ Top Search & Google Map Placement</span>
                </div>
                <p className="text-[11px] text-purple-800">
                  Workers who boost their listing are pinned to the top of local search results and map pins with a Gold Crown badge, getting 3x more bookings.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-all"
          >
            Close
          </button>

          {onOpenWorkerSubscription && (
            <button
              onClick={() => {
                onClose();
                onOpenWorkerSubscription();
              }}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Manage Worker Pass (₹99/mo)</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeTransparencyModal;
