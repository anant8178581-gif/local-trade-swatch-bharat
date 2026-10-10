export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  badge?: string;
  categoryAllowed?: string;
  expiryText: string;
}

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: 'FIRST50',
    title: 'Flat ₹100 Off First Service',
    description: 'Special welcome discount for new customers on any home repair or trade.',
    discountType: 'flat',
    discountValue: 100,
    minOrderValue: 299,
    badge: 'WELCOME OFFER',
    expiryText: 'Valid for next 30 days'
  },
  {
    code: 'DESI20',
    title: '20% Off on Electrician & Plumber',
    description: 'Get 20% instant discount up to ₹150 on essential repair bookings.',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 399,
    maxDiscount: 150,
    badge: 'POPULAR',
    expiryText: 'Valid this week'
  },
  {
    code: 'MASTERRANGE',
    title: 'Mega ₹200 Off',
    description: 'Flat ₹200 discount on major repairs, renovations, painting or carpentry over ₹999.',
    discountType: 'flat',
    discountValue: 200,
    minOrderValue: 999,
    badge: 'BIG SAVINGS',
    expiryText: 'Valid till month end'
  },
  {
    code: 'MONSOON50',
    title: 'Flat ₹50 Instant Savings',
    description: 'Quick savings with no hassle on any booking over ₹200.',
    discountType: 'flat',
    discountValue: 50,
    minOrderValue: 200,
    badge: 'QUICK SAVE',
    expiryText: 'Valid today'
  },
  {
    code: 'SUPERTECH',
    title: '15% Off Appliance & AC Repair',
    description: 'Reliable cooling & AC gas refill servicing with verified technicians.',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 499,
    maxDiscount: 250,
    badge: 'VERIFIED PRO',
    expiryText: 'Limited quota'
  }
];

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message: string;
}

export function validateCoupon(code: string, currentTotal: number): CouponValidationResult {
  const cleanCode = code.trim().toUpperCase();
  const coupon = AVAILABLE_COUPONS.find(c => c.code === cleanCode);

  if (!coupon) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Coupon "${cleanCode}" is invalid. Please check the spelling or pick from Coupon Corner.`
    };
  }

  if (currentTotal < coupon.minOrderValue) {
    return {
      valid: false,
      coupon,
      discountAmount: 0,
      message: `Requires minimum booking amount of ₹${coupon.minOrderValue}. Current order: ₹${currentTotal}.`
    };
  }

  let discount = 0;
  if (coupon.discountType === 'flat') {
    discount = coupon.discountValue;
  } else {
    discount = Math.round((currentTotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  }

  // Ensure discount does not exceed current total
  discount = Math.min(discount, currentTotal);

  return {
    valid: true,
    coupon,
    discountAmount: discount,
    message: `🎉 Coupon "${coupon.code}" applied! You saved ₹${discount}.`
  };
}
