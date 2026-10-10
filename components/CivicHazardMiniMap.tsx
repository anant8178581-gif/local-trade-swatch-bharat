import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Droplets, 
  Trash2, 
  Layers, 
  Navigation, 
  IndianRupee, 
  ExternalLink,
  ShieldAlert,
  Clock,
  Filter
} from 'lucide-react';

// Comprehensive Leaflet safeguards against detached elements, race conditions, and unmounted DOM
if (typeof window !== 'undefined' && L) {
  // 1. Guard DomUtil.getPosition and setPosition
  if ((L as any).DomUtil) {
    const domUtil = (L as any).DomUtil;
    const originalGetPosition = domUtil.getPosition;
    domUtil.getPosition = function (el: any) {
      if (!el || typeof el !== 'object') {
        return new L.Point(0, 0);
      }
      try {
        const pos = originalGetPosition ? originalGetPosition.call(domUtil, el) : el._leaflet_pos;
        return (el && el._leaflet_pos) || pos || new L.Point(0, 0);
      } catch {
        return (el && el._leaflet_pos) || new L.Point(0, 0);
      }
    };

    const originalSetPosition = domUtil.setPosition;
    domUtil.setPosition = function (el: any, point: any) {
      if (!el || typeof el !== 'object') return;
      try {
        if (originalSetPosition) {
          originalSetPosition.call(domUtil, el, point);
        } else {
          el._leaflet_pos = point;
        }
      } catch {
        try {
          if (el) el._leaflet_pos = point;
        } catch {}
      }
    };
  }

  // 2. Guard Map.prototype._getMapPanePos (frequent cause of _leaflet_pos error when mapPane is unmounted)
  if (L.Map && L.Map.prototype) {
    (L.Map.prototype as any)._getMapPanePos = function () {
      if (!this._mapPane) return new L.Point(0, 0);
      return (this._mapPane && this._mapPane._leaflet_pos) || new L.Point(0, 0);
    };
  }

  // 3. Guard PosAnimation.prototype.run
  if (L.PosAnimation && L.PosAnimation.prototype) {
    const originalPosAnimRun = L.PosAnimation.prototype.run;
    L.PosAnimation.prototype.run = function (el: any, newPos: any, duration: any, easeLinearity: any) {
      if (!el) return;
      try {
        return originalPosAnimRun.call(this, el, newPos, duration, easeLinearity);
      } catch {
        // silent fallback if element was detached mid-animation
      }
    };
  }

  // 4. Guard Tooltip position adjustments
  if ((L as any).Tooltip && (L as any).Tooltip.prototype) {
    const origTooltipAdjustPan = (L as any).Tooltip.prototype._adjustPan;
    if (origTooltipAdjustPan) {
      (L as any).Tooltip.prototype._adjustPan = function () {
        if (!this._container || !this._map) return;
        try {
          return origTooltipAdjustPan.apply(this, arguments);
        } catch {}
      };
    }
    const origTooltipUpdatePos = (L as any).Tooltip.prototype._updatePosition;
    if (origTooltipUpdatePos) {
      (L as any).Tooltip.prototype._updatePosition = function () {
        if (!this._container || !this._map) return;
        try {
          return origTooltipUpdatePos.apply(this, arguments);
        } catch {}
      };
    }
  }

  // 5. Guard Popup position adjustments
  if ((L as any).Popup && (L as any).Popup.prototype) {
    const origPopupUpdatePos = (L as any).Popup.prototype._updatePosition;
    if (origPopupUpdatePos) {
      (L as any).Popup.prototype._updatePosition = function () {
        if (!this._container || !this._map) return;
        try {
          return origPopupUpdatePos.apply(this, arguments);
        } catch {}
      };
    }
  }
}

export interface CivicHazardLocation {
  id: string;
  title: string;
  category: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  lat: number;
  lng: number;
  location: string;
  pincode: string;
  ticketId: string;
  escalationDay: number;
  imageUrl: string;
  payoutRupees?: number;
  status: 'reported' | 'assigned' | 'in_progress' | 'escalated' | 'resolved';
  reportedAt: string;
  vectorDiseaseRisk?: string;
}

export const getHazardLifecycleStatus = (hazard: CivicHazardLocation): {
  label: 'Escalated' | 'In Progress' | 'Resolved' | 'Reported';
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: string;
  detail: string;
} => {
  if (hazard.status === 'resolved') {
    return {
      label: 'Resolved',
      badgeBg: '#10B981',
      badgeText: '#FFFFFF',
      badgeBorder: '#059669',
      icon: '✓',
      detail: 'Sanitized & Disinfected by Worker'
    };
  }
  if (hazard.status === 'escalated' || hazard.escalationDay >= 3) {
    const isDay7 = hazard.escalationDay >= 7;
    return {
      label: 'Escalated',
      badgeBg: isDay7 ? '#DC2626' : '#EA580C',
      badgeText: '#FFFFFF',
      badgeBorder: isDay7 ? '#991B1B' : '#C2410C',
      icon: isDay7 ? '🚨' : '⚠️',
      detail: isDay7 ? 'Day 7 Urgent DM Escalation (Fallback Active)' : 'Day 3 Supervisory Alert Active'
    };
  }
  if (hazard.status === 'assigned' || hazard.status === 'in_progress') {
    return {
      label: 'In Progress',
      badgeBg: '#2563EB',
      badgeText: '#FFFFFF',
      badgeBorder: '#1D4ED8',
      icon: '⚡',
      detail: 'Local Trade Worker Dispatched & Clearing Spot'
    };
  }
  return {
    label: 'Reported',
    badgeBg: '#0284C7',
    badgeText: '#FFFFFF',
    badgeBorder: '#0369A1',
    icon: '📋',
    detail: 'Day 0 Filed (Awaiting Ward Inspection)'
  };
};

interface CivicHazardMiniMapProps {
  hazards?: CivicHazardLocation[];
  activeHazardId?: string;
  onSelectHazard?: (hazard: CivicHazardLocation) => void;
  onClaimTask?: (hazard: CivicHazardLocation) => void;
  portalMode: 'customer' | 'worker';
  height?: string;
}

export const DEFAULT_HAZARDS: CivicHazardLocation[] = [
  {
    id: 'hazard-1',
    title: 'Stagnant Dirty Water & Mosquito Pool',
    category: 'Vector Disease Breeding Site',
    riskLevel: 'High',
    lat: 28.6139,
    lng: 77.2985,
    location: 'Mayur Vihar Phase 1, Pocket 4 Drain Junction',
    pincode: '110091',
    ticketId: 'DEL-2026-88412',
    escalationDay: 3,
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=500&auto=format&fit=crop&q=80',
    payoutRupees: 650,
    status: 'escalated',
    reportedAt: '3 days ago',
    vectorDiseaseRisk: 'High Dengue & Malaria Vector Spot'
  },
  {
    id: 'hazard-2',
    title: 'Overflowing Municipal Garbage Dump',
    category: 'Solid Waste Decomposition & Biohazard',
    riskLevel: 'High',
    lat: 28.6085,
    lng: 77.3042,
    location: 'Trilokpuri Block 18 Roadside Bin',
    pincode: '110091',
    ticketId: 'DEL-2026-77309',
    escalationDay: 7,
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=500&auto=format&fit=crop&q=80',
    payoutRupees: 750,
    status: 'escalated',
    reportedAt: '7 days ago (Fallback Eligible)',
    vectorDiseaseRisk: 'Rodent & Flies Vector Breeding'
  },
  {
    id: 'hazard-3',
    title: 'Blocked Drainage & Sludge Overflow',
    category: 'Stormwater Clogging & Sanitation Failure',
    riskLevel: 'Medium',
    lat: 28.6201,
    lng: 77.3114,
    location: 'Patparganj Road #2, Near Phase-1 Border',
    pincode: '110091',
    ticketId: 'DEL-2026-91044',
    escalationDay: 1,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    payoutRupees: 550,
    status: 'in_progress',
    reportedAt: 'Yesterday (Cleanup Ongoing)',
    vectorDiseaseRisk: 'Stagnant Sludge Hazard'
  },
  {
    id: 'hazard-4',
    title: 'Open Sewer Line Contamination',
    category: 'Biological Vector & Wastewater',
    riskLevel: 'High',
    lat: 28.6025,
    lng: 77.2950,
    location: 'Chilla Village Main Road, Mayur Vihar',
    pincode: '110091',
    ticketId: 'DEL-2026-44219',
    escalationDay: 0,
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=500&auto=format&fit=crop&q=80',
    payoutRupees: 800,
    status: 'reported',
    reportedAt: 'Just Filed Today',
    vectorDiseaseRisk: 'Coliform & Typhoid Contamination'
  },
  {
    id: 'hazard-5',
    title: 'Cleared Community Waste Site',
    category: 'Resolved Citizen Cleanup',
    riskLevel: 'Low',
    lat: 28.6180,
    lng: 77.3010,
    location: 'Pocket 1 Community Park Edge, Mayur Vihar',
    pincode: '110091',
    ticketId: 'DEL-2026-11840',
    escalationDay: 0,
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&auto=format&fit=crop&q=80',
    payoutRupees: 500,
    status: 'resolved',
    reportedAt: 'Resolved by Local Worker',
    vectorDiseaseRisk: 'Sanitized & Disinfected'
  }
];

export const CivicHazardMiniMap: React.FC<CivicHazardMiniMapProps> = ({
  hazards = DEFAULT_HAZARDS,
  activeHazardId,
  onSelectHazard,
  onClaimTask,
  portalMode,
  height = '240px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const [filter, setFilter] = useState<'all' | 'escalated' | 'in_progress' | 'resolved' | 'reported' | 'high'>('all');
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [showRadius, setShowRadius] = useState<boolean>(true);
  const [selectedHazard, setSelectedHazard] = useState<CivicHazardLocation | null>(
    hazards.find(h => h.id === activeHazardId) || hazards[0] || null
  );

  const filteredHazards = useMemo(() => {
    return hazards.filter(h => {
      const lifecycle = getHazardLifecycleStatus(h);
      if (filter === 'escalated') return lifecycle.label === 'Escalated';
      if (filter === 'in_progress') return lifecycle.label === 'In Progress';
      if (filter === 'resolved') return lifecycle.label === 'Resolved';
      if (filter === 'reported') return lifecycle.label === 'Reported';
      if (filter === 'high') return h.riskLevel === 'High';
      return true;
    });
  }, [hazards, filter]);

  // Center coordinates for Mayur Vihar / Trilokpuri East Delhi Zone
  const centerLat = 28.6125;
  const centerLng = 77.3015;

  // Initialize Leaflet Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Reset container if previous map was detached abruptly
    if ((container as any)._leaflet_id && !mapInstanceRef.current) {
      delete (container as any)._leaflet_id;
      container.innerHTML = '';
    }

    if (!mapInstanceRef.current) {
      const map = L.map(container, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      // Default OpenStreetMap Tile Layer
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Add custom zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add 1.5 km Municipal Jurisdiction & SOS Sanitation Boundary
      const circle = L.circle([centerLat, centerLng], {
        radius: 1500,
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.07,
        weight: 1.5,
        dashArray: '5, 8'
      }).addTo(map);
      radiusCircleRef.current = circle;

      // Add User's Current GPS Location Marker (Pulsating Blue Dot)
      const userLocIcon = L.divIcon({
        className: 'user-gps-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 9999px; background-color: #3B82F6; opacity: 0.4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 9999px; background-color: #1D4ED8; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
          </div>
        `
      });
      L.marker([centerLat, centerLng], { icon: userLocIcon })
        .bindTooltip('📍 Your Location (Mayur Vihar 110091)', { direction: 'top', offset: [0, -10] })
        .addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size after layout stabilization to prevent grey tiles
      const resizeTimer = setTimeout(() => {
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.invalidateSize();
          } catch {}
        }
      }, 250);

      return () => {
        clearTimeout(resizeTimer);
      };
    }

    return () => {
      // Safely close and cleanup all markers
      (Object.values(markersRef.current) as L.Marker[]).forEach(marker => {
        try {
          marker.closePopup();
          marker.closeTooltip();
          marker.unbindPopup();
          marker.unbindTooltip();
          marker.off();
          marker.remove();
        } catch {}
      });
      markersRef.current = {};

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      if (container) {
        delete (container as any)._leaflet_id;
      }
    };
  }, []);

  // Update Tile Layer when style toggle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    if (mapStyle === 'satellite') {
      // High-resolution satellite tiles
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 }
      ).addTo(map);
    } else {
      // Standard crisp OpenStreetMap tiles
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      ).addTo(map);
    }
  }, [mapStyle]);

  // Toggle radius circle visibility
  useEffect(() => {
    if (radiusCircleRef.current) {
      if (showRadius) {
        radiusCircleRef.current.setStyle({ opacity: 1, fillOpacity: 0.07 });
      } else {
        radiusCircleRef.current.setStyle({ opacity: 0, fillOpacity: 0 });
      }
    }
  }, [showRadius]);

  // Invalidate map size whenever container might have adjusted
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch {}
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [portalMode, height]);

  // Update Markers whenever filtered hazards or portal mode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Safely unbind and clear existing markers
    (Object.values(markersRef.current) as L.Marker[]).forEach(marker => {
      try {
        marker.closePopup();
        marker.closeTooltip();
        marker.unbindPopup();
        marker.unbindTooltip();
        marker.off();
        marker.remove();
      } catch {}
    });
    markersRef.current = {};

    filteredHazards.forEach(hazard => {
      const isSelected = selectedHazard?.id === hazard.id;
      const isResolved = hazard.status === 'resolved';
      const isHighRisk = hazard.riskLevel === 'High';
      const lifecycle = getHazardLifecycleStatus(hazard);

      // Pin Color Palette based on risk and lifecycle
      const pinColor = isResolved 
        ? '#10B981' // Emerald Green
        : lifecycle.label === 'Escalated'
        ? (hazard.escalationDay >= 7 ? '#DC2626' : '#EA580C') // Deep Red or Bold Orange
        : lifecycle.label === 'In Progress'
        ? '#2563EB' // Royal Blue
        : isHighRisk 
        ? '#EF4444' // Crimson Red
        : '#F59E0B'; // Amber Orange

      // Create Custom HTML Pin Icon with Prominent Status Indicator Badge
      const customIcon = L.divIcon({
        className: 'custom-hazard-pin-container',
        iconSize: [110, 56],
        iconAnchor: [55, 56],
        popupAnchor: [0, -56],
        html: `
          <div style="position: relative; width: 110px; height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; cursor: pointer;">
            <!-- Prominent Floating Status Indicator Badge Attached to Pin -->
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 3px;
              background-color: ${lifecycle.badgeBg};
              color: ${lifecycle.badgeText};
              border: 1.5px solid #FFFFFF;
              box-shadow: 0 2px 7px rgba(0,0,0,0.38);
              font-size: 8.5px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              padding: 1.5px 7px;
              border-radius: 9999px;
              white-space: nowrap;
              margin-bottom: 2px;
              transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
              transition: transform 0.2s ease;
            ">
              <span style="font-size: 9px;">${lifecycle.icon}</span>
              <span>${lifecycle.label}${lifecycle.label === 'Escalated' ? ` (D${hazard.escalationDay})` : ''}</span>
            </div>

            <!-- Pin Body and Radar Ping -->
            <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
              ${!isResolved ? `
                <div style="
                  position: absolute; 
                  width: 34px; 
                  height: 34px; 
                  border-radius: 9999px; 
                  background-color: ${pinColor}; 
                  opacity: 0.38; 
                  animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>
              ` : ''}
              <div style="
                width: 30px; 
                height: 30px; 
                border-radius: 9999px; 
                background-color: ${pinColor}; 
                border: 2px solid #ffffff; 
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35); 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'}; 
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
              ">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  ${isResolved 
                    ? '<polyline points="20 6 9 17 4 12"></polyline>' 
                    : lifecycle.label === 'Escalated'
                    ? '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'
                    : lifecycle.label === 'In Progress'
                    ? '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>'
                    : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
                  }
                </svg>
              </div>
              <div style="
                position: absolute; 
                bottom: -4px; 
                left: 50%; 
                transform: translateX(-50%); 
                width: 0; 
                height: 0; 
                border-left: 5px solid transparent; 
                border-right: 5px solid transparent; 
                border-top: 6px solid ${pinColor};
              "></div>
            </div>
          </div>
        `
      });

      const marker = L.marker([hazard.lat, hazard.lng], { icon: customIcon }).addTo(map);

      // Tooltip on Hover showing Status and Risk
      marker.bindTooltip(`
        <strong>${lifecycle.icon} [${lifecycle.label.toUpperCase()}] ${hazard.title}</strong><br/>
        <span style="font-size:10px;">${hazard.riskLevel} Risk • ${lifecycle.detail} • ${portalMode === 'worker' ? '₹' + (hazard.payoutRupees || 650) + ' Bounty' : hazard.location}</span>
      `, { direction: 'top', offset: [0, -50] });

      // Popup Content Tailored to Persona Mode with Status Lifecycle Banner
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; max-width: 240px;">
          <!-- Status Lifecycle Pill at top of popup -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="
              font-size: 9px; 
              font-weight: 900; 
              text-transform: uppercase; 
              padding: 2.5px 8px; 
              border-radius: 9999px; 
              background: ${lifecycle.badgeBg}; 
              color: ${lifecycle.badgeText};
              display: flex;
              align-items: center;
              gap: 3px;
            ">
              ${lifecycle.icon} Status: ${lifecycle.label} ${lifecycle.label === 'Escalated' ? `(Day ${hazard.escalationDay}/7)` : ''}
            </span>
            <span style="font-size: 10px; font-weight: 800; font-family: monospace; color: #475569;">
              ${hazard.ticketId}
            </span>
          </div>

          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 800; color: #0F172A; line-height: 1.25;">
            ${hazard.title}
          </h4>
          <p style="margin: 0 0 6px 0; font-size: 10px; color: #64748B;">
            📍 ${hazard.location} (${hazard.pincode})
          </p>

          <!-- Status Milestone Info Box -->
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 4px 7px; font-size: 9.5px; color: #334155; margin-bottom: 6px;">
            <strong>Lifecycle Milestone:</strong> ${lifecycle.detail}
          </div>

          ${portalMode === 'worker' && hazard.status !== 'resolved' ? `
            <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 10px; padding: 6px 8px; display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
              <span style="font-size: 10px; color: #166534; font-weight: 800;">Commercial Payout:</span>
              <span style="font-size: 13px; color: #15803D; font-weight: 900; font-family: monospace;">₹${hazard.payoutRupees || 650} (0% cut)</span>
            </div>
          ` : `
            <div style="background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 8px; padding: 4px 7px; font-size: 9.5px; color: #9A3412; display: flex; justify-content: space-between;">
              <span><strong>Swachhata SLA:</strong> Day ${hazard.escalationDay}/7</span>
              <span style="font-weight: 800;">
                ${hazard.escalationDay >= 7 ? 'Collector Alert' : hazard.escalationDay >= 3 ? 'Supervisory Alert' : 'Inspection Window'}
              </span>
            </div>
          `}
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedHazard(hazard);
        try {
          if (mapInstanceRef.current && mapInstanceRef.current.getContainer()) {
            mapInstanceRef.current.panTo([hazard.lat, hazard.lng], { animate: false });
          }
        } catch {}
        if (onSelectHazard) {
          onSelectHazard(hazard);
        }
      });

      markersRef.current[hazard.id] = marker;
    });
  }, [filteredHazards, portalMode]);

  // Center on active hazard when prop changes
  useEffect(() => {
    if (activeHazardId) {
      const match = hazards.find(h => h.id === activeHazardId);
      if (match) {
        setSelectedHazard(match);
        if (mapInstanceRef.current && mapInstanceRef.current.getContainer()) {
          try {
            mapInstanceRef.current.panTo([match.lat, match.lng], { animate: false });
          } catch {}
        }
      }
    }
  }, [activeHazardId, hazards]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && mapInstanceRef.current.getContainer()) {
      try {
        mapInstanceRef.current.setView([centerLat, centerLng], 14, { animate: false });
      } catch {}
    }
  };

  const selectedLifecycle = selectedHazard ? getHazardLifecycleStatus(selectedHazard) : null;

  return (
    <div className="space-y-2">
      {/* Mini-Map Header & Lifecycle Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-red-600 animate-bounce" />
          <span className="font-black text-slate-900 text-[11px] uppercase tracking-wider">
            Civic Hazard Lifecycle Map
          </span>
          <span className="bg-slate-200 text-slate-800 text-[9px] font-black px-1.5 py-0.2 rounded-md font-mono">
            {filteredHazards.length} Pins
          </span>
        </div>

        {/* Lifecycle Status Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-bold pb-0.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-[#0F172A] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({hazards.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('escalated')}
            className={`px-2 py-0.5 rounded-lg transition-all ${
              filter === 'escalated'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🚨 Escalated ({hazards.filter(h => h.status === 'escalated' || h.escalationDay >= 3).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('in_progress')}
            className={`px-2 py-0.5 rounded-lg transition-all ${
              filter === 'in_progress'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ⚡ In Progress ({hazards.filter(h => h.status === 'in_progress' || h.status === 'assigned').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('resolved')}
            className={`px-2 py-0.5 rounded-lg transition-all ${
              filter === 'resolved'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ✓ Resolved ({hazards.filter(h => h.status === 'resolved').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('reported')}
            className={`px-2 py-0.5 rounded-lg transition-all ${
              filter === 'reported'
                ? 'bg-slate-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📋 Reported ({hazards.filter(h => h.status === 'reported' && h.escalationDay < 3).length})
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner group">
        <div 
          ref={mapContainerRef} 
          style={{ height, width: '100%' }}
          className="z-0 bg-slate-100"
        />

        {/* Floating Top Left Badge: Zone & Status */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 flex-wrap pointer-events-none">
          <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[9px] font-mono px-2 py-1 rounded-xl shadow border border-white/20 flex items-center gap-1 pointer-events-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Mayur Vihar 110091 • 1.5km Zone
          </span>
          {portalMode === 'worker' ? (
            <span className="bg-emerald-700/90 text-white text-[9px] font-bold px-2 py-1 rounded-xl shadow pointer-events-auto">
              💰 Up to ₹800 Bounties
            </span>
          ) : (
            <span className="bg-amber-600/90 text-white text-[9px] font-bold px-2 py-1 rounded-xl shadow pointer-events-auto">
              🛡️ Swachhata 7d SLA
            </span>
          )}
        </div>

        {/* Floating Top Right Style / Radius Toggles */}
        <div className="absolute top-2.5 right-12 z-10 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMapStyle(prev => prev === 'streets' ? 'satellite' : 'streets')}
            className="px-2 py-1 bg-white/90 hover:bg-white text-slate-800 text-[9px] font-black rounded-lg shadow-sm border border-slate-300 transition-all flex items-center gap-1"
            title="Toggle Map Style"
          >
            <Layers size={11} className="text-teal-700" />
            <span>{mapStyle === 'streets' ? 'Satellite' : 'Streets'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowRadius(prev => !prev)}
            className={`px-1.5 py-1 text-[9px] font-bold rounded-lg shadow-sm border transition-all ${
              showRadius 
                ? 'bg-blue-600 text-white border-blue-700' 
                : 'bg-white/90 text-slate-700 border-slate-300'
            }`}
            title="Toggle 1.5km Sanitation Boundary Circle"
          >
            1.5km
          </button>
        </div>

        {/* Recenter Button Bottom Right */}
        <button
          type="button"
          onClick={handleRecenter}
          title="Recenter to Zone Center"
          className="absolute bottom-2.5 right-2.5 z-10 w-7 h-7 rounded-xl bg-white text-slate-700 hover:text-slate-950 flex items-center justify-center shadow-md border border-slate-200 hover:bg-slate-50 transition-transform active:scale-90"
        >
          <Navigation size={13} className="text-teal-700" />
        </button>
      </div>

      {/* Selected Hazard Spotlight Card below the Map with Lifecycle Progress */}
      {selectedHazard && selectedLifecycle && (
        <div className={`p-3.5 rounded-2xl border text-xs transition-all space-y-2.5 ${
          selectedHazard.status === 'resolved'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : selectedLifecycle.label === 'Escalated'
            ? 'bg-red-50/90 border-red-200 text-red-950'
            : selectedLifecycle.label === 'In Progress'
            ? 'bg-blue-50/90 border-blue-200 text-blue-950'
            : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <img
                src={selectedHazard.imageUrl}
                alt={selectedHazard.title}
                className="w-12 h-12 rounded-xl object-cover border border-white/80 shadow-xs flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Status Indicator Pill */}
                  <span style={{ backgroundColor: selectedLifecycle.badgeBg, color: selectedLifecycle.badgeText }} className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <span>{selectedLifecycle.icon}</span>
                    <span>Status: {selectedLifecycle.label}</span>
                  </span>
                  <span className="text-[9px] font-bold bg-white/80 text-slate-700 px-1.5 py-0.2 rounded border">
                    {selectedHazard.riskLevel} Risk
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 font-bold">
                    {selectedHazard.ticketId}
                  </span>
                </div>
                <h5 className="font-extrabold text-slate-900 text-xs mt-1 truncate">
                  {selectedHazard.title}
                </h5>
                <p className="text-[10px] text-slate-600 truncate">
                  📍 {selectedHazard.location} ({selectedHazard.pincode})
                </p>
              </div>
            </div>

            {/* Persona Action */}
            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
              {portalMode === 'worker' ? (
                selectedHazard.status === 'resolved' ? (
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <CheckCircle2 size={12} /> Cleaned Up ✓
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (onClaimTask) {
                        onClaimTask(selectedHazard);
                      }
                    }}
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                  >
                    <IndianRupee size={12} />
                    <span>Claim Gig (+₹{selectedHazard.payoutRupees || 650})</span>
                  </button>
                )
              ) : (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 block">
                    Swachhata SLA Status:
                  </span>
                  <span className={`text-xs font-black font-mono ${
                    selectedHazard.escalationDay >= 7 ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    Day {selectedHazard.escalationDay} / 7
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 4-Step Lifecycle Status Progress Bar */}
          <div className="pt-2 border-t border-slate-200/70">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-1">
              <span className="uppercase tracking-wider">Hazard Lifecycle:</span>
              <span className="font-semibold text-slate-700">{selectedLifecycle.detail}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[8.5px] font-extrabold uppercase">
              <div className={`p-1 rounded-lg border transition-all ${
                selectedHazard.status !== 'resolved' && (selectedLifecycle.label === 'Reported' || selectedLifecycle.label === 'Escalated' || selectedLifecycle.label === 'In Progress')
                  ? 'bg-slate-800 text-white border-slate-900'
                  : 'bg-white/60 text-slate-400 border-slate-200'
              }`}>
                1. Filed (D0)
              </div>
              <div className={`p-1 rounded-lg border transition-all ${
                selectedLifecycle.label === 'Escalated'
                  ? 'bg-red-600 text-white border-red-700'
                  : selectedHazard.status === 'resolved'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-white/60 text-slate-400 border-slate-200'
              }`}>
                2. Escalated (D{selectedHazard.escalationDay || 3})
              </div>
              <div className={`p-1 rounded-lg border transition-all ${
                selectedLifecycle.label === 'In Progress'
                  ? 'bg-blue-600 text-white border-blue-700'
                  : selectedHazard.status === 'resolved'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-white/60 text-slate-400 border-slate-200'
              }`}>
                3. In Progress
              </div>
              <div className={`p-1 rounded-lg border transition-all ${
                selectedHazard.status === 'resolved'
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-white/60 text-slate-400 border-slate-200'
              }`}>
                4. Resolved ✓
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CivicHazardMiniMap;
