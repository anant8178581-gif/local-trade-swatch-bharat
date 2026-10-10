import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Check, 
  RotateCw, 
  AlertCircle, 
  Upload, 
  Sparkles,
  MapPin,
  ShieldCheck,
  Zap,
  Sliders
} from 'lucide-react';
import { 
  CameraProofMode, 
  CapturedPhotoResult, 
  requestHighResCameraStream, 
  captureHighResPhoto, 
  processUploadedProofFile,
  checkCameraAccess
} from '../services/cameraService';

export interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
  onCaptureResult?: (result: CapturedPhotoResult) => void;
  title?: string;
  subtitle?: string;
  watermarkText?: string;
  proofMode?: CameraProofMode;
  workerName?: string;
  locationName?: string;
  gpsCoordinates?: { lat: number; lng: number };
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onCaptureResult,
  title = 'Click Photo Directly with Camera',
  subtitle = 'Position the camera over the target area and tap Snap',
  watermarkText,
  proofMode = 'general' as CameraProofMode,
  workerName,
  locationName,
  gpsCoordinates
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedResult, setCapturedResult] = useState<CapturedPhotoResult | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>(
    proofMode === 'worker_verification' ? 'user' : 'environment'
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);
  const [activeResolution, setActiveResolution] = useState<string>('Detecting high-res sensor...');
  const [isImageCaptureReady, setIsImageCaptureReady] = useState<boolean>(false);
  const [highResMode, setHighResMode] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera stream when modal opens
  useEffect(() => {
    if (isOpen) {
      setCapturedResult(null);
      setCameraError(null);
      checkCameraAccess().then(acc => {
        setIsImageCaptureReady(acc.imageCaptureSupported);
      });
      startCamera(cameraFacing);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, cameraFacing, proofMode]);

  const startCamera = async (facing: 'environment' | 'user') => {
    setIsStartingCamera(true);
    setCameraError(null);
    stopCamera();

    try {
      const { stream: mediaStream, activeResolution: resLabel } = await requestHighResCameraStream(
        proofMode,
        facing
      );

      setStream(mediaStream);
      setActiveResolution(resLabel);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.warn('requestHighResCameraStream failed:', err);
      setCameraError(
        err.message || 'Camera permission denied or camera device in use. You can use your device native camera below.'
      );
    } finally {
      setIsStartingCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleSnapPhoto = async () => {
    if (!videoRef.current) return;

    setIsCapturing(true);
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 220);

    try {
      const result = await captureHighResPhoto(videoRef.current, stream, {
        proofMode,
        watermarkText,
        workerName,
        locationName,
        gpsCoordinates,
        quality: highResMode ? 0.94 : 0.88,
        preferNativeSensor: highResMode
      });

      setCapturedResult(result);
    } catch (err: any) {
      console.error('High-res photo capture failed:', err);
      setCameraError('Capture failed. Please try again or use Phone Camera below.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturedResult(null);
    startCamera(cameraFacing);
  };

  const handleConfirm = () => {
    if (capturedResult) {
      // Seamlessly passes the high-res data URL to current photo-upload state
      onCapture(capturedResult.dataUrl);
      if (onCaptureResult) {
        onCaptureResult(capturedResult);
      }
      stopCamera();
      onClose();
    }
  };

  const handleNativeFallbackChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const result = await processUploadedProofFile(file, {
          proofMode,
          watermarkText,
          workerName,
          locationName,
          gpsCoordinates,
          quality: 0.92
        });
        setCapturedResult(result);
      } catch (err) {
        console.warn('Native fallback process failed:', err);
      }
    }
  };

  const toggleFacingMode = () => {
    const nextMode = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextMode);
  };

  if (!isOpen) return null;

  const modeBadge = {
    worker_verification: { label: 'WORKER KYC VERIFICATION', color: 'bg-emerald-500 text-slate-950' },
    job_completion_proof: { label: 'JOB COMPLETION AUDIT PROOF', color: 'bg-amber-400 text-slate-950' },
    civic_hazard: { label: 'SWACHHATA BIOHAZARD AUDIT', color: 'bg-red-500 text-white' },
    general: { label: 'HIGH-RES PROOF CAPTURE', color: 'bg-blue-500 text-white' }
  }[proofMode];

  return (
    <div 
      className="fixed inset-0 z-[280] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              proofMode === 'worker_verification' ? 'bg-emerald-600' : 'bg-red-600'
            }`}>
              <Camera size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-black text-white leading-tight">{title}</h3>
                <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${modeBadge.color}`}>
                  {modeBadge.label}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative aspect-video sm:aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
          {shutterFlash && (
            <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-200" />
          )}

          {capturedResult ? (
            /* Captured High-Res Snapshot Preview */
            <div className="relative w-full h-full">
              <img 
                src={capturedResult.dataUrl} 
                alt="Captured Snapshot" 
                className="w-full h-full object-cover"
              />
              {/* Tamper-evident verified badge overlay */}
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-mono text-emerald-400 font-bold border border-emerald-500/50 flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>{capturedResult.verificationHash}</span>
              </div>

              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-mono text-amber-300 font-bold border border-amber-500/40">
                {capturedResult.resolutionLabel}
              </div>

              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-mono text-slate-300 font-medium">
                ✓ Native High-Res Captured & EXIF Timestamp Encoded
              </div>
            </div>
          ) : (
            /* Live High-Res Camera Stream Viewfinder */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Crosshair Overlay with Targeting Brackets */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className={`border-2 rounded-2xl relative transition-all ${
                  proofMode === 'worker_verification' 
                    ? 'w-56 h-64 border-emerald-400/50' 
                    : 'w-56 h-44 border-amber-400/50'
                }`}>
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400" />

                  {/* Centered Alignment Hint */}
                  <div className="absolute inset-0 flex items-center justify-center text-center p-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-white/70 bg-black/50 px-2 py-0.5 rounded-full">
                      {proofMode === 'worker_verification' ? 'Fit Face & Aadhaar in Frame' : 'Align Trade Work Inside Frame'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Sensor Info Badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                <div className="bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[9px] font-mono text-emerald-400 flex items-center gap-1 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{activeResolution}</span>
                </div>
                {isImageCaptureReady && (
                  <div className="bg-black/75 backdrop-blur-xs px-2 py-1 rounded-lg text-[9px] font-mono text-amber-300 border border-amber-500/30">
                    OPTICAL 4K SENSOR READY
                  </div>
                )}
              </div>

              {/* Watermark preview banner */}
              {watermarkText && (
                <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-mono text-amber-300 truncate border border-white/10">
                  📍 {watermarkText}
                </div>
              )}

              {/* Camera Error or Fallback Warning */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/90 p-6 flex flex-col items-center justify-center text-center space-y-3 z-20">
                  <AlertCircle size={36} className="text-amber-400" />
                  <p className="text-xs text-slate-300 font-medium max-w-xs">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Camera size={14} />
                    <span>Open Phone Camera Directly</span>
                  </button>
                </div>
              )}

              {isStartingCamera && !cameraError && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-xs font-bold text-slate-200">
                  <RefreshCw size={16} className="animate-spin text-amber-400" />
                  <span>Activating high-res camera sensor...</span>
                </div>
              )}
            </>
          )}

          {/* Hidden native input for direct device capture fallback */}
          <input
            ref={nativeCameraInputRef}
            type="file"
            accept="image/*"
            capture={cameraFacing}
            className="hidden"
            onChange={handleNativeFallbackChange}
          />
        </div>

        {/* Camera Control Toolbar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          {capturedResult ? (
            /* Action Buttons for Captured Photo */
            <div className="w-full flex items-center gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Retake Photo</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Check size={16} />
                <span>Use High-Res Proof</span>
              </button>
            </div>
          ) : (
            /* Capture Controls */
            <>
              {/* Device Native Camera Fallback */}
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Launch phone's native camera application"
              >
                <Upload size={14} />
                <span className="hidden sm:inline">Native App</span>
              </button>

              {/* Shutter Button with High-Res Pulse */}
              <button
                type="button"
                onClick={handleSnapPhoto}
                disabled={isStartingCamera || isCapturing || !!cameraError}
                className={`w-16 h-16 rounded-full border-4 border-white shadow-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer disabled:opacity-50 ${
                  proofMode === 'worker_verification' 
                    ? 'bg-emerald-600 hover:bg-emerald-500' 
                    : 'bg-red-600 hover:bg-red-500'
                }`}
                title="Click high-resolution photo now"
              >
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-inner">
                  {isCapturing ? (
                    <RefreshCw size={18} className="animate-spin text-slate-900" />
                  ) : (
                    <Camera size={20} className={proofMode === 'worker_verification' ? 'text-emerald-700' : 'text-red-600'} />
                  )}
                </div>
              </button>

              {/* Controls: Switch Camera & High-Res Toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setHighResMode(!highResMode)}
                  className={`py-2 px-2.5 rounded-xl text-[10px] font-mono font-bold transition-all border ${
                    highResMode 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Toggle native sensor ultra high-resolution"
                >
                  {highResMode ? '4K/HD ON' : 'HD STD'}
                </button>

                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Switch front / rear camera"
                >
                  <RotateCw size={14} />
                  <span className="hidden sm:inline">Flip</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveCameraModal;

