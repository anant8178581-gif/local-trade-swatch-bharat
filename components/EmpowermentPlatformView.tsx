import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Search, 
  Star, 
  AlertTriangle, 
  Activity, 
  Utensils, 
  Heart, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Crown, 
  Tag, 
  Smartphone, 
  Bell, 
  Phone, 
  Camera, 
  Eye, 
  Upload, 
  Calendar, 
  Users, 
  ArrowRight, 
  ChevronRight, 
  X, 
  Filter, 
  Send, 
  RefreshCw, 
  FileText, 
  Sparkles,
  QrCode,
  IndianRupee,
  SlidersHorizontal,
  Flame,
  Building2,
  Stethoscope,
  Pill,
  Award,
  Droplets,
  Bug,
  AlertCircle,
  Check,
  Briefcase,
  User,
  Plus,
  Globe,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  MessageSquare,
  Languages,
  Share2,
  Instagram,
  Twitter,
  MessageCircle,
  Facebook,
  Linkedin,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { Worker, Job } from '../types';
import JobCard from './JobCard';
import SvgUpiQrCode from './SvgUpiQrCode';
import WorkerNutritionScreener from './WorkerNutritionScreener';
import CivicHazardMiniMap, { CivicHazardLocation, DEFAULT_HAZARDS } from './CivicHazardMiniMap';
import { geminiService, ChatMessageContext } from '../services/geminiService';
import MultilingualAIAssistantModal from './MultilingualAIAssistantModal';
import GovtSwachhataReceiptModal from './GovtSwachhataReceiptModal';
import SwachhataSocialEscalationModal from './SwachhataSocialEscalationModal';
import LiveCameraModal from './LiveCameraModal';

interface EmpowermentPlatformViewProps {
  onBackToMainApp?: () => void;
  initialMode?: 'customer' | 'worker';
}

// Preset Hazard Images & Data for Column 2 (Civic Hygiene)
const PRESET_HAZARDS = [
  {
    id: 'hazard-1',
    title: 'Stagnant Dirty Water & Mosquito Breeding Pool',
    category: 'Vector Disease Breeding Site / Stagnant Water',
    riskLevel: 'High' as const,
    riskColor: 'bg-red-100 text-red-700 border-red-300',
    location: 'Mayur Vihar Phase 1, Pocket 4, Drain Junction',
    pincode: '110091',
    gps: '28.6139° N, 77.2985° E',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=500&auto=format&fit=crop&q=80',
    description: 'Deep puddle of dirty stagnant rainwater accumulating near local residential market, emitting foul odor and breeding vector mosquitoes.'
  },
  {
    id: 'hazard-2',
    title: 'Overflowing Municipal Garbage Dump',
    category: 'Solid Waste Decomposition & Biohazard',
    riskLevel: 'High' as const,
    riskColor: 'bg-red-100 text-red-700 border-red-300',
    location: 'Trilokpuri Block 18 Roadside Bin, Delhi',
    pincode: '110091',
    gps: '28.6085° N, 77.3042° E',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=500&auto=format&fit=crop&q=80',
    description: 'Overfilled municipal vat spilling plastic, rotting food waste onto sidewalk, blocking pedestrian path and attracting stray animals.'
  },
  {
    id: 'hazard-3',
    title: 'Blocked Drainage & Sludge Overflow',
    category: 'Stormwater Clogging & Sanitation Failure',
    riskLevel: 'Medium' as const,
    riskColor: 'bg-amber-100 text-amber-800 border-amber-300',
    location: 'Patparganj Industrial Area Road #2',
    pincode: '110092',
    gps: '28.6291° N, 77.3114° E',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    description: 'Subterranean street drain choked with solid construction debris and silt, backing water into street side shops.'
  }
];

// Preset Worker Meals for Column 3 (Nutrition Screener)
const PRESET_MEALS = [
  {
    id: 'meal-1',
    name: 'Classic Standard Thali (Dal, Rice, 3 Roti, Aloo Sabzi)',
    calories: 680,
    calTarget: 2400,
    protein: 19,
    proteinTarget: 65,
    ironMg: 3.8,
    ironTarget: 17,
    imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&auto=format&fit=crop&q=80',
    items: ['Boiled Rice (1 bowl)', 'Toor Dal (1 katori)', 'Whole Wheat Roti (3 pcs)', 'Spiced Aloo Gobhi'],
    recommendations: [
      { text: 'Add ₹5 Jaggery (Gur) for Iron boost & natural digestion', cost: '₹5', nutrient: 'Iron' },
      { text: 'Add ₹10 Sprouted Green Moong for +8g raw protein', cost: '₹10', nutrient: 'Protein' },
      { text: 'Squeeze half a fresh Lemon (Nimbu) for Vitamin C & Iron absorption', cost: '₹3', nutrient: 'Vitamin C' }
    ]
  },
  {
    id: 'meal-2',
    name: 'Egg Curry & Rice Meal (2 Boiled Eggs + Rice + Salad)',
    calories: 740,
    calTarget: 2400,
    protein: 29,
    proteinTarget: 65,
    ironMg: 5.2,
    ironTarget: 17,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
    items: ['2 Whole Eggs in Onion-Tomato Gravy', 'Steamed White Rice (1.5 bowl)', 'Onion-Cucumber Kachumber'],
    recommendations: [
      { text: 'Add 1 glass of Buttermilk / Chaas for gut hydration & calcium', cost: '₹10', nutrient: 'Calcium' },
      { text: 'Include roasted chana (gram) for evening fiber intake', cost: '₹10', nutrient: 'Fiber' }
    ]
  },
  {
    id: 'meal-3',
    name: 'Khichdi & Roasted Papad Quick Lunch',
    calories: 520,
    calTarget: 2400,
    protein: 15,
    proteinTarget: 65,
    ironMg: 2.9,
    ironTarget: 17,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',
    items: ['Moong Dal & Rice Khichdi', 'Ghee (1 tsp)', 'Roasted Urad Papad'],
    recommendations: [
      { text: 'Add 1 boiled egg or 50g roasted peanuts to reach daily protein', cost: '₹8', nutrient: 'Protein' },
      { text: 'Include drumstick / moringa leaves in khichdi for multivitamin supply', cost: '₹5', nutrient: 'Iron & Vit A' }
    ]
  }
];

// Healthcare Facilities in 110091 (Mayur Vihar / Trilokpuri)
const NEARBY_HEALTHCARE = [
  {
    id: 'phc-1',
    name: 'Jan Aushadhi Kendra #1084 (Generic Medicine)',
    type: 'Generic Pharmacy (PMBJP)',
    distance: '0.4 km',
    address: 'Near Metro Pillar 42, Mayur Vihar Phase 1, Delhi',
    savings: 'Save up to 85% on Essential Medicines',
    phone: '+91 11 2275 8891',
    timing: '8:00 AM - 9:00 PM'
  },
  {
    id: 'phc-2',
    name: 'Delhi Govt Aam Aadmi Mohalla Clinic',
    type: 'Primary Health Center (Free Consult & 212 Tests)',
    distance: '0.7 km',
    address: 'Pocket 1 DDA Community Center, Mayur Vihar',
    savings: '100% Free Blood Tests & Anemia Screening',
    phone: '+91 11 2271 0044',
    timing: '8:00 AM - 2:00 PM (Mon-Sat)'
  },
  {
    id: 'phc-3',
    name: 'Lal Bahadur Shastri Hospital (Govt)',
    type: 'District Civil Hospital',
    distance: '1.8 km',
    address: 'Khichripur, Near Kalyanpuri, Delhi 110091',
    savings: '24x7 Emergency & Specialized Trauma Care',
    phone: '+91 11 2277 4145',
    timing: 'Open 24 Hours'
  }
];

export const EmpowermentPlatformView: React.FC<EmpowermentPlatformViewProps> = ({
  onBackToMainApp,
  initialMode = 'customer'
}) => {
  // Authentication Portal Landing state
  const [isAuthenticatedView, setIsAuthenticatedView] = useState<boolean>(false);
  const [portalMode, setPortalMode] = useState<'customer' | 'worker'>(initialMode);
  const [activeLocation, setActiveLocation] = useState<string>('Mayur Vihar, Delhi 110091');
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const [tempLocationInput, setTempLocationInput] = useState<string>('Mayur Vihar, Delhi 110091');

  // Emergency SOS state
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [sosCountdown, setSosCountdown] = useState<number>(5);
  const [sosDispatched, setSosDispatched] = useState<boolean>(false);

  // Worker-Specific States
  const [workerJobStartOtpInput, setWorkerJobStartOtpInput] = useState<string>('');
  const [workerJobOtpVerified, setWorkerJobOtpVerified] = useState<boolean>(false);
  const [acceptedSanitationGigId, setAcceptedSanitationGigId] = useState<string | null>(null);
  const [sanitationCompletionPhoto, setSanitationCompletionPhoto] = useState<string | null>(null);
  const [sanitationPayoutReceived, setSanitationPayoutReceived] = useState<boolean>(false);
  const [sanitationPayoutAmount, setSanitationPayoutAmount] = useState<number>(650);
  const [workerSubModalOpen, setWorkerSubModalOpen] = useState<boolean>(false);

  // Customer Mode Column 3 States
  const [customerWaterTestResult, setCustomerWaterTestResult] = useState<'safe' | 'turbid' | 'chlorinated'>('safe');
  const [customerShowNutritionScreener, setCustomerShowNutritionScreener] = useState<boolean>(false);

  // ==========================================
  // MODULE 1 (COLUMN 1): MARKETPLACE STATE
  // ==========================================
  const [pincodeSearch, setPincodeSearch] = useState<string>('110091');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [subscriptionTier, setSubscriptionTier] = useState<'monthly' | 'daily'>('monthly');
  const [priorityBoostActive, setPriorityBoostActive] = useState<boolean>(true);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);

  // Bargaining & Booking Modal
  const [bargainModalOpen, setBargainModalOpen] = useState<boolean>(false);
  const [selectedWorkerForBargain, setSelectedWorkerForBargain] = useState<any>(null);
  const [customerOfferAmount, setCustomerOfferAmount] = useState<string>('400');
  const [negotiationChat, setNegotiationChat] = useState<Array<{ sender: 'customer' | 'worker'; text: string; time: string }>>([]);
  const [isWorkerResponding, setIsWorkerResponding] = useState<boolean>(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [bookingOtp, setBookingOtp] = useState<string>('2693');
  const [showUpiQrModal, setShowUpiQrModal] = useState<boolean>(false);
  const [workProofPreview, setWorkProofPreview] = useState<boolean>(false);
  const [selectedReviewTags, setSelectedReviewTags] = useState<string[]>(['Punctual', 'High Quality']);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  // Workers list in Column 1
  const [workersList, setWorkersList] = useState([
    {
      id: 'w-101',
      name: 'Arjun Deshmukh',
      trade: 'Plumbing & Water Systems',
      category: 'plumbing',
      distance: 0.8,
      rating: 4.8,
      reviewsCount: 64,
      basePrice: 450,
      photoUrl: 'https://images.unsplash.com/photo-1540560485458-3473b307985c?w=400&h=400&fit=crop',
      upiId: 'arjun.pro@okhdfcbank',
      badges: ['Verified Govt ID', 'Safety Gear Certified', 'Aadhaar KYC'],
      isPriority: true,
      lastWork: 'Geyser line pressure fitting at Pocket 2',
      coordinates: { lat: 28.6129, lng: 77.2985 }
    },
    {
      id: 'w-102',
      name: 'Ramesh Verma',
      trade: 'Electrical & MCB Wiring',
      category: 'electrical',
      distance: 1.1,
      rating: 4.9,
      reviewsCount: 82,
      basePrice: 500,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      upiId: 'ramesh.electric@okaxis',
      badges: ['Verified Govt ID', 'High Voltage Certified'],
      isPriority: false,
      lastWork: 'Short-circuit resolution at Phase 1 Market',
      coordinates: { lat: 28.6145, lng: 77.3012 }
    },
    {
      id: 'w-103',
      name: 'Sunil Kumar',
      trade: 'Sanitation & Drain Cleaning',
      category: 'sanitation',
      distance: 0.6,
      rating: 4.7,
      reviewsCount: 45,
      basePrice: 350,
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      upiId: 'sunil.clean@paytm',
      badges: ['Verified Govt ID', 'Protective Mask Certified'],
      isPriority: true,
      lastWork: 'Storm drain unclogging & silt clearance',
      coordinates: { lat: 28.6111, lng: 77.2954 }
    }
  ]);

  // Scheduled Jobs in Column 1 (Demonstrating JobCard with automated 30-min reminder)
  const [scheduledJobs, setScheduledJobs] = useState<Job[]>([
    {
      id: 'job-rem-1',
      title: 'Main Pipeline Valve & Tap Fitting',
      description: 'Scheduled residential plumbing inspection and replacement of leaking control valve.',
      category: 'plumbing',
      status: 'assigned',
      isEmergency: false,
      location: 'Flat 304, Pocket 4, Mayur Vihar Phase 1, Delhi 110091',
      price: 450,
      customerName: 'Rohan Sharma',
      customerPhone: '+91 98112 44512'
    }
  ]);

  // ==========================================
  // MODULE 2 (COLUMN 2): CIVIC HYGIENE STATE
  // ==========================================
  const [hazardsList, setHazardsList] = useState<CivicHazardLocation[]>(DEFAULT_HAZARDS);
  const [selectedHazardId, setSelectedHazardId] = useState<string>(DEFAULT_HAZARDS[0].id);
  const [ticketId, setTicketId] = useState<string>(DEFAULT_HAZARDS[0].ticketId);
  const [currentEscalationDay, setCurrentEscalationDay] = useState<number>(DEFAULT_HAZARDS[0].escalationDay); // 0, 3, or 7
  const [isSanitationDispatched, setIsSanitationDispatched] = useState<boolean>(false);
  const [hazardDrawerOpen, setHazardDrawerOpen] = useState<boolean>(true);
  const [uploadedHazardPhoto, setUploadedHazardPhoto] = useState<string | null>(null);
  
  // Custom Hazard Creation / Pin Drop State
  const [isReportingNewHazard, setIsReportingNewHazard] = useState<boolean>(false);
  const [newHazardTitle, setNewHazardTitle] = useState<string>('');
  const [newHazardCategory, setNewHazardCategory] = useState<string>('Vector Disease Breeding Site / Stagnant Water');
  const [newHazardRisk, setNewHazardRisk] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newHazardCustomLocation, setNewHazardCustomLocation] = useState<string>('Mayur Vihar Phase 1, Pocket 4, Drain Junction');

  // Swachhata Citizen App & Government Dispatch State
  const [customerCivicTab, setCustomerCivicTab] = useState<'report_dispatch' | 'leaflet_map' | 'vector_radar' | 'water_quality'>('report_dispatch');
  const [swachhataGovtReceipt, setSwachhataGovtReceipt] = useState<{
    ticketId: string;
    timestamp: string;
    title: string;
    location: string;
    gps: string;
    ward: string;
    photoUrl: string;
  } | null>(null);

  // Multilingual AI Voice & Chat Assistant State
  const [showAiAssistantModal, setShowAiAssistantModal] = useState<boolean>(false);
  const [assistantLanguage, setAssistantLanguage] = useState<string>('Hinglish');
  const [assistantInput, setAssistantInput] = useState<string>('');
  const [assistantMessages, setAssistantMessages] = useState<Array<{ role: 'user' | 'model'; text: string; time: string }>>([
    {
      role: 'model',
      text: 'Namaste! Main aapka Swachhata aur Nutrition AI Mitra hoon. Aap mujhse kisi bhi Indian language (Hindi, Hinglish, Bengali, Marathi, Tamil, Telugu, Gujarati etc.) mein pooch sakte hain - kachre/gandagi ki photo khinch kar government ko complaint kaise bhejein, ya apni thali ka calorie count aur daily diet chart kaise banayein!',
      time: 'Just now'
    }
  ]);
  const [isAssistantThinking, setIsAssistantThinking] = useState<boolean>(false);
  const [isSpeakingAloud, setIsSpeakingAloud] = useState<boolean>(false);
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);

  // Send Photo & Location to Municipal Government (MCD / Ward Inspector)
  const handleSendToGovernment = (
    title: string,
    category: string,
    risk: 'High' | 'Medium' | 'Low',
    locationStr: string,
    photoUrl?: string
  ) => {
    const newTicket = `DEL-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newId = `hazard-${Date.now()}`;
    const offsetLat = (Math.random() - 0.5) * 0.015;
    const offsetLng = (Math.random() - 0.5) * 0.015;
    const photo = photoUrl || uploadedHazardPhoto || 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=500&auto=format&fit=crop&q=80';
    const loc = locationStr || activeLocation;

    const newHazard: CivicHazardLocation = {
      id: newId,
      title: title || 'Reported Local Civic Hazard',
      category: category || 'Solid Waste & Sanitation Failure',
      riskLevel: risk,
      lat: 28.6125 + offsetLat,
      lng: 77.3015 + offsetLng,
      location: loc,
      pincode: '110091',
      ticketId: newTicket,
      escalationDay: 0,
      imageUrl: photo,
      payoutRupees: risk === 'High' ? 750 : 550,
      status: 'reported',
      reportedAt: 'Just Filed to Govt',
      vectorDiseaseRisk: `${risk} Risk Biohazard`
    };

    setHazardsList(prev => [newHazard, ...prev]);
    setSelectedHazardId(newId);
    setTicketId(newTicket);
    setCurrentEscalationDay(0);
    setIsReportingNewHazard(false);

    setSwachhataGovtReceipt({
      ticketId: newTicket,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
      title: title || 'Reported Local Civic Hazard',
      location: loc,
      gps: `28.${Math.floor(6000 + Math.random()*200)}° N, 77.${Math.floor(2900 + Math.random()*200)}° E`,
      ward: 'Ward #44 Sanitation Division, MCD East Delhi',
      photoUrl: photo
    });
  };

  // Assistant Messaging
  const handleSendAssistantMessage = async (customMessage?: string) => {
    const textToSend = customMessage || assistantInput.trim();
    if (!textToSend || isAssistantThinking) return;

    const userEntry = {
      role: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAssistantMessages(prev => [...prev, userEntry]);
    setAssistantInput('');
    setIsAssistantThinking(true);

    try {
      const historyContext: ChatMessageContext[] = assistantMessages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const reply = await geminiService.chatMultilingualAssistant(
        textToSend,
        historyContext,
        assistantLanguage,
        portalMode
      );

      const botEntry = {
        role: 'model' as const,
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setAssistantMessages(prev => [...prev, botEntry]);
    } catch (e) {
      console.error(e);
      setAssistantMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: 'Namaste! Swachhata complaint filed karne ke liye photo aur location add karke Send dabayein. Diet chart ke liye Column 3 mein Generate Diet Chart click karein!',
          time: 'Just now'
        }
      ]);
    } finally {
      setIsAssistantThinking(false);
    }
  };

  // Voice Read-Aloud
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not available in your browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (assistantLanguage === 'Hindi' || assistantLanguage.includes('हिंदी')) {
      utterance.lang = 'hi-IN';
    } else if (assistantLanguage === 'Bengali') {
      utterance.lang = 'bn-IN';
    } else if (assistantLanguage === 'Tamil') {
      utterance.lang = 'ta-IN';
    } else if (assistantLanguage === 'Marathi') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-IN';
    }
    utterance.onstart = () => setIsSpeakingAloud(true);
    utterance.onend = () => setIsSpeakingAloud(false);
    utterance.onerror = () => setIsSpeakingAloud(false);
    window.speechSynthesis.speak(utterance);
  };

  // Voice Speech-to-Text
  const startVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query in the box.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = assistantLanguage === 'Hindi' ? 'hi-IN' : 'en-IN';
      setIsListeningVoice(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListeningVoice(false);
        setAssistantInput(transcript);
        handleSendAssistantMessage(transcript);
      };
      recognition.onerror = () => setIsListeningVoice(false);
      recognition.onend = () => setIsListeningVoice(false);
      recognition.start();
    } catch (e) {
      setIsListeningVoice(false);
    }
  };

  // ==========================================
  // MODULE 3 (COLUMN 3): HEALTH & NUTRITION STATE
  // ==========================================
  const [selectedMealIndex, setSelectedMealIndex] = useState<number>(0);
  const [customerNutritionTab, setCustomerNutritionTab] = useState<'vector' | 'water' | 'family-thali' | 'pharmacies'>('vector');
  // Anemia Eyelid / Nail Screener State
  const [anemiaScanActive, setAnemiaScanActive] = useState<boolean>(false);
  const [anemiaPallorScore, setAnemiaPallorScore] = useState<number>(28);
  const [anemiaRiskLabel, setAnemiaRiskLabel] = useState<string>('Mild Anemia (Hb ~10.4 g/dL)');
  const [anemiaScanComplete, setAnemiaScanComplete] = useState<boolean>(true);

  // SOS Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sosActive && sosCountdown > 0) {
      timer = setTimeout(() => {
        setSosCountdown(prev => prev - 1);
      }, 1000);
    } else if (sosActive && sosCountdown === 0) {
      setSosDispatched(true);
    }
    return () => clearTimeout(timer);
  }, [sosActive, sosCountdown]);

  const handleTriggerSos = () => {
    setSosActive(true);
    setSosCountdown(5);
    setSosDispatched(false);
  };

  const handleCancelSos = () => {
    setSosActive(false);
    setSosDispatched(false);
    setSosCountdown(5);
  };

  // Multilingual AI Assistant State
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [aiAssistantTopic, setAiAssistantTopic] = useState<'hygiene' | 'nutrition' | 'general'>('general');

  // Government Swachhata Submission Receipt State
  const [isGovtReceiptOpen, setIsGovtReceiptOpen] = useState<boolean>(false);
  const [isSubmittingToGovt, setIsSubmittingToGovt] = useState<boolean>(false);
  const [govtSubmissionStep, setGovtSubmissionStep] = useState<string>('');

  // Social Media Escalation Modal State (Instagram, Twitter, WhatsApp)
  const [isSocialEscalationOpen, setIsSocialEscalationOpen] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Device Camera Modal State for Direct In-App Snapping
  const [isCleaningCameraOpen, setIsCleaningCameraOpen] = useState<boolean>(false);
  const [cleaningCameraConfig, setCleaningCameraConfig] = useState<{
    title: string;
    subtitle: string;
    watermarkText: string;
    target: 'dirty_spot' | 'worker_cleanup' | 'new_hazard';
  }>({
    title: 'Click Location Photo Directly',
    subtitle: 'Position camera over the target area and tap Snap',
    watermarkText: 'SWACHHATA GEO-RADAR',
    target: 'dirty_spot'
  });

  // Social Media Portfolio Showcase State (Instagram, Facebook, LinkedIn)
  const [socialProfiles, setSocialProfiles] = useState({
    instagram: '@arjun_trades_mumbai',
    facebook: 'arjun.artisan.trades',
    linkedin: 'arjun-deshmukh-craftsman'
  });
  const [isEditingSocialProfiles, setIsEditingSocialProfiles] = useState<boolean>(false);
  const [tempSocialProfiles, setTempSocialProfiles] = useState(socialProfiles);
  const [showSocialPortfolioBar, setShowSocialPortfolioBar] = useState<boolean>(false);

  // Native Web Share API Profile Sharing Handler
  const handleShareProfile = async (target?: { name: string; trade?: string; id?: string }) => {
    const artisanName = target?.name || (portalMode === 'worker' ? 'Arjun Deshmukh (Master Artisan)' : 'Locals Trade India Member Profile');
    const artisanTrade = target?.trade || (portalMode === 'worker' ? 'Plumbing & Electrical Pro' : 'Citizen Watchdog');
    const shareUrl = `${window.location.origin}/#profile/${encodeURIComponent(artisanName.toLowerCase().replace(/\s+/g, '-'))}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${artisanName} - Verified Trade Artisan on Locals Trade India`,
          text: `Hire ${artisanName} (${artisanTrade}) directly with 0% platform commission, Aadhaar KYC verification, and live turn-by-turn tracking on Locals Trade India!`,
          url: shareUrl
        });
        setShareToast(`✓ Shared profile of ${artisanName}!`);
        setTimeout(() => setShareToast(null), 3000);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.warn('Native share failed, falling back to clipboard:', err);
      }
    }

    // Fallback: Copy link to clipboard
    navigator.clipboard?.writeText(shareUrl);
    setShareToast(`✓ Public Profile Link for ${artisanName} copied to clipboard! Share on WhatsApp, Instagram or SMS.`);
    setTimeout(() => setShareToast(null), 4000);
  };

  const handleSendReportToGovernment = async () => {
    setIsSubmittingToGovt(true);
    setGovtSubmissionStep('Encoding geotagged photographic proof with GPS EXIF metadata...');
    await new Promise(r => setTimeout(r, 600));
    setGovtSubmissionStep('Transmitting to Swachh Bharat Mission Central API & Delhi MCD Portal...');
    await new Promise(r => setTimeout(r, 700));
    setGovtSubmissionStep('Assigning Ward #44 Sanitary Inspector & registering 7-Day SLA...');
    await new Promise(r => setTimeout(r, 600));
    setIsSubmittingToGovt(false);
    setGovtSubmissionStep('');
    setIsGovtReceiptOpen(true);
  };

  // Add new civic hazard with live pin on Leaflet map
  const handleAddNewHazard = (
    title: string, 
    category: string, 
    riskLevel: 'High' | 'Medium' | 'Low', 
    locationStr: string, 
    photoUrl?: string
  ) => {
    const newId = `hazard-${Date.now()}`;
    const newTicket = `DEL-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const offsetLat = (Math.random() - 0.5) * 0.015;
    const offsetLng = (Math.random() - 0.5) * 0.015;
    
    const newHazard: CivicHazardLocation = {
      id: newId,
      title: title || 'Reported Local Civic Hazard',
      category: category || 'Solid Waste & Sanitation Failure',
      riskLevel: riskLevel || 'High',
      lat: 28.6125 + offsetLat,
      lng: 77.3015 + offsetLng,
      location: locationStr || activeLocation,
      pincode: '110091',
      ticketId: newTicket,
      escalationDay: 0,
      imageUrl: photoUrl || uploadedHazardPhoto || 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=500&auto=format&fit=crop&q=80',
      payoutRupees: riskLevel === 'High' ? 750 : 550,
      status: 'reported',
      reportedAt: 'Just reported by You',
      vectorDiseaseRisk: `${riskLevel} Risk Vector Spot`
    };

    setHazardsList(prev => [newHazard, ...prev]);
    setSelectedHazardId(newId);
    setTicketId(newTicket);
    setCurrentEscalationDay(0);
    setIsReportingNewHazard(false);
    setNewHazardTitle('');
  };

  // Mark sanitation gig as completed by worker
  const handleCompleteSanitationGig = (gigId: string) => {
    setHazardsList(prev => prev.map(h => {
      if (h.id === gigId) {
        return {
          ...h,
          status: 'resolved',
          reportedAt: 'Cleaned up by You (Verified)',
          vectorDiseaseRisk: 'Sanitized & Disinfected ✓'
        };
      }
      return h;
    }));
    setSanitationPayoutReceived(true);
  };

  // Bargain workflow simulation
  const handleOpenBargain = (worker: any) => {
    setSelectedWorkerForBargain(worker);
    setCustomerOfferAmount(String(worker.basePrice - 50));
    setNegotiationChat([
      {
        sender: 'worker',
        text: `Namaste! My standard charge for ${worker.trade} is ₹${worker.basePrice}. What is your counter-offer?`,
        time: 'Just now'
      }
    ]);
    setBookingConfirmed(false);
    setReviewSubmitted(false);
    setBargainModalOpen(true);
  };

  const handleSendBargainOffer = () => {
    const offerNum = Number(customerOfferAmount) || 350;
    const newChat = [
      ...negotiationChat,
      {
        sender: 'customer' as const,
        text: `Can you do this service for ₹${offerNum}? I am at ${activeLocation}.`,
        time: 'Just now'
      }
    ];
    setNegotiationChat(newChat);
    setIsWorkerResponding(true);

    setTimeout(() => {
      setIsWorkerResponding(false);
      const agreedFinal = offerNum >= selectedWorkerForBargain.basePrice - 80 ? offerNum : selectedWorkerForBargain.basePrice - 50;
      setNegotiationChat(prev => [
        ...prev,
        {
          sender: 'worker',
          text: `Agreed at ₹${agreedFinal}! 0% middleman cut means I keep 100%. I am heading out now with my tools.`,
          time: 'Just now'
        }
      ]);
      setBookingConfirmed(true);
    }, 1200);
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'DESI20') {
      setAppliedDiscount(50);
      setCouponSuccessMsg('✓ Promo DESI20 Applied: ₹50 Instant Subsidy (0% impact on worker!)');
    } else {
      setAppliedDiscount(0);
      setCouponSuccessMsg('Invalid code. Try "DESI20" for ₹50 off.');
    }
  };

  const activeHazard = hazardsList.find(h => h.id === selectedHazardId) || hazardsList[0];
  const activeMeal = PRESET_MEALS[selectedMealIndex];

  // =========================================================================
  // VIEW 1: INITIAL AUTHENTICATION LANDING VIEW (Matches Brand Specs & Mockup)
  // =========================================================================
  if (!isAuthenticatedView) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900 animate-in fade-in duration-300">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-6">
          
          {/* Circular Logo Emblem from Screenshot */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
              {/* Upper Arc in Dark Slate / Navy with Tech Traces */}
              <path
                d="M 22 45 A 36 36 0 0 1 78 45"
                fill="none"
                stroke="#1E293B"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Lower Arc in Vibrant Orange */}
              <path
                d="M 22 55 A 36 36 0 0 0 78 55"
                fill="none"
                stroke="#F97316"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Orange Connection Nodes */}
              <circle cx="20" cy="50" r="4.5" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="80" cy="50" r="4.5" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.5" />
              {/* Tech Node Dots on Top Arc */}
              <circle cx="36" cy="22" r="2.5" fill="#3B82F6" />
              <circle cx="64" cy="22" r="2.5" fill="#3B82F6" />
              {/* Central Technical Gear / Spoke Wheel */}
              <circle cx="50" cy="50" r="14" fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 2" />
              <circle cx="50" cy="50" r="5" fill="#1E293B" />
              {/* Spokes */}
              <line x1="50" y1="36" x2="50" y2="45" stroke="#64748B" strokeWidth="1.5" />
              <line x1="50" y1="55" x2="50" y2="64" stroke="#64748B" strokeWidth="1.5" />
              <line x1="36" y1="50" x2="45" y2="50" stroke="#64748B" strokeWidth="1.5" />
              <line x1="55" y1="50" x2="64" y2="50" stroke="#64748B" strokeWidth="1.5" />
              <line x1="40" y1="40" x2="46" y2="46" stroke="#64748B" strokeWidth="1.2" />
              <line x1="54" y1="54" x2="60" y2="60" stroke="#64748B" strokeWidth="1.2" />
              <line x1="60" y1="40" x2="54" y2="46" stroke="#64748B" strokeWidth="1.2" />
              <line x1="46" y1="54" x2="40" y2="60" stroke="#64748B" strokeWidth="1.2" />
            </svg>
          </div>

          {/* Brand Titles */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-[#1E293B] tracking-tight">
              Local Trades <span className="text-[#F97316]">India</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-500 mt-0.5">
              CONNECTING VERIFIED WORKERS DIRECTLY TO PEOPLE
            </p>
          </div>

          {/* Authentication Subhead */}
          <div className="pt-2 space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#0F172A] tracking-tight">
              IDENTITY AUTHENTICATED
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              Select your portal mode for Local Trades India
            </p>
          </div>

          {/* Two Selectable Persona Action Cards (Faithful to Mockup) */}
          <div className="w-full space-y-4 pt-1">
            {/* Card 1: Worker / Pro */}
            <button
              type="button"
              onClick={() => {
                setPortalMode('worker');
                setIsAuthenticatedView(true);
              }}
              className="w-full p-6 sm:p-7 rounded-3xl bg-[#EFF6FF] hover:bg-[#E0F2FE] border-2 border-[#BFDBFE] hover:border-blue-400 shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center space-y-3 group cursor-pointer active:scale-[0.99]"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Briefcase size={26} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-[#1E3A8A] tracking-wide">
                  ENTER AS WORKER / PRO
                </h3>
                <p className="text-[11px] font-extrabold uppercase text-[#2563EB] tracking-wider">
                  ACCEPT GIGS, VERIFY KYC & BUILD PORTFOLIO
                </p>
              </div>
            </button>

            {/* Card 2: Customer / Client */}
            <button
              type="button"
              onClick={() => {
                setPortalMode('customer');
                setIsAuthenticatedView(true);
              }}
              className="w-full p-6 sm:p-7 rounded-3xl bg-[#FFF7ED] hover:bg-[#FFEDD5] border-2 border-[#FED7AA] hover:border-orange-400 shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center space-y-3 group cursor-pointer active:scale-[0.99]"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F97316] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <User size={26} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-[#7C2D12] tracking-wide">
                  ENTER AS CUSTOMER / CLIENT
                </h3>
                <p className="text-[11px] font-extrabold uppercase text-[#EA580C] tracking-wider">
                  HIRE VERIFIED PROS & POST TASKS
                </p>
              </div>
            </button>
          </div>

          {/* Trust Guarantees Footer */}
          <div className="pt-3 flex items-center justify-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" /> 0% Platform Commission
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-amber-600" /> Aadhaar KYC Verified Artisans
            </span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: MAIN 3-COLUMN EXECUTION DASHBOARD (Persistent 3-Column Layout Grid)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* -------------------------------------------------------------
          GLOBAL HEADER & SAFETY CONTROL
         ------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-[#0F172A] text-white px-4 py-3 sm:px-6 shadow-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-400 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-[#0F172A] rounded-[0.9rem] flex items-center justify-center font-black text-white">
                <Sparkles size={18} className="text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-white">
                  Locals Trade India
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-full">
                  0% CUT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                AI Health, Hygiene & Worker Empowerment Platform
              </p>
            </div>
          </div>

          {/* Location Pill & Mode Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Active Location Pill */}
            <div className="relative">
              {isEditingLocation ? (
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
                  <MapPin size={12} className="text-red-400" />
                  <input
                    type="text"
                    value={tempLocationInput}
                    onChange={(e) => setTempLocationInput(e.target.value)}
                    className="bg-transparent text-xs text-white outline-none w-44 font-medium"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setActiveLocation(tempLocationInput);
                      setIsEditingLocation(false);
                    }}
                    className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(true)}
                  className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                  title="Click to edit location"
                >
                  <MapPin size={13} className="text-red-400 flex-shrink-0" />
                  <span className="truncate max-w-[170px] sm:max-w-[220px]">{activeLocation}</span>
                  <span className="text-[9px] text-slate-400 underline ml-1">Edit</span>
                </button>
              )}
            </div>

            {/* Mode Switcher Toggle (Worker Mode vs Customer Mode) */}
            <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPortalMode('customer')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  portalMode === 'customer'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Customer Mode
              </button>
              <button
                type="button"
                onClick={() => setPortalMode('worker')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  portalMode === 'worker'
                    ? 'bg-emerald-600 text-white font-black shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Worker / Pro Mode
              </button>
            </div>

            {/* Multilingual AI Mitra Assistant Button */}
            <button
              type="button"
              onClick={() => {
                setAiAssistantTopic('general');
                setIsAIAssistantOpen(true);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              title="Multilingual AI Assistant (Talk in Any Language)"
            >
              <Languages size={14} />
              <span>AI Mitra (All Languages)</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              type="button"
              onClick={handleTriggerSos}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-900/40 animate-pulse active:scale-95 transition-all"
              title="1.5 km Zone Emergency Broadcast"
            >
              <AlertTriangle size={14} />
              <span>SOS</span>
            </button>

            {/* Landing Switcher */}
            <button
              type="button"
              onClick={() => setIsAuthenticatedView(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all text-xs"
              title="Switch Mode Landing"
            >
              Portal View
            </button>
          </div>
        </div>
      </header>

      {/* Emergency SOS Alert Drawer (When Activated) */}
      {sosActive && (
        <div className="bg-red-600 text-white p-4 shadow-2xl relative z-40 animate-in slide-in-from-top-4 duration-300 border-b border-red-400">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center font-black animate-ping">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm uppercase tracking-wide">
                    EMERGENCY SOS DISPATCH TRIGGERED (1.5 KM ZONE SCAN)
                  </h4>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    GPS: {activeLocation}
                  </span>
                </div>
                <p className="text-xs text-red-100 mt-0.5">
                  {sosDispatched
                    ? 'Nearest 3 Emergency Artisans (Electrician & Plumber) dispatched! Responding in ~4 minutes.'
                    : `Broadcasting emergency distress alert to verified workers within 1.5 km in ${sosCountdown}s...`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {sosDispatched ? (
                <span className="px-3 py-1.5 bg-white text-red-700 rounded-xl text-xs font-black flex items-center gap-1">
                  <CheckCircle2 size={14} /> DISPATCH CONFIRMED
                </span>
              ) : null}
              <button
                type="button"
                onClick={handleCancelSos}
                className="px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white rounded-xl text-xs font-bold transition-all"
              >
                Cancel SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MULTI-COLUMN WORKSPACE ARCHITECTURE (3-COLUMN LAYOUT GRID)
         ------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {/* Profile Context Banner (Separate Profile for Customer vs Worker) */}
        <div className={`p-4 rounded-3xl border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-all ${
          portalMode === 'worker'
            ? 'bg-gradient-to-r from-[#064E3B] via-[#0F172A] to-[#1E293B] text-white border-emerald-500/40'
            : 'bg-gradient-to-r from-[#7C2D12] via-[#0F172A] to-[#1E293B] text-white border-orange-500/40'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-md flex-shrink-0 ${
              portalMode === 'worker' ? 'bg-emerald-600 text-white' : 'bg-orange-500 text-white'
            }`}>
              {portalMode === 'worker' ? <Briefcase size={22} /> : <User size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black tracking-tight text-white">
                  {portalMode === 'worker'
                    ? 'Worker Pro Profile: Civic Sanitation Gigs & Heavy Labor Nutrition'
                    : 'Customer Profile: Civic Hazard Reporting & Family Health Radar'}
                </h3>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  portalMode === 'worker'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                }`}>
                  {portalMode === 'worker' ? '0% Commission Active' : 'Citizen Watchdog Active'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {portalMode === 'worker'
                  ? 'Sanitation bounties on Leaflet radar • 2,400 kcal & heavy labor protein tracking • ₹5 pocket-friendly boosters'
                  : 'Report local biohazards with Leaflet pins • 7-Day Swachhata Govt SLA • Drinking water & dengue outbreak diagnostics'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => handleShareProfile()}
              className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/25 shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Share public artisan profile link using native Web Share API"
            >
              <Share2 size={13} className="text-amber-300" />
              <span>Share Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSocialPortfolioBar(!showSocialPortfolioBar)}
              className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/25 shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Link & Showcase Instagram, Facebook & LinkedIn Profiles"
            >
              <Globe size={13} className="text-pink-300" />
              <span>Social Profiles</span>
            </button>

            <button
              type="button"
              onClick={() => setPortalMode(portalMode === 'worker' ? 'customer' : 'worker')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                portalMode === 'worker'
                  ? 'bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold'
              }`}
            >
              <span>Switch to {portalMode === 'worker' ? 'Customer Profile' : 'Worker Profile'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Social Media Integration & Portfolio Showcase Section */}
        {showSocialPortfolioBar && (
          <div className="mb-6 p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTempSocialProfiles(socialProfiles);
                    setIsEditingSocialProfiles(!isEditingSocialProfiles);
                  }}
                  className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Edit3 size={11} />
                  <span>{isEditingSocialProfiles ? 'Cancel' : 'Edit Profiles'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSocialPortfolioBar(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Badges or Edit Form */}
            {!isEditingSocialProfiles ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href={socialProfiles.instagram.startsWith('http') ? socialProfiles.instagram : `https://instagram.com/${socialProfiles.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 border border-pink-200 flex items-center justify-between transition-all"
                  title="View Instagram Portfolio"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
                      <Instagram size={13} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-pink-900 block uppercase">Instagram</span>
                      <span className="text-xs font-black text-pink-950 truncate block">{socialProfiles.instagram}</span>
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-pink-400" />
                </a>

                <a
                  href={socialProfiles.facebook.startsWith('http') ? socialProfiles.facebook : `https://facebook.com/${socialProfiles.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 hover:from-blue-100 border border-blue-200 flex items-center justify-between transition-all"
                  title="View Facebook Profile"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[#1877F2] text-white flex items-center justify-center flex-shrink-0">
                      <Facebook size={13} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-blue-900 block uppercase">Facebook</span>
                      <span className="text-xs font-black text-blue-950 truncate block">{socialProfiles.facebook}</span>
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-blue-400" />
                </a>

                <a
                  href={socialProfiles.linkedin.startsWith('http') ? socialProfiles.linkedin : `https://linkedin.com/in/${socialProfiles.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100 border border-indigo-200 flex items-center justify-between transition-all"
                  title="View LinkedIn Profile"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center flex-shrink-0">
                      <Linkedin size={13} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-indigo-900 block uppercase">LinkedIn</span>
                      <span className="text-xs font-black text-indigo-950 truncate block">{socialProfiles.linkedin}</span>
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-indigo-400" />
                </a>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSocialProfiles(tempSocialProfiles);
                  setIsEditingSocialProfiles(false);
                  setShareToast('✓ Social portfolio profiles saved & linked to public profile!');
                  setTimeout(() => setShareToast(null), 3500);
                }}
                className="space-y-2 pt-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5 flex items-center gap-1">
                      <Instagram size={11} className="text-pink-600" /> Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={tempSocialProfiles.instagram}
                      onChange={(e) => setTempSocialProfiles({ ...tempSocialProfiles, instagram: e.target.value })}
                      placeholder="@handle"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5 flex items-center gap-1">
                      <Facebook size={11} className="text-blue-600" /> Facebook Profile
                    </label>
                    <input
                      type="text"
                      value={tempSocialProfiles.facebook}
                      onChange={(e) => setTempSocialProfiles({ ...tempSocialProfiles, facebook: e.target.value })}
                      placeholder="profile.url"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5 flex items-center gap-1">
                      <Linkedin size={11} className="text-indigo-600" /> LinkedIn Profile
                    </label>
                    <input
                      type="text"
                      value={tempSocialProfiles.linkedin}
                      onChange={(e) => setTempSocialProfiles({ ...tempSocialProfiles, linkedin: e.target.value })}
                      placeholder="linkedin-handle"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                  >
                    Save Profiles
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Global Profile Share Toast */}
        {shareToast && (
          <div className="mb-4 p-3 bg-emerald-900/90 text-white border border-emerald-400 rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>{shareToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setShareToast(null)}
              className="text-white/60 hover:text-white ml-2"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* =========================================================
              COLUMN 1: HYPER-LOCAL MARKETPLACE & WORKER HUB (MODULE 1)
             ========================================================= */}
          <section className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col space-y-4">
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#0F172A] text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                  <Users size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                      Column 1: Marketplace Hub
                    </h2>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded">
                      MODULE 1
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Hyper-local worker matching & direct zero-commission booking
                  </p>
                </div>
              </div>
            </div>

            {/* Zero-Commission & Subscription Pricing Model Banner */}
            <div className="p-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
                  0% PLATFORM CUT GUARANTEE
                </span>
                <span className="bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  Workers Keep 100%
                </span>
              </div>
              <p className="text-xs font-extrabold leading-snug">
                Workers keep 100% of their earnings. Platform runs solely on flat micro-subscriptions.
              </p>

              {/* Worker Subscription Tier Selector */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSubscriptionTier('monthly')}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    subscriptionTier === 'monthly'
                      ? 'bg-white text-slate-900 border-white shadow-xs'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Crown size={12} className="text-amber-400" />
                    <span className="text-[10px] font-black">Pro Monthly Pass</span>
                  </div>
                  <span className="text-xs font-mono font-black mt-0.5 block">₹99 / month</span>
                  <span className="text-[9px] opacity-80">Unlimited zero-fee leads</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubscriptionTier('daily')}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    subscriptionTier === 'daily'
                      ? 'bg-white text-slate-900 border-white shadow-xs'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Zap size={12} className="text-amber-400" />
                    <span className="text-[10px] font-black">Daily Flex Pass</span>
                  </div>
                  <span className="text-xs font-mono font-black mt-0.5 block">₹10 / day</span>
                  <span className="text-[9px] opacity-80">Pay-as-you-work flex</span>
                </button>
              </div>

              {/* Priority Boost Toggle */}
              <div className="flex items-center justify-between bg-black/20 p-2 rounded-xl text-[10px] font-bold text-white">
                <span className="flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-300" />
                  <span>Priority Map Boost (₹50/3 days)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPriorityBoostActive(!priorityBoostActive)}
                  className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    priorityBoostActive ? 'bg-amber-400 text-slate-950' : 'bg-white/20 text-white'
                  }`}
                >
                  {priorityBoostActive ? 'Active (★ Top)' : 'Enable ₹50'}
                </button>
              </div>
            </div>

            {/* Hyper-Local Pincode Search & Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={pincodeSearch}
                  onChange={(e) => setPincodeSearch(e.target.value)}
                  placeholder="Enter Pincode (e.g., 110091) or Area..."
                  className="w-full pl-9 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg">
                  Mayur Vihar
                </span>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                {[
                  { id: 'all', label: 'All Services' },
                  { id: 'plumbing', label: 'Plumbing' },
                  { id: 'electrical', label: 'Electrical' },
                  { id: 'sanitation', label: 'Sanitation' },
                  { id: 'carpentry', label: 'Carpentry' },
                  { id: 'medical', label: 'Medical Aid' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-[#0F172A] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Interactive Map Preview Banner */}
            <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Navigation size={15} className="text-emerald-600 animate-pulse" />
                <div>
                  <span className="font-extrabold text-slate-900 block text-xs">
                    Live GPS Radar: 110091
                  </span>
                  <span className="text-[10px] text-slate-500">
                    3 Verified Workers Active within 1.2 km radius
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-1 rounded-lg">
                ETA: 6-8 MINS
              </span>
            </div>

            {/* Scheduled Booking with Automated 30-Min Notification (JobCard Component) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Scheduled Booking (Automated 30m Push Alert System)
                </span>
                <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  30m Auto-Reminder
                </span>
              </div>
              {scheduledJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSelect={() => handleOpenBargain(workersList[0])}
                  onNavigateWorkSite={(j) => alert(`Routing to ${j.location}`)}
                  onOpenWalletQr={() => setShowUpiQrModal(true)}
                  isWorker={portalMode === 'worker'}
                />
              ))}
            </div>

            {/* Verified Worker Cards Feed */}
            <div className="space-y-3 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Nearby Verified Artisans (Govt ID Checked)
              </span>

              {workersList
                .filter(w => selectedCategory === 'all' || w.category === selectedCategory)
                .map((worker) => (
                  <div
                    key={worker.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500/80 bg-white transition-all shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={worker.photoUrl}
                          alt={worker.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-sm text-slate-900">{worker.name}</h4>
                            {worker.isPriority && (
                              <span className="text-[9px] bg-amber-100 text-amber-900 font-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                <Sparkles size={9} /> Boost
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{worker.trade}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                            <span className="font-bold text-amber-600 flex items-center gap-0.5">
                              <Star size={11} className="fill-amber-400 text-amber-400" />
                              {worker.rating} ({worker.reviewsCount})
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 font-medium">{worker.distance} km away</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black font-mono text-[#0B2447] block">
                          ₹{worker.basePrice}
                        </span>
                        <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                          0% Cut
                        </span>
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {worker.badges.map((badge, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <ShieldCheck size={10} className="text-emerald-600" />
                          {badge}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons: Negotiate / Bargain vs Book Direct */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenBargain(worker)}
                        className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs"
                      >
                        <Tag size={13} />
                        <span>Negotiate / Bargain</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWorkerForBargain(worker);
                          setShowUpiQrModal(true);
                        }}
                        className="py-2 px-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs"
                      >
                        <QrCode size={13} className="text-emerald-400" />
                        <span>Direct UPI Pay</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* =========================================================
              COLUMN 2: CIVIC HYGIENE MODULE (SEPARATE PROFILES: WORKER VS CUSTOMER)
             ========================================================= */}
          <section className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col space-y-4">
            {portalMode === 'worker' ? (
              /* =======================================================
                 WORKER CIVIC HYGIENE PROFILE: PAID SANITATION BOUNTIES
                 ======================================================= */
              <div className="space-y-4">
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <IndianRupee size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                          Column 2: Civic Sanitation Gigs
                        </h2>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded">
                          WORKER PROFILE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Claim civic cleanups • Geotagged proof • Instant direct UPI payout
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-xl">
                    0% Platform Cut
                  </span>
                </div>

                {/* Leaflet Interactive Mini-Map for Worker */}
                <CivicHazardMiniMap
                  portalMode="worker"
                  hazards={hazardsList}
                  activeHazardId={activeHazard.id}
                  onSelectHazard={(hz) => {
                    setSelectedHazardId(hz.id);
                  }}
                  onClaimTask={(hz) => {
                    setSelectedHazardId(hz.id);
                    setAcceptedSanitationGigId(hz.id);
                    setSanitationPayoutAmount(hz.payoutRupees || 650);
                    setSanitationPayoutReceived(false);
                    setSanitationCompletionPhoto(null);
                  }}
                  height="220px"
                />

                {/* Active Sanitation Gig Action Card */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={activeHazard.imageUrl}
                        alt={activeHazard.title}
                        className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs flex-shrink-0"
                      />
                      <div>
                        <span className="text-[9px] font-black uppercase text-red-600 block">
                          {activeHazard.riskLevel} Risk Biohazard • {activeHazard.category}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 leading-tight">
                          {activeHazard.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          📍 {activeHazard.location} ({activeHazard.ticketId})
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-black font-mono text-emerald-800 block">
                        ₹{activeHazard.payoutRupees || 650}
                      </span>
                      <span className="text-[9px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                        100% Direct Cash
                      </span>
                    </div>
                  </div>

                  {/* Gig Acceptance & Verification Flow */}
                  {acceptedSanitationGigId === activeHazard.id ? (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-emerald-950 flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          Gig Claimed • Ready for Completion Proof
                        </span>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-800">
                          ID: {activeHazard.ticketId}
                        </span>
                      </div>

                      {/* Work Proof Photo Upload Area */}
                      {!sanitationCompletionPhoto ? (
                        <div className="space-y-2">
                          <div className="p-2.5 bg-white rounded-xl border border-dashed border-emerald-300 text-center space-y-1.5">
                            <Camera size={18} className="mx-auto text-emerald-600" />
                            <p className="text-[11px] font-bold text-slate-700">
                              Submit Geotagged Cleanup Completion Photo
                            </p>
                            <span className="text-[9px] text-slate-400 block font-mono">
                              Timestamp: 02-Oct-2026, 16:45 IST • GPS: {activeHazard.lat.toFixed(4)}° N, {activeHazard.lng.toFixed(4)}° E
                            </span>
                            <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setCleaningCameraConfig({
                                    title: 'Click Cleanup Completion Proof',
                                    subtitle: `Take photo of cleaned location at ${activeHazard.location}`,
                                    watermarkText: `SWACHHATA CLEAN VERIFIED • ${activeHazard.ticketId} • ${activeHazard.lat.toFixed(4)}°N, ${activeHazard.lng.toFixed(4)}°E • ${new Date().toLocaleTimeString('en-IN')}`,
                                    target: 'worker_cleanup'
                                  });
                                  setIsCleaningCameraOpen(true);
                                }}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                                title="Click photo directly through device camera"
                              >
                                <Camera size={13} />
                                <span>Click Camera</span>
                              </button>

                              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all">
                                <Upload size={13} />
                                <span>Upload Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        if (ev.target?.result) {
                                          setSanitationCompletionPhoto(ev.target.result as string);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-emerald-200">
                            <img
                              src={sanitationCompletionPhoto}
                              alt="Work Proof"
                              className="w-14 h-14 rounded-lg object-cover border"
                            />
                            <div className="text-xs">
                              <span className="text-[9px] font-black uppercase text-emerald-700 block">
                                Verified Cleaned Site
                              </span>
                              <span className="font-mono text-[10px] text-slate-600 block">
                                Lat: {activeHazard.lat.toFixed(4)}° N • Lng: {activeHazard.lng.toFixed(4)}° E
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                02-Oct-2026 16:45 IST (Aadhaar Verified)
                              </span>
                            </div>
                          </div>

                          {!sanitationPayoutReceived ? (
                            <button
                              type="button"
                              onClick={() => handleCompleteSanitationGig(activeHazard.id)}
                              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                            >
                              <IndianRupee size={13} />
                              <span>Verify & Claim Instant Payout (₹{sanitationPayoutAmount})</span>
                            </button>
                          ) : (
                            <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-center space-y-1">
                              <span className="text-xs font-black text-emerald-900 flex items-center justify-center gap-1">
                                <CheckCircle2 size={14} className="text-emerald-700" />
                                Instant Payout Transferred: ₹{sanitationPayoutAmount}
                              </span>
                              <p className="text-[10px] text-emerald-800 font-mono">
                                Transferred to Worker UPI (0% platform cut) • Ref: UPI/MCD-{activeHazard.ticketId} • Map Pin Updated to Resolved ✓
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAcceptedSanitationGigId(activeHazard.id);
                        setSanitationPayoutAmount(activeHazard.payoutRupees || 650);
                        setSanitationPayoutReceived(false);
                        setSanitationCompletionPhoto(null);
                      }}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <CheckCircle2 size={13} />
                      <span>Accept Civic Cleanup Task (+₹{activeHazard.payoutRupees || 650})</span>
                    </button>
                  )}
                </div>

                {/* Other Available Community Sanitation Gigs */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Local Civic Hazard Spots (Leaflet Interactive Pins):
                    </span>
                    <span className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      {hazardsList.filter(h => h.status !== 'resolved').length} Active Bounties
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                    {hazardsList.map((hz) => (
                      <div
                        key={hz.id}
                        onClick={() => {
                          setSelectedHazardId(hz.id);
                          setUploadedHazardPhoto(null);
                        }}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          selectedHazardId === hz.id 
                            ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500 shadow-2xs' 
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={hz.imageUrl}
                            alt={hz.title}
                            className="w-9 h-9 rounded-lg object-cover border flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <h5 className="font-extrabold text-slate-900 text-xs truncate">
                                {hz.title}
                              </h5>
                              {hz.status === 'resolved' && (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">
                                  ✓ Cleared
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 truncate block">
                              📍 {hz.location}
                            </span>
                          </div>
                        </div>

                        <span className="font-mono font-black text-xs text-emerald-800 flex-shrink-0 bg-emerald-100 px-2 py-0.5 rounded-lg">
                          ₹{hz.payoutRupees || 650}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* =======================================================
                 CUSTOMER CIVIC HYGIENE PROFILE: SNAP HAZARD & 7-DAY GOVT ESCALATION ENGINE
                 ======================================================= */
              <div className="space-y-4">
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                          Column 2: Civic Hygiene
                        </h2>
                        <span className="bg-red-100 text-red-800 text-[9px] font-black px-1.5 py-0.2 rounded">
                          CUSTOMER PROFILE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Photo hazard reporting & 7-Day Govt escalation engine
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black font-mono bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-xl">
                    Citizen Watchdog
                  </span>
                </div>

                {/* Leaflet Interactive Mini-Map for Customer */}
                <CivicHazardMiniMap
                  portalMode="customer"
                  hazards={hazardsList}
                  activeHazardId={activeHazard.id}
                  onSelectHazard={(hz) => {
                    setSelectedHazardId(hz.id);
                  }}
                  height="220px"
                />

                {/* Quick Toggle: Report New Local Hazard with Live Pin */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Snap Civic Hazard (Report Issue)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsReportingNewHazard(!isReportingNewHazard)}
                      className="text-[10px] text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1 transition-all"
                    >
                      <Plus size={11} />
                      <span>{isReportingNewHazard ? 'Close Report Form' : 'Drop New Hazard Pin'}</span>
                    </button>
                  </div>

                  {/* Expandable New Hazard Form */}
                  {isReportingNewHazard && (
                    <div className="p-3 bg-red-50/70 border-2 border-red-200 rounded-2xl space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-900 flex items-center gap-1">
                          <MapPin size={12} className="text-red-600" />
                          Drop Live Pin on Leaflet Map
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border">
                          GPS: 110091 Local Zone
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-700 block">Hazard Title:</label>
                        <input
                          type="text"
                          value={newHazardTitle}
                          onChange={(e) => setNewHazardTitle(e.target.value)}
                          placeholder="e.g., Mosquito Breeding Stagnant Pool near Pocket 2"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block">Category:</label>
                          <select
                            value={newHazardCategory}
                            onChange={(e) => setNewHazardCategory(e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none"
                          >
                            <option value="Vector Disease Breeding Site / Stagnant Water">Stagnant Water / Mosquito</option>
                            <option value="Solid Waste Decomposition & Biohazard">Overflowing Garbage Dump</option>
                            <option value="Stormwater Clogging & Sanitation Failure">Blocked Drain / Sludge</option>
                            <option value="Biological Vector & Wastewater">Open Sewer Contamination</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block">Risk Priority:</label>
                          <select
                            value={newHazardRisk}
                            onChange={(e) => setNewHazardRisk(e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none"
                          >
                            <option value="High">🔴 High Priority Biohazard</option>
                            <option value="Medium">🟡 Medium Sanitation Hazard</option>
                            <option value="Low">🟢 Low Civic Issue</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-700 block">Street Location / Landmark:</label>
                        <input
                          type="text"
                          value={newHazardCustomLocation}
                          onChange={(e) => setNewHazardCustomLocation(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      {/* Snap Photo Directly for New Hazard */}
                      <button
                        type="button"
                        onClick={() => {
                          setCleaningCameraConfig({
                            title: 'Click New Hazard Spot Photo',
                            subtitle: `Capture dirty location at ${newHazardCustomLocation}`,
                            watermarkText: `NEW SWACHHATA HAZARD • ${newHazardCustomLocation} • ${new Date().toLocaleTimeString('en-IN')}`,
                            target: 'new_hazard'
                          });
                          setIsCleaningCameraOpen(true);
                        }}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-slate-700"
                      >
                        <Camera size={14} />
                        <span>📸 Click Dirty Spot Photo with Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleAddNewHazard(
                            newHazardTitle || 'Reported Local Civic Hazard',
                            newHazardCategory,
                            newHazardRisk,
                            newHazardCustomLocation
                          );
                        }}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm flex items-center justify-center gap-1 active:scale-95 transition-all"
                      >
                        <MapPin size={13} />
                        <span>Drop Live Pin & File Swachhata Ticket</span>
                      </button>
                    </div>
                  )}

                  {/* Hazard Presets Selector */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {hazardsList.slice(0, 3).map((hz) => (
                      <button
                        key={hz.id}
                        type="button"
                        onClick={() => {
                          setSelectedHazardId(hz.id);
                          setUploadedHazardPhoto(null);
                        }}
                        className={`p-2 rounded-xl text-left border text-xs transition-all ${
                          selectedHazardId === hz.id && !uploadedHazardPhoto
                            ? 'border-red-600 bg-red-50 text-red-950 font-black ring-1 ring-red-500'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[9px] font-black uppercase text-red-700 block">
                          Spot #{hz.id.replace('hazard-', '')}
                        </span>
                        <span className="text-[10px] line-clamp-1 mt-0.5 font-bold">{hz.title}</span>
                      </button>
                    ))}
                  </div>

                  {/* Selected Hazard Image & Camera Simulation */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-900">
                    <img
                      src={uploadedHazardPhoto || activeHazard.imageUrl}
                      alt={activeHazard.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 text-white">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          activeHazard.riskLevel === 'High' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {activeHazard.riskLevel} RISK HAZARD
                        </span>
                        <span className="text-[10px] font-mono bg-black/60 px-2 py-0.5 rounded text-amber-300">
                          {activeHazard.lat.toFixed(4)}° N, {activeHazard.lng.toFixed(4)}° E
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs mt-1 text-white truncate">
                        {activeHazard.title}
                      </h4>
                    </div>
                  </div>

                  {/* Snap / Upload Photo Input Buttons */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setCleaningCameraConfig({
                          title: 'Click Dirty Spot Photo Directly',
                          subtitle: `Capture live condition at ${activeHazard.location}`,
                          watermarkText: `SWACHHATA RADAR • ${activeHazard.location} • ${activeHazard.lat.toFixed(4)}°N, ${activeHazard.lng.toFixed(4)}°E • ${new Date().toLocaleTimeString('en-IN')}`,
                          target: 'dirty_spot'
                        });
                        setIsCleaningCameraOpen(true);
                      }}
                      className="flex-1 min-w-[125px] py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                      title="Click photo directly through device camera"
                    >
                      <Camera size={14} />
                      <span>Click Camera</span>
                    </button>

                    <label className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95">
                      <Upload size={14} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setUploadedHazardPhoto(ev.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setAiAssistantTopic('hygiene');
                        setIsAIAssistantOpen(true);
                      }}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-black uppercase flex items-center gap-1 transition-all active:scale-95 border border-slate-700 shadow-xs cursor-pointer"
                      title="Ask AI Swachhata Mitra"
                    >
                      <Sparkles size={12} />
                      <span>AI Help</span>
                    </button>
                  </div>
                </div>

                {/* AI Hazard Classification Drawer */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>AI Hazard Classification</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500">Model: Gemini 2.5 Flash</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 text-[11px]">Identified Category:</span>
                      <span className="font-bold text-slate-900 text-right">{activeHazard.category}</span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 text-[11px]">Assessed Risk Level:</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        activeHazard.riskLevel === 'High' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {activeHazard.riskLevel} Priority Biohazard
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 text-[11px]">Extracted Location:</span>
                      <span className="font-mono text-slate-700 text-right text-[11px]">{activeHazard.location} ({activeHazard.pincode})</span>
                    </div>
                  </div>
                </div>

                {/* Official Send Details, Photo & Location to Government Action Box */}
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-300 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-red-950 tracking-tight">
                          Send Report to Government (MCD)
                        </h4>
                        <span className="text-[10px] text-slate-600">
                          Ward #44 Sanitary Inspector • Central Swachhata Mission
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                      7-Day SLA
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-snug">
                    Transmits this geotagged photograph, GPS coordinates ({activeHazard.lat.toFixed(4)}° N, {activeHazard.lng.toFixed(4)}° E), and category directly to the Delhi Municipal Corporation with official receipt & tracking.
                  </p>

                  <button
                    type="button"
                    onClick={handleSendReportToGovernment}
                    disabled={isSubmittingToGovt}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    {isSubmittingToGovt ? (
                      <>
                        <RefreshCw size={14} className="animate-spin text-white" />
                        <span>{govtSubmissionStep || 'Transmitting to Government...'}</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Send Details, Photo & Location to Government</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Automated Government Routing & Escalation Timeline */}
                <div className="p-4 bg-[#0F172A] text-white rounded-2xl space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block">
                        SWACHHATA MUNICIPAL TICKET
                      </span>
                      <span className="font-mono font-black text-white text-sm">{activeHazard.ticketId}</span>
                    </div>
                    <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-1 rounded-lg">
                      Ward #44, East Delhi
                    </span>
                  </div>

                  {/* 7-Day Interactive Escalation Stepper */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      7-Day Government Escalation Engine:
                    </span>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                      {/* Day 0 */}
                      <button
                        type="button"
                        onClick={() => setCurrentEscalationDay(0)}
                        className={`p-2 rounded-xl border transition-all ${
                          currentEscalationDay === 0
                            ? 'bg-emerald-600 text-white border-emerald-400 font-black'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        <span className="text-[9px] block uppercase font-mono">Day 0</span>
                        <span className="text-[10px] font-bold">Filed & Dispatched</span>
                      </button>

                      {/* Day 3 */}
                      <button
                        type="button"
                        onClick={() => setCurrentEscalationDay(3)}
                        className={`p-2 rounded-xl border transition-all ${
                          currentEscalationDay === 3
                            ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        <span className="text-[9px] block uppercase font-mono">Day 3</span>
                        <span className="text-[10px] font-bold">Supervisory Alert</span>
                      </button>

                      {/* Day 7 */}
                      <button
                        type="button"
                        onClick={() => setCurrentEscalationDay(7)}
                        className={`p-2 rounded-xl border transition-all ${
                          currentEscalationDay === 7
                            ? 'bg-red-600 text-white border-red-400 font-black'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        <span className="text-[9px] block uppercase font-mono">Day 7</span>
                        <span className="text-[10px] font-bold">District Collector</span>
                      </button>
                    </div>

                    {/* Escalation Stage Details */}
                    <div className="p-2.5 bg-white/10 rounded-xl text-xs space-y-1">
                      {currentEscalationDay === 0 && (
                        <p className="text-[11px] text-slate-300 leading-snug">
                          ✓ Ticket transmitted to local MCD Sanitation Inspector. Assigned resolution window: 72 hours.
                        </p>
                      )}
                      {currentEscalationDay === 3 && (
                        <p className="text-[11px] text-amber-300 leading-snug">
                          ⚠ Automated Supervisory Alert: SLA breached by Ward Inspector. Escalated to Zonal Deputy Commissioner.
                        </p>
                      )}
                      {currentEscalationDay === 7 && (
                        <p className="text-[11px] text-red-300 leading-snug">
                          🚨 Critical Escalation: 7 days unaddressed! Formal memo dispatched to District Magistrate / Municipal Commissioner.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Hybrid Platform Fallback Trigger: Day 7 Expiration Simulator Button */}
                  <div className="pt-1 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-amber-300">
                        Hybrid Platform Fallback Engine:
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentEscalationDay(7)}
                        className="text-[10px] text-slate-300 hover:text-white underline font-mono"
                      >
                        Simulate Day 7 Expiration
                      </button>
                    </div>

                    {currentEscalationDay >= 7 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsSanitationDispatched(true);
                          alert('Platform Sanitation Team Dispatched! Local verified trade worker assigned to clear hazard with community funding.');
                        }}
                        className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <Users size={14} />
                        <span>
                          {isSanitationDispatched
                            ? '✓ Platform Sanitation Team Dispatched'
                            : 'Dispatch Platform Sanitation Team (Column 1 Workers)'}
                        </span>
                      </button>
                    ) : (
                      <div className="p-2 bg-white/5 rounded-xl text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Platform Fallback unlocks if Govt fails to resolve within 7 days.</span>
                        <button
                          type="button"
                          onClick={() => setCurrentEscalationDay(7)}
                          className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold"
                        >
                          Fast-Forward 7d
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cleanliness Verification & Social Media Direct Escalation (Instagram, 𝕏, WhatsApp) */}
                <div className="p-4 bg-gradient-to-br from-rose-50 via-amber-50 to-pink-50 rounded-2xl border-2 border-rose-300 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <Flame size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-rose-950 tracking-tight flex items-center gap-1.5">
                          <span>Spot Not Cleaned? Social Media Connect</span>
                          <span className="text-[9px] bg-rose-200 text-rose-900 font-bold px-1.5 py-0.5 rounded-full">
                            Public Watchdog
                          </span>
                        </h4>
                        <span className="text-[10px] text-slate-600">
                          Directly amplify to Instagram, 𝕏 & WhatsApp to shame ward inaction
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-snug">
                    If municipal sanitation has ignored this hazard ({currentEscalationDay >= 3 ? `${currentEscalationDay} days overdue` : 'action pending'}), mobilize public accountability directly on social media!
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsSocialEscalationOpen(true)}
                      className="py-2.5 px-3 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer transition-all"
                    >
                      <Instagram size={14} />
                      <span>Post to Instagram</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const tweetText = `🚨 URGENT: Cleanliness NOT DONE at ${activeHazard.location} (${activeHazard.category})! Ticket #${activeHazard.ticketId || 'DEL-2026-88412'} is overdue. Pls intervene @MCD_Delhi @SwachhBharatGov @MoHUA_India! #FixMyWard #SwachhBharat`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                      }}
                      className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer transition-all border border-slate-700"
                    >
                      <Twitter size={14} className="text-sky-400" />
                      <span>Tweet MCD on 𝕏</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCleaningCameraConfig({
                        title: 'Snap Incomplete Cleanliness Proof',
                        subtitle: `Capture current dirty condition at ${activeHazard.location}`,
                        watermarkText: `UNRESOLVED SWACHHATA HAZARD • ${activeHazard.ticketId} • ${activeHazard.location} • ${new Date().toLocaleTimeString('en-IN')}`,
                        target: 'dirty_spot'
                      });
                      setIsCleaningCameraOpen(true);
                    }}
                    className="w-full py-2 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                    title="Click fresh photo directly with device camera to prove cleanliness has not been done"
                  >
                    <Camera size={13} className="text-rose-700" />
                    <span>📸 Re-Snap Current Dirty Proof with Device Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSocialEscalationOpen(true)}
                    className="w-full py-2 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Share2 size={13} className="text-rose-600" />
                    <span>Open Full Social Media Escalation & Download Story Card</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* =========================================================
              COLUMN 3: NUTRITION TRACKER & DIET CHART STUDIO (PURE NUTRITION)
             ========================================================= */}
          <section className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col space-y-4">
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Utensils size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                      Column 3: Nutrition Tracker & Diet Studio
                    </h2>
                    <span className="bg-teal-100 text-teal-800 text-[9px] font-black px-1.5 py-0.2 rounded">
                      {portalMode === 'worker' ? 'WORKER MODE' : 'CUSTOMER MODE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {portalMode === 'worker' 
                      ? '2,400 kcal physical labor goal • Thali calorie scanner • Pocket boosters • Diet chart maker' 
                      : 'Meal photo scanner • Exact calories & macros • Customized Indian family diet chart'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAiAssistantTopic('nutrition');
                    setIsAIAssistantOpen(true);
                  }}
                  className="text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-1 rounded-xl flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Ask Nutrition AI Assistant"
                >
                  <Sparkles size={11} className="text-amber-600" />
                  <span>Ask Diet AI</span>
                </button>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                  {portalMode === 'worker' ? '2,400 kcal Goal' : '2,000-2,400 kcal Goal'}
                </span>
              </div>
            </div>

            {/* Dedicated Pure Nutrition Screener with Diet Chart Generator */}
            <WorkerNutritionScreener 
              userMode={portalMode} 
              compactMode={portalMode === 'customer'}
              onOpenAIAssistant={() => {
                setAiAssistantTopic('nutrition');
                setIsAIAssistantOpen(true);
              }}
            />

            {/* Subsidized Generic Pharmacy Support Banner (Jan Aushadhi) */}
            <div className="p-3 bg-teal-50/90 rounded-2xl border border-teal-200/90 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold flex-shrink-0">
                  <Building2 size={16} />
                </div>
                <div>
                  <span className="font-extrabold text-teal-950 block text-xs">
                    PM Jan Aushadhi Kendra (0.4 km away)
                  </span>
                  <span className="text-[10px] text-teal-700">
                    Govt generic Iron-Folic acid tablets @ ₹2.50 / strip • Free Blood tests at Trilokpuri Mohalla Clinic
                  </span>
                </div>
              </div>
              <a
                href="tel:+911122758890"
                className="px-2.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-[10px] font-black uppercase whitespace-nowrap flex items-center gap-1 shadow-xs"
              >
                <Phone size={10} /> Call Clinic
              </a>
            </div>
          </section>

        </div>
      </main>

      {/* =========================================================
          DYNAMIC BARGAINING & BOOKING WORKFLOW POPUP MODAL
         ========================================================= */}
      {bargainModalOpen && selectedWorkerForBargain && (
        <div
          className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setBargainModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0F172A] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  INTERACTIVE BARGAINING & DIRECT BOOKING
                </span>
                <h3 className="text-base font-black mt-0.5">
                  Negotiate with {selectedWorkerForBargain.name}
                </h3>
                <p className="text-xs text-slate-300">
                  {selectedWorkerForBargain.trade} • Base: ₹{selectedWorkerForBargain.basePrice}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBargainModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Negotiation Chat Stream */}
            <div className="p-4 flex-1 overflow-y-auto space-y-2.5 bg-slate-50 text-xs">
              {negotiationChat.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === 'customer'
                        ? 'bg-[#0F172A] text-white rounded-br-xs'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    <span className="text-[9px] font-bold block opacity-70 mb-0.5">
                      {msg.sender === 'customer' ? 'You' : selectedWorkerForBargain.name}
                    </span>
                    <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}

              {isWorkerResponding && (
                <div className="flex justify-start">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-2xl text-[11px] text-slate-500 font-bold flex items-center gap-1.5 animate-pulse">
                    <RefreshCw size={12} className="animate-spin text-emerald-600" />
                    <span>Worker is considering offer...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bargain Actions & Coupon Input */}
            <div className="p-4 bg-white border-t border-slate-200 space-y-3">
              {/* Quick Amount Offer Chips */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400">Quick Offers:</span>
                {[300, 350, 400, 450].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomerOfferAmount(String(amt))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                      customerOfferAmount === String(amt)
                        ? 'bg-[#0F172A] text-white border-[#0F172A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Offer Input & Counter-Offer Button */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={customerOfferAmount}
                    onChange={(e) => setCustomerOfferAmount(e.target.value)}
                    placeholder="Offer price..."
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendBargainOffer}
                  disabled={isWorkerResponding}
                  className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all"
                >
                  Send Offer
                </button>
              </div>

              {/* Coupon Code Entry (DESI20) */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Promo Code (Try DESI20)"
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="py-1.5 px-3 bg-[#0F172A] text-white rounded-xl text-xs font-bold"
                >
                  Apply
                </button>
              </div>
              {couponSuccessMsg && (
                <p className="text-[10px] font-bold text-emerald-700">{couponSuccessMsg}</p>
              )}

              {/* Booking Confirmation Box & Start OTP */}
              {bookingConfirmed && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      Deal Locked! Worker Assigned
                    </span>
                    <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded">
                      0% Commission
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Job Start Security OTP:</span>
                    <span className="font-mono text-base font-black bg-white px-2.5 py-1 rounded-lg border border-emerald-300 tracking-widest text-emerald-800">
                      {bookingOtp}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUpiQrModal(true);
                      }}
                      className="py-2 bg-[#0F172A] text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1"
                    >
                      <QrCode size={13} className="text-emerald-400" />
                      <span>Open UPI QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWorkProofPreview(true)}
                      className="py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1"
                    >
                      <Camera size={13} />
                      <span>Geotag Work Proof</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          DIRECT DYNAMIC UPI QR PAYMENT MODAL (100% Direct Payout)
         ========================================================= */}
      {showUpiQrModal && (
        <div
          className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowUpiQrModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0F172A] text-white p-5 relative">
              <button
                type="button"
                onClick={() => setShowUpiQrModal(false)}
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X size={18} />
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                LOCAL TRADES INDIA • DIRECT UPI QR
              </span>
              <h3 className="text-lg font-black mt-1">
                {selectedWorkerForBargain?.name || 'Arjun Deshmukh'}
              </h3>
              <p className="text-xs text-slate-300">
                100% Direct to Worker • 0% Platform Deduction
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-white rounded-3xl border-4 border-[#10B981] shadow-xl inline-block">
                <SvgUpiQrCode
                  upiUri={`upi://pay?pa=${encodeURIComponent(selectedWorkerForBargain?.upiId || 'arjun.pro@okhdfcbank')}&pn=${encodeURIComponent(selectedWorkerForBargain?.name || 'Arjun')}&am=${customerOfferAmount}&cu=INR&tn=LocalTradesIndia`}
                  size={190}
                />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block">Total Agreed Payout</span>
                <span className="text-3xl font-black font-mono text-slate-900">
                  ₹{Math.max(1, Number(customerOfferAmount) - appliedDiscount)}
                </span>
                {appliedDiscount > 0 && (
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    (₹50 Discount Applied via DESI20)
                  </span>
                )}
                <p className="text-xs text-emerald-700 font-bold mt-1">
                  ✓ VPA: {selectedWorkerForBargain?.upiId || 'arjun.pro@okhdfcbank'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    alert('Simulated GPay Payment Successful! 100% credited to worker.');
                    setShowUpiQrModal(false);
                  }}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase shadow-md"
                >
                  GPay
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Simulated PhonePe Payment Successful! 100% credited to worker.');
                    setShowUpiQrModal(false);
                  }}
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black uppercase shadow-md"
                >
                  PhonePe
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Marked as Direct Cash Pay! Worker receives cash with 0% fee.');
                    setShowUpiQrModal(false);
                  }}
                  className="py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[11px] font-black uppercase shadow-md"
                >
                  Cash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          GEOTAGGED WORK PROOF & DUAL RATING MODAL
         ========================================================= */}
      {workProofPreview && (
        <div
          className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setWorkProofPreview(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h4 className="font-black text-sm text-slate-900">Geotagged Work Proof & Dual Rating</h4>
                <p className="text-[11px] text-slate-500">Embedded GPS coordinates + verified feedback</p>
              </div>
              <button
                type="button"
                onClick={() => setWorkProofPreview(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Geotagged Photo Preview */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80"
                alt="Work Proof"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2.5 text-white text-[10px] font-mono flex items-center justify-between">
                <span>GPS: 28.6139° N, 77.2985° E</span>
                <span>{new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            {/* Rating Stars & Multi-Tag Feedback */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setRatingStars(st)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star size={24} className={st <= ratingStars ? 'fill-amber-400' : 'text-slate-300'} />
                  </button>
                ))}
              </div>

              {/* Tag Pills */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center text-xs">
                {['Punctual', 'High Quality', 'Fair Price', 'Polite Behavior'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSelectedReviewTags(prev =>
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      );
                    }}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                      selectedReviewTags.includes(tag)
                        ? 'bg-[#0F172A] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setReviewSubmitted(true);
                alert('Geotagged Review Submitted! Added to verified public profile.');
                setWorkProofPreview(false);
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Submit Geotagged Review
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          OFFICIAL SWACHHATA GOVERNMENT RECEIPT MODAL
         ========================================================= */}
      <GovtSwachhataReceiptModal
        isOpen={isGovtReceiptOpen}
        onClose={() => setIsGovtReceiptOpen(false)}
        ticketId={activeHazard.ticketId || 'SBM-DEL-2026-88412'}
        category={activeHazard.category}
        riskLevel={activeHazard.riskLevel}
        locationAddress={activeHazard.location}
        pincode={activeHazard.pincode}
        gpsCoordinates={`${activeHazard.lat.toFixed(4)}° N, ${activeHazard.lng.toFixed(4)}° E`}
        photoUrl={uploadedHazardPhoto || activeHazard.imageUrl}
        wardNumber="Ward #44, East Delhi MCD"
        onTrackTimeline={() => {
          setCurrentEscalationDay(0);
        }}
        onOpenSocialEscalation={() => {
          setIsSocialEscalationOpen(true);
        }}
      />

      {/* =========================================================
          SWACHHATA CITIZEN WATCHDOG: SOCIAL MEDIA ESCALATION MODAL
         ========================================================= */}
      <SwachhataSocialEscalationModal
        isOpen={isSocialEscalationOpen}
        onClose={() => setIsSocialEscalationOpen(false)}
        ticketId={activeHazard.ticketId || 'SBM-DEL-2026-88412'}
        category={activeHazard.category}
        riskLevel={activeHazard.riskLevel}
        locationAddress={activeHazard.location}
        pincode={activeHazard.pincode}
        gpsCoordinates={`${activeHazard.lat.toFixed(4)}° N, ${activeHazard.lng.toFixed(4)}° E`}
        photoUrl={uploadedHazardPhoto || activeHazard.imageUrl}
        wardNumber="Ward #44, East Delhi MCD"
        daysOverdue={currentEscalationDay >= 7 ? 7 : currentEscalationDay >= 3 ? 3 : 4}
      />

      {/* =========================================================
          MULTILINGUAL AI MITRA ASSISTANT MODAL (ALL LANGUAGES)
         ========================================================= */}
      <MultilingualAIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        initialTopic={aiAssistantTopic}
        userMode={portalMode}
        userLocation={activeLocation}
      />

      {/* =========================================================
          LIVE DEVICE CAMERA MODAL FOR LOCATION CLEANING & SWACHHATA
         ========================================================= */}
      <LiveCameraModal
        isOpen={isCleaningCameraOpen}
        onClose={() => setIsCleaningCameraOpen(false)}
        onCapture={(photoDataUrl) => {
          if (cleaningCameraConfig.target === 'worker_cleanup') {
            setSanitationCompletionPhoto(photoDataUrl);
            setShareToast('✓ Cleanup completion photo captured directly via device camera!');
          } else {
            setUploadedHazardPhoto(photoDataUrl);
            setShareToast('✓ Dirty location photo captured directly via device camera!');
          }
          setTimeout(() => setShareToast(null), 3500);
        }}
        title={cleaningCameraConfig.title}
        subtitle={cleaningCameraConfig.subtitle}
        watermarkText={cleaningCameraConfig.watermarkText}
      />

      {/* =========================================================
          PERSISTENT FLOATING MULTILINGUAL AI MITRA BUTTON
         ========================================================= */}
      <aside aria-label="AI Assistant Quick Access" className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => {
            setAiAssistantTopic('general');
            setIsAIAssistantOpen(true);
          }}
          className="px-4 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/40"
          title="Open Multilingual AI Assistant (Talk with Voice in Any Language)"
        >
          <div className="w-6 h-6 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center">
            <Languages size={13} />
          </div>
          <span>Talk with AI Mitra (All Languages)</span>
        </button>
      </aside>
    </div>
  );
};

export default EmpowermentPlatformView;
