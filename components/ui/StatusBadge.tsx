'use client';

import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { FacilityRisk } from '@/types';

interface StatusBadgeProps {
  status:
    | FacilityRisk
    | 'Approved'
    | 'In Transit'
    | 'Completed'
    | 'Rejected'
    | 'Needs verification'
    | 'Awaiting District Approval'
    | 'Awaiting approval';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}: StatusBadgeProps) {
  // Config map with strict icon pairing and WCAG AA color tokens
  const getConfig = () => {
    switch (status) {
      case 'Critical':
        return {
          label: 'Critical Shortage',
          icon: AlertCircle,
          classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
          dotColor: 'bg-red-600',
        };
      case 'High Risk':
        return {
          label: 'High Risk',
          icon: AlertTriangle,
          classes: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
          dotColor: 'bg-orange-600',
        };
      case 'Monitoring':
        return {
          label: 'Monitoring',
          icon: Clock,
          classes: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
          dotColor: 'bg-amber-500',
        };
      case 'Safe':
        return {
          label: 'Safe Buffer',
          icon: CheckCircle2,
          classes: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
          dotColor: 'bg-emerald-600',
        };
      case 'Expiry Opportunity':
        return {
          label: 'Expiry Rescue',
          icon: Sparkles,
          classes: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
          dotColor: 'bg-purple-600',
        };
      case 'Needs Verification':
      case 'Needs verification':
        return {
          label: 'Needs Verification',
          icon: HelpCircle,
          classes: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          dotColor: 'bg-slate-500',
        };
      case 'Approved':
        return {
          label: 'Approved',
          icon: ShieldCheck,
          classes: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
          dotColor: 'bg-blue-600',
        };
      case 'In Transit':
        return {
          label: 'In Transit',
          icon: Clock,
          classes: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
          dotColor: 'bg-sky-600',
        };
      case 'Completed':
        return {
          label: 'Completed',
          icon: CheckCircle2,
          classes: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
          dotColor: 'bg-teal-600',
        };
      case 'Rejected':
        return {
          label: 'Declined',
          icon: AlertCircle,
          classes: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
          dotColor: 'bg-slate-400',
        };
      case 'Awaiting District Approval':
      case 'Awaiting approval':
        return {
          label: 'Awaiting Approval',
          icon: Clock,
          classes: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
          dotColor: 'bg-amber-500',
        };
      default:
        return {
          label: String(status),
          icon: Clock,
          classes: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          dotColor: 'bg-slate-500',
        };
    }
  };

  const { label, icon: Icon, classes, dotColor } = getConfig();

  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 gap-1'
      : size === 'lg'
      ? 'text-sm px-3 py-1 gap-2 font-semibold'
      : 'text-xs px-2.5 py-0.5 gap-1.5 font-medium';

  const iconSizes = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-sans tracking-tight transition-colors ${classes} ${sizeClasses} ${className}`}
      role="status"
      aria-label={`Status: ${label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      {showIcon && <Icon className={`${iconSizes} shrink-0`} aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );
}
