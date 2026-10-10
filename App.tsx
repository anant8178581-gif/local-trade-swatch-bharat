import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Logo from './components/Logo';
import { 
  AppView, 
  Worker, 
  Job, 
  JobIssueReport,
  Review, 
  AndroidNotification, 
  GoogleProfile,
  UserLocation,
  BookingRecord
} from './types';
import { CATEGORIES } from './constants';
import VerificationFlow from './components/VerificationFlow';
import WorkerCard from './components/WorkerCard';
import JobCard from './components/JobCard';
import PostJobModal from './components/PostJobModal';
import Circle from './components/Circle';
import Chat from './components/Chat';
import SupportView from './components/SupportView';
import AIChatView from './components/AIChatView';
import CreativeHub from './components/CreativeHub';
import LiveVoiceSession from './components/LiveVoiceSession';
import LoginPortal from './components/LoginPortal';
import GoogleVerificationModal from './components/GoogleVerificationModal';
import OtpSettingsView from './components/OtpSettingsView';
import LiveMapExplorer from './components/LiveMapExplorer';
import InstantBookingModal from './components/InstantBookingModal';
import LiveWorkerTrackerModal from './components/LiveWorkerTrackerModal';
import CouponCornerModal from './components/CouponCornerModal';
import WorkerSubscriptionModal from './components/WorkerSubscriptionModal';
import FeeTransparencyModal from './components/FeeTransparencyModal';
import WorkerWalletView from './components/WorkerWalletView';
import MonthlyReportStatementModal from './components/MonthlyReportStatementModal';
import EmpowermentPlatformView from './components/EmpowermentPlatformView';
import WorkerNutritionScreener from './components/WorkerNutritionScreener';
import { DEFAULT_LOCATIONS, getLiveGPSLocation } from './services/locationService';
import { 
  AlertCircle, 
  Search, 
  Star, 
  ShieldCheck, 
  UserCheck, 
  Wallet, 
  ChevronRight, 
  LogOut, 
  Globe, 
  CreditCard, 
  PhoneCall, 
  Zap, 
  History, 
  ShieldAlert, 
  Sparkles, 
  Smartphone, 
  Loader2, 
  Image as ImageIcon, 
  Plus, 
  Briefcase, 
  Users,
  BadgeCheck,
  CheckCircle,
  CheckCircle2,
  MapPin,
  Navigation,
  Tag,
  Bike,
  Compass,
  ArrowRight,
  Gift,
  Crown,
  Rocket,
  Award,
  Percent,
  FileText,
  Building2,
  Utensils,
  Activity,
  Share2,
  Instagram,
  Facebook,
  Linkedin,
  ExternalLink,
  Edit3,
  Check
} from 'lucide-react';

const INITIAL_WORKERS: Worker[] = [
  { 
    id: '1', 
    name: 'Arjun Deshmukh', 
    skills: ['Plumbing', 'Electrical'], 
    rating: 4.8, 
    verified: true, 
    aadhaarVerified: true, 
    panVerified: true, 
    googleVerified: true,
    googleEmail: 'arjun.deshmukh.pro@gmail.com',
    lastWorkPlace: 'Lodha Bellissimo, Tower B, Mahalaxmi, Mumbai',
    lastWorkPhoto: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80',
    lastWorkDate: 'Worked 2 days ago',
    lastWorkTitle: 'Main Copper Pipeline Replacement & Geyser Valve Fitting',
    aadhaarNumberMasked: 'XXXX-XXXX-6012',
    panNumberMasked: 'BKZPD4891K',
    digilockerVerified: true,
    location: { lat: 19.0180, lng: 72.8480 }, 
    distance: 0.8, 
    photoUrl: 'https://images.unsplash.com/photo-1540560485458-3473b307985c?w=400&h=400&fit=crop', 
    emergencyCertified: true, 
    matchScore: 98, 
    bloodGroup: 'AB+', 
    memberSince: 'Feb 2023',
    basePrice: 550,
    vehicleNumber: 'MH 02 DX 7719',
    subscriptionPlan: 'monthly',
    subscriptionActive: true,
    subscriptionExpiresAt: '25 Oct 2026',
    isPriorityFeatured: true,
    priorityFeaturedExpiresAt: '27 Sep 2026',
    onboardingFeePaid: true,
    lifetimeEarnings: 18450,
    commissionSaved: 3690,
    reviews: [
      { 
        id: 'r1', 
        userName: 'Advait Kulkarni', 
        rating: 5, 
        comment: 'Exceptional craftsmanship! Repaired our main overhead line burst with zero leaks and tested high pressure. Very professional.', 
        date: '3 days ago',
        lastPlace: 'Hiranandani Gardens, Powai, Mumbai',
        workPhoto: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80',
        workTitle: 'Pressure Valve & Overhead Pipe Fitting',
        category: 'Plumbing',
        completionTime: 'Completed in 1.5 hrs',
        verifiedBadge: true
      },
      { 
        id: 'r2', 
        userName: 'Meera Jog', 
        rating: 5, 
        comment: 'Fixed an urgent kitchen short circuit and installed heavy-duty MCB switches safely.', 
        date: '2 weeks ago',
        lastPlace: 'Parijat CHS, Shivaji Park, Dadar West, Mumbai',
        workPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
        workTitle: 'MCB Switchboard Rewiring',
        category: 'Electrical',
        completionTime: 'Completed in 45 mins',
        verifiedBadge: true
      }
    ]
  },
  { 
    id: '2', 
    name: 'Kavita Reddy', 
    skills: ['Carpentry', 'Masonry'], 
    rating: 4.7, 
    verified: true, 
    aadhaarVerified: true, 
    panVerified: true,
    googleVerified: true,
    googleEmail: 'kavita.reddy.crafts@gmail.com',
    lastWorkPlace: 'Oberoi Woods, Tower 2, Goregaon East, Mumbai',
    lastWorkPhoto: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80',
    lastWorkDate: 'Worked yesterday',
    lastWorkTitle: 'Modular Kitchen Cabinets & Soft-Close Hinges',
    aadhaarNumberMasked: 'XXXX-XXXX-9912',
    location: { lat: 19.0220, lng: 72.8520 }, 
    distance: 1.2, 
    photoUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop', 
    emergencyCertified: false, 
    matchScore: 92,
    basePrice: 650,
    vehicleNumber: 'MH 01 BS 4421',
    reviews: [
      {
        id: 'r3',
        userName: 'Vikas Shah',
        rating: 5,
        comment: 'Master carpentry work. Adjusted all warped cabinet doors in under 2 hours.',
        date: '1 week ago',
        lastPlace: 'Sea Face Apartments, Worli, Mumbai',
        workPhoto: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80',
        workTitle: 'Cabinet Door Realignment',
        verifiedBadge: true
      }
    ]
  },
  { 
    id: '3', 
    name: 'Sameer Sheikh', 
    skills: ['AC Repair', 'Appliances'], 
    rating: 4.9, 
    verified: true, 
    aadhaarVerified: true, 
    panVerified: true, 
    googleVerified: true,
    googleEmail: 'sameer.sheikh.tech@gmail.com',
    lastWorkPlace: 'Godrej Platinum, Tower 3, Vikhroli, Mumbai',
    lastWorkPhoto: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80',
    lastWorkDate: 'Worked 4 hours ago',
    lastWorkTitle: 'Inverter AC Gas Charging & Jet Pump Deep Cleaning',
    aadhaarNumberMasked: 'XXXX-XXXX-3341',
    location: { lat: 19.0150, lng: 72.8450 }, 
    distance: 0.3, 
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', 
    emergencyCertified: true, 
    matchScore: 99,
    basePrice: 850,
    vehicleNumber: 'MH 03 AF 1092',
    reviews: [
      {
        id: 'r4',
        userName: 'Preeti Deshpande',
        rating: 5,
        comment: 'Sameer Bhai fixed our split AC that was blowing hot air. Cold as ice now!',
        date: '4 days ago',
        lastPlace: 'Raheja Residency, Malad West, Mumbai',
        workPhoto: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80',
        workTitle: 'Gas Leakage Seal & High Pressure Cleaning',
        verifiedBadge: true
      }
    ]
  },
  { 
    id: '4', 
    name: 'Priya Kapoor', 
    skills: ['Electrical', 'Security'], 
    rating: 4.7, 
    verified: true, 
    aadhaarVerified: true, 
    panVerified: true,
    googleVerified: true,
    googleEmail: 'priya.kapoor.cctv@gmail.com',
    lastWorkPlace: 'Kanakia Silicon Valley, Powai, Mumbai',
    lastWorkPhoto: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
    lastWorkDate: 'Worked yesterday',
    lastWorkTitle: 'Smart Doorbell & 4-Channel HD CCTV Security System',
    location: { lat: 19.0250, lng: 72.8550 }, 
    distance: 2.1, 
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', 
    emergencyCertified: true, 
    matchScore: 95,
    basePrice: 600,
    vehicleNumber: 'MH 02 EC 9901'
  },
  { 
    id: '5', 
    name: 'Amit Singh', 
    skills: ['Painting', 'Interior'], 
    rating: 4.9, 
    verified: true, 
    aadhaarVerified: true, 
    panVerified: true, 
    googleVerified: true,
    googleEmail: 'amit.singh.finishes@gmail.com',
    lastWorkPlace: 'Piramal Mahalaxmi, Central Tower, Mumbai',
    lastWorkPhoto: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
    lastWorkDate: 'Worked 3 days ago',
    lastWorkTitle: 'Waterproof Primer & Royal Luxury Acrylic Finish',
    location: { lat: 19.0120, lng: 72.8420 }, 
    distance: 0.6, 
    photoUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&h=400&fit=crop', 
    emergencyCertified: false, 
    matchScore: 98,
    basePrice: 700,
    vehicleNumber: 'MH 04 BK 5522'
  }
];

const INITIAL_JOBS: Job[] = [
  { id: 'j-active', title: 'Solar Hybrid Inverter & Wiring Installation', description: 'Active: Technician on-site installing 3.5kVA hybrid solar inverter and testing load distribution.', category: 'electrical', status: 'assigned', isEmergency: false, location: 'Hiranandani Gardens, Powai, Mumbai', coordinates: { lat: 19.1176, lng: 72.9060 }, price: 2400, customerName: 'Kunal Malhotra', customerPhone: '+91 98200 88991' },
  { id: 'j-comp', title: 'Copper Pipe Gas Leakage Repair & Seal', description: 'Completed: Kitchen copper gas pipeline replaced, pressure tested under 1.5 bar, and verified zero leak.', category: 'plumbing', status: 'completed', isEmergency: false, location: 'Sea Face Apartments, Worli, Mumbai', coordinates: { lat: 19.0144, lng: 72.8175 }, price: 1250, customerName: 'Meenakshi Iyer', customerPhone: '+91 98112 33445' },
  { id: 'j0', title: 'Bathroom Concealed Pipeline Inspection', description: 'Main valve joint left untested; seepage detected behind wall tiles. Quality review required.', category: 'plumbing', status: 'incomplete', isEmergency: false, location: 'Lokhandwala Complex, Andheri West, Mumbai', coordinates: { lat: 19.1305, lng: 72.8250 }, price: 1800, customerName: 'Deepak Varma', customerPhone: '+91 98221 44556', attentionReason: 'Seepage detected behind bathroom wall tiles. Immediate artisan remediation needed.' },
  { id: 'j1', title: 'Main Line Leakage & Faucet Repair', description: 'Urgent: Water tank line burst. Flooding in hall.', category: 'plumbing', status: 'pending', isEmergency: true, location: 'Gokhale Road, Dadar East, Mumbai', coordinates: { lat: 19.0215, lng: 72.8435 }, price: 1500, customerName: 'Rohan Sharma', customerPhone: '+91 98201 11223' },
  { id: 'j2', title: 'Power Failure & MCB Sparking', description: 'Total blackout in kitchen and balcony. Sparking in MCB.', category: 'electrical', status: 'pending', isEmergency: true, location: 'Juhu Tara Road, Mumbai', coordinates: { lat: 19.0265, lng: 72.8390 }, price: 850, customerName: 'Anjali Gupta', customerPhone: '+91 98204 55441' },
  { id: 'j3', title: 'Home Sanitization & Deep Clean', description: 'Deep cleaning and pest control for new office space.', category: 'cleaning', status: 'pending', isEmergency: false, location: 'Bandra BKC, Mumbai', coordinates: { lat: 19.0607, lng: 72.8633 }, price: 3500, customerName: 'Vikram Mehra', customerPhone: '+91 98192 33445' },
  { id: 'j4', title: 'Split AC Servicing & Gas Check', description: 'General servicing for 3 split AC units.', category: 'ac_repair', status: 'pending', isEmergency: false, location: 'Worli Sea Link Road, Mumbai', coordinates: { lat: 19.0095, lng: 72.8180 }, price: 2100, customerName: 'Sunita Rao', customerPhone: '+91 98190 77889' },
  { id: 'j5', title: 'Modular Kitchen Cabinet Fitting', description: 'Need expert for final cabinet adjustments.', category: 'carpentry', status: 'pending', isEmergency: false, location: 'Powai Hiranandani, Mumbai', coordinates: { lat: 19.1176, lng: 72.9060 }, price: 4000, customerName: 'Kabir Singh', customerPhone: '+91 98332 99001' }
];

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<AppView>('home');
  const [role, setRole] = useState<'worker' | 'customer'>('customer');
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<{ name: string; isCall: boolean } | null>(null);
  const [sosState, setSosState] = useState<'idle' | 'broadcasting' | 'assigned'>('idle');
  const [sosResponder, setSosResponder] = useState<Worker | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);

  // Real Customer Location (defaults to Dadar Mumbai)
  const [customerLocation, setCustomerLocation] = useState<UserLocation>(DEFAULT_LOCATIONS.mumbai_dadar);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  // Direct Booking & Live Tracking State
  const [bookingTargetWorker, setBookingTargetWorker] = useState<Worker | null>(null);
  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null);
  const [isLiveTrackerOpen, setIsLiveTrackerOpen] = useState(false);
  const [isCouponCornerOpen, setIsCouponCornerOpen] = useState(false);
  const [isWorkerSubModalOpen, setIsWorkerSubModalOpen] = useState(false);
  const [isFeeTransparencyOpen, setIsFeeTransparencyOpen] = useState(false);
  const [isMonthlyStatementOpen, setIsMonthlyStatementOpen] = useState(false);
  const [isWorkerOnline, setIsWorkerOnline] = useState(true);
  
  // Google Auth Modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [targetGoogleWorker, setTargetGoogleWorker] = useState<Worker | null>(null);

  // User social links state for Profile View
  const [socialLinks, setSocialLinks] = useState<{
    instagram: string;
    facebook: string;
    linkedin: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('localtrades_user_social_links');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      instagram: '@arjun_deshmukh_trades',
      facebook: 'https://facebook.com/arjun.deshmukh.plumbing',
      linkedin: 'https://linkedin.com/in/arjun-deshmukh-trades'
    };
  });
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [tempSocialLinks, setTempSocialLinks] = useState(socialLinks);
  const [socialSaveToast, setSocialSaveToast] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<AndroidNotification[]>([
    {
      id: 'n1',
      title: 'Google & Aadhaar Security Verified',
      body: 'Verified primary Google account anant8178581@gmail.com and UIDAI DigiLocker ID.',
      time: '10:40 AM',
      type: 'system',
      read: false
    },
    {
      id: 'n2',
      title: 'Coupon Corner Active',
      body: 'Use code FIRST50 for flat ₹100 off on your first technician booking!',
      time: '10:30 AM',
      type: 'job',
      read: false
    }
  ]);

  const handleSendSystemNotification = (
    title: string, 
    body: string, 
    otpCode?: string, 
    type: 'sms' | 'email' | 'job' | 'system' = 'sms'
  ) => {
    const newNotif: AndroidNotification = {
      id: `notif-${Date.now()}`,
      title,
      body,
      time: 'Just now',
      type: type === 'email' ? 'email' : type === 'sms' ? 'sms' : 'system',
      read: false,
      otpCode
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleToggleJobStatus = (jobId: string, newStatus: Job['status'], reason?: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: newStatus,
          attentionReason: reason || j.attentionReason
        };
      }
      return j;
    }));
  };

  const handleReportJobIssue = (jobId: string, report: JobIssueReport) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'requires_attention',
          attentionReason: `${report.issueType}: ${report.description}`,
          issueReport: report
        };
      }
      return j;
    }));

    handleSendSystemNotification(
      `Dispute Logged #${report.id}`,
      `Issue '${report.issueType}' submitted with camera evidence for ${jobId}. Fair mediation active.`,
      undefined,
      'job'
    );
  };

  // In-person payment received handler from Dynamic UPI QR Code
  const handleJobPaymentReceived = (jobId: string, finalAmount: number, mode: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'completed',
          finalPrice: finalAmount,
          paymentReceived: true
        };
      }
      return j;
    }));

    handleSendSystemNotification(
      'In-Person Payment Received',
      `Payment of ₹${finalAmount.toLocaleString('en-IN')} received via ${mode} (0% platform cut).`,
      undefined,
      'job'
    );
  };

  // Automated SMS customer reminder handler
  const handleJobCustomerReminded = (jobId: string, timestamp: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          lastCustomerReminderAt: timestamp
        };
      }
      return j;
    }));

    handleSendSystemNotification(
      'Automated SMS Dispatched',
      `Automated SMS reminder successfully sent to customer for job #${jobId}.`,
      undefined,
      'job'
    );
  };

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(splashTimer);
  }, []);

  // Auto-locate user GPS quietly on startup
  useEffect(() => {
    getLiveGPSLocation()
      .then((loc) => {
        setCustomerLocation(loc);
      })
      .catch((e) => console.warn('Silent startup GPS check:', e));
  }, []);

  useEffect(() => {
    if (sosState === 'broadcasting') {
      const timer = setTimeout(() => {
        setSosResponder(workers[0]);
        setSosState('assigned');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [sosState, workers]);

  const handleVoiceTrigger = async () => {
    setActiveView('live-voice');
  };

  const handleLogout = () => {
    setActiveView('logout');
    setTimeout(() => {
      setIsAuthenticated(false);
      setActiveView('home');
    }, 1500);
  };

  const triggerSOS = () => setSosState('broadcasting');

  // Trigger GPS auto locate manually
  const handleTriggerGPS = async () => {
    setIsLocatingGPS(true);
    try {
      const live = await getLiveGPSLocation();
      setCustomerLocation(live);
      handleSendSystemNotification(
        'GPS Location Updated',
        `Current address: ${live.formattedAddress}`
      );
    } catch (e) {
      console.warn(e);
    } finally {
      setIsLocatingGPS(false);
    }
  };

  // Worker Subscription & Priority Listing handlers
  const handleUpdateWorkerSubscription = (workerId: string, plan: 'daily' | 'monthly', expiresAt: string) => {
    setWorkers(prev => prev.map(w => {
      if (w.id === workerId || w.id === workers[0].id) {
        return {
          ...w,
          subscriptionPlan: plan,
          subscriptionActive: true,
          subscriptionExpiresAt: expiresAt
        };
      }
      return w;
    }));
    handleSendSystemNotification(
      'Worker Subscription Activated',
      `Plan: ${plan === 'monthly' ? '₹99/Month Pro Pass' : '₹10/Day Flex Pass'} activated. Valid till ${expiresAt}. 0% commission active!`,
      undefined,
      'job'
    );
  };

  const handleActivatePriorityListing = (workerId: string, expiresAt: string) => {
    setWorkers(prev => prev.map(w => {
      if (w.id === workerId || w.id === workers[0].id) {
        return {
          ...w,
          isPriorityFeatured: true,
          isPriorityListing: true,
          priorityFeaturedExpiresAt: expiresAt
        };
      }
      return w;
    }));
    handleSendSystemNotification(
      'Priority Visibility Boost Active',
      `Your profile is now featured at the top of local searches and Google Maps for 3 days (till ${expiresAt}).`,
      undefined,
      'job'
    );
  };

  // Booking confirmed handler
  const handleBookingConfirmed = (booking: BookingRecord) => {
    setActiveBooking(booking);
    setIsLiveTrackerOpen(true);
    handleSendSystemNotification(
      'Worker Dispatched',
      `${booking.worker.name} is arriving in ~${booking.etaMinutes} mins. Start OTP: ${booking.otpStartCode}`,
      booking.otpStartCode,
      'job'
    );
  };

  // Worker accepts / navigates to a customer job work site on Google Maps
  const handleWorkerNavigateToJob = (job: Job) => {
    const startOtp = String(Math.floor(1000 + Math.random() * 9000));
    const targetCoords = job.coordinates || {
      lat: customerLocation.lat + 0.006,
      lng: customerLocation.lng + 0.005
    };
    const jobBooking: BookingRecord = {
      id: `GIG-${job.id.toUpperCase()}`,
      worker: workers[0],
      customerName: job.customerName,
      customerPhone: job.customerPhone || '+91 98201 11223',
      customerLocation: {
        lat: targetCoords.lat,
        lng: targetCoords.lng,
        formattedAddress: job.location,
        area: job.location.split(',')[0] || 'Dadar',
        city: 'Mumbai',
        pincode: '400028',
        isAutoLocated: true
      },
      serviceCategory: job.category,
      serviceTitle: job.title,
      originalPrice: job.price,
      couponDiscount: 0,
      safetyFee: 30,
      tax: 0,
      finalPrice: job.price + 30,
      status: 'heading_to_location',
      paymentMethod: 'upi_gpay',
      paymentStatus: 'pending',
      otpStartCode: startOtp,
      workerCurrentLocation: workers[0].location,
      etaMinutes: 8,
      distanceKm: 1.8,
      createdAt: 'Just now'
    };
    setActiveBooking(jobBooking);
    setIsLiveTrackerOpen(true);
  };

  // Handle adding new review with last work place & work photo
  const handleUpdateWorkerReviews = (workerId: string, review: Review, lastPlace: string, lastPhoto: string) => {
    setWorkers(prev => prev.map(w => {
      if (w.id === workerId) {
        const updatedReviews = [review, ...(w.reviews || [])];
        return {
          ...w,
          reviews: updatedReviews,
          lastWorkPlace: lastPlace,
          lastWorkPhoto: lastPhoto,
          lastWorkTitle: review.workTitle || w.lastWorkTitle,
          lastWorkDate: 'Just now'
        };
      }
      return w;
    }));

    handleSendSystemNotification(
      'New Verified Review Published',
      `Review with work photo for ${lastPlace} added successfully.`
    );
  };

  // Trigger Google Auth Modal
  const handleOpenGoogleAuth = (worker?: Worker) => {
    setTargetGoogleWorker(worker || workers[0]);
    setIsGoogleModalOpen(true);
  };

  const handleGoogleVerified = (profile: GoogleProfile) => {
    setIsGoogleModalOpen(false);
    if (targetGoogleWorker) {
      setWorkers(prev => prev.map(w => {
        if (w.id === targetGoogleWorker.id) {
          return {
            ...w,
            googleVerified: true,
            googleEmail: profile.email
          };
        }
        return w;
      }));
    }

    handleSendSystemNotification(
      'Google Identity Verified',
      `Google Pro credential linked to ${profile.email}. Trust score 99.8%.`
    );
  };

  const filteredWorkers = workers.filter(worker => 
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (worker.lastWorkPlace && worker.lastWorkPlace.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderHome = () => {
    if (role === 'worker') {
      return (
        <div className="p-4 space-y-4 animate-in fade-in duration-500 pb-24">
          <div className="flex flex-col gap-3.5">
            {/* Header with Greeting & Online Toggle */}
            <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm">
              <div>
                <h2 className="text-xl font-black text-gray-900">Namaste, {workers[0].name.split(' ')[0]}</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${isWorkerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                    {isWorkerOnline ? 'Active on Google Maps • Accepting Direct Bookings' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsWorkerOnline(!isWorkerOnline)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                    isWorkerOnline 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {isWorkerOnline ? '🟢 Live' : '⚪ Offline'}
                </button>
                <button onClick={() => setActiveView('ai-chat')} className="w-9 h-9 bg-[#2D4356] rounded-xl flex items-center justify-center text-white shadow-md active:scale-95" title="AI Mitra">
                  <Sparkles size={16} />
                </button>
              </div>
            </div>

            {/* Quick Switch Persona Pill */}
            <div className="bg-white p-3 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Switch Role</span>
                <span className="text-[10px] text-gray-500">View app as a Customer booking services</span>
              </div>
              <button 
                onClick={() => setRole('customer')}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-black uppercase tracking-wider border border-blue-200 active:scale-95 transition-all"
              >
                Customer Mode
              </button>
            </div>

            {/* 3-Column AI Health, Hygiene & Worker Empowerment Platform Launcher */}
            <div className="bg-gradient-to-r from-teal-900 via-[#0F172A] to-slate-900 rounded-2xl p-4 text-white shadow-md border-2 border-emerald-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  3-COLUMN WORKSPACE
                </span>
                <span className="text-[9px] font-bold text-amber-300">Live Civic & Health</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  AI Health, Hygiene & Worker Empowerment Platform
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Side-by-side: Marketplace Hub • Civic Hazard 7d Escalation • Worker Nutrition Screener
                </p>
              </div>
              <button
                onClick={() => setActiveView('empowerment-platform')}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Building2 size={14} />
                <span>Open 3-Column Execution Dashboard</span>
              </button>
            </div>

            {/* Worker Subscription & 0% Commission Hub (Primary Driver) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 text-white shadow-md space-y-3.5 border border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                      0% Commission Platform
                    </span>
                    <span className="text-emerald-300 text-xs font-semibold">
                      Keep 100% of Earnings
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold mt-1.5 tracking-tight">
                    Worker Subscription Pass
                  </h3>
                  <p className="text-xs text-slate-300">
                    Plan: <strong className="text-white">{workers[0].subscriptionPlan === 'daily' ? 'Daily Flex Pass (₹10/day)' : 'Pro Monthly Pass (₹99/month)'}</strong> · Active
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsMonthlyStatementOpen(true)}
                    className="px-2.5 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1"
                    title="Open Monthly Report Statement"
                  >
                    <FileText size={13} className="text-amber-300" />
                    <span>Statement</span>
                  </button>
                  <button
                    onClick={() => setIsWorkerSubModalOpen(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span>Pass</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              {/* Earnings & Savings Stats */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[10px] text-slate-300 font-medium block">Earned</span>
                  <span className="text-sm font-extrabold text-white font-mono mt-0.5 block">
                    ₹{workers[0].lifetimeEarnings?.toLocaleString('en-IN') || '18,450'}
                  </span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[10px] text-slate-300 font-medium block">Platform Cut</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5 block">
                    ₹0 (0%)
                  </span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[10px] text-slate-300 font-medium block">Saved</span>
                  <span className="text-sm font-extrabold text-amber-400 font-mono mt-0.5 block">
                    +₹{workers[0].commissionSaved?.toLocaleString('en-IN') || '3,690'}
                  </span>
                </div>
              </div>

              {/* Priority Visibility Listing status or upgrade */}
              <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center flex-shrink-0">
                    <Rocket size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-amber-300 block truncate">
                      {workers[0].isPriorityFeatured ? '⭐ Priority Featured (Active)' : 'Priority Visibility Listings'}
                    </span>
                    <p className="text-[11px] text-slate-300 truncate mt-0.5">
                      {workers[0].isPriorityFeatured ? 'Top placement in local searches & Google Map' : 'Pay ₹50 for 3 days to appear at top of searches'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsWorkerSubModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold flex-shrink-0 active:scale-95 transition-all shadow-xs"
                >
                  {workers[0].isPriorityFeatured ? 'Extend' : 'Boost ₹50'}
                </button>
              </div>
            </div>

            {/* 4 Quick Artisan Navigation Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setActiveView('worker-wallet')}
                className="p-3 bg-white hover:bg-emerald-50/50 rounded-2xl border border-gray-200 text-left transition-all active:scale-[0.98] shadow-sm flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                  <Wallet size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-gray-900 leading-tight">0% Cut Wallet</h4>
                  <span className="text-[10px] text-gray-500 block truncate">Payouts & History</span>
                </div>
              </button>

              <button
                onClick={() => setActiveView('id-card')}
                className="p-3 bg-white hover:bg-blue-50/50 rounded-2xl border border-gray-200 text-left transition-all active:scale-[0.98] shadow-sm flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                  <Award size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-gray-900 leading-tight">Digital ID Card</h4>
                  <span className="text-[10px] text-gray-500 block truncate">Trade Passport & QR</span>
                </div>
              </button>

              <button
                onClick={() => setActiveView('verification')}
                className="p-3 bg-white hover:bg-purple-50/50 rounded-2xl border border-gray-200 text-left transition-all active:scale-[0.98] shadow-sm flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold flex-shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-gray-900 leading-tight">Aadhaar & Setup</h4>
                  <span className="text-[10px] text-gray-500 block truncate">₹199 KYC Status</span>
                </div>
              </button>

              <button
                onClick={() => setActiveView('google-map')}
                className="p-3 bg-white hover:bg-amber-50/50 rounded-2xl border border-gray-200 text-left transition-all active:scale-[0.98] shadow-sm flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
                  <Compass size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-gray-900 leading-tight">Demand Radar</h4>
                  <span className="text-[10px] text-gray-500 block truncate">Map & Hotspots</span>
                </div>
              </button>
            </div>

            {/* Platform Transparency Banner */}
            <div 
              onClick={() => setIsFeeTransparencyOpen(true)}
              className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h5 className="text-xs font-black text-white">How We Make Money (0% Cut Model)</h5>
                  <p className="text-[10px] text-slate-300">₹99/mo Worker Pass • ₹29 Customer Fee • ₹199 Setup Fee</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-1.5">
                <span>Incoming Customer Gig Radar</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest">{jobs.length} Active in Mumbai</span>
            </div>
            {jobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                isWorker={true} 
                onSelect={() => setSelectedChat({ name: job.customerName, isCall: false })} 
                onNavigateWorkSite={handleWorkerNavigateToJob}
                onOpenWalletQr={() => setActiveView('worker-wallet')}
                onToggleStatus={handleToggleJobStatus}
                onReportIssue={handleReportJobIssue}
                onPaymentReceived={handleJobPaymentReceived}
                onRemindCustomer={handleJobCustomerReminded}
              />
            ))}
          </div>
        </div>
      );
    }

    // Customer Home View
    return (
      <div className="p-4 space-y-4 animate-in fade-in duration-300 pb-24">
        {/* Top Location Bar with Real GPS Auto Locate */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <MapPin size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">Service Location</span>
                {customerLocation.isAutoLocated && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="GPS verified" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate leading-tight mt-0.5">
                {customerLocation.formattedAddress}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleTriggerGPS}
              disabled={isLocatingGPS}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all active:scale-95"
              title="Auto Locate Current GPS"
            >
              {isLocatingGPS ? <Loader2 size={15} className="animate-spin text-blue-600" /> : <Navigation size={15} />}
            </button>
            <button
              onClick={() => setActiveView('google-map')}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all hover:bg-black active:scale-95 flex items-center gap-1.5 shadow-xs"
            >
              <Compass size={13} />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Active Booking Live Banner */}
        {activeBooking && (
          <div 
            onClick={() => setIsLiveTrackerOpen(true)}
            className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg border border-slate-800 cursor-pointer hover:border-amber-400 transition-all active:scale-[0.99] space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Bike size={16} className="animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Active Booking En Route
                  </span>
                  <h4 className="text-sm font-bold text-white">{activeBooking.worker.name} is on the way</h4>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-amber-400 font-mono">~{activeBooking.etaMinutes}m</span>
                <span className="text-[10px] text-slate-400 block font-medium">{activeBooking.distanceKm} km away</span>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Start Job OTP:</span>
                <span className="font-mono font-bold text-amber-300 text-sm tracking-widest">
                  {activeBooking.otpStartCode}
                </span>
              </div>
              <span className="font-semibold text-amber-400 flex items-center gap-1 text-xs">
                Live GPS <ArrowRight size={13} />
              </span>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search electrician, plumber, AC repair, carpenter..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/90 rounded-2xl shadow-xs outline-none text-slate-900 font-medium text-xs focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* 3-Column AI Health, Hygiene & Worker Empowerment Platform Launcher */}
        <div className="bg-gradient-to-r from-[#0F172A] via-slate-900 to-teal-950 rounded-2xl p-4 text-white shadow-md border-2 border-amber-400/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-400/30">
              3-COLUMN WORKSPACE
            </span>
            <span className="text-[9px] font-bold text-emerald-400">Govt Escalation & Health</span>
          </div>
          <div>
            <h3 className="text-sm font-black text-white">
              Locals Trade India: AI Health, Hygiene & Worker Empowerment
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Explore Column 1 (Marketplace), Column 2 (Civic Hazards), & Column 3 (Nutrition Screener)
            </p>
          </div>
          <button
            onClick={() => setActiveView('empowerment-platform')}
            className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Building2 size={14} />
            <span>Launch 3-Column Execution Dashboard</span>
          </button>
        </div>

        {/* Hero Interactive Map Trigger Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 text-white shadow-md overflow-hidden">
          <div className="relative z-10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                0% Commission Model
              </span>
              <button
                onClick={() => setIsCouponCornerOpen(true)}
                className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1"
              >
                <Gift size={13} />
                <span>Offers</span>
              </button>
            </div>

            <div>
              <h3 className="text-lg font-extrabold tracking-tight leading-snug">
                Connect Directly with Local Artisans
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Zero middleman commissions. Workers keep 100% of their earnings. Transparent ₹29 safety fee per booking.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setActiveView('google-map')}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Compass size={14} />
                <span>Live Google Map</span>
              </button>
              <button
                onClick={() => setIsFeeTransparencyOpen(true)}
                className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                <Percent size={13} />
                <span>Pricing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trade Categories Grid */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-0.5">
            <span className="text-xs font-bold text-slate-700">Categories</span>
            <span className="text-[11px] text-slate-600 font-medium">{CATEGORIES.length} Trades</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.slice(0, 8).map((cat) => {
              const isSelected = searchQuery.toLowerCase() === cat.label.toLowerCase();
              return (
                <button 
                  key={cat.id} 
                  onClick={() => {
                    if (isSelected) {
                      setSearchQuery('');
                    } else {
                      setSearchQuery(cat.label);
                    }
                  }}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all active:scale-95 ${
                    isSelected 
                      ? 'bg-blue-50/80 border-blue-500 shadow-xs' 
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center shadow-xs text-white`}>
                    {cat.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-800 text-center leading-tight truncate w-full">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Verified Craftsmen List */}
        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center px-0.5">
            <div>
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                Nearby Verified Artisans
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">GPS Sorted · Direct Booking</p>
            </div>
            <span className="text-slate-500 text-xs font-medium font-mono">{filteredWorkers.length} available</span>
          </div>

          <div className="space-y-3">
            {filteredWorkers.map(worker => (
              <WorkerCard 
                key={worker.id} 
                worker={worker} 
                onCall={(name) => setSelectedChat({ name, isCall: true })}
                onChat={(name) => setSelectedChat({ name, isCall: false })}
                onBook={(w) => setBookingTargetWorker(w)}
                onTriggerGoogleAuth={(w) => handleOpenGoogleAuth(w)}
                onUpdateWorkerReviews={handleUpdateWorkerReviews}
              />
            ))}
          </div>
        </div>

        {/* Post Request Floating CTA */}
        <button 
          onClick={() => setShowPostModal(true)}
          className="fixed bottom-24 right-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95 transition-all z-20"
        >
          <Plus size={16} /> Post Custom Gig
        </button>
      </div>
    );
  };

  const renderSOS = () => (
    <div className="p-6 h-full flex flex-col bg-red-50">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
        {sosState === 'idle' ? (
          <>
            <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl animate-pulse">
              <PhoneCall size={64} />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Emergency SOS</h2>
              <p className="text-gray-600 font-medium px-8">Broadcast your GPS location for immediate emergency trade intervention.</p>
            </div>
            <button onClick={triggerSOS} className="px-12 py-5 bg-red-600 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-xl shadow-red-200 active:scale-95 transition-all">
              Trigger Emergency Alert
            </button>
          </>
        ) : sosState === 'broadcasting' ? (
          <>
            <div className="relative">
              <div className="w-48 h-48 bg-red-100 rounded-full flex items-center justify-center"><ShieldAlert size={80} className="text-red-600 animate-bounce" /></div>
              <div className="absolute inset-0 border-8 border-red-600/20 rounded-full animate-ping" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 uppercase">Broadcasting SOS...</h3>
            <p className="text-red-600 font-black text-xs uppercase tracking-widest animate-pulse">Scanning 1.5km Radius via GPS</p>
          </>
        ) : (
          <div className="w-full space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-green-100 shadow-xl shadow-green-50">
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center text-green-600"><UserCheck size={48} /></div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Emergency Responder Found</h3>
                  <p className="text-sm text-gray-500 font-medium">{sosResponder?.name} is arriving in 5 mins with emergency kit.</p>
                </div>
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => {
                      if (sosResponder) setBookingTargetWorker(sosResponder);
                      setSosState('idle');
                    }}
                    className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                  >
                    Track on Map
                  </button>
                  <button onClick={() => setSosState('idle')} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => {
    const handleSaveSocialLinks = (e: React.FormEvent) => {
      e.preventDefault();
      setSocialLinks(tempSocialLinks);
      try {
        localStorage.setItem('localtrades_user_social_links', JSON.stringify(tempSocialLinks));
      } catch {}
      setIsEditingSocial(false);
      setSocialSaveToast('✓ Social portfolio profiles updated and verified!');
      setTimeout(() => setSocialSaveToast(null), 3000);
    };

    const handleShareArtisanProfile = async () => {
      const isWorker = role === 'worker';
      const artisanName = isWorker ? workers[0].name : 'Anant Sharma';
      const artisanTrade = isWorker ? workers[0].skills.join(', ') : 'Customer Account';
      const shareUrl = `${window.location.origin}/#profile/${encodeURIComponent(artisanName.toLowerCase().replace(/\s+/g, '-'))}`;

      const shareData = {
        title: `${artisanName} • Verified Profile on Local Trades India`,
        text: `Check out ${artisanName}'s verified public profile on Local Trades India! Skills: ${artisanTrade}. Direct hiring with 0% platform commission and Aadhaar KYC verification.`,
        url: shareUrl
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
          console.warn('Native share failed, fallback to clipboard:', err);
        }
      }

      try {
        await navigator.clipboard.writeText(shareUrl);
        alert(`✓ Public Profile Link for ${artisanName} copied to clipboard! Share on WhatsApp, Instagram or SMS.`);
      } catch {
        alert(`Public profile link: ${shareUrl}`);
      }
    };

    return (
      <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
        <div className="bg-white p-6 border-b relative overflow-hidden">
          <div className="flex items-center justify-between gap-4 relative z-10 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <img src={role === 'worker' ? workers[0].photoUrl : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-xl" alt="Profile" />
                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-lg border-2 border-white"><ShieldCheck size={12} /></div>
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">{role === 'worker' ? workers[0].name : 'Anant Sharma'}</h2>
                <p className="text-xs text-gray-500 mt-0.5">anant8178581@gmail.com</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">{role === 'worker' ? 'Trade Expert' : 'Customer Account'}</span>
                  <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-black"><Star size={11} fill="currentColor" /> 4.9</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShareArtisanProfile}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex-shrink-0"
              title="Share Public Profile via Web Share API"
            >
              <Share2 size={15} />
              <span>Share Profile</span>
            </button>
          </div>
        </div>

      <div className="p-4 space-y-3 pb-24">
        {/* Google Identity Verification Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BadgeCheck size={18} className="text-blue-600" />
              <div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight">Google Identity Verification</h4>
                <p className="text-[10px] text-emerald-600 font-bold">anant8178581@gmail.com • Verified</p>
              </div>
            </div>

            <button 
              onClick={() => handleOpenGoogleAuth()}
              className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-all active:scale-95 cursor-pointer"
            >
              Verify
            </button>
          </div>
        </div>

        {/* Social Media Integration & Portfolio Showcase Section */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Globe size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight flex items-center gap-1.5">
                  <span>Social Media Portfolio Showcase</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Live Showcase
                  </span>
                </h4>
                <p className="text-[10px] text-gray-500">
                  Linked Instagram, Facebook & LinkedIn profiles to showcase verified past works
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setTempSocialLinks(socialLinks);
                setIsEditingSocial(!isEditingSocial);
              }}
              className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <Edit3 size={11} />
              <span>{isEditingSocial ? 'Cancel' : 'Edit Profiles'}</span>
            </button>
          </div>

          {/* Social Links Badges (Display Mode) */}
          {!isEditingSocial ? (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Instagram Badge */}
                <a
                  href={socialLinks.instagram.startsWith('http') ? socialLinks.instagram : `https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border border-pink-200 flex items-center justify-between transition-all group"
                  title="View Instagram Portfolio"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
                      <Instagram size={13} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-pink-900 block uppercase">Instagram</span>
                      <span className="text-xs font-extrabold text-pink-950 truncate block">
                        {socialLinks.instagram || 'Not linked'}
                      </span>
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-pink-400 group-hover:text-pink-700 flex-shrink-0 ml-1" />
                </a>

                {/* Facebook Badge */}
                <a
                  href={socialLinks.facebook.startsWith('http') ? socialLinks.facebook : `https://facebook.com/${socialLinks.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100 border border-blue-200 flex items-center justify-between transition-all group"
                  title="View Facebook Profile"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[#1877F2] text-white flex items-center justify-center flex-shrink-0">
                      <Facebook size={13} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-blue-900 block uppercase">Facebook</span>
                      <span className="text-xs font-extrabold text-blue-950 truncate block">
                        {socialLinks.facebook ? (socialLinks.facebook.split('/').filter(Boolean).pop() || 'Profile') : 'Not linked'}
                      </span>
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-blue-400 group-hover:text-blue-700 flex-shrink-0 ml-1" />
                </a>

                {/* LinkedIn Badge */}
                <a
                  href={socialLinks.linkedin.startsWith('http') ? socialLinks.linkedin : `https://linkedin.com/in/${socialLinks.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100 hover:to-indigo-100 border border-indigo-200 flex items-center justify-between transition-all group"
                  title="View LinkedIn Profile"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center flex-shrink-0">
                      <Linkedin size={13} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-indigo-900 block uppercase">LinkedIn</span>
                      <span className="text-xs font-extrabold text-indigo-950 truncate block">
                        {socialLinks.linkedin ? (socialLinks.linkedin.split('/').filter(Boolean).pop() || 'Profile') : 'Not linked'}
                      </span>
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-indigo-400 group-hover:text-indigo-700 flex-shrink-0 ml-1" />
                </a>
              </div>
            </div>
          ) : (
            /* Social Links Edit Form */
            <form onSubmit={handleSaveSocialLinks} className="space-y-2.5 pt-2 animate-in fade-in duration-200">
              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1 flex items-center gap-1">
                  <Instagram size={12} className="text-pink-600" />
                  <span>Instagram Handle or Portfolio URL</span>
                </label>
                <input
                  type="text"
                  value={tempSocialLinks.instagram}
                  onChange={(e) => setTempSocialLinks({ ...tempSocialLinks, instagram: e.target.value })}
                  placeholder="@your_trade_profile or https://instagram.com/..."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1 flex items-center gap-1">
                  <Facebook size={12} className="text-blue-600" />
                  <span>Facebook Profile or Business Page URL</span>
                </label>
                <input
                  type="text"
                  value={tempSocialLinks.facebook}
                  onChange={(e) => setTempSocialLinks({ ...tempSocialLinks, facebook: e.target.value })}
                  placeholder="https://facebook.com/your.profile"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1 flex items-center gap-1">
                  <Linkedin size={12} className="text-[#0A66C2]" />
                  <span>LinkedIn Professional Profile URL</span>
                </label>
                <input
                  type="text"
                  value={tempSocialLinks.linkedin}
                  onChange={(e) => setTempSocialLinks({ ...tempSocialLinks, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check size={13} />
                  <span>Save Social Portfolio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSocial(false)}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {socialSaveToast && (
            <div className="p-2 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>{socialSaveToast}</span>
            </div>
          )}
        </div>

        {/* Worker Subscription & 0% Commission Profile Section */}
        {role === 'worker' && (
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl p-4 border-2 border-emerald-500/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-emerald-700" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                  Worker Subscription Pass
                </span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-full">
                0% Commission Active
              </span>
            </div>

            <p className="text-xs text-emerald-950 font-medium leading-relaxed">
              Active Plan: <strong>{workers[0].subscriptionPlan === 'daily' ? 'Daily Flex Pass (₹10/day)' : 'Pro Monthly Pass (₹99/month)'}</strong>. Keep 100% of your earnings with zero platform cut!
            </p>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Total Earned</span>
                <span className="font-mono font-black text-emerald-900 text-sm">₹{workers[0].lifetimeEarnings?.toLocaleString('en-IN') || '18,450'}</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Commission Saved</span>
                <span className="font-mono font-black text-emerald-700 text-sm">₹{workers[0].commissionSaved?.toLocaleString('en-IN') || '3,690'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsWorkerSubModalOpen(true)}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                Change Plan (₹99/mo)
              </button>
              <button
                onClick={() => setIsWorkerSubModalOpen(true)}
                className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-1"
              >
                <Rocket size={13} />
                <span>Boost (₹50)</span>
              </button>
            </div>
          </div>
        )}

        {/* Tailored Profile Section: Civic Hygiene & Health for Worker vs Customer */}
        {role === 'worker' ? (
          <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-md border-2 border-teal-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils size={18} className="text-teal-400" />
                <span className="text-xs font-black uppercase tracking-wider text-teal-200">
                  Worker Health, Hygiene & Bounties
                </span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-full">
                Worker Pro Mode
              </span>
            </div>

            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              Earn extra income by claiming local civic sanitation cleanups on the Leaflet radar. Track daily 2,400 kcal physical labor energy burn and prevent iron deficiency.
            </p>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/15">
                <span className="text-[10px] text-teal-300 block uppercase font-bold">Open Sanitation Bounties</span>
                <span className="font-mono font-black text-white text-sm">₹1,950 (110091)</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/15">
                <span className="text-[10px] text-teal-300 block uppercase font-bold">Daily Calorie Burn</span>
                <span className="font-mono font-black text-amber-300 text-sm">2,400 kcal Target</span>
              </div>
            </div>

            <button
              onClick={() => setActiveView('empowerment-platform')}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Building2 size={14} />
              <span>Open Sanitation Gigs Map & Nutrition Screener</span>
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-md border-2 border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-200">
                  Citizen Civic Hygiene & Family Health
                </span>
              </div>
              <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-black uppercase rounded-full">
                Customer Mode
              </span>
            </div>

            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              Report local civic biohazards on the Leaflet mini-map and track automated 7-Day Municipal Escalations. Monitor neighborhood Dengue/Malaria outbreak risks and drinking water safety.
            </p>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/15">
                <span className="text-[10px] text-amber-300 block uppercase font-bold">Local Hazards Tracked</span>
                <span className="font-mono font-black text-white text-sm">4 Pins (110091)</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/15">
                <span className="text-[10px] text-emerald-300 block uppercase font-bold">Water Quality Score</span>
                <span className="font-mono font-black text-emerald-400 text-sm">94% Safe Pipeline</span>
              </div>
            </div>

            <button
              onClick={() => setActiveView('empowerment-platform')}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Building2 size={14} />
              <span>Open Civic Hazard Mini-Map & Health Radar</span>
            </button>
          </div>
        )}

        {/* Security Cards Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <button onClick={() => setActiveView('otp-settings')} className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center text-center gap-1.5 active:scale-95 transition-all">
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><ShieldCheck size={18} /></div>
            <span className="text-[9px] font-black text-blue-900 uppercase tracking-tight">OTP Security</span>
          </button>
          <button onClick={() => setActiveView('verification')} className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-1.5 active:scale-95 transition-all">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><UserCheck size={18} /></div>
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-tight">Aadhaar / PAN</span>
          </button>
          <button onClick={() => setActiveView('coupon-corner')} className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-1.5 active:scale-95 transition-all">
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Tag size={18} /></div>
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-tight">Coupons</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100 text-xs">
          <button 
            onClick={() => setIsMonthlyStatementOpen(true)} 
            className="w-full p-4 flex items-center justify-between hover:bg-emerald-50/50 text-left bg-gradient-to-r from-emerald-50/40 via-teal-50/20 to-white"
          >
            <div className="flex items-center gap-3 text-slate-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <FileText size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 block">Monthly Report Statement</span>
                  <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Tax Ready</span>
                </div>
                <span className="text-[10px] text-slate-500">Gross earnings, 0% cut certificate & completed jobs ledger</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-emerald-700" />
          </button>

          <button onClick={() => setActiveView('google-map')} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left">
            <div className="flex items-center gap-3 text-gray-700">
              <Compass size={17} className="text-blue-600" />
              <span className="font-bold">Google Map & Nearby Workers</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>

          <button onClick={() => setIsCouponCornerOpen(true)} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left">
            <div className="flex items-center gap-3 text-gray-700">
              <Gift size={17} className="text-orange-500" />
              <span className="font-bold">Coupon Corner (Deals & Discounts)</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>

          <button onClick={() => setActiveView('otp-settings')} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-left">
            <div className="flex items-center gap-3 text-gray-700">
              <ShieldCheck size={17} className="text-emerald-600" />
              <span className="font-bold">OTP Settings (SMS & Gmail)</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>

          <button onClick={() => setActiveView('nutrition-screener')} className="w-full p-4 flex items-center justify-between hover:bg-teal-50/50 text-left bg-gradient-to-r from-teal-50/30 to-white">
            <div className="flex items-center gap-3 text-teal-950">
              <Utensils size={17} className="text-teal-700" />
              <div>
                <span className="font-bold block text-teal-950">AI Worker Nutrition Screener (Module 3)</span>
                <span className="text-[10px] text-teal-700/80">Drag & drop thali photo scanner • Protein & iron boosters</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-teal-600" />
          </button>

          <button onClick={() => setActiveView('empowerment-platform')} className="w-full p-4 flex items-center justify-between hover:bg-emerald-50/50 text-left bg-gradient-to-r from-emerald-50/30 to-white">
            <div className="flex items-center gap-3 text-emerald-950">
              <Sparkles size={17} className="text-emerald-700" />
              <div>
                <span className="font-bold block text-emerald-950">3-Column Empowerment Dashboard</span>
                <span className="text-[10px] text-emerald-700/80">Marketplace • Civic Hygiene Escalation • Nutrition Hub</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-emerald-600" />
          </button>
        </div>

        <button onClick={handleLogout} className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut size={16} /> End Session
        </button>
      </div>
    </div>
  );
};

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white overflow-hidden animate-in fade-in duration-500">
        <Logo size={120} showText={true} />
        <div className="absolute bottom-16 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Loader2 size={16} className="text-[#2D4356] animate-spin opacity-40" />
            <p className="text-[8px] font-black text-[#2D4356]/40 uppercase tracking-[0.3em]">
              Connecting GPS & Google Maps...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginPortal 
        onLoginSuccess={(selectedRole) => {
          setRole(selectedRole);
          setIsAuthenticated(true);
        }} 
        onSendSystemNotification={handleSendSystemNotification}
      />
    );
  }

  if (activeView === 'empowerment-platform') {
    return (
      <EmpowermentPlatformView 
        initialMode={role}
        onBackToMainApp={() => setActiveView('home')}
      />
    );
  }

  if (activeView === 'nutrition-screener') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-4">
          <div className="flex items-center justify-between bg-slate-800/80 backdrop-blur p-4 rounded-3xl border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all shadow"
            >
              ← Back to Main App
            </button>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 block">
                LOCAL TRADES INDIA
              </span>
              <h1 className="text-sm font-black text-white">
                Worker Nutrition & Health Screener (Module 3)
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('empowerment-platform')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow"
            >
              Open 3-Column Hub →
            </button>
          </div>

          <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200">
            <WorkerNutritionScreener />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeView={activeView} 
      setActiveView={setActiveView} 
      onVoiceTrigger={handleVoiceTrigger}
      notifications={notifications}
      onClearNotifications={handleClearNotifications}
      hasActiveBooking={!!activeBooking}
      onOpenLiveTracker={() => setIsLiveTrackerOpen(true)}
      role={role}
      onToggleRole={(newRole) => setRole(newRole)}
      onOpenFeeTransparency={() => setIsFeeTransparencyOpen(true)}
    >
      {activeView === 'home' && renderHome()}

      {/* Worker 0% Cut Wallet View */}
      {activeView === 'worker-wallet' && (
        <WorkerWalletView 
          worker={workers[0]}
          onOpenSubscriptionModal={() => setIsWorkerSubModalOpen(true)}
          onBackToHub={() => setActiveView('home')}
        />
      )}

      {/* Google Map View */}
      {activeView === 'google-map' && (
        <LiveMapExplorer 
          workers={workers}
          jobs={jobs}
          role={role}
          customerLocation={customerLocation}
          onUpdateLocation={setCustomerLocation}
          onSelectWorkerToBook={(w) => setBookingTargetWorker(w)}
          activeBooking={activeBooking}
          onOpenLiveTracker={() => setIsLiveTrackerOpen(true)}
          onOpenCouponCorner={() => setIsCouponCornerOpen(true)}
          onAcceptJobFromMap={handleWorkerNavigateToJob}
        />
      )}

      {/* Monthly Report Statement View */}
      {activeView === 'monthly-report' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900">Monthly Report Statement</h2>
              <p className="text-xs text-gray-500">Tax-ready earnings, 0% commission certificate & jobs ledger</p>
            </div>
            <button 
              onClick={() => setActiveView('profile')}
              className="px-3 py-1.5 bg-gray-100 rounded-xl text-xs font-bold text-gray-700"
            >
              Back
            </button>
          </div>
          <button
            onClick={() => setIsMonthlyStatementOpen(true)}
            className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
          >
            <FileText size={16} className="text-amber-400" /> Open Full Monthly Statement
          </button>
        </div>
      )}

      {/* Offers / Coupon Corner View */}
      {activeView === 'coupon-corner' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900">Coupon Corner</h2>
              <p className="text-xs text-gray-500">Active promo codes for home repairs</p>
            </div>
            <button 
              onClick={() => setActiveView('home')}
              className="px-3 py-1.5 bg-gray-100 rounded-xl text-xs font-bold text-gray-700"
            >
              Back
            </button>
          </div>
          <button
            onClick={() => setIsCouponCornerOpen(true)}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg flex items-center justify-center gap-2"
          >
            <Gift size={16} /> Open Full Coupon Drawer
          </button>
        </div>
      )}

      {activeView === 'jobs' && (
        <div className="p-4 space-y-4 pb-20">
           <div className="mb-3">
              <h2 className="text-xl font-black text-gray-900">{role === 'worker' ? 'Available Gigs' : 'Your Requests'}</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Active in Mumbai</p>
           </div>
          {jobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              isWorker={role === 'worker'} 
              onSelect={() => setSelectedChat({ name: role === 'worker' ? job.customerName : 'Assigned Worker', isCall: false })} 
              onNavigateWorkSite={handleWorkerNavigateToJob}
              onOpenWalletQr={() => setActiveView('worker-wallet')}
              onToggleStatus={handleToggleJobStatus}
              onReportIssue={handleReportJobIssue}
              onPaymentReceived={handleJobPaymentReceived}
              onRemindCustomer={handleJobCustomerReminded}
            />
          ))}
        </div>
      )}

      {activeView === 'community' && <Circle />}
      {activeView === 'sos' && renderSOS()}
      {activeView === 'profile' && renderProfile()}
      {activeView === 'support' && <SupportView />}

      {/* AI Mitra Chat with Multi-turn Memory, Languages and GPS */}
      {activeView === 'ai-chat' && (
        <AIChatView 
          onBack={() => setActiveView('home')} 
          customerLocation={customerLocation}
          onUpdateLocation={setCustomerLocation}
          onOpenMap={() => setActiveView('google-map')}
        />
      )}

      {activeView === 'creative-hub' && <CreativeHub onBack={() => setActiveView('home')} />}
      {activeView === 'live-voice' && <LiveVoiceSession onBack={() => setActiveView('home')} />}

      {activeView === 'verification' && (
        <VerificationFlow 
          onComplete={() => setActiveView('profile')} 
          onSendSystemNotification={handleSendSystemNotification}
        />
      )}

      {activeView === 'otp-settings' && (
        <OtpSettingsView 
          onBack={() => setActiveView('profile')} 
          onSendTestOtpNotification={handleSendSystemNotification}
        />
      )}

      {activeView === 'id-card' && (
        <div className="p-6 h-full flex flex-col items-center justify-center bg-gray-900/40 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto pb-24">
          <WorkerCard 
            worker={workers[0]} 
            isFullCard 
            onBook={(w) => setBookingTargetWorker(w)}
            onTriggerGoogleAuth={(w) => handleOpenGoogleAuth(w)}
            onUpdateWorkerReviews={handleUpdateWorkerReviews}
          />
          <button onClick={() => setActiveView('profile')} className="mt-6 bg-white px-12 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-wider transition-all text-black shadow-lg">Close Passport</button>
        </div>
      )}

      {selectedChat && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex flex-col backdrop-blur-md">
          <div className="mt-auto h-full bg-white overflow-hidden shadow-2xl">
            <Chat 
              name={selectedChat.name} 
              initialCall={selectedChat.isCall} 
              onClose={() => setSelectedChat(null)} 
            />
          </div>
        </div>
      )}

      {showPostModal && (
        <PostJobModal 
          onClose={() => setShowPostModal(false)}
          onPost={(newJob) => {
            const jobWithId = { ...newJob, id: `j${Date.now()}`, customerName: 'Anant S.', status: 'pending' };
            setJobs([jobWithId, ...jobs]);
            setShowPostModal(false);
            setActiveView('jobs');
          }}
        />
      )}

      {/* Global Google Identity Verification Modal */}
      <GoogleVerificationModal 
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onVerified={handleGoogleVerified}
        currentEmail={targetGoogleWorker?.googleEmail || 'anant8178581@gmail.com'}
      />

      {/* Direct Instant Booking Modal */}
      {bookingTargetWorker && (
        <InstantBookingModal
          isOpen={!!bookingTargetWorker}
          onClose={() => setBookingTargetWorker(null)}
          worker={bookingTargetWorker}
          customerLocation={customerLocation}
          onUpdateLocation={setCustomerLocation}
          onBookingConfirmed={handleBookingConfirmed}
          onOpenMapToCustomise={() => setActiveView('google-map')}
        />
      )}

      {/* Live Worker Tracking Modal */}
      {activeBooking && isLiveTrackerOpen && (
        <LiveWorkerTrackerModal
          booking={activeBooking}
          onClose={() => setIsLiveTrackerOpen(false)}
          onCancelBooking={(id) => {
            setActiveBooking(null);
            handleSendSystemNotification('Booking Cancelled', 'Your gig request was cancelled.');
          }}
          onCallWorker={(name) => {
            setIsLiveTrackerOpen(false);
            setSelectedChat({ name, isCall: true });
          }}
          onChatWorker={(name) => {
            setIsLiveTrackerOpen(false);
            setSelectedChat({ name, isCall: false });
          }}
          onJobComplete={(b) => {
            setActiveBooking(null);
            setIsLiveTrackerOpen(false);
            handleSendSystemNotification(
              'Job Completed & Rated',
              `Service with ${b.worker.name} completed successfully. Total: ₹${b.finalPrice}`
            );
          }}
          onAddWorkReview={handleUpdateWorkerReviews}
        />
      )}

      {/* Standalone Coupon Corner Modal */}
      <CouponCornerModal
        isOpen={isCouponCornerOpen}
        onClose={() => setIsCouponCornerOpen(false)}
        onApplyCoupon={(c) => {
          handleSendSystemNotification(
            'Coupon Copied',
            `Use code ${c.code} during checkout to save ${c.discountType === 'flat' ? '₹' + c.discountValue : c.discountValue + '%'}.`
          );
        }}
      />

      {/* Worker Subscription & Priority Listing Modal */}
      <WorkerSubscriptionModal
        isOpen={isWorkerSubModalOpen}
        onClose={() => setIsWorkerSubModalOpen(false)}
        worker={workers[0]}
        onUpdateWorkerSubscription={handleUpdateWorkerSubscription}
        onActivatePriorityListing={handleActivatePriorityListing}
      />

      {/* Platform Pricing & 0% Commission Transparency Modal */}
      <FeeTransparencyModal
        isOpen={isFeeTransparencyOpen}
        onClose={() => setIsFeeTransparencyOpen(false)}
        onOpenWorkerSubscription={() => setIsWorkerSubModalOpen(true)}
      />

      {/* Monthly Report Statement Modal */}
      <MonthlyReportStatementModal
        isOpen={isMonthlyStatementOpen}
        onClose={() => setIsMonthlyStatementOpen(false)}
        worker={workers[0]}
      />
    </Layout>
  );
};

export default App;
