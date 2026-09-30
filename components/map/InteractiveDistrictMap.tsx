'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Facility, AlertItem } from '@/types';
import {
  Keyboard,
  Filter,
  ShieldCheck,
  MapPin,
  AlertCircle,
  AlertTriangle,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface InteractiveDistrictMapProps {
  facilities: Facility[];
  alerts?: AlertItem[];
  selectedDistrict: string;
  onFacilityClick?: (facility: Facility) => void;
  selectedFacilityId?: string | null;
  showTransferRoute?: boolean;
}

export interface FacilityCluster {
  id: string;
  name: string;
  facilities: Facility[];
  x: number;
  y: number;
  criticalAlertsCount: number;
  highRiskCount: number;
  safeCount: number;
  needsVerificationCount: number;
  totalFacilities: number;
  dominantStatus: Facility['status'];
}

export function InteractiveDistrictMap({
  facilities,
  alerts = [],
  selectedDistrict,
  onFacilityClick,
  selectedFacilityId,
  showTransferRoute = true,
}: InteractiveDistrictMapProps) {
  // Zoom & View State (Default 1.0 = Overview / Low Zoom)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [focusCenter, setFocusCenter] = useState<{ x: number; y: number }>({ x: 50, y: 40 });
  const [clusterMode, setClusterMode] = useState<'auto' | 'clustered' | 'pins'>('auto');

  // Hover & Selection State
  const [hoveredFacility, setHoveredFacility] = useState<Facility | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<FacilityCluster | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('All');

  // Keyboard navigation refs
  const markerRefs = useRef<(SVGGElement | null)[]>([]);
  const clusterRefs = useRef<(SVGGElement | null)[]>([]);

  // Filter facilities by selected district
  const districtFacilities = useMemo(
    () => facilities.filter((f) => f.district === selectedDistrict),
    [facilities, selectedDistrict]
  );

  // Determine whether clustering is active
  // Low zoom threshold is <= 1.15
  const isClustered =
    clusterMode === 'clustered' || (clusterMode === 'auto' && zoomLevel <= 1.15);

  // Status color mapper with WCAG AA compliant colors
  const getMarkerColor = (status: Facility['status']) => {
    switch (status) {
      case 'Critical':
        return '#DC2626'; // Critical Red
      case 'High Risk':
        return '#EA580C'; // High Risk Orange
      case 'Monitoring':
        return '#D97706'; // Monitoring Amber
      case 'Safe':
        return '#16A34A'; // Safe Green
      case 'Expiry Opportunity':
        return '#7C3AED'; // Expiry Purple
      case 'Needs Verification':
        return '#64748B'; // Verification Blue-Grey
      default:
        return '#2563EB';
    }
  };

  // Advanced spatial clustering algorithm based on Euclidean proximity
  const clusters: FacilityCluster[] = useMemo(() => {
    const result: FacilityCluster[] = [];
    const visited = new Set<string>();
    const CLUSTER_DISTANCE = 23; // Euclidean coordinate distance on 100x80 canvas

    for (const facility of districtFacilities) {
      if (visited.has(facility.id)) continue;

      const clusterFacilities: Facility[] = [facility];
      visited.add(facility.id);

      // Find nearby unvisited facilities
      let expanded = true;
      while (expanded) {
        expanded = false;
        for (const other of districtFacilities) {
          if (visited.has(other.id)) continue;
          const isNearby = clusterFacilities.some((cf) => {
            const dx = cf.coordinates.x - other.coordinates.x;
            const dy = cf.coordinates.y - other.coordinates.y;
            return Math.sqrt(dx * dx + dy * dy) <= CLUSTER_DISTANCE;
          });

          if (isNearby) {
            clusterFacilities.push(other);
            visited.add(other.id);
            expanded = true;
          }
        }
      }

      // Calculate cluster centroid
      const sumX = clusterFacilities.reduce((sum, f) => sum + f.coordinates.x, 0);
      const sumY = clusterFacilities.reduce((sum, f) => sum + f.coordinates.y, 0);
      const avgX = Math.round((sumX / clusterFacilities.length) * 10) / 10;
      const avgY = Math.round((sumY / clusterFacilities.length) * 10) / 10;

      // Count critical alerts in this cluster
      const facilityIds = new Set(clusterFacilities.map((f) => f.id));
      const clusterAlerts = alerts.filter((a) => facilityIds.has(a.facilityId));
      const alertCriticalCount = clusterAlerts.filter(
        (a) => a.severity === 'Critical' && a.status !== 'Resolved'
      ).length;
      const statusCriticalCount = clusterFacilities.filter((f) => f.status === 'Critical').length;
      // Exact aggregate count of active critical alerts
      const criticalAlertsCount = Math.max(alertCriticalCount, statusCriticalCount);

      const highRiskCount = clusterFacilities.filter((f) => f.status === 'High Risk').length;
      const safeCount = clusterFacilities.filter((f) => f.status === 'Safe').length;
      const needsVerificationCount = clusterFacilities.filter(
        (f) => f.status === 'Needs Verification'
      ).length;

      // Dominant severity status
      let dominantStatus: Facility['status'] = 'Safe';
      if (criticalAlertsCount > 0) dominantStatus = 'Critical';
      else if (highRiskCount > 0) dominantStatus = 'High Risk';
      else if (needsVerificationCount > 0) dominantStatus = 'Needs Verification';
      else if (clusterFacilities.some((f) => f.status === 'Monitoring')) dominantStatus = 'Monitoring';
      else if (clusterFacilities.some((f) => f.status === 'Expiry Opportunity'))
        dominantStatus = 'Expiry Opportunity';

      // Naming based on geographic sub-quadrant
      let sectorName = `${clusterFacilities[0].block || clusterFacilities[0].name} Sector`;
      if (avgY < 30 && avgX < 50) sectorName = 'North Corridor';
      else if (avgY < 30 && avgX >= 50) sectorName = 'East-Mawana Sector';
      else if (avgY >= 30 && avgX >= 58) sectorName = 'Hastinapur Belt';
      else if (avgY >= 38 && avgX < 45) sectorName = 'West-Sardhana Sector';
      else if (avgY >= 38 && avgX >= 45) sectorName = 'Central-Rural Sector';

      result.push({
        id: `cluster-${clusterFacilities.map((f) => f.id).join('-')}`,
        name: sectorName,
        facilities: clusterFacilities,
        x: avgX,
        y: avgY,
        criticalAlertsCount,
        highRiskCount,
        safeCount,
        needsVerificationCount,
        totalFacilities: clusterFacilities.length,
        dominantStatus,
      });
    }

    return result;
  }, [districtFacilities, alerts]);

  // Total district critical alerts across clusters
  const totalDistrictCriticalAlerts = useMemo(() => {
    return clusters.reduce((acc, c) => acc + c.criticalAlertsCount, 0);
  }, [clusters]);

  // Dynamic SVG viewBox calculation based on current zoomLevel and focusCenter
  const viewBox = useMemo(() => {
    const viewWidth = 100 / zoomLevel;
    const viewHeight = 80 / zoomLevel;
    const minX = Math.max(0, Math.min(100 - viewWidth, focusCenter.x - viewWidth / 2));
    const minY = Math.max(0, Math.min(80 - viewHeight, focusCenter.y - viewHeight / 2));
    return `${minX.toFixed(2)} ${minY.toFixed(2)} ${viewWidth.toFixed(2)} ${viewHeight.toFixed(2)}`;
  }, [zoomLevel, focusCenter]);

  // Reset zoom & focus during render when district changes (React recommended pattern)
  const [prevDistrict, setPrevDistrict] = useState(selectedDistrict);
  if (prevDistrict !== selectedDistrict) {
    setPrevDistrict(selectedDistrict);
    setZoomLevel(1.0);
    setFocusCenter({ x: 50, y: 40 });
    setHoveredCluster(null);
    setHoveredFacility(null);
  }

  // Zoom Handlers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(2.4, Math.round((prev + 0.35) * 100) / 100));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(0.85, Math.round((prev - 0.35) * 100) / 100);
      if (next <= 1.0) {
        setFocusCenter({ x: 50, y: 40 });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
    setFocusCenter({ x: 50, y: 40 });
    setHoveredCluster(null);
    setHoveredFacility(null);
  };

  const handleZoomToCluster = (cluster: FacilityCluster) => {
    setFocusCenter({ x: cluster.x, y: cluster.y });
    setZoomLevel(1.8); // Zooms into high level, automatically unbundling the cluster into individual pins
    setHoveredCluster(null);
  };

  // Keyboard navigation for facility pins (high zoom)
  const handleFacilityKeyDown = (
    e: React.KeyboardEvent<SVGGElement>,
    index: number,
    facility: Facility
  ) => {
    const total = districtFacilities.length;
    let nextIndex = -1;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onFacilityClick) onFacilityClick(facility);
        setHoveredFacility(facility);
        break;
      case 'Escape':
        e.preventDefault();
        setHoveredFacility(null);
        handleResetZoom();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (index + 1) % total;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = (index - 1 + total) % total;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = total - 1;
        break;
    }

    if (nextIndex >= 0 && markerRefs.current[nextIndex]) {
      markerRefs.current[nextIndex]?.focus();
      setHoveredFacility(districtFacilities[nextIndex]);
    }
  };

  // Keyboard navigation for clusters (low zoom)
  const handleClusterKeyDown = (
    e: React.KeyboardEvent<SVGGElement>,
    index: number,
    cluster: FacilityCluster
  ) => {
    const total = clusters.length;
    let nextIndex = -1;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleZoomToCluster(cluster);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (index + 1) % total;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = (index - 1 + total) % total;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = total - 1;
        break;
      case 'Escape':
        e.preventDefault();
        setHoveredCluster(null);
        break;
    }

    if (nextIndex >= 0 && clusterRefs.current[nextIndex]) {
      clusterRefs.current[nextIndex]?.focus();
      setHoveredCluster(clusters[nextIndex]);
    }
  };

  const legendItems = [
    { label: 'All', status: 'All', color: '#0F172A', count: districtFacilities.length },
    {
      label: 'Critical',
      status: 'Critical',
      color: '#DC2626',
      count: districtFacilities.filter((f) => f.status === 'Critical').length,
    },
    {
      label: 'High Risk',
      status: 'High Risk',
      color: '#EA580C',
      count: districtFacilities.filter((f) => f.status === 'High Risk').length,
    },
    {
      label: 'Expiry Match',
      status: 'Expiry Opportunity',
      color: '#7C3AED',
      count: districtFacilities.filter((f) => f.status === 'Expiry Opportunity').length,
    },
    {
      label: 'Safe Buffer',
      status: 'Safe',
      color: '#16A34A',
      count: districtFacilities.filter((f) => f.status === 'Safe').length,
    },
    {
      label: 'Stale Telemetry',
      status: 'Needs Verification',
      color: '#64748B',
      count: districtFacilities.filter((f) => f.status === 'Needs Verification').length,
    },
  ];

  return (
    <div className="relative flex-1 min-h-[420px] w-full bg-[#F8FAFC] dark:bg-[#0D182E] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xs">
      {/* Top Filter Chips Legend & Zoom State Bar */}
      <div className="px-3.5 py-2.5 bg-white/95 dark:bg-[#162238]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 overflow-x-auto z-10">
        {/* Left: Filter Chips */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter:</span>
          </div>

          <div className="flex items-center gap-1">
            {legendItems.map((item) => {
              const isSelected = activeStatusFilter === item.status;
              return (
                <button
                  key={item.status}
                  type="button"
                  onClick={() => setActiveStatusFilter(item.status)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.status !== 'All' && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                  )}
                  <span>{item.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">({item.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Cluster Mode & Critical Alerts Banner */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Clustering Status Badge */}
          {isClustered ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800/80 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0" />
              <span>
                {clusters.length} Sectors · {totalDistrictCriticalAlerts} Critical Alert
                {totalDistrictCriticalAlerts !== 1 ? 's' : ''}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
              <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Detailed Facility Pins (Zoomed)</span>
            </span>
          )}

          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => {
                setClusterMode('clustered');
                setZoomLevel(1.0);
              }}
              title="Force Clustered View"
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                isClustered
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Clusters
            </button>
            <button
              type="button"
              onClick={() => {
                setClusterMode('pins');
                if (zoomLevel <= 1.15) setZoomLevel(1.4);
              }}
              title="Force Detailed Facility Pins"
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                !isClustered
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Pins
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas with District Geolocation, Clusters, and Pins */}
      <div className="relative flex-1 flex items-center justify-center p-3 select-none overflow-hidden min-h-[360px]">
        {/* Floating Zoom Controls (Top Right Overlay) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/95 dark:bg-[#10233F]/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2.4}
            title="Zoom in (Uncluster facilities)"
            aria-label="Zoom in"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="px-1 text-center font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
            {Math.round(zoomLevel * 100)}%
          </div>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.85}
            title="Zoom out (Cluster facilities)"
            aria-label="Zoom out"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          {zoomLevel !== 1.0 && (
            <button
              type="button"
              onClick={handleResetZoom}
              title="Reset district overview"
              aria-label="Reset zoom to overview"
              className="p-1.5 mt-0.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors border-t border-slate-100 dark:border-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        <svg
          viewBox={viewBox}
          className="w-full h-full max-h-[460px] transition-all duration-300 ease-out"
          role="region"
          aria-label={`${selectedDistrict} facility readiness map. ${
            isClustered
              ? `Currently clustered into ${clusters.length} geographic sectors showing total critical alerts. Select any cluster to zoom in.`
              : 'Detailed view with individual facility markers.'
          }`}
        >
          <defs>
            <pattern id="grid-subtle-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="0.3"
                className="dark:stroke-slate-800"
              />
            </pattern>
            {/* Soft drop shadow for facility pins and cluster nodes */}
            <filter id="marker-glow-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodOpacity="0.25" />
            </filter>
            <filter id="cluster-glow-shadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Grid Canvas Background */}
          <rect width="100" height="80" fill="url(#grid-subtle-pattern)" />

          {/* District Boundary Polygon */}
          <path
            d="M 10 16 Q 40 4 80 14 Q 94 44 82 74 Q 42 78 12 68 Q 4 38 10 16 Z"
            className="fill-white dark:fill-[#121E33] stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="0.8"
            strokeDasharray="2,2"
          />

          {/* Highway Logistics Arterial Corridor */}
          <path
            d="M 15 65 Q 40 46 80 20"
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeWidth="1.5"
          />

          {/* Active Transfer Route Highlight: PHC A (Meerut North) -> PHC B (Meerut Rural) */}
          {showTransferRoute && selectedDistrict === 'Meerut District' && (
            <g className="animate-in fade-in">
              <line
                x1="38"
                y1="32"
                x2="48"
                y2="44"
                stroke="#60A5FA"
                strokeWidth="3.2"
                strokeLinecap="round"
                opacity="0.4"
              />
              <line
                x1="38"
                y1="32"
                x2="48"
                y2="44"
                stroke="#2563EB"
                strokeWidth="1.4"
                strokeDasharray="2.5,2"
                strokeLinecap="round"
              />
              {/* Distance Callout Badge */}
              <g transform="translate(43, 37)">
                <rect
                  x="-7.5"
                  y="-2.5"
                  width="15"
                  height="5"
                  rx="1.5"
                  fill="#0F172A"
                  opacity="0.95"
                />
                <text
                  x="0"
                  y="0.8"
                  textAnchor="middle"
                  fontSize="2.1"
                  fill="#FFFFFF"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  12 km · 35m
                </text>
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* VIEW MODE 1: CLUSTER MARKERS (Low Zoom Level)            */}
          {/* ======================================================== */}
          {isClustered &&
            clusters.map((cluster, index) => {
              const isHovered = hoveredCluster?.id === cluster.id;
              const hasCritical = cluster.criticalAlertsCount > 0;
              const clusterColor = hasCritical
                ? '#DC2626'
                : cluster.highRiskCount > 0
                ? '#EA580C'
                : cluster.needsVerificationCount > 0
                ? '#64748B'
                : '#16A34A';

              return (
                <g
                  key={cluster.id}
                  ref={(el) => {
                    clusterRefs.current[index] = el;
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Sector Cluster: ${cluster.name} with ${cluster.totalFacilities} facilities. ${
                    hasCritical
                      ? `${cluster.criticalAlertsCount} critical shortage alert${
                          cluster.criticalAlertsCount > 1 ? 's' : ''
                        }. Immediate attention needed.`
                      : 'All facilities stable or safe.'
                  } Press Enter to zoom into sector.`}
                  aria-roledescription="facility cluster"
                  className="cursor-pointer transition-transform duration-200 focus:outline-hidden group/cluster"
                  onClick={() => handleZoomToCluster(cluster)}
                  onKeyDown={(e) => handleClusterKeyDown(e, index, cluster)}
                  onFocus={() => setHoveredCluster(cluster)}
                  onBlur={() => setHoveredCluster(null)}
                  onMouseEnter={() => setHoveredCluster(cluster)}
                  onMouseLeave={() => setHoveredCluster(null)}
                >
                  {/* Pulsing ring for critical alert clusters */}
                  {hasCritical && (
                    <circle
                      cx={cluster.x}
                      cy={cluster.y}
                      r={isHovered ? 8.2 : 7.2}
                      fill="#DC2626"
                      opacity="0.2"
                      className="animate-pulse"
                    />
                  )}

                  {/* High visibility keyboard focus ring */}
                  <circle
                    cx={cluster.x}
                    cy={cluster.y}
                    r={6.6}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="1.2"
                    strokeDasharray="1.5,1"
                    className="opacity-0 group-focus/cluster:opacity-100 transition-opacity"
                  />

                  {/* Outer Cluster Solid Halo */}
                  <circle
                    cx={cluster.x}
                    cy={cluster.y}
                    r={isHovered ? 5.8 : 5.1}
                    fill="#FFFFFF"
                    stroke={clusterColor}
                    strokeWidth={hasCritical ? '1.1' : '0.8'}
                    filter="url(#cluster-glow-shadow)"
                    className="dark:fill-[#121E33] transition-all"
                  />

                  {/* Inner Tint Circle */}
                  <circle
                    cx={cluster.x}
                    cy={cluster.y}
                    r={isHovered ? 4.5 : 4.0}
                    fill={hasCritical ? '#FEF2F2' : '#F8FAFC'}
                    className={hasCritical ? 'dark:fill-red-950/50' : 'dark:fill-slate-800/80'}
                  />

                  {/* Cluster Facility Count */}
                  <text
                    x={cluster.x}
                    y={cluster.y - 0.2}
                    textAnchor="middle"
                    fontSize="2.7"
                    fontWeight="800"
                    fill={hasCritical ? '#991B1B' : '#0F172A'}
                    className="dark:fill-white pointer-events-none"
                  >
                    {cluster.totalFacilities}
                  </text>
                  <text
                    x={cluster.x}
                    y={cluster.y + 2.1}
                    textAnchor="middle"
                    fontSize="1.3"
                    fontWeight="700"
                    fill={hasCritical ? '#DC2626' : '#64748B'}
                    className="dark:fill-slate-400 uppercase tracking-wider pointer-events-none"
                  >
                    PHCs
                  </text>

                  {/* ======================================================== */}
                  {/* CRITICAL ALERTS BADGE (Required: Total critical alerts) */}
                  {/* ======================================================== */}
                  {hasCritical ? (
                    <g
                      transform={`translate(${cluster.x + 2.4}, ${cluster.y - 4.6})`}
                      className="pointer-events-none"
                    >
                      <rect
                        x="-0.5"
                        y="-1.8"
                        width={cluster.criticalAlertsCount > 1 ? 14.5 : 12.8}
                        height="3.6"
                        rx="1.8"
                        fill="#DC2626"
                        stroke="#FFFFFF"
                        strokeWidth="0.4"
                        filter="url(#marker-glow-shadow)"
                      />
                      {/* Pulsing indicator dot */}
                      <circle cx="1.2" cy="0" r="0.7" fill="#FFFFFF" />
                      <text
                        x={cluster.criticalAlertsCount > 1 ? 7.6 : 6.8}
                        y="0.7"
                        textAnchor="middle"
                        fontSize="1.9"
                        fontWeight="800"
                        fill="#FFFFFF"
                      >
                        {cluster.criticalAlertsCount} Critical
                      </text>
                    </g>
                  ) : cluster.highRiskCount > 0 ? (
                    <g
                      transform={`translate(${cluster.x + 2.2}, ${cluster.y - 4.4})`}
                      className="pointer-events-none"
                    >
                      <rect
                        x="-0.5"
                        y="-1.7"
                        width="11.5"
                        height="3.4"
                        rx="1.7"
                        fill="#EA580C"
                        stroke="#FFFFFF"
                        strokeWidth="0.4"
                        filter="url(#marker-glow-shadow)"
                      />
                      <text
                        x="5.2"
                        y="0.65"
                        textAnchor="middle"
                        fontSize="1.8"
                        fontWeight="700"
                        fill="#FFFFFF"
                      >
                        {cluster.highRiskCount} High Risk
                      </text>
                    </g>
                  ) : (
                    <g
                      transform={`translate(${cluster.x + 2.2}, ${cluster.y - 4.4})`}
                      className="pointer-events-none"
                    >
                      <rect
                        x="-0.5"
                        y="-1.7"
                        width="9"
                        height="3.4"
                        rx="1.7"
                        fill="#16A34A"
                        stroke="#FFFFFF"
                        strokeWidth="0.4"
                        filter="url(#marker-glow-shadow)"
                      />
                      <text
                        x="4.0"
                        y="0.65"
                        textAnchor="middle"
                        fontSize="1.8"
                        fontWeight="700"
                        fill="#FFFFFF"
                      >
                        Safe
                      </text>
                    </g>
                  )}

                  {/* Sector Name Subtext */}
                  <text
                    x={cluster.x}
                    y={cluster.y + 6.8}
                    textAnchor="middle"
                    fontSize="2.1"
                    fontWeight="700"
                    className="fill-slate-800 dark:fill-slate-100 pointer-events-none drop-shadow-xs"
                  >
                    {cluster.name}
                  </text>
                </g>
              );
            })}

          {/* ======================================================== */}
          {/* VIEW MODE 2: INDIVIDUAL FACILITY PINS (High Zoom Level)   */}
          {/* ======================================================== */}
          {!isClustered &&
            districtFacilities.map((facility, index) => {
              const isSelected = selectedFacilityId === facility.id;
              const isHovered = hoveredFacility?.id === facility.id;
              const markerColor = getMarkerColor(facility.status);
              const matchesFilter =
                activeStatusFilter === 'All' || facility.status === activeStatusFilter;
              const opacity = matchesFilter ? 1 : 0.2;

              return (
                <g
                  key={facility.id}
                  ref={(el) => {
                    markerRefs.current[index] = el;
                  }}
                  role="button"
                  tabIndex={0}
                  opacity={opacity}
                  aria-label={`${facility.name} (${facility.code}), Status: ${facility.status}, Bed occupancy: ${facility.bedsOccupied} of ${facility.bedsTotal}, Data Trust Score: ${facility.dataTrustScore} of 100. Press Enter to select, Arrow keys to navigate.`}
                  aria-pressed={isSelected}
                  aria-roledescription="health facility marker"
                  className="cursor-pointer transition-all duration-150 focus:outline-hidden group/marker"
                  onClick={() => onFacilityClick && onFacilityClick(facility)}
                  onKeyDown={(e) => handleFacilityKeyDown(e, index, facility)}
                  onFocus={() => setHoveredFacility(facility)}
                  onBlur={() => setHoveredFacility(null)}
                  onMouseEnter={() => setHoveredFacility(facility)}
                  onMouseLeave={() => setHoveredFacility(null)}
                >
                  {/* Ripple ring for Critical or Keyboard Focused Marker */}
                  {(facility.status === 'Critical' || isSelected || isHovered) && (
                    <circle
                      cx={facility.coordinates.x}
                      cy={facility.coordinates.y}
                      r={isSelected ? 6.2 : isHovered ? 5.2 : 4.5}
                      fill={markerColor}
                      opacity="0.25"
                      className={facility.status === 'Critical' ? 'animate-pulse' : ''}
                    />
                  )}

                  {/* High-visibility keyboard focus ring */}
                  <circle
                    cx={facility.coordinates.x}
                    cy={facility.coordinates.y}
                    r={isSelected ? 5.2 : 4.2}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="1"
                    strokeDasharray="1.2,0.8"
                    className="opacity-0 group-focus/marker:opacity-100 transition-opacity"
                  />

                  {/* Outer white halo with shadow */}
                  <circle
                    cx={facility.coordinates.x}
                    cy={facility.coordinates.y}
                    r={isHovered || isSelected ? 3.6 : 2.8}
                    fill="#FFFFFF"
                    stroke="#CBD5E1"
                    strokeWidth="0.4"
                    filter="url(#marker-glow-shadow)"
                  />

                  {/* Status core colored circle */}
                  <circle
                    cx={facility.coordinates.x}
                    cy={facility.coordinates.y}
                    r={isHovered || isSelected ? 2.8 : 2.1}
                    fill={markerColor}
                  />

                  {/* Clean facility code label above marker */}
                  <text
                    x={facility.coordinates.x}
                    y={facility.coordinates.y - 3.8}
                    textAnchor="middle"
                    fontSize="2.4"
                    fontWeight={isSelected ? '900' : '700'}
                    className="pointer-events-none fill-slate-900 dark:fill-white drop-shadow-xs"
                  >
                    {facility.code}
                  </text>
                </g>
              );
            })}
        </svg>

        {/* Floating Sector Cluster Hover Card */}
        {hoveredCluster && isClustered && (
          <div
            className="absolute bottom-4 left-4 z-20 bg-slate-900/95 text-white dark:bg-white/95 dark:text-slate-900 rounded-xl p-3.5 shadow-2xl text-xs max-w-[280px] pointer-events-auto border border-white/10 dark:border-slate-300 animate-in fade-in"
            role="tooltip"
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/10 dark:border-slate-200 pb-2 mb-2">
              <span className="font-bold text-sm truncate">{hoveredCluster.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 dark:bg-slate-100 font-semibold">
                {hoveredCluster.totalFacilities} Facilities
              </span>
            </div>

            {/* Critical Alert Summary Pill */}
            {hoveredCluster.criticalAlertsCount > 0 ? (
              <div className="p-2 rounded-lg bg-red-950/70 border border-red-700/60 dark:bg-red-50 dark:border-red-200 text-red-200 dark:text-red-800 mb-2 flex items-start gap-1.5 font-semibold text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400 dark:text-red-600 mt-0.5" />
                <div>
                  <div>
                    {hoveredCluster.criticalAlertsCount} Critical Shortage Alert
                    {hoveredCluster.criticalAlertsCount > 1 ? 's' : ''}
                  </div>
                  <div className="text-[10px] opacity-80 font-normal mt-0.5">
                    Immediate medicine transfer recommended
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-700/60 dark:bg-emerald-50 dark:border-emerald-200 text-emerald-200 dark:text-emerald-800 mb-2 text-[11px] font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span>All facilities holding safe operational buffers</span>
              </div>
            )}

            {/* Facility List breakdown */}
            <div className="space-y-1 mb-3">
              <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                Reporting PHCs:
              </div>
              <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                {hoveredCluster.facilities.map((fac) => (
                  <div
                    key={fac.id}
                    className="flex items-center justify-between text-[11px] py-0.5 border-b border-white/5 dark:border-slate-100"
                  >
                    <span className="truncate max-w-[150px]">
                      {fac.name} ({fac.code})
                    </span>
                    <span
                      className={`text-[10px] font-semibold font-mono ${
                        fac.status === 'Critical'
                          ? 'text-red-400 dark:text-red-600 font-bold'
                          : fac.status === 'High Risk'
                          ? 'text-orange-400 dark:text-orange-600'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    >
                      {fac.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drill-in Button */}
            <button
              type="button"
              onClick={() => handleZoomToCluster(hoveredCluster)}
              className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Zoom Into Sector</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating Individual Facility Hover Card (Instant Tooltip) */}
        {hoveredFacility && !selectedFacilityId && !isClustered && (
          <div
            className="absolute bottom-4 left-4 z-20 bg-slate-900/95 text-white dark:bg-white/95 dark:text-slate-900 rounded-xl p-3.5 shadow-xl text-xs max-w-[260px] pointer-events-none animate-in fade-in"
            role="tooltip"
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/10 dark:border-slate-200 pb-2 mb-2">
              <span className="font-bold truncate">
                {hoveredFacility.name} ({hoveredFacility.code})
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 dark:bg-slate-100 font-semibold">
                {hoveredFacility.status}
              </span>
            </div>

            <div className="space-y-1 text-[11px] opacity-90">
              <div className="flex justify-between">
                <span>Bed Occupancy:</span>
                <span className="font-mono font-semibold">
                  {hoveredFacility.bedsOccupied}/{hoveredFacility.bedsTotal} beds
                </span>
              </div>
              <div className="flex justify-between">
                <span>Data Trust Score:</span>
                <span className="font-mono font-semibold">
                  {hoveredFacility.dataTrustScore}/100 ({hoveredFacility.trustCategory})
                </span>
              </div>
              {hoveredFacility.status === 'Critical' && (
                <div className="text-red-400 dark:text-red-600 font-semibold mt-1">
                  Alert: Paracetamol depleted in 3 days
                </div>
              )}
              {hoveredFacility.status === 'Expiry Opportunity' && (
                <div className="text-purple-300 dark:text-purple-600 font-semibold mt-1">
                  Rescue: 600 ORS sachets near-expiry
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Accessible Keyboard Navigation & Quick Info Bar */}
      <div className="px-4 py-2 bg-white/95 dark:bg-[#162238]/95 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Keyboard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          {isClustered ? (
            <span>
              <strong>Clustered Mode:</strong> Select any sector cluster or press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono text-[10px]">Enter</kbd> to zoom in and unbundle facilities.
            </span>
          ) : (
            <span>
              <strong>Detail Mode:</strong> Use <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono text-[10px]">Arrow keys</kbd> to explore, <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono text-[10px]">Escape</kbd> to return to cluster overview.
            </span>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-slate-400 text-[10px]">
          <MapPin className="w-3 h-3 text-blue-600" />
          <span>Active Corridor: PHC A → PHC B (12 km, 35m)</span>
        </div>
      </div>
    </div>
  );
}
