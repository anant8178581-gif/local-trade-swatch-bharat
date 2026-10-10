// Location and Geocoding Service for Local Trades India
export interface LocationCoords {
  lat: number;
  lng: number;
}

export interface GeocodedLocation {
  lat: number;
  lng: number;
  formattedAddress: string;
  area: string;
  city: string;
  pincode: string;
  isAutoLocated: boolean;
}

export const DEFAULT_LOCATIONS: Record<string, GeocodedLocation> = {
  mumbai_dadar: {
    lat: 19.0178,
    lng: 72.8478,
    formattedAddress: 'Shivaji Park, Dadar West, Mumbai, Maharashtra 400028',
    area: 'Dadar West',
    city: 'Mumbai',
    pincode: '400028',
    isAutoLocated: false,
  },
  mumbai_bandra: {
    lat: 19.0596,
    lng: 72.8295,
    formattedAddress: 'Pali Hill, Bandra West, Mumbai, Maharashtra 400050',
    area: 'Bandra West',
    city: 'Mumbai',
    pincode: '400050',
    isAutoLocated: false,
  },
  mumbai_andheri: {
    lat: 19.1136,
    lng: 72.8697,
    formattedAddress: 'Chakala, Andheri East, Mumbai, Maharashtra 400093',
    area: 'Andheri East',
    city: 'Mumbai',
    pincode: '400093',
    isAutoLocated: false,
  },
  mumbai_powai: {
    lat: 19.1197,
    lng: 72.9051,
    formattedAddress: 'Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076',
    area: 'Powai',
    city: 'Mumbai',
    pincode: '400076',
    isAutoLocated: false,
  },
  delhi_cp: {
    lat: 28.6315,
    lng: 77.2167,
    formattedAddress: 'Connaught Place, Central Delhi, New Delhi 110001',
    area: 'Connaught Place',
    city: 'New Delhi',
    pincode: '110001',
    isAutoLocated: false,
  },
  bengaluru_koramangala: {
    lat: 12.9352,
    lng: 77.6245,
    formattedAddress: '80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
    area: 'Koramangala 4th Block',
    city: 'Bengaluru',
    pincode: '560034',
    isAutoLocated: false,
  }
};

/**
 * Calculates distance between two coordinates in Kilometers (Haversine Formula)
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Real Geolocation auto-detection with high accuracy
 */
export async function getLiveGPSLocation(): Promise<GeocodedLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser/device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geocoded = await reverseGeocode(latitude, longitude);
          resolve({
            ...geocoded,
            isAutoLocated: true
          });
        } catch {
          // Fallback if reverse geocode fails
          resolve({
            lat: latitude,
            lng: longitude,
            formattedAddress: `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            area: 'Current Area',
            city: 'Auto Located',
            pincode: '',
            isAutoLocated: true
          });
        }
      },
      (error) => {
        console.warn('GPS permission denied or timeout, fallback to default Dadar Mumbai', error);
        resolve({
          ...DEFAULT_LOCATIONS.mumbai_dadar,
          isAutoLocated: false
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  });
}

/**
 * Reverse geocodes coordinates to a clean address string
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedLocation> {
  try {
    // Attempt using OpenStreetMap Nominatim reverse geocode (CORS-friendly public endpoint)
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: {
        'Accept-Language': 'en'
      }
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || 'Local Area';
      const city = addr.city || addr.town || addr.county || 'Mumbai';
      const pincode = addr.postcode || '';
      return {
        lat,
        lng,
        formattedAddress: data.display_name ? data.display_name.split(',').slice(0, 4).join(', ') : `${area}, ${city}`,
        area,
        city,
        pincode,
        isAutoLocated: false
      };
    }
  } catch (e) {
    console.warn('Reverse geocoding error:', e);
  }

  // Fallback heuristic based on coordinates
  const nearest = findNearestDefaultCity(lat, lng);
  return {
    lat,
    lng,
    formattedAddress: `${nearest.area}, ${nearest.city} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    area: nearest.area,
    city: nearest.city,
    pincode: nearest.pincode,
    isAutoLocated: false
  };
}

function findNearestDefaultCity(lat: number, lng: number): GeocodedLocation {
  let closest = DEFAULT_LOCATIONS.mumbai_dadar;
  let minDistance = Infinity;

  Object.values(DEFAULT_LOCATIONS).forEach((loc) => {
    const dist = calculateDistanceKm(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  });

  return closest;
}
