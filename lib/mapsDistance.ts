// Source: Google Maps Platform Code Assist
// Utility for real-time geographic location, distance calculation, and transit ETA

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

/**
 * Calculates the great-circle distance between two geographic coordinates using the Haversine formula (km)
 */
export function calculateGeodesicDistanceKm(p1: LatLngLiteral, p2: LatLngLiteral): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Estimates realistic road network transit distance and driving time
 * Applies district road curvature factor (~1.28x) and typical medical courier speed (32 km/h)
 */
export function estimateRoadTransit(p1: LatLngLiteral, p2: LatLngLiteral): {
  distanceKm: number;
  travelTimeMins: number;
  formattedDistance: string;
  formattedEta: string;
} {
  const straightLine = calculateGeodesicDistanceKm(p1, p2);
  // District highway and rural arterial curvature multiplier
  const distanceKm = Math.round(Math.max(1.5, straightLine * 1.28) * 10) / 10;
  // Average emergency dispatch courier speed through UP district roads with speed breakers and market crossings
  const averageSpeedKmh = 30;
  const travelTimeMins = Math.max(8, Math.round((distanceKm / averageSpeedKmh) * 60));

  return {
    distanceKm,
    travelTimeMins,
    formattedDistance: `${distanceKm.toFixed(1)} km`,
    formattedEta: travelTimeMins >= 60
      ? `${Math.floor(travelTimeMins / 60)}h ${travelTimeMins % 60}m`
      : `${travelTimeMins} mins`,
  };
}

/**
 * Geolocation helper to fetch live GPS device coordinates
 */
export function getLiveUserPosition(): Promise<LatLngLiteral> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser environment.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  });
}
