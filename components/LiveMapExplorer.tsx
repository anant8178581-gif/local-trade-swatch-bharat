import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { 
  Navigation, 
  MapPin, 
  Search, 
  Star, 
  Bike, 
  BadgeCheck, 
  Crosshair,
  Loader2,
  Gift,
  Maximize2,
  Minimize2,
  Crown,
  Briefcase,
  QrCode,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { Worker, UserLocation, BookingRecord, Job } from '../types';
import { getLiveGPSLocation, reverseGeocode, DEFAULT_LOCATIONS } from '../services/locationService';

interface LiveMapExplorerProps {
  workers: Worker[];
  jobs?: Job[];
  role?: 'worker' | 'customer';
  customerLocation: UserLocation;
  onUpdateLocation: (newLocation: UserLocation) => void;
  onSelectWorkerToBook: (worker: Worker) => void;
  activeBooking?: BookingRecord | null;
  onOpenLiveTracker?: () => void;
  onOpenCouponCorner?: () => void;
  onAcceptJobFromMap?: (job: Job) => void;
}

const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC9O0NwHd9EjrGwH6BEgXHFjL9L1hOykBA';

const DEFAULT_MAP_JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Main Line Leakage & Faucet Repair',
    description: 'Urgent water tank pipe burst in hall. Need immediate pipe fitting.',
    category: 'plumbing',
    status: 'pending',
    isEmergency: true,
    location: 'Gokhale Road, Dadar West, Mumbai - 400028',
    coordinates: { lat: 19.0215, lng: 72.8435 },
    price: 1530,
    customerName: 'Rohan Sharma',
    customerPhone: '+91 98201 11223'
  },
  {
    id: 'j2',
    title: 'MCB Switchboard Sparking',
    description: 'Kitchen circuit tripping repeatedly. Need heavy-duty MCB replacement.',
    category: 'electrical',
    status: 'pending',
    isEmergency: true,
    location: 'Parijat CHS, Shivaji Park, Dadar, Mumbai - 400028',
    coordinates: { lat: 19.0265, lng: 72.8390 },
    price: 850,
    customerName: 'Anjali Gupta',
    customerPhone: '+91 98204 55441'
  },
  {
    id: 'j3',
    title: 'Split AC Gas Refill & Jet Service',
    description: '3 Split AC units deep servicing and cooling check.',
    category: 'ac_repair',
    status: 'pending',
    isEmergency: false,
    location: 'Worli Sea Face, Bldg 14, Mumbai - 400018',
    coordinates: { lat: 19.0095, lng: 72.8180 },
    price: 2100,
    customerName: 'Sunita Rao',
    customerPhone: '+91 98190 77889'
  },
  {
    id: 'j4',
    title: 'Modular Kitchen Hinge & Lock Work',
    description: 'Need carpenter for final cabinet alignment and door lock fitting.',
    category: 'carpentry',
    status: 'pending',
    isEmergency: false,
    location: 'Prabhadevi Temple Road, Mumbai - 400025',
    coordinates: { lat: 19.0145, lng: 72.8310 },
    price: 1400,
    customerName: 'Kabir Singh',
    customerPhone: '+91 98332 99001'
  }
];

const LiveMapExplorer: React.FC<LiveMapExplorerProps> = ({
  workers,
  jobs = DEFAULT_MAP_JOBS,
  role = 'customer',
  customerLocation,
  onUpdateLocation,
  onSelectWorkerToBook,
  activeBooking,
  onOpenLiveTracker,
  onOpenCouponCorner,
  onAcceptJobFromMap
}) => {
  // Dual-Party Map Mode: 'customer_party' (find & track workers) vs 'worker_party' (where worker has to go & work)
  const [mapPartyMode, setMapPartyMode] = useState<'customer_party' | 'worker_party'>(
    role === 'worker' ? 'worker_party' : 'customer_party'
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: customerLocation.lat,
    lng: customerLocation.lng
  });
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedJobSite, setSelectedJobSite] = useState<Job | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrade, setFilterTrade] = useState<string>('All');
  const [isCustomisingPin, setIsCustomisingPin] = useState(false);
  const [customPinCoords, setCustomPinCoords] = useState<{ lat: number; lng: number }>({
    lat: customerLocation.lat,
    lng: customerLocation.lng
  });
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const mapJobsWithCoords = (jobs.length ? jobs : DEFAULT_MAP_JOBS).map((j, idx) => ({
    ...j,
    coordinates: j.coordinates || DEFAULT_MAP_JOBS[idx % DEFAULT_MAP_JOBS.length].coordinates || {
      lat: customerLocation.lat + (idx + 1) * 0.004,
      lng: customerLocation.lng - (idx + 1) * 0.003
    }
  }));

  useEffect(() => {
    setMapPartyMode(role === 'worker' ? 'worker_party' : 'customer_party');
  }, [role]);

  const toggleFullscreen = () => {
    if (!isMaximized) {
      setIsMaximized(true);
      if (document.fullscreenEnabled && !document.fullscreenElement) {
        try {
          document.documentElement.requestFullscreen?.().catch(() => {});
        } catch (_) {}
      }
    } else {
      setIsMaximized(false);
      if (document.fullscreenElement) {
        try {
          document.exitFullscreen?.().catch(() => {});
        } catch (_) {}
      }
    }
  };

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  useEffect(() => {
    setMapCenter({ lat: customerLocation.lat, lng: customerLocation.lng });
    setCustomPinCoords({ lat: customerLocation.lat, lng: customerLocation.lng });
  }, [customerLocation]);

  // Handle GPS Auto Locate
  const handleAutoLocate = async () => {
    setIsLocating(true);
    try {
      const live = await getLiveGPSLocation();
      onUpdateLocation(live);
      setMapCenter({ lat: live.lat, lng: live.lng });
      setCustomPinCoords({ lat: live.lat, lng: live.lng });
    } catch (err) {
      console.warn('GPS location error:', err);
    } finally {
      setIsLocating(false);
    }
  };

  // Handle map click to customise location
  const handleMapClick = async (e: any) => {
    if (!isCustomisingPin) return;
    const latLng = e.detail?.latLng;
    if (latLng) {
      const newLat = latLng.lat;
      const newLng = latLng.lng;
      setCustomPinCoords({ lat: newLat, lng: newLng });
      try {
        const geocoded = await reverseGeocode(newLat, newLng);
        onUpdateLocation({
          ...geocoded,
          isAutoLocated: false
        });
      } catch (err) {
        console.warn('Reverse geocode failed:', err);
      }
    }
  };

  // Search quick jump
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const queryLower = searchQuery.toLowerCase();
    const matchedHub = Object.values(DEFAULT_LOCATIONS).find(
      (loc) => loc.area.toLowerCase().includes(queryLower) || loc.city.toLowerCase().includes(queryLower)
    );

    if (matchedHub) {
      onUpdateLocation(matchedHub);
      setMapCenter({ lat: matchedHub.lat, lng: matchedHub.lng });
      setCustomPinCoords({ lat: matchedHub.lat, lng: matchedHub.lng });
    } else {
      const simulatedLoc: UserLocation = {
        lat: customerLocation.lat + (Math.random() - 0.5) * 0.02,
        lng: customerLocation.lng + (Math.random() - 0.5) * 0.02,
        formattedAddress: `${searchQuery}, Mumbai, Maharashtra`,
        area: searchQuery,
        city: 'Mumbai',
        pincode: '400001',
        isAutoLocated: false
      };
      onUpdateLocation(simulatedLoc);
      setMapCenter({ lat: simulatedLoc.lat, lng: simulatedLoc.lng });
    }
    setSearchQuery('');
  };

  // Sort workers: Priority Featured listings appear first!
  const sortedWorkers = [...workers].sort((a, b) => {
    if (a.isPriorityFeatured && !b.isPriorityFeatured) return -1;
    if (!a.isPriorityFeatured && b.isPriorityFeatured) return 1;
    return (a.distance || 0) - (b.distance || 0);
  });

  const filteredWorkers = sortedWorkers.filter((w) => {
    if (filterTrade === 'All') return true;
    return w.skills.some((s) => s.toLowerCase().includes(filterTrade.toLowerCase()));
  });

  return (
    <div className={`flex flex-col bg-slate-100 relative overflow-hidden transition-all duration-300 ${
      isMaximized ? 'fixed inset-0 z-[250] w-screen h-screen' : 'h-full w-full'
    }`}>
      {/* Quota Defense Sticky Top Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Floating Search & Dual-Party Location Header */}
      <div className="absolute top-3 left-3 right-3 z-20 space-y-2 pointer-events-none">
        {/* Dual-Party Map Tracking Toggle Bar */}
        <div className="bg-[#0B2447]/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-slate-700 flex items-center justify-between gap-1.5 pointer-events-auto text-white">
          <button
            type="button"
            onClick={() => {
              setMapPartyMode('customer_party');
              setSelectedJobSite(null);
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              mapPartyMode === 'customer_party'
                ? 'bg-[#116D6E] text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>👤 Track Workers on Map</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMapPartyMode('worker_party');
              setSelectedWorker(null);
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              mapPartyMode === 'worker_party'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🛠️ Where Worker Has to Go & Work</span>
          </button>
        </div>

        {/* Search & Pin Controls */}
        <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-gray-200/80 flex items-center gap-2 pointer-events-auto">
          <form onSubmit={handleSearchLocation} className="flex-1 flex items-center gap-2 px-2">
            <Search size={17} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area or Pincode (e.g. 400014, Dadar)..."
              className="w-full text-xs font-medium text-gray-900 bg-transparent outline-none"
            />
          </form>

          <button
            onClick={handleAutoLocate}
            disabled={isLocating}
            className="p-2 bg-[#0B2447] hover:bg-slate-800 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1 flex-shrink-0"
            title="Auto-Locate Live GPS"
          >
            {isLocating ? <Loader2 size={15} className="animate-spin" /> : <Navigation size={15} />}
            <span className="text-[11px] font-bold hidden sm:inline">GPS</span>
          </button>

          <button
            onClick={() => setIsCustomisingPin(!isCustomisingPin)}
            className={`p-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
              isCustomisingPin 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Set Exact Work Location Pin on Map"
          >
            <MapPin size={15} />
            <span>{isCustomisingPin ? 'Done' : 'Set Pin'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-[#116D6E] hover:bg-teal-700 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1 flex-shrink-0"
            title={isMaximized ? "Exit Fullscreen" : "Fullscreen Map"}
          >
            {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        {/* Customise pin instruction banner */}
        {isCustomisingPin && (
          <div className="bg-amber-500 text-slate-950 px-3 py-2 rounded-xl font-bold text-xs shadow-lg flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <Crosshair size={15} />
              <span>Tap anywhere on the Google Map to drop the exact job location pin!</span>
            </div>
            <button 
              onClick={() => setIsCustomisingPin(false)}
              className="underline text-[11px] ml-2 font-black"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* Real Google Map Instance */}
      <div className="flex-1 w-full relative min-h-[360px]">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            style={{ width: '100%', height: '100%' }}
            defaultCenter={mapCenter}
            center={mapCenter}
            defaultZoom={14}
            mapId="DEMO_MAP_ID"
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            onClick={handleMapClick}
          >
            {/* Primary User / Worker Current GPS Location Marker */}
            <AdvancedMarker position={customerLocation}>
              <div className="relative flex flex-col items-center">
                <div className="bg-[#0B2447] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-lg mb-1 whitespace-nowrap border border-white">
                  {mapPartyMode === 'worker_party' ? `🛠️ Worker GPS (${workers[0]?.name.split(' ')[0]})` : '🏠 Customer GPS Location'}
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-12 h-12 rounded-full bg-teal-500/25 animate-ping" />
                  <div className="w-10 h-10 rounded-full bg-[#116D6E] text-white flex items-center justify-center shadow-2xl border-2 border-white">
                    <Navigation size={18} className="transform rotate-45" />
                  </div>
                </div>
              </div>
            </AdvancedMarker>

            {/* Custom Pin if Active */}
            {isCustomisingPin && (
              <AdvancedMarker position={customPinCoords}>
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl animate-bounce">
                    <MapPin size={18} />
                  </div>
                  <span className="bg-red-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                    Job Pin
                  </span>
                </div>
              </AdvancedMarker>
            )}

            {/* CUSTOMER PARTY MODE: Render Nearby Workers on Map */}
            {mapPartyMode === 'customer_party' && filteredWorkers.map((worker) => {
              const isSelected = selectedWorker?.id === worker.id;
              const isPriority = worker.isPriorityFeatured;

              return (
                <AdvancedMarker
                  key={worker.id}
                  position={worker.location}
                  onClick={() => setSelectedWorker(worker)}
                >
                  <div className={`relative cursor-pointer transition-transform hover:scale-110 flex flex-col items-center ${
                    isSelected ? 'scale-110 z-30' : isPriority ? 'z-20' : 'z-10'
                  }`}>
                    {/* Floating Callout matching Screenshot 2 */}
                    <div className="bg-white rounded-xl px-2.5 py-1 shadow-lg border border-slate-200 mb-1 text-left whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-extrabold text-slate-900">{worker.name.split(' ')[0]}</span>
                        <span className="text-[9px] font-bold text-amber-600 flex items-center">
                          ★{worker.rating}
                        </span>
                      </div>
                      <span className="text-[8px] text-slate-500 block">
                        ({worker.subscriptionPlan === 'daily' ? '₹10' : '₹99'} subscription) • {worker.distance || 0.8}km
                      </span>
                    </div>

                    <div className="relative">
                      {isPriority && (
                        <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 p-0.5 rounded-full shadow border border-white z-20">
                          <Crown size={10} />
                        </div>
                      )}
                      <img 
                        src={worker.photoUrl} 
                        alt={worker.name} 
                        className={`w-11 h-11 rounded-full object-cover border-2 shadow-xl ${
                          isSelected 
                            ? 'border-[#116D6E] ring-4 ring-teal-300/40' 
                            : isPriority
                            ? 'border-amber-400'
                            : 'border-[#0B2447]'
                        }`}
                      />
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* WORKER PARTY MODE: Render Customer Work Locations (Where Worker Has to Go and Work) */}
            {mapPartyMode === 'worker_party' && mapJobsWithCoords.map((job) => {
              const isSelected = selectedJobSite?.id === job.id;
              return (
                <AdvancedMarker
                  key={job.id}
                  position={job.coordinates!}
                  onClick={() => setSelectedJobSite(job)}
                >
                  <div className={`relative cursor-pointer transition-transform hover:scale-110 flex flex-col items-center ${
                    isSelected ? 'scale-115 z-30' : 'z-20'
                  }`}>
                    <div className={`rounded-2xl px-2.5 py-1.5 shadow-xl border mb-1 text-left whitespace-nowrap ${
                      job.isEmergency
                        ? 'bg-red-600 text-white border-white'
                        : 'bg-white text-slate-900 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black">{job.title.slice(0, 20)}</span>
                        <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded ${
                          job.isEmergency ? 'bg-white text-red-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          ₹{job.price}
                        </span>
                      </div>
                      <span className={`text-[9px] block ${job.isEmergency ? 'text-red-100' : 'text-slate-500'}`}>
                        📍 Go to: {job.customerName} • 0% Cut
                      </span>
                    </div>

                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-2xl border-2 border-white ${
                      job.isEmergency ? 'bg-red-600 text-white animate-pulse' : 'bg-[#0B2447] text-amber-400'
                    }`}>
                      <Briefcase size={17} />
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>
      </div>

      {/* Active Booking Live Floating Pill */}
      {activeBooking && (
        <div 
          onClick={onOpenLiveTracker}
          className="absolute bottom-36 left-4 right-4 z-20 bg-[#0B2447] text-white p-3.5 rounded-2xl shadow-2xl border border-teal-400/30 flex items-center justify-between cursor-pointer hover:bg-slate-900 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#116D6E] text-white flex items-center justify-center font-bold">
              <Bike size={20} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-teal-300">Active Service Tracking</span>
                <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 rounded">Live GPS</span>
              </div>
              <h5 className="text-xs font-bold text-white mt-0.5">
                {activeBooking.worker.name} &harr; {activeBooking.customerLocation.area} • OTP: <span className="font-mono text-amber-300 font-black">{activeBooking.otpStartCode}</span>
              </h5>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-400">Open Map &rarr;</span>
        </div>
      )}

      {/* Bottom Sheet: Context-Aware for Customer Party vs Worker Party */}
      <div className="bg-white border-t border-gray-200 shadow-2xl p-4 safe-bottom z-10 space-y-3">
        {mapPartyMode === 'worker_party' ? (
          selectedJobSite ? (
            <div className="space-y-3 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      WORK SITE DESTINATION
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      0% COMMISSION
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base mt-1">{selectedJobSite.title}</h4>
                  <p className="text-xs font-bold text-[#116D6E] flex items-center gap-1 mt-0.5">
                    <MapPin size={13} />
                    <span>Where to go: {selectedJobSite.location}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Customer: <strong>{selectedJobSite.customerName}</strong> • GPS: {selectedJobSite.coordinates?.lat.toFixed(4)}, {selectedJobSite.coordinates?.lng.toFixed(4)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black font-mono text-slate-900">₹{selectedJobSite.price}</span>
                  <span className="text-[10px] text-emerald-700 font-bold block">100% Take-Home</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (onAcceptJobFromMap) {
                      onAcceptJobFromMap(selectedJobSite);
                    }
                  }}
                  className="flex-1 py-3 bg-[#116D6E] hover:bg-[#0d5657] text-white rounded-full font-extrabold uppercase tracking-wider text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Navigation size={14} />
                  <span>Start Navigation & Track Both Locations</span>
                </button>
                <button
                  onClick={() => setSelectedJobSite(null)}
                  className="px-4 py-3 bg-slate-100 text-slate-700 rounded-full font-bold text-xs"
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Customer Work Locations — Where Worker Has to Go ({mapJobsWithCoords.length})
                </span>
                <span className="text-[11px] text-[#116D6E] font-bold">Tap job pin to navigate</span>
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {mapJobsWithCoords.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => {
                      setSelectedJobSite(job);
                      if (job.coordinates) setMapCenter(job.coordinates);
                    }}
                    className="min-w-[235px] p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:border-[#116D6E] cursor-pointer transition-all flex-shrink-0 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-[#116D6E]">{job.category}</span>
                      <span className="text-sm font-black font-mono text-slate-900">₹{job.price}</span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs truncate">{job.title}</h5>
                    <p className="text-[11px] text-slate-600 truncate flex items-center gap-1">
                      <MapPin size={11} className="text-red-500 flex-shrink-0" />
                      <span>{job.location}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : selectedWorker ? (
          <div className="space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedWorker.photoUrl} 
                  alt={selectedWorker.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-gray-900 text-base">{selectedWorker.name}</h4>
                    {selectedWorker.verified && <BadgeCheck size={16} className="text-[#116D6E]" />}
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">
                    {selectedWorker.skills.join(', ')} • ({selectedWorker.subscriptionPlan === 'daily' ? '₹10' : '₹99'} subscription model)
                  </p>
                  <span className="text-[11px] text-[#116D6E] font-bold block mt-0.5">
                    📍 {selectedWorker.distance || 0.8} km away • ETA ~{Math.max(5, Math.round((selectedWorker.distance || 1) * 5))} mins
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedWorker(null)}
                className="text-gray-400 hover:text-gray-600 p-1 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onSelectWorkerToBook(selectedWorker)}
                className="flex-1 py-3.5 bg-[#116D6E] hover:bg-[#0d5657] text-white rounded-full font-extrabold uppercase tracking-wider text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Confirm & Book • ₹{selectedWorker.basePrice || 1500}</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-gray-500 tracking-wider">
                Nearby Verified Artisans ({filteredWorkers.length})
              </span>
              <span className="text-[11px] text-[#116D6E] font-bold">Tap worker pin to book & track</span>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {filteredWorkers.map((w) => (
                <div
                  key={w.id}
                  onClick={() => {
                    setSelectedWorker(w);
                    setMapCenter(w.location);
                  }}
                  className={`min-w-[210px] p-3 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] flex-shrink-0 relative ${
                    w.isPriorityFeatured 
                      ? 'bg-amber-50/70 border-amber-300' 
                      : 'bg-gray-50 hover:bg-teal-50/40 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img src={w.photoUrl} alt={w.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h5 className="font-bold text-gray-900 text-xs truncate max-w-[110px]">{w.name}</h5>
                      <span className="text-[11px] text-gray-500 block truncate">{w.skills[0]}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-gray-800 flex items-center gap-1">
                      <Star size={11} className="text-amber-500 fill-amber-500" /> {w.rating}
                    </span>
                    <span className="font-bold text-[#116D6E]">{w.distance || 0.8} km</span>
                    <span className="font-black text-gray-900">₹{w.basePrice || 550}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMapExplorer;
