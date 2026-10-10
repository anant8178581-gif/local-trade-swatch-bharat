export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  TAMIL = 'ta',
  TELUGU = 'te',
  BENGALI = 'bn',
  MARATHI = 'mr',
  GUJARATI = 'gu'
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  lastPlace?: string;
  workPhoto?: string;
  workTitle?: string;
  category?: string;
  completionTime?: string;
  verifiedBadge?: boolean;
  tags?: string[];
  reviewType?: 'customer_to_worker' | 'worker_to_customer';
  geotag?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export interface Worker {
  id: string;
  name: string;
  skills: string[];
  rating: number;
  verified: boolean;
  aadhaarVerified: boolean;
  panVerified?: boolean;
  googleVerified?: boolean;
  googleEmail?: string;
  lastWorkPlace?: string;
  lastWorkPhoto?: string;
  lastWorkDate?: string;
  lastWorkTitle?: string;
  workPhotos?: string[];
  location: { lat: number; lng: number };
  distance?: number;
  photoUrl: string;
  emergencyCertified: boolean;
  reviews?: Review[];
  matchScore?: number;
  upiId?: string;
  bankDetails?: BankDetails;
  bloodGroup?: string;
  memberSince?: string;
  idValidity?: string;
  aadhaarNumberMasked?: string;
  panNumberMasked?: string;
  digilockerVerified?: boolean;
  basePrice?: number;
  vehicleNumber?: string;
  // Monetization & Subscription Fields
  subscriptionPlan?: 'daily' | 'monthly' | 'none';
  subscriptionActive?: boolean;
  subscriptionExpiresAt?: string;
  isPriorityFeatured?: boolean;
  isPriorityListing?: boolean;
  priorityFeaturedExpiresAt?: string;
  onboardingFeePaid?: boolean;
  lifetimeEarnings?: number;
  commissionSaved?: number;
  socialPortfolio?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export interface JobIssueReport {
  id: string;
  issueType: 'Incomplete Work' | 'Quality Dispute' | 'Pricing Discrepancy' | 'Property Damage' | 'Worker Conduct' | 'Other';
  description: string;
  photoUrl?: string;
  capturedAt: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved';
  desiredResolution?: string;
  reportedBy?: string;
}

export interface JobTimelineStep {
  statusKey: 'pending' | 'assigned' | 'on_site' | 'completed' | 'requires_attention';
  title: string;
  subtitle: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'assigned' | 'on_site' | 'on-site' | 'completed' | 'incomplete' | 'requires_attention';
  isEmergency: boolean;
  location: string;
  coordinates?: { lat: number; lng: number };
  price: number;
  customerName: string;
  customerPhone?: string;
  assignedWorkerId?: string;
  attentionReason?: string;
  socialShareCount?: number;
  issueReport?: JobIssueReport;
  finalPrice?: number;
  lastCustomerReminderAt?: string;
  paymentReceived?: boolean;
  timelineHistory?: JobTimelineStep[];
  receiptDetails?: {
    receiptId: string;
    amount: number;
    date: string;
    utr?: string;
    mode: string;
  };
}

export type AppView = 
  | 'home' 
  | 'sos' 
  | 'register' 
  | 'jobs' 
  | 'profile' 
  | 'admin' 
  | 'community' 
  | 'id-card' 
  | 'verification' 
  | 'payments' 
  | 'support' 
  | 'bank-settings' 
  | 'logout' 
  | 'ai-chat' 
  | 'creative-hub' 
  | 'live-voice' 
  | 'otp-settings' 
  | 'android-permissions'
  | 'google-map'
  | 'coupon-corner'
  | 'my-bookings'
  | 'worker-wallet'
  | 'monthly-report'
  | 'empowerment-platform'
  | 'nutrition-screener';

export interface UserLocation {
  lat: number;
  lng: number;
  formattedAddress: string;
  area: string;
  city: string;
  pincode: string;
  isAutoLocated: boolean;
}

export interface CouponItem {
  code: string;
  title: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  badge?: string;
  expiryText: string;
}

export type BookingStatus = 
  | 'booking_started'
  | 'bargaining'
  | 'confirmed'
  | 'worker_assigned'
  | 'heading_to_location'
  | 'arrived'
  | 'work_in_progress'
  | 'completed'
  | 'cancelled';

export interface BookingRecord {
  id: string;
  worker: Worker;
  customerName: string;
  customerPhone: string;
  customerLocation: UserLocation;
  serviceCategory: string;
  serviceTitle: string;
  originalPrice: number;
  bargainedPrice?: number;
  appliedCoupon?: CouponItem;
  couponDiscount: number;
  safetyFee: number;
  tax: number;
  finalPrice: number;
  status: BookingStatus;
  paymentMethod: 'upi_gpay' | 'upi_phonepe' | 'upi_paytm' | 'upi_custom' | 'card' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'pay_on_delivery';
  upiTransactionId?: string;
  otpStartCode: string; // 4-digit PIN for worker to begin work
  workerCurrentLocation: { lat: number; lng: number };
  etaMinutes: number;
  distanceKm: number;
  createdAt: string;
  scheduledTime?: string;
}

export interface OtpSettings {
  phone: string;
  email?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  requireOtpForLogin: boolean;
  requireOtpForGigs: boolean;
  requireOtpForPayouts: boolean;
  requireOtpForProfileChanges: boolean;
  preferredChannel: 'sms' | 'whatsapp' | 'email' | 'voice';
  autoFillSms: boolean;
  otpExpirySeconds: number;
  twoFactorEnabled: boolean;
}

export interface OtpHistoryLog {
  id: string;
  action: string;
  recipient: string;
  channel: 'SMS' | 'WhatsApp' | 'Gmail / Email' | 'Voice Call';
  timestamp: string;
  status: 'Verified' | 'Failed' | 'Expired';
  ipAddress: string;
  location: string;
}

export interface AndroidPermission {
  id: 'location' | 'camera' | 'microphone' | 'sms' | 'notifications';
  name: string;
  description: string;
  granted: boolean;
  iconName: string;
}

export interface AndroidNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'sms' | 'alert' | 'job' | 'system' | 'email';
  read: boolean;
  otpCode?: string;
}

export interface GoogleProfile {
  email: string;
  name: string;
  avatar: string;
  verifiedAt: string;
  idToken: string;
  trustScore: number;
}

export interface AadhaarKycRecord {
  fullName: string;
  gender: string;
  dob: string;
  age: number;
  maskedAadhaar: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  verifiedTimestamp: string;
  digilockerRef: string;
  photoUrl: string;
}

export interface PanKycRecord {
  panNumber: string;
  nameOnPan: string;
  fatherName: string;
  dob: string;
  status: 'OPERATIVE & ACTIVE' | 'INACTIVE';
  category: 'INDIVIDUAL' | 'BUSINESS';
  aadhaarLinked: boolean;
  jurisdiction: string;
  verifiedTimestamp: string;
}

export interface VerificationState {
  aadhaar: string;
  aadhaarOtp: string;
  aadhaarOtpSent: boolean;
  aadhaarVerified: boolean;
  aadhaarKycData?: AadhaarKycRecord;
  pan: string;
  panVerified: boolean;
  panKycData?: PanKycRecord;
  googleVerified: boolean;
  googleProfile?: GoogleProfile;
  livenessVerified: boolean;
  livenessConfidence?: number;
  onboardingFeePaid?: boolean;
  step: 'aadhaar' | 'aadhaar-otp' | 'pan' | 'google' | 'liveness' | 'onboarding-fee' | 'complete';
  isVerifying: boolean;
  error?: string;
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';

export interface ImageGenConfig {
  prompt: string;
  size: ImageSize;
  aspectRatio: AspectRatio;
}
