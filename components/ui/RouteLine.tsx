'use client';

import React from 'react';
import { Truck, Clock, Navigation } from 'lucide-react';

interface RouteLineProps {
  sourceName: string;
  sourceCode: string;
  destName: string;
  destCode: string;
  distanceKm: number;
  durationMins: number;
  vehicleNumber?: string;
  driverName?: string;
  status?: 'Proposed' | 'In Transit' | 'Completed';
  className?: string;
}

export function RouteLine({
  sourceName,
  sourceCode,
  destName,
  destCode,
  distanceKm = 12,
  durationMins = 35,
  vehicleNumber = 'UP-15-BT-4491',
  driverName = 'Suresh Kumar',
  status = 'In Transit',
  className = '',
}: RouteLineProps) {
  return (
    <div className={`p-4 bg-white dark:bg-[#162238] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 ${className}`}>
      {/* Route Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
          <Truck className="w-4 h-4 text-blue-600" aria-hidden="true" />
          <span>Inter-Facility Transit Logistics</span>
        </div>
        <span className="font-mono font-semibold px-2 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {status}
        </span>
      </div>

      {/* Visual Transit Bar */}
      <div className="relative pt-2 pb-1">
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>{sourceName} ({sourceCode})</span>
          </div>
          <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>{destName} ({destCode})</span>
          </div>
        </div>

        {/* Track Line with moving pulse */}
        <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/20" />
          <div className="h-full bg-blue-600 rounded-full w-2/3 relative animate-pulse">
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-xs" />
          </div>
        </div>

        {/* Distance and ETA pill in middle */}
        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Navigation className="w-3 h-3 text-slate-400" />
            <span>{distanceKm} km via NH-58 arterial corridor</span>
          </span>
          <span className="flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-400">
            <Clock className="w-3 h-3" />
            <span>ETA: ~{durationMins} mins</span>
          </span>
        </div>
      </div>

      {/* Driver & Van Info */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
        <div>
          <span className="text-slate-400">Assigned Van: </span>
          <strong className="font-mono text-slate-800 dark:text-slate-200">{vehicleNumber}</strong>
        </div>
        <div>
          <span className="text-slate-400">Driver: </span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{driverName}</span>
        </div>
      </div>
    </div>
  );
}
