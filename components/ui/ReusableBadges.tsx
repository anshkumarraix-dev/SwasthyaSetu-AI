'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { FacilityRisk } from '@/types';

// 1. MetricCard for Situation Room
interface MetricCardProps {
  title: string;
  value: string | number;
  secondaryText?: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  statusLabel?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'critical' | 'warning' | 'purple' | 'emerald' | 'blue';
  sparklineData?: number[];
}

export function MetricCard({
  title,
  value,
  secondaryText,
  subtitle,
  actionText,
  onAction,
  statusLabel,
  icon: Icon,
  variant = 'default',
  sparklineData,
}: MetricCardProps) {
  const displaySecondary = secondaryText || subtitle;
  const getBadgeColors = () => {
    switch (variant) {
      case 'critical':
        return 'text-[#D92D20] bg-red-50 border-red-200';
      case 'warning':
        return 'text-[#D99A06] bg-amber-50 border-amber-200';
      case 'purple':
        return 'text-[#7C3AED] bg-purple-50 border-purple-200';
      case 'emerald':
        return 'text-[#16A34A] bg-emerald-50 border-emerald-200';
      case 'blue':
        return 'text-[#2563EB] bg-blue-50 border-blue-200';
      default:
        return 'text-[#64748B] bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
          <span className="font-semibold text-slate-700 tracking-tight">{title}</span>
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div className="text-2xl font-bold font-sans tracking-tight text-[#10233F] tabular-nums">
            {value}
          </div>
          {statusLabel && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeColors()}`}>
              {statusLabel}
            </span>
          )}
        </div>

        {displaySecondary && (
          <div className="text-xs text-[#64748B] mt-1.5 font-normal flex items-center gap-1.5">
            <span>{displaySecondary}</span>
          </div>
        )}

        {/* Subtle mini sparkline if provided */}
        {sparklineData && (
          <div className="flex items-end gap-1 h-4 mt-2.5 pt-1">
            {sparklineData.map((val, idx) => (
              <div
                key={idx}
                style={{ height: `${Math.max(15, val)}%` }}
                className={`flex-1 rounded-xs ${
                  variant === 'critical'
                    ? 'bg-red-400'
                    : variant === 'purple'
                    ? 'bg-purple-400'
                    : variant === 'emerald'
                    ? 'bg-emerald-400'
                    : 'bg-blue-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {actionText && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onAction}
            type="button"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 group-hover:underline cursor-pointer"
          >
            <span>{actionText}</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}

// 2. RiskStatusBadge
export function RiskStatusBadge({ status }: { status: FacilityRisk | string }) {
  switch (status) {
    case 'Critical':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-[#D92D20] border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D92D20]" />
          Critical
        </span>
      );
    case 'High Risk':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-[#EA7317] border border-orange-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EA7317]" />
          High Risk
        </span>
      );
    case 'Monitoring':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-[#D99A06] border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D99A06]" />
          Monitoring
        </span>
      );
    case 'Safe':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          Safe
        </span>
      );
    case 'Expiry Opportunity':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-[#7C3AED] border border-purple-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
          Expiry Rescue
        </span>
      );
    case 'Needs Verification':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-[#475569] border border-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          Verification Required
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
}

// 3. DataTrustBadge with Expandable Evidence Modal/Popover Trigger
export function DataTrustBadge({
  score,
  category,
  showLabel = true,
  onClick,
}: {
  score: number;
  category?: string;
  showLabel?: boolean;
  onClick?: () => void;
}) {
  const getBadgeColor = () => {
    if (score >= 85) return 'text-[#16A34A] bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-[#D99A06] bg-amber-50 border-amber-200';
    if (score >= 40) return 'text-[#EA7317] bg-orange-50 border-orange-200';
    return 'text-[#D92D20] bg-red-50 border-red-200';
  };

  const getLabel = () => {
    if (score >= 85) return 'Reliable';
    if (score >= 65) return 'Usable with caution';
    if (score >= 40) return 'Needs verification';
    return 'Unreliable';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-medium transition-colors ${getBadgeColor()} ${
        onClick ? 'hover:opacity-85 cursor-pointer' : ''
      }`}
      title="30% Freshness + 25% Completeness + 20% Physical Verification + 15% Consistency + 10% Sync"
    >
      <span className="font-bold tabular-nums">{score}/100</span>
      {showLabel && <span className="font-sans text-[11px]">· {category || getLabel()}</span>}
    </button>
  );
}

// 4. Compact Status Banner required by prompt
export function SimulatedDataBanner() {
  return (
    <div className="bg-[#EEF2F6] border border-[#CBD5E1] rounded-[10px] px-3.5 py-2 text-xs text-[#334155] flex flex-wrap items-center justify-between gap-2 shadow-2xs">
      <div className="flex items-center gap-2">
        <span className="font-bold text-[10px] uppercase tracking-wider bg-slate-300 text-slate-800 px-2 py-0.5 rounded">
          Demo mode · Simulated facility-level data
        </span>
        <span className="text-slate-600 hidden sm:inline">
          Public health supply chain resilience copilot for Meerut &amp; Baghpat districts. No individual medical records collected.
        </span>
      </div>
      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Audit Trail Enforced</span>
      </div>
    </div>
  );
}
