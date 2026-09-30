'use client';

import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface ConfidenceMeterProps {
  confidence: number; // e.g. 88
  dataPointsUsed?: number;
  basisText?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function ConfidenceMeter({
  confidence,
  dataPointsUsed = 14,
  basisText = '14-day OPD surge & consumption pattern',
  size = 'md',
  className = '',
}: ConfidenceMeterProps) {
  const getRating = () => {
    if (confidence >= 85) return { label: 'High Confidence', color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800' };
    if (confidence >= 65) return { label: 'Moderate Confidence', color: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/60 dark:border-blue-800' };
    return { label: 'Low Confidence', color: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800' };
  };

  const rating = getRating();

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
          <span>Forecast Confidence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
            {confidence}%
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${rating.color}`}>
            {rating.label}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            confidence >= 85 ? 'bg-emerald-500' : confidence >= 65 ? 'bg-blue-500' : 'bg-amber-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
          role="progressbar"
          aria-valuenow={confidence}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {basisText && (
        <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>Basis: {basisText}</span>
          <span className="font-mono">{dataPointsUsed} days telemetry</span>
        </div>
      )}
    </div>
  );
}
