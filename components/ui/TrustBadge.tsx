'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface TrustBadgeProps {
  score: number; // 0 - 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onVerifyClick?: () => void;
  className?: string;
}

export function TrustBadge({
  score,
  showLabel = true,
  size = 'md',
  onVerifyClick,
  className = '',
}: TrustBadgeProps) {
  const isFresh = score >= 85;
  const isStale = score >= 60 && score < 85;
  const isUnreliable = score < 60;

  let label = 'Fresh & Verified';
  let category: 'fresh' | 'stale' | 'unreliable' = 'fresh';
  let classes = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
  let Icon = ShieldCheck;

  if (isStale) {
    category = 'stale';
    label = 'Stale Data';
    classes = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    Icon = AlertTriangle;
  } else if (isUnreliable) {
    category = 'unreliable';
    label = 'Unreliable (<60)';
    classes = 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800';
    Icon = ShieldAlert;
  }

  const sizeClasses =
    size === 'sm'
      ? 'text-[10px] px-1.5 py-0.5 gap-1'
      : size === 'lg'
      ? 'text-sm px-3 py-1 gap-2'
      : 'text-xs px-2 py-0.5 gap-1.5';

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded-md border font-mono tracking-tight font-medium ${classes} ${sizeClasses} ${className}`}
        title={`Data Trust Score: ${score}/100 (${label})`}
        aria-label={`Data Trust Score ${score} of 100, categorized as ${label}`}
      >
        <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
        <span className="tabular-nums font-bold">{score}</span>
        <span className="text-[10px] opacity-75 font-sans">/100</span>
        {showLabel && <span className="font-sans font-medium border-l border-current/20 pl-1.5 ml-0.5">{label}</span>}
      </span>

      {isUnreliable && onVerifyClick && (
        <button
          type="button"
          onClick={onVerifyClick}
          className="text-[11px] font-medium text-red-700 dark:text-red-300 underline hover:no-underline cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 rounded"
          aria-label="Assign field stock verification to clear unreliable data flag"
        >
          Verify count
        </button>
      )}
    </div>
  );
}

interface StaleWarningBannerProps {
  facilityName: string;
  facilityCode: string;
  trustScore: number;
  lastSyncHours: number;
  onAssignVerification: () => void;
}

export function StaleWarningBanner({
  facilityName,
  facilityCode,
  trustScore,
  lastSyncHours,
  onAssignVerification,
}: StaleWarningBannerProps) {
  return (
    <div
      role="alert"
      className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <div className="font-semibold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
            <span>Automation Paused for {facilityName} ({facilityCode})</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-200/60 dark:bg-amber-800/80 rounded font-mono font-bold">
              Trust Score: {trustScore}/100
            </span>
          </div>
          <p className="text-amber-800/90 dark:text-amber-300 mt-0.5">
            No telemetry received for {lastSyncHours} hours. Automated medicine allocations are paused until a frontline worker logs a verified physical bin count.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAssignVerification}
        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        Assign Verification
      </button>
    </div>
  );
}
