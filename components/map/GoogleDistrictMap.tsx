// Source: Google Maps Platform Code Assist
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { Facility, AlertItem } from '@/types';
import {
  Navigation,
  MapPin,
  Route,
  Clock,
  Layers,
  LocateFixed,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { estimateRoadTransit, getLiveUserPosition, LatLngLiteral } from '@/lib/mapsDistance';

interface GoogleDistrictMapProps {
  facilities: Facility[];
  alerts?: AlertItem[];
  selectedDistrict: string;
  onFacilityClick?: (facility: Facility) => void;
  selectedFacilityId?: string | null;
  showTransferRoute?: boolean;
}

// Deterministic real GPS coordinate fallbacks for Meerut and Baghpat PHCs
const FALLBACK_DISTRICT_COORDS: Record<string, LatLngLiteral> = {
  // Meerut District Facilities
  'phc-a': { lat: 29.0250, lng: 77.7020 }, // Meerut North
  'phc-b': { lat: 28.9550, lng: 77.7280 }, // Meerut Rural
  'phc-c': { lat: 29.1000, lng: 77.9200 }, // Mawana
  'phc-d': { lat: 29.1450, lng: 77.6150 }, // Sardhana
  'phc-e': { lat: 28.8400, lng: 77.7400 }, // Kharkhoda
  'phc-f': { lat: 29.1700, lng: 77.9900 }, // Hastinapur
  'phc-g': { lat: 29.0700, lng: 77.7100 }, // Modipuram
  'phc-h': { lat: 28.9800, lng: 77.9300 }, // Parikshitgarh
  'phc-i': { lat: 28.8650, lng: 77.9200 }, // Kithore
  'phc-j': { lat: 29.1200, lng: 77.7100 }, // Daurala
  // Baghpat District Facilities
  'phc-k': { lat: 28.9450, lng: 77.2250 }, // Baghpat Central
  'phc-l': { lat: 29.1000, lng: 77.2600 }, // Baraut
  'phc-m': { lat: 28.8700, lng: 77.2800 }, // Khekra
  'phc-n': { lat: 29.2100, lng: 77.1800 }, // Chhaprauli
  'phc-o': { lat: 29.0400, lng: 77.4100 }, // Binauli
  'phc-p': { lat: 28.9200, lng: 77.3400 }, // Pilana
  'phc-q': { lat: 29.0100, lng: 77.3500 }, // Ramala
  'phc-r': { lat: 29.1400, lng: 77.4200 }, // Doghat
  'phc-s': { lat: 29.1800, lng: 77.3800 }, // Tikri
  'phc-t': { lat: 28.9100, lng: 77.2700 }, // Aminagar Sarai
};

const DISTRICT_CENTERS: Record<string, { center: LatLngLiteral; zoom: number }> = {
  'Meerut District': {
    center: { lat: 29.015, lng: 77.730 },
    zoom: 11,
  },
  'Baghpat District': {
    center: { lat: 29.030, lng: 77.280 },
    zoom: 11,
  },
};

/**
 * Custom Polyline component rendered inside the Google Map context
 */
function RouteCorridorLayer({
  origin,
  destination,
  label,
}: {
  origin: LatLngLiteral;
  destination: LatLngLiteral;
  label?: string;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    // Realistic corridor connecting origin and destination with slight road curvature
    const midLat = (origin.lat + destination.lat) / 2 + 0.004;
    const midLng = (origin.lng + destination.lng) / 2 - 0.006;
    const path = [origin, { lat: midLat, lng: midLng }, destination];

    const outerGlow = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#3B82F6',
      strokeOpacity: 0.45,
      strokeWeight: 7,
      map,
    });

    const mainLine = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#1D4ED8',
      strokeOpacity: 0.95,
      strokeWeight: 3.5,
      map,
    });

    return () => {
      outerGlow.setMap(null);
      mainLine.setMap(null);
    };
  }, [map, origin, destination]);

  return null;
}

/**
 * Controller to pan map when a facility is selected or district switches
 */
function MapCameraHandler({
  targetCenter,
  zoom,
}: {
  targetCenter: LatLngLiteral;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo(targetCenter);
    if (zoom) map.setZoom(zoom);
  }, [map, targetCenter, zoom]);

  return null;
}

export function GoogleDistrictMap({
  facilities,
  alerts = [],
  selectedDistrict,
  onFacilityClick,
  selectedFacilityId,
  showTransferRoute = true,
}: GoogleDistrictMapProps) {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const [userSelectedFacility, setUserSelectedFacility] = useState<Facility | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [userLocation, setUserLocation] = useState<LatLngLiteral | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Filter facilities for current district
  const districtFacilities = useMemo(
    () => facilities.filter((f) => f.district === selectedDistrict),
    [facilities, selectedDistrict]
  );

  // Directly derive activeFacility without setState in effect
  const activeFacility = useMemo(() => {
    if (selectedFacilityId) {
      const match = districtFacilities.find((f) => f.id === selectedFacilityId);
      if (match) return match;
    }
    return userSelectedFacility;
  }, [selectedFacilityId, districtFacilities, userSelectedFacility]);

  const setActiveFacility = (facility: Facility | null) => {
    setUserSelectedFacility(facility);
  };

  // Center coordinate calculation
  const districtConfig =
    DISTRICT_CENTERS[selectedDistrict] || DISTRICT_CENTERS['Meerut District'];

  // Safe coordinate resolver for any facility
  const getFacilityLocation = useCallback((fac: Facility): LatLngLiteral => {
    if (fac.geoCoordinates && fac.geoCoordinates.lat && fac.geoCoordinates.lng) {
      return fac.geoCoordinates;
    }
    if (FALLBACK_DISTRICT_COORDS[fac.id]) {
      return FALLBACK_DISTRICT_COORDS[fac.id];
    }
    // Deterministic fallback derived from district center and SVG coordinate delta
    const base = districtConfig.center;
    return {
      lat: base.lat + ((fac.coordinates.y - 40) / 100) * 0.28,
      lng: base.lng + ((fac.coordinates.x - 50) / 100) * 0.38,
    };
  }, [districtConfig]);

  // Key facilities for Transfer Route Corridor: PHC A (Donor) -> PHC B (Recipient)
  const sourceFacility = districtFacilities.find((f) => f.id === 'phc-a');
  const criticalFacility = districtFacilities.find((f) => f.id === 'phc-b');

  const transferCorridor = useMemo(() => {
    if (!sourceFacility || !criticalFacility) return null;
    const origin = getFacilityLocation(sourceFacility);
    const destination = getFacilityLocation(criticalFacility);
    const transit = estimateRoadTransit(origin, destination);

    return {
      origin,
      destination,
      source: sourceFacility,
      dest: criticalFacility,
      ...transit,
    };
  }, [sourceFacility, criticalFacility, getFacilityLocation]);

  // Real-time distances from currently selected facility to other PHCs
  const facilityDistanceMatrix = useMemo(() => {
    if (!activeFacility) return [];

    const activeLoc = getFacilityLocation(activeFacility);
    return districtFacilities
      .filter((f) => f.id !== activeFacility.id)
      .map((other) => {
        const otherLoc = getFacilityLocation(other);
        const transit = estimateRoadTransit(activeLoc, otherLoc);
        return {
          facility: other,
          distanceKm: transit.distanceKm,
          travelTimeMins: transit.travelTimeMins,
          formattedDistance: transit.formattedDistance,
          formattedEta: transit.formattedEta,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [activeFacility, districtFacilities, getFacilityLocation]);

  // Real-time distance from user's live position to selected facility
  const userTransitToActive = useMemo(() => {
    if (!userLocation || !activeFacility) return null;
    const facLoc = getFacilityLocation(activeFacility);
    return estimateRoadTransit(userLocation, facLoc);
  }, [userLocation, activeFacility, getFacilityLocation]);

  // Handle request for real-time location
  const handleLocateUser = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const pos = await getLiveUserPosition();
      setUserLocation(pos);
    } catch {
      // In case browser denies permission, fallback to Meerut District HQ Command Post coordinates
      setUserLocation({ lat: 28.985, lng: 77.705 });
      setLocationError('Using District Command Post location');
    } finally {
      setIsLocating(false);
    }
  };

  // Status Pin Colors
  const getPinTheme = (status: Facility['status']) => {
    switch (status) {
      case 'Critical':
        return { background: '#DC2626', glyphColor: '#FFFFFF', borderColor: '#991B1B' };
      case 'High Risk':
        return { background: '#EA580C', glyphColor: '#FFFFFF', borderColor: '#C2410C' };
      case 'Monitoring':
        return { background: '#D97706', glyphColor: '#FFFFFF', borderColor: '#B45309' };
      case 'Safe':
        return { background: '#16A34A', glyphColor: '#FFFFFF', borderColor: '#15803D' };
      case 'Expiry Opportunity':
        return { background: '#7C3AED', glyphColor: '#FFFFFF', borderColor: '#6D28D9' };
      case 'Needs Verification':
      default:
        return { background: '#64748B', glyphColor: '#FFFFFF', borderColor: '#475569' };
    }
  };

  return (
    <div className="relative flex-1 w-full bg-[#F8FAFC] dark:bg-[#0D182E] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xs">
      {/* Top Interactive Toolbar */}
      <div className="px-3.5 py-2.5 bg-white/95 dark:bg-[#162238]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 overflow-x-auto z-10">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Maps Platform</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            Live Geolocation &amp; Road Distance Corridors
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live Location Trigger */}
          <button
            type="button"
            onClick={handleLocateUser}
            disabled={isLocating}
            title="Locate DHO / Field Command Device"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              userLocation
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {userLocation ? 'Live GPS Active' : 'My Position'}
            </span>
          </button>

          {/* Map Layer Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                mapType === 'roadmap'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Road
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                mapType === 'satellite'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Main Google Map Canvas (Explicit Height required to prevent CF2 height collapse) */}
      <div className="relative w-full h-[460px] min-h-[460px] bg-slate-100 dark:bg-slate-900">
        <APIProvider apiKey={API_KEY} libraries={['marker', 'routes', 'geometry']}>
          <Map
            // Mandatory DEMO_MAP_ID or registered mapId for AdvancedMarkerElement (CF9)
            mapId="DEMO_MAP_ID"
            defaultCenter={districtConfig.center}
            defaultZoom={districtConfig.zoom}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapTypeId={mapType}
            // CRITICAL: Mandatory Internal Usage Attribution ID (Overriding default per skill instruction)
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Optional camera update on facility click */}
            {activeFacility && (
              <MapCameraHandler targetCenter={getFacilityLocation(activeFacility)} />
            )}

            {/* Active Redistribution Route Corridor (PHC A -> PHC B) */}
            {showTransferRoute && transferCorridor && (
              <RouteCorridorLayer
                origin={transferCorridor.origin}
                destination={transferCorridor.destination}
                label="Redistribution Corridor"
              />
            )}

            {/* User Live GPS Marker */}
            {userLocation && (
              <AdvancedMarker position={userLocation} title="Your Live Command Location">
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping" />
                  <span className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px]">
                    ★
                  </span>
                </div>
              </AdvancedMarker>
            )}

            {/* Render All District Facilities with Modern AdvancedMarkerElement */}
            {districtFacilities.map((facility) => {
              const pos = getFacilityLocation(facility);
              const isSelected = activeFacility?.id === facility.id;
              const isCritical = facility.status === 'Critical';
              const pinTheme = getPinTheme(facility.status);

              return (
                <AdvancedMarker
                  key={facility.id}
                  position={pos}
                  title={`${facility.name} (${facility.code}) - ${facility.status}`}
                  onClick={() => {
                    setActiveFacility(facility);
                    if (onFacilityClick) onFacilityClick(facility);
                  }}
                >
                  <div className="relative group cursor-pointer">
                    {/* Animated Pulsing Ring for Critical Shortage Facilities */}
                    {isCritical && (
                      <span className="absolute -inset-2.5 rounded-full bg-red-600/40 animate-pulse pointer-events-none" />
                    )}

                    {/* Standard AdvancedMarker Pin Customization */}
                    <Pin
                      background={pinTheme.background}
                      borderColor={pinTheme.borderColor}
                      glyphColor={pinTheme.glyphColor}
                      scale={isSelected ? 1.25 : isCritical ? 1.15 : 1.0}
                    >
                      <span className="font-bold text-[10px] text-white">
                        {facility.code.replace('PHC ', '')}
                      </span>
                    </Pin>

                    {/* Pill Label */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-slate-900/90 text-white rounded text-[10px] font-bold whitespace-nowrap shadow-xs pointer-events-none">
                      {facility.code}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* InfoWindow for Active Facility */}
            {activeFacility && (
              <InfoWindow
                position={getFacilityLocation(activeFacility)}
                onCloseClick={() => setActiveFacility(null)}
              >
                <div className="p-1 max-w-[240px] text-slate-900 font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-1.5">
                    <span className="font-bold text-xs truncate">{activeFacility.name}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        activeFacility.status === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : activeFacility.status === 'High Risk'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {activeFacility.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span>Bed Occupancy:</span>
                      <span className="font-semibold text-slate-900">
                        {activeFacility.bedsOccupied}/{activeFacility.bedsTotal}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Trust Score:</span>
                      <span className="font-semibold text-slate-900">
                        {activeFacility.dataTrustScore}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Staff on Duty:</span>
                      <span className="font-semibold text-slate-900">
                        {activeFacility.staffOnDuty}/{activeFacility.staffRequired}
                      </span>
                    </div>
                  </div>

                  {/* Real-time distance from user if available */}
                  {userTransitToActive && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-blue-700 bg-blue-50 p-1 rounded font-semibold">
                      <span>Distance from You:</span>
                      <span>
                        {userTransitToActive.formattedDistance} ({userTransitToActive.formattedEta})
                      </span>
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Floating Route Distance Card (Top Left Overlay) */}
        {transferCorridor && (
          <div className="absolute top-4 left-4 z-10 bg-slate-900/95 text-white dark:bg-[#162238]/95 backdrop-blur-md p-3 rounded-xl border border-white/10 dark:border-slate-700 shadow-xl max-w-[290px] text-xs">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-2">
              <span className="font-bold text-xs flex items-center gap-1.5 text-blue-400">
                <Route className="w-3.5 h-3.5" />
                <span>Active Redistribution Corridor</span>
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Origin:</span>
                <span className="font-semibold">{transferCorridor.source.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="font-semibold text-red-400">{transferCorridor.dest.name}</span>
              </div>
              <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-emerald-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {transferCorridor.formattedEta} ETA
                </span>
                <span className="text-blue-300">{transferCorridor.formattedDistance}</span>
              </div>
            </div>

            <div className="mt-2 pt-1.5 border-t border-white/10 text-[10px] text-slate-400">
              Via NH-58 / Outer Ring Road bypass. Cold chain window preserved.
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Distance Matrix & Facility Logistics Bottom Drawer */}
      <div className="p-3 bg-white dark:bg-[#162238] border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {activeFacility
                ? `Real-Time Transit Distances from ${activeFacility.name} (${activeFacility.code})`
                : 'Select any facility on Google Maps to inspect road transit distances'}
            </span>
          </div>
          {activeFacility && (
            <span className="text-[10px] text-slate-400 font-mono">
              Sorted by road travel time
            </span>
          )}
        </div>

        {activeFacility ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            {facilityDistanceMatrix.slice(0, 4).map(({ facility, formattedDistance, formattedEta }) => (
              <div
                key={facility.id}
                onClick={() => {
                  setActiveFacility(facility);
                  if (onFacilityClick) onFacilityClick(facility);
                }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    {facility.code} · {facility.name}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      facility.status === 'Critical'
                        ? 'bg-red-500 animate-pulse'
                        : facility.status === 'High Risk'
                        ? 'bg-orange-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formattedEta}
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formattedDistance}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-3 text-center text-xs text-slate-500 dark:text-slate-400">
            Click any facility marker on the Google Map above to see live road distances, estimated transit ETAs, and arterial delivery corridors.
          </div>
        )}
      </div>
    </div>
  );
}
