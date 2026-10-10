import React, { useState } from 'react';
import { Tag, Check, Copy, Sparkles, X, Gift, ShieldCheck, Clock, Percent } from 'lucide-react';
import { AVAILABLE_COUPONS, Coupon } from '../services/couponService';

interface CouponCornerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCoupon?: (coupon: Coupon) => void;
  appliedCouponCode?: string;
  orderAmount?: number;
}

const CouponCornerModal: React.FC<CouponCornerModalProps> = ({
  isOpen,
  onClose,
  onApplyCoupon,
  appliedCouponCode,
  orderAmount = 650
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-3xl max-h-[88vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Gift size={26} className="text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">Coupon Corner</h2>
                <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                  Live Deals
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                Save big on your home services & emergency repairs
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-amber-50 border-b border-amber-100 px-5 py-2.5 flex items-center justify-between text-xs text-amber-900 font-medium">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-600" />
            <span>Select a coupon to apply instantly to your booking</span>
          </div>
          {orderAmount > 0 && (
            <span className="font-bold text-amber-800">Booking: ₹{orderAmount}</span>
          )}
        </div>

        {/* Coupon list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-gray-50/60">
          {AVAILABLE_COUPONS.map((coupon) => {
            const isApplied = appliedCouponCode?.toUpperCase() === coupon.code;
            const isEligible = orderAmount >= coupon.minOrderValue;

            return (
              <div 
                key={coupon.code}
                className={`relative bg-white rounded-2xl border transition-all overflow-hidden ${
                  isApplied 
                    ? 'border-green-500 shadow-md ring-2 ring-green-100' 
                    : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
                }`}
              >
                {/* Decorative cutouts (coupon ticket style) */}
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 border-r border-gray-200" />
                <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 border-l border-gray-200" />

                <div className="p-4 pl-6 pr-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 font-mono font-black text-sm rounded-lg tracking-wider border border-orange-200">
                          {coupon.code}
                        </span>
                        {coupon.badge && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500 text-white">
                            {coupon.badge}
                          </span>
                        )}
                        {isApplied && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-600 text-white flex items-center gap-1">
                            <Check size={10} /> Applied
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mt-1.5">{coupon.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{coupon.description}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {onApplyCoupon ? (
                        <button
                          onClick={() => {
                            if (isEligible) {
                              onApplyCoupon(coupon);
                              onClose();
                            }
                          }}
                          disabled={!isEligible}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                            isApplied
                              ? 'bg-green-600 text-white'
                              : isEligible
                              ? 'bg-orange-600 text-white hover:bg-orange-700 active:scale-95'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isApplied ? 'Applied' : isEligible ? 'Apply' : 'Min ₹' + coupon.minOrderValue}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-all"
                        >
                          {copiedCode === coupon.code ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          {copiedCode === coupon.code ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-dashed border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-gray-400" /> {coupon.expiryText}
                    </span>
                    <span>Min order: ₹{coupon.minOrderValue}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between safe-bottom">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldCheck size={14} className="text-green-600" />
            <span>100% Genuine Verified Indian Trade Coupons</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponCornerModal;
