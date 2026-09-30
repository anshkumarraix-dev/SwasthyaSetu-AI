'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from './StatusBadge';
import { TrustBadge } from './TrustBadge';
import { ExplainPanel } from './ExplainPanel';
import { Check, X, Sliders, ExternalLink, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { FacilityRisk } from '@/types';

export interface ActionCardData {
  id: string;
  severity: FacilityRisk;
  priorityScore: number; // e.g. 96
  title: string;
  facility: string;
  facilityCode: string;
  facilityId: string;
  timeRemainingText: string;
  whatChanged: string;
  whyItMatters: string;
  recommendation: string;
  sourceFacilityName?: string;
  sourceBufferDays?: number;
  confidence: number;
  dataTrust: number;
  status: 'Awaiting approval' | 'Approved' | 'In transit' | 'Completed' | 'Rejected' | 'Verification required';
  evidenceHref: string;
  actionHref?: string;
  transferQuantity?: number;
  medicineName: string;
}

interface ActionCardProps {
  item: ActionCardData;
  onApprove?: (item: ActionCardData) => void;
  onReject?: (item: ActionCardData) => void;
  onModify?: (item: ActionCardData) => void;
  className?: string;
}

export function ActionCard({
  item,
  onApprove,
  onReject,
  onModify,
  className = '',
}: ActionCardProps) {
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false);
  const [customReason, setCustomReason] = useState('');

  const isCritical = item.severity === 'Critical';
  const isExpiry = item.severity === 'Expiry Opportunity';
  const isVerification = item.severity === 'Needs Verification';

  // Left rail border color
  const getRailColor = () => {
    switch (item.severity) {
      case 'Critical':
        return 'border-l-red-600 bg-red-50/20';
      case 'High Risk':
        return 'border-l-orange-500 bg-orange-50/20';
      case 'Expiry Opportunity':
        return 'border-l-purple-600 bg-purple-50/20';
      case 'Needs Verification':
        return 'border-l-slate-500 bg-slate-50/40';
      default:
        return 'border-l-blue-600 bg-blue-50/20';
    }
  };

  // Priority Score Ring Math
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (item.priorityScore / 100) * circumference;

  return (
    <article
      className={`bg-white dark:bg-[#162238] rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 shadow-xs transition-all ${getRailColor()} p-4.5 space-y-3.5 ${className}`}
      aria-labelledby={`card-title-${item.id}`}
    >
      {/* Header: Status, Facility, Trust, and Priority Score Ring */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.severity} size="sm" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {item.facility}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({item.facilityCode})
            </span>
          </div>

          <h3
            id={`card-title-${item.id}`}
            className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            {item.title}
          </h3>
        </div>

        {/* Priority Score Circular Ring */}
        <div className="flex items-center gap-2 shrink-0">
          <TrustBadge score={item.dataTrust} size="sm" showLabel={false} />
          
          <div
            className="relative flex items-center justify-center w-10 h-10"
            title={`Priority Impact Score: ${item.priorityScore}/100`}
            aria-label={`Priority Impact Score: ${item.priorityScore} of 100`}
          >
            <svg className="w-10 h-10 transform -rotate-90" aria-hidden="true">
              <circle
                cx="20"
                cy="20"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="3"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r={radius}
                className={isCritical ? 'stroke-red-600' : isExpiry ? 'stroke-purple-600' : 'stroke-blue-600'}
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[11px] font-bold font-mono text-slate-800 dark:text-slate-100 tabular-nums">
              {item.priorityScore}
            </span>
          </div>
        </div>
      </div>

      {/* Time Remaining countdown chip */}
      <div className="flex items-center gap-1.5 text-xs">
        <Clock className={`w-3.5 h-3.5 ${isCritical ? 'text-red-600' : 'text-slate-500'}`} aria-hidden="true" />
        <span className={`font-semibold ${isCritical ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
          {item.timeRemainingText}
        </span>
      </div>

      {/* Recommendation Summary */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-white">Recommended Action: </span>
        <span>{item.recommendation}</span>
      </div>

      {/* Expandable "Why this?" explainability panel */}
      <ExplainPanel
        signalText={item.whatChanged}
        dataUsed={[
          'Verified PHC B physical count (120 tablets, logged 29 Sep)',
          '5-day outpatient fever attendance trend (+46% surge)',
          `Source facility ${item.sourceFacilityName || 'PHC A'} safe buffer verification (${item.sourceBufferDays || 21} days buffer retained)`,
          'State essential medicine contingency inventory registry',
        ]}
        forecastDepletionDays={3}
        confidence={item.confidence}
        sourceBufferText={`Preserves ${item.sourceBufferDays || 21}-day safety buffer`}
        sourceFacilityName={item.sourceFacilityName}
        sourceBufferDays={item.sourceBufferDays || 21}
      />

      {/* Action Buttons: Primary, Secondary, Tertiary */}
      {item.status === 'Completed' ? (
        <div className="pt-2 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Transfer Executed & Replenished (Stock status: Safe)</span>
          </div>
          <Link href="/impact-audit" className="underline hover:no-underline text-[11px]">
            Audit ID: TR-2026-0042
          </Link>
        </div>
      ) : item.status === 'In transit' ? (
        <div className="pt-2 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-sky-800 dark:text-sky-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Vehicle UP-15-BT-4491 in transit</span>
          </span>
          <button
            type="button"
            onClick={() => onApprove && onApprove(item)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Confirm Delivery
          </button>
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {/* Tertiary: Review Evidence */}
          <Link
            href={item.evidenceHref}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <span>Review Evidence</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </Link>

          <div className="flex items-center gap-1.5">
            {/* Secondary: Modify */}
            {onModify && (
              <button
                type="button"
                onClick={() => onModify(item)}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
                title="Adjust recommended transfer quantity"
              >
                <Sliders className="w-3 h-3" aria-hidden="true" />
                <span>Modify</span>
              </button>
            )}

            {/* Secondary: Reject */}
            {onReject && (
              <button
                type="button"
                onClick={() => setRejectReasonOpen(true)}
                className="px-2.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400"
                title="Decline transfer recommendation with officer reason"
              >
                <X className="w-3 h-3" aria-hidden="true" />
                <span>Decline</span>
              </button>
            )}

            {/* Primary: Approve */}
            <button
              type="button"
              onClick={() => onApprove && onApprove(item)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-xs cursor-pointer focus:outline-hidden focus-visible:ring-2 ${
                isCritical
                  ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500'
                  : isExpiry
                  ? 'bg-purple-600 hover:bg-purple-700 focus-visible:ring-purple-500'
                  : 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500'
              }`}
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Approve Transfer</span>
            </button>
          </div>
        </div>
      )}

      {/* Inline Reject Reason Drawer / Prompt */}
      {rejectReasonOpen && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs space-y-2 animate-in fade-in">
          <div className="font-semibold text-red-900 dark:text-red-200">
            Mandatory Audit Justification to Decline:
          </div>
          <input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="e.g. Alternate supply arriving today from state depot"
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-red-300 dark:border-red-700 rounded text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-red-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectReasonOpen(false)}
              className="px-2.5 py-1 rounded text-slate-600 hover:text-slate-900 text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!customReason.trim()}
              onClick={() => {
                if (onReject) onReject(item);
                setRejectReasonOpen(false);
              }}
              className="px-3 py-1 rounded bg-red-600 text-white font-semibold text-xs hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              Confirm Decline
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
