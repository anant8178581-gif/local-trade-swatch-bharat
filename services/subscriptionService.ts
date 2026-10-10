// Pricing, Worker Subscriptions & Monetization Model for Local Trades India

export interface WorkerSubscriptionPlan {
  id: 'daily' | 'monthly';
  name: string;
  price: number;
  durationLabel: string;
  durationDays: number;
  highlight: string;
  features: string[];
}

export const WORKER_SUBSCRIPTION_PLANS: WorkerSubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Pro Artisan Monthly Pass',
    price: 99,
    durationLabel: '₹99 / month',
    durationDays: 30,
    highlight: 'MOST POPULAR • BEST VALUE',
    features: [
      '0% Commission on all customer earnings — Keep 100% money',
      'Unlimited customer booking requests in your city',
      'Direct customer calls & live GPS navigation',
      'Verified Pro Badge with DigiLocker QR on your profile',
      'Instant UPI payouts directly to your bank account'
    ]
  },
  {
    id: 'daily',
    name: 'Daily Flex Pass',
    price: 10,
    durationLabel: '₹10 / day',
    durationDays: 1,
    highlight: 'FLEXIBLE WORK DAYS',
    features: [
      '0% Commission — All job payments go straight to you',
      '24-Hour full access to emergency & local gigs',
      'Great for part-time artisans and weekend trades',
      'Pay only on the days you want to work'
    ]
  }
];

// Priority Visibility Listing Pricing
export const PRIORITY_LISTING_CONFIG = {
  price: 50,
  durationDays: 3,
  title: 'Priority Top Visibility Boost',
  badge: '⭐ TOP FEATURED PRO',
  description: 'Highlight your profile at the very top of local search results and Google Map pins for 3 full days. Get 3x to 5x more customer calls and urgent repair bookings.'
};

// Customer Convenience Fee (Covers Identity verification, Safety, and Live GPS tracking)
export const CUSTOMER_CONVENIENCE_FEE = {
  defaultFee: 29, // Between ₹20 and ₹40
  minFee: 20,
  maxFee: 40,
  breakdown: [
    { title: 'Background Identity Check', desc: 'UIDAI Aadhaar & PAN verification' },
    { title: 'Live GPS Tracking', desc: 'Google Maps turn-by-turn tracking' },
    { title: 'Damage Protection Cover', desc: 'Up to ₹10,000 artisan work warranty' }
  ]
};

// One-Time Worker Onboarding & Setup Fee
export const ONBOARDING_SETUP_FEE = {
  amount: 199, // Range: ₹150 to ₹300
  title: 'One-Time Artisan Verification & Onboarding Setup',
  description: 'One-time onboarding fee that covers official UIDAI DigiLocker e-KYC extraction, Police/NSDL verification, and stops fake unverified profiles from joining.',
  guaranteeText: 'Only paid once. Lifetime verified artisan membership.'
};
