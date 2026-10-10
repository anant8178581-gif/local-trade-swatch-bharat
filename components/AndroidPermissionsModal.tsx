import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Camera, 
  Mic, 
  MessageSquare, 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { AndroidPermission } from '../types';

interface AndroidPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_PERMISSIONS: AndroidPermission[] = [
  {
    id: 'location',
    name: 'Precise Location (GPS)',
    description: 'Required to match nearby emergency trade workers and calculate gig distance',
    granted: true,
    iconName: 'MapPin'
  },
  {
    id: 'sms',
    name: 'SMS & OTP Retriever API',
    description: 'Allows instant auto-reading of incoming verification OTP codes',
    granted: true,
    iconName: 'MessageSquare'
  },
  {
    id: 'camera',
    name: 'Camera & OCR Scan',
    description: 'Required for Aadhaar, PAN card verification & job site photo uploads',
    granted: true,
    iconName: 'Camera'
  },
  {
    id: 'microphone',
    name: 'Microphone & Voice Assistant',
    description: 'Powers hands-free live voice navigation & AI assistant queries',
    granted: true,
    iconName: 'Mic'
  },
  {
    id: 'notifications',
    name: 'High Priority Push Notifications',
    description: 'Delivers immediate SOS emergency broadcasts and job status updates',
    granted: true,
    iconName: 'Bell'
  }
];

const AndroidPermissionsModal: React.FC<AndroidPermissionsModalProps> = ({ isOpen, onClose }) => {
  const [permissions, setPermissions] = useState<AndroidPermission[]>(INITIAL_PERMISSIONS);

  if (!isOpen) return null;

  const togglePermission = (id: string) => {
    setPermissions(prev => prev.map(p => p.id === id ? { ...p, granted: !p.granted } : p));
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'location': return <MapPin size={22} className="text-purple-600" />;
      case 'sms': return <MessageSquare size={22} className="text-blue-600" />;
      case 'camera': return <Camera size={22} className="text-indigo-600" />;
      case 'microphone': return <Mic size={22} className="text-emerald-600" />;
      case 'notifications': return <Bell size={22} className="text-orange-600" />;
      default: return <Smartphone size={22} className="text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto relative border border-gray-100">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-base uppercase tracking-tight">
                Android App Permissions
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Local Trades India • SDK 34
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-3">
          <CheckCircle2 size={18} className="text-blue-600 flex-shrink-0" />
          <p className="text-xs text-blue-900 font-medium leading-relaxed">
            All Android permissions are securely sandboxed and evaluated locally on your device.
          </p>
        </div>

        {/* Permissions List */}
        <div className="divide-y divide-gray-100">
          {permissions.map((perm) => (
            <div key={perm.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100 mt-0.5">
                  {getIcon(perm.id)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{perm.name}</h4>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-0.5">
                    {perm.description}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => togglePermission(perm.id)}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative flex items-center flex-shrink-0 ${
                  perm.granted ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                    perm.granted ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-[#2D4356] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          Save & Apply Permissions
        </button>
      </div>
    </div>
  );
};

export default AndroidPermissionsModal;
